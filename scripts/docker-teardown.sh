#!/usr/bin/env bash
# SURGICAL teardown of this project's Docker hosting ONLY.
#
# Removes exactly the phongthanh containers, the compose volume/network, and the
# project's built images. It NEVER runs a global prune and NEVER touches any
# resource whose name doesn't match this project — the machine hosts many
# unrelated stacks.
#
# Usage:  ./scripts/docker-teardown.sh          (asks nothing; prints what it does)
#         DRY_RUN=1 ./scripts/docker-teardown.sh   (show targets, remove nothing)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

DRY_RUN="${DRY_RUN:-0}"
run() {
  if [ "$DRY_RUN" = "1" ]; then
    echo "    [dry-run] $*"
  else
    echo "    + $*"
    "$@" || true
  fi
}

# Explicit allowlist of this project's resources — no wildcards over `docker ps`
# output that could catch a lookalike. Names come from docker-compose.yml plus
# the legacy manually-created phongthanh-db-dev container.
CONTAINERS="phongthanh-web phongthanh-api phongthanh-db phongthanh-db-dev"
# Compose derives volume/network names from the project dir (phongthanh-admin).
VOLUMES="phongthanh-admin_pgdata"
NETWORKS="phongthanh-admin_default"
# Images this project builds (compose tags them <project>-<service>).
IMAGES="phongthanh-admin-api phongthanh-admin-web"

# `docker compose down` still interpolates the compose file, whose secret vars use
# the required-`:?` form — pass a throwaway env so teardown never fails on unset
# secrets (their values are irrelevant to teardown).
COMPOSE_DOWN_ENV="JWT_SECRET=x JWT_REFRESH_SECRET=x INITIAL_ADMIN_PASSWORD=x"
echo "==> Bringing the compose stack down (containers + network, keep volume)..."
if [ "$DRY_RUN" = "1" ]; then
  echo "    [dry-run] docker compose down --remove-orphans"
else
  env $COMPOSE_DOWN_ENV docker compose down --remove-orphans || true
fi

echo "==> Removing project containers (incl. the legacy db-dev)..."
for c in $CONTAINERS; do
  if docker container inspect "$c" >/dev/null 2>&1; then
    run docker rm -f "$c"
  fi
done

echo "==> Removing project volume (DELETES the seeded DB data — reseedable)..."
for v in $VOLUMES; do
  if docker volume inspect "$v" >/dev/null 2>&1; then
    run docker volume rm "$v"
  fi
done

echo "==> Removing project network..."
for n in $NETWORKS; do
  if docker network inspect "$n" >/dev/null 2>&1; then
    run docker network rm "$n"
  fi
done

echo "==> Removing project-built images..."
for img in $IMAGES; do
  if docker image inspect "$img" >/dev/null 2>&1; then
    run docker rmi -f "$img"
  fi
done

echo ""
echo "==> Done. Remaining phongthanh Docker resources (should be none):"
docker ps -a --format '{{.Names}}' | grep -i phongthanh || echo "    containers: none"
docker volume ls --format '{{.Name}}' | grep -i phongthanh || echo "    volumes: none"
docker network ls --format '{{.Name}}' | grep -i phongthanh || echo "    networks: none"
docker images --format '{{.Repository}}' | grep -i phongthanh || echo "    images: none"
