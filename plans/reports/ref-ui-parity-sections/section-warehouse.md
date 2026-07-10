# UI Parity — Group: warehouse

### Nhập kho — Danh sách nhập kho (/Receiving)
- Ref file: `receiving-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/NhapKhoPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Nhập kho. Box title: "Danh sách nhập kho". Toolbar button in breadcrumb: **Thêm mới** (green, links to full page `/Receiving/Create`).

## Filter bar (fieldset "Thông tin tìm kiếm")
- Chi nhánh (select, AJAX-populated `ListBranchId`)
- Hình thức thu chi (select, AJAX-populated `ListHinhThucThuChiId`)
- Số phiếu nhập kho (text `RecevingCode`)
- Số Đặt hàng/Hóa đơn (text `InvoiceNumber`)
- Mã sản phẩm (autocomplete text → hidden `ProductId`)
- Tên / Số điện thoại khách hàng (autocomplete text → hidden `CustomerId`)
- Nhà kho (select `WarehouseLocationId`, AJAX)
- Ngăn chứa (select `CabinetId`, cascades from Nhà kho — tooltip "Chọn nhà kho trước")
- Người tạo (text `CreatedByName`)
- Từ ngày / Đến ngày (datepicker pair, defaults last month → today)
- Hidden pageNumber, ClientId

## Buttons
- **Tìm kiếm** (submit `searchAll`) — grouped search
- **Tìm chi tiết** (submit `searchDetail`) — line-item detail search (two result modes)
- **Xuất ra Excel** (`ms-report-btn`)

## Table
Columns NOT in this HTML — result table AJAX-loaded into `#ma-list` via POST `/Receiving/List` (unobtrusive AJAX, success `ListPost`); rendering logic in external `/Scripts/CategoryCommon/receiving.js`. Pagination: hidden pageNumber field + server-side PagedList (custom "Trang X / Y" style used app-wide).

## Modals
Shared #MyModal/#MyModal1 empty shells (populated by receiving.js, content unknown), #MyModal2 = Bản đồ chi nhánh (Google Maps, layout-level).

## Endpoints
POST /Receiving/List (search); GET /Receiving/Create (create page); Excel export via external JS.

**Gaps**

| Severity | Gap |
|---|---|
| high | Create workflow: reference navigates to a dedicated full-page /Receiving/Create (receiving voucher with product line items); local opens a generic Sheet form with header-only fields (mã phiếu, kho, nhà cung cấp, ngày, trạng thái, chi nhánh) — no product line entry at all. |
| high | Dual search modes missing: reference has "Tìm kiếm" (voucher-level) AND "Tìm chi tiết" (line-item detail) producing different result sets; local has a single generic search box. |
| medium | Missing filters: Hình thức thu chi, Số phiếu nhập kho, Số Đặt hàng/Hóa đơn, Mã sản phẩm (autocomplete), Khách hàng tên/SĐT (autocomplete), Ngăn chứa (cascading from Nhà kho), Người tạo, Từ ngày/Đến ngày date range. Local only has nhà cung cấp/kho/trạng thái/chi nhánh. |
| medium | Xuất ra Excel button missing locally (no export in CrudTablePage toolbar). |
| medium | Reference table columns unverifiable (AJAX-rendered by receiving.js, not captured in mirror) — local column set (Mã phiếu, Kho nhập, Nhà cung cấp, Ngày nhập, Tổng tiền, Người tạo, Trạng thái, Chi nhánh) is a guess; likely missing per-row actions such as view/print/delete voucher that receiving.js renders. |
| low | Local adds nhà cung cấp concept; reference searches by customer (Tên/SĐT) and hình thức thu chi instead — domain model mismatch worth confirming. |

