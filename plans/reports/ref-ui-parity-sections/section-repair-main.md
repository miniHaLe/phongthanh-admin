# Ref UI Parity — Group: repair-main

## Pages

### Danh sách Phiếu sửa chữa (/Repairing/Index_8)

- Ref file: `/tmp/ptref/trimmed/repairing-index8.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/features/repair-list/RepairListPage.tsx` (+ RepairFilters.tsx, RepairFiltersAdvanced.tsx, hooks/use-repair-table-columns.tsx, hooks/use-repair-filters.ts; popup targets map to src/features/repair-detail/RepairDetailPage.tsx and src/features/repair-create/; status model in src/domains/repair/status.ts)

**Ref spec**

## Page
- H1: `Trang chủ / Danh sách phiếu sửa chamericas` — breadcrumb header `Trang chủ / Danh sách phiếu sửa chữa`; box title **Danh sách Phiếu sửa chữa**.
- Whole page is one `<form id="FormName">` POSTing to `/Repairing/List` (unobtrusive AJAX, replaces `#table-update`, success callback `ListSeacrhPost`).

## Toolbar (sticky `#myHeader`, sticks on scroll)
- `Lập phiếu` (green, + icon) → `popup("/Repairing/Create_8")` — opens in new window; when the popup closes, list auto re-searches (`popup()` polls `win.closed` every 1s and clicks `.ms-search-btn`).
- `Chuyển chi nhánh` (blue, share icon) → requires checked rows; loads `/Repairing/RepairingTransfer?id=<csv>` into #MyModal titled "Chuyển chi nhánh".
- `In Biên nhận` (orange) → first CHECKED row with status >= 9 (Sửa Xong or later); `window.open(/Print/ReceiptRepairing?id=)`; alert if none: "Vui lòng chọn phiếu để đã sửa xong để in".
- `In Giấy Đi Đường` (orange) → all checked ids; `window.open(/Print/Repairing_DiDuong?id=<csv>)`.
- `In Lệnh Sửa Tại Nhà` (orange) → checked ids; if rows span >1 technician (or no tech), opens modal "Điều phối in" (`/Repairing/UpdateTechinicanIn?id=`) which after save opens `/Print/PrintRepairingTaiNha?id=`; else directly `window.open(/Print/PrintRepairingTaiNha?id=<csv>)`.
- `In Phiếu SC` (orange) → first checked id; `window.open(/Print/Repairing?id=)` (2nd handler also opens one window per checked row).
- `In tem` (red dropdown) → item `Dán máy` → last checked id; `window.open(/Print/PrintTemDanMay?id=)`. (JS also supports `.ms-print-temxac` → /Print/PrintTemDanXac, not rendered for this role.)
- All selection-required actions bootbox-alert "Vui lòng chọn phiếu để …" when nothing is checked.

