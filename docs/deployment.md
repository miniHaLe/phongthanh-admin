# Deployment: GitHub Pages + MacBook API

## Overview

Production/demo topology:

```text
Browser
  -> GitHub Pages (React static build)
  -> HTTPS ngrok URL
  -> MacBook: NestJS API on port 3210; ngrok targets 127.0.0.1:3210
  -> MacBook: Postgres 16 in Docker on 127.0.0.1:5434
```

- Repository: <https://github.com/miniHaLe/phongthanh-admin>
- Frontend: <https://minihale.github.io/phongthanh-admin/>
- Pages workflow: [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
- API and data are available only while the MacBook is awake, Docker is
  running, the API process is alive, and the ngrok tunnel is connected.
- Keep `api/.env`, ngrok credentials, passwords, and database backups outside
  Git. Never commit them.
- Nest currently listens on the MacBook's network interfaces. Keep the macOS
  firewall enabled, do not forward port 3210 on the router, and expose the API
  publicly only through ngrok. Postgres is loopback-only on port 5434.

Current release state on 2026-07-14:

- Repository variable `vars.API_URL` is unset.
- The previous public tunnel serves an older API and returns `404` for
  `/health/ready`.
- A push-triggered Pages deployment therefore fails before deploy. This is
  safe: the workflow does not replace the current Pages artifact until API URL
  validation and readiness pass.

## One-Time MacBook Setup

### 1. Install tools

Use Node.js 24. Skip packages already installed.

```bash
xcode-select --install
brew install node@24 gh ngrok/ngrok/ngrok
brew install --cask docker
brew link --overwrite --force node@24
```

Open Docker Desktop once, finish its setup, then verify:

```bash
node --version
npm --version
docker version
docker compose version
ngrok version
gh --version
```

`node --version` must report `v24.x`.

Authenticate GitHub CLI and ngrok:

```bash
gh auth login
ngrok config add-authtoken <your-ngrok-authtoken>
```

The ngrok token belongs in ngrok's local config, not in this repository.

### 2. Clone and install the API

```bash
git clone https://github.com/miniHaLe/phongthanh-admin.git
cd phongthanh-admin
git switch main
npm --prefix api ci
```

Use `npm ci`, not `npm install`, so the MacBook uses the committed lockfile.

### 3. Create `api/.env` safely

Create a private file without copying real values into documentation or shell
history:

```bash
umask 077
touch api/.env
chmod 600 api/.env
${EDITOR:-nano} api/.env
```

`touch` preserves an existing file; it does not replace its contents.

Enter this shape and replace every angle-bracket placeholder locally:

```dotenv
DATABASE_URL=postgres://phongthanh:phongthanh_dev@localhost:5434/phongthanh
JWT_SECRET=<generated-access-secret-at-least-16-chars>
JWT_REFRESH_SECRET=<different-generated-refresh-secret-at-least-16-chars>
INITIAL_ADMIN_PASSWORD=<temporary-bootstrap-password-from-password-manager>
PORT=3210
CORS_ORIGIN=https://minihale.github.io
CORS_ADDITIONAL_ORIGINS=
TRUST_PROXY_HOPS=1
AUTH_LOGIN_RATE_LIMIT_MAX=20
AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000
AUTH_REFRESH_RATE_LIMIT_MAX=120
AUTH_REFRESH_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=600
API_RATE_LIMIT_WINDOW_MS=60000
REFRESH_COOKIE_SAME_SITE=none
```

Generate the two JWT values separately:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Do not paste generated values into GitHub issues, chat, logs, or tracked files.
`INITIAL_ADMIN_PASSWORD` is needed by the idempotent seed command. Seeded users
must change it at first login.

### 4. Start and initialize Postgres

```bash
docker compose up -d db
docker compose ps db
npm --prefix api run build
npm --prefix api run db:migrate
npm --prefix api run seed
```

Postgres data persists in the Docker volume `pgdata`. Host port `5434` maps to
container port `5432`.

### 5. Keep two terminals running

Terminal A -- API. `caffeinate` keeps the Mac awake while this command runs:

```bash
caffeinate -dimsu npm --prefix api run start:prod
```

Terminal B -- HTTPS tunnel:

```bash
ngrok http 3210
```

Copy the displayed HTTPS URL and set it in the shell used for release commands:

```bash
export API_URL=https://<your-ngrok-domain>
```

Verify the new API locally and publicly:

```bash
curl -fsS http://127.0.0.1:3210/health
curl -fsS http://127.0.0.1:3210/health/ready
curl -fsS -H 'ngrok-skip-browser-warning: true' "$API_URL/health/ready"
```

Expected JSON is `{"status":"ok"}` and `{"status":"ready"}`. The readiness
endpoint checks Postgres with a three-second query timeout.

### 6. Verify host network safety

ngrok creates an outbound tunnel, so this deployment needs no router port
forwarding and no inbound rule for ports `3210` or `5434`.

1. In macOS **System Settings -> Network -> Firewall**, turn the firewall on.
2. Do not add a router port-forward or UPnP mapping for `3210` or `5434`.
3. Do not add Node.js as an unrestricted incoming application. ngrok connects to
   the API locally and does not need LAN access.
4. Verify the listeners:

```bash
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
docker port phongthanh-db 5432/tcp
lsof -nP -iTCP:3210 -sTCP:LISTEN
```

The database mapping must be `127.0.0.1:5434`. The Node listener may show
`*:3210` or `[::]:3210`, which is LAN-capable. From another LAN device, confirm
that `http://<macbook-lan-ip>:3210/health` cannot connect. If it succeeds, set
Node.js to **Block incoming connections** in Firewall Options before proceeding.
Public checks must use the ngrok HTTPS URL, not the MacBook's LAN address.

## First Rollout With the Readiness Gate

The first push containing `/health/ready` can fail its automatic Pages run
because `vars.API_URL` is unset or still points to the old API. Leave that run
failed; it protects Pages from building against an unavailable backend.

If the MacBook already contains live data, do not repeat the one-time database
initialization as a shortcut. Use [Normal Git Update on the MacBook](#normal-git-update-on-the-macbook),
starting with its backup step.

Use this order:

1. Pull the release on the MacBook.
2. Install, build, migrate, seed, and start the new API.
3. Start ngrok and make both local and public readiness checks pass.
4. Persist the public URL in GitHub.
5. Dispatch and watch a new Pages run.

Persist and verify `API_URL`:

```bash
gh variable set API_URL --repo miniHaLe/phongthanh-admin --body "$API_URL"
gh variable list --repo miniHaLe/phongthanh-admin --json name,value \
  --jq '.[] | select(.name == "API_URL")'
```

Dispatch, list, and watch:

```bash
gh workflow run deploy-pages.yml --repo miniHaLe/phongthanh-admin
gh run list --repo miniHaLe/phongthanh-admin --workflow deploy-pages.yml --limit 5
RUN_ID="$(gh run list --repo miniHaLe/phongthanh-admin \
  --workflow deploy-pages.yml --limit 1 --json databaseId \
  --jq '.[0].databaseId')"
gh run watch "$RUN_ID" --repo miniHaLe/phongthanh-admin --exit-status
```

After success, open <https://minihale.github.io/phongthanh-admin/> and test
login plus a real customer/catalog request.

## Normal Git Update on the MacBook

Run from the repository root. The backup is written outside the repository.

### 1. Back up the live database

```bash
BACKUP_DIR="$HOME/phongthanh-backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/phongthanh-$(date +%Y%m%d-%H%M%S).dump"
docker exec phongthanh-db pg_dump -U phongthanh -d phongthanh \
  --format=custom > "$BACKUP_FILE"
test -s "$BACKUP_FILE"
```

Keep backups private and outside Git. Copy important backups off the MacBook.

### 2. Require a clean worktree and fast-forward pull

```bash
git status --short
```

If this prints anything, stop. Review with `git diff` and commit or otherwise
preserve intentional local work. Do not reset, overwrite, or auto-stash it.

When clean:

```bash
git switch main
git pull --ff-only origin main
npm --prefix api ci
npm --prefix api run build
```

### 3. Stop writes, migrate, seed, and restart

In Terminal A, press `Ctrl-C` to stop the API. Leave ngrok running; it may show
a brief `502` while the API restarts.

```bash
npm --prefix api run db:migrate
npm --prefix api run seed
```

Verify migration `0002` and the guarded live address backfill before restarting
the API:

```bash
docker exec -i phongthanh-db psql -U phongthanh -d phongthanh <<'SQL'
SELECT
  count(*) FILTER (WHERE id ~ '^kh-[0-9]+$') AS seed_rows,
  count(*) FILTER (
    WHERE id ~ '^kh-[0-9]+$'
      AND tinh_thanh_code IS NOT NULL
      AND phuong_xa_code IS NOT NULL
  ) AS normalized_seed_rows,
  count(*) FILTER (
    WHERE id ~ '^kh-[0-9]+$'
      AND tinh_thanh_code IS NULL
      AND phuong_xa_code IS NULL
  ) AS legacy_seed_rows,
  count(*) FILTER (
    WHERE (tinh_thanh_code IS NULL) <> (phuong_xa_code IS NULL)
  ) AS invalid_code_pairs
FROM khach_hang;
SQL
```

For an untouched fixture dataset, expect `50 / 44 / 6 / 0`. A live database may
show fewer than 44 normalized seed rows because `0002` deliberately skips rows
whose identity, legacy address, or timestamps changed. `invalid_code_pairs` must
always be `0`. If counts differ, inspect the skipped rows against the backup and
the exact guards in
[`0002_backfill-khach-hang-address-codes.sql`](../api/src/db/migrations/0002_backfill-khach-hang-address-codes.sql);
do not replace the guarded migration with a bulk update. Keep query output
private because it describes live data.

Restart the API only after the migration check:

```bash
caffeinate -dimsu npm --prefix api run start:prod
```

From another terminal, verify all three checks:

```bash
curl -fsS http://127.0.0.1:3210/health
curl -fsS http://127.0.0.1:3210/health/ready
curl -fsS -H 'ngrok-skip-browser-warning: true' "$API_URL/health/ready"
```

If frontend code changed, dispatch and watch Pages using the commands in
[First Rollout With the Readiness Gate](#first-rollout-with-the-readiness-gate).

## GitHub Pages Workflow Contract

The workflow builds with:

- Node.js 24 and `npm ci`;
- all 20 release resources enabled;
- `VITE_ROUTER_MODE=hash`;
- `VITE_BASE_PATH=/phongthanh-admin/`;
- `VITE_API_URL` from manual `api_url` or persisted `vars.API_URL`.

Every run validates that the selected API URL is a non-empty absolute HTTP(S)
URL without whitespace. Normal runs then require:

```text
GET <API_URL>/health/ready -> 2xx
```

### One-run URL override

```bash
gh workflow run deploy-pages.yml --repo miniHaLe/phongthanh-admin \
  -f api_url="$API_URL"
```

The `api_url` input affects only that run. It does not update `vars.API_URL`.
Use `gh variable set API_URL ...` when the tunnel URL should persist for future
push and manual runs.

### Emergency readiness bypass

```bash
gh workflow run deploy-pages.yml --repo miniHaLe/phongthanh-admin \
  -f api_url="$API_URL" -f skip_health_gate=true
```

`skip_health_gate=true` skips only the `/health/ready` request. URL validation
still runs. Use this only for a known, time-bounded readiness incident; it can
publish a frontend that points at an unavailable API.

## Tunnel URL Stability and Rotation

- Prefer the fixed dev domain assigned to the ngrok account.
- For a paid/custom setup, reserve a domain and start with the dashboard-provided
  URL, for example `ngrok http 3210 --url 'https://<reserved-domain>'`.
- If the URL changes because the domain, account, or tunnel configuration
  changes, update `vars.API_URL` and rebuild Pages. Existing frontend bundles
  keep their old API URL until redeployed.
- Never use `http://localhost:3210` as the Pages API URL. Use the HTTPS ngrok
  URL to avoid browser mixed-content blocking.

## Troubleshooting

### `404` from `/health/ready`

The tunnel points to an old API build or the wrong upstream. Pull the release,
rebuild, restart the API, then retest locally before changing GitHub variables.

### `503` from `/health/ready`

The Nest app is alive but Postgres is unavailable or failed its query.

```bash
docker compose ps db
docker compose logs --tail=100 db
```

Start/fix the database, then retry local readiness.

### ngrok `502 Bad Gateway`

ngrok cannot reach `127.0.0.1:3210`. Check Terminal A, API startup errors, the
port in `api/.env`, and local `/health`.

### Browser CORS or refresh-cookie failure

- `CORS_ORIGIN` must include exactly `https://minihale.github.io` without the
  repository path.
- Split GitHub Pages/ngrok deployment needs `REFRESH_COOKIE_SAME_SITE=none`.
- The API allowlist includes `Authorization`, `Content-Type`,
  `X-Requested-With`, and `ngrok-skip-browser-warning`.
- Restart the API after changing `api/.env`.

### ngrok warning page or non-JSON response

The frontend sends `ngrok-skip-browser-warning: true`. Add the same header to
manual curl checks. If the browser still receives warning HTML, verify Pages was
rebuilt from the current frontend and points at the intended ngrok domain.

### Git pull refuses or shows local changes

Do not force the pull. Inspect `git status --short` and `git diff`, preserve the
local work, then retry only from a clean `main` branch.

### Pages workflow fails before build

Check the repository variable and public readiness:

```bash
gh variable list --repo miniHaLe/phongthanh-admin --json name,value \
  --jq '.[] | select(.name == "API_URL")'
curl -i -H 'ngrok-skip-browser-warning: true' "$API_URL/health/ready"
```

Protected endpoints returning `401` without a token is expected. A health
endpoint returning `401` is not expected.

## Rollback and Database Restore

### Preferred: application-only rollback

Keep the migrated database and run a known-good API commit that is compatible
with the current additive schema/data:

In Terminal A, press `Ctrl-C` to stop the current API first. Leave ngrok running;
it will return a temporary `502` until the known-good API starts.

```bash
git status --short
git log --oneline -10
git switch --detach <known-good-commit>
npm --prefix api ci
npm --prefix api run build
caffeinate -dimsu npm --prefix api run start:prod
```

Do not run migrations backward. Return to the release branch later with
`git switch main`, then use the normal update procedure.

### Restore a full backup

Use only when a database rollback is required. Stop the API first. Restoring
rewinds all data written after the selected backup.

```bash
BACKUP_FILE="$HOME/phongthanh-backups/<selected-backup>.dump"
test -s "$BACKUP_FILE"
docker exec -i phongthanh-db pg_restore \
  --clean --if-exists --no-owner --exit-on-error \
  -U phongthanh -d phongthanh < "$BACKUP_FILE"
```

Start the API version matching that backup, then verify local and public
readiness before deploying Pages.

Migration `0002_backfill-khach-hang-address-codes.sql` follows `0001`, then
`0003_masterdata_catalogs.sql` adds the remaining catalogs. The old
`0001_cool_sunspot.down.sql` path is unsafe after later migrations because it
does not reconcile their ledger/data state. Do not use the `0001` down script
as a release rollback. Use application-only rollback or restore a full, verified
backup instead.

## References

- [API setup and contracts](../api/README.md)
- [Codebase summary](./codebase-summary.md)
- [Administrative data provenance](./vietnam-administrative-data-provenance.md)
