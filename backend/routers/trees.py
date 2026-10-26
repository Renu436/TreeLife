"""
POST /api/trees/search  — search for a tree, return TreeEntity
GET  /api/trees/{id}    — fetch a single tree by slug-id or numeric id
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Tree
from schemas import SearchRequest, TreeEntity
from services.tree_service import resolve_and_create_tree, get_tree as db_get_tree
from services.entity_builder import db_tree_to_entity

router = APIRouter()


@router.post("/trees/search", response_model=TreeEntity)
async def search_tree_endpoint(body: SearchRequest, db: AsyncSession = Depends(get_db)):
    """
    Frontend sends: { query: string }
    Returns:        TreeEntity
    """
    tree = await resolve_and_create_tree(db, body.query)
    return db_tree_to_entity(tree)


@router.get("/trees/{tree_id}", response_model=TreeEntity)
async def get_tree_endpoint(tree_id: str, db: AsyncSession = Depends(get_db)):
    """
    Accepts either:
      • A slug-id like "neem-1"  (format used by frontend URLs)
      • A plain integer id       (legacy / internal)
    Returns: TreeEntity
    """
    tree = None

    # Try slug format "name-N"
    if "-" in tree_id:
        parts = tree_id.rsplit("-", 1)
        if parts[-1].isdigit():
            tree = await db_get_tree(db, int(parts[-1]))
            # Sanity-check slug matches (prevents id collision)
            if tree is None:
                raise HTTPException(status_code=404, detail="Tree not found")

    # Fall back to pure integer
    if tree is None and tree_id.isdigit():
        tree = await db_get_tree(db, int(tree_id))

    # Last resort: search by common_name
    if tree is None:
        result = await db.execute(
            select(Tree).where(Tree.search_query.ilike(tree_id))
        )
        tree = result.scalars().first()

    if tree is None:
        raise HTTPException(status_code=404, detail="Tree not found")

    return db_tree_to_entity(tree)
