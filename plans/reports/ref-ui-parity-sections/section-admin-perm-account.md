# UI Parity — Group: admin-perm-account

### Quản Lý Chi Nhánh (breadcrumb: Trang chủ / Chi nhánh)
- Ref file: `branch-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly/ChiNhanhPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/chi-nhanh.config.ts`)

**Ref spec**

## Layout
Two-pane: left col-md-8 = list box titled 'Danh sách nhà sản xuất' (copy-paste bug in legacy title; actually branch list), right col-md-4 = always-visible create/edit form box 'Thông tin chi nhánh'.

## List box header
- Rows-per-page select `numberRow`: 20/30/50/100/150/200/300.

## Toolbar (mailbox-controls)
- Refresh button (icon fa-refresh, tooltip 'Tải lại trang', data-root=Branch).
- Map button (fa-map, tooltip 'Sơ đồ chi nhánh') → opens modal #MyModal2 'Bản đồ chi nhánh' containing Google Maps (Places library) with a 'Search Box' autocomplete input (#pac-input); plots branches by Toạ độ field.
- Bulk delete button (red, fa-close, tooltip 'Xóa', class ms-delete) acting on checked rows.
- Search input `keySearch` placeholder 'Tên chi nhánh' + green 'Tìm kiếm' button (submit value=search).
- Pagination right: label 'Trang 1 / 1' + numbered pagination (PagedList), repeated below table.

## Table columns (exact order)
1. [checkbox column, header = select-all toggle button 'Chọn tất cả']
2. Chi nhánh
3. Điện thoại
4. Hotline
5. Người liên hệ
6. Email
7. Địa chỉ
8. Chính (checkbox, read-only display of main-branch flag)
9. Chuyển CN (checkbox, transfer-branch flag)
10. Chọn (row action: blue edit button 'Chỉnh sửa', class ma-edit data-id → loads record into right-pane form)

## Right form 'Thông tin chi nhánh' (POST /Branch/Create, AJAX replace #ma-update)
Fields: Tên chi nhánh* (text), Điện thoại (text), Hotline (text), Địa chỉ (textarea 2 rows), Người liên hệ (text), Email (text), Toạ độ (text, tooltip 'Nhập tọa độ VD(21.029743, 105.833882)'), Chi nhánh chính (checkbox 'Main'), Chuyển chi nhánh (checkbox 'Chuyen', default checked). Buttons: 'Lưu' (save) and 'Lưu & Thêm mới' (saveNew). Hidden BranchId.

## AJAX/endpoints
- List: POST /Branch/List (unobtrusive AJAX, replaces #ma-list).
- Create/update: POST /Branch/Create → replaces #ma-update.
- Scripts: /Scripts/CategoryCommon/branch.js, branch-u.js; Google Maps JS API (places).

## Pagination style
'Trang X / Y' text + PagedList numeric pager (with » next / »» last), shown above AND below table.

**Gaps**

| Severity | Gap |
|---|---|
| high | Column set differs substantially. Reference: Chi nhánh, Điện thoại, Hotline, Người liên hệ, Email, Địa chỉ, Chính, Chuyển CN. Local has Mã CN / Tên chi nhánh / Tỉnh thành / Số điện thoại / Địa chỉ (hidden) / Trạng thái. Missing local columns: Hotline, Người liên hệ, Email, Chính (main-branch flag), Chuyển CN (transfer flag). Local invents Mã CN, Tỉnh thành, Trạng thái which do not exist in reference. |
| high | Form fields missing locally: Hotline, Người liên hệ, Email, Toạ độ (lat,lng), Chi nhánh chính (checkbox), Chuyển chi nhánh (checkbox). Local instead has Mã chi nhánh, Tỉnh thành select, Trạng thái switch — not in reference. |
| medium | Branch-map modal missing: toolbar map button opens 'Bản đồ chi nhánh' modal with Google Map + Places search box plotting branch coordinates. No map anywhere locally. |
| medium | Bulk selection + bulk delete missing: reference has select-all checkbox column and toolbar bulk-delete; local CrudTablePage only offers per-row delete. |
| medium | Layout pattern differs: reference keeps a persistent side-by-side create/edit panel with 'Lưu' and 'Lưu & Thêm mới' (save-and-new) buttons; local uses a Sheet drawer and has no save-and-new action. |
| low | Rows-per-page options differ: reference 20/30/50/100/150/200/300, local 10/20/50/100. Reference shows pagination above and below the table; local only below. |

### Quản Lý Người Dùng (breadcrumb: Trang chủ / Người dùng)
- Ref file: `user-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/quan-ly/NguoiDungPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/nguoi-dung.config.ts`)

