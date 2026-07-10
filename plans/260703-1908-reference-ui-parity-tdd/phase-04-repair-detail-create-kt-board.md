---
phase: 4
title: "Repair detail/create + KT board"
status: completed
effort: "XL"
---

> **Completed 2026-07-06.** Gate clean: `test` 168 pass (52 files, verified deterministic ×3), fresh `tsc --noEmit`, `lint` (0 errors), `build` all green. Built via 3 parallel agents (strict file ownership): (1) KT board `src/features/repair-kt/` — 14-col table, 12-field search, KT_DISPLAY_ORDER `[2,4,15,6,7,13,17,16,8,9]` distinct from membership set (Finding 14), photo-upload modal; (2) detail rewrite `src/features/repair-detail/sections/` — 11 legacy sections, status/dispatch log tables, image gallery, parts modals, SerialHistoryPanel, tem print, deleted RepairStatusTimeline; (3) create rewrite `src/features/repair-create/` — legacy validation set + messages, 3 independent autocompletes, 5 quick-create modals, 3 save modes, image upload, deleted CostEstimate/Symptom/Service sections. Domain foundation (types, mock-mutations media/suaGap, fetchSerialHistory/fetchRepairKtList, enriched MOCK_TICKETS[0..5], quick-create mutators, routes, nav) built in main session first. Also pinned Math.random in the statusCounts test to kill a latent 5%-error-injection flake.

# Phase 4: Repair detail/create + KT board

## Overview

Rebuild repair Detail page and Create form to legacy reference parity (fieldsets, log tables, print actions, image gallery, quick-create modals, legacy validation set), and add the missing technician-scoped list page `Sửa Chữa-Bảo Hành KT` (`/RepairingM/Index` counterpart). Drops invented local sections per locked D3. Reads/edits the LIVE repair layer (`MOCK_TICKETS`, D5). Depends on P1 (legacy 15-status module + `KT_BOARD_STATUS_IDS` set, live `MOCK_TICKETS` + Tỉnh/Quận/Xã + `TUYEN` lookups), P3 (operations-console fields incl. P3-owned `hinhThuc`/warranty taxonomy — Finding 4), and P2 (`print-window`, `ServerAutocomplete` + `[+]` quick-create pattern, DataTable extensions).

## Context links

- Primary contract: `plans/reports/brainstorm-260703-repair-detail-create-refspec.md` (detail/create spec + confirmed JS endpoints; gap rows D1-D13, C1-C13)
- KT board spec: `plans/reports/ref-ui-parity-sections/section-repair-kt-dashboard.md` (RepairingM section)
- Locked decisions + primitive ownership: `plans/260703-1908-reference-ui-parity-tdd/plan.md`
- Local code: `src/features/repair-detail/`, `src/features/repair-create/`, `src/features/repair-list/` (column-hook base for KT board), `src/domains/repair/` (types, status, mock-data, reference-data), `src/constants/routes.ts`, `src/routes/index.tsx`, `src/config/nav-config.tsx`, `src/components/shared/data-table/`

## Requirements

Functional (traceable to refspec gap rows):

