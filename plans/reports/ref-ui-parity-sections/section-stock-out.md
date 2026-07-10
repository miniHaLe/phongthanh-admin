# UI Parity: stock-out

### Danh sách phiếu cấp linh kiện (Cấp Linh Kiện Cho Kỹ Thuật)

- Ref file: `/tmp/ptref/trimmed/checkoutfortech-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/xuat-kho/CapLinhKienPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/finance-tables/cap-linh-kien.config.ts`)

**Ref spec**

## Header
- Breadcrumb: Trang chủ / Danh sách phiếu cấp linh kiện
- Header button: **Thêm phiếu cấp** → full page `/CheckOutForTech/Create`
- Box title: "Danh sách phiếu cấp linh kiện"

## Filter fieldset "Thông tin tìm kiếm" (3 rows)
| Field | Type | Notes |
|---|---|---|
| Chi nhánh (`BranchId`) | select | options AJAX-populated; on change cascades Nhà kho via `GetComboboxAjax(..., "GetWarehouseLocationBranch")` |
| Nhà kho (`WarehouseLocationId`) | select | cascading from branch |
| Nhập tên kỹ thuật (`AutoUserTech` → hidden `TechnicianId`) | autocomplete text | `LoadAutocompleteUserTechinicianNotUserId()` |
| Số phiếu cấp (`CheckOutCode`) | text | |
| Số phiếu SC (`RepairingCode`) | text | repair-ticket number |
| Mã sản phẩm (`AutoProductCode` → hidden `ProductId`) | autocomplete text | `LoadAutocompleteProductCode()` |
| Mục Đích (`PurposeId`) | select | Mục Đích / Sữa chữa dịch vụ (1) / Bảo hành (2) / Kỹ thuật mượn (3) |
| Tên nhà sản xuất (`AutoManufactory` → hidden `ManufactoryId`) | autocomplete text | `LoadAutocompleteManufactory()` |
| Từ ngày / Đến ngày (`FromDate`/`ToDate`) | datepickers | default = last 1 month (03/06/2026–03/07/2026) |

## Search-bar buttons
- **Tìm kiếm** (`searchAll`) — grouped/summary search
- **Tìm chi tiết** (`searchDetail`) — detail-level (line-item) search
- **Xuất ra Excel** (`ms-report-btn`)
- **Báo cáo lợi nhuận** (`ms-report-btnloinhuan`) — profit report export

