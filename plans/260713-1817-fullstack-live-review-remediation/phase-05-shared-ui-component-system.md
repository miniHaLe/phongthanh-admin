---
phase: 5
title: "Shared UI Component System"
status: in-progress
effort: "L"
priority: P2
dependencies: [2]
---

# Phase 5: Shared UI Component System

## Overview

**Adoption, not creation** (red-team corrected): the organisms mostly EXIST — `filter-panel/` (21 consumers), `status-badge.tsx` (2 consumers migrated), `page-header.tsx` (42 files), `data-table-toolbar.tsx`, `empty-state.tsx` (20 files), `bulk-actions-bar.tsx`, `print-menu.tsx` (Gallery-only). The defect is PARTIAL, INCONSISTENT adoption plus a forked table engine. This phase converges forks onto the existing organisms and dedups the table mechanics that let the Phase-1 bug exist twice.

Split into **5a (engine dedup — bounded)** and **5b (adoption sweep — explicit checklist)** per red-team SC3.

Findings: F-A1, F-A3, F-A4, F-A8, F-A9, F-A20, F-B7, F-B11, F-B16, F-B17, F-B18, F-E12, F-E13, F-E14, F-E15, export-label drift, `ColumnConfig.hidden` no-op, `getEntityLabel` dup, TableRetryButton dead export, tab-strip forks (red-team AD8).

## Requirements

- Functional: one FilterPanel organism absorbs CrudFilterBar's 4 consumers and the bespoke bars; one shared tab strip replaces the 4 identical page-local admin forks; StatusBadge adopted by its 3 remaining forks; filtered-empty vs no-data states distinct; search clearable; dialogs submit on Enter; one dirty-close confirm.
- Non-functional: single label per function ("Xuất Excel"); component contracts documented in ARCHITECTURE.md.

## Architecture

