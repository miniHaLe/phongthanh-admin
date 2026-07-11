---
title: UIUX Table Scroll And Date Filter Accessibility Remediation
description: >-
  Fix uncovered table-heavy route overflow, non-trackpad horizontal table
  access, and mobile date-filter ergonomics with tests-first gates.
status: completed
priority: P1
branch: ''
tags:
  - bugfix
  - frontend
  - uiux
  - accessibility
  - testing
blockedBy: []
blocks: []
created: '2026-07-11T05:25:45.009Z'
createdBy: 'ck:plan'
source: skill
---

# UIUX Table Scroll And Date Filter Accessibility Remediation

## Overview

Follow-up to completed `plans/260711-0047-uiux-remediation-tdd/plan.md`.
The previous UIUX pass verified shell/mobile/dashboard/repair basics, but table-heavy
finance, warehouse, stock-out, and repair-KT routes still have hidden wide content,
mouse-inaccessible horizontal scroll, and compact date filters that render too small
on mobile.

No implementation in this plan. Execution must write failing Playwright/Vitest
coverage first, then make scoped UI changes, then run broad frontend/API gates.

## Scope Challenge

- Existing code: `DataTable` already owns TanStack table rendering and the app has
  mobile-safe global input rules. `AppShell` hides page-level horizontal overflow,
  so wide page wrappers become inaccessible instead of scrollable.
- Minimum changes: add shared bounded table scroll affordances, move route-level
  `min-w[...]` from outer wrappers to table content, normalize compact filter
  controls on mobile, and broaden Playwright coverage to the missed routes.
- Complexity: touches more than 8 files because the same wrapper/date-filter
  pattern repeats. Keep this as one shared table fix plus narrow page applications.
- Selected mode: hold scope, TDD-first. No decorative redesign.

## Source Evidence

- Prior completed plan: `plans/260711-0047-uiux-remediation-tdd/plan.md`
- Prior verification report: `plans/reports/260711-uiux-remediation-verification/report.md`
- Existing UIUX route matrix: `tests/e2e/uiux-runtime.spec.ts` covers dashboard,
  repair, news, customers only.
- Shell overflow owner: `src/components/shell/AppShell.tsx` uses
  `overflow-x-hidden` on the shell and main content.
- Shared table owner: `src/components/shared/data-table/data-table.tsx`
  has an `overflow-x-auto` container but no visible scroll controls or inner
  min-width contract.
- Repeated wide wrappers found by `rg "min-w-\\[[0-9]+px\\]"` under:
  repair-KT, finance thu-chi, warehouse, and stock-out pages.
- Repeated compact filter controls found by `rg "className=\"h-8 text-sm\"|type=\"date\""`
  under stock-out, warehouse, and finance filters.
- Targeted probe showed `main.scrollWidth` much larger than viewport while document
  overflow stayed hidden, e.g. `/tai-chinh/thu-chi` phone `1732` vs `480`,
  `/quan-ly-kho/ton-kho` phone `1232` vs `480`, `/xuat-kho/chuyen-kho`
  phone `1432` vs `480`.

## Acceptance Criteria

- Table-heavy routes expose all columns through a bounded table scroll region at
  `375`, `480`, `854x480`, `768`, `1366`, `1920`, `2560`, and `3840` widths.
- Users without a trackpad can scroll wide tables with visible mouse/touch controls
  and keyboard focus. Horizontal scrollbars remain available when the OS shows them.
- `document.documentElement.scrollWidth <= clientWidth + 1`; no hidden page-level
  overflow is required to reach table columns.
- `main.scrollWidth` does not exceed `main.clientWidth + 1` because wide content
  is contained inside table scroll frames.
- Mobile filter inputs/select triggers/date fields render at `>=16px` font and
  `>=44px` target height while desktop keeps compact admin density.
- Date filters are focusable, fillable/clickable, update filter state, and do not
  leave affected tables incorrectly empty unless the selected range truly has no rows.
- Table and filter text does not clip inside narrow boxes; descriptions/buttons
  wrap or get wider instead of covering adjacent content.
- The UI stays a dense modern admin interface: no hero sections, no marketing cards,
  no decorative gradients/orbs, no nested cards, no visible instructional copy.
- API behavior is unchanged. `npm run test:api:with-db` still passes.

## Affected Route Inventory

| Area | Routes |
|---|---|
| Repair KT | `/sua-chua-bao-hanh-kt` |
| Finance | `/tai-chinh/thu-chi`, plus `/tai-chinh/cong-no` date regression smoke |
| Warehouse | `/quan-ly-kho/ton-kho`, `/quan-ly-kho/ton-kho-lk-xac`, `/quan-ly-kho/ton-kho-ky-thuat`, `/quan-ly-kho/nhap-kho`, `/quan-ly-kho/ds-tra-lk`, `/quan-ly-kho/ds-tra-lk-xac`, `/quan-ly-kho/thu-hoi-lk` |
| Stock-out | `/xuat-kho/cap-linh-kien`, `/xuat-kho/ban-hang`, `/xuat-kho/tra-hang`, `/xuat-kho/chuyen-kho` |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Baseline Regression Coverage](./phase-01-baseline-regression-coverage.md) | Completed |
| 2 | [Shared Accessible Table Scroll Frame](./phase-02-shared-accessible-table-scroll-frame.md) | Completed |
| 3 | [Apply Table Wrapper Fixes](./phase-03-apply-table-wrapper-fixes.md) | Completed |
| 4 | [Date Filter Mobile Ergonomics](./phase-04-date-filter-mobile-ergonomics.md) | Completed |
| 5 | [Full Cross Resolution Verification](./phase-05-full-cross-resolution-verification.md) | Completed |

## Dependencies

- Completed prior plan: `plans/260711-0047-uiux-remediation-tdd/plan.md`
  is evidence only, not a blocker.
- No unfinished local `plans/*/plan.md` files found during pre-creation scan.
- Uses current frontend stack from `README.md`: React 18, Vite, TypeScript,
  Tailwind v3, shadcn/Radix, Playwright, Vitest.

## Not In Scope

- Broad visual redesign of the admin app.
- Replacing every native date input with a custom calendar system unless tests
  prove native inputs cannot meet access/focus requirements.
- Backend/API contract changes.
- Removing operator table density on desktop.
- Mocking API success or weakening existing gates.

## Execution Rules

- Tests before fixes in every implementation phase.
- Prefer existing shared primitives and local route constants.
- Keep page edits mechanical: remove unsafe outer `min-w[...]`, pass width to
  shared table content, preserve columns/actions/data behavior.
- Do not remove `AppShell` overflow policy as the primary fix; contain wide
  content locally instead.
- Do not add visible help text that explains how to use scroll controls. Use
  recognizable icons, tooltips/ARIA labels, and visible focus states.

## Validation Gates

Run focused gates first, then broad gates:

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
npm run build
env VITE_REAL_RESOURCES=khach-hang npm run build:prod
npm run test:api:with-db
```

Expected report path after implementation:
`plans/260711-1225-uiux-table-scroll-date-filter-a11y/reports/verification-report.md`

## Open Questions

None blocking. Default assumption: keep native date inputs when they pass
focus/fill/mobile-size tests; use the existing `PeriodRangePicker` pattern only
for pages where a native pair still fails practical access.
