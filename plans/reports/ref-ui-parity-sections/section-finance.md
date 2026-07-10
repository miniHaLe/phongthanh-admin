# UI Parity — Finance Group

### Chứng Từ (Quản Lý Thu Chi) — /ChungTu/Index
- Ref file: `/tmp/ptref/trimmed/chungtu-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/tai-chinh/ThuChiPage.tsx`

**Ref spec**

## Header
Breadcrumb `Trang chủ / Chứng Từ`. Two header action buttons: **Lập Phiếu Thu** (`.ms-btn-receipt`, data-id=0) and **Lập Phiếu Chi** (`.ms-btn-payslip`, data-id=0) — open create-voucher forms in the shared `#MyModal` dialog (handled by `/Scripts/CategoryCommon/chungtu.js`).

## Search fieldset "Thông tin tìm kiếm" (form AJAX POST → `/ChungTu/List`, replaces `#ma-list`)
- `BranchId` select: Chi nhánh (3 branches: Đăk Lăk [default selected], Đăk Nông, Cộng tác viên tuyến huyện)
- `TinhTrang` select: Tình trạng — Chưa thu(1), Đã thu(2), Đã thu ngoài(5), Chưa chi(3), Đã chi(4)
- `MaHinhThucThuChi` select: Hình thức thu — options loaded dynamically from server (payment methods, e.g. Tiền mặt)
- `MaLoaiThuChi` select: Loại thu chi — Phiếu Thu(1), Phiếu Chi(2), Phiếu Thu Sửa Chữa(3), Phiếu Thu Bán Hàng(5), Thu Trả Hàng Lỗi(9), Thu Khác(10), Chi Lương(11), Chi Xăng(12), Chi Trả Hàng(13), Chi Mua Hàng(14), Chi Khác(15), Chi Trả Vận Chuyển(16)
- `AutoUserTech` autocomplete: Kỹ thuật → hidden `TechnicianId`
- `AutoManufactory` autocomplete: Tên nhà sản xuất → hidden `ManufactoryId`
- `SoChungTu` text: Số chứng từ
- `RepairingCode` text: Số phiếu SC/hãng (Enter-to-search class `presssearch`)
- `CustomerName` text: Tên khách hàng/ điện thoại
- `NoiDung` text: Nội dung
- `AutoUserNhanVien` autocomplete: Người tạo → hidden `CreatedBy`
- `AutoDaiLy` autocomplete: Đại lý → hidden `DaiLyId`
- Radio `LoaiNgay`: **Ngày lập** (1, default) vs **Ngày thu/chi** (2) — chooses which date field the range filters
- Date range: Từ ngày / Đến ngày (`FromDate`/`ToDate`, default = last 30 days)
- Buttons: **Tìm kiếm**, **Xuất ra Excel**, **Xuất ra Excel Thu SC** (two distinct Excel exports), plus a refresh submit button (typeName=refresh)

## Summary info-boxes (above table, recomputed with each search)
- Green: **Doanh thu** + **Doanh thu ngoài** (two numbers in one box)
- Blue: **Phải thu**
- Yellow: **Chi phí**
- Red: **Phải trả**

## Table columns (exact order)
[checkbox select-all toggle] | Tình Trạng | Số chứng từ | Loại phiếu | Hình thức | Số Phiếu SC/NK | Kỹ thuật | Đại lý/Trạm | Tên khách hàng | Ngày lập | Số tiền | Nội dung | Người tạo | Người Thu/Chi | Ngày Thu/Chi | Chọn

## Row behavior
- Per-row checkbox `inputCheck` (value = voucher id) with header select-all toggle
- **Số Phiếu SC/NK** cell links to source document: repair vouchers → `<a href="/Repairing/Detail?id=..." target=_blank>PSC-...</a>` (new tab); purchase-expense vouchers → `<a class="ma-detailre" data-id=...>PNK-...</a>` opening a receiving-note detail popup/modal
- **Chọn** column: print button (`.ms-btn-receipt-print`, tooltip "in phiếu") — prints the voucher
- Voucher codes follow PTT-yyyymmdd-N (thu) / PCC-yyyymmdd-N (chi) patterns; Ngày lập & Ngày Thu/Chi shown as dd/MM/yyyy HH:mm; Số tiền formatted with thousands separators (blank for unposted purchase vouchers)

