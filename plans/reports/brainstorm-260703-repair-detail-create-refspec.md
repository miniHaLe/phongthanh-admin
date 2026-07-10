# Ref Spec: Repairing Detail + Create (legacy ASP.NET) vs React rebuild

Sources: `/tmp/ptref/trimmed/repairing-detail.html` (id=226544), `/tmp/ptref/trimmed/repairing-create.html`.
Local: `src/features/repair-detail/`, `src/features/repair-create/`.
Note: `/Scripts/CategoryCommon/repairing.js` not mirrored — autocomplete/image/print endpoints inside it are unresolved (marked ⚠).

---

## Page 1 — /Repairing/Detail?id={id} ("Chi tiết phiếu sửa chữa")

Whole page is a form: `POST /Repairing/Update` (unobtrusive-ajax, `multipart/form-data`, replaces `#ma-update`, success cb `CreatePost`). Hidden: `RepairingId`, `LevePopup`. So detail page is technically editable (at minimum the `IsQuick` checkbox) and re-submittable.

### Header / toolbar buttons (breadcrumb row)
| Label | Kind | Action |
|---|---|---|
| `Tạo mới` | btn-warning link | → `Create` |
| ` In Tem Sửa Chữa` | btn-default link, `target=_blank` | `GET /Print/RepairingTemDan?id=226544` |
| ` In Biên Nhận` | btn-success span `.ms-print-pepairing-receipt-d` `data-id` | handler in repairing.js ⚠ (receipt print popup) |
| `Danh sách phiếu` | btn-default link `.btn-back-to-list` | → `Index` |

### Box "Thông tin phiếu sửa chữa" — fieldsets in order

1. **`Thông tin sản phẩm`** (left col-md-6, all read-only text):
   `Sản phẩm:`, `Nhà sản xuất:`, `Model:`, `Số Serial:`, `Mô tả hư hỏng:` (red text), `Nội dung sửa chữa:` (red text), `Phụ kiện kèm theo:`, `Ngày mua:`, `Nơi mua:`, `Ghi chú:`

2. **`Thông tin phiếu`** (right col-md-6):
   - `Số phiếu:` — label colored by current status + tooltip = status name (e.g. `PSC-202607-223`, color `#00CCFF`, tooltip "Đã Điều Phối")
   - `Số phiếu hãng:` (text)
   - `Hình thức BH:` — bold text (e.g. "Bảo hành")
   - `Loại bảo hành:` — text (e.g. "Nhà Khách") + **editable checkbox** `Sửa gấp` (`IsQuick`)
   - `Khu vực:` — text (e.g. "KHU VỰC ĐĂK MIL")

3. **`Thông tin khách hàng`** (read-only list):
   `Họ tên:`, `Mail:`, `Điện thoại:`, `Địa chỉ:`, then bold agent block: `Đại lý/Siêu Thị/Cửa Hàng/Trạm:`, `Điện thoại:`, `Địa chỉ:`

4. **`Thông tin nhận`**: `Ngày nhận:` (dd/MM/yyyy hh:mm tt), `Người nhận:`, `Ngày hẹn giao:`, `Kỹ thuật viên:`

5. **`Hình`** — image gallery `ul[data-id={RepairingId}]` populated by repairing.js AJAX ⚠; 100×100 thumbs, hover shows `.ma-remove-image` delete; elevatezoom lib loaded for zooming.

6. **`Nhật ký tình trạng máy`** — status-history table, columns:
   `STT | Tình trạng | Ngày tạo | Người tạo | Giá | Nội dung SC | Ghi chú` (status cell color-coded).

7. **`Nhật ký điều phối kỹ thuật viên`** — technician dispatch log table:
   `STT | Kỹ thuật | Ngày tạo | Người tạo | Tiền công | Tình trạng | Ngày hủy | Người hủy` (e.g. green "Đang điều phối").

8. **`Nhật ký chuyển chi nhánh`** (partial `RepairingTransferDetail`) — branch transfer log; empty state `Không có dữ liệu`.

9. **`Danh sách cấp linh kiện`** (partial `RepairingCheckOut`, hidden `ClientId`) — parts issued to tech; empty state. Row actions (inline script):
   - `.ma-modal-tralk-d` → modal title **"Trả linh kiện"**, body loads `GET /CheckOutForTech/TraLKPopup?ids=&amount=&amounttra=`
   - `.ma-modal-thuxac-d` → modal title **"Thu xác linh kiện"**, body loads `GET /CheckOutForTech/ThuXacLKPopup?ids=&branchId=&amount=`

10. **`Danh sách trả linh kiện`** (partial `RepairingCheckOutReturn`) — parts returned; empty state.

11. **`Lịch sử máy`** (partial `RepairingHistoryBySerial`) — prior repairs of same serial; empty state.

