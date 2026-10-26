from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers.trees import router as trees_router
from routers.forest import router as forest_router
from routers.assistant import router as assistant_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="TreeLife AI",
    description="Living Knowledge Forest — AI-powered tree knowledge platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:4173",   # vite preview
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"https://.*\.lovable\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api prefix
app.include_router(trees_router, prefix="/api")
app.include_router(forest_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