### Xem Tồn Kho (/ViewInventory)
- Ref file: `viewinventory-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/XemTonKhoPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Xem tồn. Box title "Xem Tồn Kho"; sub-heading "Danh sách tồn kho". Rows-per-page select `numberRow` top-right: 20/30/50/100/150/200/300.

## Filter bar
- Chọn chi nhánh (select: 3 branches)
- Chọn nhà kho (select `WarehouseLocationId`: 6 kho)
- Chọn ngăn chứa (select `CabinetId`, cascades from nhà kho)
- Chọn Nhóm hàng hóa (select `ProductTypeId`: Điện lạnh, Điện tử, Điện Thoại, Điện gia dụng, linh kiện điện tử, Dụng cụ sửa chửa, Nguyên vật liêu sửa chửa, Nhà vệ sinh)
- Tên nhà sản xuất (autocomplete → hidden ManufactoryId)
- Model (autocomplete → hidden ModelId)
- Mã/tên hàng hóa (text ProductName + hidden ProductId)
- Từ Kỳ (`TuKy`) and Đến Kỳ (`DenKy`) — month-period selects (7/2026 back to 1/2018), default current period

## Buttons
- **Tìm kiếm**; **Xuất ra Excel**

## KPI info-boxes (above table, inside #table-update)
Tồn đầu kỳ (green) | Tổng tiền (blue) | Tổng tồn (yellow)

## Table columns (exact, in order)
STT | ## (actions) | Chi nhánh | Mã hàng | Tên hàng | Nhóm hàng | Model | Giá vốn đầu kỳ | Tồn đầu kỳ | Nhập trong kỳ | Xuất trong kỳ | Tồn | Giá vốn trong kỳ | Tồn cuối kỳ | Tổng tiền | Nhà sản xuất | Nhà kho | Ngăn chứa | Kỳ | Có serial

## Row actions (per ViewInventory.js pattern, same as Xac variant)
- Cập nhật (edit modal `.ma-modal-update-warehouse`)
- Xem chi tiết (opens detail page in new tab)
- Nhập trong kỳ / Xuất trong kỳ cell values are drill-down links (`.ms-view-model-type`, data-type NK/XK)

## Pagination
Custom "Trang X / Y" label + PagedList numeric pagination (top and bottom), horizontal-scroll table (width 1500px).

## Endpoints
POST /ViewInventory/ListInventory (AJAX replace #table-update, success ViewInventoryPost); behavior in /Scripts/CategoryCommon/ViewInventory.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set wrong: local (Mã hàng, Tên hàng, Nhóm, ĐVT, Kho, Tồn đầu kỳ, Nhập kỳ, Xuất kỳ, Tồn cuối kỳ, Giá trị) is missing reference columns Chi nhánh, Model, Giá vốn đầu kỳ, Tồn (current), Giá vốn trong kỳ, Tổng tiền, Nhà sản xuất, Ngăn chứa, Kỳ, Có serial; local adds ĐVT which reference does not show. |
| high | Period filtering: reference uses Từ Kỳ / Đến Kỳ month-period selects (accounting periods 1/2018–7/2026); local uses a generic date-range picker (PeriodRangePicker) — different semantics (period-based opening/closing stock). |
| medium | Missing filters: Ngăn chứa (cascading cabinet), Nhà sản xuất (autocomplete), Model (autocomplete), Mã/tên hàng hóa (local has ten_hang text but no product-code autocomplete). Also local duplicates kho/nhóm filters across StockFilterBar and CrudFilterBar. |
| medium | Missing row actions: Cập nhật modal (update warehouse/cabinet assignment), Xem chi tiết (transaction detail page in new tab), and NK/XK drill-down links on Nhập/Xuất trong kỳ counts. |
| medium | Xuất ra Excel missing. Reference nhóm hàng options are real product types (Điện lạnh, Điện tử, …) — local uses phone-part mock groups (Pin, Màn hình, Camera, Bo mạch). |
| low | Local exposes create/edit/delete (generic CRUD Sheet + Xóa) on what is a read-only computed inventory view in reference (only warehouse-location update allowed). Rows-per-page: reference offers 20-300, local 10-100. |

### Xem Tồn Kho Linh Kiện Xác (/ViewInventory IndexXac)
- Ref file: `viewinventory-indexxac.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/TonKhoLKXacPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Xem tồn. Box title "Xem Tồn Kho Linh Kiện Xác"; sub-heading "Danh sách tồn kho linh kiện xác". Rows-per-page select 20/30/50/100/150/200/300.

## Filter bar (identical structure to Xem Tồn Kho)
Chi nhánh (3 options) | Nhà kho (restricted to carcass warehouses, e.g. "Kho LK Xác Daklak") | Ngăn chứa (cascade) | Nhóm hàng hóa (8 product types) | Nhà sản xuất (autocomplete) | Model (autocomplete) | Mã/tên hàng hóa | Từ Kỳ / Đến Kỳ (month-period selects)

## Buttons
Tìm kiếm; Xuất ra Excel

## KPI info-boxes
Tồn đầu kỳ | Tổng tiền | Tổng tồn

## Table columns (exact, in order — same as Xem Tồn Kho but WITHOUT Tổng tiền)
STT | ## | Chi nhánh | Mã hàng | Tên hàng | Nhóm hàng | Model | Giá vốn đầu kỳ | Tồn đầu kỳ | Nhập trong kỳ | Xuất trong kỳ | Tồn | Giá vốn trong kỳ | Tồn cuối kỳ | Nhà sản xuất | Nhà kho | Ngăn chứa | Kỳ | Có serial

## Row actions (visible in captured rows)
- Cập nhật: `.ma-modal-update-warehouse` edit modal (per-row, blue edit icon)
- Xem chi tiết: link opens `/ViewInventory/ViewDetail_Xac?id={id}` in new tab (orange info icon)
- Nhập trong kỳ / Xuất trong kỳ values are `.ms-view-model-type` drill-down links (data-type NK / XK)

## Pagination
"Trang 1 / 978" + PagedList numbers 1-10, », »» (top and bottom of table).

