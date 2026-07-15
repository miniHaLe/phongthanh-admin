#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Jest provisions one fixed database and terminates its existing connections.
# Serialize wrapper runs on Linux so concurrent validation cannot kill another
# suite; macOS lacks flock by default and continues with the prior behavior.
if command -v flock >/dev/null 2>&1; then
  LOCK_FILE="${TMPDIR:-/tmp}/phongthanh-admin-test-api.lock"
  exec 9>"$LOCK_FILE"
  flock 9
fi

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
