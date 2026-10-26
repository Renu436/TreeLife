// Live fallback used in demo mode so any tree can be searched.
// Facts come only from the Wikipedia summary; the 3D form is an estimate from its wording.
import type { TreeEntity, VisualProfile } from "./types";

interface Summary {
  title: string;
  description?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  type?: string;
}

const PLANT = /\b(tree|trees|palm|shrub|conifer|mangrove|bamboo|plant|genus of|species of|flowering|evergreen|deciduous|pine|oak|fig)\b/i;

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function inferProfile(text: string): VisualProfile {
  const t = text.toLowerCase();
  const has = (r: RegExp) => r.test(t);
  const base: VisualProfile = {
    entity_type: "plant",
    growth_form: "broadleaf_tree",
    trunk_style: "thick_branching",
    branching_pattern: "wide_spreading",
    canopy_shape: "rounded",
    canopy_density: "medium",
    leaf_style: "simple",
    leaf_scale: "medium",
    root_style: "normal",
    height_ratio: 0.8,
    width_ratio: 0.75,
    color_profile: "seasonal_green",
  };
  if (has(/mangrove/)) return { ...base, growth_form: "mangrove", trunk_style: "multi_stem", root_style: "prop", color_profile: "tropical_green" };
  if (has(/\bpalm|arecaceae|coconut|date palm/))
    return { ...base, growth_form: "palm", trunk_style: "curved", branching_pattern: "none", canopy_shape: "crown", leaf_style: "frond", leaf_scale: "large", color_profile: "tropical_green" };
  if (has(/conifer|pine|spruce|fir\b|cedar|cypress|needle|pinaceae|cupressaceae/))
    return { ...base, growth_form: "conifer", trunk_style: "straight", branching_pattern: "tiered", canopy_shape: "conical", leaf_style: "needle", leaf_scale: "small", canopy_density: "dense", color_profile: "deep_green" };
  if (has(/shrub|bush/) && !has(/\btree\b/)) return { ...base, growth_form: "shrub", trunk_style: "multi_stem", height_ratio: 0.4, width_ratio: 0.6 };
  if (has(/compound|pinnate|legume|fabaceae/)) base.leaf_style = "compound";
  if (has(/\boak|maple|lobed/)) base.leaf_style = "lobed";
  if (has(/broad|large leaves/)) base.leaf_scale = "large";
  if (has(/deciduous|autumn/)) base.color_profile = "autumn_red";
  if (has(/tropical|evergreen/)) base.color_profile = "tropical_green";
  return base;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export async function searchWikipedia(query: string): Promise<TreeEntity | null> {
  const q = query.trim();
  if (!q) return null;
  const find = await getJson<{ query?: { search?: { title: string }[] } }>(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q + " tree OR plant OR species")}&srlimit=5&format=json&origin=*`,
  );
  const titles = find.query?.search?.map((s) => s.title) ?? [];
  for (const title of titles) {
    const s = await getJson<Summary>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (s.type === "disambiguation" || !s.extract) continue;
    const text = `${s.description ?? ""} ${s.extract}`;
    if (!PLANT.test(text)) continue;
    const url = s.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const sci = /\(([A-Z][a-z]+ [a-z]+)\)/.exec(s.extract)?.[1] ?? null;
    const now = new Date().toISOString();
    return {
      id: `wiki-${slug(s.title)}`,
      query: q,
      common_name: s.title,
      scientific_name: sci,
      entity_type: "Plant",
      status: "insufficient",
      confidence: "Wikipedia summary only — 3D form is estimated",
      summary: s.extract.length > 400 ? `${s.extract.slice(0, 397)}…` : s.extract,
      facts: s.description ? { Description: s.description } : {},
      visual_profile: inferProfile(text),
      knowledge: [
        {
          id: "wiki-summary",
          title: "Overview",
          summary: s.extract,
          category: "Overview",
          source_name: "Wikipedia",
          source_url: url,
          retrieved_at: now,
        },
      ],
      created_at: now,
    };
  }
  return null;
}