**Ref spec**

## Header
Breadcrumb row contains a green button 'Thêm người dùng' linking to a dedicated full page /User/Create (not a modal).

## List box 'Danh sách người dùng' (full-width col-md-12)
- Rows-per-page select `numberRow`: 20/30/50/100/150/200/300.

## Toolbar
- Refresh button (fa-refresh, 'Tải lại trang').
- Bulk delete button (red, text 'Xóa', ms-delete) on checked rows.
- Search input `keySearch` placeholder/tooltip 'Tên đăng nhập' + 'Tìm kiếm' button.
- Pagination: 'Trang 1 / 15' + numbered PagedList pager (1..10, …, » next, »» last), above and below table.

## Table columns (exact order)
1. STT
2. [checkbox select-all column]
3. Chi nhánh
4. Tên đăng nhập
5. Tên đầy đủ
6. Điện thoại
7. Email
8. Quyền (role-group name, e.g. Kỹ Thuật / Quản Lý / Tiếp Tân / Điều phối / Admin)
9. Khóa (per-row toggle button: red fa-lock 'Khóa tài khoản' when unlocked, green fa-unlock 'Mở khóa tài khoản' when locked; class ma-lock, data-lock, data-id — one-click lock/unlock via AJAX in user.js)
10. Chọn (edit button linking to /User/Edit?id=N)

## AJAX/endpoints
- List: POST /User/List (AJAX replace #ma-list).
- Create: GET /User/Create (full page). Edit: GET /User/Edit?id=N (full page).
- Lock toggle handled by /Scripts/CategoryCommon/user.js via data-id/data-lock.

## Pagination style
'Trang X / Y' + PagedList numeric pager top and bottom.

**Gaps**

| Severity | Gap |
|---|---|
| high | Per-row one-click lock/unlock account action (Khóa column with lock/unlock toggle button and distinct red/green states) is missing. Local shows a read-only 'Trạng thái' text column; toggling requires opening the edit sheet. |
| medium | Missing column: Điện thoại. Reference order is Chi nhánh, Tên đăng nhập, Tên đầy đủ, Điện thoại, Email, Quyền, Khóa; local order is Tên đăng nhập, Họ tên, Email(hidden), Chi nhánh, Nhóm quyền, Đăng nhập cuối(hidden), Trạng thái. No Điện thoại anywhere in local columns, fields, or filters. |
| medium | User form lacks fields evidenced by reference (user-detail page): Điện thoại and Chi nhánh phụ (multiple secondary branches per user). Local create/edit sheet only has tên đăng nhập, họ tên, password, email, chi nhánh (single), nhóm quyền, active. |
| medium | Bulk selection + bulk delete via checkbox column missing locally. |
| low | Reference uses dedicated /User/Create and /User/Edit pages launched from a header button 'Thêm người dùng'; local uses generic 'Thêm' toolbar button + Sheet. Functional but different navigation pattern. |

### Thông Tin Tài Khoản (/User/Detail, breadcrumb: Trang chủ /Thông tin tài khoản)
- Ref file: `user-detail.html`
- Local counterpart: MISSING

**Ref spec**

## Purpose
Read-only 'Thông tin người dùng' profile page for the logged-in account (reached from the account menu). No table, no filters, no actions.

## Displayed fields (label: value, two-column layout)
- Chi nhánh: (primary branch name)
- Tên đăng nhập: (username)
- Họ và tên: (full name)
- Điện thoại: (phone)
- Email: (email)
- Khóa tài khoản: (lock state, e.g. 'Mỡ' = open)
- Quyền: (role-group name, e.g. Quản Lý)
- Chi nhánh phụ: (comma-separated list of secondary branches — confirms users can belong to multiple extra branches)

## Interactions
None — static display inside admin layout. No inline scripts beyond shared layout scripts.

**Gaps**

| Severity | Gap |
|---|---|
| high | Entire page missing locally. No account-profile route exists (routes.ts has only login and changePassword under Auth). Needs a read-only 'Thông tin tài khoản' page showing Chi nhánh, Tên đăng nhập, Họ và tên, Điện thoại, Email, Khóa tài khoản, Quyền, Chi nhánh phụ, reachable from the user/account menu. |
| medium | The 'Chi nhánh phụ' (secondary branches, plural) concept shown here does not exist in the local NguoiDung data model (single chiNhanhId only). |

### Đổi Mật Khẩu (breadcrumb: Trang chủ / Đổi mật khẩu)
- Ref file: `admin-changepassword.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/auth/ChangePasswordPage.tsx`

**Ref spec**

## Layout
Rendered INSIDE the admin layout (content-wrapper, breadcrumb 'Trang chủ / Đổi mật khẩu'). One box titled 'Đổi mật khẩu' with an offset col-md-7 form column.

## Form (POST /Admin/ChangePassword, plain non-AJAX post)
Fields, in order, all type=password:
1. Mật khẩu cũ (name OldPass)
2. Mật khẩu mới (name NewPass)
3. Nhập lại mật khẩu (name ReNewPass)
Submit button: 'Đổi mật khẩu' (btn-primary btn-flat). No cancel button, no client-side validation beyond server round-trip.

## Interactions
Standard form post; no modals, no table, no pagination.

**Gaps**

| Severity | Gap |
|---|---|
| low | Placement differs: reference is an in-shell admin page with breadcrumb; local renders standalone outside AppShell as a centered card (route /doi-mat-khau). Consider rendering inside the shell to match navigation context. |
| low | Label/button wording differs: 'Nhập lại mật khẩu' vs local 'Xác nhận mật khẩu mới'; submit 'Đổi mật khẩu' vs local 'Lưu mật khẩu'. Local additions (cancel button, zod validation, toast) are enhancements, not gaps. |

### Nhóm Quyền (breadcrumb: Trang chủ / Nhóm quyèn [sic])
- Ref file: `role-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/phan-quyen/NhomQuyenPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/nhom-quyen.config.ts`)

