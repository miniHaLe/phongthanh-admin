# UI Parity — Group: catalog-b

Legacy admin reference vs React rebuild. 7 pages.

---

### Khu vực (Trang chủ / Khu vực — box: "Danh sách khu vực")

- Ref file: `location-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/KhuVucPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/khu-vuc.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. Left col-md-8 = list (`POST /Location/List`, AJAX replace `#ma-list`); right col-md-4 = persistent create/edit panel "Thông tin khu vực" (`POST /Location/Create`, AJAX replace `#ma-update`).

**Filter bar** (inline in list toolbar): `keySearch` text "Tên khu vực"; autocomplete text "Tên Tỉnh" (+hidden `TinhId`); autocomplete text "Tên Quận" (+hidden `QuanId`); submit button "Tìm kiếm" (fa-search).

**Toolbar**: refresh btn (tooltip "Tải lại trang", data-root=Location); red bulk-delete btn (tooltip "Xóa", ms-delete, acts on checked `inputCheck` rows); rows-per-page select `numberRow`: 20/30/50/100/150/200/300.

**Table columns (exact order)**: `##` | [checkbox-toggle "Chọn tất cả"] | `Tên Tỉnh` | `Tên Quận` | `Tên Xã/Phường` | `Tên khu vực` | `Cây số` | `Tiền công` | `Tiền công 2` | `Chọn` (edit btn `ma-edit` data-id → loads record into right panel).

**Right-panel form fields**: Tỉnh* (autocomplete + "+" quick-add modal `ma-modal-insert-tinh`), Quận* (autocomplete + "+" quick-add `ma-modal-insert-quan`), Phường/Xã (autocomplete + "+" quick-add `ma-modal-insert-xa`), Tên khu vực* (text), Cây số (money-masked), Tiền công 1 (money-masked), Tiền công 2 (money-masked). Buttons: "Thêm Mới" (reset form), "Lưu" (save), "Lưu & Thêm mới" (save+reset).

**Pagination**: "Trang 1 / 2" label + numbered PagedList with » next, duplicated top+bottom.

**Modals**: generic `MyModal`/`MyModal1` (host quick-insert Tỉnh/Quận/Xã forms), `MyModal2` "Bản đồ chi nhánh" (Google Maps + Places search box, layout-level shared).

**Scripts**: /Scripts/CategoryCommon/location.js, location-u.js; SignalR call-center; colResizable (resizable table cols).

**Gaps**

| Severity | Gap |
|---|---|
| high | Wrong column set: local shows Mã khu vực / Tên khu vực / Tỉnh thành / Trạng thái. Reference columns Tên Quận, Tên Xã/Phường, Cây số, Tiền công, Tiền công 2 are all MISSING locally; local extras Mã khu vực + Trạng thái don't exist in reference. Data model (KhuVuc in src/types/masterdata-types.ts) lacks quanId/xaId/caySo/tienCong/tienCong2. |
| high | Missing Tỉnh→Quận→Xã administrative hierarchy: reference builds khu vực (route) on Tỉnh/Quận/Xã autocomplete entities with inline "+" quick-add modals for each level. Local has only a free-text/select tinhThanh with 2 hardcoded options and no Quận/Xã entities anywhere. |
| medium | Missing Quận filter in filter bar (local filters: Tên khu vực text + Tỉnh select only; reference also filters by Tên Quận autocomplete). |
| medium | No multi-select checkbox column + select-all toggle + bulk delete toolbar button (CrudTablePage only offers per-row delete). |
| medium | No quick-add ("+") modals for Tỉnh/Quận/Xã from within the create/edit form. |
| low | Edit UX differs: reference uses persistent right-side panel with "Thêm Mới / Lưu / Lưu & Thêm mới" (save-and-new missing locally); local uses Sheet dialog. Page-size options differ (local 10/20/50/100 vs ref 20–300). Money-masked inputs not replicated. |

---

### Phường/Xã (box: "Danh sách phường xã")

- Ref file: `xa-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/PhuongXaPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/phuong-xa.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /Xa/List` AJAX → `#ma-list`; panel "Thông tin phường xã" `POST /Xa/Create` AJAX → `#ma-update`.

