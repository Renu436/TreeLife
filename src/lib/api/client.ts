// Isolated API service layer for the TreeLife FastAPI backend.
// Secrets (SerpApi / OpenAI) live only on the backend — never here.
import type { ChatReply, TreeEntity } from "./types";
import { DEMO_ENTITIES, DEMO_SEED_FOREST, resolveDemo } from "./demo-data";

const BASE = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "");
export const DEMO_MODE = import.meta.env["VITE_DEMO_MODE"] === "true" || !BASE;

export class ResearchError extends Error {
  constructor(message: string, public kind: "unavailable" | "unresolved" | "not_found" = "unavailable") {
    super(message);
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ResearchError("The research service is unreachable right now. Your existing forest is still available.");
  }
  if (res.status === 404) throw new ResearchError("This entity isn't in your forest.", "not_found");
  if (res.status === 422) throw new ResearchError("We couldn't establish a reliable research profile for this query.", "unresolved");
  if (!res.ok) throw new ResearchError("Research couldn't be completed. Your existing forest is still available.");
  return res.json() as Promise<T>;
}

// ---- demo-mode persistence (localStorage, browser only) ----
const KEY = "treelife.demo.forest";
function demoIds(): string[] {
  if (typeof window === "undefined") return DEMO_SEED_FOREST;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return DEMO_SEED_FOREST;
  try { return JSON.parse(raw) as string[]; } catch { return DEMO_SEED_FOREST; }
}
function saveDemo(ids: string[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(ids));
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async search(query: string): Promise<TreeEntity> {
    if (DEMO_MODE) {
      await wait(4200);
      const e = resolveDemo(query);
      if (!e) throw new ResearchError("We couldn't establish a reliable research profile for this query.", "unresolved");
      const ids = demoIds().filter((i) => i !== e.id);
      saveDemo([...ids, e.id]);
      return e;
    }
    return http<TreeEntity>("/api/trees/search", { method: "POST", body: JSON.stringify({ query }) });
  },
  async forest(): Promise<TreeEntity[]> {
    if (DEMO_MODE) {
      return demoIds().map((id) => DEMO_ENTITIES.find((e) => e.id === id)).filter((e): e is TreeEntity => !!e);
    }
    const data = await http<TreeEntity[] | { trees: TreeEntity[] }>("/api/forest");
    return Array.isArray(data) ? data : data.trees ?? [];
  },
  async tree(id: string): Promise<TreeEntity> {
    if (DEMO_MODE) {
      const e = DEMO_ENTITIES.find((x) => x.id === id);
      if (!e) throw new ResearchError("This entity isn't in your forest.", "not_found");
      return e;
    }
    return http<TreeEntity>(`/api/trees/${encodeURIComponent(id)}`);
  },
  async chat(message: string, history: { role: string; content: string }[]): Promise<ChatReply> {
    if (DEMO_MODE) {
      await wait(900);
      return demoChat(message, await api.forest());
    }
    return http<ChatReply>("/api/assistant/chat", { method: "POST", body: JSON.stringify({ message, history }) });
  },
};

function demoChat(message: string, forest: TreeEntity[]): ChatReply {
  const m = message.toLowerCase();
  const pick = (pred: (e: TreeEntity) => boolean) => forest.filter(pred);
  let hits: TreeEntity[] = forest.filter((e) => m.includes(e.common_name.toLowerCase()) || m.includes(e.id));
  if (!hits.length && /tropic/.test(m)) hits = pick((e) => /tropic/i.test(e.facts?.["Habitat"] ?? ""));
  if (!hits.length && /medic/.test(m)) hits = pick((e) => (e.knowledge ?? []).some((k) => /medic/i.test(k.summary + k.title)));
  if (!hits.length && /wetland|coast/.test(m)) hits = pick((e) => /wetland|coast/i.test(e.facts?.["Habitat"] ?? ""));
  if (!hits.length) hits = forest.slice(0, 3);
  const reply = hits.length
    ? hits.map((e) => `${e.common_name}${e.scientific_name ? ` (${e.scientific_name})` : ""} — ${e.summary ?? ""} Habitat: ${e.facts?.["Habitat"] ?? "not established"}.`).join("\n\n")
    : "Your forest is still empty. Search something to grow your first tree.";
  return {
    reply,
    mode: "forest",
    entities: hits.map((e) => ({ id: e.id, name: e.common_name })),
    sources: hits.flatMap((e) => (e.knowledge ?? []).slice(0, 1).map((k) => ({ name: k.source_name, url: k.source_url }))),
  };
}