## Table
- Results AJAX-rendered into empty `#ma-list` container by form POST `/CheckOutForTech/List` + `/Scripts/CategoryCommon/CheckOutForTech_update.js`. **Column markup NOT captured in the trimmed snapshot** (table only exists after AJAX). Column set must be captured live or inferred from sibling page checkoutfortech-dscaplk.html (Danh sách sử dụng linh kiện, another group's scope).
- Hidden `pageNumber` input → server-side paging, AdminLTE "Trang X / Y" + numbered pagination pattern (same as sibling pages).

## Modals / misc
- Shared layout modals #MyModal, #MyModal1, #MyModal2 (Bản đồ chi nhánh Google-map) — layout-level, not page-specific.
- Endpoints: POST `/CheckOutForTech/List`; create page `/CheckOutForTech/Create`; combobox AJAX `GetWarehouseLocationBranch`.

**Gaps**

| Severity | Gap |
|---|---|
| high | Create workflow: reference uses a dedicated full-page create (/CheckOutForTech/Create) for a dispatch slip with product line items; local uses the generic CrudSheet with only header fields (ma, phieu_sc_ma, ky_thuat_vien, ngay_cap, branchId) — no line-item entry at all. |
| high | Reference has a dual search mode: 'Tìm kiếm' (summary rows) vs 'Tìm chi tiết' (per-line-item results). Local has only one flat list; the detail search mode and its result shape are missing. |
| medium | Missing filters: Nhà kho (cascading select driven by Chi nhánh), Số phiếu cấp, Mã sản phẩm (autocomplete), Mục Đích select (Sữa chữa dịch vụ / Bảo hành / Kỹ thuật mượn), Tên nhà sản xuất (autocomplete), and Từ ngày/Đến ngày date-range. Local only has Kỹ thuật viên (plain text), Phiếu SC, Chi nhánh. |
| medium | Missing export actions: 'Xuất ra Excel' and 'Báo cáo lợi nhuận' buttons have no local equivalent. |
| medium | Reference result-table columns are unknown (AJAX-loaded into #ma-list, not present in trimmed snapshot). Local column set (Mã phiếu, Phiếu SC, Kỹ thuật viên, Ngày cấp, Tổng tiền, Chi nhánh) cannot be validated; needs a live capture of POST /CheckOutForTech/List before implementation. Purpose (Mục đích) and Nhà kho are likely reference columns given the filters. |
| low | Domain concept 'Mục đích' (purpose: service repair / warranty / technician loan) is absent from the local CapLinhKien type entirely, not just from filters. |

### Danh sách đơn hàng (Bán Hàng)

- Ref file: `/tmp/ptref/trimmed/sellingproduct-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/xuat-kho/BanHangPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/finance-tables/ban-hang.config.ts`)

**Ref spec**

## Header
- Breadcrumb: Trang chủ / Danh sách đơn hàng
- Header button: **Thêm đơn hàng** → full page `/SellingProduct/Create`
- Box title: "Danh sách đơn hàng"

## Filter fieldset "Thông tin tìm kiếm"
| Field | Type | Notes |
|---|---|---|
| Chi nhánh (`BranchId`) | select | cascades Nhà kho |
| Nhà kho (`WarehouseLocationId`) | select | cascading |
| Hình thức thu chi (`HinhThucThuChiId`) | select | payment-method options AJAX-populated |
| Số phiếu/Ghi chú (`SellingProductCode`) | text | searches slip number OR note |
| Tên khách hàng (`CustomerName`) | text | |
| Mã hàng/ Tên hàng (`Description`) | text | searches by product code/name inside order lines |
| Từ ngày / Đến ngày | datepickers | default last month |

## Search-bar buttons
- **Tìm kiếm** (searchAll), **Tìm chi tiết** (searchDetail), **Xuất ra Excel** (ms-report-btn), **Báo cáo lợi nhuận** (ms-report-btnloinhuan)

## Bulk toolbar (mailbox-controls)
- refresh (Tải lại trang), edit (Cập nhật — submits with checked row), delete (Xóa, `ms-delete data-root=SellingProduct`, bulk on checked rows)

## Table columns (exact, in order)
[✓ check-all checkbox] | Số phiếu | Ngày lập | Khách hàng | Điện thoại | Tổng tiền | Người lập | Ghi chú | Chọn
- Sample data: Số phiếu format `PBH-YYYYMMDD-n`; Ngày lập `25/06/2026 14:15` (datetime); Tổng tiền right-aligned `5,350,000`.

## Per-row actions (in "Chọn" column)
- **Thêm hình** (camera, `ms-update-image` data-id) — image-upload modal (canvasResize/exif/binaryajax + repairing-UpdateImage.js)
- **Chỉnh sửa** → `/SellingProduct/Edit?id={id}` (full page)
- **Xuất kho** (print icon) → `/Print/Selling?id={id}` new tab — printable stock-out slip
- **Chi tiết** (`ma-detail` data-id) — loads order-detail modal (line items)

## Pagination
- Server-side: hidden pageNumber, "Trang 1 / 1" label + numbered pagination list.
- Endpoints: POST `/SellingProduct/List`, `/SellingProduct/Create`, `/SellingProduct/Edit?id=`, `/Print/Selling?id=`.

**Gaps**

| Severity | Gap |
|---|---|
| high | Wrong column set: reference is [Số phiếu, Ngày lập, Khách hàng, Điện thoại, Tổng tiền, Người lập, Ghi chú]; local shows [Mã phiếu, Khách hàng, Ngày bán, Tổng tiền, Trạng thái, Chi nhánh]. Missing: Điện thoại (customer phone), Người lập (creator), Ghi chú (note). Local adds a Trạng thái column that does not exist in the reference list. |
| high | Missing per-row actions: 'Xuất kho' print slip (/Print/Selling?id=, new tab), 'Chi tiết' detail modal (order line items), and 'Thêm hình' image upload. Local rows only have generic edit/delete icons. |
| high | Create/edit workflow: reference uses dedicated full-page order create/edit (/SellingProduct/Create, /SellingProduct/Edit?id=) with product line items; local uses the generic CrudSheet with 5 header fields and no order lines. |
| medium | Missing filters: Nhà kho (cascading), Hình thức thu chi (payment method select), Số phiếu/Ghi chú, Mã hàng/Tên hàng (searches inside order lines), and Từ ngày/Đến ngày date-range. Local only has Khách hàng, Trạng thái, Chi nhánh. |
| medium | Missing bulk-selection workflow: reference has a checkbox column with check-all toggle plus a bulk toolbar (refresh / edit-checked / delete-checked). Local table has no row selection. |
| medium | Missing export/search buttons: 'Tìm chi tiết' mode, 'Xuất ra Excel', 'Báo cáo lợi nhuận'. |
| low | Label diffs: page title 'Bán Hàng' vs reference 'Danh sách đơn hàng'; column 'Mã phiếu' vs 'Số phiếu'; 'Ngày bán' (date only) vs 'Ngày lập' (datetime dd/MM/yyyy HH:mm). |

### Danh sách phiếu trả hàng (Trả Hàng)

- Ref file: `/tmp/ptref/trimmed/returnproduct-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/xuat-kho/TraHangPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/finance-tables/tra-hang.config.ts`)

