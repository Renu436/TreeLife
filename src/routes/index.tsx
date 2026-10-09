import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, DEMO_MODE } from "@/lib/api/client";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "TreeLife AI — Search any tree, grow it in 3D" },
    { name: "description", content: "Search a tree or plant and get a sourced research profile with an interactive 3D model." },
    { property: "og:title", content: "TreeLife AI — Search any tree, grow it in 3D" },
    { property: "og:description", content: "Search a tree or plant and get a sourced research profile with an interactive 3D model." },
  ] }),
  component: Home,
});

const STEPS = ["Identifying the species", "Gathering sources", "Reading taxonomy and facts", "Composing the visual profile", "Growing the tree"];

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (query: string) => api.search(query),
    onSuccess: (e) => { qc.invalidateQueries({ queryKey: ["forest"] }); nav({ to: "/tree/$id", params: { id: e.id } }); },
  });
  return (
    <main className="bg-forest-gradient min-h-[calc(100vh-57px)]">
      <section className="mx-auto max-w-3xl px-5 pt-28 text-center">
        <p className="eyebrow">Botanical research</p>
        <h1 className="mt-4 font-serif text-5xl md:text-7xl">Every tree has a story.</h1>
        <p className="mt-5 text-muted-foreground">Search any tree or plant. We research it, cite the sources, and grow it in 3D.</p>
        <form className="mt-10" onSubmit={(e) => { e.preventDefault(); if (q.trim() && !m.isPending) m.mutate(q.trim()); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try neem, banyan, maple…" aria-label="Search a tree"
            className="glow-search surface w-full rounded-full px-6 py-4 text-lg outline-none" />
        </form>
        {DEMO_MODE && <p className="mt-3 text-xs text-muted-foreground">Demo mode: try neem, banyan, coconut, maple, mangrove, pine, mango or teak.</p>}
        {m.isPending && <ol className="surface mt-8 space-y-2 rounded-xl p-5 text-left text-sm">{STEPS.map((s, i) => (
          <li key={s} className="text-muted-foreground opacity-0 animate-in fade-in fill-mode-forwards" style={{ animationDelay: `${i * 800}ms`, animationFillMode: "forwards" }}>
            <span className="text-gold">●</span> {s}…</li>))}</ol>}
        {m.isError && <p role="alert" className="mt-6 text-destructive">{m.error.message}</p>}
      </section>
    </main>
  );
}