**Ref spec**

## Layout
Two-pane: left col-md-6 #ma-list (role-group list — loaded via AJAX by /Scripts/Account/Role.js, so list markup/columns are NOT in the mirrored HTML; presumably a table of role groups with edit/select actions, endpoint likely /Role/List). Right col-md-6 = persistent form box 'Thông tin nhóm quyền'.

## Right form (POST /Role/Create, AJAX replace #ma-update, callbacks CreatePost/OnComplete)
- Hidden: RoleId, Status, Note.
- Mã (text, name Code)
- Nhóm quyền (text, name RoleName)
- 'Danh sách quyền' — a two-column checkbox TREE (bonsai treeview, name=roleId per node) mirroring the sidebar MENU hierarchy. The role group is granted access to checked menu items. Tree contents (parent → children):
  * Trang chủ
  * Sửa Chữa-Bảo Hành
  * Danh Mục → Quản Lý Khách Hàng, Model, Nhà Kho, Ngăn chứa, Nhóm Hàng Hóa, Hàng Hóa, Nhà Sản Xuất, Sản phẩm, Khu Vực, Thời Hạn, Phí giao, Lỗi sửa chữa, Phường/Xã, Nhóm sản phẩm, Đơn Vị Tính
  * Quản Lý Kho → Nhập Kho, Xem Tồn Kho, Xem Tồn Kho Kỹ Thuật, Thu Hồi Linh Kiện, Xem Tồn Kho LK Xác, Danh sách trả LK xác, DS Trả LK
  * Quản Lý → Quản Lý Chi Nhánh, Quản Lý Người Dùng, Quản Lý Hóa Đơn
  * Xuất Kho → Cấp Linh Kiện Cho Kỹ Thuật, Bán Hàng, Trả Hàng, Chuyển Kho, Trả hàng cho nhà cung cấp
  * Báo Cáo Sửa Chữa → Báo cáo tình trạng kỹ thuật, Báo cáo tình trạng chung, Báo Cáo Máy Tồn, Báo Cáo KPI KTV, Báo Cáo KPI Tiếp tân, Báo cáo SCBH Kỹ thuật
  * Quản Lý Thu Chi → Thanh Toán Công Nợ, Quản Lý Thu Chi
  * Thông Tin Tài Khoản → Thông Tin Tài Khoản, Đổi Mật Khẩu, Đăng Xuất
  * Phân quyền → Menu, Chức Năng, Nhóm Quyền
  * Nhân Sự → Ngân Hàng, Phòng Ban, Chức vụ, Phụ Cấp, Loại Phạt Thưởng, Ứng lương, Nhân Viên, Bảng Lương, Chấm công, Chấm công tổng hợp
  * Sửa Chữa-Bảo Hành KT
- Buttons: 'Lưu' (save), 'Lưu & Thêm mới' (saveNew).

