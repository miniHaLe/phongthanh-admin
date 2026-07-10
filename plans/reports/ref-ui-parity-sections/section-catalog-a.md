# Ref UI Parity — Section catalog-a

### Model (/Model/Index)
- Ref file: /tmp/ptref/trimmed/model-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/ModelPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/model.config.ts)

**Ref spec**

**Layout**: master-detail; left col-md-8 `#ma-list` is EMPTY in mirror — list is AJAX-loaded by /Scripts/CategoryCommon/model.js (presumably POST /Model/List, same list widget as sibling pages: numberRow select, refresh, bulk-delete, keySearch, PagedList paging). Right col-md-4 box **"Thông tin model"** = always-visible create/edit form.

**Form** (POST /Model/Create, unobtrusive AJAX, replaces `#ma-update`, success cb `CreateModelPost`; hidden `ModelId`):
- `Sản phẩm` * — autocomplete input `AutoProductStatus12` (placeholder "Tên sản phẩm") → hidden `ProductStatusId`; input-group addon **[+]** button (`ma-modal-insert-productstatus`) opens quick-create-product modal
- `Nhà sản xuất` * — autocomplete `AutoManufactory12` → hidden `ManufactoryId`; addon **[+]** (`ma-modal-insert-manufactory`) quick-create-manufacturer modal
- `Model Code` — text, tooltip "Tự động phát sinh" (auto-generated when blank)
- `Tên model` * — text
- `Ghi chú` — textarea (2 rows)

**Buttons**: `Thêm Mới` (reset form, id=addNew), `Lưu` (submit value=save), `Lưu & Thêm mới` (submit value=saveNew).

**Table columns**: not present in mirror (AJAX region); by controller convention expect [checkbox] / Sản phẩm / Nhà sản xuất / Model Code / Tên model / (Ghi chú) / Chọn(edit) — needs confirmation.

**Shared page furniture**: generic modals #MyModal/#MyModal1, #MyModal2 "Bản đồ chi nhánh" (Google Maps branch map, layout-level, not page-specific).

**Gaps**

| Severity | Gap |
|---|---|
| medium | No 'Ghi chú' (note) column/field in local model config; reference form has a textarea Ghi chú. |
| medium | Sản phẩm and Nhà sản xuất are plain selects locally; reference uses type-ahead autocomplete with inline [+] quick-create modals for both (create a Sản phẩm or Nhà sản xuất without leaving the Model form). |
| medium | No bulk delete of checked rows (reference list widget has check-all + ms-delete); local CrudTablePage only has per-row delete. |
| low | Model Code is auto-generated server-side when left blank in reference ('Tự động phát sinh'); local maModel is a required manual text field. |
| low | No 'Lưu & Thêm mới' (save-and-new) action; reference has Thêm Mới / Lưu / Lưu & Thêm mới trio. |
| low | Layout: reference is side-by-side master-detail (form always visible, row edit loads into right panel); local uses a slide-over Sheet. Local also adds a Trạng thái column/switch that does not exist in reference. |

### Nhà kho (/WarehouseLocation/Index)
- Ref file: /tmp/ptref/trimmed/warehouselocation-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/NhaKhoPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/nha-kho.config.ts)

**Ref spec**

**Layout**: master-detail (list col-md-8 + form col-md-4 "Thông tin nhà kho").

**List** (form POST /WarehouseLocation/List, AJAX replace `#ma-list`): box title "Danh sách nhà kho"; rows-per-page select `numberRow` (20/30/50/100/150/200/300); toolbar: refresh (ms-refresh), **bulk delete** (ms-delete, red X, deletes checked rows), search input `keySearch` placeholder "Tên nhà kho" + button `Tìm kiếm`; paging label "Trang 1 / 1" + PagedList number links (top and bottom).

**Table columns (exact order)**: [check-all checkbox] | `Tên nhà kho` | `Địa chỉ` | `Chi nhánh` | `Kho xác` (rendered as a checked/unchecked checkbox) | `Chọn` (per-row edit button `ma-edit` — loads record into right-hand form).

**Form** (POST /WarehouseLocation/Create, AJAX, success `CreateWarehouseLocationPost`; hidden `WarehouseLocationId`):
- `Tên nhà kho` * — text
- `Địa chỉ` — textarea
- `Chi nhánh` — autocomplete `AutoBranch` (placeholder "Tên chi nhánh") → hidden `BranchId`
- `Kho xác` — checkbox (flags a warehouse as carcass/dead-unit warehouse; used by Xác inventory screens)

