import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { treeQuery } from "@/lib/api/queries";
import { hostOf } from "@/lib/browser";

const TreeStage = lazy(() => import("@/components/three/TreeStage"));

export const Route = createFileRoute("/tree/$id")({
  head: () => ({ meta: [
    { title: "Tree research profile — TreeLife AI" },
    { name: "description", content: "Sourced research profile with an interactive 3D model." },
    { property: "og:title", content: "Tree research profile — TreeLife AI" },
    { property: "og:description", content: "Sourced research profile with an interactive 3D model." },
  ] }),
  component: TreePage,
});

function TreePage() {
  const { id } = Route.useParams();
  const { data: e, isLoading, error } = useQuery(treeQuery(id));
  if (isLoading) return <main className="p-12 text-muted-foreground">Loading…</main>;
  if (error || !e) return <main className="mx-auto max-w-xl p-12 text-center"><p className="text-destructive">{(error as Error)?.message ?? "Not found"}</p><Link to="/forest" className="mt-4 inline-block underline">Back to forest</Link></main>;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">{e.entity_type} · {e.confidence}</p>
      <h1 className="mt-2 font-serif text-5xl">{e.common_name}</h1>
      {e.scientific_name && <p className="sci text-xl text-sage">{e.scientific_name}</p>}
      <p className="mt-4 max-w-2xl text-muted-foreground">{e.summary}</p>
      {e.status === "demo" && <p className="mt-2 text-xs text-gold">Demo data — connect the research backend for live sources.</p>}
      {e.visual_profile && (
        <div className="surface mt-8 h-[460px] overflow-hidden rounded-2xl">
          <ClientOnly fallback={null}><Suspense fallback={<p className="p-6 text-muted-foreground">Growing…</p>}>
            <TreeStage profile={e.visual_profile} seedKey={e.id} grow label={`3D model of ${e.common_name}`} />
          </Suspense></ClientOnly>
        </div>)}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <section className="surface rounded-xl p-5">
          <h2 className="eyebrow mb-3">Facts</h2>
          <dl className="space-y-2 text-sm">{Object.entries(e.facts ?? {}).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>))}</dl>
          <h2 className="eyebrow mb-3 mt-6">Taxonomy</h2>
          <dl className="space-y-2 text-sm">{Object.entries(e.taxonomy ?? {}).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3"><dt className="capitalize text-muted-foreground">{k}</dt><dd>{v}</dd></div>))}</dl>
        </section>
        <section className="space-y-4 md:col-span-2">
          <h2 className="eyebrow">Knowledge</h2>
          {e.knowledge?.map((k) => (
            <article key={k.id} className="surface rounded-xl p-5">
              <p className="eyebrow">{k.category}</p>
              <h3 className="mt-1 font-serif text-xl">{k.title}</h3>
              <p className="mt-2 text-sm">{k.summary}</p>
              {k.why_it_matters && <p className="mt-2 text-sm text-muted-foreground">Why it matters: {k.why_it_matters}</p>}
              <a href={k.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-gold underline">{k.source_name} · {hostOf(k.source_url)}</a>
            </article>))}
        </section>
      </div>
    </main>
  );
}