**Ref spec**

## Header
- Breadcrumb: Trang chủ / Danh sách phiếu trả hàng
- Header button: **Thêm phiếu trả hàng** → full page `/ReturnProduct/Create`
- Box title: "Danh sách phiếu trả hàng"

## Filter fieldset "Thông tin tìm kiếm"
| Field | Type | Notes |
|---|---|---|
| Chi nhánh (`BranchId`) | select | |
| Hình thức trả (`HinhThucTraId`) | select | Trả hàng từ kỹ thuật (1) / Trả hàng từ khách hàng (2) / Trả hàng cho nhà cung cấp (3) / Trả hàng từ kho (4) |
| Số phiếu (`ReturnCode`) | text | |
| Từ ngày / Đến ngày | datepickers | default last month |

## Search-bar buttons
- **Tìm kiếm** (ms-search-btn)
- **Xuất ra Excel** (ms-report-btn)
- **Xuất Excel Chi Tiết** (ms-reportdetail-btn)

## Bulk toolbar
- refresh / edit / delete (`ms-delete data-root=ReturnProduct`) operating on checked rows

## Table columns (exact, in order)
[✓ check-all checkbox] | Số phiếu | Ngày trả | Hình thức trả | Người lập | Chọn
- Sample: Số phiếu format `PTH-YYYYMMDD-n`; Ngày trả full datetime `7/1/2026 3:10:47 PM`; Hình thức trả e.g. "Trả hàng từ kỹ thuật".

## Per-row actions (in "Chọn" column)
- **Chỉnh sửa** → `/ReturnProduct/Edit?id={id}` (full page)
- **Print** (warning print icon) → `/Print/ReturnProduct_TraNCC?id={id}` new tab (supplier-return print slip)
- **Chi tiết** (`ma-detail` data-id) — detail modal with returned line items

## Pagination
- Server-side: "Trang 1 / 1" + numbered pagination.
- Endpoints: POST `/ReturnProduct/List`, `/ReturnProduct/Create`, `/ReturnProduct/Edit?id=`, `/Print/ReturnProduct_TraNCC?id=`. JS: `/Scripts/CategoryCommon/returnproduct.js`.

## Nav note
- Reference sidebar also lists "Trả hàng cho nhà cung cấp" with href="#" (dead link) — supplier returns are handled as Hình thức trả value 3 on this page, not a separate page.

**Gaps**

| Severity | Gap |
|---|---|
| high | Domain model mismatch: reference return slips are classified by 'Hình thức trả' (4 types: từ kỹ thuật / từ khách hàng / cho nhà cung cấp / từ kho) — this is the primary axis (column + filter). Local TraHang model has no return-type at all; it models customer refunds (khach_hang_ten, ly_do, tong_tien_hoan) which do not exist in the reference list. |
| high | Wrong column set: reference [Số phiếu, Ngày trả, Hình thức trả, Người lập]; local [Mã phiếu, Khách hàng, Ngày trả, Lý do, Tiền hoàn, Chi nhánh]. Missing Hình thức trả and Người lập; Khách hàng/Lý do/Tiền hoàn are inventions not in the reference. |
| high | Missing per-row actions: print slip (/Print/ReturnProduct_TraNCC?id=, new tab) and 'Chi tiết' modal. Create/edit is a generic sheet instead of the dedicated full-page slip editor with product lines (/ReturnProduct/Create, /ReturnProduct/Edit). |
| medium | Missing filters: Hình thức trả select, Số phiếu, Từ ngày/Đến ngày date-range. Local filters (Khách hàng) do not match reference. |
| medium | Missing exports: 'Xuất ra Excel' and 'Xuất Excel Chi Tiết'; missing checkbox bulk-selection toolbar (refresh/edit/delete on checked rows). |
| low | Reference nav item 'Trả hàng cho nhà cung cấp' is a dead link (href="#"); supplier returns live inside this page as Hình thức trả=3. No separate local page needed — just record the note. |