**Filter bar**: autocomplete "Tên Tỉnh" (+hidden `TinhId`, prefilled ĐẮK LẮK); autocomplete "Tên Quận" (+hidden `QuanId`); text `TenXa` "Tên phường xã"; autocomplete "Tên tuyến" (`LocationName` + hidden `LocationId1` — links to Khu vực/route entity); button "Tìm kiếm".

**Toolbar**: refresh (data-root=Xa); bulk-delete (ms-delete) on checked rows; `numberRow` select 20/30/50/100/150/200/300.

**Table columns (exact)**: `##` | [checkbox-toggle] | `Tên Tỉnh` | `Tên Quận` | `Tên Xã/Phường` | `Cây số` | `Tiền công` | `Tuyến` | `Chọn` (edit `ma-edit` → loads into panel).

**Panel form fields**: Tỉnh* (autocomplete + "+" quick-add), Quận* (autocomplete + "+" quick-add), Tên phường xã* (text), Khoảng cách (money-masked → hidden `KhoangCach`), Tiền công (money-masked → hidden `TienCong`), Tuyến (autocomplete `AutoLocation` → hidden `LocationId`). Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 119", PagedList 1–10 + … + » next + »» skip-to-last, duplicated top+bottom.

**Scripts**: /Scripts/CategoryCommon/xa.js, Xa-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Wrong column set / data model: reference columns Tên Tỉnh, Tên Quận, Cây số, Tiền công, Tuyến are MISSING. Local instead shows Mã P/X, Loại (Phường/Xã/Thị trấn — a field the reference doesn't have), Khu vực, Trạng thái. PhuongXa type lacks tinhId/quanId/khoangCach/tienCong/tuyến(locationId) fields; the ward→Tuyến (route) link that feeds delivery-fee logic is absent. |
| high | Missing Tỉnh/Quận parent entities + autocomplete + "+" quick-add modals; local khuVucId select is not equivalent to the reference Tỉnh→Quận hierarchy (reference 'Tuyến' = khu vực link is a separate optional field). |
| medium | Missing filters: Tên Tỉnh, Tên Quận, Tên tuyến autocompletes (local only has Tên phường/xã text, Loại select, Khu vực select). |
| medium | No checkbox multi-select + bulk delete. |
| low | No "Lưu & Thêm mới"; Sheet dialog vs persistent panel; page-size options differ; no STT `##` numbering difference (local has STT so OK) — main cosmetic gap is money-masked inputs and large PagedList (skip-to-last »») behavior. |

---

### Thời Gian Bảo Hành (box: "Danh sách thời gian bảo hành")

- Ref file: `timewarranty-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/ThoiHanPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/thoi-han.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /TimeWarranty/List` AJAX → `#ma-list`; panel "Thông tin bảo hành" `POST /TimeWarranty/Create` AJAX → `#ma-update`.

**Filter bar**: single text `keySearch` placeholder "Tên thời gian" + "Tìm kiếm" button.

**Toolbar**: refresh; bulk-delete (data-root=TimeWarranty); `numberRow` 20/30/50/100/150/200/300.

**Table columns (exact)**: [checkbox-toggle] | `Tên` | `Loại` (values: Tháng/Năm) | `Thời Gian Bảo Hành` (numeric value, e.g. 6) | `Chọn` (edit `ma-edit`).

**Panel form fields**: Tên* (text); Loại Thời Gian* radio group — "Tháng" (value 1) / "Năm" (value 2); Thời Gian* (number). Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 1" PagedList, duplicated top+bottom.

**Scripts**: /Scripts/CategoryCommon/timewarranty.js, timewarranty-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Duration semantics differ: reference stores Loại (Tháng\|Năm radio) + numeric Thời Gian (e.g. "6 Tháng"); local ThoiHan stores only soNgay (days). Column `Loại` and the Tháng/Năm radio field are MISSING; "Số ngày" is not a faithful representation. |
| medium | No checkbox multi-select + bulk delete. |
| low | Local extra columns Mã thời hạn + Trạng thái not in reference; page title "Thời Hạn Bảo Hành" vs "Thời Gian Bảo Hành"; no "Lưu & Thêm mới"; page-size options differ. |

---

### Phí giao (box: "Danh sách phí giao")

- Ref file: `phigiao-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/PhiGiaoPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/phi-giao.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /PhiGiao/List` AJAX → `#ma-list`; panel "Thông tin phí giao" `POST /PhiGiao/Create` AJAX → `#ma-update`.

**Filter bar**: single text `keySearch` "Tên phí giao" + "Tìm kiếm".

**Toolbar**: refresh (data-root=PhiGiao); bulk-delete; `numberRow` 20/30/50/100/150/200/300 (tooltip "Chọn số dòng hiển thị").

**Table columns (exact)**: [checkbox-toggle] | `Sản phẩm` | `Tên phí` | `Số tiền` (money format) | `Loại phí` (e.g. "Phí cộng") | `Ghi chú` | `Chọn` (edit `ma-edit`, tooltip "Chỉnh sửa").

**Panel form fields**: Sản phẩm — select `ProductStatusId` with option "Không chọn" + ~160 product-type options (TỦ LẠNH, NỒI CƠM ĐIỆN, MÁY LẠNH, MÁY GIẶT, …); Tên phí giao* (text); Số tiền* (money-masked → hidden `SoTien`); Loại phí* — select `LoaiPhi`: Cộng (1) / Trừ (2) / Công (3); Ghi chú (text). Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 1" PagedList top+bottom.

**Scripts**: /Scripts/CategoryCommon/PhiGiao.js, PhiGiao-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Wrong association + column set: reference links phí giao to a Sản phẩm (product type / ProductStatus select), NOT to Khu vực as local does. Columns `Sản phẩm`, `Loại phí` (Cộng/Trừ/Công), `Ghi chú` are MISSING; local extras Mã phí, Khu vực, Trạng thái are not in reference. PhiGiao type lacks productStatusId/loaiPhi/ghiChu. |
| medium | No checkbox multi-select + bulk delete. |
| low | No "Lưu & Thêm mới"; money-masked input; local Khu vực filter has no reference counterpart (reference filters only by tên phí). |

---

### Đơn Vị Tính (box: "Danh sách Đơn vị tính")

- Ref file: `donvitinh-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/DonViTinhPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/don-vi-tinh.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /DonViTinh/List` AJAX → `#ma-list`; panel "Thông tin Đơn vị tính" `POST /DonViTinh/Create` AJAX → `#ma-update`.

**Filter bar**: single text `keySearch` (placeholder erroneously "Tên phòng ban" — copy-paste bug in legacy) + "Tìm kiếm".

**Toolbar**: refresh (data-root=DonViTinh); bulk-delete; `numberRow` 20/30/50/100/150/200/300.

**Table columns (exact)**: [checkbox-toggle] | `Tên Đơn Vị Tính` | `Chọn` (edit `ma-edit`).

**Panel form fields**: Tên đơn vị tính* (text) — single field. Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 1" PagedList top+bottom.

**Scripts**: /Scripts/CategoryCommon/donvitinh.js, donvitinh-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No checkbox multi-select + bulk delete (only per-row delete locally). |
| low | Local is a superset: extra columns/fields Mã ĐVT + Trạng thái not present in reference (reference entity = name only). No "Lưu & Thêm mới"; Sheet vs side panel; page-size options differ. |

---

### Nhóm Sản Phẩm (box: "Danh Sách Nhóm Sản Phẩm")

- Ref file: `nhomsanpham-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/NhomSanPhamPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/nhom-san-pham.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /NhomSanPham/List` AJAX → `#ma-list`; panel "Thông tin Nhóm sản phẩm" `POST /NhomSanPham/Create` AJAX → `#ma-update`.

**Filter bar**: single text `keySearch` "Tên nhóm sản phẩm" + "Tìm kiếm".

**Toolbar**: refresh (data-root=NhomSanPham); bulk-delete; `numberRow` 20/30/50/100/150/200/300.

**Table columns (exact)**: [checkbox-toggle] | `Tên Nhóm` | `Chọn` (edit `ma-edit`).

**Panel form fields**: Tên Nhóm (text, single field; no required star). Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 1" PagedList top+bottom.

**Scripts**: /Scripts/CategoryCommon/nhomsanpham.js, nhomsanpham-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No checkbox multi-select + bulk delete. |
| low | Local is a superset: extra Mã nhóm SP + Trạng thái columns/fields not in reference. No "Lưu & Thêm mới"; page-size options differ. |

---

### Lỗi Sửa Chữa (box: "Danh sách Lỗi Sửa Chữa")

- Ref file: `loisuachua-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/LoiSuaChuaPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/loi-sua-chua.config.ts`)

