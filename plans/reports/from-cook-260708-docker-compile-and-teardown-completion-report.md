# Docker single-script build + full hosting teardown — Completion

**Workflow:** `/ck:cook "compile everything into a single script which runs docker …
then clear all hosting related to this project"` · **Date:** 2026-07-08

## Request → resolution

Two parts that conflicted in ordering (a script that *starts* hosting vs. a step
that *clears* it). Resolved via `AskUserQuestion`:
- **Deliver** the full-stack Docker build (Dockerfiles + compose + one run script).
- **Do NOT leave it running** — execute a **teardown now** that clears all project
  hosting. DB data was confirmed reseedable → deleted.

## Delivered artifacts

| File | Purpose |
|------|---------|
| `api/Dockerfile` | Multi-stage NestJS build; runtime runs as **non-root `node`**, `--omit=dev` (tsx moved to prod deps for migrate/seed) |
| `api/docker-entrypoint.sh` | Wait-for-Postgres → migrate → seed → `node dist/main.js` |
| `Dockerfile.web` | Vite `build:prod` (guard enforced) → nginx serves SPA |
| `docker/nginx.conf` | SPA fallback + reverse-proxy `/api` + `/auth` → `api:3210` (same-origin) |
| `docker-compose.yml` | `db` + `api` + `web`; secrets **required** (`:?`, no baked-in keys) |
| `.env.docker.example` | Dev secrets template; `.env.docker` gitignored + auto-created by the run script |
| `.dockerignore`, `api/.dockerignore` | Lean contexts; exclude `.env`, node_modules, plans/docs/.git |
| `scripts/docker-run.sh` | **The single script** — build + up + health-wait, one command |
| `scripts/docker-teardown.sh` | Surgical removal of ONLY project resources (allowlist, `DRY_RUN=1` mode) |

**Run:** `./scripts/docker-run.sh` → app at `http://localhost:8080` (nginx proxies
the API same-origin). **Teardown:** `./scripts/docker-teardown.sh`.

## Verification

- **Images build:** both `phongthanh-admin-api` + `-web` build clean; frontend
  `build:prod` guard passes inside Docker.
- **Stack launches** via the one script: DB healthy, **API entrypoint migrated +
  seeded 50 khach_hang rows**, web serves 200.
- **Non-root confirmed:** API image runs `uid=1000(node)`.
- **Secrets fail loud:** `docker compose config` without secrets → error (no
  silent boot with public keys); valid with the env-file.
- `npm ci` from the regenerated lock clean; `tsc` clean.

## Teardown result (surgical, verified)

Executed twice (after each test launch). Both times:
- Removed exactly the project's containers (incl. the legacy manually-created
  `phongthanh-db-dev`), the `phongthanh-admin_pgdata` volume, the
  `phongthanh-admin_default` network, and both built images.
- **154 unrelated containers** (sauron, coluan, be-server, portainer, …) **left
  untouched** (158→154). Ports 5434 + 8080 freed. Zero phongthanh footprint of any
  resource type remains.

The teardown uses an explicit name allowlist — never a global prune or a
`grep | xargs` that could over-match on this shared machine.

## Security fixes applied (code-review gate)

Reviewer found no Critical; 2 High hardening items — both fixed + re-verified:
- **H1** API container ran as root → added `--chown=node:node` + `USER node`.
- **H2** Committed dev JWT defaults were ≥16 chars → would pass prod validation and
  boot with publicly-known signing keys (fail-open). Changed to **required** vars
  (`${JWT_SECRET:?…}`); dev values now come from the gitignored `.env.docker`.

## Known environment constraint (NOT an artifact defect)

Container-to-container connectivity on freshly-created compose bridges is flaky on
THIS host: the daemon's `{"dns":["8.8.8.8","1.1.1.1"]}` + `ndots:0` + a
`vpn.dflo.ai` search domain cause bare service names (`db`, `api`) to resolve
externally, and the nginx→api hop intermittently connection-refused. The API→DB hop
rode it out via the entrypoint retry loop (seeded successfully). The compose/nginx
design is correct and portable; the reviewer confirmed nothing in the artifacts
independently causes this. On a normal host the stack is fully reachable.

## Recommended follow-ups (from review, non-blocking, deferred)

- Add an `api` healthcheck + `web depends_on: service_healthy` (startup robustness).
- Derive teardown names from `COMPOSE_PROJECT_NAME` (survive a dir rename).
- Declare an explicit named network.
- Entrypoint sed-parse assumes a `/dbname` path in DATABASE_URL (true for the
  shipped URL); a POSIX param-expansion rewrite would harden the edge case.

Full review: `from-code-reviewer-to-cook-260708-docker-deployment-artifacts-review-report.md`

## Unresolved questions

1. Deploy target for these artifacts (the plan's Phase 7 names a single VPS +
   docker-compose — these files match that; confirm when Phase 7 runs).
2. Whether to adopt the 4 non-blocking robustness follow-ups now or in Phase 7.
