"""
Pydantic schemas for the TreeLife API.

The /api/trees/search, /api/trees/{id}, and /api/forest endpoints all return
TreeEntity — the exact shape the React frontend (src/lib/api/types.ts) expects.
"""
from datetime import datetime
from typing import Optional, Any, Literal
from pydantic import BaseModel, ConfigDict


# ── Inbound ───────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    """POST /api/trees/search — frontend sends { query: string }"""
    query: str


class ChatRequest(BaseModel):
    """POST /api/assistant/chat — frontend sends { message, history }"""
    message: str
    history: Optional[list[dict[str, str]]] = None


# ── Shared sub-models (mirror types.ts) ───────────────────────────────────────

class Taxonomy(BaseModel):
    kingdom: Optional[str] = None
    phylum:  Optional[str] = None
    cls:     Optional[str] = None   # 'class' is reserved in Python
    order:   Optional[str] = None
    family:  Optional[str] = None
    genus:   Optional[str] = None
    species: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class VisualProfile(BaseModel):
    entity_type:       str = "plant"
    growth_form:       str = "broadleaf_tree"
    trunk_style:       str = "thick_branching"
    branching_pattern: str = "wide_spreading"
    canopy_shape:      str = "rounded"
    canopy_density:    str = "dense"
    leaf_style:        str = "simple"
    leaf_scale:        str = "medium"
    root_style:        str = "normal"
    height_ratio:      float = 0.8
    width_ratio:       float = 0.8
    color_profile:     str = "seasonal_green"
    fruit:             Optional[bool] = None
    habitat:           Optional[str] = None


class KnowledgeItem(BaseModel):
    id:              str
    title:           str
    summary:         str
    why_it_matters:  Optional[str] = None
    category:        str
    source_name:     str
    source_url:      str
    retrieved_at:    str


class ResearchImage(BaseModel):
    url:         str
    alt:         str
    source_name: str
    source_url:  str
    query:       Optional[str] = None


# ── Primary outbound entity ───────────────────────────────────────────────────

class TreeEntity(BaseModel):
    """Mirrors TreeEntity in src/lib/api/types.ts exactly."""
    id:              str                               # slug string, not int
    query:           str
    common_name:     str
    scientific_name: Optional[str] = None
    entity_type:     str = "Plant"
    status:          str = "verified"                 # "verified" | "demo" | …
    confidence:      Optional[str] = None
    summary:         Optional[str] = None
    taxonomy:        Optional[dict[str, Optional[str]]] = None
    facts:           Optional[dict[str, Optional[str]]] = None
    visual_profile:  Optional[VisualProfile] = None
    images:          Optional[list[ResearchImage]] = None
    knowledge:       Optional[list[KnowledgeItem]] = None
    created_at:      str                              # ISO string


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatSource(BaseModel):
    name: str
    url:  str


class ChatReply(BaseModel):
    """Mirrors ChatReply in src/lib/api/types.ts."""
    reply:    str
    entities: Optional[list[dict[str, str]]] = None
    mode:     Optional[str] = None
    sources:  Optional[list[ChatSource]] = None


# ── Legacy internal schemas (used by DB layer only) ──────────────────────────
# Kept so tree_service.py / models.py don't need changing.

class _LegacyTreeCreate(BaseModel):
    search_query: str

class _LegacyTreeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:             int
    common_name:    str
    scientific_name: Optional[str] = None
    search_query:   str
    tree_type:      str
    knowledge_data: Optional[Any] = None
    total_leaves:   int
    created_at:     datetime
    aliases:        Optional[list[str]] = None
