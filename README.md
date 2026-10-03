# 🌳 TreeLife AI — Living Knowledge Forest

> **Search doesn't return a page. Search grows a tree.**

TreeLife AI is an AI-powered interactive knowledge platform where users search for tree
species and receive comprehensive, current information gathered through SerpApi. Instead
of presenting results as static web pages, every search visually grows a tree — and every
explored tree is permanently added to a personalized knowledge forest.

---

## Overview

The central idea is simple: **every piece of knowledge makes the tree grow.**

```
User searches: Neem
       ↓
SerpApi retrieves live information
       ↓
AI (gpt-4o-mini) categorizes and structures data
       ↓
🌱 Seed → 🌿 Roots → 🌳 Trunk → 🌿 Branches → 🍃 Leaves
       ↓
Tree permanently saved to the user's Knowledge Forest
```

Each tree maps knowledge onto a visual structure:

| Part | Represents |
|------|------------|
| 🌱 Seed | The initial search query |
| 🌿 Roots | Taxonomy, origin, native regions, classification |
| 🌳 Trunk | Physical characteristics, height, growth rate, bark |
| 🌿 Branches | Ecology, Uses, Research, Conservation, Geography, News |
| 🍃 Leaves | Individual knowledge items (click to read details + sources) |

---

## Architecture

**Backend** — Python 3.9, FastAPI 0.111.0, SQLAlchemy 2.0 async, SQLite (aiosqlite)

**Frontend** — React 18, Vite 5, Tailwind CSS 3, Framer Motion 11, React Router v6

**AI / Search** — OpenAI `gpt-4o-mini`, SerpApi `google-search-results`

### File Structure

```
TreeLife/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, router mounting, startup
│   ├── database.py                # Async SQLAlchemy engine + session factory
│   ├── models.py                  # Tree, ForestEntry ORM models
│   ├── schemas.py                 # Pydantic v2 request/response schemas
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── trees.py               # POST /api/trees/search, GET /api/trees/{id}
│   │   ├── forest.py              # GET /api/forest
│   │   └── assistant.py           # POST /api/assistant/chat
│   └── services/
│       ├── serpapi_service.py     # SerpApi wrapper + mock fallback
│       ├── ai_service.py          # OpenAI categorization + mock fallback
│       └── tree_service.py        # Orchestration, deduplication, DB writes
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # BrowserRouter + route definitions
│       ├── index.css              # Tailwind directives + SVG animation helpers
│       ├── api/
│       │   └── treeApi.js         # fetch wrappers for all 5 endpoints
│       ├── hooks/
│       │   └── useTreeSearch.js   # Search state machine (idle/searching/growing/done)
│       ├── components/
│       │   ├── SearchBar.jsx      # Input + suggestion chips (Neem, Banyan, Mango…)
│       │   ├── TreeVisualization.jsx  # SVG centerpiece with Framer Motion animation
│       │   ├── LeafPanel.jsx      # Slide-in detail panel per leaf
│       │   ├── ForestView.jsx     # Pannable/zoomable SVG forest overview
│       │   ├── ForestStats.jsx    # Total trees, total leaves, most recent
│       │   ├── TreeCard.jsx       # Forest sidebar card per tree
│       │   ├── TreeMind.jsx       # Collapsible AI chat widget
│       │   └── LoadingGrowth.jsx  # Full-screen animated search overlay
│       └── pages/
│           ├── Home.jsx           # Forest overview + search entry point
│           └── TreePage.jsx       # Two-column tree detail view
└── .agents/                       # Workflow artifacts (not committed)
```

