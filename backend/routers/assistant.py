"""
POST /api/assistant/chat

Frontend sends: { message: string, history: [{role, content}] }
Backend returns: ChatReply { reply, entities?, mode?, sources? }
"""
import os
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import ChatRequest, ChatReply
from services.tree_service import get_forest
from services.entity_builder import db_tree_to_entity

router = APIRouter()


@router.post("/assistant/chat", response_model=ChatReply)
async def chat_endpoint(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    trees  = await get_forest(db)
    forest = [db_tree_to_entity(t) for t in trees]

    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not api_key:
        return _demo_reply(body.message, forest)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        forest_summary = "\n".join(
            f"- {e['common_name']} ({e.get('scientific_name') or 'sp.'}): {e.get('summary', '')[:200]}"
            for e in forest
        )
        system = (
            "You are TreeMind, a knowledgeable botanical assistant for TreeLife AI.\n"
            "The user's knowledge forest currently contains these trees:\n\n"
            f"{forest_summary or '(no trees yet)'}\n\n"
            "Answer questions about these trees clearly and concisely. "
            "Cite the trees by name. If a question is unrelated to botany, gently redirect."
        )
        history = [
            {"role": m.get("role", "user"), "content": m.get("content", "")}
            for m in (body.history or [])
        ]
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system}] + history + [{"role": "user", "content": body.message}],
            temperature=0.5,
            max_tokens=500,
        )
        reply_text = response.choices[0].message.content or ""
        # Extract which forest entities were mentioned
        mentioned = [
            {"id": e["id"], "name": e["common_name"]}
            for e in forest
            if e["common_name"].lower() in reply_text.lower()
        ]
        return ChatReply(reply=reply_text, entities=mentioned or None, mode="forest")

    except Exception as exc:
        return ChatReply(
            reply=f"I ran into an issue ({exc.__class__.__name__}). Your forest has {len(forest)} tree(s). Try again shortly.",
        )


# ── Demo reply (no OpenAI key) ─────────────────────────────────────────────────

def _demo_reply(message: str, forest: list[dict]) -> ChatReply:
    m = message.lower()

    hits = [e for e in forest if e["common_name"].lower() in m]
    if not hits and any(w in m for w in ("tropic", "heat", "warm")):
        hits = [e for e in forest if "tropic" in (e.get("facts") or {}).get("Habitat", "").lower()]
    if not hits and any(w in m for w in ("medic", "cure", "heal", "treat")):
        hits = [e for e in forest if any(
            "medic" in (k.get("summary", "") + k.get("title", "")).lower()
            for k in (e.get("knowledge") or [])
        )]
    if not hits and any(w in m for w in ("wetland", "coast", "water", "mangrove")):
        hits = [e for e in forest if "wetland" in (e.get("facts") or {}).get("Habitat", "").lower()
                                   or "coast" in (e.get("facts") or {}).get("Habitat", "").lower()]
    if not hits:
        hits = forest[:3]

    if not hits:
        return ChatReply(
            reply="Your forest is still empty. Search for a tree to grow your first knowledge tree.",
            mode="forest",
        )

    lines = []
    for e in hits:
        sci = f" ({e['scientific_name']})" if e.get("scientific_name") else ""
        hab = (e.get("facts") or {}).get("Habitat", "")
        summary = e.get("summary", "")[:200]
        lines.append(f"**{e['common_name']}{sci}**\n{summary}\n{'Habitat: ' + hab if hab else ''}")

    reply_text = "\n\n".join(lines)
    if not api_key_present():
        reply_text += "\n\n*(Add OPENAI_API_KEY for richer AI-powered answers.)*"

    sources = []
    for e in hits:
        for k in (e.get("knowledge") or [])[:1]:
            sources.append({"name": k["source_name"], "url": k["source_url"]})

    return ChatReply(
        reply=reply_text,
        entities=[{"id": e["id"], "name": e["common_name"]} for e in hits],
        mode="forest",
        sources=sources or None,
    )


def api_key_present() -> bool:
    return bool(os.getenv("OPENAI_API_KEY", "").strip())