## Pagination
PagedList style rendered twice (above and below table): "Trang 1 / 40" label + numbered page links 1..10 with ellipsis, » (next), »» (last); page changes set hidden `pageNumber` and re-POST the form

## Modals/misc
Shared `#MyModal`/`#MyModal1` generic modals (create phiếu thu/chi, PNK detail), `#MyModal2` branch map (layout-level). Logic in `/Scripts/CategoryCommon/chungtu.js`.

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set materially wrong. Missing reference columns: Tình Trạng, Số Phiếu SC/NK (linked source document), Kỹ thuật, Đại lý/Trạm, Tên khách hàng, Nội dung, Người Thu/Chi, Ngày Thu/Chi. Local (src/config/finance-tables/thu-chi.config.ts) only has Mã phiếu, Loại, Nguồn, Số tiền, Phương thức, Ngày tạo, Người tạo, Trạng thái, Ghi chú(hidden). |
| high | Voucher type taxonomy mismatch: local `loai` is binary Thu/Chi; reference has 12 Loại thu chi values (Phiếu Thu, Phiếu Chi, Phiếu Thu Sửa Chữa, Phiếu Thu Bán Hàng, Thu Trả Hàng Lỗi, Thu Khác, Chi Lương, Chi Xăng, Chi Trả Hàng, Chi Mua Hàng, Chi Khác, Chi Trả Vận Chuyển) shown in the Loại phiếu column and filter. |
| high | Primary create workflows missing: reference has separate 'Lập Phiếu Thu' and 'Lập Phiếu Chi' header buttons opening dedicated voucher forms; local has one generic 'Thêm' CrudSheet with a simple Thu/Chi select. |
| high | Per-row print action ('in phiếu', .ms-btn-receipt-print) missing locally — rows only get generic edit/delete icons from CrudTablePage. |
| high | Status semantics differ: reference Tình trạng = collection state (Chưa thu / Đã thu / Đã thu ngoài / Chưa chi / Đã chi) tied to Người Thu/Chi + Ngày Thu/Chi; local trangThai is an approval state (Chờ duyệt / Đã duyệt / Hủy) that does not exist in the reference. |
| medium | Missing filters: Tình trạng, Hình thức thu (server-driven list), Kỹ thuật autocomplete, Nhà sản xuất autocomplete, Số chứng từ, Số phiếu SC/hãng, Tên khách hàng/điện thoại, Nội dung, Người tạo, Đại lý, and the Ngày lập vs Ngày thu/chi radio. Local filter bar only has Loại, Phương thức, Trạng thái, Chi nhánh selects plus free-text search. |
| medium | Date-range does not filter the table: local PeriodRangePicker only drives the KPI strip; the reference Từ ngày/Đến ngày (default last 30 days) filters the voucher list itself. |
| medium | KPI content differs: reference shows Doanh thu + Doanh thu ngoài, Phải thu, Chi phí, Phải trả computed from the current search result; local strip shows Tổng Thu, Tổng Chi, Công Nợ Phải Thu, Công Nợ Phải Trả — 'Doanh thu ngoài' concept missing and figures are not search-scoped. |
| medium | Excel exports missing: reference has two toolbar exports 'Xuất ra Excel' and 'Xuất ra Excel Thu SC'; local finance pages have none (export-excel-menu exists only under reports). |
| medium | No source-document linking: reference Số Phiếu SC/NK cell opens /Repairing/Detail in a new tab or a PNK receiving-note detail modal (a.ma-detailre); local has nguon/nguonId but renders plain text with no navigation. |
| medium | Row multi-select checkboxes with select-all toggle missing locally. |
| low | Pagination style differs (reference PagedList 'Trang 1/40' shown above and below table vs local single bottom pagination) — cosmetic. |
| low | Naming: reference page is 'Chứng Từ' with 'Số chứng từ' codes (PTT-/PCC- prefixes); local titles it 'Thu Chi' with 'Mã phiếu'. |