## Endpoints
POST /ViewInventory/ListInventoryXac (AJAX #table-update); GET /ViewInventory/ViewDetail_Xac?id=; JS: /Scripts/CategoryCommon/ViewInventory_Xac.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Local page is a straight clone of tonKhoConfig (retitled) — wrong column set: missing Chi nhánh, Model, Giá vốn đầu kỳ, Tồn, Giá vốn trong kỳ, Nhà sản xuất, Ngăn chứa, Kỳ, Có serial; and it wrongly includes Giá trị (Tổng tiền), which the Xác variant deliberately omits. |
| high | Missing row actions: Cập nhật modal and Xem chi tiết detail view (/ViewInventory/ViewDetail_Xac) plus NK/XK drill-down links — the primary way users inspect carcass-part movement history. |
| medium | Missing KPI info-boxes (Tồn đầu kỳ / Tổng tiền / Tổng tồn) — XemTonKhoPage has an InventoryKpiStrip but TonKhoLKXacPage renders none. |
| medium | Missing filters: Từ Kỳ/Đến Kỳ period selects, Ngăn chứa cascade, Nhà sản xuất, Model, chi nhánh/kho (kho should be restricted to LK Xác warehouses). Local only has ten_hang/nhom/kho generic filters. |
| medium | Xuất ra Excel missing. |
| low | Title mismatch: reference "Xem Tồn Kho Linh Kiện Xác" vs local "Tồn Kho LK Xác Nhận" — "Xác" means carcass/dead part, not "xác nhận" (confirmed); local naming misrepresents the domain concept. |

### Xem Tồn Kho Kỹ Thuật (/TechViewInventory)
- Ref file: `techviewinventory-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/TonKhoKyThuatPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Xem tồn kho kỹ thuật. Box title "Xem Tồn Kho"; sub-heading "Danh sách tồn kho". Rows-per-page select 20/30/50/100/150/200/300.

## Filter bar
- Chọn chi nhánh (select, 3 branches)
- Nhập tên kỹ thuật (autocomplete `AutoUserTech` → hidden TechnicianId)
- Chọn Nhóm hàng hóa (8 product types)
- Tên nhà sản xuất (autocomplete → ManufactoryId)
- Model (autocomplete → ModelId)
- Mã/tên hàng hóa (text + hidden ProductId)
- Từ Kỳ / Đến Kỳ (month-period selects 1/2018–7/2026)

## Buttons
Tìm kiếm; Xuất ra Excel

## KPI info-boxes
Tồn đầu kỳ | Tổng tiền | Tổng tồn

## Table columns (exact, in order)
STT | ## | Chi nhánh | Kỳ | Kỹ thuật | Mã hàng | Tên hàng | Nhóm hàng | Nhà sản xuất | Model | Tồn đầu kỳ | Nhập trong kỳ | Xuất trong kỳ | Tồn | Giá vốn trong kỳ | Tồn cuối kỳ

## Row actions / interactions (inline script)
- `.ma-modal-tralk-d` click → #MyModal titled "Trả linh kiện kho kỹ thuật", body .load(`/CheckOutForTech/TraLKPopupFromTech?id={id}&amount={amount}`) — return-part-from-technician workflow launched per row.

## Pagination
"Trang X / Y" + PagedList (top/bottom), horizontal scroll (1200px table).

## Endpoints
POST /TechViewInventory/ListInventory (AJAX #table-update, success ViewInventoryTechPost); GET /CheckOutForTech/TraLKPopupFromTech?id=&amount= (modal); JS: /Scripts/CategoryCommon/ViewInventoryTech.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Kỹ thuật (technician) dimension entirely missing: local reuses tonKhoConfig, so there is no Kỹ thuật column and no technician-name autocomplete filter — the defining axis of this page. |
| high | Missing "Trả linh kiện kho kỹ thuật" per-row modal (loads /CheckOutForTech/TraLKPopupFromTech?id&amount) — the primary workflow for returning parts held by a technician back to warehouse. |
| high | Column set wrong: missing Chi nhánh, Kỳ, Kỹ thuật, Nhà sản xuất, Model, Tồn, Giá vốn trong kỳ; local wrongly shows Kho and ĐVT/Giá trị columns (technician stock has no warehouse/cabinet). |
| medium | Missing KPI info-boxes (Tồn đầu kỳ / Tổng tiền / Tổng tồn) on this page. |
| medium | Missing filters: Từ Kỳ/Đến Kỳ period selects, Nhà sản xuất and Model autocompletes, Nhóm hàng hóa with real product-type options; and missing Xuất ra Excel. |
| low | Local offers create/edit/delete CRUD actions on a computed read-only view; reference exposes no create/delete here. |

### Danh sách sử dụng linh kiện (/CheckOutForTech/DSCapLK)
- Ref file: `checkoutfortech-dscaplk.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/ThuHoiLKPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Danh sách sử dụng linh kiện. Box title "Danh sách sử dụng linh kiện" (parts issued to technicians / usage list).

## Filter bar
- Chi nhánh (select `ListBranchId`, AJAX)
- Nhà kho (select `ListWarehouseLocationId`; cascades from chi nhánh via GetComboboxAjax → GetWarehouseLocationBranch)
- Nhập tên kỹ thuật (autocomplete → hidden TechnicianId; loader LoadAutocompleteUserTechinicianNotUserId)
- Số phiếu cấp (text CheckOutCode)
- Tình trạng phiếu (select TinhTrangPhieu, 15 color-coded repair-ticket statuses: Mới Nhận, Đã Điều Phối, Báo Giá, Chờ Báo Giá, Chờ Xác Nhận, Chờ Linh Kiện, Đã Đặt Linh Kiện, Đã Có Linh Kiện, Hỏng Khách Trả Lại, Chờ Phiếu Hãng, Trả Lại, Sửa Xong, Đã Giao Cho Khách, Đã Giao Phiếu Hủy, Đã Giao Ngoài)
- Số phiếu SC/hãng (text RepairingCode)
- Mã sản phẩm (autocomplete → ProductId)
- Mục Đích (select PurposeId: Sữa chữa dịch vụ / Bảo hành / Kỹ thuật mượn)
- Tình trạng (select StatusId: Đã trả xác LK / Chưa trả xác LK / Có trả LK / Chưa trả LK)
- Tên nhà sản xuất (autocomplete → ManufactoryId)
- DateType (select: Ngày Cấp / Ngày Giao Phiếu) + Từ ngày / Đến ngày datepickers

## Buttons
**Tìm** (searchDetail submit); **Xuất ra Excel** (ms-report-btn)

## Table
AJAX-loaded into #ma-list via POST /CheckOutForTech/ListDSCapLK (success ListSearchPost); columns rendered by external /Scripts/CategoryCommon/CheckOutForTech_DSCapLK.js (not captured). Pagination: hidden pageNumber + PagedList.

## Modals
Shared #MyModal shells; specific modals driven by external JS (unknown).

**Gaps**

| Severity | Gap |
|---|---|
| high | Page concept mismatch: reference is "Danh sách sử dụng linh kiện" — every part ISSUED to technicians with its repair-ticket status and return-status tracking; local ThuHoiLKPage models a standalone 'thu hồi' voucher (Mã phiếu, Phiếu SC, KTV, Ngày thu hồi, Ghi chú) which does not match the issued-parts usage list. |
| high | Missing key filters that drive the recall workflow: Tình trạng (Đã trả xác LK / Chưa trả xác LK / Có trả LK / Chưa trả LK) and Tình trạng phiếu (15 repair statuses) — locally there is no status filtering at all. |
| medium | Missing filters: Nhà kho (cascading from chi nhánh), Số phiếu cấp, Mã sản phẩm autocomplete, Mục Đích (SC dịch vụ/Bảo hành/KT mượn), Nhà sản xuất, DateType (Ngày Cấp vs Ngày Giao Phiếu) + Từ/Đến ngày range. |
| medium | Xuất ra Excel missing. |
| medium | Reference result columns unverifiable (AJAX via CheckOutForTech_DSCapLK.js) — expect voucher-line columns incl. phiếu cấp, phiếu SC, product, amount, purpose, trả-LK/trả-xác status; local column set needs redesign against real data. |
| low | Local allows create/edit/delete of recovery rows via generic Sheet; reference page is search/list-only (issuance happens from repair ticket flow). |

### Danh sách trả linh kiện (/CheckOutForTech/DSTraLK)
- Ref file: `checkoutfortech-dstralk.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly-kho/DsTraLKPage.tsx`

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Danh sách trả linh kiện. Box title "Danh sách trả linh kiện".

## Filter bar
- Chi nhánh (select, AJAX)
- Nhập tên kỹ thuật (autocomplete → TechnicianId)
- Số phiếu cấp (text CheckOutCode)
- Tên nhà sản xuất (autocomplete → ManufactoryId)
- Số phiếu SC/hãng (text RepairingCode)
- Mã sản phẩm (autocomplete → ProductId)
- Tình trạng (select StatusId: Chờ duyệt / Đã duyệt)
- Loại trả (select PurposeId: Trả từ phiếu / Trả từ kỹ thuật)
- Từ ngày / Đến ngày datepickers

## Buttons
- **Tìm** (searchDetail; re-points form to POST /CheckOutForTech/ListDSTraLK, updates #ma-list)
- **Xuất ra Excel** (ms-report-btn)
- **In Phiếu Trả** (ms-print-tra — print return voucher)
- **Duyệt** (updateTra, green — approve selected returns; row checkboxes expected in AJAX table)

## Table
AJAX-loaded into #ma-list (POST /CheckOutForTech/ListDSTraLK, success ListSearchPost → HideBox). Columns rendered server-side/partial (not captured); rows carry checkboxes for Duyệt/In. Pagination: hidden pageNumber + PagedList (setDefaultPageding).

## Interactions
Autocomplete loaders: LoadAutocompleteManufactory, LoadAutocompleteUserTechinicianNotUserId, LoadAutocompleteProductCode.

**Gaps**

| Severity | Gap |
|---|---|
| high | Missing Duyệt (approve) bulk workflow: reference has row checkboxes + "Duyệt" toolbar button to approve pending returns (Chờ duyệt → Đã duyệt); local has no selection or approval action. |
| medium | Missing In Phiếu Trả (print return voucher) toolbar action. |
| medium | Missing filters: Số phiếu cấp, Nhà sản xuất autocomplete, Số phiếu SC/hãng, Mã sản phẩm autocomplete, Loại trả (Trả từ phiếu / Trả từ kỹ thuật), Từ/Đến ngày range. Local only has KTV/trạng thái/chi nhánh. |
| medium | Status values differ: reference Tình trạng = Chờ duyệt / Đã duyệt; local uses Chờ xác nhận / Đã trả / Hủy — wrong state machine. |
| medium | Xuất ra Excel missing. |
| medium | Reference table columns unverifiable (AJAX partial) — local columns (Mã phiếu, Phiếu cấp LK, KTV, Ngày trả, Lý do, Trạng thái, Chi nhánh) plausible but need checkbox column and likely product/qty columns; verify against live app. |
| low | Local exposes generic create/edit/delete Sheet; reference is list + approve/print only (returns are created from tech-stock or ticket flows). |

### Danh sách trả linh kiện xác (/CheckOutForTech/DSTraLKXac)
- Ref file: `checkoutfortech-dstralkxac.html`
- Local counterpart: MISSING

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Danh sách trả linh kiện xác. Box title "Danh sách trả linh kiện xác" (carcass/dead-part returns to manufacturer).

## Filter bar
- Chi nhánh (select, AJAX)
- Nhà kho (select, cascades from chi nhánh via GetWarehouseLocationBranch)
- Nhập tên kỹ thuật (autocomplete → TechnicianId)
- Số phiếu cấp (text CheckOutCode)
- Mã vận đơn (text MaVanDon — shipping/tracking number)
- Số phiếu SC/hãng (text RepairingCode)
- Tên khách hàng (text CustomerName)
- Mã sản phẩm (autocomplete → ProductId)
- Tình trạng (select StatusId: Chưa trả hãng / Đã trả hãng)
- Tên nhà sản xuất (autocomplete → ManufactoryId)
- Từ ngày / Đến ngày datepickers

## Buttons
- **Tìm** (POST /CheckOutForTech/ListDSTraLKXac → #ma-list)
- **Xuất ra Excel** (GET /CheckOutForTech/ExcelDetailTraXac with form params)
- **Trả hãng** (updateTra, green): collects checked `.ms-check-box-repairing` row checkboxes; if none → alert "Vui lòng chọn phiếu để trả"; else opens #MyModal titled "Trả linh kiện" loading /CheckOutForTech/UpdateTraHang?ids={csv} (bulk mark returned-to-manufacturer)
- **In BB Kỹ Thuật** (ms-print-traxac — print technician inspection minutes)
- **In Phiếu Trả Hãng** (ms-print-trahang — print manufacturer-return voucher)

## Table
AJAX-loaded into #ma-list; rows carry checkboxes (.ms-check-box-repairing). Columns not captured (server partial). Pagination: hidden pageNumber + PagedList.

## Modals
"Trả linh kiện" (#MyModal, body from /CheckOutForTech/UpdateTraHang?ids=) — confirm/record manufacturer return incl. presumably mã vận đơn.

**Gaps**

| Severity | Gap |
|---|---|
| high | Entire page missing locally: no route, page, or config for Danh sách trả linh kiện xác (carcass-part return-to-manufacturer tracking). Routes.ts has no counterpart (inventoryPartsReturn covers DSTraLK only). |
| high | Missing Trả hãng bulk workflow (checkbox select → modal /CheckOutForTech/UpdateTraHang) and Chưa/Đã trả hãng status tracking with Mã vận đơn. |
| medium | Missing prints: In BB Kỹ Thuật and In Phiếu Trả Hãng; missing Excel export (ExcelDetailTraXac). |

## Group summary

Warehouse group: 7 reference pages vs 6 local React pages. Local pages are thin CrudTablePage wrappers sharing generic configs, so every page diverges substantially. Biggest gaps: (1) checkoutfortech-dstralkxac (Danh sách trả LK xác — return-to-manufacturer with Trả hãng bulk modal, vận đơn tracking, 2 print vouchers) has NO local counterpart; (2) the three inventory views locally reuse one tonKhoConfig, missing the reference's 16-20 column layout (Chi nhánh, Model, Giá vốn đầu/trong kỳ, Ngăn chứa, Kỳ, Có serial, Nhà sản xuất), Từ Kỳ/Đến Kỳ period selects, KPI info-boxes on Xác/KT pages, Cập nhật + Xem chi tiết row actions, and NK/XK drill-down links; (3) Tồn Kho Kỹ Thuật lacks the technician column/filter and the Trả linh kiện kho kỹ thuật modal; (4) DSCapLK local page (ThuHoiLKPage) models the wrong entity — reference is an issued-parts usage list with 11 filters incl. 15-status ticket filter and trả-LK/trả-xác status; (5) DSTraLK lacks the Duyệt approve workflow, In Phiếu Trả, and uses a wrong status set. Excel export is missing on all 7 pages; result tables for receiving/DSCapLK/DSTraLK/DSTraLKXac are AJAX partials not captured in the mirror, so their exact column sets must be verified from the live app or controller code. Local pages also add generic create/edit/delete Sheets to views that are read-only in the reference.

## Addendum — verified from mirrored partials (260703)

### ajax-Receiving-List.html (POST /Receiving/List partial)
Resolves: "Reference table columns unverifiable (AJAX-rendered by receiving.js, not captured in mirror)".

Columns (exact, in order): [checkbox "Chọn tất cả" toggle] | Số phiếu | Số đặt hàng | Số hóa đơn | Nhà cung cấp | Hình thức thanh toán | Nhà kho | Số tiền | Người lập | Ngày lập | Ghi Chú | Chọn.
- NO Trạng thái column in reference — local trang_thai (Chờ duyệt/Đã duyệt) is invented.
- Per-row actions ("Chọn" cell): **In** (btn-warning, `/Print/Receiving?id={id}`, new tab), **Chi tiết** (`.ma-detail` → modal). Row checkbox `inputCheck` per voucher.
- Header controls: refresh btn (tooltip "Tải lại trang"), **Tổng tiền** info-box (bg-blue, ms-money) top-right.
- Pagination: "Trang 1 / 10" + PagedList numbers, top AND bottom.
- Data notes: Số phiếu format `PNK-YYYYMMDD-n`; Nhà cung cấp = customer entity (supplier names); Ngày lập `dd/MM/yyyy hh:mm AM/PM`.

### ajax-ViewInventory-ListInventory.html (POST /ViewInventory/ListInventory)
Near-empty result (Trang 0 / 0) but structure captured. Confirms prior spec exactly: KPI info-boxes Tồn đầu kỳ (green) / Tổng tiền (blue) / Tổng tồn (yellow); 20-col header STT | ## | Chi nhánh | Mã hàng | Tên hàng | Nhóm hàng | Model | Giá vốn đầu kỳ | Tồn đầu kỳ | Nhập trong kỳ | Xuất trong kỳ | Tồn | Giá vốn trong kỳ | Tồn cuối kỳ | Tổng tiền | Nhà sản xuất | Nhà kho | Ngăn chứa | Kỳ | Có serial; 1500px scroll-box; paging top+bottom. No new gaps.

### ajax-ViewInventory-ListInventoryXac.html (POST /ViewInventory/ListInventoryXac)
Confirms prior spec with real rows: 19 cols (same as above WITHOUT Tổng tiền). Per-row verified: **Cập nhật** (`.ma-modal-update-warehouse`, btn-info) + **Xem chi tiết** (`/ViewInventory/ViewDetail_Xac?id={id}`, btn-warning, new tab); Nhập/Xuất trong kỳ are `.ms-view-model-type` links (data-type NK/XK); Tồn cell text-bold; Có serial renders "-"; Kỳ renders "10/2020". KPI values populated (Tồn đầu kỳ 10291, Tổng tồn -40247762 — note negative aggregate). Pagination "Trang 1 / 978" with … » »». No new gaps beyond existing.

### ajax-TechViewInventory-ListInventory.html (POST /TechViewInventory/ListInventory)
Confirms prior spec: 16 cols STT | ## | Chi nhánh | Kỳ | Kỹ thuật | Mã hàng | Tên hàng | Nhóm hàng | Nhà sản xuất | Model | Tồn đầu kỳ | Nhập trong kỳ | Xuất trong kỳ | Tồn | Giá vốn trong kỳ | Tồn cuối kỳ; same KPI trio; inline handler `.ma-modal-tralk-d` → #MyModal "Trả linh kiện kho kỹ thuật" loading `/CheckOutForTech/TraLKPopupFromTech?id={id}&amount={amount}`. No new gaps beyond existing.

### ajax-CheckOutForTech-ListDSCapLK.html (POST /CheckOutForTech/ListDSCapLK)
Resolves: "Reference result columns unverifiable (AJAX via CheckOutForTech_DSCapLK.js)".

Columns (exact, in order): ## | Tình trạng | Số phiếu cấp | Số phiếu SC | Số phiếu hãng | Model | Serial | NSX | Nhà kho | Mã hàng | Tên hàng | Kĩ thuật | Mục đích | Ngày cấp | Người cấp | Ngày giao | Ngày TX | Người TX | Số lượng cấp | SL Trả | Chọn.
- **Tình trạng cell = action buttons**, state-dependent: **Thu xác LK** (`.ma-modal-thuxac-d`, tooltip "Thu xác linh kiện", data-id/branchid/techname/amount) + **Trả Linh kiện** (`.ma-modal-tralk-d`, data-amount/amounttra); once returned → **In Tem Trả Xác** print link (`/Print/PrintTemDanXac?id=`) + label-success "Đã trả xác".
- Số phiếu hãng cell embeds color-coded ticket-status badge (observed: Đã Có Linh Kiện #6D5582, Sửa Xong #3300FF, Đã Giao Cho Khách #00FF00, Chờ Phiếu Hãng #06385c, Báo Giá #9966CC).
- Mục đích values observed: Bảo hành, Sửa dịch vụ. SL Trả rendered text-danger. Row action **Chi tiết** (`.ma-detail`).
- KPI info-boxes: **Tổng cấp** (yellow) | **Tổng tiền LK chưa giao** (blue) | **Tổng tiền LK đã giao** (green). Refresh submit btn. Pagination "Trang 1 / 39" bottom.

### ajax-CheckOutForTech-ListDSTraLK.html (POST /CheckOutForTech/ListDSTraLK)
Resolves: "Reference table columns unverifiable (AJAX partial) — local columns … verify against live app".

Columns (exact, in order): ## | [checkbox "Chọn tất cả"] | Tình trạng | Hình thức | Mã hàng | Tên hàng | Kĩ thuật | SL | Số phiếu cấp | Số phiếu SC | Số phiếu hãng | Model | Serial | NSX | Ngày tạo | Người tạo | Ngày duyệt | Người duyệt.
- Row checkboxes `.ms-check-box-repairing` (drive Duyệt/In Phiếu Trả). Hình thức value observed: "Trả từ phiếu" (text-blue).
- Inline scripts: `.ms-print-tra` → `window.open("/Print/PrintLKTraKT?id="+csv)`, alert "Vui lòng chọn phiếu để in" when none; `.updatetraxac` per-row → bootbox confirm "Bạn có chắn chắn Duyệt trả linh kiện?" (Đã nhận / Hủy) → GET `/CheckOutForTech/DuyetTraLK?id=` → "Duyệt thành công!".
- KPI info-box: **Tổng số LK** (green, value 38). Pagination "Trang 1 / 2".

### ajax-CheckOutForTech-ListDSTraLKXac.html (POST /CheckOutForTech/ListDSTraLKXac)
Resolves: "Columns not captured (server partial)".

Columns (exact, in order): ## | [checkbox "Chọn tất cả"] | Tình trạng | Mã vận đơn (text-blue) | Số phiếu cấp | Số phiếu SC | Số phiếu hãng | Model | Serial | Nhà kho | NSX | Mã hàng | Tên hàng | Kĩ thuật | Mục đích | Ngày TX | Người TX | SL | Ngày tạo | Người tạo.
- Tình trạng renders label-warning "Chưa trả hãng" (Đã trả hãng expected other state). Row checkboxes `.ms-check-box-repairing`.
- Inline scripts: `.ms-print-traxac` → `/Print/PrintLKXacKT?id=csv` (In BB Kỹ Thuật); `.ms-print-trahang` → `/Print/PrintLKXacHang?id=csv` (In Phiếu Trả Hãng); both alert "Vui lòng chọn phiếu để in" when none selected.
- KPI info-box: **Tổng số LK** (green, 3498). Pagination "Trang 1 / 36".

### trimmed/page-Receiving-Create.html (GET /Receiving/Create full-page editor)
Resolves detail behind existing high gap "Create workflow: reference navigates to a dedicated full-page /Receiving/Create".

Form: POST `/Receiving/CreatePartial` (unobtrusive AJAX, update #ma-update, success CreateReceivingPost). Toolbar (sticky breadcrumb): **Lưu** (green) | **Lưu & Thêm mới** (blue) | **In** (`/Print/Receiving?id=0`, new tab) | **Danh sách nhập kho** (back to /Receiving/Index).

Fieldset "Thông tin khách hàng":
- Số phiếu (readonly "Phát sinh tự động") | Ngày nhập (disabled datepicker dd/MM/yyyy + hidden ReceivingDate)
- Nhà kho* (select, 6 kho) | Ngăn chứa* (select2 CabinetId, cascades from kho) | Hình thức thanh toán* (Tiền mặt / Công nợ / Chuyển khoản) | Khoản chi (readonly "Chi mua hàng", hidden MaLoaiThuChi=3)
- Nhóm khách hàng* (select: Khách lẻ, Đối tác MB/Nhà CC [default], Đại lý chính, Trung tâm bảo hành, Đại lý/Cửa hàng, Nhân viên công ty, Thợ sửa chữa, Cộng tác viên, Nhà xe - Chuyển phát) | Nhà cung cấp* (autocomplete #AutoCustomer "Nhập vào Tên / Số điện thoại" → hidden CustomerId, with **[+] Thêm mới nhà cung cấp** input-group addon → modal)
- Số hóa đơn (text) | Người giao (text) | Ngày nhập hóa đơn (datepicker) | Ngày giao (datepicker)
- Số đặt hàng (textarea) | Ghi chú (textarea)

Fieldset "Chi tiết" (line-item entry panel):
- Nhà sản xuất (autocomplete #AutoManufactory → ManufactoryId) | Model (autocomplete #AutoModel + **[+] Thêm mới model** → /Model/CreatePartial modal) | Hàng hóa* (autocomplete #AutoProduct "Nhập vào mã hàng" + **[+] Thêm mới hàng hóa** modal; hidden ProductId/Price/Code/Name/PriceShow/IsSerial) | Số lượng (text)
- Giá mua mới (money input + addon showing current product price) | checkbox **Cập nhật giá** | button **Thêm hàng** (`.ms-receving-detail-create`, green)
- Hidden serial box "Danh sách Serial" (textarea #ListSerial) revealed when product IsSerial.

Line grid "Danh sách hàng nhập" columns: # | Mã | Tên | Ngăn chứa (per-row cascading select) | Số lượng (editable input) | Đơn giá | Thành tiền | Cập nhật giá (checkbox) | Serial (textarea) | ## (remove btn `.ms-receving-detail-remove`). Serialized to hidden ReceivingDetail + NumberProduct + TotalPaid.

Validation (jQuery validate): WarehouseLocationId/CabinetId/MaHinhThucThuChi/MaLoaiThuChi required; CustomerId min 1 "Vui lòng chọn nhà cung cấp!"; NumberProduct min 1 "Vui lòng thêm hàng hóa!". Behavior JS: /Scripts/CategoryCommon/receiving_update.js; autocomplete loaders LoadAutocompleteCustomerTypeByType(3), LoadAutocompleteManufactory, LoadAutocompleteModelAllShow, GetProductReceivingByModel; Enter suppressed in inputs.

### New gaps vs local (verified reality)

| Severity | Gap |
|---|---|
| high | NhapKho list columns now verified — local missing: Số đặt hàng, Số hóa đơn, Hình thức thanh toán, Ghi Chú; per-row **In** (`/Print/Receiving?id=`) and **Chi tiết** modal actions; row checkboxes + "Chọn tất cả"; Tổng tiền info-box above table. (nhap-kho.config.ts) |
| medium | NhapKho local invents Trạng thái column/field/filter (Chờ duyệt/Đã duyệt) — reference list has NO status column; receiving vouchers have no approval state machine. |
| high | Receiving create editor (now fully specified): local Sheet lacks Nhóm khách hàng select, Nhà cung cấp autocomplete with [+] quick-create, Ngăn chứa cascade, Hình thức thanh toán/Khoản chi, Số hóa đơn/Người giao/Ngày nhập hóa đơn/Ngày giao/Số đặt hàng, line-item panel (NSX/Model/Hàng hóa autocompletes each with [+] modal, Giá mua mới + Cập nhật giá, Thêm hàng), line grid (Mã/Tên/Ngăn chứa/SL/Đơn giá/Thành tiền/Cập nhật giá/Serial/remove), serial capture, Lưu & Thêm mới, In from editor. |
| high | DSCapLK columns verified (21) — local ThuHoiLKPage (6 cols) missing per-row state actions **Thu xác LK** and **Trả Linh kiện** modals, **In Tem Trả Xác** (`/Print/PrintTemDanXac`), "Đã trả xác" label, color-coded ticket-status badge in Số phiếu hãng, Serial/NSX/Nhà kho/Mục đích/Ngày cấp/Người cấp/Ngày giao/Ngày TX/Người TX/Số lượng cấp/SL Trả columns, Chi tiết action. |
| medium | DSCapLK KPI info-boxes missing locally: Tổng cấp / Tổng tiền LK chưa giao / Tổng tiền LK đã giao. |
| high | DSTraLK columns verified (18) — local (7 cols) missing Hình thức (Trả từ phiếu/Trả từ kỹ thuật), Mã hàng/Tên hàng/SL/Số phiếu SC/Số phiếu hãng/Model/Serial/NSX, Ngày duyệt/Người duyệt; missing per-row Duyệt confirm (bootbox → GET /CheckOutForTech/DuyetTraLK?id=) in addition to bulk Duyệt; print endpoint /Print/PrintLKTraKT?id=csv; Tổng số LK KPI box. Local Lý do column not present in reference. |
| medium | DSTraLKXac columns verified (20) — page still absent locally (existing high gap); verified additions: Mã vận đơn column, Chưa trả hãng label-warning state, print endpoints /Print/PrintLKXacKT (BB Kỹ Thuật) + /Print/PrintLKXacHang (Phiếu Trả Hãng), Tổng số LK KPI box. |
| low | Xác inventory KPI "Tổng tồn" can be negative (-40,247,762 observed) — local KPI strip must not clamp/format-as-positive. |
