# Ref UI Parity — Group: HR (nhan-su)

### Ngân Hàng
- Ref: `nganhang-index.html`
- Local: MISSING

**Ref spec**

## Layout
Two-column master-detail: list box (col-md-8, title "Danh sách Ngân Hàng") + inline form box (col-md-4, title "Thông tin Ngân Hàng"). No page reload — form0 posts AJAX to `/NganHang/List` (replace #ma-list), form posts to `/NganHang/Create` (replace #ma-update).

## Filter/search bar
- Rows-per-page select `numberRow`: 20/30/50/100/150/200/300
- Text search `keySearch` placeholder "Tên ngân hàng" + green "Tìm kiếm" button
- Toolbar icon buttons: refresh (Tải lại trang), red X bulk delete (Xóa) acting on checked rows

## Table columns (exact, in order)
1. [checkbox chọn tất cả] | 2. `Mã Ngân Hàng` | 3. `Tên Ngân Hàng` | 4. `Địa chỉ` | 5. `Chọn` (blue edit icon `.ma-edit` data-id → loads record into side form)

## Side form (create/edit)
- `Mã Ngân Hàng`* (text), `Tên Ngân Hàng`* (text), `Địa chỉ` (textarea 2 rows)
- Buttons: `Thêm Mới` (reset form), `Lưu` (save), `Lưu & Thêm mới` (save + reset)

## Pagination
"Trang X / Y" label + numbered pagination, duplicated above and below table.

## Endpoints
POST /NganHang/List, POST /NganHang/Create; scripts nganhang.js / nganhang-u.js (edit click fetches record, delete posts checked ids).

**Gaps**

| Severity | Gap |
|---|---|
| high | Page missing entirely — route /nhan-su/ngan-hang renders stub() placeholder (src/routes/index.tsx line 363). Needs CrudConfig with columns Mã Ngân Hàng / Tên Ngân Hàng / Địa chỉ, fields maNganHang* text, tenNganHang* text, diaChi textarea, search by tên ngân hàng. |
| medium | Reference supports multi-select checkbox column + bulk delete toolbar button; local CrudTablePage pattern only has per-row delete. |
| low | Reference master-detail inline side form with Lưu / Lưu & Thêm mới dual-save; local convention is Sheet modal with single save — acceptable modernization but 'Lưu & Thêm mới' flow is lost. |

### Phòng Ban
- Ref: `phongban-index.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/PhongBanPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/phong-ban.config.ts)

**Ref spec**

## Layout
Same master-detail pattern as Ngân Hàng: list box "Danh sách Phòng Ban" (col-md-8) + form box "Thông tin Phòng Ban" (col-md-4). AJAX POST `/PhongBan/List` and `/PhongBan/Create`.

## Filter/search bar
- `numberRow` select 20/30/50/100/150/200/300
- `keySearch` text placeholder "Tên phòng ban" + "Tìm kiếm"
- Toolbar: refresh, red X bulk delete of checked rows

## Table columns (exact)
1. [checkbox toggle] | 2. `Mã Phòng Ban` | 3. `Tên Phòng Ban` | 4. `Chọn` (edit icon, loads into side form)

## Side form
- `Mã Phòng Ban`* (text), `Tên Phòng Ban`* (text)
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + numbered pager, top and bottom.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No multi-select checkboxes / bulk delete; reference toolbar has bulk Xóa on checked rows. |
| low | Local adds a Trạng thái (active) column/field that does not exist in reference — extra, not missing. |
| low | Rows-per-page options differ (ref 20–300, local DataTable 10/25/50/100); 'Lưu & Thêm mới' save-and-continue absent. |

### Chức Vụ
- Ref: `chucvu-index.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/ChucVuPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/chuc-vu.config.ts)

**Ref spec**

## Layout
Master-detail: list "Danh sách Chức Vụ" (col-md-8) + form "Thông tin Chức Vụ" (col-md-4). AJAX POST `/ChucVu/List`, `/ChucVu/Create`.

## Filter/search bar
- `numberRow` 20/30/50/100/150/200/300
- `keySearch` placeholder "Tên chức vụ hoặc mã" + "Tìm kiếm"
- Toolbar: refresh, bulk delete (checked rows)

