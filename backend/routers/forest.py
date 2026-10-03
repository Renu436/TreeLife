from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import ForestRead
from services.tree_service import get_forest

router = APIRouter()


@router.get("/forest", response_model=ForestRead)
async def get_forest_endpoint(db: AsyncSession = Depends(get_db)):
    """Return all trees in the user's knowledge forest."""
    trees = await get_forest(db)
    return ForestRead(trees=trees)
