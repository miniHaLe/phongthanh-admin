---
phase: 1
title: Protected Value And Composite Contract
status: completed
priority: P1
dependencies: []
---

# Phase 1: Protected Value And Composite Contract

<!-- Updated: Validation Session 1 - per-group sorting, stable IDs with migration, content-safe overflow, two-column grid -->

## Context Links

- [Plan](./plan.md)
- src/components/shared/data-table/data-table.tsx
- src/components/shared/data-table/data-table-column-config.tsx
- src/components/shared/data-table/use-table-state.ts
- tests/e2e/uiux-audit-helpers.ts

## Overview

Replace width-only clipping with explicit protected/descriptive rendering and
add shared support for composite groups, sort-only fields, and touch-safe headers.

## Requirements

- Functional: preserve scroll controls, focus, Home/End, arrows, density,
  selection, sorting, and existing callers without composite metadata.
- Functional: keep legacy sortable fields available even when their visible
  columns are consolidated.
- Non-functional: no protected value clips, wraps, or ellipsizes.
- Non-functional: no sortable header target below 44px on touch viewports.

## Architecture

- Remove blanket fit-mode overflow-hidden from TableCell.
- Add a content-safe table layout mode: auto table layout, route-defined minimum
  width, explicit column minimums, and no explicit maximums. Normal values fit;
  overlength protected content expands the inner table inside the scroll frame.
- Add shared cell primitives in
  src/components/shared/data-table/table-cell-content.tsx:
  - TableProtectedValue: no-wrap, tabular option, data-table-protected.
  - TableDescription: two-line clamp plus accessible full value.
  - TableMetaStack: shared grid using max-content labels and
    minmax(min-content, 1fr) values so protected content expands its track.
- Extend column metadata with presentation: visible or sort-only and optional
  composite sort options.
- Force sort-only columns hidden from rendering/config while retaining them in
  TanStack sorting state. Per-group composite headers expose accessible sort choices.
- Keep existing table IDs. Add a Zustand persist schema version/migrate function
  that translates known repair visibility keys to group keys, preserves density,
  and clears affected dormant columnOrder values without implementing ordering.
- Group visibility toggles the whole composite column; reset returns all groups.

## Related Code Files

- Create: src/components/shared/data-table/table-cell-content.tsx
- Create: src/components/shared/data-table/table-cell-content.test.tsx
- Create: src/components/shared/data-table/composite-sort-header.tsx
- Modify: src/components/shared/data-table/data-table.tsx
- Modify: src/components/shared/data-table/data-table.test.tsx
- Modify: src/components/shared/data-table/data-table-column-config.tsx
- Modify: src/components/shared/data-table/use-table-state.ts
- Modify: tests/e2e/uiux-audit-helpers.ts

## Implementation Steps

1. Add failing tests for protected-value markers/classes, sort-only rendering,
   group visibility/reset, density, and 44px sortable targets.
2. Remove blanket clipping from fit cells; keep overflow control inside explicit
   descriptive wrappers only.
3. Add shared protected, descriptive, and two-column metadata-grid primitives.
4. Add sort-only column metadata and ensure visible leaf counts, skeletons,
   colspans, and column config ignore sort-only columns.
5. Add per-group composite sort header/menu that updates hidden legacy sort IDs and
   communicates active direction with aria-sort and accessible labels.
6. Add the stable-ID visibility migration and test old repair states, density
   preservation, all-hidden child mapping, and dormant order clearing.
7. Add Playwright helpers asserting protected DOM values fit their own boxes;
   keep happy-dom tests limited to rendering, metadata, and class contracts.

## Todo List

- [x] Protected values have mechanical overflow assertions.
- [x] Descriptive clipping is explicit, not inherited from DataTable.
- [x] Sort-only columns remain sortable but never render.
- [x] Composite visibility and reset work after stable-ID state migration.
- [x] Sort controls pass mobile target and keyboard tests.

## Success Criteria

- Existing non-composite tables render unchanged.
- Unit tests prove TanStack default 150px sizing is never applied implicitly.
- Playwright protected-value checks fail when browser content is clipped.
- Sort-only columns preserve legacy sort IDs and do not consume width.

## Risk Assessment

- Hidden columns can pollute visible counts or persistence. Mitigate with explicit
  metadata filtering and tests for header/body/skeleton/empty/error states.
- Composite sort UX can become dense. Limit menus to groups with two or more
  legacy sort targets; preserve normal click sorting for single-target groups.
- Content-safe auto layout can exceed 1560px for exceptional data. Assert that
  only the inner table frame scrolls and document/main remain contained.

## Security Considerations

No auth or data boundary changes. Avoid placing sensitive values in new logs or
test artifacts.