## Table columns (exact)
1. [checkbox toggle] | 2. `Mã Chức Vụ` | 3. `Tên Chức Vụ` | 4. `Chọn` (edit icon)

## Side form
- `Mã Chức Vụ`* (text), `Tên Chức Vụ`* (text)
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| medium | No bulk select/delete (reference has checkbox column + toolbar Xóa). |
| low | Reference search matches name OR code ("Tên chức vụ hoặc mã"); local filter is tenChucVu text only. |
| low | Local adds moTa and active column/fields not in reference (extras); 'Lưu & Thêm mới' absent. |

### Phụ Cấp
- Ref: `phucap-index.html`
- Local: MISSING

**Ref spec**

## Layout
Master-detail: list "Danh sách Phụ cấp" (col-md-8) + form "Thông tin phụ cấp" (col-md-4). AJAX POST `/PhuCap/List`, `/PhuCap/Create`.

## Filter/search bar
- `numberRow` 20/30/50/100/150/200/300
- `keySearch` placeholder "Tên phụ cấp" + "Tìm kiếm"
- Toolbar: refresh, bulk delete of checked rows

## Table columns (exact)
1. [checkbox toggle] | 2. `Tên phụ cấp` | 3. `Loại phụ cấp` | 4. `GiaTri` (money, e.g. 300,000) | 5. `Chọn` (edit icon)

## Side form
- `Tên Phụ Cấp`* (text)
- `Loại`* (select: 1=Ăn Chia, 2=Tiền mặt)
- `Giá Trị`* (money-masked text `ms-money-input` + hidden numeric GiaTri)
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Page missing entirely — route /nhan-su/phu-cap is stub() (src/routes/index.tsx line 372). Needs CrudConfig: columns Tên phụ cấp / Loại phụ cấp / Giá trị; fields tenPhuCap* text, loaiPhuCap* select (Ăn Chia | Tiền mặt), giaTri* money. |
| medium | Bulk select/delete required by reference toolbar, not supported by local CRUD pattern. |

### Loại Phạt Thưởng
- Ref: `loaiphatthuong-index.html`
- Local: MISSING

**Ref spec**

## Layout
Master-detail: list "Danh sách phạt thưởng" (col-md-8) + form "Thông tin Loại Phạt Thưởng" (col-md-4). AJAX POST `/LoaiPhatThuong/List`, `/LoaiPhatThuong/Create`.

## Filter/search bar
- `numberRow` 20/30/50/100/150/200/300
- `keySearch` placeholder "Tên loại" + "Tìm kiếm"
- Toolbar: refresh, bulk delete (checked rows)

## Table columns (exact)
1. [checkbox toggle] | 2. `Loại` (displays "Thưởng" or "Phạt") | 3. `Tên Loại` | 4. `Chọn` (edit icon)

## Side form
- `Loại`* (radio: value 1=Thưởng, value 2=Phạt)
- `Tên Loại`* (text)
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Page missing entirely — route /nhan-su/loai-phat-thuong is stub() (src/routes/index.tsx line 376). Needs CrudConfig: columns Loại (Thưởng/Phạt) / Tên loại; fields loai* radio-or-select (Thưởng | Phạt), tenLoai* text. |
| medium | Bulk select/delete required by reference toolbar, not supported by local CRUD pattern. |

### Ứng Lương
- Ref: `ungluong-index.html`
- Local: MISSING

**Ref spec**

## Layout
Master-detail: list "Danh sách ứng lương" (col-md-8) + form "Thông tin ứng lương" (col-md-4). AJAX POST `/UngLuong/List`, `/UngLuong/Create`.

## Filter bar
- `numberRow` 20/30/50/100/150/200/300
- Employee autocomplete: text `AutoNV` placeholder "Tên Nhân Viên" + hidden `NhanVienId`
- Kỳ (payroll period) select `MaKy` (class ListKyDefaultId, options loaded via JS)
- Green `Lọc` (filter) submit button
- Toolbar: refresh, bulk delete (checked rows)