### Modals (shared layout)
- `#MyModal`, `#MyModal1` — generic empty shells filled via `.load()`.
- `#MyModal2` — **"Bản đồ chi nhánh"**: Google Maps (Places lib) + `#pac-input` "Search Box".

### Endpoints (detail)
`POST /Repairing/Update`; `GET /Print/RepairingTemDan?id=`; `GET /CheckOutForTech/TraLKPopup`; `GET /CheckOutForTech/ThuXacLKPopup`; image list/delete + receipt print via repairing.js ⚠. SignalR `/signalr/hubs` (call-center).

---

## Page 2 — /Repairing/Create ("/Thêm/ Cập nhật phiếu sửa chữa")

Form: `POST /Repairing/CreatePartial` (unobtrusive-ajax, multipart, begin `ajaxBegin`, success `CreateRepairingPost`, replaces `#ma-update`) + `__RequestVerificationToken`. Hidden: `typeName`, `clientId=8`, `RepairingId=0`, `LevePopup`.

### Toolbar (`#myHeader`, becomes sticky on scroll)
| Label | Kind |
|---|---|
| ` Lưu ` | submit btn-success `data-value="save"` |
| ` Lưu & Thêm mới ` | submit btn-info `data-value="saveNew"` |
| ` Lưu & Đóng ` | submit btn-info `data-value="saveClosed"` |
| `Thêm phiếu` | btn-warning link → `Create` |
| `Danh sách phiếu` | btn-default link → `Index` |

### Fieldset `Thông tin sản phẩm` (left)
| Label | Input | Notes |
|---|---|---|
| `Sản phẩm` | text autocomplete `#AutoProductStatus` (placeholder "Tên sản phẩm", tooltip "Nhập sản phẩm và chọn nếu cần tìm") + hidden `ProductStatusId` | `+` addon `.ma-modal-insert-productstatus-root` tooltip **"Thêm mới sản phẩm"** (quick-create modal). NOT required |
| `Nhà sản xuất` | text autocomplete `#AutoManufactory` ("Tên nhà sản xuất") + hidden `ManufactoryId` | `+` addon "Thêm mới nhà sản xuất". NOT required |
| `Model` `*` | text autocomplete `#AutoModel` ("Tên model", tooltip "Vui lòng nhập model và chọn") + hidden `ModelId` | `+` addon "Thêm mới model". Required (`min:1`, msg "Vui lòng chọn Model!") |
| `Số Serial` | text `#Serial` `.ms-serial-change` | **Required by JS** ("Vui lòng nhập số serial!") though no visual `*`. On change ⚠ loads serial repair history into `.RepairingHistoryBySerial` |
| `Mô tả hư hỏng` `*` | textarea `DescriptionError` rows=2 | required ("Vui lòng nhập mô tả hư hỏng!") |
| `Phụ kiện kèm theo` | textarea `Accessories` rows=2 | |
| `Ngày mua` | datepicker `.ms-text-date` (dd/MM/yyyy) + hidden `DateBuy` | |
| `Nơi mua` | text `PlaceBuy` | |
| `Ghi chú` | textarea `Note` rows=2 | |

### Fieldset `Thông tin phiếu` (right)
| Label | Input | Notes |
|---|---|---|
| `Chi nhánh` | select `BranchId` | Options: `1` "TTBH Điện tử -điện lạnh PHONG THÀNH Đăk lăk" (selected), `3` "TTBH Điện tử điện lạnh PHONG THÀNH Đăk nông", `4` "Cộng tác viên tuyến huyện" |
| `Số phiếu` | read-only label `<<Phát sinh tự động>>` | auto-generated |
| `Số phiếu hãng` | text `RepairingNumber` | |
| `Số phiếu đại lý` | text `RepairingNumberDL` | |
| `Hình thức BH` `*` | radios `WarrantyType`: `1` **Bảo hành**, `2` **BH sửa chửa**, `3` **Sửa dịch vụ** | required ("Vui lòng chọn hình thức bảo hành!") |
| `Loại bảo hành` | radios `WarrantyAt`: `0` **Tại TTBH**, `1` **Tại Nhà** (default checked) + checkbox `Sửa gấp` (`IsQuick`) | |
| `Khu vực` `*` | text autocomplete `#AutoLocation` ("Tên khu vực") + hidden `LocationId` | `+` addon `.ma-modal-locationt` **"Thêm mới khu vực"**. required attr on input |

### Fieldset `Thông tin khách hàng`
- `Khách hàng` — autocomplete `#AutoCustomer`, placeholder **"Nhập vào Tên / Số điện thoại 1-2"**, tooltip "Vui lòng Nhập tên khách hàng / Số điện thoại 1-2 và chọn" + hidden `CustomerId` (required, min:1, "Vui lòng nhập khách hàng!") + `+` addon `.ma-modal-insert-customer-root` **"Thêm mới khách hàng"** (quick-create modal).
- Info panel `.ms-info-customer` (shown after pick): `Họ tên:`, `Mail:`, `Điện thoại:`, `Điện thoại 2:`, `Địa chỉ:`, `Tên Đại lý/Siêu Thị/Cửa Hàng/Trạm:`, `Email:`, `Điện thoại:`, `Địa chỉ:`, `Khu vực:`, `Khoảng cách:` (distance — ties to Google Maps modal).
- Button `Chọn khách khác` (`.ms-btn-auto-customer`, hidden until pick).

