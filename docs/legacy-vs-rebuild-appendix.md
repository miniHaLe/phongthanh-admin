# Legacy vs Rebuild — Detailed Gap Appendix

Companion to **[legacy-vs-rebuild-comparison.md](./legacy-vs-rebuild-comparison.md)**.
This file holds the **full per-section gap-closure tables** (the main doc carries
only rollups). Split planned up front — 88 high + 121 medium rows across 12 sections
exceed the 800-line/file cap in the main doc.

**Column key:** `Gap (old)` = the reference-vs-rebuild gap from the 260703 matrix ·
`Sev` = high/med · `Conf` = confidence (`confirmed`/`likely`/`unconfirmed`, glossary
§2) · `Rebuild status` = Closed(mock) / Deviation / Deferred (glossary §1) · `Note`
· `Src` = source section file.

**Confidence rule applied throughout:** status-vocabulary and shipped-code facts are
`confirmed` (cross-checked vs phase notes + `src/` tree); any old-site column/behavior
the section file marked "inferred / AJAX-unverified / not captured" is `likely`.
Lows (75 total) are cosmetic/intentional-IA and summarized per section, not tabled.

Source files (read-only): `plans/reports/ref-ui-parity-sections/section-*.md`,
`plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md`.

> **Current rebuild status — 2026-07-16.** The `Closed (mock)` labels below are a
> preserved 2026-07-07 parity snapshot, not a current blanket architecture claim.
> Auth plus 21 release resources now use NestJS/Postgres; most repair, warehouse,
> finance, HR, and report workflows remain mock-backed, and the permission matrix
> still has no server-side enforcement. Historical rows remain unchanged for
> traceability.

---

## 1. Shell / nav / layout — 4H / 6M / 6L

