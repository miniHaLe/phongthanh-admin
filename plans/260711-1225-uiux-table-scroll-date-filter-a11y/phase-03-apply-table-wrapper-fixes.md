---
phase: 3
title: Apply Table Wrapper Fixes
status: completed
priority: P1
dependencies:
  - 2
---

# Phase 3: Apply Table Wrapper Fixes

## Overview

Apply the shared table scroll contract to every affected route. Remove unsafe
outer min-width wrappers that currently expand hidden main content.

## Requirements

- Functional: Affected table pages preserve all columns and row actions.
- Functional: Horizontal scrolling works on phone, tablet, desktop, and 4K.
- Non-functional: Page layout stays viewport-bounded; no document or main
  horizontal overflow trap.

## Architecture

Mechanical route change:

```tsx
// Before
<div className="min-w-[1400px] overflow-x-auto">
  <DataTable tableId={TABLE_ID} columns={columns} data={rows} />
</div>

// After
<DataTable
  tableId={TABLE_ID}
  columns={columns}
  data={rows}
  scrollLabel="Bảng chuyển kho"
  tableClassName="min-w-[1400px]"
/>
```

For any raw table not using `DataTable`, wrap it with the shared scroll frame and
put min-width on the inner table/content.

## Related Code Files

- Modify: `src/features/repair-kt/RepairKtListPage.tsx`
- Modify: `src/pages/tai-chinh/ThuChiPage.tsx`
- Modify: `src/pages/quan-ly-kho/XemTonKhoPage.tsx`
- Modify: `src/pages/quan-ly-kho/TonKhoLKXacPage.tsx`
- Modify: `src/pages/quan-ly-kho/TonKhoKyThuatPage.tsx`
- Modify: `src/pages/quan-ly-kho/NhapKhoPage.tsx`
- Modify: `src/pages/quan-ly-kho/DsTraLKPage.tsx`
- Modify: `src/pages/quan-ly-kho/DsTraLKXacPage.tsx`
- Modify: `src/pages/quan-ly-kho/ThuHoiLKPage.tsx`
- Modify: `src/pages/xuat-kho/CapLinhKienPage.tsx`
- Modify: `src/pages/xuat-kho/BanHangPage.tsx`
- Modify: `src/pages/xuat-kho/ChuyenKhoPage.tsx`
- Modify: `src/pages/xuat-kho/TraHangPage.tsx`
- Modify tests from phase 1 as assertions turn green.

## Tests Before

- Use phase 1 route tests. They should still fail before this phase.

## Implementation Steps

1. Replace every route-level table wrapper from
   `rg "min-w-\\[[0-9]+px\\]" src/features/repair-kt src/pages/tai-chinh src/pages/quan-ly-kho src/pages/xuat-kho`.
2. Keep legitimate cell-level `min-w` inside column renderers when it protects
   content, but verify it stays inside the scroll frame.
3. Pass meaningful `scrollLabel` values for each table.
4. Ensure toolbar/filter/bulk-action bars remain outside the horizontal scroll
   frame unless their content itself needs a separate bounded scroll region.
5. Verify route headers and action button groups wrap cleanly on mobile and 4K.
6. Update Playwright table-heavy route assertions to require:
   document no overflow, main no overflow trap, accessible table scroll frame,
   and reachable rightmost content after scroll/control click.
7. Capture before/after screenshots in the plan-scoped report folder.

## Tests After

- Add a targeted right-edge reachability assertion for at least:
  `/tai-chinh/thu-chi`, `/quan-ly-kho/ton-kho`, `/xuat-kho/chuyen-kho`,
  `/sua-chua-bao-hanh-kt`.

## Regression Gate

```bash
npm run test:e2e:uiux -- --grep "table-heavy"
npm run type-check
```

## Success Criteria

- [ ] `main.scrollWidth <= main.clientWidth + 1` across affected routes/viewports.
- [ ] Wide tables expose a named scroll frame and working scroll controls.
- [ ] Rightmost columns/actions can be reached without a trackpad.
- [ ] No page loses sorting, selection, pagination, empty, loading, or error state.
- [ ] No table text/control overlap introduced.

## Risk Assessment

- Risk: repeated page edits miss one wrapper. Mitigate with final `rg` check and
  route matrix.
- Risk: moving wrappers changes width assumptions for sticky headers. Mitigate
  with screenshots and right-edge content assertions.