### Danh sách chuyển kho (Chuyển Kho)

- Ref file: `/tmp/ptref/trimmed/movinginventory-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/xuat-kho/ChuyenKhoPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/finance-tables/chuyen-kho.config.ts`)

**Ref spec**

## Header
- Breadcrumb: Trang chủ / Danh sách chuyển kho
- TWO header create buttons:
  - **Chuyển cùng chi nhánh** → `/MovingInventory/CreateBranch` (same-branch, warehouse-to-warehouse)
  - **Chuyển khác chi nhánh** → `/MovingInventory/Create` (cross-branch transfer)
- Box title: "Danh sách chuyển kho"

## Filter fieldset "Thông tin tìm kiếm"
| Field | Type | Notes |
|---|---|---|
| Từ chi nhánh (`FromBranchId`) | select | inline branch options (TTBH Đăk lăk / Đăk nông / Cộng tác viên tuyến huyện) |
| Đến chi nhánh (`ToBranchId`) | select | same branch options |
| Số phiếu (`MovingInventoryCode`) | text | |
| Từ ngày / Đến ngày | datepickers | default last month |
| Trạng thái (`StatusId`) | select | Chưa xác nhận (0) / Đã xác nhận (1) / Không xác nhận (2) — receiving-side confirmation status |

## Search-bar buttons
- **Tìm kiếm**, **Xuất Excel** (ms-report-btn), **Xuất Excel Chi Tiết** (ms-reportdetail-btn)

## Bulk toolbar
- refresh / edit / delete (`ms-delete data-root=MovingInventory`) on checked rows

## Table
- Results AJAX-rendered into empty `#table-update` by form POST `/MovingInventory/List` + `/Scripts/CategoryCommon/moving_update.js`. **Column markup NOT captured in trimmed snapshot** — needs live capture. Given filters/toolbar, expect at minimum: checkbox, Số phiếu, date, Từ/Đến chi nhánh (or kho), Trạng thái xác nhận, Người lập, row actions (edit/print/detail, likely a confirm-receipt action for the Chưa/Đã/Không xác nhận flow).
- Server-side pagination (hidden PageSize `ms-PageSize-set`).
- Endpoints: POST `/MovingInventory/List`, `/MovingInventory/Create`, `/MovingInventory/CreateBranch`.

**Gaps**