**Buttons**: Thêm Mới / Lưu / Lưu & Thêm mới. No sortable headers; no code column in reference.

**Gaps**

| Severity | Gap |
|---|---|
| high | Missing 'Kho xác' boolean column and form checkbox. This flag drives the carcass-warehouse workflows (viewinventory-indexxac etc.) and is a domain-critical attribute of NhaKho. |
| medium | No bulk delete of checked rows (reference has check-all + ms-delete). |
| low | 'Địa chỉ' column is hidden by default locally; visible in reference. |
| low | No 'Lưu & Thêm mới'; no always-visible side form (Sheet instead). |
| low | Local adds Mã kho + Trạng thái columns not present in reference; reference rows-per-page options are 20–300 vs local 10–100. |

### Ngăn chứa (/Cabinet/Index)
- Ref file: /tmp/ptref/trimmed/cabinet-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/NganChuaPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/ngan-chua.config.ts)

**Ref spec**

**Layout**: master-detail (list col-md-8 + form col-md-4 "Thông tin ngăn chứa").

**List** (POST /Cabinet/List AJAX): numberRow select (20…300); toolbar: refresh, **bulk delete**, filter row = autocomplete `AutoWarehouseLocation` placeholder "Nhà kho" (→ hidden `WarehouseLocationId`) + text `keySearch` placeholder "Tên ngăn chứa" + `Tìm kiếm` button; paging "Trang 1 / 21" with PagedList incl. » (next) and »» (last) links, top and bottom.

**Table columns (exact order)**: [check-all checkbox] | `Nhà kho` | `Tên ngăn chứa` | `Chọn` (row edit `ma-edit` loads into right form).

**Form** (POST /Cabinet/Create AJAX, success `CreateCabinetPost`; hidden `CabinetId`):
- `Nhà kho` * — native select populated with all warehouses ("-- Vui lòng chọn --")
- `Tên ngăn chứa` * — text

**Buttons**: Thêm Mới / Lưu / Lưu & Thêm mới.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No bulk delete of checked rows. |
| low | Column order differs: reference lists Nhà kho before Tên ngăn chứa; local shows Mã ngăn / Tên ngăn / Nhà kho. Local adds Mã ngăn + Trạng thái columns not in reference. |
| low | No 'Lưu & Thêm mới' action; Sheet instead of always-visible side form. |
| low | Reference has last-page ('»»') jump in pagination and rows-per-page up to 300; local pagination options max 100. |

### Nhóm hàng hóa (/ProductType/Index)
- Ref file: /tmp/ptref/trimmed/producttype-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/NhomHangHoaPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/nhom-hang-hoa.config.ts)

**Ref spec**

**Layout**: master-detail (list col-md-8 + form col-md-4 "Thông tin nhóm hàng hóa").

**List** (POST /ProductType/List AJAX): numberRow select (20…300); toolbar: refresh, **bulk delete**, `keySearch` text (placeholder mislabeled "Tên nhà sản xuất" — legacy copy-paste; searches group name) + `Tìm kiếm`; paging "Trang 1 / 1" PagedList top+bottom.

**Table columns (exact order)**: [check-all checkbox] | `Mã nhóm hàng hóa` | `Tên nhóm hàng hóa` | `Chọn` (row edit `ma-edit`).

**Form** (POST /ProductType/Create AJAX, success `CreateProductTypePost`; hidden `ProductTypeId`):
- `Mã nhóm hàng hóa` — text (optional)
- `Tên nhóm hàng hóa` * — text

**Buttons**: Thêm Mới / Lưu / Lưu & Thêm mới.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No bulk delete of checked rows. |
| low | No 'Lưu & Thêm mới'; Sheet instead of side form. |
| low | Header labels shortened locally ('Mã nhóm'/'Tên nhóm' vs 'Mã nhóm hàng hóa'/'Tên nhóm hàng hóa'); local adds Trạng thái column not in reference; local makes Mã nhóm required while reference code is optional. |

### Hàng hóa (/Product/Index)
- Ref file: /tmp/ptref/trimmed/product-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/HangHoaPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/hang-hoa.config.ts)

**Ref spec**

**Layout**: full-width single box (NOT master-detail). Header breadcrumb contains toolbar button **`Thêm hàng hóa`** → dedicated page /Product/Create (create is a full page, not a modal/panel; edit likewise /Product/Edit?id=X).