---

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Optional: add your keys to .env (see "Running Without API Keys" below)
pip3 install -r requirements.txt
~/.local/bin/uvicorn main:app --port 8000 --reload
# or: python3 -m uvicorn main:app --port 8000 --reload
```

The backend starts on **http://localhost:8000**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies `/api` and `/health`
requests to the backend automatically via the Vite dev server proxy.

---

## Running Without API Keys

Both external services have **built-in mock data fallbacks**. The app is fully
functional with an empty `.env` file.

**SerpApi** (`SERPAPI_KEY`) — if the key is absent, `serpapi_service.py` returns
pre-built search result objects for five species: **Neem, Banyan, Mango, Teak,
Coconut**. Any other search query uses a generic fallback result set.

**OpenAI** (`OPENAI_API_KEY`) — if the key is absent, `ai_service.py` returns
fully-structured `KnowledgeData` objects for the same five species (each with ≥ 20
leaves across all branches). Any other query gets a generic fallback structure.

To add real keys later, edit `backend/.env`:

```
SERPAPI_KEY=your_serpapi_key_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./treelife.db
```

---

## How the Tree Grows

The SVG tree visualization in `TreeVisualization.jsx` animates in stages driven by the
knowledge data returned from the API. More knowledge items produce more branches and
leaves.

| Stage | Element | Animation start | Duration |
|-------|---------|----------------|----------|
| 1 | 🌱 Seed (circle) | 0.0 s | 0.5 s fade-in |
| 2 | 🌿 Roots (5 paths) | 0.3 s staggered | 0.8 s each |
| 3 | 🌳 Trunk (cubic bezier) | 1.1 s | 1.2 s pathLength |
| 4 | 🌿 Major branches | 2.3 s staggered | 0.7 s each |
| 5 | Sub-branches | 3.5 s staggered | 0.5 s each |
| 6 | 🍃 Leaves (ellipses) | 4.5 s staggered | spring, 0.08 s gap |

Branch count is computed from leaf count: `Math.min(6, Math.max(3, Math.floor(total_leaves / 6)))`.
Leaf color indicates category: ecology (green), uses (amber), research (indigo),
conservation (red), geography (sky), news (yellow).

---

## The Knowledge Forest

Every tree you search is **permanently stored in SQLite** and appears in your
Knowledge Forest on the Home page.

- `ForestView.jsx` renders trees as a pannable, zoomable SVG. Drag to pan, scroll
  to zoom.
- Tree positions are **deterministic** — computed from `hashStr(common_name)` so the
  same forest always looks identical across reloads.
- Searching a species that already exists (e.g. "Azadirachta indica" after "Neem")
  is deduplicated: the scientific name is matched case-insensitively and the search
  is recorded as an alias on the existing tree rather than creating a duplicate.

---

## API Reference

All endpoints are served by FastAPI on port 8000.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/health` | — | `{"status": "ok"}` |
| `POST` | `/api/trees/search` | `{"search_query": "Neem"}` | `TreeRead` (full knowledge data) |
| `GET` | `/api/trees/{id}` | — | `TreeRead` or 404 |
| `GET` | `/api/forest` | — | `{"trees": [TreeRead, …]}` |
| `POST` | `/api/assistant/chat` | `{"tree_id": 1, "message": "…"}` | `{"reply": "…"}` |

`TreeRead` includes: `id`, `common_name`, `scientific_name`, `tree_type`,
`search_query`, `total_leaves`, `created_at`, `aliases`, and the full
`knowledge_data` object (roots, trunk, branches with leaf arrays).

---

## Development

| Service | Port | Start command (from project root) |
|---------|------|------------------------------------|
| Backend | 8000 | `cd backend && python3 -m uvicorn main:app --port 8000 --reload` |
| Frontend | 5173 | `cd frontend && npm run dev` |

Run them in separate terminals. The Vite proxy means the frontend never needs the
backend URL hardcoded — all `fetch('/api/...')` calls are forwarded automatically.

To produce a production build of the frontend:

```bash
cd frontend
npm run build
# Output is written to frontend/dist/
```

To verify the backend imports cleanly without starting the server:

```bash
cd backend
python3 -c "from main import app; print('OK')"
```
