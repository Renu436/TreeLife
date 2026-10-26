"""
Convert a DB Tree row (internal knowledge_data format) into the TreeEntity
shape the frontend expects (src/lib/api/types.ts).

knowledge_data layout (written by ai_service.py):
{
  common_name, scientific_name, tree_type,
  roots: { origin, native_regions, classification: { kingdom, … } },
  trunk: { height, growth_rate, lifespan, bark, climate, … },
  branches: {
    ecology:      [{ title, content, sources, category }, …],
    uses:         […],
    research:     […],
    conservation: […],
    geography:    […],
    news:         […],
  }
}
"""
from __future__ import annotations

import re
import unicodedata
from datetime import timezone


# ── Slug helper ───────────────────────────────────────────────────────────────

def _slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text or "tree"


# ── Visual-profile inference from tree_type + knowledge_data ─────────────────

_PROFILE_DEFAULTS = {
    "palm": {
        "growth_form": "palm",
        "trunk_style": "curved",
        "branching_pattern": "none",
        "canopy_shape": "crown",
        "leaf_style": "frond",
        "leaf_scale": "large",
        "root_style": "normal",
        "height_ratio": 1.15,
        "width_ratio": 0.6,
        "color_profile": "tropical_green",
    },
    "conifer": {
        "growth_form": "conifer",
        "trunk_style": "straight",
        "branching_pattern": "tiered",
        "canopy_shape": "conical",
        "leaf_style": "needle",
        "leaf_scale": "small",
        "root_style": "normal",
        "height_ratio": 1.2,
        "width_ratio": 0.5,
        "color_profile": "deep_green",
    },
    "mangrove": {
        "growth_form": "mangrove",
        "trunk_style": "multi_stem",
        "branching_pattern": "open",
        "canopy_shape": "irregular",
        "leaf_style": "simple",
        "leaf_scale": "medium",
        "root_style": "prop",
        "height_ratio": 0.55,
        "width_ratio": 1.0,
        "color_profile": "tropical_green",
    },
    "shrub": {
        "growth_form": "shrub",
        "trunk_style": "multi_stem",
        "branching_pattern": "open",
        "canopy_shape": "irregular",
        "leaf_style": "simple",
        "leaf_scale": "small",
        "root_style": "normal",
        "height_ratio": 0.4,
        "width_ratio": 0.6,
        "color_profile": "olive",
    },
    "deciduous": {
        "growth_form": "broadleaf_tree",
        "trunk_style": "thick_branching",
        "branching_pattern": "wide_spreading",
        "canopy_shape": "rounded",
        "leaf_style": "simple",
        "leaf_scale": "medium",
        "root_style": "normal",
        "height_ratio": 0.8,
        "width_ratio": 0.85,
        "color_profile": "deep_green",
    },
}

# Extra species-specific overrides applied on top of the type defaults
_SPECIES_OVERRIDES: dict[str, dict] = {
    "banyan": {
        "canopy_shape": "spreading",
        "leaf_style": "broad",
        "root_style": "aerial",
        "height_ratio": 0.7,
        "width_ratio": 1.4,
    },
    "mango": {
        "trunk_style": "thick_branching",
        "leaf_style": "broad",
        "canopy_density": "dense",
        "width_ratio": 1.05,
        "fruit": True,
    },
    "teak": {
        "trunk_style": "straight",
        "branching_pattern": "upright",
        "canopy_density": "sparse",
        "leaf_style": "broad",
        "leaf_scale": "large",
        "height_ratio": 1.05,
        "width_ratio": 0.7,
        "color_profile": "olive",
    },
    "coconut": {
        "fruit": True,
    },
}


def _build_visual_profile(tree_type: str, common_name: str, knowledge_data: dict | None) -> dict:
    base = dict(_PROFILE_DEFAULTS.get(tree_type, _PROFILE_DEFAULTS["deciduous"]))
    base.setdefault("entity_type", "plant")
    base.setdefault("canopy_density", "dense")

    # Apply species-level overrides
    key = _slug(common_name)
    for species_key, overrides in _SPECIES_OVERRIDES.items():
        if species_key in key:
            base.update(overrides)
            break

    # Habitat from roots
    if knowledge_data:
        origin = (knowledge_data.get("roots") or {}).get("origin", "")
        if origin:
            base["habitat"] = str(origin)

    return base


# ── Taxonomy extractor ────────────────────────────────────────────────────────

