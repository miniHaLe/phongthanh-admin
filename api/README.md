# Phong Thành Admin — API

NestJS + Postgres + Drizzle backend for the Phong Thành admin app. Phase 1 ships
the **Khách hàng vertical slice**: JWT auth (access + httpOnly refresh rotation),
a generic CRUD engine with per-resource sort/filter allowlists, and JWT-derived
branch scoping.

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

## Environment (`.env`)

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Postgres connection (compose exposes host `5434`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing (≥ 16 chars) |
| `INITIAL_ADMIN_PASSWORD` | Super-admin bootstrap password (never committed) |
| `PORT` | API port (default `3210`) |
| `CORS_ORIGIN` | Vite dev origin (default `http://localhost:5173`) |

## Tests

```bash
npm test          # e2e/integration against a throwaway `phongthanh_test` DB
```

`test/global-setup.ts` drops + recreates `phongthanh_test` on the same compose
Postgres, migrates, and seeds before the suite. The suite covers auth
(login / no-enumeration / locked / CSRF / refresh-rotation-reuse), CRUD, and the
five security gates (sort allowlist, filter allowlist, branch-never-filterable,
JWT branch scope, no-secret-serialization).

## Architecture

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
  order, preserves ids, derives `khach_hang.branch_id` from `tinhId` (D4), and
  stamps the super-admin (V4).

### Branch namespace (D4, reconciled)

Canonical branch id = `chi_nhanh.id` (`cn-1`/`cn-2`/`cn-3`). `khach_hang` rows
carry no branch in the source data, so `branch_id` is derived at seed from
`tinhId` (`tinh-dak-lak`→`cn-1`, `tinh-dak-nong`→`cn-2`). Empty branch set ⇒
**deny** (never all); super-scope sees every branch.
