# Phong Thành Admin API

NestJS + Postgres + Drizzle backend for Phong Thành Admin. Current release:
JWT auth, customer/dealer and user persistence, 16 writable catalog resources,
plus read-only permission-group and official-geography resources.

## Prerequisites

- Node.js 24 and npm
- Docker Desktop with Docker Compose

Use `npm ci`; do not replace the committed lockfile with an install-only state.

## Local Setup

From the repository root:

```bash
docker compose up -d db
npm --prefix api ci
```

Create a gitignored `api/.env`. For the MacBook deployment, follow the private
file procedure in [`../docs/deployment.md`](../docs/deployment.md). For local
development, `api/.env.example` documents non-production defaults; replace all
JWT/password placeholders.

Initialize and run:

```bash
npm --prefix api run build
npm --prefix api run db:migrate
npm --prefix api run seed
npm --prefix api run start:dev
```

API default: `http://localhost:3210`. The idempotent seed requires
`INITIAL_ADMIN_PASSWORD`, creates seeded users, and forces password change on
first login.

## Environment

| Variable                            | Contract                                                         |
| ----------------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`                      | Required Postgres URL; host-run compose uses port `5434`         |
| `JWT_SECRET`                        | Required access-token secret, minimum 16 chars                   |
| `JWT_REFRESH_SECRET`                | Required distinct refresh-secret setting, minimum 16 chars       |
| `INITIAL_ADMIN_PASSWORD`            | Required by `npm run seed`; not required for API bootstrap       |
| `PORT`                              | API port; project deployment uses `3210`                         |
| `CORS_ORIGIN`                       | Primary browser origin; comma-separated values accepted          |
| `CORS_ADDITIONAL_ORIGINS`           | Optional origins appended to `CORS_ORIGIN`                       |
| `TRUST_PROXY_HOPS`                  | Trusted proxy hop count, integer `0..3`                          |
| `AUTH_LOGIN_RATE_LIMIT_MAX`         | Login request limit per window                                   |
| `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`   | Login rate-limit window                                          |
| `AUTH_REFRESH_RATE_LIMIT_MAX`       | Refresh/logout request limit per window                          |
| `AUTH_REFRESH_RATE_LIMIT_WINDOW_MS` | Refresh/logout rate-limit window                                 |
| `API_RATE_LIMIT_MAX`                | `/api` request limit per window                                  |
| `API_RATE_LIMIT_WINDOW_MS`          | `/api` rate-limit window                                         |
| `REFRESH_COOKIE_SAME_SITE`          | `strict`, `lax`, or `none`; Pages/ngrok uses `none`              |
| `REFRESH_REUSE_GRACE_MS`            | Optional refresh-race grace; default `10000`, mainly test tuning |

Never commit `api/.env`, credentials, database dumps, or ngrok tokens.

## Health and Readiness

Both endpoints are public:

| Endpoint            | Success                  | Purpose                              |
| ------------------- | ------------------------ | ------------------------------------ |
| `GET /health`       | `200 {"status":"ok"}`    | Process liveness                     |
| `GET /health/ready` | `200 {"status":"ready"}` | Postgres `SELECT 1` within 3 seconds |

Readiness returns `503 {"status":"not-ready"}` when Postgres cannot answer.
GitHub Pages deployment requires public readiness unless the explicit emergency
override is selected.

## Authentication Contract

- `POST /auth/login`: public; returns a 15-minute access JWT and sets a 30-day
  httpOnly refresh cookie scoped to `/auth`.
- `POST /auth/refresh`: public JWT-wise, but requires refresh cookie plus
  `X-Requested-With: XMLHttpRequest`; rotates refresh tokens and detects reuse.
- `POST /auth/logout`: same CSRF header; revokes the token family and clears the
  refresh cookie.
- `POST /auth/change-password`: access JWT required.
- Access JWT carries `roleIds`, `branchIds`, `superScope`, and
  `mustChangePassword`.
- Global guards reject protected requests without JWT and reject non-auth work
  until a seeded user completes the required password change.
- Login errors do not reveal whether a username exists. Locked users are
  rejected. Auth and API rate limits return `429`.

For split GitHub Pages/ngrok hosting, use `CORS_ORIGIN=https://minihale.github.io`
and `REFRESH_COOKIE_SAME_SITE=none`. CORS allows the auth/JSON headers plus
`ngrok-skip-browser-warning`.

