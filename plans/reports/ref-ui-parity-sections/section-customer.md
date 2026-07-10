# UI Parity — Group: customer

### Quản Lý Khách Hàng (breadcrumb: Trang chủ / Khách hàng)

- Ref file: `/tmp/ptref/trimmed/customer-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/danh-muc/KhachHangPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/khach-hang.config.ts`)

**Ref spec**

## Page
- Route: /Customer/Index. Box title: "Danh sách khách hàng". In reference nav, this page is a CHILD of Danh Mục.

## Toolbar buttons (breadcrumb area)
- **Thêm Khách Hàng** (green, `.ma-modal-insert-customer`) — opens insert-customer form in modal (#MyModal/#MyModal1 shell, content AJAX-loaded; handler in /Scripts/CategoryCommon/customer.js, not mirrored)
- **Thêm Đại Lý** (blue, `.ma-modal-insert-customer-dl`) — separate insert-dealer form in modal (dealers are customers with a dealer CustomerType)

## Filter/search bar (form POSTs to /Customer/List via unobtrusive AJAX, data-ajax-update=#ma-list, success=ListPost)
- **Tên Tỉnh** — autocomplete text input (#AutoTinh) + hidden `TinhId`
- **Tên Quận** — autocomplete text input (#AutoQuan) + hidden `QuanId`
- **Nhóm khách hàng** — select `CustomerType`: (blank)=Nhóm khách hàng, 1=Khách lẻ, 3=Đối tác MB/Nhà CC, 2=Đại lý chính, 9=Trung tâm bảo hành, 4=Đại lý/Cửa hàng, 5=Nhân viên công ty, 6=Thợ sửa chữa, 7=Cộng tác viên, 8=Nhà xe - Chuyển phát
- **Tên khách hàng** — text (`keySearch`)
- **Số điện thoại** — text (`Phone2`)
- **Email** — text (`Email`)
- **Địa chỉ** — text (`Address`)
- Buttons: **Tìm kiếm** (submit), **Xuất Excel File** (submit with `typeName=all` → server-side Excel export of full result set)
- Refresh icon button (`.ms-refresh`, data-root="Customer") reloads the list

## Table columns (exact VI headers, display order)
1. STT
2. (checkbox column — header is a "Chọn tất cả" select-all toggle button; iCheck checkboxes `name=inputCheck value={customerId}` per row)
3. Tên khách hàng
4. Điện thoại
5. Điện thoại 2
6. Địa chỉ
7. Phường/Xã
8. Quận/Huyện
9. Tỉnh
10. Email
11. Loại (customer type label, e.g. "Khách lẻ")
12. Đại lý/Trạm (parent dealer/station name)
13. Người tạo (creator user name)
14. Ngày tạo (datetime "dd/MM/yyyy hh:mm AM/PM")
15. Chọn (row actions)

## Row actions
- Single **Chỉnh sửa** edit button (`.ma-edit` with `data-id`) — opens edit form in modal via AJAX. NO per-row delete button.

## Pagination
- Server-side PagedList: label "Trang 1 / 4750" + numbered page links 1–10, ellipsis, » (next), »» (last). Page size 20, hidden `pageNumber` inputs drive AJAX repost of the same filter form.

## Modals
- #MyModal / #MyModal1 — empty generic shells; insert-customer, insert-dealer, and edit-customer forms are AJAX-loaded into them
- #MyModal2 "Bản đồ chi nhánh" — Google Maps branch map with Places search box (global layout modal, not customer-specific)

## Interactions / scripts
- Page logic in /Scripts/CategoryCommon/customer.js (NOT mirrored — modal/edit/select-all exact behavior inferred from markup)
- Province/district autocomplete widgets (`.TenTinh-set`/`.TenQuan-set`, hidden id fields) — cascading location lookup
- colResizable on table; SignalR call-center hub (layout-level); anti-forgery token in form

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set is substantially wrong. Missing reference columns: Điện thoại 2, Phường/Xã, Quận/Huyện, Tỉnh, Loại (customer type), Đại lý/Trạm, Người tạo. Local shows Mã KH, Tổng phiếu, Trạng thái (active) — none of which exist in the reference. Email, Địa chỉ, Ngày tạo exist locally but are hidden by default while visible in the reference. |
| high | Customer type ("Nhóm khách hàng", 9 values: Khách lẻ, Đối tác MB/Nhà CC, Đại lý chính, Trung tâm bảo hành, Đại lý/Cửa hàng, Nhân viên công ty, Thợ sửa chữa, Cộng tác viên, Nhà xe - Chuyển phát) is absent from the local KhachHang model (src/types/masterdata-types.ts), the Loại column, the filter bar, and the create/edit form. This is a core domain concept in the reference. |
| high | "Thêm Đại Lý" — the second primary create workflow (dedicated dealer-insert form alongside "Thêm Khách Hàng") — is missing. Local has only a single generic "Thêm" button. |
| medium | Location hierarchy filters missing: reference filters by Tỉnh (province) and Quận (district) autocomplete inputs with hidden ID fields (cascading lookup). Local has only a flat "Khu vực" select; no Tỉnh/Quận/Huyện filters and no Phường/Xã / Quận/Huyện / Tỉnh location fields on rows. |
| medium | Filter fields Email and Địa chỉ missing from local filter bar (reference filters on name, phone, email, address, province, district, customer type; local filters on name, phone, khu vực, trạng thái only). |
| medium | "Xuất Excel File" export of the filtered customer list is missing locally (no export capability in CrudTablePage toolbar). |
| medium | Row multi-select checkbox column with header "Chọn tất cả" select-all toggle is missing (DataTable has no selection support). Exact bulk action driven by customer.js was not mirrored — flag for product decision. |
| medium | Data-model fields missing locally: Điện thoại 2 (second phone), Đại lý/Trạm (parent dealer/station association), Người tạo (creator audit field). Reference also lacks local-only fields maKH, tongPhieu, active — verify whether those local inventions should stay. |
| low | Local adds a per-row Delete button + delete dialog; reference has edit-only row actions (no customer delete on this page). Behavior addition, may be intentional. |
| low | Nav placement differs: reference lists Quản Lý Khách Hàng as a child of Danh Mục; local nav-config.tsx puts Khách Hàng as a top-level primary item (known deliberate difference). |
| low | Ngày tạo shows full datetime with AM/PM in reference (e.g. "03/07/2026 03:09 PM"); local renderCell uses formatDate (date-level). Pagination presentation also differs (reference "Trang 1 / 4750" numbered PagedList vs local pageIndex + pageSize selector 10/20/50/100 — functionally equivalent). |
| low | Reference create/edit happens in modal dialogs (AJAX-loaded forms); local uses a Sheet (CrudSheet). Functionally equivalent pattern, cosmetic difference. |

## Group summary

Reference /Customer/Index is a much richer page than the local KhachHangPage. Local CrudTablePage covers basic list/create/edit/delete with name/phone filters, but is missing the customer-type taxonomy (9 nhóm khách hàng values: Loại column, filter, and form field), the location hierarchy (Tỉnh/Quận filters and Phường/Xã, Quận/Huyện, Tỉnh columns), the separate "Thêm Đại Lý" dealer-create workflow, Điện thoại 2 / Đại lý-Trạm / Người tạo fields, Excel export, and row multi-select. Local also invents columns not in the reference (Mã KH, Tổng phiếu, Trạng thái). Reference page logic lives in /Scripts/CategoryCommon/customer.js which was not mirrored, so modal and select-all behaviors are inferred from markup conventions; the bulk-select purpose is the main unresolved question.

## Addendum — verified from mirrored partials (260703)

### /tmp/ptref/ajax-Customer-List.html (POST /Customer/List result, 26.5K, 20 rows)

**Table columns — verified exact, 15 columns in order:**
1. STT (`th.center.w10`) 2. checkbox col (header = `a.checkbox-toggle` btn, tooltip "Chọn tất cả", icon `fa-square-o`; rows = `<input name="inputCheck" value="{customerId}" type="checkbox" class="minimal">` iCheck) 3. Tên khách hàng 4. Điện thoại 5. Điện thoại 2 6. Địa chỉ 7. Phường/Xã 8. Quận/Huyện 9. Tỉnh 10. Email 11. Loại 12. Đại lý/Trạm 13. Người tạo 14. Ngày tạo 15. Chọn.
Column list in the main section is CONFIRMED byte-exact against the live AJAX partial (previously derived from customer-index.html initial render only — List POST re-render now proven identical).

**Row actions — verified:** single `span.ma-edit.btn-info` per row, `data-id={customerId}`, tooltip "Chỉnh sửa", icon `fa fa-edit`. NO delete, NO view, NO other row action. Confirms prior "edit-only row actions" note.

**Checkbox column — what it drives:** partial contains NO bulk-action button/toolbar, and page toolbar (customer-index.html) has none either (only Thêm Khách Hàng / Thêm Đại Lý / Tìm kiếm / Xuất Excel File / refresh). `checkbox-toggle` header is the AdminLTE mailbox select-all pattern. Conclusion: checkboxes select customer IDs but no bulk action is reachable from mirrored markup — either consumed by /Scripts/CategoryCommon/customer.js (STILL not mirrored) or vestigial template carryover. Partially resolves: "Exact bulk action driven by customer.js was not mirrored — flag for product decision" → markup-level verification done; no bulk action exists in HTML. customer.js itself remains the only open item.

**Footer/pagination — verified:** hidden `input#pageNumber` (name=pageNumber, value=1) rendered inside the partial; footer `div.mailbox-controls.box-custom` with label "Trang 1 / 4750" + PagedList `ul.pagination`: active 1, links 2–10 (`href="#N"`), disabled ellipsis "…", `PagedList-skipToNext` » (rel=next), `PagedList-skipToLast` »» (#4750). Page size 20. NO totals/summary row.

**Data observations:** rows ordered newest-first (IDs 132522→132503 desc, Ngày tạo desc); Ngày tạo format "03/07/2026 04:56 PM" (dd/MM/yyyy hh:mm AM/PM) confirmed; Email + Đại lý/Trạm cells empty for Khách lẻ rows; Loại renders label text ("Khách lẻ").

**New gaps vs local (KhachHangPage.tsx / khach-hang.config.ts):**

| Severity | Gap |
|---|---|
| low | STT sequential row-number column missing locally (local leads with Mã KH instead; reference has no Mã KH at all). Not called out in prior gap rows. |
| low | Default ordering differs: reference lists newest-created first (ID/Ngày tạo desc); local `defaultSort: { key: 'maKH', dir: 'asc' }` shows oldest first. |
| low | Reference partial re-renders hidden `pageNumber` inside the list fragment (server drives paging state); local client paging equivalent — no action, noted for completeness. |

