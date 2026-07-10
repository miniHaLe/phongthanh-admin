#!/usr/bin/env bash
# One-command full-stack launch for this project.
# Builds the API + frontend images, brings up Postgres + API + nginx-served SPA
# via docker compose, waits for health, and prints where to reach it.
#
# Usage:  ./scripts/docker-run.sh
# Secrets: override via env, e.g.
#   JWT_SECRET=... JWT_REFRESH_SECRET=... INITIAL_ADMIN_PASSWORD=... ./scripts/docker-run.sh
set -euo pipefail

# Resolve repo root from this script's location (works from any CWD).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

WEB_PORT="${WEB_PORT:-8080}"

# Secrets: compose requires JWT_SECRET / JWT_REFRESH_SECRET / INITIAL_ADMIN_PASSWORD
# (no baked-in fallback). Load them from the gitignored .env.docker, bootstrapping
# it from the example on first run so the local flow stays one-command.
if [ ! -f .env.docker ]; then
  echo "==> .env.docker not found — creating it from .env.docker.example (dev secrets)."
  cp .env.docker.example .env.docker
fi

echo "==> Building images and starting the stack (db + api + web)..."
docker compose --env-file .env.docker up -d --build

echo "==> Waiting for the web endpoint on http://localhost:${WEB_PORT} ..."
i=0
until curl -fsS "http://localhost:${WEB_PORT}" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 90 ]; then
    echo "ERROR: web endpoint not ready after 90s. Recent logs:" >&2
    docker compose logs --tail 40 api web >&2 || true
    exit 1
  fi
  sleep 1
done

echo ""
echo "==> Stack is up."
echo "    App:      http://localhost:${WEB_PORT}"
echo "    Login:    admin / \${INITIAL_ADMIN_PASSWORD:-Ph0ngThanh!Dev2026}"
echo "    Postgres: localhost:5434 (host) / db:5432 (compose net)"
echo ""
echo "    Logs:     docker compose logs -f"
echo "    Stop:     docker compose down        (keeps DB volume)"
echo "    Teardown: ./scripts/docker-teardown.sh   (removes ALL project hosting)"