## Search fieldset "Thông tin tìm kiếm" (3 rows of col-md-2 fields)
Row 1: (1) `BranchId` select — options: `Chi nhánh` (0), `TTBH Điện tử-điện lạnh PHONG THÀNH Đăk lăk` (1, selected), `…Đăk nông` (3), `Cộng tác viên tuyến huyện` (4). (2) `Tên nhà sản xuất` autocomplete (`AutoManufactory` → hidden `ManufactoryId`). (3) `Sản phẩm` autocomplete (`AutoProductStatus` → hidden `ProductStatusId`). (4) `Model` autocomplete (`AutoModel` → hidden `ModelId`). (5) `RepairingStatusId` single-select `Tình trạng` — 15 color-coded options with legacy ids: 1 Mới Nhận #FFCC00, 2 Đã Điều Phối #00CCFF, 4 Báo Giá #9966CC, 15 Chờ Báo Giá #31065c, 6 Chờ Xác Nhận #996600, 17 Đã Đặt Linh Kiện #112233, 13 Đã Có Linh Kiện #6D5582, 7 Chờ Linh Kiện #4B0082, 8 Trả Lại #CC3300, 11 Hỏng Khách Trả Lại #CC9911, 16 Chờ Phiếu Hãng #06385c, 9 Sửa Xong #3300FF, 10 Đã Giao Cho Khách #00FF00, 12 Đã Giao Phiếu Hủy #342c38, 14 Đã Giao Ngoài #009988. (6) `WarrantyType` select `Hình thức chung`: 1 Bảo hành, 3 Sửa dịch vụ, 2 BH sửa chữa.
Row 2: (7) `RepairingCode` text `Số phiếu` (id `focuspsc`, AUTOFOCUSED on load). (8) `RepairingNumber` text `Số phiếu hãng`. (9) `Serial` text `Số Serial`. (10) `Tên/ĐT khách hàng` table-autocomplete (`AutoCustomerS` → hidden `CustomerId`; GET `/Get/MyJson/List/GetCustomerByName`; dropdown shows columns Họ tên / Điện thoại 1 / Điện thoại 2 / Địa chỉ). (11) `Kỹ thuật` autocomplete (`AutoUserTech` → hidden `TechnicianId`).
Row 3: (12) `Tên Tỉnh` autocomplete (→ `TinhId`). (13) `TP/Huyện` autocomplete (→ `QuanId`). (14) `Tuyến` autocomplete (→ `LocationId`). (15) `Đại lý` autocomplete (→ `DaiLyId`). (16) `WarrantyAt` select `Loại bảo hành`: -1 Loại bảo hành, 0 Tại Trạm, 1 Nhà Khách. (17) `IsQuick` checkbox **Sửa gấp**.
Row 4: (18) `DateType` select: 0 Ngày Nhận, 1 Ngày Giao, 2 Ngày Sửa Xong, 3 Ngày Hoàn Thành — chooses WHICH date the range applies to. (19) `Từ ngày` datepicker (default = 1 month back) + hidden `FromDate`. (20) `Đến ngày` datepicker (default today) + hidden `ToDate`. (21) `Kỳ hoàn tất` autocomplete (`AutoKy` → hidden `KyId`) — payroll/settlement period. (22) `Address` text `Địa chỉ`.
Hidden `pageNumber` input drives paging through the same form.
Buttons: `Tìm kiếm` (submits AJAX to /Repairing/List), `Xuất Excel File` (typeName=all) and `Xuất Excel In` (typeName=print) — both switch the form to GET `/Repairing/ExcelRepairingList` (full filter set applies), `Tải lại trang` (link to Index). Enter key inside any fieldset input triggers Tìm kiếm.

## Status legend strip (below toolbar)
Horizontal list of ALL 15 statuses, each: colored square (fa-stop in status color) + `Label (count)` — live counts for the current filter, e.g. `Mới Nhận (22)`, `Đã Điều Phối (168)`, … `Đã Giao Cho Khách (84513)`, `Đã Giao Phiếu Hủy (19952)`, `Đã Giao Ngoài (577)`.

## Pagination
Rendered ABOVE and BELOW the table: `Tổng: 2536 dòng, Trang 1 / 127` + PagedList numeric pager (1…10, ellipsis, » next, »» last). 20 rows/page fixed; page links set the hidden `pageNumber` and re-submit. No page-size selector.

## Table (fixed 1700px wide, horizontal scroll, colResizable, striped/bordered/hover)
Exact headers in order: (1) [checkbox-toggle button `Chọn tất cả`], (2) `#` (tooltip Trạng thái), (3) `#` (tooltip Hành động), (4) `Phiếu sửa chữa`, (5) `Khách hàng`, (6) `Sản phẩm`, (7) `Kỹ thuật`, (8) `Loại SC`, (9) `Chi phí`, (10) `Ngày nhận`, (11) `Ngày HT`, (12) `Sửa chữa`, (13) `Ghi chú`, (14) `Người nhận`.

