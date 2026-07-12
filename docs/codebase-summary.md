# Codebase Summary

Updated: 2026-07-12

## Overview

Phong Thành Admin is a React 18 + Vite + TypeScript + Tailwind/shadcn admin app
with a NestJS + Postgres API under `api/`. Most business domains still use mock
client data, including repair tickets. The release resources `khach-hang`,
`nha-san-xuat`, `san-pham`, `model`, `ngan-hang`, and `dia-ly` use the real API
when listed in `VITE_REAL_RESOURCES`; production requires all six. Dealer and
sales quick-create remain unchanged and out of scope.

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
- Model workflow: `src/features/model/` provides one relational catalog contract
  for the Model page and repair create. Manufacturer/product filters restrict
  model options; selecting a model synchronizes both parents; incompatible parent
  changes clear the selection. Both model editors expose Product, Manufacturer,
  Model name, and Note.
- Customer workflow: `src/features/customer/` shares create/edit fields across
  the customer page and repair quick-create. Address input uses Street,
  Province/City, and Commune/Ward; bank/tax/account fields persist through the
  real customer mutation. Commune search handles duplicate names and fills the
  province from the selected official code.
- Dashboard: `src/pages/DashboardPage.tsx` caps and composes large-screen
  content with dashboard-local grid/height rules instead of global zoom.

## Backend

- `api/src/auth/` implements JWT access + httpOnly refresh rotation, CSRF guard
  on cookie routes, and session family reuse detection.
- `api/src/crud/` implements the generic CRUD engine with per-resource
  allowlists for sort/filter/search and branch scoping.
- `api/src/{nha-san-xuat,san-pham,model,ngan-hang}/` exposes authenticated global
  CRUD resources. Model create/update validates both parent rows and list results
  are enriched with parent names without per-row queries.
- `api/src/dia-ly/` exposes the read-only `official-2025.07.01` snapshot: 34
  provinces/cities and 3,321 communes/wards/special zones.
- `api/src/khach-hang/` validates normalized address pairs, composes `diaChi`,
  enriches bank names, preserves leading account zeroes, and stamps new rows from
  JWT `branchIds[0]` rather than address.
- Migration `0001_cool_sunspot.sql` adds catalog/geography tables and customer
  columns. Its explicit down script removes only the new schema; legacy address
  columns and values remain untouched.
- `api/test/global-setup.ts` provisions `phongthanh_test` on compose Postgres,
  runs migrations, and seeds deterministic fixtures before Jest.

## Administrative Data

The frozen geography follows Decision 19/2025/QĐ-TTg, effective 2025-07-01.
Fixtures are validated by exact counts, parent closure, unique codes and pinned
SHA-256 values. Source and transformation details, including the official NSO
correction for code `24496`, are in
[`vietnam-administrative-data-provenance.md`](./vietnam-administrative-data-provenance.md).

## Verification

Use the focused gates first, then broad gates:

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang,nha-san-xuat,san-pham,model,ngan-hang,dia-ly npm run build:prod
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

`test:api:with-db` starts only compose Postgres and avoids committed secrets. The
feature verification passed 139 frontend files / 497 tests, 2 API suites / 35
tests, the guarded six-resource production build, fixture checksums, and focused
375px route smoke.