## Table columns (exact)
1. `##` (STT) | 2. [checkbox toggle] | 3. `Tên Nhân Viên` | 4. `Tên Kỳ` (e.g. 11/2020) | 5. `Ngày Ứng` (datetime dd/MM/yyyy hh:mm AM/PM) | 6. `Số Tiền` (money) | 7. `Ghi chú` | 8. `Chọn` (edit icon → loads into side form)

## Side form
- `Nhân Viên`: autocomplete input + inline "+" quick-add button (`.ma-modal-insert-nhanvien` opens modal to create employee on the fly); hidden NhanVienId
- `Tên Kỳ`: autocomplete input + "+" quick-add kỳ button (`.ma-modal-insert-ky`); hidden KyId
- `Ngày Ứng`: date picker (`ms-text-date`, default today)
- `Số Tiền`: money-masked input (hidden numeric SoTien)
- `Ghi Chú`: text
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Page missing entirely — route /nhan-su/ung-luong is stub() (src/routes/index.tsx line 380). Needs table (STT, Tên nhân viên, Kỳ, Ngày ứng, Số tiền, Ghi chú) + create/edit form (nhân viên select/autocomplete, kỳ, ngày ứng date, số tiền money, ghi chú). |
| medium | Reference filters by employee autocomplete AND kỳ (payroll period) — a Kỳ entity/selector does not exist anywhere in the local app and is also needed by Bảng lương and Chấm công. |
| medium | Quick-add "+" modals to create a Nhân viên or Kỳ inline from the form; bulk select/delete. |

### Nhân viên
- Ref: `nhanvien-index.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/NhanVienPage.tsx (config: /home/hale/code/phongthanh-admin/src/config/crud-configs/nhan-vien.config.ts)

**Ref spec**

## Layout
Full-width list "Danh sách nhân viên". Header breadcrumb holds green button `Thêm nhân viên` linking to dedicated page `/NhanVien/Create` (full-page create, not modal). Edit is also a dedicated page `/NhanVien/Edit?id=N`. AJAX POST `/NhanVien/List` replaces #ma-list.

## Filter bar (search-button group)
- Text `MaNhanVien` placeholder "Mã/tên nhân viên"
- Phòng ban select `PhongBanId` (class ListPhongBanId, options JS-loaded)
- Green `Tìm kiếm` button; separate refresh button
- No rows-per-page select on this page

## Table columns (exact)
1. `STT` | 2. [checkbox toggle] | 3. `Hình` (40x40 employee photo from /Source/ImgNV/{id}/) | 4. `Mã NV` | 5. `Tên NV` | 6. `Phòng` | 7. `Giới tính` (Nam/Nữ) | 8. `Ngày sinh` (dd/MM/yyyy) | 9. `Điện thoại` | 10. `Khóa` (toggle button: red lock icon + tooltip "Khóa" when data-lock=False i.e. active; green unlock icon + tooltip "Mở khóa" when data-lock=True i.e. locked; `.ma-lock` posts lock/unlock) | 11. `Chọn` (edit link → /NhanVien/Edit?id=N)

## Pagination
"Trang X / Y" + numbered pager top and bottom.

## Interactions
- `.ma-lock` click toggles account lock via nhanvien.js AJAX
- Locked rows shown with unlock (green) state; list appears sorted active-first then locked
- Checkbox column exists but toolbar exposes only refresh (no bulk delete on this page)

**Gaps**

| Severity | Gap |
|---|---|
| high | Khóa/Mở khóa (lock-unlock employee account) column + toggle action missing entirely from local page and NhanVien type — a primary workflow in reference. |
| medium | Columns Hình (photo thumbnail) and Giới tính missing; NhanVien type (src/types/masterdata-types.ts:129) has no gioiTinh or photo field. Ngày sinh exists but is hidden by default (visible in ref); Phòng ban column hidden by default (visible in ref). |
| medium | Reference uses dedicated full-page Create/Edit (/NhanVien/Create, /NhanVien/Edit?id=) with a header 'Thêm nhân viên' button; local uses a small Sheet modal with only 9 fields — full employee profile form (photo upload etc.) not represented. |
| low | Reference search is a single 'Mã/tên nhân viên' box + Phòng ban select; local filters are Họ tên + Chi nhánh + Phòng ban (code search not unified). Local shows extra Chi nhánh/Lương CB/Trạng thái columns not in reference list. |

### Bảng lương
- Ref: `bangluong-index.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/BangLuongPage.tsx