## HTTP Resources

| Endpoint               | Scope             | Contract                                                               |
| ---------------------- | ----------------- | ---------------------------------------------------------------------- |
| `/api/v1/khach-hang`   | JWT branches      | CRUD customer and dealer rows; normalized/legacy address compatibility |
| `/api/v1/nha-san-xuat` | Global            | Manufacturer CRUD                                                      |
| `/api/v1/san-pham`     | Global            | Product CRUD                                                           |
| `/api/v1/model`        | Global            | Model CRUD with required manufacturer/product parents                  |
| `/api/v1/ngan-hang`    | Global            | Bank CRUD                                                              |
| `/api/v1/dia-ly`       | Global, read-only | Official province/commune snapshot                                     |
| `/api/v1/nguoi-dung`   | Admin write guard | Secret-free user CRUD with exact filters                               |
| `/api/v1/nhom-quyen`   | Global, read-only | Permission-group lookup                                                 |
| Other catalog routes    | Global            | Branch, warehouse, product/goods, repair-routing and delivery catalogs |

All resource endpoints require JWT. List responses use:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

List query contract:

- `page` starts at 1; `pageSize` is `1..300`.
- `sort`, `filters[key]`, and `search` are checked against each resource's
  allowlists before query construction.
- Text search escapes `%`, `_`, and `\`; text sort uses Vietnamese ICU collation.
- Unsupported sort/filter fields return `400`.
- Unique, FK, and check violations map to stable `409`/`400` responses.

### Branch Scope

Customer branch ownership is server-controlled, never a generic filter:

- Non-super list/get/update/delete stays inside JWT `branchIds`.
- `branchId=all` means the JWT-authorized union, not all database branches.
- A specific `branchId` may only narrow that union; unauthorized branch asks
  return `403`.
- Empty JWT branch set denies access; it never expands to all rows.
- Customer/dealer create stamps the user's primary `branchIds[0]`; users without
  a primary branch cannot create.
- Row writes repeat the branch predicate, closing read/write race windows.

### Customer and Dealer

Customer writes support street, official province/commune codes, tax number,
bank, account number, type, and self-referential parent dealer. Dealer
quick-create is a customer create with a dealer customer type, so it persists
through the same real API.

Province and commune must be supplied together and must match. Reads compose
`diaChi`, enrich `nganHangTen` and `daiLyTen`, and retain leading zeroes in
account numbers. Existing legacy address text is preserved unless an explicit
clear-address command is used.

### Model Relation

`model.nha_san_xuat_id` and `model.san_pham_id` are required FKs. Duplicate
normalized names inside the same parent pair are blocked. Responses enrich
`nhaSanXuatTen` and `sanPhamTen` without per-row queries.

## Migrations and Seed

- `0000_omniscient_mesmero`: baseline schema.
- `0001_cool_sunspot`: catalogs, official geography, normalized customer
  fields, ICU collation, and unaccent support.
- `0002_backfill-khach-hang-address-codes`: data-only backfill for frozen seed
  customers whose legacy administrative units have one authoritative mapping.
  Ambiguous rows remain unchanged.
- `0003_masterdata_catalogs`: remaining legacy catalogs. The repair-routing
  `phuong-xa` API uses `phuong_xa_legacy`; official geography keeps
  `phuong_xa`.

Forward release:

```bash
npm --prefix api run build
npm --prefix api run db:migrate
npm --prefix api run seed
```

Do not use the old `0001` down script after later migrations. It cannot safely
reconcile their ledger/data state. Prefer application-only rollback or a full
verified database backup restore; see
[`../docs/deployment.md`](../docs/deployment.md#rollback-and-database-restore).

Geography fixtures are frozen at `official-2025.07.01`: 34 provinces/cities and
3,321 communes/wards/special zones. Provenance and checksums:
[`../docs/vietnam-administrative-data-provenance.md`](../docs/vietnam-administrative-data-provenance.md).

## Tests

```bash
# Root: starts compose Postgres, then API lint/build/Jest
npm run test:api:with-db

# Manual, with Postgres already running
npm --prefix api run lint
npm --prefix api run build
npm --prefix api test
```

`api/test/global-setup.ts` recreates `phongthanh_test`, migrates, and seeds before
Jest. Current gate: 13 suites / 109 tests covering auth, users, CRUD hardening,
customer branch scope, address backfill, catalogs/geography, seeding, and
readiness contracts.
