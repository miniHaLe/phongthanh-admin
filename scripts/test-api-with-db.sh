#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
if docker inspect phongthanh-db >/dev/null 2>&1; then
  if [[ "$(docker inspect -f '{{.State.Running}}' phongthanh-db)" != "true" ]]; then
    docker start phongthanh-db >/dev/null
  fi
else
  docker compose up -d db
fi

for _ in {1..30}; do
  status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' phongthanh-db 2>/dev/null || true)"
  if [[ "$status" == "healthy" || "$status" == "running" ]]; then
    break
  fi
  sleep 1
done

status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' phongthanh-db 2>/dev/null || true)"
if [[ "$status" != "healthy" && "$status" != "running" ]]; then
  echo "Postgres container phongthanh-db is not healthy. Current status: ${status:-missing}" >&2
  exit 1
fi

cd "$ROOT_DIR/api"
npm run lint
npm run build
npm test
