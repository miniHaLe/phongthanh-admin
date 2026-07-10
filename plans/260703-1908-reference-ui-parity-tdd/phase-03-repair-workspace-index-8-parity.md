---
phase: 3
title: "Repair workspace Index_8 parity"
status: completed
effort: "XL"
---

> **Completed 2026-07-04.** Gate clean: `test` 137 pass (44 files), fresh `tsc --noEmit`, `lint` (0 errors), `build` all green. Built: 14-column table with rich cells (status hex pill, Bản đồ/Định vị via F9, Sửa chữa progress with fixed-clock Tồn:, HH: notes), status legend with live counts (display order), single-select status filter + reference field set (soPhieuHang bug fix), 10 mock mutations + statusCounts/dateType, 8 modals (update-status/dispatch/transfer/schedule/parts/checkout/solution), dispatch cell lifecycle, batch toolbar with guards + 5 prints + Xuất Excel. HinhThuc taxonomy migrated to Bảo hành/Sửa dịch vụ/BH sửa chữa (Finding 4 — P3 owns; create/detail updated). Also fixed the Phase-2-review F9 whitespace bug (open url.trim, validate normalized). Two label sets for Loại bảo hành kept per V7 (Index_8 Tại Trạm/Nhà Khách vs Create form Tại TTBH/Tại Nhà).

# Phase 3: Repair workspace Index_8 parity

## Overview

Upgrade `src/features/repair-list/` from a read-only table skeleton to the full legacy operations console `/Repairing/Index_8`: 15-status live-count legend, 14-column table with rich cells and an actions column driving 7 modal workflows, checkbox multi-select powering batch ops (Chuyển chi nhánh, 5 prints, SMS, Xóa), the Báo giá flow, the `Sửa chữa` progress column, the reference 22-field filter set, and Xuất Excel. All transactional actions mutate the in-memory mock store (D4) and refresh the list via TanStack Query invalidation. Popup-window pages from the reference become SPA routes/modals (D1).

## Context links

