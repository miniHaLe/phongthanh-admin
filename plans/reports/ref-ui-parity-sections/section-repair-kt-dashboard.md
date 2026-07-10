# UI Parity — Group: repair-kt-dashboard

### Danh sách phiếu sửa chữa (Sửa Chữa-Bảo Hành KT — /RepairingM/Index)

- Ref file: `/tmp/ptref/trimmed/repairingm-index.html`
- Local counterpart: MISSING

**Ref spec**

## Page
- Sidebar menu label: "Sửa Chữa-Bảo Hành KT" (separate menu entry from the admin "Sửa Chữa-Bảo Hành" at /Repairing/Index_8). This is the TECHNICIAN-scoped repair ticket list.
- Content header: breadcrumb `Trang chủ / Danh sách phiếu sửa chữa`; box title: **Danh sách Phiếu sửa chữa** (fa-list icon).

## Search form (fieldset "Thông tin tìm kiếm")
- Whole page is one form: `POST /RepairingM/List` via unobtrusive AJAX (`data-ajax=true`, mode=replace, update=`#table-update`, begin=`ajaxBegin`, success=`ListSeacrhPost`) — result HTML replaces the table block.
- Toggle button (btn-warning, fa-plus-square, tooltip "Nhấn để search", `data-ghim=true` pin behavior) collapses/expands the `.colspan-search` filter panel.
- Filter fields (all col-md-2, in order):
  1. `RepairingCode` — text, placeholder "Số phiếu SC"
  2. `RepairingNumber` — text, placeholder "Số phiếu hãng"
  3. `Serial` — text, placeholder "Số Serial"
  4. `CustomerName` — text, placeholder "Tên khách hàng"
  5. `Phone` — text, placeholder "Điện thoại"
  6. `AutoManufactory` — autocomplete text "Tên nhà sản xuất" → hidden `ManufactoryId`
  7. `AutoProductStatus` — autocomplete text "Sản phầm" → hidden `ProductStatusId`
  8. `AutoModel` — autocomplete text "Model" → hidden `ModelId`
  9. `RepairingStatusId` — select "Tình trạng", KT-scoped 10-option subset with per-option colors: Đã Điều Phối (2, #00CCFF), Báo Giá (4, #9966CC), Chờ Báo Giá (15, #31065c), Chờ Xác Nhận (6, #996600), Chờ Linh Kiện (7, #4B0082), Đã Có Linh Kiện (13, #6D5582), Đã Đặt Linh Kiện (17, #112233), Chờ Phiếu Hãng (16, #06385c), Trả Lại (8, #CC3300), Sửa Xong (9, #3300FF). NOTE: deliberately excludes Mới Nhận (1), Hỏng Khách Trả Lại (11), Đã Giao Cho Khách (10), Đã Giao Phiếu Hủy (12), Đã Giao Ngoài (14) which exist on the admin list — KT view only shows tickets in the workshop pipeline.
  10. `WarrantyType` — select "Hình thức chung": Bảo hành (1), Sửa dịch vụ (3), BH sửa chữa (2)
  11. `AutoTinh` — autocomplete "Tên Tỉnh" → hidden `TinhId`
  12. `AutoQuan` — autocomplete "TP/Huyện" → hidden `QuanId`
- Buttons: **Tìm kiếm** (btn-success, fa-search, submits AJAX form, class `ms-search-btn`) and **Tải lại trang** (btn-default link to `Index`).

## Table (`#table-update`, width 1250px, striped/bordered/hover, colResizable minWidth 100)
Exact VI headers in order (14 cols):
1. `#` (tooltip "Trạng thái" — status indicator cell)
2. `#` (tooltip "Hành động" — row-action buttons cell, `.ms-abtn` styling implies stacked buttons/links)
3. `Phiếu sửa chữa`
4. `Khách hàng`
5. `Thông tin sản phẩm`
6. `Kỹ thuật`
7. `Loại SC`
8. `Chi phí`
9. `Ngày nhận`
10. `Ngày giao`
11. `Chi tiết SC`
12. `Ghi chú`
13. `Người nhận`
14. `Khu vực`
(tbody empty in mirror — rows come from POST /RepairingM/List.)

## Toolbar / pagination
- No create/print toolbar buttons in the KT view (unlike admin list) — read/update oriented.
- Pagination blocks ABOVE and BELOW table: label `Tổng: N dòng, Trang x / y` (blue) + numbered `ul.pagination`; hidden `pageNumber` input with class `ms-paging-page` posts page changes back through the same AJAX form.

## Scripts / interactions
- `/Scripts/CategoryCommon/repairing-m.js` — page controller (row actions, autocompletes, paging). External file not mirrored, so exact per-row action handlers unknown; the Hành động column exists.
- `/Scripts/canvasResize/*` + `/Scripts/CategoryCommon/repairing-UpdateImage.js` — client-side image resize + upload: technicians attach/update repair photos from a row/modal.
- Layout modals available: `#MyModal` / `#MyModal1` (generic empty shells filled via AJAX .load for detail/edit dialogs), `#MyModal2` "Bản đồ chi nhánh" (Google Maps + Places search box, branch map).
- SignalR `CallCenterHub` (layout-level): incoming call → toastr toast "Có cuộc gọi mới !" with "Tiếp nhận" button → `window.open('/repairing/repairingcustomer?id=..&num=..')`; answered event auto-opens the same URL; desktop Notification API; `closeEvent` re-clicks `.ms-search-btn` to refresh the list on Index_8 pages.
- `.block-status-hm` absolute-overlay CSS — status cell is a full-height colored overlay block.

**Gaps**

| Severity | Gap |
|---|---|
| high | Entire page MISSING locally. No technician-scoped repair list (RepairingM) exists: src/constants/routes.ts has only repairList (/sua-chua-bao-hanh, admin list at src/features/repair-list/RepairListPage.tsx); nav-config.tsx has one 'Sửa Chữa-Bảo Hành' entry, no 'Sửa Chữa-Bảo Hành KT'. The KT view is a distinct primary workflow: technician sees only workshop-pipeline tickets (status subset excluding Mới Nhận and all Đã Giao states) with update-oriented actions. |
| high | Column set differs from the local admin repair table (nearest reusable base, use-repair-table-columns.tsx). Reference KT columns not present locally: 'Khu vực' (region), 'Loại SC' (vs local 'Hình thức'), 'Ngày giao' (delivery date; local has 'Ngày HT' hoàn thành), 'Chi tiết SC' (repair-detail text; local has 'Mô tả lỗi'), plus a dedicated 'Hành động' action-button column and a separate status-indicator '#' column. A KT page built by reusing the local column hook would need these additions. |
| high | KT-scoped status filter missing: reference restricts 'Tình trạng' to 10 in-workshop statuses (Đã Điều Phối, Báo Giá, Chờ Báo Giá, Chờ Xác Nhận, Chờ Linh Kiện, Đã Có Linh Kiện, Đã Đặt Linh Kiện, Chờ Phiếu Hãng, Trả Lại, Sửa Xong). Local REPAIR_STATUSES multi-select exposes the full status universe with no role-scoped subset concept. |
| medium | Repair-photo upload/update workflow (canvasResize + repairing-UpdateImage.js) has no local counterpart — technicians update ticket images from this list; local repair list/detail has no image attach/update action. |
| medium | 'Hình thức chung' (WarrantyType) filter option list differs: reference = Bảo hành / Sửa dịch vụ / BH sửa chữa (3 values); local RepairFiltersAdvanced HINH_THUC_OPTIONS = bao_hanh / sua_chua / sua_chua_tai_nha / tu_van — 'BH sửa chữa' and 'Sửa dịch vụ' semantics not represented. |
| medium | Incoming-call (SignalR CallCenterHub) toast with 'Tiếp nhận' action opening /repairing/repairingcustomer?id=&num= is a layout-level feature active on this page; no local equivalent (global concern, not KT-specific). |
| low | Cosmetic/secondary: pagination rendered both above and below table with 'Tổng: N dòng, Trang x / y' label; collapsible search panel toggled by a pin-able btn-warning button; 'Tải lại trang' full-reload button; column resize disabled via colResizable. Local DataTable pattern covers these differently (single bottom pagination, always-visible quick strip). |

### Trang chủ (/Admin/Index — plan calendar home)

- Ref file: `/tmp/ptref/trimmed/admin-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/DashboardPage.tsx`

**Ref spec**

## Page
- H1: **Trang chủ**. Hidden input `clientId` (value 8) used by scripts.
- Single full-width box `#img_time_day` (min-height 500px) — id implies a time-of-day background IMAGE is applied by script (box title and message are styled white `color:#fff` to sit on the image).
- Inside, a `#birthday` wrapper containing:
  - Box title: **Kế hoạch của bạn** (`b#time_day`, fa-list icon, white text) — title text/id suggest it is rewritten by script per time of day.
  - Centered `h1#mess` (white, initially empty) — greeting / birthday message injected by JS.
  - `col-md-9` → `div#calendar`: a **FullCalendar** month calendar (fullcalendar.min.css loaded at top of content). Inline script contains only a commented-out sample: an events array with title/id/start/end/backgroundColor(#f39c12)/borderColor and a commented `LoadCalendar("calendar", even)` call — `LoadCalendar` lives in the app bundle; real events are injected server-side/bundle-side (endpoint not visible in mirror). Events represent the user's personal plan/schedule entries.
  - Empty `col-md-5` spacer column.
- No KPI tiles, no charts, no tables, no toolbar, no filters — the ENTIRE reference home page is the plan calendar + greeting.

## Layout-level items present on this page
- Modals: `#MyModal`, `#MyModal1` (generic AJAX-filled shells), `#MyModal2` "Bản đồ chi nhánh" (Google Maps with Places `#pac-input` search box).
- Google Maps JS API loaded.
- SignalR `CallCenterHub` call-center integration: on 'ringing' shows persistent toastr "Có cuộc gọi mới !" with caller name/number and a 'Tiếp nhận' button → `window.open('/repairing/repairingcustomer?id=..&num=..')`; 'answered' auto-opens that URL; 'ending' removes the toast; also fires a desktop Notification whose click opens the same URL; extension-based filtering using `clientId`.
- Footer: 'Version 1.0.0 / Copyright 2026 Phần Mềm Quốc Bảo'.

**Gaps**

| Severity | Gap |
|---|---|
| medium | Concept swap (documenting per task instruction): reference home is a personal plan calendar page — FullCalendar '#calendar' under heading 'Kế hoạch của bạn', a greeting/birthday message h1#mess, and a time-of-day background image (#img_time_day) — with NO KPI content. Local DashboardPage.tsx is a KPI work-queue dashboard (GreetingBanner, WorkQueueTiles, TodayReceiptsTile, StatusDistributionChart, LowStockAlert, BranchCountsTable, RecentTicketsTable, QuickLapPhieuButton FAB). The plan-calendar widget ('Kế hoạch của bạn' with colored plan events) has no local counterpart anywhere (only src/components/ui/calendar.tsx, a shadcn date-picker, exists). If the calendar is a valued workflow, it needs a new widget/page; if the KPI dashboard is an accepted redesign, record the calendar as intentionally dropped. |
| low | Greeting differences: reference injects a personalized (birthday) message into h1#mess and swaps a time-of-day background image with white-on-image styling; local GreetingBanner is a static-styled greeting without birthday logic or time-of-day imagery. |
| medium | Layout-level features active on the reference home with no local equivalent: SignalR call-center incoming-call toasts + desktop notifications opening /repairing/repairingcustomer, and the 'Bản đồ chi nhánh' Google Maps modal (#MyModal2). Global concerns shared across all pages, listed here because the home page is where users idle and receive calls. |

## Group summary

Analyzed 2 reference pages. (1) /RepairingM/Index 'Sửa Chữa-Bảo Hành KT' — technician-scoped repair ticket list: AJAX POST /RepairingM/List, collapsible 12-field search (code/hãng/serial/customer/phone/manufacturer/product/model autocompletes, KT-scoped 10-status select, warranty-type, tỉnh/quận), 14-column table (status + action cols, Phiếu sửa chữa … Khu vực), dual top/bottom pagination, photo-upload workflow (canvasResize), branch-map modal, SignalR call-center toasts. NO local counterpart exists — page entirely missing; nearest base is src/features/repair-list/* but with different column set (missing Khu vực, Ngày giao, Chi tiết SC, action column), no KT status subset, and different warranty-type options. (2) /Admin/Index home — NOT a KPI dashboard: it is a personal plan calendar ('Kế hoạch của bạn', FullCalendar with colored events) plus birthday greeting h1#mess and time-of-day background image. Local DashboardPage.tsx is a completely different KPI work-queue concept; the plan calendar widget is missing locally. Layout-level gaps noted once: SignalR incoming-call toasts opening /repairing/repairingcustomer and Google Maps branch-map modal.
