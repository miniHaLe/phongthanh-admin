---
phase: 5
title: Full Cross Resolution Verification
status: completed
priority: P1
dependencies:
  - 2
  - 3
  - 4
---

# Phase 5: Full Cross Resolution Verification

## Overview

Run the full UIUX/API verification pass after fixes, inspect responsive screenshots,
and write the implementation verification report.

## Requirements

- Functional: All buttons/functions covered by existing and new safe UIUX flows
  pass on the affected routes.
- Functional: API/build/test gates from README still pass.
- Non-functional: Visual review confirms no cramped boxes, covered descriptions,
  overlapping controls, or old-style/sloppy redesign artifacts.

## Architecture

Use automated gates plus targeted screenshot review:

- Playwright route matrix: affected table-heavy pages across mobile to 4K.
- Safe interaction sweep: non-destructive buttons, filter toggles, menus, row
  action open/close dialogs, pagination, sorting, scroll controls.
- API verification: no API code expected to change, but run real DB-backed API
  test suite to satisfy release confidence.
- Report results plan-scoped under `reports/`.

## Related Code Files

- Modify: `tests/e2e/uiux-runtime.spec.ts`
- Modify/create: `tests/e2e/uiux-table-heavy.spec.ts`
- Modify: `tests/e2e/uiux-audit-helpers.ts`
- Create: `plans/260711-1225-uiux-table-scroll-date-filter-a11y/reports/verification-report.md`
- Optional modify: `docs/codebase-summary.md` only if test commands or shared
  UI contracts materially change for future maintainers.

## Implementation Steps

1. Run focused gates from phases 2-4 until green.
2. Run broad frontend gates:
   `npm run type-check`, `npm run lint`, `npm run test`,
   `npm run test:e2e:uiux`, `npm run build`.
3. Run release/API gates:
   `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`,
   `npm run test:api:with-db`.
4. Review screenshots for:
   mobile 375/480, landscape 854, tablet 768, desktop 1366/1920, 2560, 4K.
5. For affected routes, verify:
   table columns reachable without trackpad, no horizontal page overflow,
   no text clipping, no button/description overlap, date filters open/fill,
   filter clear works, row dialogs/action menus remain usable.
6. Check accessibility basics:
   focus rings visible, controls named, scroll buttons keyboard reachable,
   no nested interactive controls introduced, console has no unexpected errors.
7. Save verification report with commands, results, screenshots path, residual
   risks, docs impact, and unresolved questions.

## Success Criteria

- [x] All focused Playwright table/date tests pass.
- [x] `npm run test:e2e:uiux` passes across the mobile-to-4K matrix.
- [x] Type-check, lint, Vitest, build, prod real-resource build, and API DB tests pass.
- [x] Screenshot review finds no cramped/covered components on affected pages.
- [x] Verification report written under this plan's `reports/` directory.
- [x] Docs impact evaluated and updated only if needed.

## Risk Assessment

- Risk: full UIUX suite grows slow. Mitigate by keeping exhaustive checks on
  affected route subsets and using broad smoke for the rest.
- Risk: API DB test environment leaves Docker running. Mitigate by documenting
  container state in the report, matching prior report practice.