Cell contents:
1. Checkbox `inputCheck` (value=RepairingId, `data-status`, `data-tech`) + row ordinal (STT) beneath it.
2. **Trạng thái**: full-cell background in the status hex color, white pill with uppercase status text (e.g. `ĐÃ ĐIỀU PHỐI` on #00CCFF).
3. **Hành động** (status-dependent): `Cấp linh kiện cho kỹ thuật` (share-alt, only when dispatched, class `ma-caplinhkien` → modal `/CheckOutForTech/CreatePartialPopup?idR=` "Cấp linh kiện kỹ thuật"); `Đổi tình trạng` (refresh icon, `ma-modal-update-status-d` → modal `/Repairing/UpdateStatus?id=` "Đổi tình trạng"); `Xem chi tiết` (eye → popup `/Repairing/Detail?id=`); `Giao Máy` (exchange icon, only for deliverable statuses e.g. Trả Lại → popup `/Repairing/CheckOut?id=`); `Thêm lịch hẹn` (bullhorn, `ma-modal-insertschedule` → modal `/Repairing/InsertSchedule?id=` "Thêm lịch nhắc nhở").
4. **Phiếu sửa chữa**: PSC code (e.g. `PSC-202607-223`) as a link → popup `/Repairing/Update?id=` (EDIT page), rich HTML tooltip showing Hư hỏng / Địa chỉ / CN; secondary line `PSC hãng: <mfr ticket#>` or `PSC DL: <dealer ticket#>` when present.
5. **Khách hàng**: name (bold, user icon), phone(s) (phone icon, may be `a - b`), full address (marker icon); button `Bản đồ` (`ma-modal-maps`, data-map=address → opens `https://maps.google.com/?q=<address>` in named window); link `Định vị` → `http://gps.phongthanh.phanmemsuachuabaohanh.com/#/location?address=…` (technician/branch GPS view, new tab).
6. **Sản phẩm**: `- <LOẠI SP> - <NSX> - <model>`; `Serial: <sn>` — highlighted red bg with tooltip `Máy đã từng sửa chữa` when the serial has prior tickets; `Đại lý: <name>` (orange).
7. **Kỹ thuật**: if unassigned → button `Điều phối` (user icon, `ma-modal-update-techinican-d` → modal `/Repairing/UpdateTechinican?id=` "Đổi kỹ thuật", technician autocomplete). If assigned → tech name (blue bold) + `Đổi kỹ thuật` (edit icon, same modal) + `Hủy điều phối` (red X, `ma-dispactdelete` → bootbox confirm "Bạn có chắc chắn hủy điều phối?" → POST `/Repairing/DeleteDispatch`).
8. **Loại SC**: 3 lines — WarrantyType (`Bảo hành`/`Sửa dịch vụ`), WarrantyAt (`Tại Trạm`/`Nhà Khách`), `KV: <khu vực/tuyến>`.
9. **Chi phí**: contains `Báo Giá` button ($ icon, `ma-modal-update-status-d-1` → modal `/Repairing/UpdateStatus?bg=1&id=` — quote entry) for service-repair rows; otherwise amount/blank.
10. **Ngày nhận**: datetime `dd/MM/yyyy hh:mm AM/PM`.
11. **Ngày HT**: completion date (blank until done).
12. **Sửa chữa** (progress column): `Sửa xong: <datetime>` (green), `TAT: <n> ngày`, `Giao máy: <datetime>`, `Tồn: X ngày H:M'` (orange dwell-time counter).
13. **Ghi chú**: `HH: <fault description>` (red HH prefix), solution text, + button `Cập nhật Cách giải quyết` (wrench, `ma-modal-update-loi-d` → modal `/Repairing/UpdateLoi`-style partial).
14. **Người nhận**: receiver staff name; cell ALSO carries `textmax` tooltip with free-form note (e.g. quote-approval call log).

## Modals / containers
`#MyModal` (generic, title+body loaded via `.load()`), `#MyModal1` (nested level-2 popups: Thêm nhà sản xuất `/Manufactory/CreatePartial`, Thêm sản phẩm `/ProductStatus/CreatePartial`), `#MyModal2` "Bản đồ chi nhánh" (Google Maps JS API + Places search box). Modal AJAX-success callbacks (`UpdateTechinicanPost`, `UpdateStatusPost`, …) show a toast, hide the modal, and re-run the search after `comTime`.

## Other interactions (from repairing_8.js + inline scripts)
- SMS batch actions exist in JS for checked rows (`/Repairing/SendSms` types 1=tech, 2/3/4=customer variants; `SendSMSRepairing` type 9 = "sửa xong" SMS w/ confirm) — buttons hidden for this role but part of page behavior.
- Batch `Đổi tình trạng`/`Đổi kỹ thuật` for ALL checked ids (`ma-modal-update-status`, `ma-modal-update-techinican` — one modal, csv ids).
- `Xác nhận chi nhánh` batch confirm → POST `/Repairing/XacNhanChiNhanh` (branch-transfer receipt confirmation).
- Delete quote (`/Repairing/DeleteBaoGia`), delete ticket (`/Repairing/Delete`) with bootbox confirms (role-gated).
- SignalR CallCenterHub: incoming-call toastr with `Tiếp nhận` button + browser Notification; answered call auto-opens `/repairing/repairingcustomer?id=&num=` (caller-matched ticket workspace); `closeEvent` from child windows re-triggers search on Index_8 and focuses opener.
- Excel/PDF export via same form (`/Repairing/ExcelRepairingList`, `/Repairing/PDFRepairingList`).
- Import from Excel modal (`/Repairing/ImportReperingToExcel`) and quick-receive modal (`/Repairing/ReceiveFast`) wired in JS (role-gated in view).
- Column resize (colResizable), sticky action toolbar on scroll, `#focuspsc` autofocus, Enter=search.

**Gaps**

| Severity | Gap |
|---|---|
| high | Status vocabulary mismatch: reference has 15 legacy statuses with fixed ids/colors (Mới Nhận, Đã Điều Phối, Báo Giá, Chờ Báo Giá, Chờ Xác Nhận, Đã Đặt Linh Kiện, Đã Có Linh Kiện, Chờ Linh Kiện, Trả Lại, Hỏng Khách Trả Lại, Chờ Phiếu Hãng, Sửa Xong, Đã Giao Cho Khách, Đã Giao Phiếu Hủy, Đã Giao Ngoài). Local src/domains/repair/status.ts defines 16 invented snake_case statuses (cho_tiep_nhan, dang_kiem_tra, cho_phe_duyet, da_giao, qua_han, …) grouped into 5 color buckets — the actual business workflow states (Điều Phối, Đặt/Có Linh Kiện, Chờ Phiếu Hãng, Giao Phiếu Hủy, Giao Ngoài, Hỏng Khách Trả Lại) do not exist locally. |
| high | Row actions column entirely missing locally. Reference per-row actions: Đổi tình trạng (modal /Repairing/UpdateStatus), Xem chi tiết (popup Detail), Cấp linh kiện cho kỹ thuật (modal /CheckOutForTech/CreatePartialPopup, shown when dispatched), Giao Máy (popup /Repairing/CheckOut, shown for deliverable statuses), Thêm lịch hẹn (modal /Repairing/InsertSchedule). Local table has no actions cell at all — only whole-row click → detail page. |
| high | Technician dispatch workflow missing: reference Kỹ thuật cell shows 'Điều phối' button when unassigned, and tech name + 'Đổi kỹ thuật' + 'Hủy điều phối' (confirm → POST /Repairing/DeleteDispatch) when assigned; batch đổi-kỹ-thuật over checked rows also exists. Local renders technician as plain text with no dispatch/re-assign/cancel actions. |
| high | Row multi-select (checkbox column + 'Chọn tất cả' toggle) and ALL selection-based batch operations missing: Chuyển chi nhánh modal, selection-driven prints (Biên nhận gated to status>=9, Giấy Đi Đường multi-id, Lệnh Sửa Tại Nhà with 'Điều phối in' modal when techs differ, Phiếu SC, Tem dán máy), batch đổi tình trạng / đổi kỹ thuật, SMS sends. Local PrintMenu items are toast stubs with no selection semantics, and 'Chuyển chi nhánh' has no local counterpart anywhere. |
| high | Báo giá (quote) workflow missing: reference Chi phí cell shows a 'Báo Giá' button (modal /Repairing/UpdateStatus?bg=1&id=) for service-repair rows, plus DeleteBaoGia confirm flow in JS. Local Chi phí column just prints chiPhiDuKien. |
| high | 'Sửa chữa' progress column missing locally: reference shows Sửa xong datetime, TAT (turnaround days), Giao máy datetime, and a live 'Tồn: X ngày H:M'' dwell-time counter per row. Local has only ngayHoanThanh date. Also local 'Mô tả lỗi' is a separate column while reference embeds fault (HH:) + solution + 'Cập nhật Cách giải quyết' wrench button inside its Ghi chú column. |
| high | Per-status live-count legend missing: reference renders all 15 statuses with colored squares and result counts (e.g. 'Đã Điều Phối (168)') under the toolbar, doubling as workload dashboard. Local StatusLegend component exists (bucket-level, 5 colors, no counts) but is not even rendered on RepairListPage. |
| high | Column cell depth loss: (a) Khách hàng — reference shows full address + 'Bản đồ' (Google Maps) + 'Định vị' (GPS tracker URL) buttons; local shows only name+phone. (b) Sản phẩm — reference shows product-type + NSX + model + Đại lý line + red repeat-repair Serial highlight ('Máy đã từng sửa chữa'); local shows a single name string + serial with no dealer or repeat flag. (c) Loại SC — reference is 3 lines (WarrantyType, Tại Trạm/Nhà Khách, KV: khu vực); local shows only hinhThuc. (d) Phiếu sửa chữa — reference PSC code links to the EDIT page (popup /Repairing/Update) with rich tooltip (Hư hỏng/Địa chỉ/CN) and shows 'PSC hãng:'/'PSC DL:' labels; local soPhieu is not a link and dealer-ticket numbers don't exist in the model. |
| medium | Missing filters: DateType selector (Ngày Nhận/Ngày Giao/Ngày Sửa Xong/Ngày Hoàn Thành — controls which date the range applies to), IsQuick 'Sửa gấp' checkbox, 'Kỳ hoàn tất' (settlement period) autocomplete, 'Địa chỉ' text filter. Local date range is hardwired to ngayNhan. |
| medium | Filter field bug/gap: RepairFiltersAdvanced field labeled 'Số phiếu hãng' reads/writes filters.soPhieu — there is no separate soPhieuHang filter, and the quick-search heuristic (digits→sdt, PSC-→soPhieu, else name) prevents combining Số phiếu + Tên KH + SĐT simultaneously as the reference does with separate fields. |
| medium | Option-set mismatches: reference WarrantyType = Bảo hành / Sửa dịch vụ / BH sửa chữa; local HinhThuc = bao_hanh / sua_chua / sua_chua_tai_nha / tu_van (invented). Reference WarrantyAt (Loại bảo hành) = Tại Trạm / Nhà Khách; local LOAI_BAO_HANH_OPTIONS = 4 invented strings (Bảo hành chính hãng, dịch vụ, Hết bảo hành, mở rộng). Reference status filter is single-select with per-option colors; local is an uncolored multi-select of the invented statuses. |
| medium | Excel export missing: reference has 'Xuất Excel File' and 'Xuất Excel In' submitting the full filter form to /Repairing/ExcelRepairingList (plus PDF variant in JS), and 'Tải lại trang' reset link. Local has no export at all on the repair list. |
| medium | Autocomplete-style reference pickers replaced by finite cascading Selects: reference NSX/Sản phẩm/Model/Kỹ thuật/Tỉnh/Quận/Tuyến/Đại lý/Khách hàng are server-backed typeaheads (customer one is a table-autocomplete with columns Họ tên/ĐT1/ĐT2/Địa chỉ); local uses small static mock Select lists, and Sản phẩm/Model are disabled until a parent is chosen (reference allows searching model directly). |
| medium | Modal workflows missing locally (no counterpart components): Đổi tình trạng, Đổi kỹ thuật/Điều phối, Thêm lịch nhắc nhở, Chuyển chi nhánh, Cấp linh kiện kỹ thuật, Điều phối in, Cập nhật Cách giải quyết, Giao máy (CheckOut), Import phiếu từ Excel, Thêm phiếu nhanh (ReceiveFast), inline create-partials for NSX/Sản phẩm/Model/Khách hàng/Đại lý/Khu vực. |
| medium | Call-center/SignalR integration missing: reference pushes incoming-call toasts (Tiếp nhận/deny) + browser Notifications, auto-opens /repairing/repairingcustomer?id=&num= on answer, and child-window closeEvent auto-refreshes the list. Local has no phone/call integration and no cross-window refresh (popup-window edit pattern replaced by SPA routes, so 'refresh on popup close' is N/A but call features are absent). |
| medium | SMS actions missing: reference JS supports batch SMS to customer/tech (POST /Repairing/SendSms types 1-4) and confirm-based 'sửa xong' SMS (type 9). No SMS concept exists locally. |
| low | Pagination differences: reference shows the pager + 'Tổng: N dòng, Trang x / y' both above AND below the table with first/last (»») jumps; local shows a single bottom pagination bar (with a page-size selector the reference lacks — acceptable improvement). |
| low | Ngày nhận shows date only locally; reference displays full datetime (dd/MM/yyyy hh:mm AM/PM). Reference status cell is a full-height colored block with uppercase label; local is a small badge + 4px strip (deliberate redesign). |
| low | Minor ergonomics from reference not present: autofocus on Số phiếu field on page load, sticky action toolbar on scroll, user-resizable table columns (colResizable), Enter-to-search in filter fields (local filters apply as-you-type so this is mostly moot), rich HTML tooltip on PSC link, tooltip on Người nhận/Ghi chú overflow text. |

## Group Summary

Extracted the full UI spec of the legacy repair-ticket workspace (/Repairing/Index_8) from the trimmed mirror plus the live repairing_8.js (fetched from the source host, 56KB) and the inline SignalR call-center script. The reference is a dense operational console: 22 filter fields (incl. DateType selector, Sửa gấp, Kỳ hoàn tất, Địa chỉ), 15 color-coded legacy statuses with a live per-status count legend, a 14-column table whose cells embed workflows (dispatch/re-assign/cancel technician, quote entry, parts issue, delivery, schedule reminders, solution updates, Google-Maps/GPS links, repeat-repair serial flag), checkbox multi-select driving branch transfer + 5 print flows + SMS, Excel export, popup-window editing with auto-refresh, and SignalR call-center toasts. The local React rebuild (src/features/repair-list) covers only the read-only skeleton: filter panel (most fields, some invented option sets, one soPhieu/soPhieuHang bug), sortable paginated table with 13 plain columns, print-menu stubs, and detail/create routes. All transactional workflows (status change, dispatch, quote, parts issue, delivery, transfer, schedule, SMS, export), the row-action column, row selection, the legacy status vocabulary, and the per-status count legend are missing — these are the highest-impact gaps for an implementation plan. Status: DONE.