## Interactions
Parent checkbox checks/unchecks children (jquery.qubit via bonsai). Edit from left list populates the form. No modals, no filter bar visible (list pane is AJAX-loaded).

**Gaps**

| Severity | Gap |
|---|---|
| high | Menu-permission assignment tree missing: the core purpose of this page is granting a role group access to menu items via a hierarchical checkbox tree ('Danh sách quyền', ~50 nodes mirroring sidebar). Local NhomQuyenPage is a plain name/description CRUD with no permission assignment UI at all. |
| medium | No 'Lưu & Thêm mới' (save-and-new) action and no persistent side-by-side list+form layout; local uses a Sheet drawer. |
| low | Field naming: reference has Mã (Code) + Nhóm quyền (RoleName); local matches with maNhom/tenNhom and adds moTa/active (reference keeps Note/Status as hidden fields, so this is acceptable). |

### Menu — /RoleMenu/Index (breadcrumb: Trang chủ / Danh mục)
- Ref file: `rolemenu-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/phan-quyen/MenuPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/menu.config.ts`)

**Ref spec**

## Layout
Two-pane: left col-md-7 #ma-list (menu-item list — AJAX-loaded by /Scripts/Account/rolemenu.js + RoleMenu.js; markup not present in mirror, presumably table of menu entries with edit action, endpoint likely /RoleMenu/List). Right col-md-5 = persistent form box 'Thông tin danh mục'.