### Công nợ (Thanh Toán Công Nợ) — /CongNo/Index
- Ref file: `/tmp/ptref/trimmed/congno-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/tai-chinh/CongNoPage.tsx`

**Ref spec**

## Header
Breadcrumb `Trang chủ / Công nợ`. No create buttons — debts originate from repair/sales tickets, not manual entry.

## Search fieldset "Thông tin tìm kiếm" (form AJAX POST → `/CongNo/List`, replaces `#ma-list`)
- `BranchId` select: Chi nhánh (options populated by JS)
- `LoaiThanhToan` select: Loại thanh toán — **Phiếu sửa chữa**(1, default) / **Phiếu bán hàng**(2)
- `SoPhieu` text: Số phiếu
- `AutoCustomerS` autocomplete: Tên/ĐT khách hàng → hidden `CustomerId`
- `AutoUserTech` autocomplete: Kỹ thuật → hidden `TechnicianId`
- `Type` select: **Tất cả**(1) / **Theo ngày**(2) — toggles whether date range applies
- Date range: Từ ngày / Đến ngày (`FromDate`/`ToDate`, default last 30 days)
- Button: **Tìm kiếm** only (no export)

## Table columns (exact order)
Số phiếu | Loại phiếu | Ngày lập | KTV | Số tiền | Đã trả | Còn lại | Tên khách hàng | Điện thoại | Chọn

## Rows / interactions
Table body is empty in the static page — rows render only after AJAX search. Each row is an unpaid/partially-paid repair or sales ticket with amount owed (Số tiền), amount paid (Đã trả), remaining balance (Còn lại). The **Chọn** action column carries the settle-debt action (page purpose is 'Thanh Toán Công Nợ' — record a payment against the ticket); handled by `/Scripts/CategoryCommon/congno.js` using the shared `#MyModal` dialogs.

## Pagination
Hidden `pageNumber` field present; PagedList pagination rendered inside `#ma-list` after search (same pattern as ChungTu).

**Gaps**

| Severity | Gap |
|---|---|
| high | Data model / column set mismatch. Reference rows are per-ticket receivables from Phiếu sửa chữa / Phiếu bán hàng with columns Số phiếu, Loại phiếu, Ngày lập, KTV, Số tiền, Đã trả, Còn lại, Tên khách hàng, Điện thoại. Local (src/config/finance-tables/cong-no.config.ts) is a generic ledger: Mã, Đối tượng, Loại (Phải Thu/Phải Trả), Gốc, Đã TT, Còn lại, Ngày PS, Hạn TT, Trạng thái — no ticket link, no KTV, no customer phone. |
| high | Primary workflow missing: the page exists to settle debts ('Thanh Toán Công Nợ' — Chọn column action records a payment against a ticket, creating the corresponding thu/chi voucher). Local rows only get generic edit/delete; there is no 'thanh toán' action or payment modal. |
| medium | Missing filters: Loại thanh toán (Phiếu sửa chữa/Phiếu bán hàng), Số phiếu text, Tên/ĐT khách hàng autocomplete, Kỹ thuật autocomplete, and the Tất cả/Theo ngày toggle + date range applied to the table. Local filter bar only has Loại (Phải Thu/Phải Trả), Trạng thái, Chi nhánh. |
| low | Local offers a generic 'Thêm' create form for debts and Hạn thanh toán / Trạng thái (Quá hạn) concepts; reference has no manual debt creation and no due-date column — extra features diverging from source app. |
| low | Local adds a Finance KPI strip and period picker on this page; reference Công nợ page has no summary boxes. |

### Invoice (Quản Lý Hóa Đơn) — /Invoice/Index
- Ref file: `/tmp/ptref/trimmed/invoice-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/tai-chinh/HoaDonPage.tsx`

**Ref spec**

## Header
Breadcrumb `Trang chủ / Invoice`. Header action button **Lập Hóa Đơn** → full page `/Invoice/Create` (not a modal).

## Search fieldset "Thông tin tìm kiếm" (form AJAX POST → `/Invoice/List`, replaces `#ma-list`)
- `SoHoaDon` text: Số hóa đơn
- `SellingProductCode` text: Mã số thuế (tax code)
- `HinhThucId` select: Hình thức thanh toán — '-- Vui lòng chọn --', **Tiền mặt**(1), **Chuyển khoản**(3)
- `HoTen` text: Tên đơn vị (billed entity name)
- Date range: Từ ngày / Đến ngày (`FromDate`/`ToDate`, default last 30 days)
- Button: **Tìm kiếm**