### Fieldset `Thông tin nhận`
| Label | Input |
|---|---|
| `Ngày hẹn giao` | datepicker + hidden `PromiseDate` |
| `Kỹ thuật viên` | **no visible input** — hidden `TechnicianId=0`; technician is assigned later via dispatch, not at create |
| `Ngày nhận` | datepicker default today + hidden `ReceiveDate` (with time) |
| `Người nhận` | read-only span = logged-in user ("Van khoa") |

### Fieldset `Hình`
- Button `Tải tất cả hình` (`downloadallimage()`)
- `<input type=file name="ListImage" multiple accept="image/*">` `.ms-image-upload` — client-side preview in `ul[data-id=0]`, 200×200 thumbs, hover delete (`.ma-remove-image` / `.ma-remove-video` — video also supported).

### Bottom
- `div.RepairingHistoryBySerial` — filled by AJAX after serial entry ⚠.

### jQuery-validate rules (inline)
`RepairingNumberExti: required` (element absent → no-op), `CustomerId: required+min1`, `Serial: required`, `DescriptionError: required`, `WarrantyType: required`, `ModelId: required+min1`. Note: `ProductStatusId`, `ManufactoryId`, `BranchId` are NOT required; there is no cascade between product/manufacturer/model — all three are independent autocompletes.

### Modals
Same `#MyModal`/`#MyModal1`/`#MyModal2` ("Bản đồ chi nhánh" Google Maps + Places).

---

## Gaps — React `repair-detail` vs legacy Detail

| # | Sev | Gap |
|---|---|---|
| D1 | HIGH | No print actions on detail page: `In Tem Sửa Chữa` (`/Print/RepairingTemDan?id=`) and `In Biên Nhận` missing (print menu exists only on list page). |
| D2 | HIGH | Missing **Nhật ký điều phối kỹ thuật viên** (dispatch log: Kỹ thuật, Tiền công, Tình trạng, Ngày hủy, Người hủy). Local has no dispatch concept. |
| D3 | HIGH | Missing parts lifecycle sections: **Danh sách cấp linh kiện** and **Danh sách trả linh kiện** + modals "Trả linh kiện"/"Thu xác linh kiện". Local substitutes a single "Linh kiện sử dụng" table — different data model. |
| D4 | HIGH | Missing **Lịch sử máy** (repair history by serial). |
| D5 | HIGH | Missing **Hình** image gallery (view/zoom/delete). |
| D6 | HIGH | Missing **Nhật ký chuyển chi nhánh** (branch transfer log). |
| D7 | HIGH | Status log column mismatch: legacy "Nhật ký tình trạng máy" carries `Giá`, `Nội dung SC`, `Ghi chú` per entry; local timeline shows only status/date/user/note. |
| D8 | MED | Missing product-info fields: `Nội dung sửa chữa`, `Phụ kiện kèm theo`, `Ngày mua`, `Nơi mua`; missing phiếu fields: `Khu vực`, `Sửa gấp` flag, `Nhà sản xuất`/`Model` shown as separate rows (local collapses into `tenSanPham`). |
| D9 | MED | Customer agent block incomplete: legacy shows `Đại lý/Siêu Thị/Cửa Hàng/Trạm` + its `Điện thoại` + `Địa chỉ`; local shows only `daiLy` name; no `Mail`. |
| D10 | MED | `Hình thức BH` taxonomy mismatch: legacy = Bảo hành / BH sửa chửa / Sửa dịch vụ (WarrantyType 1-3); local = bao_hanh/sua_chua/sua_chua_tai_nha/tu_van. `Loại bảo hành` legacy = Tại TTBH / Tại Nhà (WarrantyAt); local uses invented list ("Bảo hành chính hãng" …). |
| D11 | MED | Legacy detail is an update form (`POST /Repairing/Update`, editable `Sửa gấp`); local is fully read-only with dead "Chỉnh sửa" button. |
| D12 | LOW | Số phiếu colored by status w/ tooltip; local shows plain badge separately (acceptable modernization). |
| D13 | LOW | Local "Chi phí" card (dự kiến/nhân công/tổng) has no legacy counterpart on detail — invented; costs live in status/dispatch logs (`Giá`, `Tiền công`). |

## Gaps — React `repair-create` vs legacy Create

