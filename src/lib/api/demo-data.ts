// DEMO MODE ONLY. Structured sample entities used when no backend is configured
// (or VITE_DEMO_MODE=true). These are never presented as live search results.
import type { TreeEntity, VisualProfile } from "./types";

const R = "2026-10-08T09:00:00Z";
const wiki = (p: string) => `https://en.wikipedia.org/wiki/${p}`;

type Seed = Omit<TreeEntity, "status" | "created_at" | "query" | "knowledge"> & {
  aliases: string[];
  knowledge: [string, string, string, string][]; // category, title, summary, why
  wikiPath: string;
};

const vp = (p: Partial<VisualProfile> & Pick<VisualProfile, "growth_form">): VisualProfile => ({
  entity_type: "plant",
  trunk_style: "thick_branching",
  branching_pattern: "wide_spreading",
  canopy_shape: "rounded",
  canopy_density: "dense",
  leaf_style: "simple",
  leaf_scale: "medium",
  root_style: "normal",
  height_ratio: 0.8,
  width_ratio: 0.8,
  color_profile: "seasonal_green",
  ...p,
});

const seeds: Seed[] = [
  {
    id: "neem",
    aliases: ["neem", "azadirachta indica", "azadirachta"],
    wikiPath: "Azadirachta_indica",
    common_name: "Neem",
    scientific_name: "Azadirachta indica",
    entity_type: "Plant",
    confidence: "High confidence",
    summary: "A fast-growing evergreen of the mahogany family, native to the Indian subcontinent.",
    taxonomy: { kingdom: "Plantae", order: "Sapindales", family: "Meliaceae", genus: "Azadirachta", species: "Azadirachta indica" },
    facts: { Height: "15–20 m", Habitat: "Dry tropical and subtropical lowlands", Origin: "Indian subcontinent", Growth: "Fast, evergreen", Family: "Meliaceae", Genus: "Azadirachta" },
    visual_profile: vp({ growth_form: "broadleaf_tree", leaf_style: "compound", canopy_shape: "rounded", height_ratio: 0.8, width_ratio: 0.85, color_profile: "deep_green", habitat: "Dry tropical lowlands" }),
    knowledge: [
      ["Uses", "Medicinal uses", "Leaves, bark and seed oil are used in traditional medicine across South Asia.", "Neem is one of the most studied plants in ethnobotany."],
      ["Research", "Azadirachtin", "Seeds contain azadirachtin, a compound studied as a natural insect repellent.", "It underpins plant-derived pest control research."],
      ["Ecology", "Drought tolerance", "Tolerates long dry seasons and poor soils.", "Makes it valuable for reforestation in arid regions."],
      ["Morphology", "Pinnate leaves", "Leaves are pinnate with serrated leaflets.", "Explains the dense, fine-textured canopy."],
    ],
  },
  {
    id: "banyan",
    aliases: ["banyan", "ficus benghalensis", "banyan tree"],
    wikiPath: "Ficus_benghalensis",
    common_name: "Banyan",
    scientific_name: "Ficus benghalensis",
    entity_type: "Plant",
    confidence: "High confidence",
    summary: "A fig that grows aerial prop roots which thicken into secondary trunks, spreading over vast areas.",
    taxonomy: { kingdom: "Plantae", order: "Rosales", family: "Moraceae", genus: "Ficus", species: "Ficus benghalensis" },
    facts: { Height: "Up to 30 m", Habitat: "Tropical monsoon forest", Origin: "Indian subcontinent", Growth: "Spreading, very long-lived", Family: "Moraceae", Genus: "Ficus" },
    visual_profile: vp({ growth_form: "broadleaf_tree", canopy_shape: "spreading", leaf_style: "broad", root_style: "aerial", height_ratio: 0.7, width_ratio: 1.4, color_profile: "deep_green", habitat: "Tropical monsoon forest" }),
    knowledge: [
      ["Morphology", "Aerial prop roots", "Roots descend from branches and become new trunks.", "A single tree can cover several hectares."],
      ["Ecology", "Keystone fig", "Its figs feed birds, bats and primates through the year.", "Supports exceptionally high local biodiversity."],
      ["Geography", "National tree of India", "The banyan is India's national tree.", "Deep cultural and civic significance."],
    ],
  },
  {
    id: "coconut",
    aliases: ["coconut", "cocos nucifera", "coconut palm"],
    wikiPath: "Coconut",
    common_name: "Coconut palm",
    scientific_name: "Cocos nucifera",
    entity_type: "Plant",
    confidence: "High confidence",
    summary: "A tall palm of tropical coastlines, the only living species of the genus Cocos.",
    taxonomy: { kingdom: "Plantae", order: "Arecales", family: "Arecaceae", genus: "Cocos", species: "Cocos nucifera" },
    facts: { Height: "Up to 30 m", Habitat: "Tropical coasts", Origin: "Indo-Pacific", Growth: "Single unbranched stem", Family: "Arecaceae", Genus: "Cocos" },
    visual_profile: vp({ growth_form: "palm", trunk_style: "curved", branching_pattern: "none", canopy_shape: "crown", leaf_style: "frond", leaf_scale: "large", height_ratio: 1.15, width_ratio: 0.6, color_profile: "tropical_green", fruit: true, habitat: "Tropical coasts" }),
    knowledge: [
      ["Uses", "Multipurpose crop", "Provides food, oil, fibre and timber.", "Often called the 'tree of life' in the tropics."],
      ["Ecology", "Sea dispersal", "Fruit can float and stay viable in seawater.", "Explains its spread across tropical islands."],
    ],
  },
  {
    id: "maple",
    aliases: ["maple", "acer", "acer spp"],
    wikiPath: "Maple",
    common_name: "Maple",
    scientific_name: "Acer spp.",
    entity_type: "Plant genus",
    confidence: "Research group",
    summary: "A genus of around 130 trees and shrubs, mostly of the Northern Hemisphere. 'Maple' does not identify a single species.",
    taxonomy: { kingdom: "Plantae", order: "Sapindales", family: "Sapindaceae", genus: "Acer" },
    facts: { Height: "Varies by species", Habitat: "Temperate woodland", Origin: "Northern Hemisphere", Growth: "Deciduous", Family: "Sapindaceae", Genus: "Acer" },
    visual_profile: vp({ growth_form: "broadleaf_tree", branching_pattern: "open", leaf_style: "lobed", canopy_density: "medium", height_ratio: 0.9, width_ratio: 0.9, color_profile: "autumn_red", habitat: "Temperate woodland" }),
    knowledge: [
      ["Morphology", "Palmately lobed leaves", "Most maples have opposite, palmately lobed leaves.", "The leaf form is the genus' signature."],
      ["Uses", "Maple syrup", "Sap of sugar maple is concentrated into syrup.", "A major seasonal industry in North America."],
      ["Ecology", "Samaras", "Winged seeds spin as they fall.", "Allows wind dispersal away from the parent."],
    ],
  },
  {
    id: "mangrove",
    aliases: ["mangrove", "rhizophora", "rhizophora mangle", "red mangrove"],
    wikiPath: "Mangrove",
    common_name: "Mangrove",
    scientific_name: null,
    entity_type: "Plant group",
    confidence: "Research group",
    summary: "Salt-tolerant trees and shrubs of tropical intertidal coasts. 'Mangrove' describes an ecological group spanning several families.",
    taxonomy: { kingdom: "Plantae" },
    facts: { Height: "Varies", Habitat: "Coastal intertidal wetlands", Origin: "Pantropical", Growth: "Multi-stemmed", Family: null, Genus: null },
    visual_profile: vp({ growth_form: "mangrove", trunk_style: "multi_stem", root_style: "prop", canopy_shape: "irregular", leaf_style: "simple", height_ratio: 0.55, width_ratio: 1.0, color_profile: "olive", habitat: "Coastal wetlands" }),
    knowledge: [
      ["Habitat", "Intertidal zone", "Mangroves grow where land meets sea, flooded by tides.", "Few trees tolerate this salinity."],
      ["Conservation", "Coastal protection", "Dense roots buffer coastlines from storm surges.", "Their loss increases coastal flooding risk."],
      ["Ecology", "Blue carbon", "Mangrove soils store large amounts of carbon.", "Central to climate mitigation strategies."],
    ],
  },
  {
    id: "pine",
    aliases: ["pine", "pinus", "pine tree"],
    wikiPath: "Pine",
    common_name: "Pine",
    scientific_name: "Pinus spp.",
    entity_type: "Plant genus",
    confidence: "Research group",
    summary: "Evergreen coniferous trees of the genus Pinus, with needle-like leaves in bundles.",
    taxonomy: { kingdom: "Plantae", class: "Pinopsida", order: "Pinales", family: "Pinaceae", genus: "Pinus" },
    facts: { Height: "Varies by species", Habitat: "Boreal and temperate forest", Origin: "Northern Hemisphere", Growth: "Evergreen conifer", Family: "Pinaceae", Genus: "Pinus" },
    visual_profile: vp({ growth_form: "conifer", trunk_style: "straight", branching_pattern: "tiered", canopy_shape: "conical", leaf_style: "needle", leaf_scale: "small", height_ratio: 1.2, width_ratio: 0.5, color_profile: "deep_green", habitat: "Boreal forest" }),
    knowledge: [["Morphology", "Needle fascicles", "Needles grow in bundles of two to five.", "A key trait for identifying pine species."]],
  },
  {
    id: "mango",
    aliases: ["mango", "mangifera indica", "mango tree"],
    wikiPath: "Mangifera_indica",
    common_name: "Mango",
    scientific_name: "Mangifera indica",
    entity_type: "Plant",
    confidence: "High confidence",
    summary: "A large evergreen fruit tree native to South Asia, cultivated across the tropics.",
    taxonomy: { kingdom: "Plantae", order: "Sapindales", family: "Anacardiaceae", genus: "Mangifera", species: "Mangifera indica" },
    facts: { Height: "Up to 30 m", Habitat: "Tropical lowlands", Origin: "South Asia", Growth: "Evergreen", Family: "Anacardiaceae", Genus: "Mangifera" },
    visual_profile: vp({ growth_form: "broadleaf_tree", trunk_style: "thick_branching", leaf_style: "broad", canopy_density: "dense", height_ratio: 0.85, width_ratio: 1.05, color_profile: "deep_green", fruit: true, habitat: "Tropical lowlands" }),
    knowledge: [["Uses", "Fruit crop", "One of the most widely cultivated tropical fruits.", "Major food and economic crop in South Asia."]],
  },
  {
    id: "teak",
    aliases: ["teak", "tectona grandis"],
    wikiPath: "Teak",
    common_name: "Teak",
    scientific_name: "Tectona grandis",
    entity_type: "Plant",
    confidence: "High confidence",
    summary: "A tropical hardwood of the mint family, prized for durable timber.",
    taxonomy: { kingdom: "Plantae", order: "Lamiales", family: "Lamiaceae", genus: "Tectona", species: "Tectona grandis" },
    facts: { Height: "Up to 40 m", Habitat: "Mixed deciduous forest", Origin: "South and Southeast Asia", Growth: "Deciduous", Family: "Lamiaceae", Genus: "Tectona" },
    visual_profile: vp({ growth_form: "broadleaf_tree", trunk_style: "straight", branching_pattern: "upright", canopy_density: "sparse", leaf_style: "broad", leaf_scale: "large", height_ratio: 1.05, width_ratio: 0.7, color_profile: "olive", habitat: "Deciduous forest" }),
    knowledge: [["Uses", "Durable timber", "Teak wood resists water and decay.", "Historically valued for shipbuilding."]],
  },
];

function build(s: Seed): TreeEntity {
  const src = { source_name: "Wikipedia (demo reference)", source_url: wiki(s.wikiPath), retrieved_at: R };
  return {
    id: s.id,
    query: s.common_name,
    common_name: s.common_name,
    scientific_name: s.scientific_name ?? null,
    entity_type: s.entity_type,
    status: "demo",
    confidence: s.confidence,
    summary: s.summary,
    taxonomy: s.taxonomy,
    facts: s.facts,
    visual_profile: s.visual_profile,
    images: [],
    knowledge: s.knowledge.map(([category, title, summary, why], i) => ({
      id: `${s.id}-${i}`, category, title, summary, why_it_matters: why, ...src,
    })),
    created_at: R,
  };
}

export const DEMO_ENTITIES: TreeEntity[] = seeds.map(build);

export function resolveDemo(query: string): TreeEntity | null {
  const q = query.trim().toLowerCase();
  const s = seeds.find((x) => x.aliases.includes(q));
  return s ? DEMO_ENTITIES.find((e) => e.id === s.id) ?? null : null;
}

export const DEMO_SEED_FOREST = ["neem", "banyan", "maple"];