**Search fieldset "Thông tin tìm kiếm"** (form POST /Product/List AJAX replace `#ma-list`):
- Nhóm hàng hóa — select2 `ProductTypeId` (options loaded by JS, default "--- Vui lòng chọn ---")
- Nhà sản xuất — autocomplete `AutoManufactory` → hidden `ManufactoryId`
- Mã hàng hóa — text `ProductCode`
- Tên hàng hóa — text `keySearch`
- Model — autocomplete `AutoModelWithNSX` → hidden `ModelId`

**Action buttons**: `Tìm kiếm` | `Import Excel` (ms-product-upexcel — bulk import modal) | `Xuất ra Excel` (ms-report-btn — export current filter).

**List toolbar**: refresh (ms-refresh), **bulk delete** (ms-delete for checked rows). Paging "Trang 1 / 636" PagedList with » and »», top+bottom. No rows-per-page selector on this page.

**Table columns (exact order)**: [check-all checkbox] | `Hình` (40x40 thumbnail, img-thumb, elevatezoom hover-zoom) | `Mã hàng` | `Mã hàng phụ` | `Tên hàng` | `Tiếng Anh` | `Nhóm hàng hóa` | `Nhà sản xuất` | `Tên model` | `Model dùng chung` | `Đơn vị` | `Người tạo` | `Ngày tạo` (dd/MM/yyyy hh:mm AM/PM) | `Serial` (or '-') | `Chọn`.

**Row actions**: edit (link /Product/Edit?id=X) + **In Barcode** (link /Print/PrintTemHangHoa8?id=X, target=_blank — prints product barcode label).

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set substantially wrong locally. Missing reference columns: Hình (image thumbnail), Mã hàng phụ, Tiếng Anh (English name), Nhà sản xuất, Tên model, Model dùng chung (shared models), Đơn vị is present as ĐVT, Người tạo, Ngày tạo, Serial. Local instead shows Giá nhập/Giá bán/Tồn kho/Trạng thái which do not exist on the reference list. |
| high | Missing 'In Barcode' per-row action (/Print/PrintTemHangHoa8?id=X, new tab) — a primary shop workflow for labeling parts. |
| high | Reference create/edit are dedicated full pages (/Product/Create, /Product/Edit?id=X) with a much richer product form (image, sub-code, English name, model links, serial); local uses the generic Sheet with only 7 fields. Data model lacks manufacturer/model/serial/image entirely. |
| medium | Missing 'Import Excel' bulk-import and 'Xuất ra Excel' export buttons. |
| medium | Missing filters: Nhà sản xuất (autocomplete), Model (autocomplete), and a distinct Mã hàng hóa field. Local only filters Tên hàng hóa + Nhóm hàng hóa. |
| medium | No bulk delete of checked rows. |
| low | No image hover-zoom (elevatezoom) behavior; page-count scale (636 pages) implies server-side search over ~12k+ products, mock data should still exercise paging. |

### Nhà sản xuất (/Manufactory/Index)
- Ref file: /tmp/ptref/trimmed/manufactory-index.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/NhaSanXuatPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/nha-san-xuat.config.ts)

**Ref spec**

**Layout**: master-detail; left `#ma-list` EMPTY in mirror — list AJAX-loaded by /Scripts/CategoryCommon/manufactory.js (expect standard widget: numberRow, refresh, bulk delete, keySearch "Tên nhà sản xuất", PagedList paging; columns by convention [checkbox] / Mã nhà sản xuất / Tên nhà sản xuất / (Ghi chú) / Chọn — unconfirmed). Right col-md-4 box **"Thông tin nhà sản xuất"**.

**Form** (POST /Manufactory/Create, AJAX, success `CreateManufactoryPost`; hidden `ManufactoryId`):
- `Mã nhà sản xuất` — text (optional)
- `Tên nhà sản xuất` * — text
- `Ghi chú` — textarea (2 rows)

**Buttons**: Thêm Mới / Lưu / Lưu & Thêm mới. Shared layout modals only (no page-specific modal).

**Gaps**

| Severity | Gap |
|---|---|
| medium | Missing 'Ghi chú' (note) field/column; reference form has a textarea Ghi chú. |
| medium | No bulk delete of checked rows (standard reference list widget). |
| low | Local invents 'Nước SX' (country) column/field that does not exist in the reference schema. |
| low | No 'Lưu & Thêm mới'; Sheet instead of always-visible side form; local adds Trạng thái column not in reference; local makes Mã NSX required while reference code is optional. |