**Ref spec**

**Layout**: 2-column master-detail. List `POST /LoiSuaChua/List` AJAX → `#ma-list`; panel "Thông Tin Lỗi Sửa Chữa" `POST /LoiSuaChua/Create` AJAX → `#ma-update`.

**Filter bar**: autocomplete "Chi nhánh" (`BranchName` + hidden `BranchIdS`); text `keySearch` "Tên lỗi"; autocomplete "Tên Nhóm Sản Phẩm" (`TenNhom` + hidden `NhomSanPhamId`); button "Tìm kiếm".

**Toolbar**: refresh (data-root=LoiSuaChua); bulk-delete; `numberRow` 20/30/50/100/150/200/300.

**Table columns (exact)**: [checkbox-toggle] | `Chi Nhánh` | `Tên Nhóm Sản Phẩm` | `Tên Lỗi Sửa Chữa` | `Tiền Công` (money, bold th cell) | `Tiền Công DV` (money) | `Chọn` (edit `ma-edit`).

**Panel form fields**: Chi nhánh — select `BranchId` ("-- Chi nhánh --" + 3 branches: TTBH … Đăk lăk / TTBH … Đăk nông / Cộng tác viên tuyến huyện); Nhóm Sản Phẩm* — autocomplete + "+" quick-add modal; Tên Sửa Chữa — textarea (2 rows); Tiền công (money-masked → hidden `TienCong`); Tiền công DV (money-masked → hidden `TienCongDV`). Buttons: Thêm Mới / Lưu / Lưu & Thêm mới.