Src: `section-shell-nav-layout.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| 'Sửa Chữa-Bảo Hành KT' (/RepairingM) nav/route/page missing entirely | high | confirmed | Closed (mock) | Built as RepairKtListPage (P4), added to flat IA |
| SignalR call-center missing (toast "Có cuộc gọi mới !" → Tiếp nhận → intake) | high | confirmed | Closed (mock) | Demo toast via Ctrl+Shift+G → repair intake (P2); real SignalR replaced by demo trigger (D4) |
| Notification bell not wired to RepairingStatusHistory | high | confirmed | Closed (mock) | Bell → notification store + /thong-bao list page (P2) |
| News/messages dropdown (unread badge, mark-seen, list/detail) missing | high | confirmed | Closed (real API) | `/tin-tuc` list/search/create/detail uses authenticated CRUD; notification seen-state remains client-side |
| 'Danh sách trả LK xác' nav child + route missing | med | confirmed | Closed (mock) | DSTraLKXac page built (P5) |
| 'Thông Tin Tài Khoản' (/User/Detail) profile page missing | med | confirmed | Closed (mock) | /tai-khoan read-only profile (P2/P7) |
| 'Bản đồ chi nhánh' Google Maps modal missing globally | med | likely | Closed (mock) | BranchMapModal w/ OSM embed (P2); Places search not mirrored |
| Support/contact dropdown (fa-question) missing | med | confirmed | Closed (mock) | SupportDropdown (P2) |
| Report menu child set differs from ref's 6 reports | med | confirmed | Deliberate deviation | 6 canonical + local extras kept (V5, P7) |
| Home concept swap: ref FullCalendar plan vs local KPI dashboard | med | confirmed | Deliberate deviation | Calendar folded in as dashboard tab, KPI kept as home (D1) |

**Lows (6):** sidebar user-panel, footer version/copyright, user-dropdown phone,
dead "Trả hàng cho nhà cung cấp" link, "Danh mục chính" header, label renames —
cosmetic/intentional IA (D1).

---

## 2. Repair workspace /Repairing/Index_8 — 8H / 8M / 3L

Src: `section-repair-main.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Status vocab mismatch: 15 legacy fixed-id/color vs 16 invented snake_case | high | confirmed | Closed (mock) | `status.ts` = 15 legacy ids+hex (P1, D2); no snake_case anywhere post-P1 |
| Row-actions column missing (đổi tình trạng, chi tiết, cấp LK, giao máy, lịch hẹn) | high | confirmed | Closed (mock) | 7 row-action modals + row-actions-cell (P3) |
| Technician dispatch (Điều phối/Đổi KT/Hủy + batch) missing | high | confirmed | Closed (mock) | dispatch lifecycle in mock-mutations + modal (P3) |
| Multi-select + batch ops (Chuyển CN, 5 prints, batch status/tech, SMS) missing | high | confirmed | Closed (mock) | repair-batch-toolbar + 5 print layouts; SMS as toast (D4, P3) |
| Báo giá (quote) workflow missing (Báo Giá + DeleteBaoGia) | high | confirmed | Closed (mock) | Chi phí cell → quote modal, setQuote/deleteQuote (P3) |
| 'Sửa chữa' progress column missing (Sửa xong/TAT/Giao máy/Tồn dwell) | high | likely | Closed (mock) | progress cell + formatDwell (P3); dwell static per render, not wall-clock |
| Per-status live-count legend (15 colored squares + counts) missing | high | confirmed | Closed (mock) | status-legend.tsx w/ display order + counts (P3) |
| Cell depth loss (Khách/Sản phẩm/Loại SC 3-line/PSC link) | high | likely | Closed (mock) | rich cell renders incl. Bản đồ/Định vị via F9 (P3); some sub-fields inferred |
| Missing filters (DateType, Sửa gấp, Kỳ hoàn tất, Địa chỉ) | med | confirmed | Closed (mock) | 22-field filter set (P3) |
| **Bug**: 'Số phiếu hãng' writes filters.soPhieu; quick-search blocks combining | med | confirmed | Closed (mock) | **Fixed** with independent `soPhieuHang` key (P3) — see defect catalog F-3 |
| Option-set mismatches (WarrantyType, WarrantyAt) replaced by invented | med | confirmed | Closed (mock) | hinhThuc 3-value + loaiBaoHanh 2-value migrated (P3) |
| Excel/PDF export + Tải lại trang missing | med | confirmed | Closed (mock) | Xuất Excel File/In via F8 exporter (P3) |
| Server-backed autocompletes replaced by static cascading selects | med | confirmed | Closed (mock) | ServerAutocomplete for NSX/SP/Model/KTV/Tỉnh/Quận/Tuyến/Đại lý (P3) |
| ~12 modal workflows missing | med | likely | Closed (mock) | Update/dispatch/schedule/transfer/checkout modals built (P3); some inline-create partials inferred |
| Call-center/SignalR + cross-window refresh missing | med | confirmed | Deliberate deviation | Demo call-center; no cross-window (SPA, single window) |
| SMS batch actions (types 1-4, 9) missing | med | confirmed | Deliberate deviation | Simulated as toasts (D4), not real SMS |

**Lows (3):** dual pager, datetime formats, autofocus/sticky-toolbar/colResizable
ergonomics — deviation (single pager) or cosmetic.

---

## 3. Repair KT dashboard /RepairingM/Index — 3H / 5M / 2L