### Sản phẩm (/ProductStatus/IndexNew)
- Ref file: /tmp/ptref/trimmed/productstatus-indexnew.html
- Local counterpart: /home/hale/code/phongthanh-admin/src/pages/danh-muc/SanPhamPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/san-pham.config.ts)

**Ref spec**

**Layout**: master-detail (list col-md-8 + form col-md-4 "Thông tin sản phẩm").

**List** (POST /ProductStatus/ListNew AJAX, success `ListPost`): numberRow select (20…300); toolbar: refresh, **bulk delete**, search row = text `keySearch` placeholder "Tên sản phẩm" + autocomplete `AutoNhomSanPham1` placeholder "Tên Nhóm Sản Phẩm" (→ hidden `NhomSanPhamId`, loaded via `LoadAutoNhomSanPhamSearch()`) + `Tìm kiếm` button; paging "Trang 1 / 8" PagedList top+bottom.

**Table columns (exact order)**: [check-all checkbox] | `Tên sản phẩm` | `Mã sản phẩm` | `Nhóm sản phẩm` | `Tiền khoán` (formatted money, e.g. 10,000; often blank) | `Chọn` (row edit `ma-editnhom` loads into right form).

**Form** (POST /ProductStatus/CreateNew AJAX, success `CreateProductStatusPostNhom`; hidden `ProductStatusId`):
- `Nhóm Sản Phẩm` * — autocomplete `AutoNhomSanPham` → hidden `NhomSanPhamId`; input-group addon **[+]** (`ma-modal-insert-quan`) opens quick-create nhóm-sản-phẩm modal; loaded via `LoadAutoNhomSanPham()`
- `Mã sản phẩm` — text (optional)
- `Tên sản phẩm` * — text
- `Tiền Khoán` — money-masked text `TienKhoanLabel` (class ms-money-input) mirrored to hidden numeric `TienKhoan` (default 0)

**Buttons**: Thêm Mới / Lưu / Lưu & Thêm mới. NOTE: reference form has NO Nhà sản xuất field.

**Gaps**

| Severity | Gap |
|---|---|
| high | Missing 'Tiền khoán' (piecework amount) — both the table column and the money-input form field. This value feeds the technician khoán/KPI workflows. |
| medium | Local requires 'Nhà sản xuất' on Sản phẩm (required select + hidden column); the reference product form/table has no manufacturer at all — schema divergence that will break parity when wiring real data. |
| medium | Nhóm sản phẩm is a plain select locally; reference is autocomplete with inline [+] quick-create modal for a new product group. |
| medium | No bulk delete of checked rows. |
| low | Column order differs (reference: Tên sản phẩm before Mã sản phẩm); local adds Trạng thái column not in reference; Mã sản phẩm optional in reference but required locally. |
| low | No 'Lưu & Thêm mới'; Sheet instead of always-visible side form. |

## Group Summary

Compared 7 legacy catalog pages (Model, Nhà kho, Ngăn chứa, Nhóm hàng hóa, Hàng hóa, Nhà sản xuất, Sản phẩm) against the React CrudTablePage configs in /home/hale/code/phongthanh-admin/src/config/crud-configs/. All 7 local counterparts exist. Recurring cross-page gaps: (1) no bulk delete of checked rows, (2) no 'Lưu & Thêm mới' save-and-new action, (3) Sheet-based editing instead of the legacy always-visible master-detail side form, (4) legacy autocomplete-with-[+]-quick-create inputs replaced by plain selects, (5) local configs invent columns/fields not in the reference (Trạng thái everywhere, Nước SX on NSX, prices/stock on Hàng hóa) while omitting reference fields. Biggest single divergence is Hàng hóa (/Product/Index): local column set is wrong (missing image, sub-code, English name, manufacturer, model, shared model, creator, created date, serial), and it lacks In Barcode printing, dedicated create/edit pages, Import/Export Excel, and manufacturer/model/code filters. Other high-severity items: Nhà kho missing the 'Kho xác' carcass-warehouse flag; Sản phẩm missing 'Tiền khoán'. Caveat: model-index and manufactory-index mirrors have empty AJAX list regions, so their exact legacy table columns are inferred from controller conventions, not observed.

## Addendum — verified from mirrored partials (260703)