## Right form (POST /RoleMenu/Create, AJAX replace #ma-update, callbacks CreatePost/OnComplete)
- Hidden RoleMenuId.
- Danh mục cha (text autocomplete #AutoRoleMenu, name RoleMenuParentName + hidden MenuParentId — typeahead parent-menu picker, not a plain select)
- Tên danh mục (text, name Name)
- Link (text, name Link)
- Class icon (text, name Icon — FontAwesome class)
- Số thứ tự (numeric text, name Number)
- 'Danh sách quyền' — LARGE two-column permission-matrix checkbox tree (bonsai treeview, name=roleId, 202 checkboxes): ~41 function groups, each expanding to action leaves. Standard leaves are Xem / Thêm / Sửa / Xóa; special leaves include: Nhập kho → +Xem tồn, Xem phiếu nhập hàng, Xem phiếu bán hàng, Xem danh sách cấp phụ kiện, Xem danh sách cấp linh kiện trạm, Xuât tồn excel; Phiếu sửa chửa → +Điều phối kỹ thuật, Đổi tình trạng, Chuyển chi nhánh, Gửi sms kỹ thuật, Xác nhận, Gửi sms khách hàng, Xuất excel, Xác nhận. Group list: Admin, Chi nhánh, Ngăn chứa, Khách hàng, Khách sửa, Kỳ, Địa điểm, Nhà sản xuất, Model, Hàng hóa, Sản phẩm, Nhóm hàng hóa, Nhập kho, Phiếu sửa chửa, Quyền, Menu, Nhà kho, Bảng Lương, Chức Vụ, Ngân Hàng, Chấm Công, Hình Thức Thu Chi, Hóa Đơn, Loại Phạt Thưởng, Nhân Viên, Phòng Ban, Phụ Cấp, Thời Hạn, Ứng Lương, Người Dùng, Nhà Kho, Cấp Linh Kiện Cho Kĩ Thuật, Cấp Linh Kiện Cho Trạm, Chuyển Kho, Phiếu Trả Hàng, Đơn Hàng, Chứng Từ, Công Nợ, Loại Phát Thưởng, Nhân Viên Phát Thưởng (leaf-only), Nhân Viên Phụ Cấp (leaf-only).
- Inline script: $('.treeview').bonsai({expandAll:false, checkboxes:true, handleDuplicateCheckboxes:true}).
- Buttons: 'Lưu' (save), 'Lưu & Thêm mới' (saveNew).

## Interactions
Selecting a menu item from the left list loads it into the form with its granted function checkboxes; save posts menu metadata + checked roleId[] function permissions together.

**Gaps**

| Severity | Gap |
|---|---|
| high | Permission-matrix tree missing: reference attaches a 202-checkbox function-permission tree (41 groups × Xem/Thêm/Sửa/Xóa + special actions like Điều phối kỹ thuật, Đổi tình trạng, Chuyển chi nhánh, Gửi sms, Xuất excel) to each menu item. Local MenuPage manages only menu metadata (name/url/order/parent/icon/active) with no permission mapping UI. |
| medium | Parent-menu picker: reference uses a typeahead autocomplete (Danh mục cha) allowing any menu as parent; local select only offers root-level menus as parent options. |
| low | Page title/breadcrumb: reference calls this page 'Danh mục' (menu catalog) under Phân quyền; local titles it 'Menu'. Also no 'Lưu & Thêm mới' / persistent side form locally. |

### Chức Năng — /RoleFunction/Index (live server returned HTTP 500)
- Ref file: `rolefunction-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/phan-quyen/ChucNangPage.tsx` (config: `/home/hale/code/phongthanh-admin/src/config/crud-configs/chuc-nang.config.ts`)

**Ref spec**

## Status
The mirrored page is an ASP.NET yellow-screen error: 'The partial view Create was not found' thrown from Views/RoleFunction/Index.cshtml line 18 (@{Html.RenderAction("Create", "RoleFunction");}). The page is BROKEN on the live legacy server — no UI spec can be extracted directly.

## What can be inferred
- From the error source snippet: layout is the same two-pane pattern as Role/RoleMenu — a list pane plus '<div id="ma-update-rolefunction" class="col-md-4 ma-update ma-update-rolefunction">' right pane that would host a RoleFunction/Create form (the missing partial).
- From rolemenu-index.html's permission tree, RoleFunction records are the leaves/groups of that tree: a function has a group/entity (e.g. 'Chi nhánh', 'Phiếu sửa chửa') and an action name (Xem/Thêm/Sửa/Xóa/Điều phối kỹ thuật/Đổi tình trạng/Chuyển chi nhánh/Gửi sms kỹ thuật/Xác nhận/Gửi sms khách hàng/Xuất excel/Xem tồn/…), forming a parent-child hierarchy (group rows with action children), each with a roleId used by the RoleMenu matrix.
- Expected list endpoint /RoleFunction/List and create/edit via right-pane form with 'Lưu' / 'Lưu & Thêm mới', consistent with sibling pages.

**Gaps**

| Severity | Gap |
|---|---|
| low | Reference page is broken (HTTP 500 — missing Create partial), so an exact column/field comparison is impossible. Local ChucNangPage (mã/tên chức năng, menu lookup, mô tả, trạng thái CRUD) is a reasonable stand-in and cannot be judged wrong against a broken page. |
| medium | Data-model mismatch inferable from rolemenu tree: legacy functions are hierarchical (entity group → action leaves such as Xem/Thêm/Sửa/Xóa/special actions) and their ids feed the RoleMenu permission matrix. Local ChucNang is a flat list linked to a menuId with no parent/child structure and no action taxonomy, so it cannot back a faithful permission-matrix rebuild. |

## Group summary

Compared 7 legacy admin/permission/account pages against the React rebuild. Branch and User list pages exist locally but with materially different column sets and missing workflows: Chi Nhánh lacks Hotline/Người liên hệ/Email/Chính/Chuyển CN columns, the Toạ độ + main/transfer-flag form fields, the Google-Maps 'Bản đồ chi nhánh' modal, and bulk delete; Người Dùng lacks the one-click Khóa/Mở khóa row toggle, Điện thoại column, and Chi nhánh phụ (multi-branch) concept. /User/Detail (Thông Tin Tài Khoản) has no local counterpart at all — highest-priority missing page. Đổi Mật Khẩu is functionally complete (only placement/label diffs). The three permission pages are the biggest functional gap: legacy Nhóm Quyền assigns menu access via a ~50-node checkbox tree, and legacy Menu (/RoleMenu) attaches a 202-checkbox function-permission matrix (41 entity groups × Xem/Thêm/Sửa/Xóa + special actions) to each menu item — locally all three are plain metadata CRUD tables with zero permission-assignment UI. /RoleFunction/Index is broken on the live server (HTTP 500, missing Create partial); its shape was inferred from the RoleMenu tree: hierarchical entity→action function records, unlike the local flat ChucNang list. Unresolved: left-pane list markup for Role and RoleMenu pages is AJAX-loaded and absent from the mirror, so their exact list columns are unknown.

## Addendum — verified from mirrored partials (260703)

### ajax-Role-List.html (POST /Role/List → #ma-list, success ListPost)
Resolves: "left-pane list markup for Role ... AJAX-loaded and absent from the mirror, exact list columns unknown" (group summary) and Nhóm Quyền section note "list markup/columns are NOT in the mirrored HTML; presumably a table of role groups with edit/select actions, endpoint likely /Role/List" — endpoint confirmed POST /Role/List.

- Box title: 'Danh sách nhóm quyền'. Header tools: search input `keySearch` placeholder 'Search' + fa-search button; rows-per-page `numberRow` 20/30/50/100/150/200/300.
- Toolbar (mailbox-controls): refresh (fa-refresh, tooltip 'Tải lại trang'); bulk delete (red fa-close, class ms-delete, tooltip 'Xóa', data-root="Model" — legacy copy-paste, acts on checked rows); green 'Lọc' submit button.
- Table columns (exact order): 1. `##` (STT) 2. [checkbox select-all, tooltip 'Chọn tất cả'] 3. Mã 4. Nhóm quyền 5. Chọn.
- Per-row actions (Chọn column): blue VIEW button (fa-eye, class `ms-view-role`, data-id — view role's granted permissions) + edit button (fa-edit, class `ma-edit`, data-id → loads into right form).
- Pagination: 'Trang 1 / 1' + PagedList pager, above AND below table. No totals row.
- Seed data: 7 groups — ketoan/Kế Toán, dieuphoi/Điều phối, kho/Kho, kythuat/Kỹ Thuật, tieptan/Tiếp Tân, quanly/Quản Lý, admin/Admin.

### ajax-RoleMenu-List.html (POST /RoleMenu/List → #ma-list, success ListPost)
Resolves: "left-pane list markup for RoleMenu ... absent from the mirror" (group summary) and Menu section note "markup not present in mirror ... endpoint likely /RoleMenu/List" — endpoint confirmed POST /RoleMenu/List.

- Box title: 'Danh sách danh mục'. Same header tools (`keySearch` 'Search', `numberRow` 20–300).
- Toolbar: refresh 'Tải lại trang'; bulk delete ms-delete 'Xóa' (data-root="RoleFunction" — legacy copy-paste); FILTER: 'Danh mục cha' typeahead autocomplete (#AutoRoleMenu, name RoleMenuParentName + hidden MenuParentId) to filter list by parent menu; green 'Lọc' button.
- Table columns (exact order): 1. `##` 2. [checkbox select-all 'Chọn tất cả'] 3. Tên danh mục 4. Danh mục cha 5. Icon (FontAwesome class shown as text, e.g. 'fa fa-close') 6. Link (e.g. '/DonViTinh/Index') 7. Number (thứ tự; can be empty for root items like 'Sửa Chữa-Bảo Hành KT') 8. Chọn.
- Per-row action: edit only (fa-edit, `ma-edit`, data-id). No view/delete per row.
- Pagination: 'Trang 1 / 4' + PagedList pager (1..4, » next), above AND below table. No totals row.

### trimmed/user-detail.html (/User/Detail)
Verifies prior ref spec unchanged — read-only box 'Thông tin người dùng', breadcrumb 'Trang chủ /Thông tin tài khoản', 4 two-column form-group rows: Chi nhánh / Tên đăng nhập; Họ và tên / Điện thoại; Email / Khóa tài khoản (value 'Mỡ'); Quyền / Chi nhánh phụ (multiple comma-separated spans, sample shows 3 branches — confirms multi-secondary-branch model). No form, no actions, no endpoints beyond shared layout. Existing gaps (page missing locally; Chi nhánh phụ absent from local model) stand; no new gaps from this file.

### New gaps vs local (from verified list markup)

| Severity | Gap |
|---|---|
| medium | Nhóm Quyền list: per-row VIEW action (fa-eye `ms-view-role`) to inspect a role group's granted permissions is missing locally — NhomQuyenPage (CrudTablePage) has only edit/delete, no read-only permission view. |
| medium | Menu list: 'Danh mục cha' typeahead autocomplete filter in list toolbar missing locally — menu.config.ts filters are only Tên menu / Đường dẫn text inputs; cannot filter menu items by parent. |
| low | Nhóm Quyền list columns verified as ##(STT), Mã, Nhóm quyền; local shows Mã nhóm, Tên nhóm quyền, Mô tả, Trạng thái with no STT — extra columns are local inventions (moTa/active absent from ref list). |
| low | Menu list: Icon column visible in ref (FontAwesome class text); local `icon` column exists but hidden:true. Ref also has no Trạng thái column (local invention). |
| low | Bulk select-all checkbox column + toolbar bulk delete ('Xóa') present on both Role and RoleMenu lists; missing on local NhomQuyenPage and MenuPage (per-row delete only). |