Src: `section-repair-kt-dashboard.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Entire technician-scoped repair list missing (no route/nav/page) | high | confirmed | Closed (mock) | RepairKtListPage built (P4) |
| KT column set differs (Khu vực, Loại SC, Ngày giao, Chi tiết SC, actions) | high | likely | Closed (mock) | 14 KT columns (P4); exact set partly inferred (AJAX) |
| KT-scoped 10-status filter subset (workshop pipeline only) | high | confirmed | Closed (mock) | `KT_BOARD_STATUS_IDS=[2,4,6,7,8,9,13,15,16,17]` (P1/P4). **Residual:** ≥10-count margin thinnest = 3 (probabilistic) |
| Repair-photo upload/update (canvasResize) missing | med | likely | Closed (mock) | UpdateImageModal (P4); exact legacy modal inferred |
| WarrantyType options differ | med | confirmed | Closed (mock) | migrated taxonomy (P3/P4) |
| SignalR call-center layout feature missing (global) | med | confirmed | Deliberate deviation | Demo trigger only |
| Home = plan calendar "Kế hoạch của bạn" vs local KPI dashboard | med | confirmed | Deliberate deviation | Calendar as dashboard tab (D1, P2) |
| Call-center toasts + branch-map modal on home missing | med | confirmed | Closed (mock) | Both available (P2) |

**Lows (2):** dual pager/collapsible search; greeting imagery — cosmetic.

---

## 4. Customer /Customer/Index — 3H / 5M / 4L

Src: `section-customer.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Column set wrong (missing ĐT2, Phường/Xã, Quận, Tỉnh, Loại, Đại lý, Người tạo; invents Mã KH/Tổng phiếu/Trạng thái) | high | likely | Closed (mock) | 15-col reference set; invented Mã KH/Tổng phiếu removed (P6) |
| 'Nhóm khách hàng' taxonomy (9 values) absent | high | confirmed | Closed (mock) | 9-value Nhóm KH in model/column/filter/form (P1/P6) |
| 'Thêm Đại Lý' second create workflow missing | high | confirmed | Closed (mock) | Thêm Khách Hàng + Thêm Đại Lý modals (P6) |
| Tỉnh/Quận cascading autocomplete filters missing | med | confirmed | Closed (mock) | backed by P1 Tỉnh→Quận→Xã |
| Email + Địa chỉ filter fields missing | med | likely | Closed (mock) | added (P6); exact filter set inferred |
| 'Xuất Excel File' export missing | med | confirmed | Closed (mock) | F8 exporter (P6/P7) |
| Multi-select + select-all missing | med | confirmed | Deferred | bulk-select scoped to delete-only (open decision #4) |
| Model fields missing (ĐT2, Đại lý/Trạm, Người tạo) | med | likely | Closed (mock) | added; Đại lý self-referential FK inferred (P6) |

**Lows (4):** local-only delete button, nav promotion, datetime format, Sheet vs
modal — cosmetic/deviation.

---

## 5. Finance (ChungTu / CongNo / Invoice) — 9H / 9M / 6L

Src: `section-finance.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Chứng Từ missing 8/15 columns (Tình trạng, Số phiếu SC/NK link, KTV, Đại lý, Tên KH, Nội dung, Người/Ngày Thu-Chi) | high | likely | Closed (mock) | 15-col ChungTu (P6); some cols inferred |
| Loại thu chi taxonomy 12 values vs binary Thu/Chi | high | confirmed | Closed (mock) | 12-type taxonomy (P1/P6) |
| Separate 'Lập Phiếu Thu'/'Lập Phiếu Chi' create flows missing | high | likely | Closed (mock) | Phiếu Thu/Chi flows (P6); form fields inferred from columns |
| Per-row print ('in phiếu') missing | high | confirmed | Closed (mock) | per-row print via F7 (P6) |
| Status semantics wrong (collection state vs invented approval) | high | confirmed | Closed (mock) | 5-value collection state (Chưa/Đã thu/Đã thu ngoài/Chưa/Đã chi); invented approval dropped (P6) |
| ~11 filters missing (Ngày lập vs Ngày thu/chi radio + 4 autocompletes) | med | likely | Closed (mock) | filter set added (P6); AJAX-exact set inferred |
| Date range doesn't filter table (KPI-only) | med | confirmed | Closed (mock) | search-scoped KPI + table filter (P6) |
| KPI boxes differ (Doanh thu/Phải thu/Chi phí/Phải trả) | med | confirmed | Closed (mock) | search-scoped KPI strip (P6) |
| Two Excel exports missing | med | confirmed | Closed (mock) | F8 exporter (P6) |
| Source-document linking (PSC new tab / PNK modal) missing | med | likely | Closed (mock) | source-ticket import staging (P6); PNK modal inferred |
| Multi-select missing | med | confirmed | Closed (mock) | bulk-select (P6/P7) |
| **Công Nợ** wrong model (ref per-ticket receivables vs generic ledger) | high | confirmed | Closed (mock) | re-modeled per-ticket (Số tiền/Đã trả/Còn lại); the invented Hạn TT / wall-clock overdue path was removed (P6) |
| Công Nợ settle-debt workflow ('thanh toán' → voucher) missing | high | likely | Closed (mock) | settle modal creates thu voucher (P6); modal fields inferred (congno.js not mirrored) |
| Công Nợ filters missing | med | likely | Closed (mock) | added (P6) |
| **Hóa Đơn** missing columns (Hình thức TT, MST, Người Lập) | high | confirmed | Closed (mock) | 10-col incl. MST (P6) |
| /Invoice/Create full-page composer missing | high | confirmed | Closed (mock) | Invoice composer w/ VAT + line grid (P6) |
| Hóa Đơn bulk delete missing | med | confirmed | Closed (mock) | bulk delete (P6) |
| Hóa Đơn filters missing | med | likely | Closed (mock) | added (P6) |

**Lows (6):** pager style, naming (Chứng Từ/Thu Chi), invented Trạng thái (dropped),
local-only KPI strip, label diffs.

---

## 6. Catalog A (Hàng hóa, Nhà kho, Sản phẩm, Model, NSX, Ngăn chứa, Nhóm HH) — 5H / 14M / 16L

Src: `section-catalog-a.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Hàng Hóa column set wrong (missing Hình, Mã phụ, Tiếng Anh, NSX, Model, Model dùng chung, Người/Ngày tạo, Serial) | high | likely | Closed (mock) | 15-col + editor, 3 price tiers, NSX/Model multi-model (P6) |
| Hàng Hóa 'In Barcode' per-row print missing | high | confirmed | Closed (mock) | In Barcode via F7 (P6) |
| Hàng Hóa dedicated Create/Edit full pages missing | high | confirmed | Closed (mock) | product-editor full-page (P6) |
| Hàng Hóa Import/Xuất Excel missing | med | confirmed | Closed (mock) | F8 export; import mock (P6) |
| Hàng Hóa filters (NSX, Model autocompletes, Mã) missing | med | likely | Closed (mock) | added (P6) |
| Hàng Hóa no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6/P7) |
| **Nhà Kho** 'Kho xác' carcass flag missing (column + checkbox) | high | confirmed | Closed (mock) | Kho xác flag added (P6) |
| Nhà Kho no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| **Sản Phẩm** 'Tiền khoán' piecework column + field missing | high | confirmed | Closed (mock) | Tiền khoán money field (P6) |
| Sản Phẩm requires NSX (schema divergence) | med | confirmed | Deliberate deviation | reference product form has no NSX; kept faithful (P6) |
| Sản Phẩm Nhóm SP plain select vs autocomplete + [+] | med | confirmed | Closed (mock) | ServerAutocomplete + quick-create (P6) |
| Sản Phẩm no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| Model Ghi chú + autocompletes + [+] + bulk delete missing | med | confirmed | Closed (mock) | 3 mediums addressed (P6) |
| Nhà Sản Xuất Ghi chú + bulk delete missing | med | confirmed | Closed (mock) | 2 mediums addressed (P6) |
| Ngăn Chứa no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| Nhóm Hàng Hóa no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |

**Lows (16):** Lưu & Thêm mới, Sheet vs side-form, invented Trạng thái/Mã columns
(dropped), optional-vs-required codes, page-size options, hover-zoom — cosmetic.

---

## 7. Catalog B (Khu vực, Phường/Xã, Thời hạn, Phí giao, Lỗi SC, ĐVT, Nhóm SP) — 7H / 11M / 7L

Src: `section-catalog-b.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Khu Vực wrong cols/model (Tên Quận, Tên Xã, Cây số, Tiền công, Tiền công 2) | high | confirmed | Closed (mock) | re-modeled fields, backed by P1 TUYEN lookup (P6; kept the `KhuVuc` symbol to avoid a barrel-name collision) |
| Khu Vực Tỉnh→Quận→Xã hierarchy + [+] quick-add missing | high | confirmed | Closed (mock) | P1 hierarchy + quick-add (P6) |
| Khu Vực Quận filter + bulk delete + quick-add | med | confirmed | Closed (mock) | 3 mediums (P6) |
| Phường/Xã wrong cols (Tỉnh, Quận, Cây số, Tiền công, Tuyến link; invents Loại/khuVucId) | high | confirmed | Closed (mock) | re-modeled + Tuyến link (P6) |
| Phường/Xã Tỉnh/Quận parents + quick-add + Tuyến delivery-fee missing | high | confirmed | Closed (mock) | added (P6) |
| Phường/Xã filters + bulk delete | med | confirmed | Closed (mock) | 2 mediums (P6) |
| Thời Hạn duration semantics (ref Loại Tháng/Năm vs local soNgay days) | high | confirmed | Closed (mock) | Loại radio Tháng/Năm; soNgay model deleted (P6) |
| Thời Hạn no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| Phí Giao wrong association (ref → Sản phẩm w/ Loại phí; local → Khu vực) | high | confirmed | Closed (mock) | product-linked, 3-value Cộng/Trừ/Công (P6) |
| Phí Giao no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| Lỗi Sửa Chữa labor-price model missing (Chi nhánh × Nhóm SP × Tên lỗi + Tiền công/DV) | high | confirmed | Closed (mock) | labor-price model (P1/P6) |
| Lỗi SC filters + quick-add + bulk delete | med | confirmed | Closed (mock) | 2 mediums (P6) |
| Đơn Vị Tính no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |
| Nhóm Sản Phẩm no bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |

**Lows (7):** Lưu & Thêm mới, invented Mã/Trạng thái columns (dropped), page sizes,
money-masked inputs — cosmetic.

---

## 8. Warehouse (Nhập kho, 3 inventory views, DSCapLK, DSTraLK, DSTraLKXac) — 14H / 20M / 6L

Src: `section-warehouse.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Nhập Kho full-page voucher w/ line items missing | high | confirmed | Closed (mock) | line-item editor (P5) |
| Nhập Kho dual search 'Tìm kiếm'/'Tìm chi tiết' missing | high | confirmed | Closed (mock) | `Tìm kiếm` refreshes vouchers; `Tìm chi tiết` opens filtered receiving-line results |
| Nhập Kho ~8 filters missing | med | likely | Closed (mock) | filter set (P5); AJAX-exact inferred |
| Nhập Kho Excel + row actions missing | med | likely | Closed (mock) | Excel via F8; row actions inferred (P5) |
| Xem Tồn Kho missing 10 columns (Chi nhánh, Model, Giá vốn đầu/trong kỳ, Tồn, Tổng tiền, NSX, Ngăn chứa, Kỳ, serial) | high | likely | Closed (mock) | 20-col view (P5) |
| Xem Tồn Kho Từ Kỳ/Đến Kỳ vs generic date range | high | confirmed | Closed (mock) | Kỳ picker (P2/P5) |
| Xem Tồn Kho filters + row actions + Excel | med | likely | Closed (mock) | 3 mediums (P5) |
| Tồn Kho LK Xác wrong columns (clone of tonKho, wrongly incl. Tổng tiền) | high | confirmed | Closed (mock) | 19-col, no Tổng tiền (P5) |
| Tồn Kho LK Xác row actions (Cập nhật, ViewDetail_Xac, drill-down) missing | high | likely | Closed (mock) | actions built (P5); exact inferred |
| Tồn Kho LK Xác KPI + filters + Excel | med | likely | Closed (mock) | 3 mediums (P5) |
| Tồn Kho Kỹ Thuật technician dimension missing | high | confirmed | Closed (mock) | technician axis + autocomplete (P5) |
| Tồn Kho Kỹ Thuật 'Trả linh kiện kho KT' per-row modal missing | high | confirmed | Closed (mock) | Trả LK modal (P5) |
| Tồn Kho Kỹ Thuật wrong columns | high | likely | Closed (mock) | 16-col (P5) |
| Tồn Kho Kỹ Thuật KPI + filters + Excel | med | likely | Closed (mock) | 2 mediums (P5) |
| DSCapLK wrong entity (ref issued-parts usage vs local invented thu-hồi voucher) | high | confirmed | Closed (mock) | re-modeled as usage list w/ state machine (P5) |
| DSCapLK return-status filters missing | high | likely | Closed (mock) | 11 filters (P5) |
| DSCapLK ~7 filters + Excel + columns | med | likely | Closed (mock) | 3 mediums (P5) |
| DSTraLK Duyệt (approve) bulk workflow missing | high | confirmed | Closed (mock) | Chờ duyệt→Đã duyệt bulk (P5) |
| DSTraLK print + filters + status + Excel + columns | med | likely | Closed (mock) | 5 mediums (P5) |
| DSTraLKXac entire page missing (trả hãng tracking) | high | confirmed | Closed (mock) | **new** DsTraLKXacPage (P5) |
| DSTraLKXac trả hãng bulk modal + Chưa/Đã + Mã vận đơn missing | high | confirmed | Closed (mock) | bulk modal + Mã vận đơn col (P5) |
| DSTraLKXac prints (BB KT, Phiếu Trả Hãng) + Excel | med | confirmed | Closed (mock) | 2 prints via F7 (P5) |

