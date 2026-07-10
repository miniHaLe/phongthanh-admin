#!/bin/sh
# API container entrypoint: wait for Postgres, apply migrations, seed (idempotent),
# then launch the compiled server. Fails loud if any step errors.
set -eu

echo "[entrypoint] waiting for Postgres to accept connections..."
# Parse host/port from DATABASE_URL (postgres://user:pass@host:port/db).
db_hostport="$(printf '%s' "$DATABASE_URL" | sed -E 's|.*@([^/]+)/.*|\1|')"
db_host="${db_hostport%%:*}"
db_port="${db_hostport##*:}"
[ "$db_host" = "$db_port" ] && db_port=5432

i=0
until pg_isready -h "$db_host" -p "$db_port" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "[entrypoint] Postgres not ready after 60s, aborting." >&2
    exit 1
  fi
  sleep 1
done
echo "[entrypoint] Postgres is ready."

echo "[entrypoint] applying migrations..."
npm run db:migrate

echo "[entrypoint] seeding (idempotent)..."
npm run seed

echo "[entrypoint] starting API on port ${PORT:-3210}..."
exec node dist/main.js
