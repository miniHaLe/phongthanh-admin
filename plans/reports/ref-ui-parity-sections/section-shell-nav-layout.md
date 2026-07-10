# UI Parity — shell-nav-layout

### Trang chủ (full layout shell: header, sidebar, footer, global modals, SignalR call-center)

- Ref file: `/tmp/pt-index.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/components/shell/` (AppShell.tsx, Sidebar.tsx, TopBar.tsx, NavItem.tsx, UserMenu.tsx, NotifBadge.tsx, CommandPalette.tsx, SidebarDrawer.tsx) + `/home/hale/code/phongthanh-admin/src/config/nav-config.tsx` + `/home/hale/code/phongthanh-admin/src/pages/DashboardPage.tsx`

**Ref spec**

# Reference shell spec (AdminLTE 2, skin-blue, sidebar-mini)

## Header (main-header)
- Logo link -> /Admin/Index; logo-mini img small_logo.png (50x50), logo-lg img logo_vn.png. Sidebar-toggle hamburger (data-toggle=offcanvas).
- Right navbar widgets, in order:
  1. **Notification bell** (fa-bell-o + red count badge `.ms-count-view`, starts 0). Dropdown (450px, lemonchiffon bg): header row with "Đánh dấu tất cả là đã đọc" action; `<ul class=menu>` populated dynamically (via /Scripts/custom.js, tied to RepairingStatusHistory); footer link "Danh sách" -> /RepairingStatusHistory/Index (target=_blank). Bell rings (#ring-bell).
  2. **News/messages dropdown** (fa-envelope-o + blue count badge `.ms-count-view-news`). Dropdown (450px): header "Đánh dấu tất cả là đã đọc" action; menu items each have: per-item fa-check "Đánh dấu là đã xem" icon (data-target=newsId, tooltip), link (target=_blank) -> /News/Detail?idt={newsId}&uid={userId}&id={repairId}, item shows H4 title "1. SUPOR, 20180829-8200" + small meta (fa-user author, fa-clock-o datetime) + body text (unread items bold via .is-view); footer "Danh sách" -> /News/Index.
  3. **Support dropdown** (fa-question): panel 355px titled "Thông tin liên hệ hỗ trợ:" (contact info body empty in this capture).
  4. **User dropdown**: user-image avatar + display name "Van khoa"; menu: user-header (avatar img-circle + phone "0933968041-"), user-footer with left btn "Đổi Mật Khẩu" -> /Admin/ChangePassword and right btn "Đăng xuất" -> /Admin/Logout?Length=5.

## Sidebar (main-sidebar, accordion treeview)
- **User panel**: avatar img-circle + name "Van khoa" + "(fa-circle text-success) Online" link.
- Section header label: "Danh mục chính".
- **Exact top-level order + children (icon | href):**
  1. Trang chủ (fa-home) -> /Admin/Index
  2. Sửa Chữa-Bảo Hành (fa-gears) -> /Repairing/Index_8
  3. Sửa Chữa-Bảo Hành KT (fa-gears) -> /RepairingM/Index
  4. Quản Lý Thu Chi (fa-circle-o) [group]
     - Quản Lý Thu Chi (fa-circle-o) -> /ChungTu/Index
     - Thanh Toán Công Nợ (fa-circle-o) -> /CongNo/Index
  5. Danh Mục (fa-dedent) [group]
     - Quản Lý Khách Hàng (fa-user) -> /Customer/Index
     - Model (fa-barcode) -> /Model/Index
     - Nhà Kho (fa-database) -> /WarehouseLocation/Index
     - Ngăn chứa (fa-server) -> /Cabinet/Index
     - Nhóm Hàng Hóa (fa-gg-circle) -> /ProductType/Index
     - Hàng Hóa (fa-gift) -> /Product/Index
     - Nhà Sản Xuất (fa-maxcdn) -> /Manufactory/Index
     - Sản phẩm (fa-suitcase) -> /ProductStatus/IndexNew
     - Khu Vực (fa-map) -> /Location/Index
     - Phường/Xã (fa-map) -> /Xa/Index
     - Thời Hạn (fa-clock-o) -> /TimeWarranty/Index
     - Phí giao (fa-circle-o) -> /PhiGiao/Index
     - Đơn Vị Tính (fa-close) -> /DonViTinh/Index
     - Nhóm sản phẩm (fa-close) -> /NhomSanPham/Index
     - Lỗi sửa chữa (fa-close) -> /LoiSuaChua/Index
  6. Quản Lý Kho (fa-database) [group]
     - Nhập Kho (fa-sign-in) -> /Receiving/Index
     - Xem Tồn Kho (fa-pencil-square-o) -> /ViewInventory/Index
     - Xem Tồn Kho LK Xác (fa-pencil-square-o) -> /ViewInventory/IndexXac
     - Xem Tồn Kho Kỹ Thuật (fa-pencil-square-o) -> /TechViewInventory/Index
     - Thu Hồi Linh Kiện (fa-share-alt) -> /CheckOutForTech/DSCapLK
     - DS Trả LK (fa-share-alt) -> /CheckOutForTech/DSTraLK
     - Danh sách trả LK xác (fa-share-alt) -> /CheckOutForTech/DSTraLKXac
  7. Quản Lý (fa-th-list) [group]
     - Quản Lý Chi Nhánh (fa-map-marker) -> /Branch/Index
     - Quản Lý Người Dùng (fa-street-view) -> /User/Index
     - Quản Lý Hóa Đơn (fa-file-text) -> /Invoice/Index
  8. Xuất Kho (fa-sign-out) [group]
     - Cấp Linh Kiện Cho Kỹ Thuật (fa-share-alt) -> /CheckOutForTech/Index
     - Bán Hàng (fa-arrows-alt) -> /SellingProduct/Index
     - Trả Hàng (fa-reply-all) -> /ReturnProduct/Index
     - Chuyển Kho (fa-random) -> /MovingInventory/Index
     - Trả hàng cho nhà cung cấp (fa-mail-reply) -> # (dead link, no page)
  9. Nhân Sự (fa-group) [group]
     - Ngân Hàng (fa-bank) -> /NganHang/Index
     - Phòng Ban (fa-circle-o) -> /PhongBan/Index
     - Chức vụ (fa-circle-o) -> /ChucVu/Index
     - Phụ Cấp (fa-circle-o) -> /PhuCap/Index
     - Loại Phạt Thưởng (fa-circle-o) -> /LoaiPhatThuong/Index
     - Ứng lương (fa-circle-o) -> /UngLuong/Index
     - Nhân Viên (fa-user) -> /NhanVien/Index
     - Bảng Lương (fa-money) -> /BangLuong/Index
     - Chấm công (fa-money) -> /ChamCong/Index
     - Chấm công tổng hợp (fa-circle-o) -> /ChamCong/TongHop
  10. Báo Cáo Sửa Chữa (fa-area-chart) [group]
     - Báo cáo tình trạng kỹ thuật (fa-odnoklassniki) -> /ReportStatusTechnician/ReportStatusTechnician
     - Báo cáo tình trạng chung (fa-odnoklassniki-square) -> /ReportRepairing/RepairingReportStatus
     - Báo Cáo Máy Tồn (fa-hourglass-3) -> /BaoCaoBaoHanh/BaoCaoMayTon
     - Báo Cáo KPI KTV (fa-circle-o) -> /BaoCaoBaoHanh/BaoCaoKPIKTV
     - Báo Cáo KPI Tiếp tân (fa-circle-o) -> /BaoCaoBaoHanh/BaoCaoKPITN
     - Báo cáo SCBH Kỹ thuật (fa-circle-o) -> /BaoCaoChiPhiBaoHanh/RepairingReportChiPhi8
  11. Thông Tin Tài Khoản (fa-user-secret) [group]
     - Thông Tin Tài Khoản (fa-circle-o) -> /User/Detail
     - Đổi Mật Khẩu (fa-circle-o) -> /Admin/ChangePassword
     - Đăng Xuất (fa-circle-o) -> /Admin/Logout
  12. Phân quyền (fa-user-secret) [group]
     - Nhóm Quyền (fa-circle-o) -> /Role/Index
     - Menu (fa-circle-o) -> /RoleMenu/Index
     - Chức Năng (fa-circle-o) -> /RoleFunction/Index
- A second `<section class="sidebar hide">` duplicates an older menu (hidden legacy markup with malformed `< i` tags; includes items like /ProductError/Index "Lỗi Sản Phẩm", /Repairing/Index) — dead code, ignore for parity.

## Content area (home page body)
- H1 "Trang chủ"; hidden input #clientId value=8.
- Single full-width box #img_time_day (min-height 500px) titled (fa-list) "Kế hoạch của bạn" (#time_day), #mess H1 placeholder, and a FullCalendar div #calendar (col-md-9). Calendar populated elsewhere (LoadCalendar helper commented out in this capture; fullcalendar.min.css loaded).

## Footer (main-footer)
- Right: "Version 1.0.0". Left: "Copyright © 2026 Phát triển bởi Phần Mềm Quốc Bảo" -> window.open('http://www.phanmemquocbao.com').

## Global modals
- #MyModal (modal-1) and #MyModal1: empty generic shells (title + body #BodyMyModal1) filled via AJAX .load() by feature pages.
- #MyModal2 "Bản đồ chi nhánh": 80% width, Google Maps container #BodyMyModal2 + Places search box #pac-input ("Search Box"); Google Maps JS API loaded with places library.

## SignalR call-center (inline script)
- Connects to CallCenterHub (jquery.signalR-2.2.2 + /signalr/hubs). toastr configured sticky (timeOut 0, newestOnTop).
- `addDiagnosisMessage(name, number, id, eve)`: extension filtering logic (strips last 3 digits as extension; suppresses internal/short numbers and calls routed to other extensions).
  - eve="ringing": toastr.success "Có cuộc gọi mới !" with `<h3>{name} - {number}</h3>` + button "(fa-phone) Tiếp nhận" (.listen-call, data-id/data-num) if id>0 or id==-1; toastr.error variant "Không xác định - {number}" for unknown caller. Also fires desktop Notification ("Có cuộc gọi từ: name - phone"; click opens intake).
  - "Tiếp nhận" click -> window.open('/repairing/repairingcustomer?id={id}&num={number}') and removes toast.
  - .deny-call button -> POST /api/CallCenter/CallRing {event:"ending", value:{fromnumber, extension, userid}}.
  - eve="answered": removes toast, auto-opens /repairing/repairingcustomer?id&num. eve="ending": removes toast.
- `closeEvent("close")`: if current page is Repairing Index_8, re-clicks .ms-search-btn (refresh list) and refocuses opener.
- Requests Notification.requestPermission on DOMContentLoaded.

## Local shell (for diff)
- Flat sidebar (no accordion): brand "Phong Thành" text, PRIMARY_NAV [Trang chủ, Sửa Chữa-Bảo Hành, Khách Hàng, Quản Lý Kho, Xuất Kho, Tài Chính, Báo Cáo] + separator + ADMIN_NAV [Danh Mục, Nhân Sự, Quản Lý, Phân Quyền]; children rendered as per-section tab strips on section pages, not in sidebar. Collapse toggle w-16/w-60; mobile Sheet drawer.
- TopBar: hamburger (mobile), Search/⌘K command palette trigger, NotifBadge (mock 3 items, no mark-read, no list link), BranchSwitcher, ThemeToggle, UserMenu (avatar PT; name+role label; Đổi mật khẩu; Đăng xuất->login).
- CommandPalette: ⌘K, screens from NAV_ITEMS + dynamic actions + theme toggle.
- No footer, no global modals, no SignalR/call-center, no news dropdown, no support dropdown, no sidebar user-panel.
- Home = DashboardPage (KPI work-queue tiles, status chart, low-stock alerts, recent tickets, FAB) — not a calendar.

## Ordering/grouping/labeling diffs (ref -> local)
- Ref order: Trang chủ, SC-BH, SC-BH KT, Quản Lý Thu Chi, Danh Mục, Quản Lý Kho, Quản Lý, Xuất Kho, Nhân Sự, Báo Cáo Sửa Chữa, Thông Tin Tài Khoản, Phân quyền. Local: frequency-ranked flat with primary/admin split (intentional IA redesign).
- "Quản Lý Thu Chi" renamed "Tài Chính" and absorbs "Hóa đơn" (ref has Invoice under "Quản Lý"; local /quan-ly/hoa-don redirects to finance).
- "Quản Lý Khách Hàng" promoted from Danh Mục child to top-level "Khách Hàng".
- "Báo Cáo Sửa Chữa" renamed "Báo Cáo" with a different child set (local: KPI, Phiếu sửa chữa, Kỹ thuật, Tiếp nhận, Xuất kho, Doanh thu, Bảo hành vs ref's 6 specific reports).
- "Thông Tin Tài Khoản" group dropped (partially covered by UserMenu).

**Gaps**

| Severity | Gap |
|---|---|
| high | Nav/route for 'Sửa Chữa-Bảo Hành KT' (/RepairingM/Index — technician-side repair board) missing entirely: no ROUTES entry, no nav item, no page. In ref it is a top-level primary menu item. |
| high | SignalR call-center integration missing: no incoming-call toast ('Có cuộc gọi mới !' with 'Tiếp nhận' button opening repair intake /repairing/repairingcustomer?id&num), no deny-call POST /api/CallCenter/CallRing, no desktop Notification, no auto-open on 'answered', no list-refresh closeEvent. This is the reception workflow's primary entry trigger. |
| high | Notification bell not wired to RepairingStatusHistory: ref has 'Đánh dấu tất cả là đã đọc' (mark all read), dynamically loaded status-change items, and footer 'Danh sách' link to /RepairingStatusHistory/Index (a full listing page that has no local route/page). Local NotifBadge is 3 hardcoded mock items with no mark-read and no list page. |
| high | News/messages dropdown (fa-envelope-o) missing entirely: unread count badge, per-item 'Đánh dấu là đã xem' check action, bold unread styling, item links to /News/Detail?idt&uid&id, footer 'Danh sách' -> /News/Index. No local news routes/pages/header widget exist. |
| medium | Sidebar group 'Quản Lý Kho' missing child 'Danh sách trả LK xác' (/CheckOutForTech/DSTraLKXac): no local route or nav child (local has only ds-tra-lk and ton-kho-lk-xac). |
| medium | 'Thông Tin Tài Khoản' account-info page (/User/Detail) missing: ref exposes it both as a sidebar group and menu item; local UserMenu has only Đổi mật khẩu + Đăng xuất, no profile/account detail page or route. |
| medium | Global 'Bản đồ chi nhánh' Google Maps modal (#MyModal2 with Places search box #pac-input) missing — no map component anywhere locally (branch map is opened from Branch management in the legacy app). |
| medium | Support/contact dropdown (fa-question, 'Thông tin liên hệ hỗ trợ:') missing from local TopBar. |
| medium | Report menu child set differs from ref: ref's 'Báo Cáo Máy Tồn', 'Báo cáo tình trạng chung', 'Báo cáo SCBH Kỹ thuật', and split 'KPI KTV'/'KPI Tiếp tân' have no 1:1 local nav children (local: KPI, Phiếu sửa chữa, Kỹ thuật, Tiếp nhận, Xuất kho, Doanh thu, Bảo hành). Needs mapping decision in reports group. |
| medium | Home page content differs: ref home is a FullCalendar 'Kế hoạch của bạn' plan/schedule calendar; local DashboardPage is a KPI work-queue dashboard with no calendar. Likely intentional redesign, but the personal-plan calendar feature has no local equivalent. |
| low | Sidebar user-panel (avatar + user name + 'Online' status) missing — local sidebar shows only 'Phong Thành' brand text (ref also has logo images small/large linking home). |
| low | Footer missing: ref shows 'Version 1.0.0' + 'Copyright © ... Phần Mềm Quốc Bảo' link; local AppShell has no footer. |
| low | User dropdown content diff: ref shows user's phone number in the header panel; local shows mock name + role. Ref labels 'Đổi Mật Khẩu'/'Đăng xuất' as side-by-side flat buttons vs local stacked menu items. |
| low | Nav item 'Trả hàng cho nhà cung cấp' (Xuất Kho group; dead '#' link in ref) absent locally — placeholder only in legacy, safe to skip or stub. |
| low | Sidebar section header label 'Danh mục chính' not rendered locally; accordion treeview grouping replaced by flat sidebar + per-section tab strips and primary/admin separator (documented intentional IA decision in nav-config comments). |
| low | Labeling diffs: 'Quản Lý Thu Chi' -> 'Tài Chính'; 'Báo Cáo Sửa Chữa' -> 'Báo Cáo'; 'Quản Lý Khách Hàng' -> 'Khách Hàng' (promoted); Invoice moved from 'Quản Lý' to Finance (redirect kept). |

## Group summary

Compared legacy AdminLTE shell (/tmp/pt-index.html) against local React shell (src/components/shell/ + nav-config). Local covers the core nav surface with an intentional flat/frequency-ranked IA redesign, collapse/mobile drawer, command palette, branch switcher, and theme toggle (all local additions). Major reference features missing locally: the technician repair board nav target (/RepairingM/Index), the SignalR call-center incoming-call workflow (toast + Tiếp nhận -> repair intake), a real RepairingStatusHistory-backed notification bell with mark-all-read and list page, and the News/messages dropdown with News list/detail pages. Secondary gaps: support-contact dropdown, account-info page (/User/Detail), branch-map Google Maps modal, 'Danh sách trả LK xác' warehouse child, differing report menu children, and the home-page plan calendar replaced by a KPI dashboard. Cosmetic gaps: sidebar user panel, footer version/copyright, label renames.