| # | Sev | Gap |
|---|---|---|
| C1 | HIGH | Missing fields: `Số phiếu hãng` (RepairingNumber), `Số phiếu đại lý` (RepairingNumberDL), `Phụ kiện kèm theo`, `Ngày mua`, `Nơi mua`, `Khu vực` (**required** LocationId), `Sửa gấp` checkbox, `Loại bảo hành` (Tại TTBH/Tại Nhà). |
| C2 | HIGH | Required-field mismatch: legacy requires `Serial`, `CustomerId` (existing customer), `Model`, `Mô tả hư hỏng`, `WarrantyType`, `Khu vực`; NSX/Sản phẩm optional. Local requires NSX+SP+KTV, does not require Serial, allows free-text new customer. |
| C3 | HIGH | Image/video upload section (`Hình`: multi-file `ListImage`, preview grid, remove, `Tải tất cả hình`) entirely missing. |
| C4 | HIGH | Quick-create `+` modals missing: Thêm mới sản phẩm / nhà sản xuất / model / khu vực / khách hàng. |
| C5 | HIGH | `Kỹ thuật viên` behavior wrong: legacy has NO technician select at create (hidden TechnicianId=0; assigned later via dispatch); local makes it a required select. |
| C6 | HIGH | Save actions: legacy 3 submit modes `Lưu` / `Lưu & Thêm mới` / `Lưu & Đóng`; local has single `Lưu phiếu`. |
| C7 | MED | Product/NSX/Model are independent free-text autocompletes in legacy (no cascade); local enforces NSX→SP→Model cascade with disabled children — blocks legacy workflow of typing model directly. |
| C8 | MED | Customer info panel after pick missing fields: `Điện thoại 2`, `Tên Đại lý/Siêu Thị/Cửa Hàng/Trạm` + agent Email/Điện thoại/Địa chỉ, `Khu vực`, `Khoảng cách`; no `Chọn khách khác` equivalent in existing-mode (local has "Đổi"— partial). Local "new customer" inline mode has no legacy counterpart (legacy always creates via modal → CustomerId). |
| C9 | MED | `Hình thức BH` options mismatch (see D10) — 3 legacy radios vs 4 invented options. |
| C10 | MED | Serial-change → `Lịch sử máy` (RepairingHistoryBySerial) lookup missing. |
| C11 | MED | Local invents sections absent in legacy create: `Chi phí dự kiến`, `Loại lỗi sửa chữa` checkbox grid, `Ghi chú nội bộ` (legacy has one `Ghi chú` under product). Confirm before keeping. |
| C12 | LOW | `Số phiếu` "<<Phát sinh tự động>>" placeholder and `Người nhận` (current user) read-only display missing. |
| C13 | LOW | Label drift: legacy `Ngày hẹn giao` vs local `Ngày hẹn trả`; legacy `Mô tả hư hỏng` vs local `Mô tả lỗi`. Branch option labels differ from legacy names. |

## Endpoints summary
- `POST /Repairing/CreatePartial` (create), `POST /Repairing/Update` (detail update)
- `GET /Print/RepairingTemDan?id=` (tem); receipt print `.ms-print-pepairing-receipt-d` ⚠ repairing.js
- `GET /CheckOutForTech/TraLKPopup?ids&amount&amounttra`, `GET /CheckOutForTech/ThuXacLKPopup?ids&branchId&amount`
- Autocompletes (customer/product/manufactory/model/location), image upload/list/delete, serial history — all inside `/Scripts/CategoryCommon/repairing.js` ⚠ not mirrored

## Unresolved questions
1. `repairing.js` not in mirror — exact autocomplete/image/receipt-print/serial-history endpoints unknown; mirror that file to complete the spec. → RESOLVED, see "Confirmed JS endpoints" section below.
2. Are local invented sections (Chi phí dự kiến, Loại lỗi sửa chữa, new-customer inline mode, technician-at-create) intentional product decisions or drift? Need user confirmation before removal.
3. Legacy `RepairingNumberExti` validate rule references a field not rendered — possibly role-gated field for other client configs. → RESOLVED: hidden mirror field driven by `CheckRepairingNumber` (see below).

---

## Confirmed JS endpoints & interactions (from repairing.js / repairing_8.js / custom.js)

Sources now mirrored: `/tmp/ptref/js-repairing.js` (Create/Index), `/tmp/ptref/js-repairing_8.js` (Index_8), `/tmp/ptref/js-custom.js` (global). Resolves report ⚠ items unless noted.