## Toolbar (below fieldset)
- Refresh submit button (typeName=refresh)
- **Xóa** red submit button (typeName=delete) — bulk-deletes the checkbox-selected invoices

## Table columns (exact order)
[checkbox select-all toggle] | Số Hóa Đơn | Hình Thức Thanh Toán | Khách Hàng | Mã Số Thuế | Tiền thuế | Tổng Thanh Toán | Ngày Lập | Người Lập | Chọn

## Rows / interactions
Body empty in static mirror (populated by search). Per-row checkbox for bulk delete; 'Chọn' action column (row actions such as print/edit handled by `/Scripts/CategoryCommon/invoice.js`).

## Pagination
PagedList 'Trang 0 / 0' + pagination container below table; hidden `pageNumber` re-POSTs the form.

**Gaps**

| Severity | Gap |
|---|---|
| high | Missing columns central to a VAT-invoice register: Hình Thức Thanh Toán, Mã Số Thuế, Người Lập. Local (src/config/finance-tables/hoa-don.config.ts) has Mã HĐ, Khách hàng, Ngày tạo, Tổng tiền, VAT(hidden), Tổng sau VAT, Trạng thái, Phiếu SC(hidden) — no payment method, tax code, or creator anywhere in the HoaDon type (src/types/finance-types.ts). |
| high | Dedicated invoice creation page missing: reference 'Lập Hóa Đơn' navigates to /Invoice/Create (full-page composer with line items); local create is the generic CrudSheet (ma, khách hàng, ngày, trạng thái, chi nhánh only — no line items, amounts, MST, payment method) and the detail drawer is explicitly view-only. |
| medium | Bulk delete workflow missing: reference has per-row checkboxes + select-all + red 'Xóa' toolbar button; local only single-row delete via row icon. |
| medium | Missing filters: Số hóa đơn, Mã số thuế, Hình thức thanh toán (Tiền mặt/Chuyển khoản), Tên đơn vị, and date range. Local filters are Trạng thái, Khách hàng text, Chi nhánh + free-text search. |
| low | Local adds a Trạng thái (Chờ thanh toán/Đã thanh toán/Hủy) column/filter that does not exist in the reference invoice list. |
| low | Label diffs: reference 'Tiền thuế' / 'Tổng Thanh Toán' / 'Ngày Lập' vs local 'VAT' / 'Tổng sau VAT' / 'Ngày tạo'. |

## Group summary

Compared 3 legacy finance pages (/ChungTu/Index, /CongNo/Index, /Invoice/Index) against React counterparts in src/pages/tai-chinh/. All three local pages exist but are thin generic CrudTablePage configs that diverge from the legacy specs. ChungTu (thu chi vouchers) has the widest gap: local lacks 8 of 15 reference columns (Tình Trạng, Số Phiếu SC/NK link, Kỹ thuật, Đại lý/Trạm, Tên khách hàng, Nội dung, Người Thu/Chi, Ngày Thu/Chi), the 12-value voucher-type taxonomy, separate Lập Phiếu Thu/Chi creation flows, per-row print, ~11 search fields incl. date-type radio and 4 autocompletes, two Excel exports, and search-scoped revenue/expense info-boxes (incl. Doanh thu ngoài). CongNo is modeled wrong locally: legacy is a per-ticket (repair/sales) receivables settlement screen with a pay-debt action; local is a generic manual debt ledger with edit/delete only. Invoice locally misses payment-method, tax-code, and creator columns/filters, the /Invoice/Create full-page composer (local create is a bare sheet; drawer view-only), and checkbox bulk delete. Local-only extras not in reference: approval-style trạng thái pills, KPI strip on CongNo, invoice status column.

## Addendum — verified from mirrored partials (260703)

### /tmp/ptref/ajax-ChungTu-List.html — live list partial with real rows
Resolves: prior spec relied on static index page for column list; live partial now confirms full rendered rows.

