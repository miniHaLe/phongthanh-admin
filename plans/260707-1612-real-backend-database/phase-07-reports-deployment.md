---
phase: 7
title: "Reports + deployment"
status: pending
priority: P1
dependencies: [3, 4, 5, 6]
---

# Phase 7: Reports + deployment

## Overview

Final phase: back the 6 reports with real read-side SQL aggregations over the now-real
tables (no new base tables), remove the last mock dependencies, and deploy the full-real
stack (web + api + Postgres) to a hosting target with CI/CD, migrations, and seeding.

## Requirements

- Functional: the 6 reference reports (tình trạng KT, tình trạng chung, máy tồn, KPI KTV,
  KPI tiếp nhận, SCBH KT) read real aggregations feeding the existing chart shapes;
  Doanh Thu/Xuất Kho extras kept; the app runs fully-real end-to-end; deployed + reachable.
- Non-functional: reports are read-only queries/views (confirmed — no new tables); the
  "plausible-mock report columns" honesty flag is RESOLVED (now real); deployment is
  reproducible (migrations + seed on fresh DB); secrets managed; CI runs both test suites.

## Architecture

**Reports = SQL aggregation over real tables** (verified: no new base entities):
- Tình trạng KT / chung: `GROUP BY trang_thai_id` (+ per-technician / NSX) over
  `phieu_sua_chua` → the 15-status column/pie chart shapes.
- Máy tồn: aggregation over `stock_period_snapshot` / `stock_movement` (P5).
- KPI KTV / Tiếp nhận: aggregation over repair + dispatch (P4) by technician / receiver.
- SCBH KT: warranty-cost aggregation per technician over repair + finance (P4/P6).
Each returns the exact result shape the existing report pages + Recharts already consume.
The tri-mode (Day/Month/Year) period filter maps to SQL date-trunc grouping.

**Deployment (validation-locked: single VPS + docker-compose).**
<!-- Updated: Validation Session 1 - hosting = VPS + docker-compose --> One VPS running
`docker-compose`: api (NestJS) + Postgres + nginx (serving the built SPA + reverse-proxying
`/api`). Secrets via the host's env / a gitignored `.env` on the box (not committed). TLS via
nginx + Let's Encrypt. Postgres data on a named volume with a backup cron. This is the target;
no multi-target abstraction.
- CI/CD: run the (re-baselined) frontend suite + backend test suites + per-resource MSW
  contract tests on PR; on main, build web, run migrations, deploy api, deploy web. A
  build guard blocks a prod build unless `VITE_REAL_RESOURCES` covers the release's
  resources (Finding 7 — no partially-enforced deploy).
- Migrations + seed run on a fresh DB reproducibly; the super-admin + reference lookups
  seed so the app is usable immediately.
- Secrets: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` via the host's secret store,
  never committed.

## Related Code Files

- Create: `api/src/reports/**` (aggregation query services + controllers,
  permission-gated + branch-scoped); CI workflow (`.github/workflows/*`); deploy config
  (`docker-compose.yml` + nginx conf + TLS/Let's Encrypt); production `.env` template +
  secret docs; a Postgres backup cron.
- Modify: `src/mock/reports/*` + report page fetchers → `apiFor`/real report endpoints;
  set `VITE_REAL_RESOURCES` to ALL (remove the mock fallback for shipped resources);
  README/ARCHITECTURE + docs (the app is no longer mock-only — update the honesty flags).
- Reference (read-only): `src/mock/reports/*`, report pages, entity map §reports.

## Implementation Steps

1. **TDD — report aggregations:** for a seeded dataset, assert each report query returns
   the expected counts/shape the chart consumes (e.g. status distribution sums to the
   ticket count; KPI per-technician totals match).
2. **Report query services + controllers;** wire the report pages to real endpoints.
3. **Remove mock fallback** for all migrated resources; confirm nothing imports mock data
   at runtime (grep); keep seed arrays only as seeders/fixtures.
4. **Deployment target** decision + config; migrations + seed reproducible on fresh DB.
5. **CI/CD:** both test suites on PR; deploy pipeline on main.
6. **Docs update (per release, truthfully):** README + ARCHITECTURE + the comparison
   doc-set honesty flags. In **v1** the mock-only (#1) and no-enforcement (#2) limitations
   are resolved **for auth + RBAC + CRUD + repair**; warehouse + finance remain mock (state
   that plainly — do not claim them resolved until v2). In **v2** mark warehouse + finance
   resolved. Never label a still-mock surface as shipped.
7. **Full-real E2E gate:** the whole app runs against Postgres with zero mock resources;
   the re-baselined frontend suite + MSW contract tests + backend suites green; deployed
   instance reachable + seeded.

## Success Criteria

- [ ] 6 reports (+ 2 extras) read real aggregations; charts render real data; report-col
      honesty flag resolved.
- [ ] Reports are read-only queries/views — no new base tables.
- [ ] `VITE_REAL_RESOURCES` = all; no runtime mock imports remain; seed arrays are
      fixtures-only.
- [ ] Migrations + seed reproducible on a fresh DB; super-admin + lookups seeded.
- [ ] CI runs both suites; deploy pipeline ships web + api + Postgres; instance reachable.
- [ ] Secrets managed via host store; none committed.
- [ ] Docs updated: mock-only + no-enforcement limitations marked resolved (truthfully).
- [ ] Full-real E2E: app works end-to-end against Postgres; re-baselined frontend + MSW
      contract + backend suites green.

## Risk Assessment

- **Report query performance** → index the group-by columns; snapshot tables (P5) keep
  máy-tồn cheap; add query timeouts.
- **Stale "mock/prototype" docs** → the doc-set + README explicitly claim mock-only; a
  checklist item forces updating every honesty-flag surface once shipped (don't ship a
  real product still labelled a prototype).
- **Deploy secret leakage** → secret store only; a pre-deploy scan for committed secrets.
- **Fresh-DB reproducibility** → CI spins a clean Postgres, runs migrations + seed, and
  runs the backend suite against it — proves reproducibility every build.
- **"Big flip" regressions** → the dual-run flag means resources flipped incrementally
  across P1-P6; P7 only removes the fallback after each was individually green.
