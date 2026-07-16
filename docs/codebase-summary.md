# Codebase Summary

Updated: 2026-07-16

## Overview

Phong Thành Admin is a React 18 + Vite + TypeScript + Tailwind/shadcn admin app
with a NestJS + Postgres + Drizzle API under `api/`. JWT auth and 21 release
resources use the real API. Customer/dealer creation and catalog-dependent
lookups persist through shared adapters and invalidate both CRUD and lookup
caches. Repair tickets and most operational domains remain deterministic client
mock data.

Production topology is GitHub Pages frontend plus a MacBook-hosted API/Postgres
exposed through ngrok. Pages deploys only after its selected API URL passes
`/health/ready` unless an explicit emergency override is used.

## Frontend Contracts

- Shell and navigation: `src/components/shell/`, `src/config/nav-config.tsx`,
  and `src/routes/` provide a frequency-ranked flat sidebar, module tab strips,
  mobile drawer, command palette, route error boundary, and protected layout.
  Danh mục has 15 children. `/tin-tuc` and `/tin-tuc/:id` mount the real news
  list/detail pages; `/thong-bao` remains the separate repair-status history.
- Shared UI: `src/components/shared/` owns page headers, status components,
  filters, dirty-close confirmation, empty/stat states, server autocomplete,
  and the reusable data-table system. Tables support pagination, stable visible
  row numbering, density/column preferences, mobile cards, bounded horizontal
  scroll, export, and print contracts. Shared list selectors expose the legacy
  `20/30/50/100/150/200/300` page sizes.
- Branch scope: `src/api/jwt-claims.ts`, `src/store/app-store.ts`,
  `src/components/shared/branch-switcher.tsx`, and `src/routes/RequireAuth.tsx`
  expose only authorized branches. A persisted unauthorized branch is
  reconciled to the safe `all` selection, which still means the JWT-authorized
  union at the API.
- Repair: list, KT, and detail views use
  `src/features/repair-shared/update-status-modal.tsx`. One mock mutation updates
  the ticket and invalidates list, KT, detail, dashboard summary, recent-ticket,
  and status-distribution queries. Dashboard metrics therefore follow status
  changes without reload. The edit route `/sua-chua-bao-hanh/:id/sua` serializes
  blank optional values as explicit `null` clears while omitted fields preserve
  their existing values. Mock date defaults share the fixed repair epoch so
  seeded list/report windows do not drift empty over wall-clock time.
- Customer: `src/features/customer/` shares one create/edit dialog contract
  across customer and dealer flows. Official province/commune lookup, duplicate
  commune handling, bank/tax/account fields, parent dealer, explicit address
  clearing, and legacy address preservation align with the API.
- Notifications: the bell and `/thong-bao` share one seen-id store. Item/row
  activation opens repair detail. `/tin-tuc` uses authenticated real CRUD for
  list, search, create, and detail while seen/unseen notification state stays
  client-side.
- Operational layouts: repair, repair-KT, finance, warehouse, stock-out, HR,
  permissions, and reports reuse shared filter/table primitives while retaining
  their route-specific columns, actions, and mock domain behavior.
- Report pivots use deterministic mock dates and captured visible shapes. Exact
  Máy tồn bucket boundaries and the KPI `Lương`/`1 Ngày` workbook schemas remain
  evidence-gated; the two unverified export actions stay disabled.

## API Contracts

- `api/src/auth/`: 15-minute access JWT, 30-day httpOnly refresh-cookie
  rotation, reuse-family revocation, CSRF header on refresh/logout, forced first
  password change, locked-user handling, and rate limits.
- `api/src/crud/`: paged CRUD engine with explicit sort/filter/search allowlists,
  escaped wildcard search, Vietnamese text collation, stable database error
  mapping, write-time scope checks, and a public `pageSize` contract of `1..300`.