### ⚠ resolutions
| ⚠ item | Resolution |
|---|---|
| Receipt print `.ms-print-pepairing-receipt-d` (D1) | ✔ `window.open("/Print/ReceiptRepairing?id=" + data-id)`. List variant `.ms-print-pepairing-receipt` requires checked row `data-statu >= 9` ("Vui lòng chọn phiếu để đã sửa xong để in"). |
| Image gallery load/delete (D5) | ✔ Thumbs rendered server-side; click thumb → `#MyModal` loads `GET /Plugin/CarouselImgReparing?id={ul data-id}` (title "Danh sách hình" + "In hình" btn `printImg()`); needs ≥1 `.box-img-old` else alert "Vui lòng chọn ảnh hoặc lưu lại!". Delete: `.ma-remove-image` → bootbox confirm "Bạn có muốn xóa không?" → `GET /Repairing/DeleteImage?id=` (sync, `response===1` removes `<li>`). Video: `.ma-remove-video` → `GET /Repairing/DeleteVideo?id=`. |
| Serial → Lịch sử máy (C10) | ✔ `focusout .ms-serial-change` → `LoadFormList('.RepairingHistoryBySerial', "/Repairing/RepairingHistoryBySerial?Serial={val}&ModelId={#ModelId}")`. Depends on current ModelId (only "cascade"-like dependency in the form). |
| Customer autocomplete | ✔ `#AutoCustomerS` tableAutocomplete → `GET /Get/MyJson/List/GetCustomerByName` `{key: term}` (variant `GetCustomerByName_8` in `LoadAutocompleteCustomerSearch_8`). minLength 0, searches on focus. Columns: `Họ tên | Điện thoại 1 | Điện thoại 2 | Địa chỉ` (fields Name/Phone/Phone2/AddressFull; item also carries Email, NameP/PhoneP/AddressP/EmailP = agent block). Select → sets `#CustomerId` = item.Id. Focusout empty → `#CustomerId=0`, hide `.ms-info-customer`. Info-panel fill code is commented out in js — panel population happens elsewhere (likely server partial). |
| Other autocompletes (model/NSX/sản phẩm/khu vực/tỉnh/quận/đại lý/KTV/kỳ) | ✖ still unresolved: `LoadAutocompleteManufactory/ProductStatus/Model/ModelAll/Location/Tinh/Quan/DaiLy/DaiLy2/UserTechinician*/AutoKy/CustomerTram/CustomerType` are *invoked* here but *defined* in the unmirrored `/bundles/app` (same for `inItUploadAjaxForm`, `LoadFormList`, `LoadFormListToModal`, `ShowBox/HideBox`, `callClickSearch`, `comTime`). Endpoint names likely follow `/Get/MyJson/List/Get{X}ByName` pattern but unconfirmed. |

### Client-gated init (repairing.js, `#clientId` hidden input)
- `clientId != 1` → `LoadAutocompleteManufactory + ProductStatus + Model`; `== 1` → `LoadAutocompleteModelAll` (model search across all NSX).
- `clientId != 7` → `LoadAutocompleteUserTechinicianNotUserId + KeToan`; `== 7` → `...ByBranch`.
- `clientId != 37` → `LoadAutocompleteCustomer`; `== 37` → `LoadAutocompleteCustomer_8`.
- Always: `LoadAutocompleteCustomerSearch`, `LoadAutoKy`, `LoadAutocompleteDaiLy2` (Index_8 uses `LoadAutocompleteDaiLy`), `Location`, `Tinh`, `Quan`. Confirms C7: NO NSX→SP→Model cascade exists; all independent.

### Validation (identical in both files)
- jQuery-validate on `#frmRepairingUpdate`: `RepairingNumber` required ("Vui lòng nhập số phiếu!"), `RepairingNumberExti` required ("Số phiếu đã tồn tại!"), `CustomerId` required+min:1 ("Vui lòng nhập khách hàng!"), `Serial` required, `DescriptionError` required, `WarrantyType` required, `ModelId` required+min:1. Errors placed into `span[data-valmsg-for]`.
- **`RepairingNumberExti` mechanism**: `focusout #RepairingNumber` → sync `POST /Repairing/CheckRepairingNumber {Number, Id: #RepairingId}`; response `1` = duplicate → alert "Số phiếu '{n}' đã tồn tại" + clears hidden `#RepairingNumberExti` (so its `required` rule fails at submit = uniqueness gate); else fills it with the number. So the "field not rendered" is a hidden dup-check mirror.
- `CheckSerial` exists (`POST /Repairing/CheckSerial {serial}`, "Serial '{s}' đã tồn tại") but the `#Serial` blur call is commented out — serial dup-check disabled.
- Legacy `validate()` fn (manual bootbox version: "Chọn model. / Chọn hình thức. / Nhập số serial. / Nhập hư hỏng. / Chọn khách hàng.") exists but unbound (submit hook commented).
- Dispatch modal save guard: `.ms-box-save button` click requires `.TechinicanIdMultiple` non-empty → "Vui lòng chọn kỹ thuật!".