- **D1**: Detail toolbar gets `Tạo mới`, `In Tem Sửa Chữa` (tem print layout), `In Biên Nhận` (receipt print), `Danh sách phiếu` — prints via P2 `print-window`.
- **D5**: `Hình` gallery on detail: thumbs, click → zoom/carousel modal titled `Danh sách hình` with `In hình` button, hover-delete with confirm `Bạn có muốn xóa không?`.
- **D2**: `Nhật ký điều phối kỹ thuật viên` table: `STT | Kỹ thuật | Ngày tạo | Người tạo | Tiền công | Tình trạng | Ngày hủy | Người hủy`.
- **D3**: `Danh sách cấp linh kiện` + `Danh sách trả linh kiện` tables; row modals `Trả linh kiện` and `Thu xác linh kiện`. Replaces invented "Linh kiện sử dụng" table.
- **D4**: `Lịch sử máy` section (prior repairs of same serial).
- **D6**: `Nhật ký chuyển chi nhánh` section; empty state `Không có dữ liệu` (shared by all log sections).
- **D7**: Status log becomes table `Nhật ký tình trạng máy`: `STT | Tình trạng | Ngày tạo | Người tạo | Giá | Nội dung SC | Ghi chú`, status cell color-coded (P1 hex).
- **D8/D9/D12**: Detail fieldsets carry all reference fields incl. `Nội dung sửa chữa:`, `Phụ kiện kèm theo:`, `Ngày mua:`, `Nơi mua:`, `Khu vực:`, separate `Nhà sản xuất:`/`Model:` rows, agent block `Đại lý/Siêu Thị/Cửa Hàng/Trạm:` + `Điện thoại:` + `Địa chỉ:`, `Mail:`; `Số phiếu:` colored by status hex with tooltip = status name.
- **D11 (scoped)**: `Sửa gấp` checkbox editable on detail (mock update + toast); rest of detail stays read-only.
- **C1/C13**: Create form adds `Số phiếu hãng`, `Số phiếu đại lý`, `Phụ kiện kèm theo`, `Ngày mua`, `Nơi mua`, `Khu vực` (required), `Sửa gấp`, `Loại bảo hành` radios `Tại TTBH`/`Tại Nhà`; label fixes `Ngày hẹn giao`, `Mô tả hư hỏng`.
- **C2**: Required set = legacy validation: `Serial`, `CustomerId` (existing customer only), `ModelId`, `Mô tả hư hỏng`, `Hình thức BH`, `Khu vực`. NSX/Sản phẩm optional. No inline new-customer mode.
- **C5**: NO technician select at create (assigned later via dispatch).
- **C7**: Sản phẩm / Nhà sản xuất / Model independent autocompletes — no cascade, model typable directly.
- **C9**: `Hình thức BH` = 3 radios `Bảo hành` (1), `BH sửa chửa` (2), `Sửa dịch vụ` (3).
- **C4**: 5 `[+]` quick-create modals: sản phẩm / nhà sản xuất / model / khu vực / khách hàng (P2 pattern).
- **C3**: `Hình` upload section: multi-file image/video input, client preview grid, per-item remove, `Tải tất cả hình` button.
- **C6**: 3 submit modes ` Lưu ` / ` Lưu & Thêm mới ` / ` Lưu & Đóng ` + toolbar links `Thêm phiếu`, `Danh sách phiếu`.
- **C10**: Serial focusout → `Lịch sử máy` panel on create page (same component as D4).
- **C12**: `Số phiếu` read-only `<<Phát sinh tự động>>`; `Người nhận` read-only current mock user.
- **C11 + D13 (per D3 locked)**: delete invented `Chi phí dự kiến`, `Loại lỗi sửa chữa` grid, `Ghi chú nội bộ` split, detail `Chi phí` card, required-KTV.
- **KT board (section spec, all 3 high gaps)**: new page `Sửa Chữa-Bảo Hành KT` at `/sua-chua-bao-hanh-kt`: KT-scoped list (10-status workshop subset only), 12-field collapsible search, 14-column table, dual pagination `Tổng: N dòng, Trang x / y`, per-row photo-upload action, buttons `Tìm kiếm` / `Tải lại trang`.

Non-functional:

- All labels exact Vietnamese per specs (spec tests assert them).
- Extend `DataTable`/existing hooks, never fork (plan.md primitive rule).
- Files >200 lines get section-module split (matches existing `sections/` convention).
- `npm run type-check && npm run lint && npm run test && npm run build` clean at phase end.

## Architecture

- **Data model** (extend `src/domains/repair/types.ts` + the LIVE `mock-data.ts` generator in place — D5; P1 landed statuses + minimal fields, P3 added the operations-console fields incl. the warranty taxonomy; add only what detail/create/KT still need):
  - `RepairTicket` +: `soPhieuDaiLy?`, `noiDungSuaChua?`, `phuKienKemTheo?`, `ngayMua?`, `noiMua?`, `khuVuc` (id + label), `suaGap: boolean`, `warrantyAt: 0 | 1` (`Tại TTBH`/`Tại Nhà`), `ngayGiao?`, `images: TicketMedia[]`.
  - New types: `TicketMedia {id, url, kind: 'image'|'video'}`, `DispatchLogEntry {kyThuat, ngayTao, nguoiTao, tienCong, tinhTrang, ngayHuy?, nguoiHuy?}`, `PartsIssueEntry`, `PartsReturnEntry`, `BranchTransferEntry`.
  - `StatusHistoryEntry` +: `gia?`, `noiDungSC?` (existing `note` renders as `Ghi chú`).
  - **Warranty taxonomy is P3-owned (Finding 4)**: `hinhThuc`/`WarrantyType` (`Bảo hành` / `BH sửa chữa` / `Sửa dịch vụ`) + `loaiBaoHanh` were migrated onto the live layer by P3. P4 **consumes** that shape — do NOT re-own or re-migrate. If P4 finds it missing (P3 somehow skipped), that's a P3 gap to fix in P3, not a fork here. Verify the export at phase start.