### 5a — Engine dedup (bounded, listed)
- Extract `buildCrudColumns(config, params, actions, lookups?)` + `exportCrudRows(config, rows, lookups?)` into `components/crud/`, consumed by CrudTablePage AND KhachHangPage. **Not zero-diff** (red-team FM9): the forks already disagree (selection→STT order, sticky meta, action sets) — the column ORDER/anatomy decision is an explicit deliverable of this step (recommendation: CrudTablePage's anatomy wins; KhachHangPage keeps its edit-only action set via the `actions` param). The `lookups` param is the contract Phase 4 consumes (see its renderCell contract decision).
- Export via renderCell string output (raw fallback otherwise); current-page scope labeled ("trang hiện tại"); toast on start/done; investigate danh-muc export no-op (F-B6 — likely same builder path).
- Delete: `makeMockApi` duplicate (barrel re-exports `make-mock-api.ts`), `khachHangConfig.fields` + phantom test block, dead `khachHangApi`/`nganHangApi` exports, `TableRetryButton`, `getEntityLabel` 'tenNhom' dup; tax-regex → one exported constant; centralize `PAGE_SIZE_OPTIONS` into one export consumed by all 7 sites (CrudTablePage, KhachHangPage — already trimmed of 300 in P2 — plus ChamCong/CongNo/HangHoa/NhomQuyen/XemTonKho).
- Wire `ColumnConfig.hidden` into initial columnVisibility (3 configs set it today, zero effect).

### 5b — Adoption sweep (explicit checklist)
- **FilterPanel convergence** (red-team SC1 — CrudFilterBar is the 4-consumer minority): migrate CrudFilterBar's consumers (CrudTablePage engine, KhachHangPage, ChamCongPage, NhanVienPage, HangHoaPage) onto `filter-panel/`; then the genuinely bespoke bars: SCBH `RepairFilters`, KT 12-field card ("Nhấn để search" → chevron disclosure; "Tìm kiếm" stays the only trigger), `XemTonKhoPage` naked grid, report radio-scope as a FilterPanel variant. Xuất Kho pages ALREADY use FilterPanel — fix their field widths/labels in place, do NOT migrate them off it.
- **Tab strip** (red-team AD8 — extraction lives HERE): extract the identical inline sticky tab strip from DanhMucPage/NhanSuPage/QuanLyPage/PhanQuyenPage into `src/components/shell/module-tab-strip.tsx`; fix double-active (Nhân Sự) and overflow affordance (Danh Mục: persistent chevrons + fade) ONCE in the shared component; all four admin pages consume it. Phase 6 then merely mounts it on the four operational modules.
- **StatusBadge adoption**: migrate the 3 forks (`use-repair-table-columns.tsx:63-70`, `use-repair-kt-columns.tsx:106`, `ThongBaoPage.tsx:44-51`); dashboard + mobile cards already use it. Dark-mode token variants ride with Phase 8's sweep.
- **Empty/feedback**: `EmptyState` filtered variant ("Không tìm thấy kết quả cho '…'" + "Xóa tìm kiếm"); table-level error state; clearable search input; Enter-submit dialog forms; shared dirty-close hook (styled AlertDialog) replacing native `confirm()` (Danh Mục drawer) and silent Escape-discard (customer dialogs).
- **PageHeader normalization**: breadcrumb hidden at root, leaf = sidebar/tab label, primary action slot top-right — applied to the checklist pages. SCBH toolbar rework is NOT here (Phase 7 owns the whole toolbar incl. PrintMenu adoption — red-team SC8).
- **Pagination/scroll-arrows**: overflow-gated `‹ ›`; one bottom pagination contract — scoped to the finding-flagged pages (SCBH/KT totals dedup in Phase 7; CrudTablePage/KhachHangPage here), not "every paged table".

## Related Code Files

5a: `src/components/crud/build-crud-columns.tsx` (create), `src/components/crud/export-crud-rows.ts` (create), `CrudTablePage.tsx`, `KhachHangPage.tsx`, `src/mock/masterdata/index.ts`, `khach-hang.config.ts` + its test, `src/types/crud-types.ts` (hidden wiring), `src/lib/` tax-regex constant, `PAGE_SIZE_OPTIONS` central export + 7 consumer sites, `data-table.tsx` (dead export, overflow-gated arrows).
5b checklist (explicit): `src/components/shared/filter-panel/filter-panel.tsx` (absorb CrudFilterBar props as needed), `src/components/crud/CrudFilterBar.tsx` (delete after migration), `ChamCongPage.tsx`, `NhanVienPage.tsx`, `HangHoaPage.tsx`, `src/features/repair-list/RepairFilters` (or equivalent), KT filter card component, `XemTonKhoPage.tsx`, `report-filter-panel.tsx` (variant check only), 6 stockout `*-filters.tsx` (width/label fixes in place); `src/components/shell/module-tab-strip.tsx` (create) + `DanhMucPage.tsx`/`NhanSuPage.tsx`/`QuanLyPage.tsx`/`PhanQuyenPage.tsx`; `use-repair-table-columns.tsx`, `use-repair-kt-columns.tsx`, `ThongBaoPage.tsx` (StatusBadge); `empty-state.tsx`, `data-table-toolbar.tsx` (clearable search), `CrudSheet.tsx`/`customer-editor-dialog.tsx` (Enter-submit + dirty-close hook), `src/hooks/use-dirty-close-confirm.ts` (create); export-label sweep limited to LIST-PAGE export buttons (the finding's scope): CrudTablePage, KhachHangPage, repair-batch-toolbar, BanHangPage, ThuChiPage, NhapKhoPage + remaining list toolbars found by `grep -rn "Xuất.*Excel"` — enumerate in the 5b PR, batch toolbar labels stay if contextually distinct ("Xuất Excel In" print-export is a different function).
Docs: ARCHITECTURE.md organism contracts section.

## Implementation Steps

1. (5a) Extract shared builders with explicit anatomy decision; migrate both consumers; delete dead code; centralize PAGE_SIZE_OPTIONS; wire `hidden`. Existing tests + one new builder test (plain column renders value; lookups param passes through).
2. (5a) Export unification on the shared path; danh-muc export root-cause + fix.
3. (5b) Tab-strip extraction + 4 admin consumers (fixes double-active + overflow once).
4. (5b) FilterPanel convergence per checklist, one page per commit; e2e uiux gate per page.
5. (5b) StatusBadge 3-fork migration; one representative snapshot + hex-map completeness unit test (not 15 snapshots — red-team SC10).
6. (5b) Empty/feedback items (filtered empty state, clearable search, Enter-submit, dirty-close hook on both dialog families).
7. (5b) PageHeader + pagination/arrow contract on checklist pages.
8. ARCHITECTURE.md contracts.

## Success Criteria

- [x] `CrudFilterBar.tsx` deleted; its 4 consumers + 3 bespoke bars render via FilterPanel; Xuất Kho pages untouched-but-fixed in place.
- [x] One `module-tab-strip.tsx`; zero page-local tab-strip JSX in the 4 admin pages; double-active and overflow fixed.
- [ ] StatusBadge is the only status renderer (grep: no `STATUS_HEX`/hexOf usage outside status.ts, StatusBadge, and legend components).
- [x] Same status renders identically on repair lists, dashboard, Thông báo.
- [ ] Every LIST-PAGE export button reads "Xuất Excel", emits display values, and toasts; danh-muc export works or is removed.
- [x] Zero-result search shows the filtered-empty state with one-click clear.
- [x] Escape on a dirty form always asks via styled dialog; Enter submits dialogs.
- [x] `columnVisibility` respects `hidden` config; PAGE_SIZE_OPTIONS has one definition.
- [x] `npm run test && npm run test:e2e:uiux` green per migrated page.

## Risk Assessment

- The builder anatomy decision changes one page's visible column order — declared deliverable, screenshot in PR, not a silent side effect.
- FilterPanel may need prop extensions to host CrudFilterBar's config-driven fields → extend the organism, never fork it; GalleryPage demos both looks for review.
- 5b is the churn-heavy half → one page per commit, e2e-gated, so partial landing still leaves every touched page consistent.
- Shared-file note: 5a touches `CrudTablePage.tsx`/`KhachHangPage.tsx`/`khach-hang.config.ts` — sequence after P2 (its dependency) and before P4's lookup migration (P4 lists this ordering).