**Lows (6):** read-only views given CRUD sheets, page sizes, "Xác"≠"xác nhận"
naming bug (see defect catalog). Note: Kỳ carry-forward math (tồn đầu = prev tồn +
nhập − xuất) is deterministic seeded, **no materialized ledger** — mock model.

---

## 9. Stock-out (Cấp LK, Bán hàng, Trả hàng, Chuyển kho) — 10H / 11M / 4L

Src: `section-stock-out.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Cấp Linh Kiện full-page dispatch slip w/ line items missing | high | confirmed | Closed (mock) | line-item editor (P5) |
| Cấp LK dual search Tìm kiếm/Tìm chi tiết missing | high | confirmed | Closed (mock) | `Tìm kiếm` refreshes slips; `Tìm chi tiết` opens filtered issued-line results |
| Cấp LK ~6 filters (incl. Mục Đích) + Excel + Báo cáo lợi nhuận | med | likely | Closed (mock) | filters + Excel implemented; unsupported profit stub removed rather than shipped non-functional |
| Bán Hàng wrong columns (missing ĐT, Người lập, Ghi chú; invents Trạng thái) | high | likely | Closed (mock) | 8-col; invented Trạng thái dropped (P5) |
| Bán Hàng row actions (Xuất kho print, Chi tiết modal, Thêm hình) missing | high | confirmed | Closed (mock) | print + detail + upload (P5) |
| Bán Hàng full-page order create/edit missing | high | confirmed | Closed (mock) | create/edit editor (P5) |
| Bán Hàng filters + bulk + Tìm chi tiết + 2 exports | med | likely | Closed (mock) | line-detail dialog, voucher export, and snapshot profit report implemented |
| Trả Hàng 'Hình thức trả' 4-type axis missing (local invents refund model) | high | confirmed | Closed (mock) | 4-type reshape; invented refund model removed (P5) |
| Trả Hàng wrong columns (Hình thức trả, Người lập) | high | likely | Closed (mock) | reshaped (P5) |
| Trả Hàng print + Chi tiết modal + full-page editor missing | high | confirmed | Closed (mock) | all built (P5) |
| Trả Hàng filters + exports + bulk | med | likely | Closed (mock) | 2 mediums; option-4 label conflict kept (editor authoritative) (P5) |
| Chuyển Kho dual create flows (cùng/khác chi nhánh) missing | high | confirmed | Closed (mock) | dual editors w/ distinct line cols (P5) |
| Chuyển Kho status model wrong (Chưa/Đã/Không xác nhận vs invented) | high | confirmed | Closed (mock) | receipt-confirm flow; invented statuses removed (P5) |
| Chuyển Kho filter axis + exports + bulk + columns | med | likely | Closed (mock) | 3 mediums; per-row actions inferred (P5) |

**Lows (4):** label diffs, unverifiable per-row print/detail on Chuyển kho — cosmetic.

---

## 10. HR (10 pages) — 11H / 13M / 6L

Src: `section-hr.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Ngân Hàng page missing (stub) | high | confirmed | Closed (mock) | built (Mã/Tên/Địa chỉ) (P6) |
| Phụ Cấp page missing (stub) | high | confirmed | Closed (mock) | built (Tên/Loại/Giá trị) (P6) |
| Loại Phạt Thưởng page missing (stub) | high | confirmed | Closed (mock) | built (Loại radio + Tên) (P6) |
| Ứng Lương page missing (stub) | high | confirmed | Closed (mock) | built (NV/Kỳ/Ngày/Số tiền) (P6) |
| Ứng Lương Kỳ entity absent app-wide | med | confirmed | Closed (mock) | Kỳ entity (P1, 103 periods) |
| Nhân Viên Khóa/Mở khóa lock toggle missing | high | confirmed | Closed (mock) | Khóa toggle column + action (P6) |
| Nhân Viên Hình + Giới tính + full-page Create/Edit missing | med | confirmed | Closed (mock) | full editor ~28 fields, photo, giới tính (P6) |
| Bảng Lương missing 9/16 columns | high | likely | Closed (mock) | 17-col (P6) |
| Bảng Lương row actions (Tạo bảng lương, Print, Excel) missing | high | confirmed | Closed (mock) | per-row print/Excel + Tạo CTA (P6) |
| Bảng Lương toolbar (Xuất Excel, Cập nhật tiền công KV) missing | high | confirmed | Closed (mock) | toolbar (P6) |
| Bảng Lương Kỳ/Phòng ban filters + totals + 'Tổng lương' aggregate | med | confirmed | Closed (mock) | totals row (P6). **Deferred:** Tổng/Thực lãnh = static seeded sum, real payroll formula deferred until specified |
| Chấm Công wrong model (ref exception CRUD vs local read-only clock) | high | confirmed | Closed (mock) | exception model (Nghỉ/Đi trễ/Tăng ca/Về sớm + Loại trừ) (P6) |
| Chấm Công wrong columns | high | likely | Closed (mock) | 12-col (P6) |
| Chấm Công Kỳ filter + bulk delete | med | confirmed | Closed (mock) | added (P6) |
| CC Tổng Hợp wrong columns (ref per-employee/kỳ totals vs local day matrix) | high | confirmed | Closed (mock) | re-modeled totals; day matrix dropped (P6) |
| CC Tổng Hợp Kỳ filter + Excel + Xem drill-down | med | likely | Closed (mock) | 2 mediums (P6) |
| Phòng Ban / Chức Vụ / Ngân Hàng bulk delete | med | confirmed | Closed (mock) | bulk delete (P6) |