### /tmp/ptref/ajax-model-get.html — Model list partial (POST /Model/List)
Resolves: "Table columns: not present in mirror (AJAX region)… needs confirmation" (Model section) and Group Summary caveat "model-index… empty AJAX list regions… inferred from controller conventions".

**Verified columns (exact order)**: `##` (STT) | [check-all checkbox, tooltip "Chọn tất cả"] | `Tên model` | `Model Code` | `Nhà sản xuất` | `Sản phẩm` | `Người tạo` | `Ngày tạo` (dd/MM/yyyy hh:mm AM/PM) | `Ghi chú` | `Chọn` (per-row edit btn `ma-edit`, fa-edit, data-id).
- Box title "Danh sách model"; numberRow select 20/30/50/100/150/200/300 (tooltip "Chọn số dòng cần xem").
- **Search row** (differs from convention guess): autocomplete `AutoProductStatus` placeholder "Tên sản phẩm" → hidden `ProductStatusId`; autocomplete `AutoManufactory` placeholder "Tên nhà sản xuất" → hidden `ManufactoryId`; text `keySearch` placeholder "Tên Model". Buttons: `Tìm kiếm` (submit value=search) | `Xuất ra Excel` (ms-report-btn, fa-file-excel-o) | `Import Excel` (ms-model-upexcel, fa-print icon).
- Toolbar: refresh (`ms-refresh` data-root=Model, "Tải lại trang") + bulk delete (`ms-delete`, red X, "Xóa").
- Paging: "Trang 1 / 641" + PagedList 1–10 … » »» , top+bottom (≈12.8k models). No totals row. Autocompletes wired via `LoadAutocompleteProductStatusBy`/`LoadAutocompleteManufactoryBy`.
- Note: `ajax-model-post.html` is an anti-forgery error page (mirror POST without token) — no extra info.

### /tmp/ptref/ajax-Manufactory-List.html — Nhà sản xuất list partial (POST /Manufactory/List)
Resolves: "columns by convention [checkbox] / Mã nhà sản xuất / Tên nhà sản xuất / (Ghi chú) / Chọn — unconfirmed" (Nhà sản xuất section) and Group Summary caveat for manufactory-index.

**Verified columns (exact order)**: [check-all checkbox] | `Mã nhà sản xuất` | `Tên nhà sản xuất` | `Ghi chú` | `Chọn` (row edit `ma-edit`, tooltip "Chỉnh sửa"). No STT column. Convention guess was correct.
- Box title "Danh sách nhà sản xuất"; numberRow 20–300 ("Chọn số dòng hiển thị"); toolbar refresh + bulk delete; search `keySearch` placeholder "Tên nhà sản xuất" + `Tìm kiếm` (fa-search). Paging "Trang 1 / 9" PagedList top+bottom. No export/import buttons on this page. Mã nhà sản xuất frequently blank in data (confirms optional code).

### /tmp/ptref/ajax-Product-List.html — Hàng hóa list partial (POST /Product/List)
Confirms the 15-column set already documented in the Hàng hóa section (no unverified note existed): [check-all] | `Hình` (40x40 /Content/img/no_image.png fallback, img-thumb) | `Mã hàng` | `Mã hàng phụ` | `Tên hàng` | `Tiếng Anh` | `Nhóm hàng hóa` | `Nhà sản xuất` | `Tên model` | `Model dùng chung` | `Đơn vị` | `Người tạo` | `Ngày tạo` | `Serial` (shows `-` when none) | `Chọn`.
- Row actions verified: edit `<a href="/Product/Edit?id=X">` (tooltip "Chỉnh sửa") + `In Barcode` `<a target="_blank" href="/Print/PrintTemHangHoa8?id=X">` (fa-print). Toolbar refresh + bulk delete; paging "Trang 1 / 636" » »» top+bottom; table wrapped in `.scroll-box` with `table-bordered table-hover-fix` (resizable cols via colResizable). No totals row, no numberRow select (as previously noted).

### /tmp/ptref/trimmed/page-Product-Create.html — Hàng hóa full-page editor (/Product/Create)
Resolves: prior gap row's vague "much richer product form" — exact form now verified.

**Form**: POST `/Product/CreatePartial` (unobtrusive AJAX, multipart, success `CreateProductPost`, replace `#ma-update`; hidden `ProductId`, `typeName`). Breadcrumb toolbar: `Lưu` (value=save) | `Lưu & Thêm mới` (value=saveNew) | `Tạo mới` (link /Product/Create) | `Danh sách hàng hóa` (link /Product/Index).

