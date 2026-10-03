from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class LeafDetail(BaseModel):
    title: str
    content: str
    sources: list[str]
    category: str


class KnowledgeData(BaseModel):
    common_name: str
    scientific_name: Optional[str] = None
    tree_type: str
    roots: dict[str, Any]
    trunk: dict[str, Any]
    branches: dict[str, list[LeafDetail]]


class TreeCreate(BaseModel):
    search_query: str


class TreeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    common_name: str
    scientific_name: Optional[str] = None
    search_query: str
    tree_type: str
    knowledge_data: Optional[Any] = None
    total_leaves: int
    created_at: datetime
    aliases: Optional[list[str]] = None


class ForestRead(BaseModel):
    trees: list[TreeRead]


class ChatRequest(BaseModel):
    tree_id: int
    message: str


class ChatResponse(BaseModel):
    reply: str