**Lows (6):** Lưu & Thêm mới, invented Trạng thái/moTa (dropped), page sizes,
name-or-code search — cosmetic.

---

## 11. Reports (6 canonical) — 8H / 9M / 8L

Src: `section-reports.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| BC tình trạng kỹ thuật answers different question (no status-per-technician count) | high | confirmed | Closed (mock) | reworked: status single-select + per-tech chart (P7) |
| BC tình trạng KT 'Tình trạng' single-select (15 statuses, default Sửa Xong) missing | high | confirmed | Closed (mock) | single-select default Sửa Xong (P7) |
| BC tình trạng KT column chart + drill-down missing | high | likely | Closed (mock) | column chart + drill-down (P7); result cols mock |
| BC tình trạng KT Kỹ thuật autocomplete filter missing | med | confirmed | Closed (mock) | KTV autocomplete (P7) |
| BC tình trạng chung entire report missing | high | confirmed | Closed (mock) | **new** TinhTrangChungReportPage (P7) |
| BC tình trạng chung dual column+pie (15 statuses) + drill-down missing | high | confirmed | Closed (mock) | column+pie w/ §5b palette (P7) |
| BC tình trạng chung Nhà sản xuất filter missing | med | confirmed | Closed (mock) | NSX autocomplete (P7) |
| BC Máy Tồn entire report missing | high | confirmed | Closed (mock) | **new** MayTonReportPage (P7) |
| BC Máy Tồn tri-mode filter + Excel missing | med | confirmed | Closed (mock) | Day/Month/Year + Excel (P7) |
| KPI KTV multi-selects replaced by free-text | med | confirmed | Closed (mock) | KTV + Nhóm SP multi-select (P7) |
| KPI Tiếp nhận report missing | high | confirmed | Closed (mock) | **new** KpiTiepNhanReportPage (P7) |
| KPI Tiếp nhận multi-selects + tri-mode missing | med | likely | Closed (mock) | added (P7); result cols mock |
| BC SCBH Kỹ thuật no true equivalent (warranty COST per technician) | high | likely | Closed (mock) | reworked BaoHanhReportPage (P7); result cols unverified |
| BC SCBH Kỹ thuật Kỹ thuật filter missing | med | confirmed | Closed (mock) | KTV select (P7) |

**Lows (8):** auto-run search, default date ranges, button labels, server paging,
all ref result-table columns unverified (AJAX partials) → report result columns are
**plausible-mock** (honesty flag 4).

Current evidence gate: captured KPI/Máy tồn headers, pivots, and drill-downs are
implemented and tested, but exact Máy tồn window/`30`/`>=31` semantics remain
unverified. The legacy KPI `Lương` and `1 Ngày` workbook schemas are unavailable,
so those two export actions remain disabled rather than reusing the main pivot.

---

## 12. Admin / Permissions / Account — 6H / 10M / 7L

Src: `section-admin-perm-account.md`

| Gap (old) | Sev | Conf | Rebuild status | Note |
|---|---|---|---|---|
| Chi Nhánh columns missing (Hotline, Người liên hệ, Email, Chính, Chuyển CN) | high | confirmed | Closed (mock) | 10-col (P7) |
| Chi Nhánh form fields missing (Hotline, LH, Email, Toạ độ, Chính, Chuyển CN) | high | confirmed | Closed (mock) | form + Toạ độ + map button (P7) |
| Chi Nhánh map modal + bulk delete + side panel | med | confirmed | Closed (mock) | 3 mediums (P7) |
| Người Dùng one-click Khóa/Mở khóa toggle missing | high | confirmed | Closed (mock) | Khóa toggle (P7) |
| Người Dùng ĐT column + Chi nhánh phụ + bulk delete | med | likely | Closed (mock) | 3 mediums; multi-branch FK assumed (P7) |
| Thông Tin TK /User/Detail page missing | high | confirmed | Closed (mock) | /tai-khoan read-only (P2/P7) |
| Thông Tin TK 'Chi nhánh phụ' concept absent | med | likely | Closed (mock) | added (P7) |
| Nhóm Quyền ~50-node menu-permission tree missing | high | confirmed | Closed (mock) | menu-permission-tree (P7). **No enforcement** |
| Nhóm Quyền Lưu & Thêm mới + side-by-side | med | confirmed | Closed (mock) | (P7) |
| Menu (RoleMenu) 202-checkbox function matrix missing | high | confirmed | Closed (mock) | function-permission-matrix (41 groups × Xem/Thêm/Sửa/Xóa + specials) (P7). **No enforcement** |
| Menu parent-menu typeahead (any depth) | med | confirmed | Closed (mock) | (P7) |
| Chức Năng hierarchical entity→action records | med | likely | Closed (mock) | taxonomy **reconstructed** — ref RoleFunction page is HTTP 500, so it's estimated from RoleMenu tree (P7) |

**Lows (7):** Đổi Mật Khẩu placement/labels, **broken ref RoleFunction page (HTTP
500)** — see defect catalog S-2, naming. Note: the whole permission surface is a
**UI mock with no enforcement** (honesty flag 2).

---

_Back to [main comparison record](./legacy-vs-rebuild-comparison.md) ·
[defect catalog](./legacy-defect-catalog.md) ·
[evidence appendix](./assets/legacy-audit-evidence.md)._
