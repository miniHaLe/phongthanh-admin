# Live UIUX Review — Layout, Hierarchy, Component Consistency

Reviewer lens: layout, visual hierarchy, component consistency, component placement. Live site https://minihale.github.io/phongthanh-admin/ (1440x900 primary; spot-checks 1920x1080, 390x844; dark mode on 4 pages). All screenshots in /tmp/uiux-layout-*.png were captured and visually inspected during this session.

## Summary (most severe first)

- Filter UI is a different component on nearly every page: 5 distinct paradigms (inline bar, "Bộ lọc" accordion, always-open labeled grid, boxed search-form card, radio-scoped report form). No shared pattern.
- The two repair-ticket list pages (/sua-chua-bao-hanh vs /sua-chua-bao-hanh-kt) present the same entity with different toolbars, filters, action placements, and table compositions — highest-traffic screens, largest inconsistency.
- Primary actions have no fixed home: top-right header button (Trang chủ, Khách Hàng, Tài Chính), inside toolbar row left (SCBH, Xuất Kho), right-end of table toolbar (Danh Mục "Thêm"), floating FAB on mobile only (Trang chủ).
- Status badge component renders 3+ different shapes/weights for the same statuses across pages (outlined chip vs saturated filled pill), and status colors are not 1:1 (e.g. "SỬA XONG" purple in one table, blue-purple fill in another; "ĐÃ GIAO CHO KHÁCH" neon green fill in Thông báo).
- Khách Hàng table renders a wall of fully empty cells with no per-cell placeholder ("—") and no empty-state guidance — visually indistinguishable from a rendering bug (data root cause owned by backend panelist; the missing placeholder/empty-state pattern is a UI defect).
- Inventory KPI cards headline negative totals ("-1.092", "-2.993.590.000 đ") with no state treatment; on mobile the đ value wraps mid-number ("-2.993.59 / 0.000 đ").
- Sub-navigation is inconsistent per module: Danh Mục and Nhân Sự use horizontal tab strips, Quản Lý/Phân Quyền use tab strips, but Quản Lý Kho (7 sub-pages) and Xuất Kho (4 sub-pages) expose no visible sub-navigation at all — sub-pages unreachable except by URL.
- Table toolbar composition ("Cột", "Xuất Excel", search, refresh) differs in content, order, and alignment on every module; pagination is bottom-only on some tables, plus top-right `‹ ›` scroll-arrows block on others, with "Hàng mỗi trang" only sometimes present.
- Dark mode is ~90% themed but breaks on fixed-color chips: neon status fills keep light-mode saturation (contrast/glare), notification red/news blue dots unchanged, and scrollbar thumbs stay light.
- Nhân Sự tab strip highlights BOTH "Loại phạt/thưởng" (active-looking pill) and "Nhân viên" (active underline) simultaneously — two active states in one nav.

## Findings

### F-A1: Five different filter-bar paradigms across list pages
- Severity: High
- Area: /sua-chua-bao-hanh, /sua-chua-bao-hanh-kt, /khach-hang, /quan-ly-kho/ton-kho, /xuat-kho/cap-linh-kien, /tai-chinh/thu-chi, /bao-cao/kpi
- Evidence: /tmp/uiux-layout-scbh-full.png (inline bar: input + status select + 2 date pickers + "Lưu/Xem bộ lọc" + "Bộ lọc nâng cao" second row); /tmp/uiux-layout-scbhkt-full.png (boxed card "Thông tin tìm kiếm" with 12 labeled fields + "Nhấn để search" hint button top-right); /tmp/uiux-layout-khach-hang-filter.png (collapsible "Bộ lọc" accordion with labeled grid); /tmp/uiux-layout-quan-ly-kho-top.png (always-open unboxed 8-control grid, no "Bộ lọc" header at all); /tmp/uiux-layout-xuat-kho-top.png ("Bộ lọc" accordion but tiny unaligned controls); /tmp/uiux-layout-bao-cao-results.png (radio-scoped day/month/year form)
- Problem: Same task (filter a table) is presented via five unrelated compositions with different affordances (auto-apply vs "Tìm kiếm" button vs "Nhấn để search"), different labels, and different collapse behavior. Users must relearn filtering per page; visual rhythm resets each time.
- Recommendation: Standardize on one FilterBar organism (collapsible "Bộ lọc" header + labeled 4-col grid + explicit apply/clear buttons in a fixed position). Migrate SCBH-KT's 12-field card and Tồn Kho's naked grid into it; keep report radio-scoping as an internal variant.
- Effort: L