| Severity | Gap |
|---|---|
| high | Reference has TWO distinct create workflows — 'Chuyển cùng chi nhánh' (/MovingInventory/CreateBranch) and 'Chuyển khác chi nhánh' (/MovingInventory/Create) — each a full page with product lines. Local has a single generic 'Thêm' sheet with header fields only; the same-branch vs cross-branch distinction does not exist. |
| high | Status model mismatch: reference statuses are a receiving-confirmation flow — Chưa xác nhận / Đã xác nhận / Không xác nhận; local uses invented values Chờ xác nhận / Hoàn thành / Hủy. The confirm/reject-receipt workflow implied by these statuses is absent locally. |
| medium | Filter axis differs: reference filters by Từ chi nhánh / Đến chi nhánh (branch-to-branch) plus Số phiếu and date-range; local filters by Kho nguồn / Kho đích / Trạng thái / Chi nhánh, with no Số phiếu and no date-range. (Reference branch pair + local warehouse pair likely both needed once the two transfer types are modeled.) |
| medium | Missing exports 'Xuất Excel' and 'Xuất Excel Chi Tiết'; missing checkbox bulk-selection toolbar (refresh/edit/delete on checked). |
| medium | Reference table columns unknown (AJAX-loaded into #table-update, absent from trimmed snapshot). Local column set (Mã phiếu, Kho nguồn, Kho đích, Nhân viên, Ngày chuyển, Trạng thái, Chi nhánh) is unverified; capture POST /MovingInventory/List live before implementation, and check for a per-row confirm-receipt action. |
| low | No per-row print/detail actions verifiable from the snapshot (table is AJAX-loaded), but sibling stock-out pages all have print + detail modal — assume present until live capture proves otherwise. |

## Group summary

Compared 4 legacy stock-out pages against the React rebuild's xuat-kho CRUD pages. Common pattern gaps across all 4 (inherited from generic CrudTablePage at /home/hale/code/phongthanh-admin/src/components/crud/CrudTablePage.tsx): no checkbox bulk-selection toolbar, no per-row print (new-tab /Print/* slips) or detail modal, no Excel/Excel-chi-tiết/profit-report exports, no Từ ngày/Đến ngày date-range filter, no cascading Chi nhánh → Nhà kho selects, and create/edit is a header-only sheet instead of the legacy full-page slip editors with product line items. Page-specific highlights: Bán Hàng has a wrong column set (missing Điện thoại/Người lập/Ghi chú, extra Trạng thái) plus a missing image-upload row action; Trả Hàng locally models customer refunds while the reference is a 4-type return-slip register (Hình thức trả: từ kỹ thuật/từ khách hàng/cho NCC/từ kho — the supplier-return nav item is a dead href="#" link, handled as type 3 here); Chuyển Kho misses the dual same-branch vs cross-branch create flows and uses invented statuses instead of the Chưa/Đã/Không xác nhận confirmation flow; Cấp Linh Kiện misses the Tìm kiếm vs Tìm chi tiết dual search and the Mục đích domain concept. Unresolved: exact result-table columns for checkoutfortech-index and movinginventory-index are AJAX-loaded and absent from the trimmed snapshots — need live capture of POST /CheckOutForTech/List and /MovingInventory/List (or their JS renderers) before locking column specs.

## Addendum — verified from mirrored partials (260703)

### /tmp/ptref/ajax-CheckOutForTech-List.html (POST /CheckOutForTech/List result)

**resolves:** "Reference result-table columns are unknown (AJAX-loaded into #ma-list, not present in trimmed snapshot)" — columns now verified.

- Columns (exact, in order): `##` (row number, NOT checkbox) | Số phiếu cấp | Ngày lập | Kỹ thuật | Số tiền | Người lập | Ghi chú | Chọn
- Toolbar above table: refresh button (Tải lại trang) + **Tổng tiền info-box** (bg-yellow, fa-dollar) showing page/search aggregate (`750,000`). No edit/delete bulk buttons, no checkbox column at all on this list.
- Số phiếu cấp format `PCH-YYYYMMDD-n`; Ngày lập `3/7/2026 4:08:24 PM` (full datetime). Số tiền cells blank in summary-search results.
- Per-row actions (Chọn col): **Chi tiết** (`ma-detail` data-id, tooltip "Chi tiết") + **print** → `/Print/CapLKKyThuat?id={id}` new tab. NO per-row edit link.
- Pagination: "Trang 1 / 40" + numbered list with `…`, `»` (next), `»»` (last). Hidden `pageNumber` input.

### /tmp/ptref/ajax-SellingProduct-List.html (POST /SellingProduct/List result)

- Confirms prior spec verbatim: [✓ check-all] | Số phiếu | Ngày lập | Khách hàng | Điện thoại | Tổng tiền | Người lập | Ghi chú | Chọn. Ngày lập `25/06/2026 14:15`; Tổng tiền right-aligned.
- Per-row actions confirmed with tooltips: Thêm hình (`ms-update-image`), Chỉnh sửa → `/SellingProduct/Edit?id=`, Xuất kho (print) → `/Print/Selling?id=` new tab, Chi tiết (`ma-detail`). Row checkboxes `inputCheck`. Pagination "Trang 1 / 1".

### /tmp/ptref/ajax-ReturnProduct-List.html (POST /ReturnProduct/List result)

- Confirms prior spec: [✓ check-all] | Số phiếu | Ngày trả | Hình thức trả | Người lập | Chọn. Số phiếu `PTH-YYYYMMDD-n`; Ngày trả `7/3/2026 4:23:07 PM`.
- Per-row actions confirmed: Chỉnh sửa → `/ReturnProduct/Edit?id=`, print → `/Print/ReturnProduct_TraNCC?id=` new tab, Chi tiết modal. No totals row.

### /tmp/ptref/ajax-MovingInventory-List.html (POST /MovingInventory/List result — header captured, 0 data rows)

**resolves:** "Reference table columns unknown (AJAX-loaded into #table-update, absent from trimmed snapshot)" — header row now verified.

- Columns (exact, in order): [✓ check-all] | **Trạng thái** | Số phiếu | Ngày lập | Từ chi nhánh | Từ kho | Đến chi nhánh | Đến kho | **Loại** | Người chuyển | Chọn
- Trạng thái is FIRST data column; **Loại** column = transfer type (cùng/khác chi nhánh). Capture had 0 rows ("Trang 0 / 0") → per-row action markup (edit/print/confirm-receipt) still unverified.

### /tmp/ptref/trimmed/page-CheckOutForTech-Create.html (full-page editor)

**resolves (partially):** prior "high" gap on create workflow — full editor spec now known.

- Form: POST `/CheckOutForTech/CreatePartial` (ajax replace `#ma-update`); JS `/Scripts/CategoryCommon/CheckOutForTech_update.js`.
- Toolbar (breadcrumb row): **Lưu** (save) / **Lưu & Thêm mới** (saveNew) / **Danh sách phiếu** (back → /CheckOutForTech/Index). Box title "Thông tin phiếu cấp linh kiện".
- Fieldset **Thông tin chung**: Số phiếu = label "Phát sinh tự động"; Ngày cấp (dd/MM/yyyy, disabled, hidden `CheckOutDate`); Kỹ thuật* (autocomplete `AutoUserTech` "Nhập vào Tên / Số điện thoại" → hidden `TechnicianId`; `LoadAutocompleteUserTechinicianNotUserId()`); Ghi chú (textarea `Description`).
- Fieldset **Chi tiết**:
  - Phiếu sửa chữa* — autocomplete `AutoRepairing` placeholder "Nhập vào Số Phiếu SC/ Số Phiếu Hãng / Tên Khách Hàng / Số Serial" (`LoadAutoRepairing()`); on select shows read-only info panel: Khách hàng / Phone / Ngày nhận / Nhà sản xuất / Model / Serial.
  - Mục đích* select `PurposeId`: Vui lòng chọn / Sữa chữa dịch vụ (1) / Bảo hành (2) / Kỹ thuật mượn (3).
  - Hàng hóa* — autocomplete `AutoProductWarehouse` "Nhập vào mã hàng" (`LoadAutocompleteProductWarehouse()`), price-type radios **Giá bán** (checked) / **Giá Sỉ** / **Giá Mua**, checkbox **Theo Serial**, input-group addon "Giá: {price}".
  - Số lượng* number + addon "<= {tồn}" (available qty); button **Thêm hàng** appends line.
  - Line grid "Danh sách hàng nhập" (14 cols): # | Hình | Serial | Số phiếu | Mã hàng | Tên hàng | Nhà sản xuất | Model | Nhà kho | Ngăn chứa | Giá (editable input) | Số lượng (editable input) | Thành tiền | ## (Xóa remove). Footer row **Tổng tiền** (TotalPrice).
- Validation: TechnicianId required ("Vui lòng chọn kỹ thuật!"); DetailProduct min 1 ("Vui lòng chọn sản phẩm cấp cho kỹ thuật!").

### /tmp/ptref/trimmed/page-SellingProduct-Create.html (full-page editor)

**resolves (partially):** prior "high" create/edit-workflow gap — editor spec now known.

- Form: POST `/SellingProduct/CreatePartial`; JS `selling_update.js`.
- Toolbar: **Lưu** / **Lưu & Thêm mới** / **In Phiếu BH** → `/Print/PrintSellingProduct?id=` new tab / **In Phiếu Thu** → `/Print/PrintSellingProductReceipt?id=` new tab / **Danh sách đơn hàng** (back). Sticky header (`#myHeader`). Box title "Thông tin đơn hàng".
- Fieldset **Thông tin khách hàng**: Số phiếu auto; Ngày bán (dd/MM/yyyy, hidden `SellingDate`); Hình thức thanh toán* select `MaHinhThucThuChi`: Tiền mặt (1) / Công nợ (2) / Chuyển khoản (3); Khoản thu* readonly "Thu bán hàng" (hidden `MaLoaiThuChi=2`); Khách hàng* autocomplete `AutoCustomer` "Nhập vào Tên / Số điện thoại" **with [+] quick-create addon** (`ma-modal-insert-customer-root`, tooltip "Thêm mới nhà khách hàng"); Ghi chú textarea.
- Fieldset **Chi tiết**: Hàng hóa autocomplete `AutoProduct` "Nhập vào mã hàng/ tên hàng/ model" + **Theo Serial** checkbox + "Giá:" addon; price radios **Giá Lẻ** (checked) / **Giá Sỉ**; **Cập nhật giá** checkbox + `PriceNew` money input (write-back new sell price); Số lượng + "<= {tồn}" addon; **Thêm hàng**.
- Line grid "Danh sách hàng": # | Hình | Serial | Tên | Model | Cập nhật giá (per-row checkbox `IsUpdatePrice`) | Giá | Số lượng (editable) | Thành tiền | ## (remove). tfoot "Tổng tiền:" + hidden `TongTien`.
- Validation: CustomerId / MaHinhThucThuChi / MaLoaiThuChi required.

### /tmp/ptref/trimmed/page-ReturnProduct-Create.html (full-page editor)

**resolves (partially):** prior "high" create gap — editor spec now known. **Correction:** create-page Hình thức trả option 4 = **"Trả xác linh kiện"**, not "Trả hàng từ kho" as read from the index filter (labels differ between filter and editor; treat editor as authoritative for slip creation).

- Form: POST `/ReturnProduct/CreatePartial`; JS `returnproduct.js`.
- Toolbar: **Lưu** / **Lưu & Thêm mới** / **In** (print btn) / **Danh sách đơn hàng** (back). Box title "Thông phiếu trả hàng" (sic).
- Fieldset **Thông tin khách hàng**: Số phiếu auto; Ngày trả (dd/MM/yyyy, hidden `ReturnDate`); **Hình thức trả*** select `ReturnType`: Trả hàng từ kỹ thuật (1) / Trả hàng từ khách hàng (2) / Trả hàng cho nhà cung cấp (3) / **Trả xác linh kiện (4)** — drives dynamic form (`ms-return-type-change`).
- Type-dependent block (hidden until type chosen): **Kỳ*** (`AutoKy`, default "7/2026" → hidden `KyId`) + **Mã khách hàng*** autocomplete `txtMaPhieu` "Nhập mã phiếu" (label swaps per type). On pick → **Thông tin phiếu** panel: Mã phiếu / Số phiếu SC / Người cấp / Ngày cấp / Người nhận + source-slip pick table "Danh sách hàng": # | Hình | Mã phieu | Serial | Mã hàng | Tên hàng | Giá | Số lượng | **Đã Trả** | **Số lượng trả** (input) | Thành tiền | ## (per-row **Trả hàng** button adds line to return list).
- Ghi chú textarea.
- Fieldset **Danh sách sản phẩm trả**: alt search block (per type): Nhà khách hàng* autocomplete / Sản phẩm autocomplete / Kho select (`WarehouseLocation`) / Ngăn chứa select (`Cabinet`) / Giá / Số lượng / **Thêm**.
- Return-lines grid "Danh sách hàng nhập" (13 cols): # | Hình | Mã phiếu | Số phiếu SC | Serial | Tên hàng | Kho | Ngăn chứa | Giá | Số lượng | Số lượng trả (input) | Thành tiền | ## (Xóa). Kho/Ngăn chứa cols toggle by type (`ms-slk-lk`).

### /tmp/ptref/trimmed/page-MovingInventory-Create.html (cross-branch, "Chuyển khác chi nhánh")

**resolves (partially):** prior "high" dual-create-workflow gap — both editors now specified.

- Form: POST `/MovingInventory/CreatePartial`; JS `moving_update.js`. Toolbar: **Lưu** / **Lưu & Thêm mới** / **In** → `/Print/PrintMovingProduct?id=` new tab / **Danh sách chuyển kho** (back).
- Fieldset **Thông tin chuyển phiếu**: Số phiếu auto; Ngày chuyển (dd/MM/yyyy, hidden `MovingDate`); **Từ chi nhánh*** select (own branch only); **Từ nhà kho*** cascading select (empty until branch); **Đến chi nhánh*** select (OTHER branches only: Đăk nông (3), Cộng tác viên tuyến huyện (4)); **Đến nhà kho*** cascading; Ghi chú.
- Fieldset **Chi tiết**: Hàng hóa autocomplete `AutoProduct` "Nhập vào mã hàng" + "Giá:" addon; Số lượng + "<= {tồn}" addon; **Theo Serial** checkbox; **Thêm hàng**.
- Line grid "Danh sách hàng chuyển": # | Hình | Serial | Mã | Tên | Số lượng (stock) | **Số lượng chuyển** (input) | Giá | Thành tiền | ## (remove). No Tổng tiền footer.

### /tmp/ptref/trimmed/page-MovingInventory-CreateBranch.html (same-branch, "Chuyển cùng chi nhánh")

- Form: POST `/MovingInventory/CreatePartialBranch`; same toolbar (Lưu / Lưu & Thêm mới / In / back).
- Header fields as Create, except: Từ chi nhánh AND Đến chi nhánh both locked to own branch (single option); Từ nhà kho / Đến nhà kho pre-populated with all 6 own-branch warehouses (Kho A Linh kiện sửa chửa (3), Kho B Linh kiện bảo hành (5), Kho D nhà anh Phong quản lý (6), Khu vực lễ tân (12), Kho phòng trọ (13), KHO LINH KIỆN SỬA CHỮA CỦA ANH CƯỜNG (15)).
- Extra field in Chi tiết: **Đến ngăn chứa*** select (`CabinetId`, cascading from Đến nhà kho) — cabinet-level target, only in same-branch flow.
- Line grid differs from cross-branch: # | Hình | Serial | Mã | Tên | **Ngăn chứa** | Số lượng (input) | Giá | Thành tiền | ## (no Số lượng vs Số lượng chuyển split; adds Ngăn chứa col).
- Note: `/MovingInventory/CreateOtherBranch` (page-MovingInventory-CreateOtherBranch.html) is an ASP.NET 404 — action does not exist; only Create + CreateBranch are real.

### New gaps vs local React pages (from verified reality)

Local checked: `/home/hale/code/phongthanh-admin/src/pages/xuat-kho/{CapLinhKienPage,BanHangPage,TraHangPage,ChuyenKhoPage}.tsx` + configs `/home/hale/code/phongthanh-admin/src/config/finance-tables/{cap-linh-kien,ban-hang,tra-hang,chuyen-kho}.config.ts`.

| Severity | Gap |
|---|---|
| high | Cấp Linh Kiện list — verified ref columns [Số phiếu cấp, Ngày lập (datetime), Kỹ thuật, Số tiền, Người lập, Ghi chú] vs local [Mã phiếu, Phiếu SC, Kỹ thuật viên, Ngày cấp (date), Tổng tiền, Chi nhánh]: missing Người lập + Ghi chú; ref list has NO Phiếu SC/Chi nhánh columns (Phiếu SC lives at line-item level). |
| high | Chuyển Kho list — verified ref columns [Trạng thái, Số phiếu, Ngày lập, Từ chi nhánh, Từ kho, Đến chi nhánh, Đến kho, Loại, Người chuyển] vs local [Mã phiếu, Kho nguồn, Kho đích, Nhân viên, Ngày chuyển, Trạng thái, Chi nhánh]: missing Từ/Đến chi nhánh pair and **Loại** (transfer type cùng/khác chi nhánh); Trạng thái should lead. |
| high | Chuyển Kho same-branch editor targets a **Ngăn chứa** (cabinet) inside destination warehouse (Đến ngăn chứa* + per-line Ngăn chứa column); local ChuyenKho model has no cabinet concept. |
| medium | Cấp Linh Kiện list — missing aggregate **Tổng tiền info-box** above results (search-scoped total); per-row actions should be Chi tiết modal + print /Print/CapLKKyThuat (new tab) ONLY — ref has no per-row edit and no checkbox column, local generic edit/delete row actions diverge. |
| medium | Line-item entry pattern shared by all 4 editors absent locally: product autocomplete + price-type radios (Giá bán/Sỉ/Mua or Giá Lẻ/Sỉ) + "Theo Serial" serial-picking mode + qty capped by stock ("<= n" addon) + Thêm hàng append grid. |
| medium | Bán Hàng editor — missing: Khách hàng [+] quick-create modal addon, per-line "Cập nhật giá" price write-back (PriceNew + IsUpdatePrice), Khoản thu locked "Thu bán hàng", Hình thức thanh toán (Tiền mặt/Công nợ/Chuyển khoản), in-editor In Phiếu BH / In Phiếu Thu print buttons. |
| medium | Trả Hàng editor — type-driven two-stage flow absent locally: Hình thức trả select reshapes form → pick source slip via Kỳ + mã phiếu autocomplete → slip-info panel + pick-table with Đã Trả / Số lượng trả per line ("Trả hàng" button) → return grid. Also option 4 label = "Trả xác linh kiện" (editor) vs "Trả hàng từ kho" (index filter) — reconcile before implementation. |
| medium | All 4 editors: dual save **Lưu** / **Lưu & Thêm mới**, Số phiếu "Phát sinh tự động" (never user-entered) — local CrudSheet requires manual `ma` entry. |
| low | Cấp Linh Kiện Mục đích options confirmed on create page (Sữa chữa dịch vụ/Bảo hành/Kỹ thuật mượn) — reaffirms existing low gap; purpose is chosen per slip line context, still absent from local model. |
| low | Chuyển Kho per-row actions still unverified (mirrored /MovingInventory/List returned 0 rows); assume edit/print/detail + confirm-receipt pending a non-empty capture. |