def _extract_taxonomy(knowledge_data: dict | None) -> dict[str, str | None]:
    if not knowledge_data:
        return {}
    roots = knowledge_data.get("roots") or {}
    clf = roots.get("classification") or {}
    return {
        "kingdom": clf.get("kingdom"),
        "phylum":  clf.get("phylum"),
        "class":   clf.get("class"),
        "order":   clf.get("order"),
        "family":  clf.get("family"),
        "genus":   clf.get("genus"),
        "species": clf.get("species"),
    }


# ── Facts extractor ───────────────────────────────────────────────────────────

def _extract_facts(knowledge_data: dict | None) -> dict[str, str | None]:
    if not knowledge_data:
        return {}
    trunk = knowledge_data.get("trunk") or {}
    roots = knowledge_data.get("roots") or {}
    return {
        "Height":   trunk.get("height"),
        "Lifespan": trunk.get("lifespan"),
        "Growth":   trunk.get("growth_rate"),
        "Bark":     trunk.get("bark"),
        "Climate":  trunk.get("climate"),
        "Origin":   roots.get("origin"),
        "Habitat":  roots.get("native_regions"),
        "Family":   (roots.get("classification") or {}).get("family"),
        "Genus":    (roots.get("classification") or {}).get("genus"),
    }


# ── Summary extractor ─────────────────────────────────────────────────────────

def _extract_summary(knowledge_data: dict | None, scientific_name: str | None) -> str:
    if not knowledge_data:
        return ""
    branches = knowledge_data.get("branches") or {}
    # Grab the first ecology leaf as the summary, falling back to uses, etc.
    for cat in ("ecology", "uses", "research", "conservation", "geography", "news"):
        leaves = branches.get(cat) or []
        if leaves:
            item = leaves[0]
            content = item.get("content", "")
            if len(content) > 20:
                sci = f" ({scientific_name})" if scientific_name else ""
                return f"{knowledge_data.get('common_name', '')}{sci}. {content[:300]}"
    return ""


# ── Knowledge list builder ────────────────────────────────────────────────────

def _build_knowledge(knowledge_data: dict | None) -> list[dict]:
    if not knowledge_data:
        return []
    branches = knowledge_data.get("branches") or {}
    items: list[dict] = []
    category_labels = {
        "ecology":      "Ecology",
        "uses":         "Uses",
        "research":     "Research",
        "conservation": "Conservation",
        "geography":    "Geography",
        "news":         "News",
    }
    for cat, leaves in branches.items():
        if not isinstance(leaves, list):
            continue
        label = category_labels.get(cat, cat.title())
        for i, leaf in enumerate(leaves):
            sources: list[str] = leaf.get("sources") or []
            source_url  = sources[0] if sources else "https://treeliveai.com"
            source_name = source_url.split("/")[2] if "/" in source_url else "TreeLife Research"
            items.append({
                "id":             f"{cat}-{i}",
                "title":          leaf.get("title", ""),
                "summary":        leaf.get("content", ""),
                "why_it_matters": None,
                "category":       label,
                "source_name":    source_name,
                "source_url":     source_url,
                "retrieved_at":   "2026-10-03T00:00:00Z",
            })
    return items


# ── Main converter ────────────────────────────────────────────────────────────

def db_tree_to_entity(tree) -> dict:
    """
    Convert a SQLAlchemy Tree model instance to a TreeEntity dict
    that matches src/lib/api/types.ts exactly.
    """
    kd: dict | None = tree.knowledge_data

    common_name    = tree.common_name or ""
    scientific_name = tree.scientific_name
    tree_type       = (tree.tree_type or "deciduous").lower()

    # Stable string slug-based id the frontend can use in URLs
    entity_id = f"{_slug(common_name)}-{tree.id}"

    created_iso = (
        tree.created_at.replace(tzinfo=timezone.utc).isoformat()
        if tree.created_at else "2026-10-03T00:00:00Z"
    )

    summary = _extract_summary(kd, scientific_name)

    return {
        "id":              entity_id,
        "query":           tree.search_query or common_name,
        "common_name":     common_name,
        "scientific_name": scientific_name,
        "entity_type":     "Plant",
        "status":          "verified",
        "confidence":      "High confidence",
        "summary":         summary,
        "taxonomy":        _extract_taxonomy(kd),
        "facts":           _extract_facts(kd),
        "visual_profile":  _build_visual_profile(tree_type, common_name, kd),
        "images":          [],
        "knowledge":       _build_knowledge(kd),
        "created_at":      created_iso,
    }
