from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models import Tree, ForestEntry
from services.serpapi_service import search_tree
from services.ai_service import categorize_tree


def _tree_type_emoji(tree_type: str) -> str:
    """Map tree_type string to emoji category."""
    t = tree_type.lower()
    if "palm" in t:
        return "🌴"
    if "conifer" in t:
        return "🌲"
    if "shrub" in t:
        return "🌿"
    return "🌳"


async def resolve_and_create_tree(db: AsyncSession, query: str) -> Tree:
    """
    Search for a tree, categorize it with AI, check for duplicates,
    and create or update the DB record.
    """
    # 1. Fetch search results
    search_data = await search_tree(query)

    # 2. Categorize with AI
    knowledge = await categorize_tree(query, search_data)

    scientific_name: Optional[str] = knowledge.get("scientific_name")

    # 3. Check for existing tree with matching scientific name (case-insensitive)
    if scientific_name and scientific_name.lower() not in ("species unknown", "unknown"):
        result = await db.execute(
            select(Tree).where(
                func.lower(Tree.scientific_name) == scientific_name.lower()
            )
        )
        existing = result.scalars().first()
        if existing:
            # Add alias if not already present
            aliases = list(existing.aliases or [])
            if query not in aliases and query.lower() != existing.search_query.lower():
                aliases.append(query)
                existing.aliases = aliases
                await db.commit()
                await db.refresh(existing)
            return existing

    # 4. Compute total leaves
    branches: dict = knowledge.get("branches", {})
    total_leaves = sum(len(v) for v in branches.values())

    # 5. Determine tree_type (use emoji category as the stored tree_type string)
    ai_type = knowledge.get("tree_type", "deciduous")
    tree_type = _tree_type_emoji(ai_type)

    # 6. Insert Tree row
    new_tree = Tree(
        common_name=knowledge.get("common_name", query.title()),
        scientific_name=scientific_name,
        search_query=query,
        tree_type=tree_type,
        knowledge_data=knowledge,
        total_leaves=total_leaves,
        created_at=datetime.utcnow(),
        aliases=[],
    )
    db.add(new_tree)
    await db.flush()  # get the new id

    # 7. Insert ForestEntry row
    forest_entry = ForestEntry(
        tree_id=new_tree.id,
        added_at=datetime.utcnow(),
    )
    db.add(forest_entry)
    await db.commit()
    await db.refresh(new_tree)

    return new_tree


async def get_forest(db: AsyncSession) -> list[Tree]:
    """Return all trees ordered by created_at ascending."""
    result = await db.execute(
        select(Tree).order_by(Tree.created_at.asc())
    )
    return list(result.scalars().all())


async def get_tree(db: AsyncSession, tree_id: int) -> Optional[Tree]:
    """Fetch a tree by primary key, or None if not found."""
    result = await db.execute(
        select(Tree).where(Tree.id == tree_id)
    )
    return result.scalars().first()
