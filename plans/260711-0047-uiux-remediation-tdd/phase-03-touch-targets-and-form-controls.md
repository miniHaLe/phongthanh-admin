---
phase: 3
title: Touch Targets and Form Controls
status: completed
priority: P1
dependencies:
  - 1
  - 2
---

# Phase 3: Touch Targets and Form Controls

## Overview

Fix systemic small controls by updating shared primitives and table controls before per-page polishing.

## Requirements

- Functional: mobile buttons, icon buttons, checkboxes, pagination, table actions, search fields, inputs, and selects meet touch/font thresholds.
- Non-functional: desktop density remains compact; responsive sizing is centralized; focus-visible states stay obvious.

## Architecture

Use mobile-first sizing in shared primitives and override call sites that force `h-7`, `h-8`, `text-xs`, or `text-sm` on mobile. Preserve dense desktop through `md:` variants.

## Related Code Files

- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/checkbox.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/radio-group.tsx` if present and used
- Modify: `src/components/ui/switch.tsx` if present and used
- Modify: `src/components/crud/CrudTablePage.tsx`
- Modify: `src/components/shared/data-table/data-table-pagination.tsx`
- Modify: `src/components/shared/data-table/data-table-toolbar.tsx`
- Modify: `src/features/repair-list/RepairFilters.tsx`
- Create or modify: focused primitive tests under `src/components/ui/*.test.tsx`
- Modify: `tests/e2e/uiux-runtime.spec.ts`

## Tests Before

1. Add Vitest/Testing Library checks for default primitive class contracts:
   - buttons expose mobile minimum size classes
   - checkbox has visible box plus expanded hit target or label pattern
   - input keeps `text-base` on mobile
2. Add Playwright assertions that current routes fail:
   - no focusable/clickable target below `44x44` on mobile, except explicit inline text links with equivalent spacing
   - computed input/select/search font size `>=16px` below `768px`
   - icon-only controls have accessible names

## Refactor

1. Adjust `buttonVariants` sizes to mobile-safe defaults with desktop density variants.
2. Adjust input/select/search sizing so caller `text-sm` does not win on mobile.
3. Expand checkbox hit area without visually bloating dense tables.
4. Replace CRUD action `h-7 w-7` and pagination `h-8 w-8` with responsive sizes.
5. Audit call sites with `rg "h-[78]|text-xs|text-sm|size=\"icon\"|size=\"sm\""` and fix high-risk controls.

## Tests After

1. Run focused primitive/component tests.
2. Run `npm run test:e2e:uiux` for touch/font metrics.
3. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Write failing tests for current primitives and route metrics.
2. Update primitives and shared table controls.
3. Fix repair/table call sites that override mobile-safe sizing.
4. Re-run metrics and shrink the known-failure list.
5. Review desktop screenshots to ensure dense operator workflow remains intact.

## Success Criteria

- [x] Touch target audit no longer fails globally across route checks.
- [x] Mobile input/select font-size audit passes on the measured routes.
- [x] Icon-only controls have `aria-label`, visible text, or an equivalent accessible name.
- [x] Desktop table density remains visually comparable to current app.

## Risk Assessment

- Risk: shared primitive changes can enlarge desktop tables too much. Mitigation: use responsive classes and desktop-specific dense sizes.
- Risk: checkbox hit area changes can break table row selection. Mitigation: add table selection regression tests.
