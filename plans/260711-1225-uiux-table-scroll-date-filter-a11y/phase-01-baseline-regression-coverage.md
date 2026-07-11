---
phase: 1
title: Baseline Regression Coverage
status: completed
priority: P1
dependencies: []
---

# Phase 1: Baseline Regression Coverage

## Overview

Add deterministic failing coverage for the current gaps before UI changes.
This phase proves the hidden horizontal overflow, missing table scroll access,
and date-filter ergonomics failures on affected routes.

## Requirements

- Functional: Playwright covers the affected table-heavy route inventory.
- Functional: Date filters can be focused, filled, and observed changing filter
  state or result count.
- Non-functional: Tests must be deterministic with current auth harness and mock
  data; no destructive production-like actions.

## Architecture

Extend `tests/e2e/uiux-audit-helpers.ts` with route-agnostic measurements:

- document overflow check, already present
- main overflow trap check, new
- table scroll-region check, new
- mobile filter control size check, broadened beyond the repair route
- safe interaction helper for date range fields

Keep route data in tests, not app code. Use `ROUTES` path literals only in tests
or import route constants if existing test setup supports aliases.

## Related Code Files

- Modify: `tests/e2e/uiux-runtime.spec.ts`
- Modify: `tests/e2e/uiux-audit-helpers.ts`
- Modify: `tests/e2e/uiux-viewports.ts` if route subsets need named matrices
- Create: `tests/e2e/uiux-table-heavy.spec.ts` if keeping the existing spec
  small is cleaner

## Tests Before

Expected red tests before fixes:

- Table-heavy routes fail `main.scrollWidth <= main.clientWidth + 1`.
- Routes with wide tables fail because no accessible scroll frame/control exists.
- Stock-out/warehouse date inputs fail mobile font-size checks due `h-8 text-sm`.

## Implementation Steps

1. Add `TABLE_HEAVY_ROUTES` covering the affected route inventory from `plan.md`.
2. Add `DATE_FILTER_ROUTES` for `/tai-chinh/thu-chi`,
   `/quan-ly-kho/ds-tra-lk`, `/quan-ly-kho/ds-tra-lk-xac`,
   `/quan-ly-kho/thu-hoi-lk`, `/xuat-kho/cap-linh-kien`,
   `/xuat-kho/ban-hang`, `/xuat-kho/tra-hang`, `/xuat-kho/chuyen-kho`.
3. Add helper `expectNoMainHorizontalOverflowTrap(page)`:
   measure `main.scrollWidth`, `main.clientWidth`, and fail when wide content is
   hidden by the shell instead of contained.
4. Add helper `expectAccessibleTableScrollRegion(page)`:
   require at least one visible table wrapper with an accessible name, keyboard
   focus, horizontal overflow when needed, and visible scroll controls when content
   exceeds the viewport.
5. Add helper `expectFilterControlsMobileSafe(page)`:
   reuse existing font/target checks after opening route filters.
6. Add date filter interaction tests:
   fill first visible "Từ ngày"/"Đến ngày" pair, assert values stick, active
   filter count or visible result state changes predictably, and the table does
   not become blank from a valid seeded range.
7. Capture screenshots for at least phone-480, desktop-1366, desktop-4k for
   table-heavy routes that had probe failures.

## Tests After

None in this phase. This phase intentionally establishes red coverage for later
phases.

## Regression Gate

```bash
npm run test:e2e:uiux -- --grep "table-heavy|date filter"
```

The focused gate should fail before phases 2-4 and pass after them.

## Success Criteria

- [ ] New Playwright coverage fails on current table overflow/date-filter issues.
- [ ] Failures identify route, viewport, and measured dimensions.
- [ ] No tests click destructive actions without a safe mocked confirmation path.
- [ ] Existing UIUX tests still run; only new assertions expose the current gaps.

## Risk Assessment

- Risk: overly strict pixel assertions create flaky tests. Mitigate with clear
  thresholds and route-specific evidence fields in failure output.
- Risk: browser-native date picker cannot be visually asserted in headless
  Chromium. Mitigate by testing focus/fill/state changes, not OS picker UI.