**Ref spec**

## Layout
Full-width list "Danh sách bảng lương nhân viên". AJAX POST `/BangLuong/List` replaces #ma-list. The list is generated per employee x selected kỳ; rows without a created payroll record show a "Tạo bảng lương" action.

## Filter fieldset "Thông tin tìm kiếm"
- `Kỳ` select `MaKy` (ListKyDefaultId, JS-loaded, e.g. 7/2026)
- `Tên nhân viên` text `HoTen`
- `Tên phòng ban` select `PhongBanId`
- Buttons: `Tìm kiếm`, `Xuất file excel` (bulk excel via ms-report-btn), `Cập nhật tiền công KV` (recompute technician piece-rate pay, .ma-capnhattiencong), `Tải lại trang`

## Summary
Pagination bar shows aggregate: "Tổng lương: {sum} VND" + "Trang X / Y".

## Table columns (exact)
1. [checkbox toggle] | 2. `STT` | 3. `Kỳ` (blue bold, e.g. 7/2026) | 4. `Tên NV` (bold link "maNV - hoTen" → /NhanVien/Edit?id, new tab) | 5. `Phòng` | 6. `Chức vụ` | 7. `Lương cứng` | 8. `Bảo Hiểm` | 9. `Phụ cấp` | 10. `Tăng ca - Nghỉ` (green/red pair) | 11. `Ứng lương` | 12. `Thưởng - Phạt` (green/red pair) | 13. `Công BH` (warranty-repair piece pay) | 14. `Công SC` (repair piece pay) | 15. `Tổng lương` (green bold) | 16. `Thực lãnh` (blue bold) | 17. `Chọn`
Second header row = totals row aggregating every money column.

## Row actions
- `Tạo bảng lương` / edit (blue, href /BangLuong/Create?id={blId}&nvId={nv}&maKy={ky} — dedicated payroll worksheet page)
- Print (orange, /BangLuong/Print?id=, new tab)
- Xuất excel per row (green, /BangLuong/ExcelBangLuongList?id=, new tab)

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set wrong: local has Mã NV/Họ tên/Phòng ban/Tháng/Lương CB/Phụ cấp/Thưởng/Khấu trừ/Thực lãnh/Trạng thái; missing Kỳ, Chức vụ, Bảo Hiểm, Tăng ca - Nghỉ, Ứng lương, Thưởng - Phạt (paired), Công BH, Công SC, Tổng lương. 'Trạng thái' column is invented (not in reference). |
| high | Row actions missing: Tạo bảng lương / edit payroll worksheet (BangLuong/Create?nvId&maKy), per-row Print, per-row Xuất excel. Local page is read-only with no actions at all. |
| high | Toolbar actions missing: Xuất file excel (bulk), Cập nhật tiền công KV (recompute technician commission). |
| medium | Filters missing: Kỳ (period) select and Phòng ban select; local only has free-text toolbar search. Totals row + 'Tổng lương: X VND' aggregate summary also missing. |

