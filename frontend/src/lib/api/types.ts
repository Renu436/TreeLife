// Contracts consumed from the TreeLife FastAPI backend.
export type GrowthForm = "broadleaf_tree" | "palm" | "conifer" | "mangrove" | "shrub";
export type TrunkStyle = "slender" | "thick_branching" | "multi_stem" | "straight" | "curved";
export type BranchingPattern = "wide_spreading" | "upright" | "tiered" | "open" | "none";
export type CanopyShape = "rounded" | "spreading" | "conical" | "crown" | "irregular";
export type CanopyDensity = "sparse" | "medium" | "dense";
export type LeafStyle = "compound" | "lobed" | "broad" | "needle" | "frond" | "simple";
export type RootStyle = "normal" | "aerial" | "prop" | "buttress";
export type ColorProfile =
  | "seasonal_green"
  | "autumn_red"
  | "tropical_green"
  | "deep_green"
  | "olive"
  | "neutral";

export interface VisualProfile {
  entity_type: string;
  growth_form: GrowthForm;
  trunk_style: TrunkStyle;
  branching_pattern: BranchingPattern;
  canopy_shape: CanopyShape;
  canopy_density: CanopyDensity;
  leaf_style: LeafStyle;
  leaf_scale: "small" | "medium" | "large";
  root_style: RootStyle;
  height_ratio: number;
  width_ratio: number;
  color_profile: ColorProfile;
  fruit?: boolean;
  habitat?: string;
}

export type EntityStatus = "verified" | "research_group" | "ambiguous" | "insufficient" | "demo";

export interface ResearchImage {
  url: string;
  alt: string;
  source_name: string;
  source_url: string;
  query?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  why_it_matters?: string;
  category: string;
  source_name: string;
  source_url: string;
  retrieved_at: string;
}

export interface Taxonomy {
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export interface TreeEntity {
  id: string;
  query: string;
  common_name: string;
  scientific_name?: string | null | undefined;
  entity_type: string;
  status: EntityStatus;
  confidence?: string | null | undefined;
  summary?: string | undefined;
  taxonomy?: Taxonomy | undefined;
  facts?: Record<string, string | null | undefined> | undefined;
  visual_profile?: VisualProfile | null | undefined;
  images?: ResearchImage[] | undefined;
  knowledge?: KnowledgeItem[] | undefined;
  created_at: string;
}

export interface ChatReply {
  reply: string;
  entities?: { id: string; name: string }[];
  mode?: "forest" | "fresh";
  sources?: { name: string; url: string }[];
}
