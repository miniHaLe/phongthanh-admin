---
type: uiux-runtime-audit
date: 2026-07-10
app: phongthanh-admin
mode: audit-only
---

# UIUX Runtime Audit

## Summary

Audit scope: React/Vite admin UI, protected app routes through dev auth harness,
browser checks from 480p/mobile to 4K, existing unit/build gates, API package
build gates.

Result: app builds and the SPA routes render without uncaught runtime exceptions,
but mobile/touch ergonomics and 4K scaling are not production-polished. Dense
table pages avoid document-level horizontal scroll, but many filters/actions are
hidden inside internal scroll or below the fixed footer. Touch targets are too
small across every checked route.

## Evidence

- Runtime data: `plans/reports/260710-uiux-runtime-audit/runtime-audit-results.json`
- Screenshots: `plans/reports/260710-uiux-runtime-audit/screenshots/*-v3.png`
- Browser matrix: 375x812, 480x854, 768x1024, 1366x768, 1920x1080, 2560x1440, 3840x2160
- Route sweeps: 160 route/viewport checks, 80 routes at 480x854 and 80 routes at 1920x1080
- Interaction checks: login validation, command palette, topbar dropdowns, mobile drawer, CRUD sheet, repair row action

## Findings

### High - Mobile primary workflows are cramped / partially obscured

Evidence: `repair-list-phone-375-v3.png`, `dashboard-phone-375-v3.png`.

- Repair filter date range overflows its filter card at 375px.
- Footer occupies bottom space while page content/FAB remain active behind or against it.
- Dashboard KPI labels truncate heavily and trend copy stacks awkwardly.
- Source anchors: `src/components/shell/AppShell.tsx:48`, `src/components/shell/AppShell.tsx:54`, `src/components/shell/AppFooter.tsx:9`, `src/features/repair-list/RepairFilters.tsx:54`, `src/features/repair-list/RepairFilters.tsx:103`.

### High - Touch targets fail mobile standards across all checked routes

Evidence: runtime audit found tiny targets on 160/160 route checks.

Common causes:

- Shared checkbox is 16x16 with no expanded hit area: `src/components/ui/checkbox.tsx:14`.
- CRUD/action buttons use 28x28: `src/components/crud/CrudTablePage.tsx:148`, `src/components/crud/CrudTablePage.tsx:162`.
- Pagination icon buttons are 32x32: `src/components/shared/data-table/data-table-pagination.tsx:73`, `src/components/shared/data-table/data-table-pagination.tsx:88`.
- Topbar/mobile shell icon buttons are 36x36: `src/components/ui/button.tsx:29`.

### Medium - Inputs are below 16px on many mobile forms

Evidence: small inputs on 129/160 route checks.

Source causes:

- Base input is `text-base` only until overridden; many callers force `text-sm`.
- Repair filters force `h-8 ... text-sm`: `src/features/repair-list/RepairFilters.tsx:63`, `src/features/repair-list/RepairFilters.tsx:83`, `src/features/repair-list/RepairFilters.tsx:106`, `src/features/repair-list/RepairFilters.tsx:116`.
- Generic table search forces `text-sm`: `src/components/shared/data-table/data-table-toolbar.tsx:35`.

Impact: iOS can zoom form fields; desktop density is fine, mobile experience is not.

### Medium - 4K layout does not scale like a modern large-screen app

Evidence: `dashboard-desktop-4k-v3.png`, `repair-list-desktop-4k-v3.png`.

The UI keeps small 1080p density on a 3840px canvas. Text, nav, topbar controls,
charts, and tables are technically readable but visually underscaled. Dashboard
content spans very wide rows with large empty regions instead of using a
large-screen composition/max-width strategy.

Source anchor: `src/pages/DashboardPage.tsx:86`, `src/pages/DashboardPage.tsx:127`,
`src/components/dashboard/WorkQueueTiles.tsx:56`.

### Medium - News page has invalid nested buttons

Evidence: runtime console warning:
`validateDOMNesting(...): <button> cannot appear as a descendant of <button>`.

Source anchor: `src/pages/tin-tuc/TinTucPage.tsx:35` wraps a row in `<button>`,
then nests another `<Button>` at `src/pages/tin-tuc/TinTucPage.tsx:55`.

Impact: invalid HTML, inconsistent click/focus behavior, screen-reader ambiguity.

### Low - Command/modal primitives mostly work

Verified:

- Login empty submit shows both field errors.
- Command palette opens and searches.
- Topbar dropdown buttons click.
- Mobile drawer opens.
- CRUD Model sheet opens.
- Repair list first row action opens.
- Theme toggle cycles correctly when selected by its exact accessible label.

## Verification

Passed:

- `npm run type-check`
- `npm run lint` exits 0, warnings only
- `npm run test`: 126 files, 448 tests passed
- `npm run build`
- `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`
- `api`: `npm run lint`
- `api`: `npm run build`

Failed / blocked:

- `npm run build:prod` without env fails by design: missing `VITE_REAL_RESOURCES=khach-hang`.
- `api npm test` blocked: Postgres not listening on `127.0.0.1:5434`.
- `docker compose ps db` blocked before DB status: missing `INITIAL_ADMIN_PASSWORD`.
- Frontend test run logs Happy DOM iframe errors from OpenStreetMap iframe, despite exit 0.

## Design Assessment

Desktop admin density is modern enough for operational work: restrained palette,
Vietnamese font support, shadcn/Radix primitives, and consistent icons. It does
not read as old AdminLTE-style UI.

Weak points:

- Heavy default shadcn/table look; visually competent but not distinctive.
- Overuse of small text and small icon buttons in touch/mobile contexts.
- Mobile still behaves like compressed desktop, especially repair and table pages.
- 4K has no serious large-screen layout strategy.

## Unresolved Questions

- Should mobile table-heavy pages become card/list views, or is horizontal table
scroll accepted for operator workflows?
- Should 4K scale density up, or cap content width and keep dense desktop sizing?
- Can local API DB env be provided so `api npm test` can verify real backend flows?