### Chấm công
- Ref: `chamcong-index.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/ChamCongPage.tsx

**Ref spec**

## Layout
Master-detail: list "Danh sách chấm công" (col-md-8) + entry form "Thông tin Chấm công" (col-md-4). AJAX POST `/ChamCong/List`, form POST `/ChamCong/CreatePartial`. Data model = exception-based attendance records (leave/overtime/late/early), NOT daily clock-in/out.

## Filter bar
- `numberRow` 20/30/50/100/150/200/300
- Text `keySearch` placeholder "Tên Nhân Viên"
- `Kỳ` select `KyId` (ListKyDefaultId)
- `Tìm kiếm` button; toolbar refresh + bulk delete (checked rows)

## Table columns (exact)
1. [checkbox toggle] | 2. `STT` | 3. `Tên NV` ("maNV - hoTen") | 4. `Giới tính` | 5. `Chức danh` | 6. `Chi nhánh` | 7. `Loại chấm` (Nghỉ / Nghỉ 1/2 ngày / Đi trễ / Tăng ca / Về sớm) | 8. `Chấm công` (quantity + unit: "2 (ngày)", "0 (giờ)") | 9. `Ngày chấm công` | 10. `Ngày tạo` | 11. `Kỳ` (e.g. 10/2020) | 12. `Loại trừ` (Trừ ngày công / Trừ tiền) | 13. `Chọn` (edit icon data-type="cc" loads into side form)

## Side form
- `Nhân viên`* select (full employee list)
- `Ngày chấm` date picker (default today)
- `Kỳ` autocomplete (AutoKy1 + hidden KyId)
- `Loại chấm công` select: 1=Nghỉ, 2=Nghỉ nữa ngày, 3=Đi trễ, 4=Tăng ca, 5=Về sớm
- Conditional numeric field shown per type (ms-LoaiNghi-N): Số giờ trễ (3), Số giờ tăng ca (4), Số giờ về sớm (5), Số ngày nghỉ (1, default 1)
- `Loại trừ lương` select: 1=Trừ tiền, 2=Trừ ngày công (default)
- Buttons: `Thêm Mới`, `Lưu`, `Lưu & Thêm mới`

## Pagination
"Trang X / Y" + pager top/bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Create/edit attendance-record workflow missing entirely: reference is a CRUD of exception records (Nghỉ/Nghỉ nửa ngày/Đi trễ/Tăng ca/Về sớm with conditional quantity + Loại trừ lương); local page is read-only fabricated clock-in/out data with no form. |
| high | Column set wrong: local shows Ngày/Giờ vào/Giờ ra/Số giờ/Loại(invented values)/Ghi chú; missing Giới tính, Chức danh, Chi nhánh, Loại chấm (5 real types), Chấm công quantity+unit, Ngày tạo, Kỳ, Loại trừ. |
| medium | Kỳ (period) filter select missing; bulk select/delete missing. |

### Tổng hợp chấm công
- Ref: `chamcong-tonghop.html`
- Local: /home/hale/code/phongthanh-admin/src/pages/nhan-su/ChamCongTongHopPage.tsx

**Ref spec**

## Layout
Single full-width box "Danh sách chấm công". AJAX POST `/ChamCong/TongHopList` replaces #ma-list. Aggregates the exception records per employee per kỳ.

## Filter bar
- `numberRow` 20/30/50/100/150/200/300
- Text `keySearch` placeholder "Tên Nhân Viên"
- `Kỳ` select `KyId` (ListKyDefaultId)
- Buttons: `Tìm kiếm`, `Xuất Excel` (.ms-report)
- Refresh button (id=reset)

## Table columns (exact)
1. `STT` | 2. `Mã NV` | 3. `Tên NV` | 4. `Chi nhánh` | 5. `Ngày chấm công` | 6. `Ngày nghỉ` (total leave days) | 7. `Giờ tăng ca` (total OT hours) | 8. `Số giờ trễ` (total late hours) | 9. `Giờ về sớm` (total early-leave hours) | 10. `Xem` (view-detail action per row)
(Mirror snapshot shows empty body — rows are AJAX-rendered after choosing kỳ; "Trang 0 / 0".)

## Pagination
"Trang X / Y" + pager, duplicated above and below table.

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set wrong: reference is per-employee totals for a kỳ (Chi nhánh, Ngày chấm công, Ngày nghỉ, Giờ tăng ca, Số giờ trễ, Giờ về sớm, Xem); local renders an invented day-1..26 X/M/P/V matrix with TC/NP/NV — no leave/OT/late/early-hour totals and no Chi nhánh. |
| medium | Kỳ (period) filter select missing — summary is meaningless without period scoping; local only has a name search box. |
| medium | Xuất Excel toolbar button and per-row Xem (drill-down to underlying chấm công records) missing. |

## Group Summary

HR group: 10 reference pages vs React rebuild. 4 pages are entirely missing locally (stub routes): Ngân hàng, Phụ cấp, Loại phạt thưởng, Ứng lương — all simple master-detail CRUDs (Ứng lương additionally needs employee autocomplete + Kỳ selector + quick-add modals). 3 simple CRUDs exist and match well (Phòng ban, Chức vụ; Nhân viên mostly) with medium gaps: no bulk select/delete anywhere, Nhân viên missing photo column, Giới tính, and the lock/unlock (Khóa) workflow plus dedicated create/edit pages. 3 aggregate pages exist but with invented data models that diverge from reference: Bảng lương lacks 9 of 16 columns (Bảo hiểm, Tăng ca-Nghỉ, Ứng lương, Thưởng-Phạt, Công BH, Công SC, Tổng lương...), all row actions (Tạo bảng lương/Print/Excel), toolbar Excel + Cập nhật tiền công KV, totals row; Chấm công should be exception-record CRUD (Nghỉ/Đi trễ/Tăng ca/Về sớm + Loại trừ lương form) not clock-in/out; Chấm công tổng hợp should be per-employee per-kỳ totals (ngày nghỉ/giờ tăng ca/giờ trễ/giờ về sớm + Xem drill-down) not a day matrix. Cross-cutting: a Kỳ (payroll period) entity/selector is required by 4 pages and absent from the local app.

## Addendum — verified from mirrored partials (260703)

### ajax-NhanVien-List.html (AJAX partial /NhanVien/List)

Confirms Nhân viên list spec above verbatim (resolves: list rows previously AJAX-only/inferred — now verified from real markup).

- Columns exact, in order: `STT` | [checkbox `Chọn tất cả` toggle] | `Hình` | `Mã NV` | `Tên NV` | `Phòng` | `Giới tính` | `Ngày sinh` | `Điện thoại` | `Khóa` | `Chọn`
- `Hình`: 40x40 `<img src="/Source/ImgNV/{id}/{id}.jpg">`, empty cell when no photo
- `Khóa` toggle verified both states: active = red `btn-danger` lock icon tooltip `Khóa` (`data-lock="False"`); locked = green `btn-success` unlock icon tooltip `Mở khóa` (`data-lock="True"`); `.ma-lock` with `data-id`
- `Chọn` = blue edit icon `href /NhanVien/Edit?id={id}` (dedicated page, not modal)
- Sort order verified: active (data-lock=False) rows first, then locked
- Pagination `Trang 1 / 1` + numbered pager duplicated above and below table; no totals row

No new gaps beyond existing Nhân viên gap table (Khóa/Hình/Giới tính/full-page editor already listed).

### ajax-BangLuong-List.html (AJAX partial /BangLuong/List)

Confirms Bảng lương 17-column spec + totals second header row + `Tổng lương: {sum} VND` in top pager (resolves: bảng lương list body previously unverified AJAX partial).

- Columns exact: [checkbox] | `STT` | `Kỳ` (blue bold `7/2026`) | `Tên NV` (bold link `{maNV} - {hoTen}` → `/NhanVien/Edit?id`, new tab) | `Phòng` | `Chức vụ` | `Lương cứng` | `Bảo Hiểm` | `Phụ cấp` | `Tăng ca - Nghỉ` (green/red pair) | `Ứng lương` | `Thưởng - Phạt` (green/red pair) | `Công BH` | `Công SC` | `Tổng lương` (green bold) | `Thực lãnh` (blue bold) | `Chọn`
- Totals row (2nd header row): `Tổng` + per-column money sums, green/red pairs kept
- Empty-state row verified: every employee × selected kỳ gets a row even with NO payroll record — money cells empty, action = `Tạo bảng lương` (blue, `/BangLuong/Create?id=0&nvId={nv}&maKy={ky}`) + Print (`/BangLuong/Print?id=`, tooltip `In`) + per-row `Xuất excel` (`/BangLuong/ExcelBangLuongList?id=`)
- Per-row Xuất excel button conditional: present for kỹ thuật/giám sát rows, absent for `lễ tân` rows (role-dependent)
- `Chức vụ` values from Chức vụ list (e.g. `Kỹ thuật sửa tại nhà khách`, `Kỹ thuật sửa tại xưởng`, `lễ tân`, `Nhân viên giám sát`)

New gaps vs local BangLuongPage.tsx (adds to existing table):

| Severity | Gap |
|---|---|
| medium | Data model: reference emits one row per employee × kỳ even without a payroll record (empty money cells + `Tạo bảng lương` CTA); local mock always fabricates filled amounts — un-created payroll state unrepresentable. |
| low | Per-row `Xuất excel` is conditional by chức vụ (absent for lễ tân rows) — if row actions get added, mirror this conditionality. |

### trimmed/page-NhanVien-Create.html (full-page employee editor)

Resolves: "dedicated full-page Create/Edit ... full employee profile form (photo upload etc.) not represented" — full field inventory now verified.

- Form: `POST /NhanVien/CreatePartial`, AJAX `multipart/form-data`, replaces `#ma-update`; hidden `NhanVienId`; script `nhanvien-u.js`
- Breadcrumb toolbar: `Lưu` (green submit), `Lưu & Thêm mới` (blue submit), `Tạo mới` (orange link /NhanVien/Create), `Danh sách nhân viên` (back link /NhanVien/Index)
- Photo panel (col-md-3): preview img (placeholder No_Image_Available.png) + `<input type=file name=fileName accept="gif|jpg|png">` tooltip `Chọn hình đại diện nhân viên`
- Fieldset `Thông tin cơ bản`: `Mã Nhân Viên`* text | `Giới Tính`* select (Chọn / Nữ=false / Nam=true) | `Họ Tên`* text | `Ngày sinh`* date dd/MM/yyyy (ms-text-date + hidden NgaySinh) | `Phone 1` text | `Phone 2` text | `Email` text | `Thường trú` text
- Fieldset `Thông tin làm việc`: `Phòng Ban`* select | `Chức vụ`* select | `Ngày Làm Việc`* date (hidden NgayChinhThuc) | `Chi nhánh`* select (BranchId) | `Lương cứng`* money (ms-money-input + hidden LuongCung) | `Phí nhân công` money (hidden HeSo — technician piece-rate fee feeding Công BH/SC) | `Hình Thức Thanh Toán`* select (1=Tiền mặt, 2=Chuyển khoản; HinhThucNhanTien) | `Tiền đóng bảo hiểm` money (hidden TienBaoHiem) | `Phụ cấp` select2 multi-select (name=PhuCap, options from Phụ cấp list, placeholder "Chọn các phụ cấp")
- Fieldset `Thông tin xác thực`: `Chứng minh thư` (CMND) text | `Ngày Cấp` date (hidden NgayCap) | `Địa chỉ` text | `Nơi Cấp` text
- Fieldset `Thông tin ngân hàng`: `Số Tài Khoản` text | `Mã Số Thuế` text | `Ngân Hàng` select (NganHangId)
- Fieldset `Thông tin liên hệ`: `Người Liên Hệ` text | `Thông Tin Liên Hệ` text
- Bottom full-width: `Ghi Chú` text
- No [+] quick-create addons on this page; no line-item grid

