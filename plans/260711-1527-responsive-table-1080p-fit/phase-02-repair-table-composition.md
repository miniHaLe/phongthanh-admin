---
phase: 2
title: Repair Composite Composition
status: completed
priority: P1
dependencies: [1]
---

# Phase 2: Repair Composite Composition

<!-- Updated: Validation Session 1 - stable repair table ID, visibility migration, per-group sort menus, two-column grid -->

## Context Links

- [Plan](./plan.md)
- [Shared contract](./phase-01-baseline-and-shared-contract.md)
- src/features/repair-list/hooks/use-repair-table-columns.tsx
- src/features/repair-kt/hooks/use-repair-kt-columns.tsx

## Overview

Consolidate repair and repair-KT metadata into readable groups, freeing enough
width for full ticket IDs, phones, serials, dates, currency, statuses, and actions.

## Requirements

- Keep all repair values, dialogs, mutations, links, filters, exports, selection,
  server sort fields, pagination, and mobile cards.
- Status and action controls remain fully visible; labels use at most two lines.
- Default visible composition remains at or below 1560px.

## Architecture

### Repair List Visible Groups

| Group | Fields / behavior |
|---|---|
| Select | Existing page selection checkbox |
| Status | Full status badge; protected two-line maximum |
| Actions | All existing icon actions and tooltips |
| Ticket refs | Repair ticket, manufacturer ticket, dealer ticket |
| Customer | Name, protected phone, address, map/location actions |
| Product | Product name, protected serial, dealer, prior-repair warning |
| Assignment | Technician dispatch controls, repair form, warranty type, area |
| Cost | Full VND value, tabular protected text |
| Timeline | Received, completed, repaired, delivered, TAT/dwell; sort menu keeps ngayNhan and ngayHoanThanh |
| Notes | Fault and resolution descriptions |
| Receiver | Receiver name |

### Repair-KT Visible Groups

Use the same identity/customer/product/timeline grammar. Keep KT photo/detail
actions, technician, repair type, cost, repair detail, notes, receiver, and area.
Sort-only columns preserve any legacy sortable field IDs. Composite metadata
uses the shared two-column label/value grid.

## Related Code Files

- Modify: src/features/repair-list/RepairListPage.tsx
- Modify: src/features/repair-list/hooks/use-repair-table-columns.tsx
- Modify: src/features/repair-list/components/row-actions-cell.tsx
- Modify: src/features/repair-list/components/dispatch-cell.tsx
- Modify: src/features/repair-list/hooks/use-repair-table-columns.test.tsx
- Modify: src/features/repair-kt/RepairKtListPage.tsx
- Modify: src/features/repair-kt/hooks/use-repair-kt-columns.tsx
- Create/modify: focused repair-KT column tests adjacent to the hook

## Implementation Steps

1. Add route tests that enumerate every field before consolidation and prove the
   composite result still renders each value/action.
2. Keep the repair table ID stable, update column-config labels to group IDs,
   and define the old-field-to-group visibility migration. A group remains visible
   unless every mapped legacy child was explicitly hidden.
3. Build repair composite cells using shared protected/description/meta helpers.
4. Add sort-only legacy columns and per-group timeline/status sort menus.
5. Allocate widths from measured fixture content, including cell padding; do not
   use blanket clipping to meet budget.
6. Make status badges deliberately one/two line and action/dispatch labels nowrap.
7. Keep RepairMobileCards markup and actions unchanged; add explicit regression
   tests for selection, detail navigation, and row actions below 768px.

## Todo List

- [x] Every old repair field appears in a visible composite group.
- [x] All old sort targets remain selectable.
- [x] Ticket, phone, serial, dates, and cost pass protected overflow assertions.
- [x] All modals and dispatch actions remain reachable.
- [x] Mobile cards remain unchanged and tested.

## Success Criteria

- Repair and repair-KT fit the expanded and collapsed 1080p frames.
- No status label exceeds two lines or fragments word-by-word.
- Protected values are fully visible at comfortable and compact density.
- Selection, visibility/reset, sort, pagination, filters, links, and dialogs pass.

## Risk Assessment

- Composite rows can become too tall. Cap descriptions at two lines and use
  compact metadata labels; protected lines remain single-line.
- Group visibility changes preference granularity. The explicit migration keeps
  density, avoids accidental data hiding, and clears unused old column order.

## Security Considerations

No authorization or mutation-contract changes. Preserve existing modal guards and
route navigation behavior.
