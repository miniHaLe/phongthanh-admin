# Codebase Summary

Updated: 2026-07-11

## Overview

Phong Thành Admin is a React 18 + Vite + TypeScript + Tailwind/shadcn admin app
with a NestJS + Postgres API under `api/`. Most frontend domains still use mock
client data; the Khách hàng resource can call the real API behind
`VITE_REAL_RESOURCES=khach-hang`.

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
- Dashboard: `src/pages/DashboardPage.tsx` caps and composes large-screen
  content with dashboard-local grid/height rules instead of global zoom.

## Backend

- `api/src/auth/` implements JWT access + httpOnly refresh rotation, CSRF guard
  on cookie routes, and session family reuse detection.
- `api/src/crud/` implements the generic CRUD engine with per-resource
  allowlists for sort/filter/search and branch scoping.
- `api/test/global-setup.ts` provisions `phongthanh_test` on compose Postgres,
  runs migrations, and seeds deterministic fixtures before Jest.

## Verification

Use the focused gates first, then broad gates:

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang npm run build:prod
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

`test:api:with-db` starts only compose Postgres and avoids committed secrets.