**Pagination**: "Trang 1 / 10" PagedList 1–10 + » next, top+bottom.

**Scripts**: /Scripts/CategoryCommon/loisuachua.js, loisuachua-u.js.

**Gaps**

| Severity | Gap |
|---|---|
| high | Core columns/fields MISSING: Chi Nhánh, Tên Nhóm Sản Phẩm, Tiền Công, Tiền Công DV. Reference models a labor-price catalog per (branch × product group × repair name); local LoiSuaChua is just maLoi/tenLoi/moTa/active — no branchId, nhomSanPhamId, tienCong, tienCongDV. |
| medium | Missing filters: Chi nhánh autocomplete and Nhóm Sản Phẩm autocomplete (local filters only tenLoi text). |
| medium | No quick-add "+" modal for Nhóm Sản Phẩm from the form; no checkbox multi-select + bulk delete. |
| low | Reference uses textarea for Tên Sửa Chữa (local text ok as textarea exists for moTa); local extras Mã lỗi/Mô tả/Trạng thái not in reference; no "Lưu & Thêm mới"; money-masked inputs. |

---

## Group summary

All 7 catalog-b reference pages have local React counterparts wired through CrudTablePage, so no pages are missing outright — but 5 of 7 have materially wrong data models. Reference pattern shared by every page: left list box (checkbox multi-select + select-all, refresh, bulk delete, rows-per-page 20–300, server pagination "Trang x / y") + persistent right-side create/edit panel with "Thêm Mới / Lưu / Lưu & Thêm mới", posting to /{Entity}/List and /{Entity}/Create via unobtrusive AJAX. High-severity gaps: (1) Khu Vực — reference is a delivery-route entity on a Tỉnh→Quận→Xã hierarchy with Cây số/Tiền công/Tiền công 2 and quick-add modals for each admin level; local is a flat code/name/province record. (2) Phường/Xã — reference carries Tỉnh/Quận parents, Khoảng cách, Tiền công, and a Tuyến (khu vực) link; local invents Loại + khuVucId instead. (3) Thời Hạn — reference stores Loại (Tháng/Năm radio) + numeric value, local stores days. (4) Phí Giao — reference links fees to Sản phẩm (product-status select, ~160 options) with Loại phí Cộng/Trừ/Công and Ghi chú; local wrongly links to Khu vực. (5) Lỗi Sửa Chữa — reference is a labor-price list per Chi nhánh × Nhóm sản phẩm with Tiền Công / Tiền Công DV plus branch & product-group filters; local has none of these. Đơn Vị Tính and Nhóm Sản Phẩm are faithful supersets (only bulk-delete and save-and-new missing). Cross-cutting gaps to fix once in CrudTablePage: checkbox multi-select + bulk delete, "Lưu & Thêm mới" action, page-size options 20–300, and autocomplete-with-quick-add ("+") field type for related entities.
