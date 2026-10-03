from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import TreeCreate, TreeRead
from services.tree_service import resolve_and_create_tree, get_tree

router = APIRouter()


@router.post("/trees/search", response_model=TreeRead)
async def search_tree_endpoint(body: TreeCreate, db: AsyncSession = Depends(get_db)):
    """Search for a tree and return the knowledge record."""
    tree = await resolve_and_create_tree(db, body.search_query)
    return tree


@router.get("/trees/{tree_id}", response_model=TreeRead)
async def get_tree_endpoint(tree_id: int, db: AsyncSession = Depends(get_db)):
    """Get a tree by ID."""
    tree = await get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return tree
