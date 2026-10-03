import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import ChatRequest, ChatResponse
from services.tree_service import get_tree

router = APIRouter()


@router.post("/assistant/chat", response_model=ChatResponse)
async def chat_endpoint(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Chat with the assistant about a specific tree."""
    tree = await get_tree(db, body.tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        # Canned response without API key
        return ChatResponse(
            reply=(
                f"Hello! I'm the TreeLife assistant. You asked about {tree.common_name} "
                f"({tree.scientific_name or 'species information unavailable'}). "
                f"This tree has {tree.total_leaves} knowledge leaves across its branches. "
                f"To get AI-powered answers, add your OPENAI_API_KEY to the .env file."
            )
        )

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        system_prompt = (
            f"You are a knowledgeable assistant specialising in tree species. "
            f"You are answering questions about {tree.common_name} ({tree.scientific_name}). "
            f"Use the following knowledge data as your primary source:\n\n"
            f"{tree.knowledge_data}\n\n"
            f"Be concise, informative, and engaging. Focus on facts from the knowledge data."
        )

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": body.message},
            ],
            temperature=0.5,
            max_tokens=400,
        )

        reply = response.choices[0].message.content
        return ChatResponse(reply=reply)

    except Exception as e:
        return ChatResponse(
            reply=(
                f"I encountered an error while processing your question about {tree.common_name}. "
                f"Please try again. Error: {str(e)[:100]}"
            )
        )
