---
phase: 3
title: Inventory And Finance Composite Composition
status: completed
priority: P1
dependencies: [1]
---

# Phase 3: Inventory And Finance Composite Composition

<!-- Updated: Validation Session 1 - stable table IDs, per-group sorting, two-column grids, bounded overlength scrolling -->

## Context Links

- [Plan](./plan.md)
- [Shared contract](./phase-01-baseline-and-shared-contract.md)
- src/features/warehouse/issued-usage-table-columns.tsx
- src/pages/tai-chinh/ThuChiPage.tsx

## Overview

Replace high-column-count warehouse and finance tables with composite operational
groups while retaining every value, filter, export field, action, and sort target.

## Requirements

- Protected stock/document/date/serial/currency values fully visible.
- Export spreadsheets keep current separate columns and ordering.
- Existing filters, KPI calculations, pagination, selection, approvals, prints,
  detail modals, and mutations remain unchanged.
- Every route stays within 1560px at default/reset state.

## Architecture

### Stock / Confirmed Stock

- Index + actions: ordinal and update/detail actions.
- Location: branch, warehouse, compartment.
- Item identity: stock code, item name, group, model, manufacturer, serial flag.
- Opening: opening cost and quantity.
- Movement: period receipts and issues.
- Closing: stock, ending quantity, period cost, total where applicable.
- Period: period label.

### Issued Parts

- Status/actions, Voucher refs, Item identity, Location, Assignment, Issue,
  Delivery, Recovery, Detail.
- Voucher refs keep issue/repair/manufacturer numbers and ticket status text.
- Item identity keeps code/name/model/serial/manufacturer.
- Issue/recovery groups keep dates, users, and quantities as protected lines.

### Returned Parts / Confirmed Returned Parts

- Returned: Select/index, Status/action, Item identity, Voucher refs, Assignment,
  Created, Approved.
- Confirmed returned: Select/index, Status/tracking, Voucher refs, Item/location,
  Assignment, Recovery, Quantity, Created.

### Finance Transactions

- Select, Status/type, Document refs, Party, Amount, Content, Created, Collected,
  Print.
- Document refs keep transaction and repair/receiving numbers.
- Party keeps customer, dealer/station, and technician.
- Created/collected groups keep full date and user values.

Use sort-only legacy columns for every consolidated sortable field. Composite
headers expose per-group sort menus only when multiple legacy sort fields share
one group. Composite cells use the shared two-column label/value grid.

## Related Code Files

- Modify: src/pages/quan-ly-kho/XemTonKhoPage.tsx
- Modify: src/pages/quan-ly-kho/TonKhoLKXacPage.tsx
- Modify: src/pages/quan-ly-kho/ThuHoiLKPage.tsx
- Modify: src/pages/quan-ly-kho/DsTraLKPage.tsx
- Modify: src/pages/quan-ly-kho/DsTraLKXacPage.tsx
- Modify: src/features/warehouse/issued-usage-table-columns.tsx
- Modify: src/features/warehouse/issued-usage-status-cell.tsx
- Modify: src/features/warehouse/part-return-table-columns.tsx
- Modify: src/features/warehouse/part-return-xac-table-columns.tsx
- Modify: src/pages/tai-chinh/ThuChiPage.tsx
- Modify: adjacent page/column tests

## Implementation Steps

1. Add characterization tests listing every field, export column, action, and
   sortable ID before consolidation.
2. Keep existing warehouse/finance table IDs. Do not add new column-configuration
   UI to routes that never exposed it; the persisted-state migration only changes
   known repair visibility keys.
3. Implement stock composites first; verify KPI, filters, update/detail dialogs,
   period data, and protected numeric values.
4. Implement issued/returned composites; preserve approvals, recovery actions,
   printing, detail dialogs, selection, and ticket status text.
5. Implement finance composites; preserve both create flows, row print, bulk
   selection, dual exports, filters, and all document/date/currency values.
6. Keep export mappings independent from visible composite columns.
7. Measure every protected element and route frame after each route conversion.
   Add synthetic overlength values and verify bounded table scrolling, not clipping.

## Todo List

- [x] Every prior field maps to a named visible group.
- [x] All legacy sortable IDs remain available.
- [x] All export schemas remain field-level compatible.
- [x] Warehouse actions/mutations and finance prints/modals pass.
- [x] Protected values pass DOM overflow assertions.

## Success Criteria

- All six target warehouse/finance routes fit at 1080p with no protected clipping.
- Density, selection, sort, filters, pagination, exports, actions, dialogs, and
  prints pass focused tests; no new visibility UI is introduced.
- No page-level horizontal overflow at any matrix viewport.

## Risk Assessment

- Dense composite cells may hide hierarchy. Use stable label/value ordering and
  shared visual grammar across routes.
- Sort-only fields may regress client/server sort mapping. Test each legacy ID and
  API/query mapping explicitly.
- Export behavior can accidentally follow visible groups. Keep export definitions
  untouched and add regression assertions.

## Security Considerations

No data access changes. Print/export tests must avoid formula-injection regressions
and must not add customer data to committed screenshots/reports beyond existing mocks.
