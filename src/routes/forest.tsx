import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { forestQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/forest")({
  head: () => ({ meta: [
    { title: "Your Forest — TreeLife AI" },
    { name: "description", content: "All the trees you have researched, in one place." },
    { property: "og:title", content: "Your Forest — TreeLife AI" },
    { property: "og:description", content: "All the trees you have researched, in one place." },
  ] }),
  component: Forest,
});

function Forest() {
  const { data, isLoading, error } = useQuery(forestQuery());
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow">Your forest</p>
      <h1 className="mt-2 font-serif text-4xl">Researched trees</h1>
      {isLoading && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-6 text-destructive">{(error as Error).message}</p>}
      {data && !data.length && <p className="mt-6 text-muted-foreground">Your forest is empty. Search something to grow your first tree.</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((e) => (
          <Link key={e.id} to="/tree/$id" params={{ id: e.id }} className="surface rounded-xl p-5 transition hover:border-gold/50">
            <h2 className="font-serif text-2xl">{e.common_name}</h2>
            {e.scientific_name && <p className="sci text-sm text-sage">{e.scientific_name}</p>}
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.summary}</p>
            <p className="eyebrow mt-4">{e.confidence ?? e.entity_type}</p>
          </Link>))}
      </div>
    </main>
  );
}