- **Status coloring**: consume P1 legacy status module (ids + hex + `KT_BOARD_STATUS_IDS` of 10). No status definitions in this phase.
- **Detail page**: `RepairDetailPage.tsx` becomes thin orchestrator; sections split into `src/features/repair-detail/sections/`. Timeline component replaced by status-log table (legacy is tabular).
- **Serial history**: one shared `SerialHistoryPanel` used by detail (`Lịch sử máy` section) and create (focusout load). Lives in `src/features/repair-detail/sections/`, imported by create (no new shared layer for a single 2-consumer component — KISS).
- **Prints**: reuse P2 `print-window.tsx`; receipt layout (`In Biên Nhận` = legacy `/Print/ReceiptRepairing`) is built by P3 (list has same receipt print) — reuse it; this phase adds only the `In Tem Sửa Chữa` tem layout (legacy `/Print/RepairingTemDan`, distinct from list tem) in the P2/P3 print-layouts dir (extend in place).
- **Quick-create**: instantiate P2 `ServerAutocomplete` + quick-create modal pattern 5×; modal form bodies in `src/features/repair-create/quick-create/`. Created records push into `reference-data`/mock stores so the autocomplete finds them immediately.
- **Create form**: keep RHF + Zod; schema rewritten to legacy validation set with legacy messages. Submit mode carried via button `data-value` → `Lưu` = save → navigate detail; `Lưu & Thêm mới` = save → reset form (stay); `Lưu & Đóng` = save → navigate list (mirrors legacy `saveNew`/`saveClosed`; plain save deviates from legacy reload-as-edit — noted in Unresolved).
- **KT board**: new feature dir `src/features/repair-kt/` reusing shared `DataTable` + a KT column hook modeled on `use-repair-table-columns.tsx` (own column set — different enough that a separate hook file beats prop-switching; underlying DataTable/`useTableState` reused). Mock fetch filters `MOCK_TICKETS` to the 10-status KT subset. Route added to flat IA (D1).

## Related Code Files

