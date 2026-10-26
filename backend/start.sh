#!/bin/zsh
# TreeLife AI — Backend startup script
# Usage: ./start.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Create venv if missing
if [ ! -f ".venv/bin/python" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

# Install / sync dependencies
echo "Installing dependencies..."
.venv/bin/pip install --quiet -r requirements.txt

# Load .env if present
if [ -f ".env" ]; then
  echo "Loading .env..."
  set -a; source .env; set +a
fi

echo ""
echo "Starting TreeLife AI backend on http://localhost:8000"
echo "API docs: http://localhost:8000/docs"
echo ""

.venv/bin/uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --reload-dir routers \
  --reload-dir services
