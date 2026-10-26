import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api/client";
import type { ChatReply } from "@/lib/api/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [
    { title: "TreeMind — Ask your forest | TreeLife AI" },
    { name: "description", content: "Ask questions across the trees you have researched." },
    { property: "og:title", content: "TreeMind — Ask your forest | TreeLife AI" },
    { property: "og:description", content: "Ask questions across the trees you have researched." },
  ] }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; meta?: ChatReply };

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = q.trim(); if (!text || busy) return;
    const history = msgs.map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: text }]); setQ(""); setBusy(true);
    try { const r = await api.chat(text, history); setMsgs((m) => [...m, { role: "assistant", content: r.reply, meta: r }]); }
    catch (err) { setMsgs((m) => [...m, { role: "assistant", content: (err as Error).message }]); }
    finally { setBusy(false); }
  }
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="eyebrow">TreeMind</p>
      <h1 className="mt-2 font-serif text-4xl">Ask your forest</h1>
      <div className="mt-8 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block max-w-full whitespace-pre-line rounded-xl p-4 text-left text-sm ${m.role === "user" ? "bg-accent" : "surface"}`}>
              {m.content}
              {m.meta?.entities?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.meta.entities.map((en) => (
                <Link key={en.id} to="/tree/$id" params={{ id: en.id }} className="text-xs text-gold underline">{en.name}</Link>))}</div> : null}
            </div>
          </div>))}
        {busy && <p className="text-sm text-muted-foreground">Thinking…</p>}
      </div>
      <form onSubmit={send} className="mt-8 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Which of my trees are tropical?" aria-label="Ask TreeMind" className="surface flex-1 rounded-full px-5 py-3 outline-none" />
        <button className="rounded-full bg-primary px-6 text-primary-foreground">Ask</button>
      </form>
    </main>
  );
}