### F-A2: Twin repair-list pages are structurally divergent
- Severity: High
- Area: /sua-chua-bao-hanh vs /sua-chua-bao-hanh-kt
- Evidence: /tmp/uiux-layout-scbh-full.png vs /tmp/uiux-layout-scbhkt-full.png
- Problem: Both list the same phiếu sửa chữa entity, yet: (a) SCBH has a status-count legend strip (17 colored dot chips) + 10-button action toolbar; KT has neither; (b) SCBH row = checkbox + badge + 4 icon actions; KT row = badge + 2 icon actions, no checkboxes; (c) header patterns differ (SCBH title duplicates breadcrumb leaf "Sửa Chữa - Bảo Hành"; KT breadcrumb says "Danh sách phiếu sửa chữa" while sidebar says "Sửa Chữa-Bảo Hành KT"); (d) totals placement differs ("Tổng: 50 dòng, Trang 1/3" right-aligned above table vs "Tổng: 175 dòng, Trang 1/9" both above AND below table in KT).
- Recommendation: Extract one RepairTicketTable template (badge column, action cluster, totals row, pagination) and parameterize role differences (KT hides bulk actions). Align breadcrumb leaf with sidebar label.
- Effort: L

### F-A3: Primary action placement roams per page
- Severity: High
- Area: /trang-chu, /khach-hang, /tai-chinh, /sua-chua-bao-hanh, /xuat-kho, /danh-muc/*, /nhan-su
- Evidence: /tmp/uiux-layout-trang-chu-full.png ("Lập phiếu" top-right header); /tmp/uiux-layout-khach-hang-full.png ("Thêm Khách Hàng" top-right); /tmp/uiux-layout-scbh-full.png (green "Lập phiếu" INSIDE a 10-button toolbar row, left position, below the filter); /tmp/uiux-layout-xuatkho-full2.png (blue "Thêm phiếu cấp" first of 5 buttons under filter, while an unrelated yellow "Tổng tiền: 91.100.000 đ" chip sits at the same row's right end); /tmp/uiux-layout-danh-muc-full.png ("+ Thêm" at far right of table toolbar after Cột/Xuất Excel); /tmp/uiux-layout-nhan-su-full.png ("+ Thêm nhân viên" right-aligned directly above table, no other toolbar buttons)
- Problem: The page-level create action appears in 4 different zones and 3 different color treatments (blue filled, green filled, ghost row-button). Scanning cost is high; on SCBH the primary action competes with 9 sibling buttons of equal visual weight.
- Recommendation: Fix one slot: page header top-right for the single primary action on every page (matches Trang chủ/Khách Hàng). Demote print/export/bulk buttons into the table toolbar or an overflow menu.
- Effort: M

### F-A4: Status badge component and color mapping not unified
- Severity: High
- Area: /sua-chua-bao-hanh, /sua-chua-bao-hanh-kt, /thong-bao, /trang-chu (recent-tickets table)
- Evidence: /tmp/uiux-layout-scbh-full.png (outlined white-bg chips with thick colored border, ALL-CAPS, 2-line wrap e.g. "ĐÃ CÓ LINH KIỆN"); /tmp/uiux-layout-scbhkt-full.png (same outline style); /tmp/uiux-layout-thongbao-dark.png and /tmp/uiux-layout-thong-bao.png (solid saturated fills — neon green "ĐÃ GIAO CHO KHÁCH", cyan "ĐÃ ĐIỀU PHỐI", purple "SỬA XONG"); /tmp/uiux-layout-trang-chu-full.png (dot + text pills, sentence case "Đã Điều Phối")
- Problem: Three badge anatomies (outline chip / solid pill / dot+text) and two text casings for the same status taxonomy. Some fills (neon green #00-ish, bright cyan) fail contrast with white text and look alien to the app's muted palette. Status color coding loses its learnability when the same state renders differently per page.
- Recommendation: One StatusBadge component with a single canonical color map and casing; pick the dashboard's dot+pill or the outlined chip and apply everywhere (Thông báo included).
- Effort: M

### F-A5: Khách Hàng table — no placeholder or empty-state treatment for blank data
- Severity: High
- Area: /khach-hang (also /danh-muc/model "Tên model"/"Model Code"/"Người tạo" columns, /quan-ly "Chi nhánh…Địa chỉ" columns, /danh-muc/hang-hoa "Hình/Mã hàng/Tên hàng")
- Evidence: /tmp/uiux-layout-khach-hang-full.png (rows 1–20: only STT, checkbox, "Loại", sparse "Đại lý/Trạm" render; 10+ columns fully blank); /tmp/uiux-layout-khachhang-1920.png (same wall of white at 1920); /tmp/uiux-layout-danh-muc-full.png; /tmp/uiux-layout-quan-ly-full.png (3 rows with only checkmark glyphs and dashes)
- Problem: Data-missing cells render as pure whitespace (no "—" placeholder as used elsewhere, e.g. Xuất Kho "Ghi chú" column correctly shows "—"). A row of 12 blank cells is indistinguishable from a broken render, and column boundaries vanish. Root cause of the missing data is out of my scope; the missing visual fallback is not.
- Recommendation: Apply the existing "—" placeholder convention to every nullable cell (it already exists in Xuất Kho and Tài Chính tables); add a table-level empty/error state when an entire column set fails to hydrate.
- Effort: S

### F-A6: Inventory KPI cards show unformatted negative aggregates with no state styling
- Severity: Medium
- Area: /quan-ly-kho/ton-kho
- Evidence: /tmp/uiux-layout-quan-ly-kho-top.png ("Tồn đầu kỳ -1.092" green-edged card, "Tổng tiền -2.993.590.000 đ", "Tổng tồn -1.169" amber-edged); /tmp/uiux-layout-kho-390.png (mobile: "-2.993.59" / "0.000 đ" wrapped mid-number)
- Problem: Semantically alarming negative stock/value totals are presented in the same neutral/positive card style (green accent bar on a negative number). On mobile the number breaks across lines mid-digit-group, making the value unreadable/wrong-looking. No tabular-numeric or shrink-to-fit handling.
- Recommendation: Add negative/alert styling state to KPI cards (red accent + icon), use `tabular-nums`, and prevent mid-number wrap (`whitespace-nowrap` + responsive font-size or abbreviation "−2,99 tỷ").
- Effort: S

### F-A7: Two modules have zero visible sub-navigation despite multiple sub-pages
- Severity: High
- Area: /quan-ly-kho/* (7 leaf pages: nhap-kho, ton-kho, ton-kho-lk-xac, ton-kho-ky-thuat, thu-hoi-lk, ds-tra-lk, ds-tra-lk-xac), /xuat-kho/* (cap-linh-kien, ban-hang, tra-hang, chuyen-kho)
- Evidence: /tmp/uiux-layout-quan-ly-kho-top.png and /tmp/uiux-layout-xuat-kho-top.png (no tab strip; compare /tmp/uiux-layout-danh-muc-full.png and /tmp/uiux-layout-nhan-su-full.png which have tab strips; /tmp/uiux-layout-quan-ly-full.png "Chi nhánh|Người dùng|Hóa đơn" tabs); sidebar has no submenu/flyout (verified in Sidebar.tsx/NavItem.tsx — flat NavLink only; hover shows nothing, /tmp/uiux-layout-sidebar-hover.png)
- Problem: Sidebar "Quản Lý Kho" silently redirects to ton-kho and "Xuất Kho" to cap-linh-kien; the other 9 sub-pages have no discoverable entry point anywhere in the UI. Navigation architecture is inconsistent with sibling modules that expose tab strips.
- Recommendation: Add the same horizontal tab strip used by Danh Mục/Nhân Sự/Quản Lý to Quản Lý Kho and Xuất Kho (or sidebar expandable children). This is a navigation-completeness gap, not just cosmetics.
- Effort: M

### F-A8: Table toolbar composition and ordering differ on every module
- Severity: Medium
- Area: /khach-hang, /danh-muc/*, /nhan-su, /quan-ly, /sua-chua-bao-hanh, /xuat-kho
- Evidence: /tmp/uiux-layout-khach-hang-full.png (search left; "Cột" + "Xuất Excel File" right); /tmp/uiux-layout-danh-muc-full.png (search left; "Làm mới" + "Cột" + "Xuất ra Excel" + "+ Thêm" right — note "Xuất ra Excel" vs Khách Hàng's "Xuất Excel File"); /tmp/uiux-layout-danhmuc-phuongxa.png ("Làm mới, Cột, + Thêm" but NO export); /tmp/uiux-layout-nhan-su-full.png (search + "+ Thêm nhân viên" only — no Cột/export); /tmp/uiux-layout-scbh-full.png ("Cột" alone, right of totals); /tmp/uiux-layout-xuatkho-full2.png (no Cột at all; export lives in the action button row as "Xuất ra Excel")
- Problem: The same utilities appear/disappear arbitrarily and swap labels ("Xuất Excel File" / "Xuất ra Excel" / "Xuất Excel In") and position. Users cannot build spatial memory for table controls; some tables lose column-config/export capability without an apparent reason.
- Recommendation: Define one TableToolbar contract: [search] left — [Làm mới?][Cột][Xuất Excel][+ Thêm] right, one label per function, rendered on every data table; omit a control only when genuinely unsupported.
- Effort: M

### F-A9: Pagination pattern split — top scroll-arrows block vs bottom pager, inconsistently combined
- Severity: Medium
- Area: all data tables
- Evidence: /tmp/uiux-layout-khach-hang-full.png (top-right `‹ ›` block above header + bottom "Hiển thị 1–20/50 … Hàng mỗi trang 20, Trang 1/3 ‹ ›"); /tmp/uiux-layout-scbh-full.png (same top arrows; bottom bar present); /tmp/uiux-layout-scbhkt-full.png (top-right `‹ ›` plus totals string duplicated above AND below table); /tmp/uiux-layout-xuatkho-full2.png (top arrows present but page fits without horizontal scroll, arrows are dead weight); /tmp/uiux-layout-bao-cao-results.png (table with NO pagination or totals at all); /tmp/uiux-layout-thong-bao.png (no pagination, no totals)
- Problem: The top `‹ ›` block is a horizontal-scroll affordance for wide tables, but it renders even when the table doesn't overflow, and its placement/height mimics pagination, inviting misreads. Meanwhile actual pagination (row-count select, page indicator) only exists on some tables, and totals strings are duplicated on KT.
- Recommendation: Render scroll arrows only when the table actually overflows (and pair with edge-fade); keep one canonical bottom pagination bar on every paged table; deduplicate the KT totals row.
- Effort: M

### F-A10: Nhân Sự tab strip shows two simultaneous active states
- Severity: Medium
- Area: /nhan-su (redirects to /nhan-su/nhan-vien)
- Evidence: /tmp/uiux-layout-nhan-su-full.png — "Loại phạt/thưởng" renders as a raised bordered pill (active-card look) while "Nhân viên" carries the blue underline+text active state; page content is Nhân Viên
- Problem: Two different active-state treatments applied at once to different tabs; users cannot tell which section they're in. Also this tab strip mixes unrelated catalogs (Ngân hàng, Phòng ban, Chức vụ…) with transactional pages (Bảng lương, Chấm công) at one level.
- Recommendation: Single active style (the underline used by Danh Mục); ensure hover/focus style is not identical to active. Consider grouping lookup catalogs vs payroll operations.
- Effort: S

### F-A11: Danh Mục tab overflow has no affordance at 1440 and hides 2+ tabs
- Severity: Medium
- Area: /danh-muc/* (14 tabs)
- Evidence: /tmp/uiux-layout-danh-muc-full.png (strip ends at "Đơn vị tính" clipped mid-glyph at viewport edge; nothing indicates more tabs); /tmp/uiux-layout-danhmuc-phuongxa.png (native thin scrollbar appears under the tabs only after interaction, with tiny ‹ › arrows at extreme edges)
- Problem: Tab overflow relies on an OS-level scrollbar and edge arrows that only appear contextually; the last visible tab is hard-clipped, so "Thời hạn bảo hành"-class tabs beyond the fold are undiscoverable. The always-visible horizontal scrollbar (when present) sits directly under the tab text, looking like a rendering artifact.
- Recommendation: Add persistent chevron buttons + gradient fade at both ends of the tab strip (shadcn ScrollArea with visible controls), or collapse overflow tabs into a "Thêm ▾" menu.
- Effort: S

### F-A12: Repair-ticket action toolbar is an undifferentiated 10-button wall wrapping to 2 rows
- Severity: Medium
- Area: /sua-chua-bao-hanh
- Evidence: /tmp/uiux-layout-scbh-full.png row: [Lập phiếu][Chuyển chi nhánh][In Biên nhận][In Giấy Đi Đường][In Lệnh Sửa Tại Nhà][In Phiếu SC][In tem ▾][Xóa][Xuất Excel File] then wrapped second row [Xuất Excel In][Tải lại trang]; /tmp/uiux-layout-scbh-1920.png (single row at 1920 but same flat weighting)
- Problem: Create, bulk-destructive (red Xóa), 5 print variants, 2 export variants, and a page-reload utility share one row with equal visual weight. Bulk actions (Chuyển chi nhánh, Xóa, In…) are enabled-looking even with zero rows selected. "Tải lại trang" is a browser function rendered as a text button and orphaned on the wrap line.
- Recommendation: Group: primary "Lập phiếu" to page header; collapse the five "In…" into one "In ▾" split-button; move Xóa/Chuyển chi nhánh into a selection-context bar that appears only when rows are checked; drop "Tải lại trang" or make it an icon next to the table.
- Effort: M

### F-A13: Xuất Kho action row mixes buttons with a KPI chip; duplicate search affordances
- Severity: Medium
- Area: /xuat-kho/cap-linh-kien
- Evidence: /tmp/uiux-layout-xuat-kho-top.png and /tmp/uiux-layout-xuatkho-full2.png — row: [Thêm phiếu cấp][Tìm kiếm][Tìm chi tiết][Xuất ra Excel][Báo cáo lợi nhuận] …right: yellow bordered chip "Tổng tiền: 91.100.000 đ"; above it, the Bộ lọc accordion already has its own implicit apply; filter inputs are ~72px wide showing "Tất cả" truncated as "Tất cả…"
- Problem: A passive data summary (Tổng tiền) is styled like an interactive control and placed in the action row; "Tìm kiếm" vs "Tìm chi tiết" as adjacent siblings is ambiguous; filter selects are too narrow to read their own values ("Tất cả" barely fits, labels wrap: "Số phiếu cấp" wraps to 2 lines while its input is empty-width).
- Recommendation: Move Tổng tiền into a KPI card row (as Tài Chính does); merge Tìm kiếm/Tìm chi tiết into the filter's single apply; give filter fields the standard grid widths used on Khách Hàng.
- Effort: M

### F-A14: Báo Cáo KPI — charts render axis-only frames while table below is populated
- Severity: Medium
- Area: /bao-cao/kpi (after pressing Tìm kiếm)
- Evidence: /tmp/uiux-layout-bao-cao-results.png — "Phiếu theo kỹ thuật viên" shows axes + x-labels + legend but zero bars; "Tổng phiếu theo ngày" empty plot with unsorted date axis (12/07 → 17/06 → 29/06 → 13/07 → 02/07); the data table beneath has 300+ tickets across those same technicians/dates
- Problem: Empty chart frames above a populated table read as broken visualizations (violates empty/loading-chart guidance); the x-axis date ordering is non-chronological, so even with data the trend line would be meaningless. This is a layout/data-viz presentation defect independent of API availability (the table proves data exists client-side).
- Recommendation: Render bars/line from the same dataset feeding the table; sort the time axis chronologically; if a series is genuinely empty show the standard "no data" empty state inside the chart card, never a bare axis frame.
- Effort: M

### F-A15: Dashboard KPI row leaves a stranded 5th card and dead space
- Severity: Low
- Area: /trang-chu (Tổng quan tab)
- Evidence: /tmp/uiux-layout-trang-chu-full.png and /tmp/uiux-layout-trang-chu-1920.png — 4 equal KPI cards in row 1; "Phiếu nhận hôm nay" alone on row 2 at 1/4 width with 3/4 empty space; it also duplicates the concept of "Mới Nhận" directly above
- Problem: The orphan card breaks the grid rhythm and wastes a full row; its highlighted style (indigo tint) gives it more weight than the four primary KPIs while containing a zero.
- Recommendation: Make it the 5th card in one responsive 5-col row (1920 fits easily; 1440 use 5x min-width or fold into "Mới Nhận" as a sub-metric).
- Effort: S

### F-A16: Mobile — filter drawer clips the second date input off-viewport
- Severity: Medium
- Area: /sua-chua-bao-hanh at 390x844
- Evidence: /tmp/uiux-layout-scbh-390.png — "06/13/2026 ▤ – 07/13/2026" second date field is cut by the right viewport edge (no wrap), while every other filter control stacks vertically; status-count chips then stack as a very tall 2-col list pushing content ~3 screens down
- Problem: Horizontal clipping at mobile width breaks the no-horizontal-scroll rule and makes the end-date uneditable without discovering hidden scroll. The 17-chip legend consumes excessive vertical space before any data appears.
- Recommendation: Stack the date-range pair vertically at <md; collapse the status legend behind the "Bộ lọc nâng cao" disclosure on mobile.
- Effort: S

### F-A17: Mobile — Khách Hàng keeps raw 16-column table while SCBH switches to cards
- Severity: Medium
- Area: /khach-hang at 390x844 (contrast /sua-chua-bao-hanh)
- Evidence: /tmp/uiux-layout-khachhang-390-top.png (table with STT/checkbox/Tên khách hàng/Điện thoại… requiring huge horizontal scroll; toolbar reduced to two icon-only buttons with no labels); /tmp/uiux-layout-scbh-390-table.png (SCBH renders proper mobile cards with badge, name, cost)
- Problem: Two adjacent modules use opposite mobile strategies. The Khách Hàng table at 390px shows only empty cells (F-A5 compounds), and its icon-only "Cột"/"Xuất" buttons lose their labels — unrecognizable. The empty-cell wall means a mobile user sees literally nothing but numbers and checkboxes.
- Recommendation: Reuse SCBH's card-list pattern for Khách Hàng (name, phone, type badge, agent) below md breakpoint; keep labeled buttons or move them into an overflow menu.
- Effort: M

### F-A18: Mobile header drops the branch selector entirely
- Severity: Medium
- Area: all routes at 390x844
- Evidence: /tmp/uiux-layout-trang-chu-390.png (header: menu, search, bell, mail, help, theme, avatar — no "Tất cả chi nhánh"); /tmp/uiux-layout-mobile-menu.png (drawer contains only nav links; no branch selector either)
- Problem: Branch scoping is a global data filter that changes every page's contents; on mobile it is simply gone rather than relocated, so a phone user cannot switch branches at all (functional gap caused by responsive layout policy).
- Recommendation: Move the branch selector into the mobile drawer header (under "Phong Thành") or as the first row of the account menu.
- Effort: S

### F-A19: Dark mode — fixed-color chips, dots and scrollbars stay light-mode
- Severity: Medium
- Area: /thong-bao, /trang-chu, /sua-chua-bao-hanh in dark theme
- Evidence: /tmp/uiux-layout-thongbao-dark.png (neon green/cyan/amber solid badges glare on near-black rows; unread-count red badge and news blue badge identical to light); /tmp/uiux-layout-trang-chu-dark.png (low-stock list scrollbar renders as a bright white track/thumb strip inside the dark card; KPI icon tiles keep light pastel backgrounds); /tmp/uiux-layout-scbh-dark.png (outlined status chips adapt well by contrast — inconsistent with Thông báo's fills)
- Problem: Dark theme relies on tokens for surfaces/text (good) but hard-coded hex fills and native scrollbar styling leak light-mode values, producing glare hotspots and an unthemed scrollbar column. Per dark-mode pairing rules, saturated fills need desaturated dark variants.
- Recommendation: Route badge/dot colors through semantic tokens with dark variants; add `scrollbar-color`/`::-webkit-scrollbar` theming to ScrollArea; audit icon-tile pastel backgrounds for dark equivalents.
- Effort: M

### F-A20: Page-header pattern inconsistent — breadcrumb presence, title duplication, and leaf naming vary
- Severity: Low
- Area: /khach-hang, /trang-chu, /danh-muc/*, /nhan-su, /sua-chua-bao-hanh-kt
- Evidence: /tmp/uiux-layout-khach-hang-full.png (NO breadcrumb — title only, unlike every other page); /tmp/uiux-layout-trang-chu-full.png (breadcrumb "Trang chủ" + h1 "Trang chủ" duplicated immediately below); /tmp/uiux-layout-danh-muc-full.png and /tmp/uiux-layout-nhan-su-full.png (no breadcrumb at all in tabbed modules; h1 sits below tab strip); /tmp/uiux-layout-scbhkt-full.png (breadcrumb leaf "Danh sách phiếu sửa chữa" ≠ sidebar label "Sửa Chữa-Bảo Hành KT"); /tmp/uiux-layout-quan-ly-kho-top.png (breadcrumb "Quản Lý Kho > Xem Tồn Kho" — parent not clickable to anything meaningful since module has no hub page)
- Problem: The header block (breadcrumb → h1 → primary action) is the page's anchor pattern; four variants exist. Root-level breadcrumb that repeats the title adds noise; missing breadcrumbs in tabbed modules remove orientation precisely where hierarchy is deepest (14 tabs).
- Recommendation: One PageHeader component: breadcrumb (hidden at root), h1 matching the sidebar/tab label, actions slot right. Apply to all modules including tabbed ones.
- Effort: M

### F-A21: Catalog STT ordering breaks under default sort (4 before 3, 7 before 6)
- Severity: Low
- Area: /danh-muc/phuong-xa
- Evidence: /tmp/uiux-layout-danhmuc-phuongxa.png — STT column reads 1, 2, 4, 5, 3, 7, 6, 8, 9, 10 while the active sort indicator sits on "Tên Xã/Phường" whose cells are all EMPTY (so sort is effectively random against a blank column)
- Problem: A visible sort arrow on an empty column plus a jumbled sequence number column makes the table look corrupted; STT should be row-index (render order) not a stored attribute, or the default sort should target a populated column.
- Recommendation: Compute STT from row index after sort/pagination; default-sort by a non-empty column.
- Effort: S

### F-A22: Login card floats in dead space with no brand context
- Severity: Low
- Area: /login (pre-auth)
- Evidence: /tmp/uiux-layout-login-1440.png — small centered card, generic wrench icon, h1 "Đăng nhập", subtitle "Hệ thống quản lý Phong Thành"; ~70% of viewport is empty gray; no logo/brand color tie-in with the app's navy sidebar identity
- Problem: Weakest-hierarchy page of the app: brand name is body-text weight while the generic action word is the h1; the icon badge is a placeholder glyph. Not a functional issue but the entry point sets the visual-quality expectation.
- Recommendation: Elevate "Phong Thành" as the masthead (logo/wordmark), demote "Đăng nhập" to section label; consider split-panel with brand color to connect to the shell.
- Effort: S

## Cross-cutting patterns (systemic inconsistencies)

1. No shared "list page" template. Every module hand-rolls header + filter + toolbar + table + pagination, which is the root cause of F-A1, F-A3, F-A8, F-A9, F-A20. One `ListPageLayout` with slots would eliminate ~70% of the findings.
2. Excel-export naming drift: "Xuất Excel File", "Xuất ra Excel", "Xuất Excel In", "Xuất ra Excel Thu SC" — same intent, four labels (F-A8, F-A13, plus Tài Chính in /tmp/uiux-layout-taichinh-1920.png).
3. Buttons express intent by ad-hoc color: create = blue here, green there (SCBH); destructive red used for both bulk Xóa and the HR "Khóa" lock icon column (red filled squares on every row in /tmp/uiux-layout-nhan-su-full.png read as 20 destructive alerts).
4. Empty-value rendering: "—" used in Xuất Kho/Tài Chính/Thông báo, blank whitespace in Khách Hàng/Danh Mục/Quản Lý (F-A5).
5. Tab-strip modules (Danh Mục, Nhân Sự, Quản Lý, Phân Quyền) drop the breadcrumb; non-tab modules keep it — orientation model flips per module (F-A7, F-A20).
6. Data-first vs press-search-first split: most lists auto-load; Báo Cáo (and SCBH-KT's "Nhấn để search" hint) require explicit search — no signal distinguishes which mode a page is in until you stare at an empty region.
7. Dark theme covers token-driven surfaces but every hard-coded color (status fills, notification dots, chart palette, scrollbars) leaks light-mode values (F-A19).

## Unresolved questions

1. Are the 9 hidden sub-pages of Quản Lý Kho / Xuất Kho intentionally URL-only (role-gated features pending), or is the missing sub-nav an omission? (F-A7 assumes omission since routes are registered and pages render.)
2. Is the SCBH status-count legend (17 chips) meant to be interactive filters? They look like passive legend dots; if clickable, they need affordance — interaction panelist's scope to verify.
3. "Tồn đầu kỳ -1.092" — if negative aggregates are expected business data, the KPI alert styling (F-A6) matters more; if they're mock-data artifacts, only the mobile wrapping fix applies.
4. Intended mobile support level: several desktop-dense pages (Tồn Kho grouped table, SCBH-KT 12-field search card) appear never designed for <md; confirming the target breakpoints would let fixes be scoped to md+ only.

Status: DONE
Summary: Reviewed 16 routes live at 3 viewports plus dark mode; 22 findings filed, dominated by the absence of shared list-page/filter/toolbar/badge components and two modules with no reachable sub-navigation.
Concerns/Blockers: /danh-muc/nha-kho chunk failed to load twice (known frontend finding, noted not duplicated); real-API pages showed empty columns which limited assessment of ideal-state cell layout.