- **Create:**
  - `src/features/repair-detail/sections/ProductInfoSection.tsx`, `TicketInfoSection.tsx`, `CustomerInfoSection.tsx`, `ReceiveInfoSection.tsx`
  - `src/features/repair-detail/sections/ImageGallerySection.tsx` (+ zoom/carousel modal `Danh sách hình`)
  - `src/features/repair-detail/sections/StatusLogTable.tsx`, `DispatchLogTable.tsx`, `BranchTransferLog.tsx`, `PartsIssuedTable.tsx`, `PartsReturnedTable.tsx`, `SerialHistoryPanel.tsx`
  - `src/features/repair-detail/sections/TraLinhKienModal.tsx`, `ThuXacLinhKienModal.tsx`
  - `src/features/repair-create/sections/TicketInfoSection.tsx`, `ReceiveInfoSection.tsx`, `ImageUploadSection.tsx`
  - `src/features/repair-create/quick-create/` — `QuickCreateSanPham.tsx`, `QuickCreateNhaSanXuat.tsx`, `QuickCreateModel.tsx`, `QuickCreateKhuVuc.tsx`, `QuickCreateKhachHang.tsx`
  - `src/features/repair-kt/RepairKtListPage.tsx`, `RepairKtFilters.tsx`, `UpdateImageModal.tsx`, `hooks/use-repair-kt-columns.tsx`
  - Print layout: tem doc `RepairingTemDan` in the P2 print-layouts dir (e.g. `src/features/print/layouts/tem-sua-chua.tsx` — follow P2's actual dir)
  - Co-located tests: `RepairDetailPage.test.tsx`, `RepairCreateForm.test.tsx`, `RepairKtListPage.test.tsx`, `SerialHistoryPanel.test.tsx`, plus per-modal tests
- **Modify:**
  - `src/features/repair-detail/RepairDetailPage.tsx` (orchestrator rewrite)
  - `src/features/repair-create/RepairCreateForm.tsx` (schema + layout rewrite), `RepairCreatePage.tsx` (toolbar), `sections/DeviceSection.tsx` (→ legacy `Thông tin sản phẩm` content), `sections/CustomerSection.tsx` (existing-customer-only + info panel)
  - `src/domains/repair/types.ts`, `mock-data.ts` (LIVE `MOCK_TICKETS` — new fetchers/mutators + log data on the live layer), `reference-data.ts` (Tỉnh/Quận/Xã lookup already added by P1; consume)
  - `src/constants/routes.ts` (`repairKt: '/sua-chua-bao-hanh-kt'`), `src/routes/index.tsx`, `src/config/nav-config.tsx` (entry `Sửa Chữa-Bảo Hành KT`)
  - `src/features/repair-list/hooks/use-repair-table-columns.tsx` + `RepairFiltersAdvanced.tsx`: NOT touched for taxonomy (P3 owns `HinhThuc`); touch only if a KT-specific column/label needs it.
- **Delete:**
  - `src/features/repair-detail/RepairStatusTimeline.tsx` (replaced by StatusLogTable)
  - `src/features/repair-create/sections/CostEstimateSection.tsx`, `SymptomSection.tsx`, `ServiceSection.tsx` (invented, per D3; surviving fields redistributed)

## TDD Plan

1. **Characterization tests (lock survivors before refactor):**
   - `RepairDetailPage.test.tsx`: seeded ticket route renders `soPhieu`; unknown id renders `Không tìm thấy phiếu sửa chữa` + `Quay lại danh sách`.
   - `mock-data.test.ts` (extend): `fetchRepairById` throws `NOT_FOUND`; `createRepairTicket` unshifts into `MOCK_TICKETS` with `PSC-` id and initial status-history entry.
   - `RepairCreateForm.test.tsx`: successful submit navigates (mode-dependent — locked loosely as "navigates on save").
2. **Failing spec tests (cite refspec / section file per test):**
   - Detail toolbar: buttons/links exactly `Tạo mới`, `In Tem Sửa Chữa`, `In Biên Nhận`, `Danh sách phiếu`; clicking each print spies P2 print-window open.
   - Detail section headings all present in order: `Thông tin sản phẩm`, `Thông tin phiếu`, `Thông tin khách hàng`, `Thông tin nhận`, `Hình`, `Nhật ký tình trạng máy`, `Nhật ký điều phối kỹ thuật viên`, `Nhật ký chuyển chi nhánh`, `Danh sách cấp linh kiện`, `Danh sách trả linh kiện`, `Lịch sử máy`.
   - Status log headers `['STT','Tình trạng','Ngày tạo','Người tạo','Giá','Nội dung SC','Ghi chú']`; dispatch log headers `['STT','Kỹ thuật','Ngày tạo','Người tạo','Tiền công','Tình trạng','Ngày hủy','Người hủy']`; empty log sections show `Không có dữ liệu`.
   - Product fieldset rows: `Sản phẩm:`, `Nhà sản xuất:`, `Model:`, `Số Serial:`, `Mô tả hư hỏng:`, `Nội dung sửa chữa:`, `Phụ kiện kèm theo:`, `Ngày mua:`, `Nơi mua:`, `Ghi chú:`. Phiếu fieldset: `Số phiếu:` (styled with status hex, tooltip = status name), `Số phiếu hãng:`, `Hình thức BH:`, `Loại bảo hành:` + editable `Sửa gấp` checkbox, `Khu vực:`. Customer fieldset incl. `Mail:` and `Đại lý/Siêu Thị/Cửa Hàng/Trạm:`. Nhận fieldset: `Ngày nhận:`, `Người nhận:`, `Ngày hẹn giao:`, `Kỹ thuật viên:`.
   - Gallery: thumb click opens modal `Danh sách hình` with `In hình`; delete hover action → confirm `Bạn có muốn xóa không?` → item removed.
   - Parts-issued row actions open modals titled `Trả linh kiện` and `Thu xác linh kiện`.
   - Invented sections absent: no `Chi phí` card, no `Linh kiện sử dụng` heading.
   - Create — labels/inputs: `Số phiếu` shows `<<Phát sinh tự động>>`; fields `Số phiếu hãng`, `Số phiếu đại lý`, `Phụ kiện kèm theo`, `Ngày mua`, `Nơi mua`, `Khu vực`; radios `Hình thức BH` exactly `['Bảo hành','BH sửa chửa','Sửa dịch vụ']`; radios `Loại bảo hành` `['Tại TTBH','Tại Nhà']` with `Tại Nhà` default-checked; checkbox `Sửa gấp`; NO `Kỹ thuật viên` input; `Người nhận` read-only; customer autocomplete placeholder `Nhập vào Tên / Số điện thoại 1-2`; button `Chọn khách khác` after pick.
   - Create — validation messages on empty submit: `Vui lòng chọn Model!`, `Vui lòng nhập số serial!`, `Vui lòng nhập mô tả hư hỏng!`, `Vui lòng chọn hình thức bảo hành!`, `Vui lòng nhập khách hàng!`, Khu vực required; NSX/Sản phẩm empty does NOT block submit; Model autocomplete usable with NSX empty (no cascade).
   - Create — submit buttons `['Lưu','Lưu & Thêm mới','Lưu & Đóng']`; `Lưu & Thêm mới` resets form in place; `Lưu & Đóng` navigates to list; toolbar links `Thêm phiếu`, `Danh sách phiếu`.
   - Create — 5 `[+]` addons open quick-create modals titled `Thêm sản phẩm`, `Thêm nhà sản xuất`, `Thêm model`, `Thêm khu vực`, `Thêm khách hàng`; saving pushes record selectable in the autocomplete.
   - Create — file input `multiple accept="image/*"` renders preview items with remove; `Tải tất cả hình` present; serial focusout renders `Lịch sử máy` panel.
   - KT board: route `/sua-chua-bao-hanh-kt` renders title `Danh sách Phiếu sửa chữa`; 14 headers in order `['#','#','Phiếu sửa chữa','Khách hàng','Thông tin sản phẩm','Kỹ thuật','Loại SC','Chi phí','Ngày nhận','Ngày giao','Chi tiết SC','Ghi chú','Người nhận','Khu vực']`; status filter presents exactly 10 options in the **display order** `[2,4,15,6,7,13,17,16,8,9]` — `Đã Điều Phối(2,#00CCFF)`, `Báo Giá(4,#9966CC)`, `Chờ Báo Giá(15,#31065c)`, `Chờ Xác Nhận(6,#996600)`, `Chờ Linh Kiện(7,#4B0082)`, `Đã Có Linh Kiện(13,#6D5582)`, `Đã Đặt Linh Kiện(17,#112233)`, `Chờ Phiếu Hãng(16,#06385c)`, `Trả Lại(8,#CC3300)`, `Sửa Xong(9,#3300FF)`. **Finding 14 — assert two distinct things, never deep-equal one against the other:** (a) *membership* — the option id **set** equals P1's `KT_BOARD_STATUS_IDS` (compare sorted: `[...optionIds].sort((a,b)=>a-b)` deep-equals `[2,4,6,7,8,9,13,15,16,17]`); (b) *presentation sequence* — the rendered option order deep-equals this phase's own `KT_DISPLAY_ORDER = [2,4,15,6,7,13,17,16,8,9]` constant (defined in the KT board module, NOT in P1). Each hex = `hexOf(id)` from P1. Excluded statuses (`Mới Nhận`, `Đã Giao Cho Khách`, …) absent from options AND rows; `Hình thức chung` options `['Bảo hành','Sửa dịch vụ','BH sửa chữa']` (P3-owned taxonomy, consumed here); filter placeholders `Số phiếu SC`, `Số phiếu hãng`, `Số Serial`, `Tên khách hàng`, `Điện thoại`, `Tên nhà sản xuất`, `Sản phẩm` (V4 — legacy `Sản phầm` typo corrected), `Model`, `Tên Tỉnh`, `TP/Huyện`; buttons `Tìm kiếm`, `Tải lại trang`; pagination label `Tổng: N dòng, Trang x / y` above and below; row photo-upload action opens `UpdateImageModal` and adds media to ticket.
3. **Implementation order to green:** domain types/mock-data → detail sections (info fieldsets → log tables → gallery → modals → prints) → create rewrite (schema → fieldsets → quick-create → images → save modes → serial history) → KT board (route/nav → filters → columns → photo modal) → delete invented files → full gate run.

## Implementation Steps

1. **Domain layer** (`src/domains/repair/types.ts`, LIVE `mock-data.ts`): add fields/types per Architecture; on the `MOCK_TICKETS` generator populate 2-3 tickets with `images`, dispatch entries, parts issue/return, branch transfer, multi-entry status history carrying `Giá`/`Nội dung SC`/`Ghi chú`; ≥2 tickets sharing a serial (serial-history data). Add `fetchSerialHistory(serial, modelId?)`, `fetchRepairKtList(filters)` (KT subset via P1 `KT_BOARD_STATUS_IDS`, displayed via this phase's `KT_DISPLAY_ORDER` — Finding 14), `deleteTicketMedia(ticketId, mediaId)`, `addTicketMedia`, `updateSuaGap`, `searchLocations`, and quick-create mutators (`createSanPham`, `createNhaSanXuat`, `createModel`, `createTuyen`, `createKhachHang`) pushing into the reference stores. **`HinhThuc`/`WarrantyType` + `warrantyAt` are already migrated by P3 (Finding 4) — consume, do not re-migrate.**
2. **Detail info sections**: build `ProductInfoSection` (rows `Sản phẩm:`, `Nhà sản xuất:`, `Model:`, `Số Serial:`, `Mô tả hư hỏng:` red, `Nội dung sửa chữa:` red, `Phụ kiện kèm theo:`, `Ngày mua:`, `Nơi mua:`, `Ghi chú:`), `TicketInfoSection` (`Số phiếu:` colored by status hex + tooltip status name, `Số phiếu hãng:`, `Hình thức BH:` bold, `Loại bảo hành:` + editable `Sửa gấp` checkbox → `updateSuaGap` + success toast, `Khu vực:`), `CustomerInfoSection` (`Họ tên:`, `Mail:`, `Điện thoại:`, `Địa chỉ:`, bold agent block `Đại lý/Siêu Thị/Cửa Hàng/Trạm:`, `Điện thoại:`, `Địa chỉ:`), `ReceiveInfoSection` (`Ngày nhận:` dd/MM/yyyy hh:mm, `Người nhận:`, `Ngày hẹn giao:`, `Kỹ thuật viên:`). Two-column grid (sản phẩm left / phiếu right) like legacy.
3. **Detail log tables**: `StatusLogTable` (`STT | Tình trạng | Ngày tạo | Người tạo | Giá | Nội dung SC | Ghi chú`, status cell colored), `DispatchLogTable` (`STT | Kỹ thuật | Ngày tạo | Người tạo | Tiền công | Tình trạng | Ngày hủy | Người hủy`), `BranchTransferLog`, `PartsIssuedTable`, `PartsReturnedTable`, `SerialHistoryPanel` (`Lịch sử máy`). Shared empty state `Không có dữ liệu` (reuse `EmptyState` if it fits, else plain row). Plain semantic tables — no DataTable (no paging/sorting needed).
4. **Parts modals**: `TraLinhKienModal` (title `Trả linh kiện`; quantity issued vs quantity-to-return inputs per legacy `amount`/`amounttra` params) and `ThuXacLinhKienModal` (title `Thu xác linh kiện`; branch + quantity per `branchId`/`amount`); wire as row actions on `PartsIssuedTable`; confirm → mock mutation appends to `Danh sách trả linh kiện` / marks record + toast.
5. **Gallery**: `ImageGallerySection` (`Hình`): thumb grid from `ticket.images`; click → dialog `Danh sách hình` (carousel + `In hình` printing active image via P2 print-window); hover delete icon → confirm dialog `Bạn có muốn xóa không?` → `deleteTicketMedia`.
6. **Detail toolbar + prints**: rewrite `RepairDetailPage.tsx` header: `Tạo mới` (→ `ROUTES.repairCreate`), `In Tem Sửa Chữa`, `In Biên Nhận`, `Danh sách phiếu` (→ `ROUTES.repairList`). Add tem layout (`RepairingTemDan`-equivalent: compact label with số phiếu, model, serial, ngày nhận) in P2 print-layouts dir; reuse P3 receipt layout for `In Biên Nhận`. Remove `Chi phí` card, `Linh kiện sử dụng` table, `Chỉnh sửa`/`Quay lại` buttons; delete `RepairStatusTimeline.tsx`.
7. **Create schema + toolbar**: rewrite Zod schema — required: `serial` (`Vui lòng nhập số serial!`), `customerId` min 1 (`Vui lòng nhập khách hàng!`), `modelId` min 1 (`Vui lòng chọn Model!`), `moTaHuHong` (`Vui lòng nhập mô tả hư hỏng!`), `warrantyType` (`Vui lòng chọn hình thức bảo hành!`), `khuVucId`; optional: sản phẩm, NSX, chi nhánh, serial-adjacent fields. Remove `kyThuatId`, `chiPhiDuKien`, `loiSuaChua`, inline `tenKhach`/`sdt`. Sticky toolbar buttons ` Lưu ` / ` Lưu & Thêm mới ` / ` Lưu & Đóng ` (submit mode state) + links `Thêm phiếu`, `Danh sách phiếu`; keep Ctrl+Enter → `Lưu`.
8. **Create fieldset `Thông tin sản phẩm`** (rework `DeviceSection.tsx`): P2 `ServerAutocomplete` ×3 — `Sản phẩm` (placeholder `Tên sản phẩm`, `[+]` tooltip `Thêm mới sản phẩm`), `Nhà sản xuất` (`Tên nhà sản xuất`, `[+]` `Thêm mới nhà sản xuất`), `Model`* (`Tên model`, `[+]` `Thêm mới model`) — independent, no cascade (drop `getProductsByManufacturer`/`getModelsByProduct` gating). Then `Số Serial` (focusout → `fetchSerialHistory` → render `SerialHistoryPanel` at page bottom), `Mô tả hư hỏng`* textarea, `Phụ kiện kèm theo` textarea, `Ngày mua` datepicker, `Nơi mua` text, `Ghi chú` textarea.
9. **Create fieldset `Thông tin phiếu`** (new `TicketInfoSection.tsx`): `Chi nhánh` select (options rendered from `BRANCHES` — through P4 that's `TTBH … Đăk lăk` default + `… Đăk nông`; the 3rd `Cộng tác viên tuyến huyện` is added by P6 per validation V1, so do NOT hardcode it here), `Số phiếu` read-only `<<Phát sinh tự động>>`, `Số phiếu hãng` text, `Số phiếu đại lý` text, `Hình thức BH`* radios `Bảo hành`/`BH sửa chửa`/`Sửa dịch vụ`, `Loại bảo hành` radios `Tại TTBH`/`Tại Nhà` (default `Tại Nhà`) + `Sửa gấp` checkbox, `Khu vực`* autocomplete (`Tên khu vực`, `[+]` `Thêm mới khu vực`).
10. **Create fieldset `Thông tin khách hàng`** (rework `CustomerSection.tsx`): existing-customer autocomplete only (placeholder `Nhập vào Tên / Số điện thoại 1-2`, dropdown columns Họ tên | Điện thoại 1 | Điện thoại 2 | Địa chỉ); after pick show info panel `Họ tên:`, `Mail:`, `Điện thoại:`, `Điện thoại 2:`, `Địa chỉ:`, `Tên Đại lý/Siêu Thị/Cửa Hàng/Trạm:`, `Email:`, `Điện thoại:`, `Địa chỉ:`, `Khu vực:`, `Khoảng cách:` + button `Chọn khách khác`; `[+]` addon `Thêm mới khách hàng`. Extend `Customer` type/mock with `sdt2`, `email`, agent contact fields as needed.
11. **Create fieldset `Thông tin nhận`** (new `ReceiveInfoSection.tsx`): `Ngày hẹn giao` datepicker, `Ngày nhận` datepicker default today, `Người nhận` read-only mock current user. No KTV input.
12. **Create fieldset `Hình`** (new `ImageUploadSection.tsx`): `Tải tất cả hình` button (anchors-download previews), `<input type="file" multiple accept="image/*">` (+ video accept per legacy remove-video support) → FileReader dataURL preview grid with per-item remove; files pass into `createRepairTicket` → stored as `images`.
13. **Quick-create modals** (`src/features/repair-create/quick-create/`): 5 modal forms per P2 pattern — titles `Thêm sản phẩm`, `Thêm nhà sản xuất`, `Thêm model`, `Thêm khu vực`, `Thêm khách hàng`; minimal name(+phone/address for khách hàng) fields; on save call step-1 mutators, toast, auto-select in the owning autocomplete.
14. **Save flows**: `Lưu` → create + toast + navigate `ROUTES.repairDetail(id)`; `Lưu & Thêm mới` → create + toast + `reset()`; `Lưu & Đóng` → create + navigate `ROUTES.repairList`. Update `createRepairTicket` signature for new field set (khuVucId, warrantyType, warrantyAt, suaGap, soPhieuDaiLy, images…), initial status = legacy `Mới Nhận` id per P1 module.
15. **KT board routing**: add `repairKt: '/sua-chua-bao-hanh-kt'` to `src/constants/routes.ts`; lazy route in `src/routes/index.tsx`; nav entry `Sửa Chữa-Bảo Hành KT` in `src/config/nav-config.tsx` directly after `Sửa Chữa-Bảo Hành` (D1 flat IA).
16. **KT board page** (`src/features/repair-kt/`): `RepairKtListPage.tsx` — breadcrumb `Trang chủ / Danh sách phiếu sửa chữa`, box title `Danh sách Phiếu sửa chữa`; `RepairKtFilters.tsx` collapsible panel with fields in order: `Số phiếu SC`, `Số phiếu hãng`, `Số Serial`, `Tên khách hàng`, `Điện thoại`, `Tên nhà sản xuất` (autocomplete), `Sản phẩm` (autocomplete — V4: legacy `Sản phầm` typo corrected), `Model` (autocomplete), `Tình trạng` (10-option KT subset from P1, per-option colors), `Hình thức chung` (`Bảo hành`/`Sửa dịch vụ`/`BH sửa chữa`), `Tên Tỉnh`, `TP/Huyện` (P1 hierarchy); buttons `Tìm kiếm`, `Tải lại trang` (resets filters).
17. **KT columns** (`hooks/use-repair-kt-columns.tsx`, modeled on `use-repair-table-columns.tsx`, reusing `DataTable` + `useTableState` with own `TABLE_ID 'repair-kt'`): 14 cols `#` (status color block), `#` (actions), `Phiếu sửa chữa`, `Khách hàng`, `Thông tin sản phẩm`, `Kỹ thuật`, `Loại SC` (warranty-type label), `Chi phí`, `Ngày nhận`, `Ngày giao`, `Chi tiết SC` (nội dung sửa chữa), `Ghi chú`, `Người nhận`, `Khu vực`. Actions: view detail (→ `ROUTES.repairDetail`) + photo upload (opens `UpdateImageModal` → `addTicketMedia` + toast). Pagination label `Tổng: N dòng, Trang x / y` rendered above and below table (extend `data-table-pagination.tsx` with a `position`/label slot in place if needed — do not fork).
18. **Cleanup + gates**: delete `CostEstimateSection.tsx`, `SymptomSection.tsx`, `ServiceSection.tsx`, `RepairStatusTimeline.tsx`; grep for dangling imports; run `npm run test`, `npm run type-check`, `npm run lint`, `npm run build`; fix regressions (repair-list tests from P3 stay green — no taxonomy migration here, so they must not need changes).

## Success Criteria

- [ ] Detail page shows all 11 legacy sections with exact headings; spec tests for both log-table header arrays pass.
- [ ] `In Tem Sửa Chữa` and `In Biên Nhận` open print windows (spied in tests, manually render print CSS).
- [ ] Image gallery zoom modal `Danh sách hình` + delete confirm `Bạn có muốn xóa không?` work against mock data.
- [ ] `Trả linh kiện` / `Thu xác linh kiện` modals open from parts-issued rows and mutate mock state.
- [ ] Create form: legacy required set enforced with exact messages; NO technician select; independent autocompletes; 5 quick-create modals functional; image preview grid works; `<<Phát sinh tự động>>` shown.
- [ ] 3 save modes behave as specced (`Lưu & Thêm mới` resets, `Lưu & Đóng` → list).
- [ ] Serial focusout renders `Lịch sử máy` on create; same panel on detail.
- [ ] `/sua-chua-bao-hanh-kt` reachable from sidebar `Sửa Chữa-Bảo Hành KT`; 14 exact headers; status filter = exactly the 10 KT `(id,hex)` pairs; rows never contain excluded statuses; dual pagination labels.
- [ ] Invented artifacts gone: no `Chi phí` card, `Linh kiện sử dụng`, `Chi phí dự kiến`, `Loại lỗi sửa chữa`, required-KTV (grep clean).
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` all clean.

## Risk Assessment

- **P1/P3 contract drift** (status module shape, `KT_BOARD_STATUS_IDS` set vs this phase's `KT_DISPLAY_ORDER` — Finding 14, warranty taxonomy owned by P3 — Finding 4, receipt print layout, ServerAutocomplete API): verify actual exports at phase start; extend in place per plan.md rule. Mitigation: characterization tests written first catch breakage. Warranty taxonomy is a P3 deliverable — if it's genuinely missing at P4 start, fix it in P3 rather than forking a second migration here.
- **Large blast radius on `types.ts`/`mock-data.ts`** (shared with repair-list): run full test suite after step 1 before UI work.
- **Unmirrored legacy partials** (modal bodies, some columns) force invented minimal UIs — kept small and flagged in Unresolved so a later spec pass can correct cheaply.
- **File-upload in happy-dom**: FileReader preview tests may need `URL.createObjectURL` stubs in `src/test/` setup — add stub there, not per-test.
- **Rollback**: phase is additive + section-file rewrites; revert = `git revert` the phase commits; deleted invented sections recoverable from git history. No persistent-storage migrations (mock-only SPA).

## Unresolved

1. Column sets unknown (empty in mirror): `Lịch sử máy`, `Danh sách cấp linh kiện`, `Danh sách trả linh kiện`, `Nhật ký chuyển chi nhánh` — proposing minimal columns (e.g. Lịch sử máy: `Số phiếu | Ngày nhận | Tình trạng | Mô tả hư hỏng | Kỹ thuật`); confirm or re-mirror with populated data.
2. `Trả linh kiện` / `Thu xác linh kiện` modal partial bodies not mirrored — field layout inferred from query params (`amount`/`amounttra`/`branchId`).
3. KT board `Hành động` row-action set unknown (`repairing-m.js` not mirrored) — implementing detail-link + photo-upload per task scope; more actions may exist.
4. KT column data mapping assumptions: `Loại SC` = warranty-type label, `Chi tiết SC` = `Nội dung sửa chữa`, `Chi phí` = latest status-log `Giá`; `Ngày giao` needs new `ngayGiao` field.
5. Legacy plain `Lưu` reloads the create partial as an edit form; local maps it to "navigate to detail" (detail is read-mostly here). Acceptable deviation?
6. KT scoping is status-subset only (no auth/technician identity in mock SPA) — per-technician row filtering deferred until a mock current-user concept exists (P7 permissions?).
7. **RESOLVED (validation V4):** filter placeholder legacy typo `Sản phầm` → **corrected to `Sản phẩm`** (D3 = data fidelity, not bug-for-bug UI strings).
