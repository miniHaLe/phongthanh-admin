# Phong Thành Admin — API

NestJS + Postgres + Drizzle backend for the Phong Thành admin app. The current
release serves JWT auth plus six real resources: `khach-hang`, `nha-san-xuat`,
`san-pham`, `model`, `ngan-hang`, and read-only `dia-ly`. Repair tickets and most
remaining frontend domains are still mock; dealer and sales quick-create are
unchanged and outside this release.

## Prerequisites

- Node ≥ 18 (dev uses 24), npm
- Docker + Docker Compose (for local Postgres)

## Setup

```bash
# 1. Start Postgres (from the repo root — host port 5434)
docker compose up -d db

# 2. Configure env
cp api/.env.example api/.env      # then edit secrets
cd api && npm install

# 3. Create schema + seed the frozen fixtures
npm run db:migrate
npm run seed                      # idempotent; safe to re-run

# 4. Run
npm run start:dev                 # http://localhost:3210
```

The seeder creates a super-admin (`admin`) whose password is
`INITIAL_ADMIN_PASSWORD`, with `must_change_password` forcing a change on first
login. Every other seeded user shares that initial password.

Geography fixtures are frozen at `official-2025.07.01` under
`seed-fixtures/`: 34 provinces/cities and 3,321 communes/wards/special zones
from Decision 19/2025/QĐ-TTg. Provenance and checksums are documented in
[`../docs/vietnam-administrative-data-provenance.md`](../docs/vietnam-administrative-data-provenance.md).

## Environment (`.env`)

| Var                                 | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`                      | Postgres connection (compose exposes host `5434`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing (≥ 16 chars)                        |
| `INITIAL_ADMIN_PASSWORD`            | Super-admin bootstrap password (never committed)  |
| `PORT`                              | API port (default `3210`)                         |
| `CORS_ORIGIN`                       | Vite dev origin (default `http://localhost:5173`) |

## Tests

```bash
# from repo root: starts only Postgres, then runs API lint/build/test
npm run test:api:with-db

# or manually
docker compose up -d db
cd api && npm test
```

`test/global-setup.ts` drops + recreates `phongthanh_test` on the same compose
Postgres, migrates, and seeds before the suite. The suite covers auth
(login / no-enumeration / locked / CSRF / refresh-rotation-reuse), generic CRUD,
catalog relations, geography counts/checksums, normalized customer address and
finance fields, plus the five security gates (sort allowlist, filter allowlist,
branch-never-filterable, JWT branch scope, no-secret-serialization).

If Postgres is not listening on `127.0.0.1:5434`, Jest fails before booting the
app with the exact `docker compose up -d db` command. The DB-only compose path
does not require app secrets. Full API/web compose still requires real secrets:
copy `.env.docker.example` to the gitignored `.env.docker` or export
`JWT_SECRET`, `JWT_REFRESH_SECRET`, and `INITIAL_ADMIN_PASSWORD` before starting
the full stack.

## Architecture

### HTTP resources

| Endpoint               | Scope             | Contract                                          |
| ---------------------- | ----------------- | ------------------------------------------------- |
| `/api/v1/khach-hang`   | JWT branches      | CRUD; normalized address + finance fields         |
| `/api/v1/nha-san-xuat` | Global            | CRUD manufacturer catalog                         |
| `/api/v1/san-pham`     | Global            | CRUD product catalog                              |
| `/api/v1/model`        | Global            | CRUD model with required manufacturer/product FKs |
| `/api/v1/ngan-hang`    | Global            | CRUD bank catalog                                 |
| `/api/v1/dia-ly`       | Global, read-only | Full official geography snapshot                  |

All endpoints require JWT unless decorated `@Public()`. CRUD list endpoints use
the shared paged response and explicit sort/filter/search allowlists. Model list
supports `nhaSanXuatId`, `sanPhamId`, `tenModel`, and enriches parent names in
batches.

- `src/crud/` — the generic `CrudService` + controller factory. Every resource's
  allowlists (sortable / filterable / search columns) live in its
  `*.resource-config.ts`; the five security gates are enforced once, here.
- `src/auth/` — login, refresh (rotation + reuse-detection + family revocation),
  logout; global `JwtAuthGuard`; `@Public()` opt-out; CSRF header guard on the
  cookie routes.
- `src/db/` — Drizzle schema + migrations (incl. the `vi-VN-x-icu` ICU collation
  and `unaccent`). Money columns are `bigint` (string on the wire — no money on
  khach-hang yet, convention set for later phases).
- `src/seed/` — `seedDatabase` imports the frozen `seed-fixtures/*.json` in FK
  order, preserves IDs, validates geography/catalog closure, maps branch for
  legacy seeded customer fixtures, and stamps the super-admin.

### Model relation

`model.nha_san_xuat_id` and `model.san_pham_id` are required FKs. A unique index
prevents duplicate normalized model names inside the same manufacturer/product
pair. Create/update verifies both parents before mutation; responses include
`nhaSanXuatTen` and `sanPhamTen`.

### Customer address and finance

New customer writes accept `tenDuong`, `tinhThanhCode`, `phuongXaCode`,
`maSoThue`, `nganHangId`, and `soTaiKhoan`. Province and commune must be supplied
as a pair; service validation plus a composite FK rejects mismatches. The service
composes compatibility field `diaChi` from street + commune + province and
enriches `nganHangTen` on reads.

Account numbers remain text so leading zeroes survive. Tax accepts empty, 10
digits, or `10-digits-3-digits`. Update payloads may send explicit `null` to
clear optional fields.

### Branch namespace (D4, reconciled)

Canonical branch id = `chi_nhanh.id` (`cn-1`/`cn-2`/`cn-3`). Legacy seed rows
without a branch keep the deterministic fixture mapping from `tinhId`. Runtime
customer create always stamps authenticated `branchIds[0]`, independent of the
customer address. Empty branch set ⇒ **deny** (never all); super-scope sees every
branch but still needs a primary branch to create a customer.

## Migration and rollback

`src/db/migrations/0001_cool_sunspot.sql` adds catalog/geography tables and
normalized customer columns. It deliberately retains legacy `dia_chi`,
`tinh_id`, `quan_id`, and `phuong_xa_id`; no free-text address is guessed or
backfilled into the post-merger hierarchy.

Forward:

```bash
npm run db:migrate
npm run seed
```

Explicit schema rollback, after stopping writes and taking a database backup:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f src/db/migrations/0001_cool_sunspot.down.sql
```

The down script removes the new tables/columns, preserves legacy customer rows
and address values, and removes the matching `0001` Drizzle ledger row. A later
`npm run db:migrate` can therefore reapply the migration safely. Prefer an
application-only rollback when keeping the additive schema is acceptable.