New gaps vs local nhan-vien.config.ts (9 fields) — adds to existing Nhân viên gap table:

| Severity | Gap |
|---|---|
| high | Employee form missing ~18 verified fields: Giới tính*, photo upload (fileName), Phone 2, Email, Thường trú, Ngày Làm Việc* (NgayChinhThuc), Phí nhân công (HeSo), Hình Thức Thanh Toán* (Tiền mặt/Chuyển khoản), Tiền đóng bảo hiểm, Phụ cấp multi-select, CMND, Ngày Cấp, Địa chỉ, Nơi Cấp, Số Tài Khoản, Mã Số Thuế, Ngân Hàng, Người Liên Hệ, Thông Tin Liên Hệ, Ghi Chú. NhanVien type has none of these. |
| high | Employee↔Phụ cấp multi-select linkage (PhuCap select2) absent locally — required input for Bảng lương `Phụ cấp` column; also HeSo (Phí nhân công) feeds Công BH/Công SC piece pay. |
| medium | Required-ness mismatch: ref requires Giới tính, Ngày sinh, Ngày Làm Việc, Lương cứng, Hình thức thanh toán; local has ngaySinh/luongCoBan optional and lacks the rest. |
| medium | Form layout: 5 legend fieldsets (cơ bản / làm việc / xác thực / ngân hàng / liên hệ) + photo column on dedicated page with Lưu / Lưu & Thêm mới / Tạo mới toolbar; local flat 9-field Sheet modal. |
| low | Ref stores GioiTinh as boolean (true=Nam/false=Nữ) and money via masked input + hidden numeric — implementation hint for field types. |