- Spec (contract): `plans/reports/ref-ui-parity-sections/section-repair-main.md` — the **Ref spec** block is normative.
- Bulk-op/modal/print/SMS endpoint inventory: `plans/reports/brainstorm-260703-repair-detail-create-refspec.md` §"Modal flows", §"Direct AJAX actions", §"Print flows", §"Tem dropdown", §"Search / export".
- Status ids/hex + UpdateStatus conditional-field list: `plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md` §5b.
- Local code consumed: `src/features/repair-list/*` (all 5 files), `src/domains/repair/{status.ts,types.ts,mock-data.ts,reference-data.ts}`, `src/components/shared/{data-table/*,status-legend.tsx,print-menu.tsx,status-badge.tsx}`, the P1 lookup modules under `src/mock/seed/*`, `src/lib/format.ts`, `src/constants/routes.ts`. **Data layer (D5):** repair pages read the LIVE `src/domains/repair/mock-data.ts` (`MOCK_TICKETS`) — this phase edits that layer, not any `SEED_*` array.
- P1 outputs assumed present: legacy 15-status module in `src/domains/repair/status.ts` (ids+hex+**presentation display order** `[1,2,4,15,6,17,13,7,8,11,16,9,10,12,14]` — a separate constant from the id-ordered `REPAIR_STATUSES`, per plan.md §D5 "Repair-list display order"), Kỳ lookup, Tỉnh→Quận→Xã + **`TUYEN`** lookup (named `TUYEN`, not `KhuVuc` — Finding 2), and the LIVE `MOCK_TICKETS` carrying legacy status ids. **Reference model fields** (`hinhThuc` = Bảo hành/Sửa dịch vụ/BH sửa chữa, `loaiBaoHanh` = Tại Trạm/Nhà Khách) — this phase **owns** adding/migrating the `hinhThuc`/warranty taxonomy onto the live layer (Finding 4: P3 is the first consumer, P4 consumes P3's shape; P1 only landed statuses + minimal fields).
- P2 primitives consumed: DataTable bulk-select extension, `print-window.tsx`, `export-xlsx.ts`, `ServerAutocomplete` (+ table-variant + `[+]` quick-create), Kỳ picker, **`openExternal`/`buildMapUrl`/`buildGeoUrl` (F9 — the only sanctioned way to open Bản đồ/Định vị)**.

## Requirements

Functional (each maps to a gap-matrix row / spec section of `section-repair-main.md`):

- **R1 Status legend w/ live counts** — horizontal strip below toolbar: all 15 statuses in legacy display order, colored square (status hex) + `Label (count)`, counts live for current filter (e.g. `Mới Nhận (22)`).
- **R2 Table = exact 14 reference columns** in order: (1) checkbox col w/ `Chọn tất cả` toggle + STT beneath checkbox, (2) `#` Trạng thái, (3) `#` Hành động, (4) `Phiếu sửa chữa`, (5) `Khách hàng`, (6) `Sản phẩm`, (7) `Kỹ thuật`, (8) `Loại SC`, (9) `Chi phí`, (10) `Ngày nhận`, (11) `Ngày HT`, (12) `Sửa chữa`, (13) `Ghi chú`, (14) `Người nhận`. Trạng thái cell = full-cell background in status hex, white pill, uppercase label.
- **R3 Row actions (status-dependent)**: `Đổi tình trạng` (always), `Xem chi tiết` (always), `Cấp linh kiện cho kỹ thuật` (only when technician assigned), `Giao Máy` (deliverable statuses), `Thêm lịch hẹn` (always).
- **R4 Đổi tình trạng modal**: title `Đổi tình trạng`, single-select of 15 color-coded statuses, per-status conditional fields (`Giá`, `Nội dung sửa chữa`, `Cách giải quyết`, `Loại sửa chữa`, `Loại yêu cầu` Đặc/Ứng, `Loại linh kiện`, `Linh kiện`, `Số lượng`), buttons `Lưu` and `Lưu & SMS` (SMS = toast per D4). Batch variant accepts multiple ids. Báo giá variant (`bg=1`) preselects Báo Giá + shows `Giá`.
- **R5 Dispatch workflow in Kỹ thuật cell**: unassigned → button `Điều phối`; assigned → tech name (blue bold) + `Đổi kỹ thuật` + `Hủy điều phối` (confirm `Bạn có chắc chắn hủy điều phối?`). Modal title `Đổi kỹ thuật` w/ technician ServerAutocomplete; guard `Vui lòng chọn kỹ thuật!`. Batch đổi-kỹ-thuật over checked rows.
- **R6 Multi-select batch ops** (toolbar, all guard-alert `Vui lòng chọn phiếu để …` when nothing checked): `Chuyển chi nhánh` modal; `In Biên nhận` (first checked with status ≥ Sửa Xong, else alert `Vui lòng chọn phiếu để đã sửa xong để in`); `In Giấy Đi Đường` (all checked ids, one doc); `In Lệnh Sửa Tại Nhà` (if checked rows span >1 technician or none → modal `Điều phối in` then print, else direct); `In Phiếu SC` (first checked); `In tem` dropdown → item `Dán máy` (last checked id); SMS actions (types 1 tech / 2,3,4 customer / 9 `SMS sửa xong` with confirm) as toasts; `Xóa` (confirm `Bạn có chắc chắn xóa các phiếu sửa chữa?`, removes from mock store).
- **R7 Báo giá flow**: Chi phí cell shows `Báo Giá` button for Sửa dịch vụ rows → Đổi tình trạng modal `bg=1` variant; quoted rows show amount + delete-quote (confirm) via `Hủy báo giá`.
- **R8 `Sửa chữa` progress column**: `Sửa xong: <dd/MM/yyyy hh:mm AM/PM>` (green), `TAT: <n> ngày`, `Giao máy: <datetime>`, `Tồn: X ngày H:M'` (orange dwell counter; computed from a stable "now" per render).
- **R9 Reference filter set** (fieldset `Thông tin tìm kiếm`): adds `DateType` select (`Ngày Nhận`/`Ngày Giao`/`Ngày Sửa Xong`/`Ngày Hoàn Thành` — selects which date the range filters), `Sửa gấp` checkbox, `Kỳ hoàn tất` autocomplete, `Địa chỉ` text, `Tên/ĐT khách hàng` table-autocomplete (dropdown columns `Họ tên` / `Điện thoại 1` / `Điện thoại 2` / `Địa chỉ`); static Selects for NSX/Sản phẩm/Model/Kỹ thuật/Tỉnh/TP-Huyện/Tuyến/Đại lý replaced by `ServerAutocomplete` (mock-backed, model searchable without parent); `Tình trạng` becomes single-select with 15 color-coded options in legacy order; `Hình thức chung` options = `Bảo hành`/`Sửa dịch vụ`/`BH sửa chữa`; `Loại bảo hành` options = `Tại Trạm`/`Nhà Khách`.
- **R10 Filter bug fix**: `Số phiếu hãng` field writes new `filters.soPhieuHang` (not `soPhieu`); `Số phiếu`, `Số phiếu hãng`, `Số Serial`, `Tên/ĐT khách hàng` are independent, combinable fields (quick-search heuristic removed from advanced panel).
- **R11 Rich cells**: Khách hàng = bold name, phone(s), full address, `Bản đồ` button (**F9: `openExternal(buildMapUrl(address))`** — encodes the address, `noopener,noreferrer`; NOT raw `window.open('…?q='+address)`), `Định vị` link (**F9: `openExternal(buildGeoUrl(lat,lng))`** — scheme-validated `http(s)` only; rejects any `javascript:` GPS value). Sản phẩm = `- <LOẠI SP> - <NSX> - <model>`, `Serial: <sn>` with red highlight + tooltip `Máy đã từng sửa chữa` when serial has prior tickets, `Đại lý: <name>` (orange). Loại SC = 3 lines (hình thức, `Tại Trạm`/`Nhà Khách`, `KV: <khu vực>`). Phiếu sửa chữa = PSC code link → detail route, tooltip (Hư hỏng / Địa chỉ / CN), secondary `PSC hãng: <n>` or `PSC DL: <n>`. Ghi chú = `HH: <fault>` (red HH prefix) + solution + `Cập nhật Cách giải quyết` wrench button (modal). Người nhận = name + overflow tooltip.
- **R12 Export + reload**: `Xuất Excel File` and `Xuất Excel In` buttons produce real `.xlsx` (P2 `export-xlsx.ts`) of the full filtered set; `Tải lại trang` resets filters to defaults and refetches.
- **R13** Toolbar shows `Lập phiếu` (green, + icon, → create route); pagination header text `Tổng: <N> dòng, Trang <x> / <y>`; `Ngày nhận` shows full datetime `dd/MM/yyyy hh:mm AM/PM`.

Non-functional:

- All actions work against the mock store; list refreshes via query invalidation (no page reload).
- Table container fixed min-width (~1700px) with horizontal scroll.
- `Số phiếu` input autofocused on page load.
- Deliberate deviations kept (documented, low-sev per section file): as-you-type filtering instead of `Tìm kiếm` button, single bottom pagination bar with page-size selector, SPA routes instead of popup windows.

## Architecture

- **Mutable mock store**: new `src/domains/repair/mock-mutations.ts` operating on `MOCK_TICKETS` (in-place mutation): `updateTicketStatus(ids, status, fields)`, `dispatchTechnician(ids, techId)`, `cancelDispatch(id)`, `transferBranch(ids, branchId, note)`, `deleteTickets(ids)`, `addScheduleReminder(id, {date, note})`, `issuePartsToTech(id, parts)`, `checkoutDelivery(id, {ngayGiao, ghiChu})`, `updateSolution(id, {cachGiaiQuyet})`, `setQuote(id, gia, noiDung)` / `deleteQuote(id)`. Each appends a `statusHistory` entry where applicable. UI wraps them in `useMutation` + `invalidateQueries(['repair-list'])`.
- **`fetchRepairList` response extended** with `statusCounts: Record<number, number>` (counts per legacy status id computed over rows matching all filters *except* the status filter) — feeds R1.
- **Ticket model extension** (add to the LIVE layer — D5): `ngayGiao?`, `ngaySuaXong?`, `soPhieuDaiLy?`, `isQuick?`, `khuVuc?`, `daiLy?` (product-line dealer), `laMayDaSua?` (repeat-repair serial flag), `kyId?`, `giaBaoGia?`, `cachGiaiQuyet?` — extend `src/domains/repair/types.ts` + the `MOCK_TICKETS` generator in `src/domains/repair/mock-data.ts` in place (this is the layer repair pages read; P1 landed statuses + minimal fields, P3 adds the rest). **Warranty taxonomy (Finding 4): P3 owns it** — add `hinhThuc` (`Bảo hành`/`Sửa dịch vụ`/`BH sửa chữa`) + `loaiBaoHanh` (`Tại Trạm`/`Nhà Khách`) to the type + generator + the repair-list label maps here; P4 consumes this shape (no "if P3 hasn't" ambiguity).
- **Selection**: use P2 DataTable bulk-select extension (checkbox column + toolbar slot + `Chọn tất cả` header toggle). Selection state lives in `RepairListPage`, passed to toolbar. Row-click navigation is **removed** (reference has none; conflicts with checkboxes/actions) — navigation via PSC link + `Xem chi tiết`.
- **Modals**: shadcn `Dialog` components co-located under `src/features/repair-list/components/`. One generic pattern: modal receives `ids: string[]`, calls a mock mutation, toasts, closes, invalidates. `update-status-modal.tsx` is shared by: row action, batch toolbar action, and Báo giá variant (prop `baoGia?: boolean`).
- **Prints**: P3 authors the 5 repair print documents rendered through P2 `print-window.tsx`: `bien-nhan`, `giay-di-duong` (multi-ticket), `lenh-sua-tai-nha` (multi-ticket), `phieu-sc`, `tem-dan-may`. Placed in `src/features/repair-list/prints/`.
- **Legend**: extend `src/components/shared/status-legend.tsx` in place (per ownership rule) to render the legacy 15 statuses with hex squares and an optional `counts` prop; RepairListPage passes `statusCounts`.
- **Filters**: `RepairListFilters` gains `soPhieuHang`, `dateType` (`nhan|giao|sua_xong|hoan_thanh`), `suaGap`, `kyId`, `diaChi`, `khachHangId`; `use-repair-filters.ts` serializes them; `tinhTrang` becomes single legacy-status id (D2). `fetchRepairList` applies the date range to the field chosen by `dateType`.
- **Formatting**: add `formatDateTime` (`dd/MM/yyyy hh:mm AM/PM`) and `formatDwell(from, now)` (`X ngày H:M'`) to `src/lib/format.ts`.

## Related Code Files

- Create: `src/domains/repair/mock-mutations.ts` (+ `mock-mutations.test.ts`)
- Create: `src/features/repair-list/components/row-actions-cell.tsx`
- Create: `src/features/repair-list/components/update-status-modal.tsx` (+ test)
- Create: `src/features/repair-list/components/dispatch-technician-modal.tsx` (+ test; also hosts `Điều phối in` variant)
- Create: `src/features/repair-list/components/transfer-branch-modal.tsx`
- Create: `src/features/repair-list/components/insert-schedule-modal.tsx`
- Create: `src/features/repair-list/components/issue-parts-modal.tsx`
- Create: `src/features/repair-list/components/checkout-delivery-modal.tsx`
- Create: `src/features/repair-list/components/update-solution-modal.tsx`
- Create: `src/features/repair-list/components/repair-batch-toolbar.tsx` (+ test)
- Create: `src/features/repair-list/prints/{bien-nhan-print.tsx, giay-di-duong-print.tsx, lenh-sua-tai-nha-print.tsx, phieu-sc-print.tsx, tem-dan-may-print.tsx}`
- Create: `src/features/repair-list/repair-list-page.test.tsx`, `src/features/repair-list/hooks/use-repair-filters.test.ts`, `src/features/repair-list/hooks/use-repair-table-columns.test.tsx`
- Modify: `src/features/repair-list/RepairListPage.tsx` (legend, selection, toolbar, remove row-click, autofocus, `Tổng: N dòng, Trang x / y`)
- Modify: `src/features/repair-list/hooks/use-repair-table-columns.tsx` (full 14-column rewrite, rich cells)
- Modify: `src/features/repair-list/RepairFilters.tsx` + `RepairFiltersAdvanced.tsx` (reference field set, single-select status, ServerAutocomplete swap, bug fix)
- Modify: `src/features/repair-list/hooks/use-repair-filters.ts` (new keys, `soPhieuHang` fix, single status)
- Modify: `src/domains/repair/types.ts`, `src/domains/repair/mock-data.ts` (LIVE `MOCK_TICKETS` generator: statusCounts, dateType filtering, new reference fields, `hinhThuc`/`loaiBaoHanh` taxonomy). **No `src/mock/seed/repair-tickets.ts` — deleted in P1 (D5); all ticket data edits land in the live `mock-data.ts`.**
- Modify: `src/components/shared/status-legend.tsx` (15 statuses + counts), `src/lib/format.ts` (`formatDateTime`, `formatDwell`)
- Delete: `PRINT_ITEMS` toast stubs inside `RepairListPage.tsx` (replaced by real handlers); no file deletions.

## TDD Plan

1. **Characterization tests (lock survivors before refactor)**:
   - `use-repair-filters.test.ts`: URL round-trip for keys that survive (`branchId`, `soSerial`, `dateFrom/dateTo`, `kyThuatId`); defaults applied on empty URL; `clearFilters` restores defaults; filter change resets page to 1 (in `repair-list-page.test.tsx`).
   - `repair-list-page.test.tsx`: page renders rows from `fetchRepairList`; pagination `onPageChange` refetches; column-config visibility persistence via `useTableState`.
   - `mock-data` contract: `fetchRepairList` returns `{data, total}` filtered by branch + serial (existing behavior).
2. **Failing spec tests (cite `section-repair-main.md`)**:
   - `use-repair-table-columns.test.tsx`: header cells in exact order `['', '#', '#', 'Phiếu sửa chữa', 'Khách hàng', 'Sản phẩm', 'Kỹ thuật', 'Loại SC', 'Chi phí', 'Ngày nhận', 'Ngày HT', 'Sửa chữa', 'Ghi chú', 'Người nhận']`; Trạng thái cell has `background-color` = status hex and uppercase label; Sửa chữa cell renders `Sửa xong:`, `TAT:`, `Giao máy:`, `Tồn:` fragments; Sản phẩm cell renders `Serial:` red-highlight + title `Máy đã từng sửa chữa` when `laMayDaSua`; Khách hàng cell has `Bản đồ` and `Định vị`; Ghi chú cell shows `HH:` prefix.
   - `status-legend` test: renders 15 entries in order ids `[1,2,4,15,6,17,13,7,8,11,16,9,10,12,14]`, each `Label (count)` with correct hex square (assert `Mới Nhận`, `#FFCC00` and `Đã Giao Ngoài`, `#009988` endpoints).
   - Filters spec test: status select offers exactly 15 options in legacy order; `Hình thức chung` options `['Bảo hành','Sửa dịch vụ','BH sửa chữa']`; `Loại bảo hành` options `['Tại Trạm','Nhà Khách']`; `DateType` options `['Ngày Nhận','Ngày Giao','Ngày Sửa Xong','Ngày Hoàn Thành']`; presence of `Sửa gấp` checkbox, `Kỳ hoàn tất`, `Địa chỉ`; **bug-fix assertion**: typing in `Số phiếu hãng` sets `filters.soPhieuHang` and leaves `filters.soPhieu` untouched (both settable simultaneously).
   - `repair-batch-toolbar.test.tsx`: buttons labeled `Lập phiếu`, `Chuyển chi nhánh`, `In Biên nhận`, `In Giấy Đi Đường`, `In Lệnh Sửa Tại Nhà`, `In Phiếu SC`, `In tem`→`Dán máy`, `Xuất Excel File`, `Xuất Excel In`, `Tải lại trang`; with zero selection each selection-required action alerts `Vui lòng chọn phiếu để …`; `In Biên nhận` with only pre-Sửa-Xong rows selected alerts `Vui lòng chọn phiếu để đã sửa xong để in`; `In Lệnh Sửa Tại Nhà` with 2 techs opens `Điều phối in` modal; `Xóa` confirm text `Bạn có chắc chắn xóa các phiếu sửa chữa?`; `Xuất Excel File` calls `exportToXlsx` with all filtered rows.
   - `update-status-modal.test.tsx`: title `Đổi tình trạng`; 15 status options; selecting Báo Giá shows `Giá` + `Nội dung sửa chữa`; selecting Sửa Xong shows `Cách giải quyết` + `Loại sửa chữa`; parts statuses show `Loại yêu cầu`/`Loại linh kiện`/`Linh kiện`/`Số lượng`; buttons `Lưu` and `Lưu & SMS`; save mutates store + closes; `Lưu & SMS` also fires SMS toast; `baoGia` prop preselects Báo Giá.
   - `dispatch-technician-modal.test.tsx`: unassigned row shows `Điều phối`; assigned shows name + `Đổi kỹ thuật` + `Hủy điều phối`; cancel confirm text `Bạn có chắc chắn hủy điều phối?`; empty-tech save guard `Vui lòng chọn kỹ thuật!`.
   - `mock-mutations.test.ts`: each mutation updates ticket fields + appends history; `deleteTickets` shrinks list; `fetchRepairList` `statusCounts` ignores the status filter but respects others; `dateType: 'giao'` filters on `ngayGiao`.
3. **Implementation order to green**: format helpers → types/seed field extension → mock-mutations + fetch changes (unit tests green) → status-legend extension → filters (hook, then UI) → table columns + row-actions cell → modals (update-status first, then dispatch, then the five small ones) → batch toolbar + prints + export → RepairListPage assembly → full suite + gates.

## Implementation Steps

1. **`src/lib/format.ts`**: add `formatDateTime` (`dd/MM/yyyy hh:mm AM/PM` via date-fns `dd/MM/yyyy hh:mm a` uppercased) and `formatDwell(fromIso, now)` returning `X ngày H:M'`. Unit-test both.
2. **`src/domains/repair/types.ts` + the LIVE `src/domains/repair/mock-data.ts` generator**: add fields `ngayGiao?`, `ngaySuaXong?`, `soPhieuDaiLy?`, `isQuick?`, `khuVuc?`, `daiLy?`, `laMayDaSua?`, `kyId?`, `giaBaoGia?`, `cachGiaiQuyet?`, plus `hinhThuc`/`loaiBaoHanh` (Finding 4 — P3 owns) if absent after P1; generate plausible values in `MOCK_TICKETS` (ngaySuaXong/ngayGiao only for statuses ≥ Sửa Xong; `laMayDaSua` true where a serial repeats). Extend `RepairListFilters` with `soPhieuHang`, `dateType`, `suaGap`, `kyId`, `diaChi`, `khachHangId`; change `tinhTrang` to single legacy id. (No `seed/repair-tickets.ts` — deleted in P1.)
3. **`src/domains/repair/mock-mutations.ts`**: implement the 10 mutation functions listed in Architecture against `MOCK_TICKETS`; each returns the updated ticket(s) and appends `statusHistory` entries.
4. **`src/domains/repair/mock-data.ts`**: apply `dateType`-selected date range; add `soPhieuHang`, `diaChi`, `suaGap`, `kyId`, `khachHangId` predicates; compute and return `statusCounts` (all filters except status).
5. **`src/components/shared/status-legend.tsx`**: rewrite to iterate the P1 legacy display order; square colored by status hex (inline style, hexes are data not Tailwind), text `Label (count)` when `counts` prop present.
6. **`src/features/repair-list/hooks/use-repair-filters.ts`**: serialize new keys; `Số phiếu hãng` → `soPhieuHang`; single-status param; keep defaults (branch, last-30-days, `dateType: 'nhan'`).
7. **`RepairFiltersAdvanced.tsx`**: rebuild grid to the reference fieldset (rows/labels verbatim): `Chi nhánh` (options = the branches present in the seed — through P3 that's the 2 `TTBH … Đăk lăk` / `Đăk nông`; **the 3rd `Cộng tác viên tuyến huyện` option is added by P6 when it extends `BranchId` — validation V1**, so do NOT hardcode a 3rd branch here; render options from `BRANCHES`), `Tên nhà sản xuất`, `Sản phẩm`, `Model`, `Tình trạng` (single-select, 15 colored options), `Hình thức chung` (`Bảo hành`/`Sửa dịch vụ`/`BH sửa chữa`), `Số phiếu` (autofocus id), `Số phiếu hãng`, `Số Serial`, `Tên/ĐT khách hàng` (ServerAutocomplete table variant, columns `Họ tên`/`Điện thoại 1`/`Điện thoại 2`/`Địa chỉ`, backed by `searchCustomers`), `Kỹ thuật`, `Tên Tỉnh`, `TP/Huyện`, `Tuyến`, `Đại lý`, `Loại bảo hành` (`Tại Trạm`/`Nhà Khách`), `Sửa gấp` checkbox, `DateType` select (`Ngày Nhận`/`Ngày Giao`/`Ngày Sửa Xong`/`Ngày Hoàn Thành`), `Từ ngày`, `Đến ngày`, `Kỳ hoàn tất` (Kỳ picker/ServerAutocomplete), `Địa chỉ`. All pickers = P2 `ServerAutocomplete` over mock search fns (model searchable standalone). Remove the soPhieu-heuristic quick search from `RepairFilters.tsx` strip; keep strip fields as thin proxies for `soPhieu` + status + dates.
8. **`use-repair-table-columns.tsx`**: rewrite to the 14 reference columns (headers exactly as R2). Cells per R2/R8/R11: STT under checkbox (bulk-select col from P2 handles the checkbox; STT stays in same cell via `meta` render or adjacent), Trạng thái full-bg hex + white uppercase pill, Hành động renders `row-actions-cell.tsx`, Phiếu sửa chữa link → `ROUTES.repairDetail(id)` with tooltip (Hư hỏng/Địa chỉ/CN) + `PSC hãng:`/`PSC DL:` line, Khách hàng (+`Bản đồ` → `openExternal(buildMapUrl(addr))`, `Định vị` → `openExternal(buildGeoUrl(...))` — F9, never raw `window.open`), Sản phẩm (`- LOẠI SP - NSX - model`, `Serial:` repeat-flag, `Đại lý:`), Kỹ thuật (dispatch cell per R5), Loại SC 3 lines (`KV:` prefix), Chi phí (`Báo Giá` button / amount / `Hủy báo giá`), `Ngày nhận` via `formatDateTime`, `Ngày HT`, `Sửa chữa` (`Sửa xong:`/`TAT: n ngày`/`Giao máy:`/`Tồn:`), Ghi chú (`HH:` red + solution + wrench `Cập nhật Cách giải quyết`), Người nhận (+tooltip). Update `REPAIR_COLUMN_LABELS` to match.
9. **`components/row-actions-cell.tsx`**: icon buttons w/ tooltips: `Đổi tình trạng`, `Xem chi tiết` (→ detail route), `Cấp linh kiện cho kỹ thuật` (when `kyThuatId`), `Giao Máy` (when status ∈ deliverable set), `Thêm lịch hẹn`. Opens co-located modals.
10. **`components/update-status-modal.tsx`**: per R4. Conditional-field map (assumption, see Unresolved): Báo Giá/Chờ Báo Giá → `Giá`, `Nội dung sửa chữa`; Sửa Xong → `Cách giải quyết`, `Loại sửa chữa`; Đã Đặt/Đã Có/Chờ Linh Kiện → `Loại yêu cầu` (Đặc/Ứng), `Loại linh kiện`, `Linh kiện`, `Số lượng`; others → `Nội dung sửa chữa` only. `Lưu` = mutation + toast; `Lưu & SMS` additionally toasts `Đã gửi SMS…` (D4). Accepts `ids: string[]` (batch) and `baoGia` flag.
11. **`components/dispatch-technician-modal.tsx`**: title `Đổi kỹ thuật`; technician ServerAutocomplete; save guard `Vui lòng chọn kỹ thuật!`; batch ids. `Điều phối in` variant (title `Điều phối in`) same body, on save also triggers `lenh-sua-tai-nha` print. `Hủy điều phối` = confirm dialog (`Bạn có chắc chắn hủy điều phối?`) → `cancelDispatch`.
12. **Small modals**: `transfer-branch-modal.tsx` (title `Chuyển chi nhánh`, branch select + note), `insert-schedule-modal.tsx` (title `Thêm lịch nhắc nhở`, date + note), `issue-parts-modal.tsx` (title `Cấp linh kiện kỹ thuật`, part rows: Linh kiện autocomplete + Số lượng), `checkout-delivery-modal.tsx` (`Giao Máy`: Ngày giao + Ghi chú → status `Đã Giao Cho Khách`, sets `ngayGiao`), `update-solution-modal.tsx` (title `Cập nhật Cách giải quyết`, textarea).
13. **`prints/*.tsx`**: 5 print documents using P2 `print-window.tsx`; doc titles `Biên nhận`, `Giấy Đi Đường`, `Lệnh Sửa Tại Nhà`, `Phiếu Sửa Chữa`, `Tem Dán Máy`; Giấy Đi Đường + Lệnh Sửa Tại Nhà accept multiple tickets.
14. **`components/repair-batch-toolbar.tsx`**: buttons per R6/R12/R13 with exact labels `Lập phiếu`, `Chuyển chi nhánh`, `In Biên nhận`, `In Giấy Đi Đường`, `In Lệnh Sửa Tại Nhà`, `In Phiếu SC`, `In tem` (red dropdown, item `Dán máy`), SMS dropdown (items: `Gửi SMS kỹ thuật`, `Gửi SMS khách hàng`, `SMS sửa xong` w/ confirm — labels inferred, see Unresolved), `Xóa`, and right side `Xuất Excel File`, `Xuất Excel In`, `Tải lại trang`. Selection guards + status gates per R6. Excel handlers call P2 `exportToXlsx` with full filtered rows (re-fetch with `pageSize: total`); `Xuất Excel In` uses variant filename suffix `-in`.
15. **`RepairListPage.tsx`**: wire bulk-select DataTable extension (header `Chọn tất cả` toggle); render extended `StatusLegend` with `statusCounts`; replace `PRINT_ITEMS`/PrintMenu with `repair-batch-toolbar`; drop `onRowClick`; add `Tổng: <N> dòng, Trang <x> / <y>` text; wrap table in min-w `1700px` scroll container; autofocus `Số phiếu`.
16. Run `npm run test`, fix to green; then `npm run type-check && npm run lint && npm run build`; grep repo for removed invented option strings (`sua_chua_tai_nha`, `tu_van`, `Bảo hành mở rộng`) to confirm no dead references.

## Success Criteria

- [ ] Table header row renders exactly: checkbox/`Chọn tất cả`, `#`, `#`, `Phiếu sửa chữa`, `Khách hàng`, `Sản phẩm`, `Kỹ thuật`, `Loại SC`, `Chi phí`, `Ngày nhận`, `Ngày HT`, `Sửa chữa`, `Ghi chú`, `Người nhận` (spec test green).
- [ ] Legend shows all 15 legacy statuses in order with hex squares and live counts that change when a non-status filter changes.
- [ ] Đổi tình trạng modal (row + batch + Báo giá variant) mutates the mock store, list refreshes without reload, `Lưu & SMS` toasts.
- [ ] Dispatch lifecycle works end-to-end: Điều phối → name shown → Đổi kỹ thuật → Hủy điều phối (with exact confirm text).
- [ ] All 5 print actions open a print window with a rendered document; selection guards and the Biên-nhận status gate fire the exact alert strings.
- [ ] `Xuất Excel File` and `Xuất Excel In` download real `.xlsx` files containing the filtered rows; `Tải lại trang` resets filters.
- [ ] `Sửa chữa` column shows `Sửa xong:`/`TAT:`/`Giao máy:`/`Tồn:` values; `Ngày nhận` shows `dd/MM/yyyy hh:mm AM/PM`.
- [ ] `Số phiếu hãng` filter writes `soPhieuHang`; `Số phiếu` + `Tên/ĐT khách hàng` + `Số Serial` combinable simultaneously (regression test green).
- [ ] Filter option sets match reference verbatim (status single-select ×15, Hình thức chung ×3, Loại bảo hành ×2, DateType ×4, Sửa gấp, Kỳ hoàn tất, Địa chỉ).
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` all clean.

## Risk Assessment

- **In-place mock mutation vs Query cache**: stale reads if invalidation is missed → route every mutation through one `useRepairMutation` helper that always invalidates `['repair-list']`.
- **Dwell counter (`Tồn:`) nondeterminism in tests** → `formatDwell` takes explicit `now`; tests pass a fixed date (no `setInterval` ticking in v1 — static per render, matches D4 mock fidelity).
- **Scope creep across 7 modals** → each modal is a thin form + 1 mutation + toast; no nested `[+]` quick-creates in this phase (P2 pattern exists; only technician/customer autocompletes used).
- **Single-select status breaks existing multi-select URL deep-links** → `fromParams` tolerates comma lists by taking the first id; characterization test documents it.
- **P1/P2 API drift** (status module export names, bulk-select props) → phase starts with a 30-min interface check; mismatches fixed in the owner file, not forked.
- **Rollback**: changes confined to `src/features/repair-list/**`, `src/domains/repair/**` (incl. the live `mock-data.ts`), `src/components/shared/status-legend.tsx`, `src/lib/format.ts` — single revert of the phase branch/commit restores Phase-2 state; no persisted-state migrations (localStorage table state keys unchanged).

## Unresolved

1. Exact per-status → conditional-field mapping in the Đổi tình trạng modal (gap matrix lists the field pool, not the mapping); default mapping in Step 10 is an assumption. The 8 `Loại linh kiện` option labels are unknown — seed with placeholder taxonomy from P1 parts data.
2. Deliverable-status set for `Giao Máy` — spec gives only "e.g. Trả Lại"; defaulting to {Trả Lại, Sửa Xong, Hỏng Khách Trả Lại}.
3. Legend count basis: reference counts (e.g. `Đã Giao Cho Khách (84513)` vs `Tổng: 2536`) suggest counts may ignore the date filter too; defaulting to "all filters except status".
4. `Xuất Excel In` vs `Xuất Excel File` column-set difference (typeName=print vs all) unverified — defaulting to same columns, different filename.
5. SMS menu item labels — reference buttons hidden for this role (JS-only); labels in Step 14 are inferred.
6. Whether the reference `Tìm kiếm` button + dual (top/bottom) pager must be cloned — treated as accepted low-sev deviations per section file; confirm before phase close.
7. **Cross-phase note (not a conflict):** the `Loại bảo hành` option labels differ by screen in the legacy app — Index_8 filter (this phase) uses `Tại Trạm`/`Nhà Khách`, while the Create form (P4) uses `Tại TTBH`/`Tại Nhà`. Both are faithful to their own reference screen; they map to the same underlying `warrantyAt 0|1` field (P1 data model). Keep both label sets as-is per D3 — do not unify.
