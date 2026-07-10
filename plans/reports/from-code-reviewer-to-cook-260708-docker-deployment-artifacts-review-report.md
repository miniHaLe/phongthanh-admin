# Code Review — Docker / Deployment Artifacts

**Reviewer:** code-reviewer
**Date:** 2026-07-08
**Scope:** `api/Dockerfile`, `api/docker-entrypoint.sh`, `api/.dockerignore`, root `.dockerignore`, `Dockerfile.web`, `docker/nginx.conf`, `docker-compose.yml`, `scripts/docker-run.sh`, `scripts/docker-teardown.sh`, `api/package.json`
**Review type:** Static (Docker torn down; inter-container networking blocked on host — per instructions did NOT run the stack)

---

## Overall Assessment

Solid, well-reasoned infra. The multi-stage split is correct, the same-origin nginx design is sound, the runtime dependency reasoning (`tsx` promoted, `drizzle-kit` correctly excluded) is verified accurate, and the teardown script is genuinely surgical — the destructive paths use an explicit allowlist with zero wildcard deletion. No Critical findings. The issues that matter are **High: API container runs as root** and **High: `docker-compose.yml` ships real-looking default secrets that satisfy prod validation**. The rest are Medium/Low robustness and portability items, several of which directly answer the author's own open questions.

Most of the author's self-verified conclusions hold up under scrutiny. Confirmed correct: same-origin `VITE_API_URL=''` works (Vite inlines the empty string from `process.env`), `drizzle-kit` not needed at runtime, `.env` excluded from both build contexts, no test/spec files leak into the runtime image, teardown deletion cannot over-match.

---

## Verdict per Focus Area

| # | Area | Verdict |
|---|------|---------|
| 1 | Entrypoint DATABASE_URL parse | **PASS with one edge case** — robust for the shipped URL and `@`-in-password; breaks only for a URL with no `/dbname` path (not the compose URL). Low. |
| 2 | Security / secrets | **PASS with concerns** — no secret baked into image or bundle (verified). But default secrets pass prod env validation (High) and container runs as root (High). |
| 3 | Build correctness (`--omit=dev`) | **PASS** — `tsx` present, migrations copied via `src`, `drizzle-kit` correctly unneeded (migrate.ts uses a literal `migrationsFolder`, never loads `drizzle.config.ts`). |
| 4 | Teardown safety | **PASS** — destructive ops iterate an explicit allowlist only; no `xargs`/glob deletion. Verification grep (L74-77) is read-only. Correct and safe. |
| 5 | Maintainability / image-name assumption | **CONFIRMED FRAGILE** — volume/network/image names hardcode the `phongthanh-admin` project (dir) name; renaming the dir silently orphans them. Medium. |
| 6 | `.dockerignore` coverage | **PASS** — `plans/docs/.git/.claude/node_modules/.env` all excluded from root context; `api/.dockerignore` excludes `.env`, `dist`, `test`, `node_modules`. |

---

## Findings by Severity

### Critical
None.

### High

**H1 — API container runs as root** (`api/Dockerfile`, no `USER` directive)
The `node:*-alpine` images ship a `node` user, but the runtime stage never switches to it, so `dist/main.js` (and the entrypoint, migrate, seed) run as UID 0. Any RCE in the Node process (or a dependency) executes as root inside the container — a needless privilege for a web API.
**Fix:** after the `COPY`/`chmod` lines in the runtime stage:
```dockerfile
# entrypoint + app own their files, then drop root
RUN chown -R node:node /app
USER node
```
Confirm `pg_isready` (from `postgresql16-client`) is on PATH for the `node` user (it is — `/usr/bin`). No writable-path issues expected since the app writes nothing to disk.