### Save flows (create form)
- Form posts via unobtrusive-ajax (multipart, incl. `ListImage`/video files — upload rides the main POST; `inItUploadAjaxForm()` preps it). Success cb `CreateRepairingPost` (repairing.js): `type==="saveNew"` → `window.location = "Create"`; `"saveClosed"` → `/Repairing/index`; else reload `#ma-update` from `/Repairing/CreatePartial`. Index_8 variant `CreateRepairingPost_8`: saveNew → `LoadFormList('#ma-update', "/Repairing/CreatePartial_8?moi=1&id={new id}")`; saveClosed → `/Repairing/index_8`; else `/Repairing/CreatePartial_8`. `.ms-receiving-save` click stores its `data-value` into `#typeName` (which button decided the mode) and (repairing.js) serializes phí rows into hidden `#PhiGiao` as JSON `[{RepairingFeeId, PhiGiaoId, SoTien}]`.
- Inline quick-save `#savethu`: serializes `#frmRepairingUpdate` → `POST /Repairing/UpdateAjax` (JSON body); `1` = "Lưu thành công".
- Post-save print btn `.ms-print-prepairingcreate` → `window.open('/Repairing/PrintRepairing?id=' + #RepairingId)`.

### Image/video upload flow (confirmed)
1. `change .ms-image-upload` (`input[name=ListImage] multiple`) → removes old `.box-img-new` previews → `readURL()`: FileReader dataURL per file, clones `.box-img-hide` template `<li>` into `.ms-box-image ul` (client-side preview only, no AJAX upload).
2. Actual persistence = multipart main-form POST.
3. View saved: click thumb → `/Plugin/CarouselImgReparing?id=` modal; `printImg()` opens active carousel img in new window and prints; `downloadallimage()` anchors-downloads every `.ms-box-image img`.
4. Delete: `GET /Repairing/DeleteImage?id=` / `GET /Repairing/DeleteVideo?id=` (see ⚠ table).

### Modal flows — loader URL (all `.load()` into `#MyModal`/`#MyModal1` body; saves are unobtrusive-ajax forms inside the partial, success cbs noted)
| Trigger class | Modal title | Loads (GET) | Notes |
|---|---|---|---|
| `.ma-modal-update-status[-d]` | "Đổi tình trạng" | `/Repairing/UpdateStatus?id={ids}` | list: comma ids from `.ms-check-box-repairing`; empty → "Vui lòng chọn phiếu để đổi tình trạng". cb `UpdateStatusPost` → refresh + hide modal |
| `.ma-modal-update-status-d-1` | "Đổi tình trạng" | `/Repairing/UpdateStatus?bg=1&id=` | báo giá variant |
| `.ma-modal-update-status-d-28` | "Đổi tình trạng" | `/Repairing/UpdateStatus_28?id=` | client-28 variant |
| `.ma-modal-update-techinican[-d]` | "Đổi kỹ thuật" | `/Repairing/UpdateTechinican?id={ids}` | then `LoadAutocompleteUserTechinicianPopup("#AutoTechinican","#TechinicanId")`; cb `UpdateTechinicanPost` |
| `.ms-print-repairingTaiNha` (multi-tech) | "Điều phối in" | `/Repairing/UpdateTechinicanIn?id={ids}` | if all checked rows share one `data-tech` → skip modal, direct `window.open /Print/PrintRepairingTaiNha?id=`; cb `UpdateTechinicanInPost` → also opens that print |
| `.ma-modal-transfer` | "Chuyển chi nhánh" | `/Repairing/RepairingTransfer?id={ids}` | |
| `.ma-modal-changeky` | "Chuyển kỳ" | `/Repairing/RepairingChangeKy?arrId={ids}` | repairing.js only |
| `.ma-modal-insertschedule` | "Thêm lịch nhắc nhở" | `/Repairing/InsertSchedule?id=` | |
| `.ma-modal-votechoice` | "Thêm đánh giá" | `/Repairing/RepairingVoteChoice?id=` | repairing.js only |
| `.ma-modal-maintain` | "Thêm bảo trì" | `/Repairing/RepairingMaintain?id=` | cb `UpdateMaintainPost` |
| `.ma-modal-yeucaulk` | "Yêu cầu linh kiện" | `/RequestProduct/YeuCauLKPopup?id=` | repairing.js only |
| `.ma-caplinhkien` | "Cấp linh kiện kỹ thuật" | `/CheckOutForTech/CreatePartialPopup?idR=` | |
| `.ma-caplinhkienbynhanvien` | "Thêm linh kiện từ kho kỹ thuật" | `/CheckOutForTech/CreatePartialPopupTechByNhanVien?idR=` | repairing.js only |
| `.ma-datlinhkien` | "Đặt linh kiện" | `/RequestProduct/RepairingRequestPopup?idR=` | repairing.js only |
| `.ma-modal-update-loi-d[-54]` | "Cập nhật Cách giải quyết" | `/Repairing/UpdateLoiSuaChua?id=` (`_54` variant) | repairing.js only |
| `.ma-modal-insert-productstatus[-root]` | "Thêm sản phẩm" | `/ProductStatus/CreatePartial` | `-root` → `#MyModal` `LevePopup=1`; non-root → `#MyModal1` `LevePopup=2` (nested) |
| `.ma-modal-insert-manufactory[-root]` | "Thêm nhà sản xuất" | `/Manufactory/CreatePartial` | same LevePopup pattern |
| `.ma-modal-insert-model[-root]` | "Thêm model" | `/Model/CreatePartial` | |
| `.ma-modal-insert-customer-root` | "Thêm khách hàng" | `/Customer/CreatePartial` | then `LoadAutocompleteCustomerTram()` |
| `.ma-modal-insert-daily-root` | "Thêm đại lý" | `/Customer/CreatePartial?type=2` | then `LoadAutocompleteCustomerTram()` |
| `.ma-modal-locationt` | "Thêm khu vực" | `/Location/CreatePartial` | |
| `.ma-modal-receive` | "Thêm phiếu nhanh" | `/Repairing/ReceiveFast` | |
| `.ms-pepairing-upexcel` | "Import phiếu từ file excel" | `/Repairing/ImportReperingToExcel` | |
| `.ma-modal-repairingCheckOut` | "Thêm mới khách hàng" (sic) | `/Repairing/CheckOut?id=7` | hardcoded id=7 — dead/demo code |

