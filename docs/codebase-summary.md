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
- Tables/workflows: `src/components/shared/data-table/`,
  `src/components/crud/`, and `src/features/repair-list/` provide dense desktop
  workflows plus mobile repair cards/actions for the audited repair list.
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
`plans/reports/260711-uiux-remediation-verification/screenshots/`.
`test:api:with-db` starts only compose Postgres and avoids committed secrets.