**H2 — Default secrets in `docker-compose.yml` satisfy prod env validation** (`docker-compose.yml:43-45`)
`JWT_SECRET:-dev-access-secret-change-me-please-1234567890` etc. are ≥16 chars, so `src/config/env.ts`'s Zod guard (min 16) passes with the *documented, committed* default. A deploy that forgets to override envs comes up fully functional with publicly-known JWT signing keys — anyone can forge access/refresh tokens. This is worse than a startup failure because it fails **open**, silently.
This is a deliberate dev-convenience trade-off (acknowledged in the file header), so it is acceptable *for local/dev* — but it is a latent prod footgun. Options (pick one, don't need all):
- Add a runtime guard: refuse to boot if `NODE_ENV=production` and any secret equals its known dev default (strongest; fails closed).
- Or drop the fallbacks for the two JWT secrets so compose errors loudly (`variable is not set`) when unset, keeping only `INITIAL_ADMIN_PASSWORD` defaulted.
- At minimum, keep the current header warning AND note it in the deployment doc.
Given `.claude/rules` "fix real failure modes," H2 is the highest-value security hardening here even though the current values aren't real production secrets.

### Medium

**M1 — Teardown name derivation is fragile to a directory rename** (`scripts/docker-teardown.sh:31-35`)
`VOLUMES=phongthanh-admin_pgdata`, `NETWORKS=phongthanh-admin_default`, `IMAGES=phongthanh-admin-{api,web}` all assume the compose project name is `phongthanh-admin` (the dir basename). Rename the checkout dir (or set `COMPOSE_PROJECT_NAME`) and teardown silently misses the volume/network/images — leaving orphaned data while reporting "Done." Containers are safe (they use explicit `container_name`).
**Fix:** derive the project name once and interpolate, e.g.
```bash
PROJECT="${COMPOSE_PROJECT_NAME:-$(basename "$ROOT_DIR")}"
VOLUMES="${PROJECT}_pgdata"
NETWORKS="${PROJECT}_default"
IMAGES="${PROJECT}-api ${PROJECT}-web"
```
This stays surgical (still an exact allowlist, no wildcards) while surviving a rename. Add a one-line comment noting the assumption.

**M2 — `web` waits for API start, not readiness; no API healthcheck** (`docker-compose.yml:49-64`) — *answers the author's portability question*
`web.depends_on: [api]` (short form) only blocks until the api container is *created/started*, not until it passes migrations+seed and is listening. On a cold start, nginx can come up while the API is still seeding; requests during that window return 502. It works in practice because nginx retries per-request, but it's racy across hosts. Add a healthcheck to `api` and gate `web` on it:
```yaml
api:
  healthcheck:
    test: ['CMD-SHELL', 'wget -qO- http://localhost:3210/health || exit 1']
    interval: 5s
    timeout: 5s
    retries: 20
    start_period: 30s   # covers migrate + seed
web:
  depends_on:
    api:
      condition: service_healthy
```
(`/health` controller exists — verified `src/health/health.controller.ts`.) `wget` is present in `node:alpine`. This is the single most impactful portability improvement and is independent of your host's DNS/bridge issue.

**M3 — No explicit network / the host DNS issue is not caused by these artifacts**
I found nothing in compose or nginx that would independently cause the inter-container connection-refused you observed. `proxy_pass http://api:3210` and `DATABASE_URL=...@db:5432` rely on Docker's embedded DNS resolving the service names on the default bridge; your daemon's `{"dns":["8.8.8.8","1.1.1.1"]}` + `ndots:0` + `vpn.dflo.ai` search domain is a plausible host-level cause (external resolver returns a public address for the bare service name before the embedded resolver is consulted). **Conclusion: host constraint, not an artifact defect** — your assessment is correct. Portability hardening that helps regardless: declare an explicit named network so intent is clear and the stack is insulated from a weird default bridge:
```yaml
networks:
  phongthanh:
services:
  db:  { networks: [phongthanh], ... }
  api: { networks: [phongthanh], ... }
  web: { networks: [phongthanh], ... }
```
This won't fix a host resolver that hijacks bare names, but it removes ambiguity and is good practice. If the embedded-DNS-bypass theory is right, the durable fix is host daemon config (not shippable in-repo).

**M4 — No `client_max_body_size` on the nginx proxy** (`docker/nginx.conf:11-27`)
Default is 1 MB. Any API endpoint accepting a larger payload (bulk import, file upload — the app has `xlsx`) will 413 at the proxy before reaching the API, which is confusing to debug. Set an explicit value on the `/api/` location (or `server`) matching the API's real limit, even if just `client_max_body_size 10m;` with a comment.

### Low

**L1 — Entrypoint parse breaks for a URL with no `/dbname`** (`api/docker-entrypoint.sh:8-11`)
Verified empirically. `postgres://user:pass@db:5432` (no trailing `/db`) fails the sed match; the unchanged string then yields `host=postgres` (the scheme). The shipped compose URL always has `/phongthanh`, and `@`-in-password / no-port / `?sslmode=` variants all parse correctly — so this is a portability landmine, not a live bug. If you want to harden cheaply, strip scheme+query first, or fall back: after parsing, `[ -z "$db_host" ] && { echo "cannot parse host from DATABASE_URL" >&2; exit 1; }` won't catch the scheme-as-host case though. Simplest robust rewrite:
```sh
# strip scheme and any query string, then the userinfo, then the path
hostport="${DATABASE_URL#*://}"; hostport="${hostport%%\?*}"
hostport="${hostport##*@}"; hostport="${hostport%%/*}"
db_host="${hostport%%:*}"; db_port="${hostport##*:}"
[ "$db_host" = "$db_port" ] && db_port=5432
```
Pure POSIX param expansion, no sed, handles all the cases above including no-path.

**L2 — No pinned digest / minor supply-chain surface** (`api/Dockerfile:6,12,19`, `Dockerfile.web:6,22`)
`node:24-alpine`, `nginx:1.27-alpine`, `postgres:16` are floating tags. Fine for a local/self-hosted convenience stack; note it as a known trade-off. Not worth pinning digests unless this becomes a reproducible prod artifact.

**L3 — Entrypoint runs `migrate` + `seed` on every boot** (`api/docker-entrypoint.sh:24-28`)
Correct and intentional (seed is idempotent per the comment; migrate is a no-op when current). One robustness note: on a `restart: unless-stopped` crash-loop, every restart re-runs both. Migrate is cheap; seed does bcrypt hashing of the admin password each time (verified `run-seed.ts` hashes `INITIAL_ADMIN_PASSWORD`). Not a correctness bug — just a startup-latency note. Acceptable.

**L4 — `docker-run.sh` login hint prints a shell-literal default** (`scripts/docker-run.sh:36`)
`Login: admin / \${INITIAL_ADMIN_PASSWORD:-Ph0ngThanh!Dev2026}` prints the literal `${INITIAL_ADMIN_PASSWORD:-...}` text rather than the resolved value (it's inside a single-quoted-then-escaped echo). Cosmetic; if you want it to show the effective password, unescape it — but printing a secret to the terminal is arguably worse, so leaving it literal is defensible. Flag only.

---

## Edge Cases Scouted (beyond the diff)

- **Frontend base URL** (`src/api/http-client.ts:27`): uses `?? 'http://localhost:3210'`. `??` only falls back on null/undefined, so `VITE_API_URL=''` correctly yields `''` → relative same-origin requests. **Verified the whole same-origin design hinges on this and it is correct.** If someone ever changes `??` to `||`, the empty string would fall through to `localhost:3210` and break the Docker deploy — worth a code comment there, but out of scope for this infra change.
- **Route prefix alignment**: CRUD controllers mount at `api/v1/khach-hang`, auth at `auth`, health at `health` — no `setGlobalPrefix`. nginx proxies `/api/` and `/auth/` (path preserved, no rewrite). `/health` is NOT proxied, so the browser can't hit it, but the compose healthcheck (M2) would call it container-internally. Alignment is correct for the app's real routes.
- **Teardown verification grep (L74-77)**: `grep -i phongthanh` over `docker ps -a` is read-only reporting; even if it over-matched a lookalike on another host it would only *print* it, never delete. Safe.
- **Web build context**: root `.dockerignore` excludes `api`, so `Dockerfile.web`'s `COPY . .` does not pull API source into the frontend image. Good.

---

## Recommended Actions (priority order)

1. **H1** — add `USER node` (+ `chown`) to the API runtime stage.
2. **H2** — add a prod guard rejecting known dev-default secrets, or drop the JWT fallbacks so compose fails loud when unset.
3. **M2** — add an `api` healthcheck and switch `web` to `depends_on: { api: { condition: service_healthy } }`. (Directly answers your robustness question — highest portability ROI.)
4. **M1** — derive teardown volume/network/image names from `COMPOSE_PROJECT_NAME`/dir basename instead of hardcoding.
5. **M3** — declare an explicit named network (documents intent; hardens portability).
6. **M4** — set `client_max_body_size` on the nginx proxy to match the API's real limit.
7. **L1** — harden the entrypoint URL parse (POSIX param-expansion version) if you expect non-compose DATABASE_URLs.

---

## Metrics

- Files reviewed: 11
- Destructive-path audit: teardown deletion is allowlist-only; **no** global prune, `xargs`, or wildcard `rm` — confirmed safe.
- Secret-leak audit: no secret in image layers (`.env` dockerignored in both contexts) or frontend bundle (only public `VITE_*` inlined) — confirmed.
- Linting/build: author reports `tsc` clean + both images build + `npm ci` clean from regenerated lock; not re-run (stack torn down, per instructions).

---

## Unresolved Questions

1. Is this stack intended purely for local/self-hosted dev convenience, or is it a path to a real production deploy? The answer changes H2 (guard vs. hard-fail) and L2 (digest pinning) from "nice-to-have" to "required."
2. Does any current or near-term API endpoint accept payloads >1 MB (bulk `xlsx` import)? If yes, M4 becomes a functional blocker, not a nicety.
3. Confirm the host DNS/bridge fix is being tracked as an ops/daemon config item (outside this repo) — the artifacts are correct, but a fresh clone on this same host will hit the same connectivity wall until the daemon `dns`/`ndots`/search-domain config is addressed.
