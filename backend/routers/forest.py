"""
GET /api/forest — return all trees as a flat TreeEntity list.

The frontend's api.forest() accepts either:
  • TreeEntity[]               (plain array)
  • { trees: TreeEntity[] }    (wrapped)

The client.ts handles both:
  const data = await http<TreeEntity[] | { trees: TreeEntity[] }>("/api/forest");
  return Array.isArray(data) ? data : data.trees ?? [];

We return the plain array form so the frontend just uses it directly.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import TreeEntity
from services.tree_service import get_forest
from services.entity_builder import db_tree_to_entity

router = APIRouter()


@router.get("/forest", response_model=list[TreeEntity])
async def get_forest_endpoint(db: AsyncSession = Depends(get_db)):
    trees = await get_forest(db)
    return [db_tree_to_entity(t) for t in trees]