- Header row verified, exact order (16 th): [checkbox-toggle "Chọn tất cả"] | Tình Trạng | Số chứng từ | Loại phiếu | Hình thức | Số Phiếu SC/NK | Kỹ thuật | Đại lý/Trạm | Tên khách hàng | Ngày lập | Số tiền | Nội dung | Người tạo | Người Thu/Chi | Ngày Thu/Chi | Chọn. Matches spec above exactly.
- Live rows confirm: per-row checkbox `inputCheck` (value=voucher id); **Chọn** cell = single print button `span.ms-btn-receipt-print` tooltip "in phiếu" (fa-print) — the ONLY per-row action; no edit/delete icons.
- Số Phiếu SC/NK links verified both variants: `<a href="/Repairing/Detail?id=..." target="_blank">PSC-... <model></a>` (link text includes brand/model, e.g. "PSC-202606-376 BTP (BOSS - POONGSAN...)") and `<a class="ma-detailre" data-id="...">PNK-...</a>` (popup). Manual chi vouchers have empty cell.
- Loại phiếu values seen live: Phiếu Chi, Phiếu Thu Sửa Chữa, Chi Xăng — confirms 12-value taxonomy in-column, not just filter.
- Số tiền blank on PNK-linked Phiếu Chi rows (amount unposted); populated (thousands-separated) on thu rows.
- Tình Trạng cell rendered empty in all captured rows (likely icon/badge only when state set).
- Người Thu/Chi + Ngày Thu/Chi populated only on settled vouchers (same person+timestamp as collection), empty otherwise — confirms collection-state semantics gap.
- Partial re-renders the 4 info-boxes INSIDE the AJAX response with search-scoped numbers (Doanh thu 461,624,613 / Doanh thu ngoài 40,675,000 / Phải thu 105,955,077 / Chi phí 1,047,678,272 / Phải trả blank, all "VNĐ") — confirms KPI boxes are recomputed per search.
- Pagination inside partial, rendered twice (top-right above info-boxes row + below table): "Trang 1 / 40", links 1..10, ellipsis, » (rel=next), »» (#40). Hidden `pageNumber` input included in partial.

### /tmp/ptref/ajax-CongNo-List.html — near-empty partial (zero-result capture)
Resolves: "Table body is empty in the static page — rows render only after AJAX search" — column header now verified from real AJAX response.

- Header-only table, exact order: Số phiếu | Loại phiếu | Ngày lập | KTV | Số tiền | Đã trả | Còn lại | Tên khách hàng | Điện thoại | Chọn (w60 center). Matches spec.
- NO checkbox column (comment `<!-- Check all button -->` present but no th) — no bulk select on Công nợ, unlike ChungTu/Invoice.
- Footer: "Trang 0 / 0" + empty `ul.pagination`. No totals row.
- Still unverified: row markup and the settle-debt button in Chọn (capture had zero rows).

### /tmp/ptref/ajax-Invoice-List.html — near-empty partial (zero-result capture)
Resolves: "Body empty in static mirror (populated by search)" — header verified from real AJAX response.

- Hidden `pageNumber` input + header row, exact order (10 th): [checkbox-toggle "Chọn tất cả"] | Số Hóa Đơn | Hình Thức Thanh Toán | Khách Hàng | Mã Số Thuế | Tiền thuế | Tổng Thanh Toán | Ngày Lập | Người Lập | Chọn. Matches spec.
- Footer "Trang 0 / 0" + empty pagination. No totals row. Row actions in Chọn still unverified (zero rows).

### /tmp/ptref/trimmed/page-Invoice-Create.html — full-page invoice composer
Resolves: "'Lập Hóa Đơn' navigates to /Invoice/Create (full-page composer with line items)" — full structure now verified.

- Form: AJAX POST → `/Invoice/CreatePartial`, replaces `#ma-update`, success cb `CreatePost`; hidden `HoaDonId`=0; logic `/Scripts/CategoryCommon/invoice_update.js`.
- Breadcrumb toolbar: **Lưu** (typeName=save), **Lưu & Thêm mới** (typeName=saveNew), **In Hóa Đơn** (`.ms-print-hoadon` data-id=0), **Danh sách hóa đơn** (back-link /Invoice/Index).
- Fieldset "Thông tin khách hàng": Số hóa đơn* text (`SoHoaDon`); Ngày xuất* datepicker (visible dd/MM/yyyy + hidden `NgayXuat`, default today); Tên khách hàng mua* text (`HoTen`, tooltip "Nhập tên hoặc số điện thoại"); Hình thức thanh toán* select `HinhThucId` — '-- Vui lòng chọn --', **Tiền mặt**(1), **Công nợ**(2), **Chuyển khoản**(3) (note: Công nợ(2) exists on create but NOT in list filter); Mã số thuế* input `AutoCustomer` + input-group-addon search btn (`#btnSeachTaxCode`, `.ma-modal-search-customer`) → hidden `CustomerId`; read-only auto-filled labels **Tên đơn vị:** (`.ms-ten`) and **Địa chỉ:** (`.ms-diachi`).
- Fieldset "Chi tiết": **VAT** editable text input (default 10 = percent); computed read-only money labels **Tổng thành tiền** (`TongTien`), **Tiền thuế** (`TienThue`), **Tổng thanh toán** (`TongThanhToan`) with hidden posted inputs.
- "Hàng hóa đã thêm" grid (`ms-table-add`, serialized to hidden `InvoiceDetail`): STT | Hàng hóa | DVT | Số lượng | Đơn giá | Thành tiền | ## (red remove `ms-remove-detail`); hidden per-row: HoaDonDetailId, MaPhieu, LoaiPhieu, DonGia, SoLuong, ThanhTien.
- Ghi chú textarea (`NoiDung`).
- Source-ticket import: **Loại phiếu thu** select — **Bán hàng**(1) / **Phiếu sửa chữa**(2) / **Nội dung khác**(3); **Số phiếu** input + "Tìm kiếm" addon (`.ma-phieu-search`); results grid `ms-table-root` columns: Loại phiếu | Số phiếu | Model | Mã hàng (all 4 hideable `ms-hide-type`) | Hàng hóa (editable text) | DVT (editable) | Số lượng (number) | Đơn giá (money) | Trừ VAT (number) | ## (green [+] `ms-add-detail` pushes line into invoice grid).
- No quick-create [+] autocompletes on this page; customer lookup is search-modal by MST only.

### New gaps vs local (src/pages/tai-chinh/HoaDonPage.tsx, src/pages/tai-chinh/ThuChiPage.tsx, src/types/finance-types.ts, src/config/finance-tables/hoa-don.config.ts)

| Severity | Gap |
|---|---|
| high | Invoice source-ticket import missing: composer pulls line items from Bán hàng / Phiếu sửa chữa / Nội dung khác via Số phiếu search into an editable staging grid (incl. Model, Mã hàng, DVT, per-line Trừ VAT) then [+]-adds to invoice. Local HoaDon has only phieu_sua_chua_id string — no bán hàng linkage, no import UI, no line-item editing. |
| medium | Customer-by-MST lookup missing: Mã số thuế* + search modal auto-fills Tên đơn vị/Địa chỉ and CustomerId; local create sheet is free-text khách hàng only. |
| medium | Payment method 'Công nợ'(2) exists on invoice create (Tiền mặt/Công nợ/Chuyển khoản) — absent from local entirely (no HinhThuc field on HoaDon type). |
| medium | 'In Hóa Đơn' print button on composer toolbar — no invoice print action anywhere locally. |
| medium | VAT semantics wrong locally: reference VAT is an editable rate (% default 10) deriving Tiền thuế + Tổng thanh toán; local `vat` is a stored money amount rendered via formatVND, no rate input. |
| low | Line-item shape: reference lines carry DVT and per-line Trừ VAT; local HoaDonItem lacks don_vi_tinh and any per-line VAT. |
| low | Dual-save 'Lưu' / 'Lưu & Thêm mới' missing (local CrudSheet single save). |
| low | ChungTu: Số tiền intentionally blank on unposted PNK-linked Phiếu Chi rows; local thu-chi always renders a formatted amount. |
| low | ChungTu: per-row action is print ONLY (no edit/delete in reference rows); local CrudTablePage adds edit/delete icons not present in reference. |
