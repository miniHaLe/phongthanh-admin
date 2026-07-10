---
phase: 4
title: Repair and Table Mobile Workflows
status: completed
priority: P1
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Repair and Table Mobile Workflows

## Overview

Repair the highest-risk mobile workflows: repair filters, advanced filters, saved views, row actions, bulk actions, and generic table affordances.

## Requirements

- Functional: repair filter date range does not overflow; filters are easy to reach; row actions are usable by touch; table pagination/search/bulk actions remain discoverable.
- Non-functional: keep desktop table workflows; mobile behavior should be purpose-built, not a compressed desktop table.

## Architecture

Default approach: keep desktop DataTable. On mobile, stack filters into a stable grid and expose row/card action summaries for the repair list plus generic CRUD actions where shared table templates currently force tiny controls.

## Related Code Files

- Modify: `src/features/repair-list/RepairFilters.tsx`
- Modify: `src/features/repair-list/RepairFiltersAdvanced.tsx`
- Modify: `src/features/repair-list/RepairListPage.tsx`
- Modify: `src/features/repair-list/components/repair-batch-toolbar.tsx`
- Modify: `src/features/repair-list/hooks/use-repair-table-columns.tsx`
- Modify: `src/components/shared/data-table/data-table.tsx`
- Modify: `src/components/shared/data-table/data-table-toolbar.tsx`
- Modify: `src/components/shared/data-table/data-table-pagination.tsx`
- Modify: `src/components/crud/CrudTablePage.tsx`
- Modify: existing repair/table tests under `src/features/repair-list/**` and `src/components/shared/data-table/**`
- Modify: `tests/e2e/uiux-runtime.spec.ts`

## Tests Before

1. Add Playwright tests for `/sua-chua-bao-hanh` at `375x812`, `480x854`, and `854x480`:
   - date range stays inside filter container
   - advanced filters open/close and all first-screen controls remain reachable
   - saved views and clear filter are reachable
   - first row/card action opens the expected action UI
   - bulk select/action path works by touch
2. Add DataTable component tests for mobile action rendering if a shared mobile row/action pattern is introduced.

## Refactor

1. Rework repair filter layout with mobile-first grid/stack rules.
2. Make date range two full-width date fields on narrow screens.
3. Use a compact action menu or card action strip for mobile row operations.
4. Keep pagination/search layout stable at mobile width.
5. Ensure all controls use Phase 3 touch/font contracts.

## Tests After

1. Run focused repair-list and data-table tests.
2. Run `npm run test:e2e:uiux` on mobile and desktop projects.
3. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Write failing repair/table workflow tests.
2. Refactor repair filters and action access.
3. Refactor shared table toolbar/pagination only where needed.
4. Validate CRUD pages that use `CrudTablePage`.
5. Remove fixed audit failures from baseline list.

## Success Criteria

- [x] Repair filter area has no horizontal overflow or cramped date range at mobile widths.
- [x] All primary repair actions are reachable with one or two clear taps.
- [x] Generic CRUD edit/delete controls meet touch target and accessible-name requirements.
- [x] No desktop regression in table density, sorting, pagination, or CRUD sheet behavior.

## Risk Assessment

- Risk: mobile card/action summary may diverge from table columns. Mitigation: derive labels/actions from existing column/action config where possible.
- Risk: broad DataTable changes affect many pages. Mitigation: focus tests on shared DataTable plus representative CRUD, repair, finance, and warehouse pages.