### Direct AJAX actions (list toolbar, checkbox-driven; all refresh via `setTimeout(callClickSearch, comTime)`)
| Trigger | Endpoint | Payload | Notes |
|---|---|---|---|
| `.ma-send-smstech` | `POST /Repairing/SendSms` | `{arrId, type:1}` | SMS to tech |
| `.ma-send-smscus` | same | `{arrId, type:2}` | SMS to customer |
| `.ma-send-smscustinh` / `.ma-send-smscussm` | same | `{arrId, type:3}` | |
| `.ma-send-smscustralai` / `.ma-send-smscusbg` | same | `{arrId, type:4}` | |
| `.ma-repairingsendzalobn` | same | `{arrId, type:5}` | Zalo biên nhận, confirm "…gửi tin nhắn biên nhận qua Zalo…" (repairing.js) |
| `.ma-send-smscusbaoduong` | same | `{arrId, type:6}` | bảo dưỡng (repairing.js) |
| `.ma-repairingsendsms` | same | `{arrId, type:9}` | "SMS sửa xong" (repairing_8.js) |
| `.ma-send-deletemulti` / `.ma-repairingdelete` | `POST /Repairing/Delete` | `{arrId}` | confirm "Bạn có chắc chắn xóa các phiếu sửa chữa?" |
| `.ma-thanhtoan` | `POST /Repairing/ThanhToanHang` | `{arrId}` | repairing.js only |
| `.ma-xoathanhtoan` | `POST /Repairing/XoaThanhToanHang` | `{arrId}` | repairing.js only |
| `.ma-modal-update-transfer` / `.ma-xacnhanchinhanh` | `POST /Repairing/XacNhanChiNhanh` | `{id: arrIds}` | confirm "Bạn có chắc chắn xác nhận máy?/chi nhánh?" |
| `.ma-dispactdelete` | `POST /Repairing/DeleteDispatch` | `{id}` | confirm "Bạn có chắc chắn hủy điều phối?" — confirms D2 dispatch lifecycle |
| `.ma-baogiadelete` | `POST /Repairing/DeleteBaoGia` | `{id}` | xóa/hủy báo giá |

### Phí giao (delivery fees)
- `.ms-add-phi` + select `.ms-phi` → `GET /Get/MyJson/List/GetPhiGiao {id}` → returns `{PhiGiaoId, Ten, SoTien, LoaiPhi}` → appends row to `.ms-table-phi` (LoaiPhi 1="Cộng", 2="Trừ") → `TinhTien()` recomputes (sums `.ms-sotien-s`, sign by LoaiPhi; rest of pricing math commented out).
- `.ms-save-phi` → `POST /Repairing/RepairingPhiGiao {id: #RepairingId, PhiGiao: JSON, type: data-type}` → on success reload `.ms-table-phi-view` from `GET /Repairing/RepairingPhiGiaoView?id=`.
- `.ms-remove-phi` removes row; keyup `.TienCong`/`.ms-sotien-s` re-run `TinhTien()`.

### Search / export (form action swap before submit)
- `.ms-search-btn` → form action `POST /Repairing/List`, ajax replace `#table-update`, cb `ListSeacrhPost` (re-runs `fixedTable('.fixed-table')`).
- `.ms-report-btn` → plain `GET /Repairing/ExcelRepairingList`; `.ms-report-btnproduct` → `GET /Repairing/ExcelRepairingListProduct` (repairing.js only); `.ms-pdftem-btn` → `GET /Repairing/PDFRepairingList` (bulk tem PDF from current filter).

