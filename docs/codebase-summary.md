# Codebase Summary

Updated: 2026-07-15

## Overview

Phong Thành Admin is a React 18 + Vite + TypeScript + Tailwind/shadcn admin app
with a NestJS + Postgres + Drizzle API under `api/`. It is currently hybrid:
auth and 18 release resources use the real API, while most repair, warehouse,
finance, HR, permission-editing, and reporting workflows remain mock-backed.

The production release allowlist is:

```text
khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao
```

## Frontend

- Shell: `src/components/shell/` owns sidebar, drawer, topbar, footer, command
  palette, branch map modal, and protected route layout.
- Shared UI: `src/components/ui/` contains shadcn/Radix primitives with
  mobile-safe defaults and desktop density via responsive classes.
- Tables/workflows: `src/components/shared/data-table/` keeps the table frame as
  the horizontal-scroll owner and supports an opt-in `content-safe` auto layout.
  Explicit column sizes become minimums; protected identifiers, phone numbers,
  serials, dates, quantities, and currency expand the inner table instead of
  wrapping or clipping, while descriptive prose uses an explicit two-line clamp.
- Composite tables: repair, repair-KT, Thu/Chi, and five warehouse routes render
  legacy fields in shared two-column label/value groups within a 1560px default
  composition. Hidden `sort-only` columns retain field-level sort IDs, and each
  visible group exposes accessible sort choices without consuming table width.
- Table preferences: composite group visibility and density remain keyed by
  stable table IDs. The persisted Zustand migration translates legacy
  `repair-list` visibility keys to group keys, preserves density, and removes
  replaced IDs from dormant column-order state.
- CRUD and repair workflows: `src/components/crud/` and
  `src/features/repair-list/` preserve existing selection, pagination, filters,
  exports, actions, dialogs, and the repair mobile-card path.
- API selection: `src/api/api-for.ts` chooses the HTTP or mock implementation per
  resource. `src/hooks/use-lookup.ts` loads all lookup pages, caches rows and ID
  maps with TanStack Query, and shares invalidation with CRUD/custom create paths.
  Generic CRUD fields and filters can also load options asynchronously.
- Sync behavior: customer, product, and quick-create mutations now use their
  selected API implementation instead of writing real-resource mock arrays.
  Real customer persistence and newly created warehouse dropdown visibility were
  verified against a throwaway Postgres database in a live browser session.
- Dashboard: `src/pages/DashboardPage.tsx` caps and composes large-screen
  content with dashboard-local grid/height rules instead of global zoom.

## Backend

- `api/src/auth/` implements JWT access + httpOnly refresh rotation, CSRF guard
  on cookie routes, and session family reuse detection.
- `api/src/crud/` implements the generic CRUD engine with per-resource
  allowlists for sort/filter/search, optional response projection/write guards,
  audit stamping, branch scoping, and Vietnamese database error mapping.
- `nguoi-dung` supports real list/get/create/update/delete. Writes require the
  interim server-side `superScope` check; passwords are bcrypt-12 hashes, new
  admin-created users can log in immediately with `mustChangePassword=false`, and
  password material is never serialized. `nhom-quyen` is real but read-only.
- Migration `0001_masterdata_catalogs.sql` adds 14 catalog tables. Together with
  the existing `chi_nhanh` table, these expose 15 real catalog/branch resources.
  Frozen JSON fixtures preserve legacy IDs; seed order and FK closure cover the
  full dependency graph, and repeated-seed tests prove idempotent table counts.
- Nullable PATCH inputs preserve omission as no-op and map explicit blank/null to
  SQL `NULL` only for nullable fields. Generated non-null warehouse codes remain
  protected from null clearing.
- `api/test/global-setup.ts` provisions `phongthanh_test` on compose Postgres,
  runs migrations, and seeds deterministic fixtures before Jest.

## Voucher Codes

New mock/module-memory voucher create paths use `PREFIX-yyyymm-N`, where the
ordinal is independent per prefix and calendar month. Current prefixes are PSC,
PBH, PTH, PCK, PCH, PNK, PTT, and PCC. Legacy seed codes are ignored by the new
sequence scan and remain unchanged. Concurrency-safe server-side generation is
deferred until the corresponding repair/warehouse/finance endpoints move to the
real backend.

## Deferred Work

- Full RBAC matrix persistence and `PermissionGuard` enforcement; current
  permission screens remain UI-only and `superScope` is an interim user-write seam.
- Real HR, menu/chuc-nang, repair, warehouse-ledger, finance, and report APIs.
- `CURRENT_USER` removal and the bigint/money JSON-string contract migration.

## Verification

Use the focused gates first, then broad gates:

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao npm run build:prod
npm run test:api:with-db
```

`test:e2e:uiux` writes screenshots to
`plans/260711-1527-responsive-table-1080p-fit/reports/screenshots/`.
Unit tests cover protected/descriptive cell primitives, sort-only rendering,
composite sort headers, field preservation, and persisted repair-state
migration. Playwright's `uiux-table-heavy.spec.ts` checks table access,
protected-value fit, touch targets, and 1920x1080 frame fit across the viewport
matrix; `uiux-composite-table-contracts.spec.ts` adds all-route collapsed-sidebar
fit, synthetic overlength bounded scrolling, dark/focus, export/print, and detail
dialog contracts.

Root Vitest explicitly excludes `api/**`; database-backed API behavior belongs to
API Jest. `test:api:with-db` starts only compose Postgres, avoids committed
secrets, and runs API lint/build plus all DB suites.

`build:prod` requires all 18 release resources. The guard rejects
`ALLOW_MOCK_BUILD=1` when invoked with `--prod` or `NODE_ENV=production`; the
override remains available only for non-production previews. Final 2026-07-15
verification passed 507 frontend tests, 74 API tests, the full production build,
the missing-resource negative probe, and the production-override negative probe.