**Fieldset "Thông tin hàng hóa - linh kiện"** (left col-md-6):
- `Nhóm hàng hóa` * — select2 `ProductTypeId`; options: Điện lạnh / Điện tử / Điện Thoại / Điện gia dụng / linh kiện điện tử / Dụng cụ sửa chửa / Nguyên vật liêu sửa chửa / Nhà vệ sinh
- `Có Serial` — checkbox `IsSerial`
- `Nhà sản xuất` — autocomplete `AutoManufactory` → hidden `ManufactoryId`; **[+] addon** `ma-modal-insert-manufactory-root` "Thêm mới nhà sản xuất"
- `Model` * — autocomplete `AutoModel` → hidden `ModelId`; **[+] addon** `ma-modal-insert-model-1` "Thêm mới model"; checkbox `Dùng chung nhiều model` (`Multi`) toggles Model-dùng-chung fieldset
- `Model dùng chung` — text `ModelList` placeholder "Ví dụ: RAS-F10CJV, RAS-F13CJV, RAS-F18CJV"
- `Đơn vị tính` * — select `DonViTinhId`: Cái (default) / Thanh / Bộ / Lít / Mét / Kg / g
- `Phát sinh tự động` — checkbox `PhatSinh` (auto-generate mã hàng)
- `Mã hàng hóa` * — text `ProductCode`; `Mã hàng hóa phụ` — text `ProductCodeOld`
- `Tên hàng hóa` * — text `ProductName`; `Tên Tiếng Anh` — text `EngName`
- `Vị trí linh kiện` — textarea `Position` (2 rows)
- `Giá mua` / `Giá bán sỉ` / `Giá bán lẻ` — money-masked inputs `CostBuyInput`/`GiaSiInput`/`GiaLeInput` → hidden numeric `CostBuy`/`GiaSi`/`GiaLe` (**three price tiers**)

**Fieldset "Model dùng chung"** (right, hidden until `Multi` checked): autocomplete `AutoManufactory1` + `AutoModel1` + button `Thêm model` (ms-add-model); line-item grid columns `STT` | `Nhà sản xuất` | `Model` | `##` (remove btn ms-remove-model); hidden serialization fields `ModelStr`/`ModelList`/`ModelListStr`.

**Fieldset "Chọn hình"**: `Hình ảnh` — file input `fileName` accept gif|jpg|png + 100px preview `#file-image`. Page JS: /Scripts/CategoryCommon/product_update.js. No tồn-kho/stock field anywhere on the editor.

### New gaps vs local pages (beyond existing rows)

| Severity | Gap |
|---|---|
| high | Hàng hóa pricing model wrong locally: reference editor has 3 tiers `Giá mua`/`Giá bán sỉ`/`Giá bán lẻ` (money-masked); local hang-hoa.config has only giaNhap + single giaBan. |
| medium | Hàng hóa editor missing `Có Serial` (IsSerial) and `Phát sinh tự động` (PhatSinh auto-code) checkboxes; local maHH always manual+required. |
| medium | Hàng hóa editor missing multi-model link UI: `Dùng chung nhiều model` toggle + Model-dùng-chung grid (STT/Nhà sản xuất/Model/## remove) with `Thêm model`, plus free-text `Model dùng chung` list field. |
| medium | Hàng hóa editor missing `Vị trí linh kiện` (part location) textarea and `Hình ảnh` file upload w/ preview. |
| medium | Model list missing verified columns locally: `##` (STT), `Model Code` (local shows maModel but ref also shows Tên model first), `Sản phẩm` visible (hidden locally), `Người tạo`, `Ngày tạo`, `Ghi chú`. model.config has no creator/created/note columns. |
| medium | Model list missing `Sản phẩm` autocomplete filter (AutoProductStatus→ProductStatusId); local filters only Tên model + Nhà sản xuất. |
| medium | Model list missing `Xuất ra Excel` + `Import Excel` toolbar buttons (verified present on Model, previously only noted for Product). |
| low | Hàng hóa local `tonKho` editable form field is an invention — reference product editor has no stock field (stock derived from inventory screens). |
| low | Ref Model/Manufactory column order puts name before code (`Tên model`|`Model Code`; ref NSX has no STT); local orders code first. Manufactory columns otherwise confirmed — no new NSX gaps. |