### Print flows (all `window.open`)
| Trigger | URL | Guard |
|---|---|---|
| `.ms-print-pepairing` (list) | `/Print/Repairing?id=` | first checked; also has 2nd handler opening `/Repairing/Repairing?id=` per checked row (legacy dupe binding — both fire) |
| `.ms-print-pepairing-d` | `/Print/Repairing?id={data-id}` | "Phiếu không tồn tại" if no id |
| `.ms-print-repairingTaiNha` | `/Print/PrintRepairingTaiNha?id={ids}` | multi-id; if >1 distinct tech → "Điều phối in" modal first (see above) |
| `.ms-print-pepairing-receipt[-d]` | `/Print/ReceiptRepairing?id=` | list variant requires `data-statu >= 9` |
| `.ms-print-pepairing-receipt-d-A5` | `/Print/DienTuMinh_BienNhanA5?id=` | A5 receipt (repairing.js) |
| `.ms-print-temdanmay` | `/Print/PrintTemDanMay?id=` | index_8 |
| `.ms-print-temxac` | `/Print/PrintTemDanXac?id=` | index_8 (handler exists; item not rendered for this client) |
| `.ms-print-pepairing-diduong` | `/Print/Repairing_DiDuong?id={ids}` | index_8, multi-id "In Giấy Đi Đường" |
| `.ma-modal-maps` | `https://maps.google.com/?q={data-map}` | "Xem bản đồ" — no modal, direct maps tab |
| `.ms-print-prepairingcreate` | `/Repairing/PrintRepairing?id=` | create page after save |

### Tem (label) dropdown logic (Index_8)
Toolbar btn-group: red button "In tem" (`.dropdown-tem`) → dropdown-menu with item "Dán máy" (`.ms-print-temdanmay`). Handler loops all `.ms-check-box-repairing`, keeps **last** checked id (loop overwrites, single-id print) → `window.open("/Print/PrintTemDanMay?id=" + id)` else "Vui lòng chọn phiếu để in". Sibling "Dán xác" handler (`.ms-print-temxac` → `/Print/PrintTemDanXac?id=`) wired identically but its menu item is not rendered in this client's HTML. Note: `/Print/RepairingTemDan?id=` (detail header "In Tem Sửa Chữa") is a third, separate tem endpoint — direct link, not in JS.

### Index_8 popup workflow (repairing_8.js only)
- `popup(url)`: `window.open(url,'_blank')` + 1s interval polling `win.closed` → on close auto-clicks `.ms-search-btn` (list refresh). Used by: `.ma-insert-repairing` → `popup("/Repairing/Create_8")`; row links `.btn-table-list`/`.btn-autoupdate` → popup their `href`. `.btn-back-to-list` → `window.close()`.

### custom.js (global)
- Notification bell: `.check-seen[-list]` → `GET /Get/MyJson/List/UpdateViewRepairingStatusHistoryById {type:9, id}`; `.ms-view-all` → `.../UpdateViewRepairingStatusHistoryAll {type:9, all:'true'}`; `.check-seen-news` → `.../UpdateViewNewsById {id}`. Poller `loadNoti()` → `GET /Get/MyJson/List/GetRepairingStatusHistory {type:9}` every 3s (initial call commented out = disabled); renders items linking to `/Repairing/Detail?idt={ID}&uid=1&id={RepairingId}` with color/viết-tắt status badge, "Đánh dấu là đã xem" tooltip.
- `CheckUserName()` → `GET /Get/MyJson/List/GetNameLogin?key={username}`; non-"admin" → hides `span.ms-delete` + `span.ma-edit` (client-side-only permission trim).
- Sidebar auto-collapse outside Admin, hover-expand; `.fixed-table` fixedHeaderTable(height 500); elevateZoom on `.img-thumb-repairing`; greeting/time-of-day background per `#clientId`/`#mode_bd`.
- Call-center (inline in pages, SignalR): toastr incoming-call → `window.open('/repairing/repairingcustomer?id={id}&num={num}')`; deny → `POST /api/CallCenter/CallRing {event:"ending", value:{fromnumber, extension}}`.

### Remaining unknowns
- Definitions of `LoadAutocomplete{Manufactory,ProductStatus,Model,ModelAll,ModelNote,ManufactoryNote,Location,Tinh,Quan,DaiLy,DaiLy2,UserTechinician*,CustomerTram,CustomerType}`, `LoadAutoKy`, `LoadFormList(ToModal)`, `inItUploadAjaxForm`, `ShowBox/HideBox`, `callClickSearch`, `comTime` live in unmirrored `/bundles/app` — endpoint URLs for model/NSX/location/tỉnh/quận/KTV autocompletes still unconfirmed (expect `/Get/MyJson/List/*` pattern per customer/phí precedent).
- Modal partials' own save POST URLs (UpdateStatus, UpdateTechinican, RepairingTransfer forms) are inside the loaded partial HTML, not these JS files; only their success callbacks (`UpdateStatusPost`, `UpdateTechinicanPost`, `UpdateTechinicanInPost`, `UpdateMaintainPost`) are confirmed here.