- `api/src/khach-hang/`: JWT branch union for reads, primary-branch stamping for
  creates, unauthorized branch rejection, normalized/legacy address
  compatibility, and bank/dealer name enrichment.
- `api/src/{nha-san-xuat,san-pham,model,ngan-hang}/`: authenticated global CRUD.
  Model validates both required parents and enriches parent names in batches.
- `api/src/nguoi-dung/`: admin-guarded CRUD with bcrypt-12 password hashing,
  exact allowlisted filters, and secret-free response projection.
- Eleven additional catalog endpoints retain legacy IDs and nullable PATCH
  semantics. The legacy repair-routing `phuong-xa` endpoint uses
  `phuong_xa_legacy`, avoiding collision with official geography.
- `api/src/dia-ly/`: public-data resource behind JWT, read-only
  `official-2025.07.01` snapshot with 34 provinces/cities and 3,321
  communes/wards/special zones.
- `api/src/tin-tuc/`: authenticated CRUD with server-stamped author and
  title/body validation.
- `api/src/health/`: public `/health` liveness plus `/health/ready` Postgres
  readiness with a three-second query timeout and `503` not-ready response.
- `api/src/config/`: fail-loud env validation, explicit CORS methods/headers,
  comma-separated origin normalization, and trusted-proxy/rate-limit settings.

## Data and Migrations

- `0000_omniscient_mesmero.sql`: baseline.
- `0001_cool_sunspot.sql`: catalogs, official geography, normalized customer
  fields, ICU collation, and unaccent support.
- `0002_backfill-khach-hang-address-codes.sql`: exact-signature, data-only
  backfill for frozen seed customers with one authoritative post-merger mapping;
  ambiguous legacy rows stay unchanged.
- `0003_masterdata_catalogs.sql`: remaining legacy catalog tables, including
  the isolated `phuong_xa_legacy` repair-routing catalog.
- `0004_tin_tuc.sql`: additive authenticated internal-news table used by the
  real `/tin-tuc` list, create, and detail flows.
- Seed remains idempotent, validates fixture FK closure/checksums/counts, stamps
  branch ownership, and forces seeded users to change the bootstrap password.
- The `0001` down script is not a safe rollback after `0002`; deployment uses
  application-only rollback or full backup restore.

Administrative source and checksums remain documented in
[`vietnam-administrative-data-provenance.md`](./vietnam-administrative-data-provenance.md).

## Deployment Contract

- `.github/workflows/deploy-pages.yml` uses Node 24, `npm ci`, hash routing, the
  GitHub Pages base path, and all 21 real resources.
- `VITE_API_URL` resolves from manual `api_url` for one run or persisted
  `vars.API_URL`. The manual input does not update the repository variable.
- Every workflow run validates the URL. Normal runs require public
  `/health/ready` plus a protected `tin-tuc` capability probe; the emergency
  override skips both API gates but still validates the URL.
- MacBook runtime uses Docker Postgres, host-run Nest API, two long-lived
  API/ngrok terminals, backups outside Git, and forward-only migrations.
  Postgres binds only to `127.0.0.1:5434`; the runbook requires the macOS
  firewall and forbids router forwarding for the host-run API.

See [`deployment.md`](./deployment.md) for first rollout, normal Git update,
tunnel rotation, troubleshooting, and restore procedures.

## Verification

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao,ngan-hang,dia-ly,tin-tuc npm run build:prod
npm run test:api:with-db
```

Final verified inventory:

- 214 Vitest files / 785 frontend tests.
- 16 Jest API suites / 115 tests.
- 223 Playwright cases across 3 specs, phone through 4K.

Playwright covers runtime route matrices, Tin Tuc/notification routes, mobile controls,
repair actions, large-screen dashboard composition, table-heavy horizontal
access, composite controls, date filters, export/print, and detail dialogs.

## References

- [Project README](../README.md)
- [API README](../api/README.md)
- [Deployment runbook](./deployment.md)
- [Architecture](../ARCHITECTURE.md)
