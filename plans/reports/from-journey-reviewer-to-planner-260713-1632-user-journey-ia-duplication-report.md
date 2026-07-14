# Live UIUX Review — User Journeys, IA, Duplication

Reviewer lens: user usage roadmap (task journeys), information architecture, duplicated/unnecessary content.
Site: https://minihale.github.io/phongthanh-admin/ (hash router), login admin/admin123, session 2026-07-13.
Screenshots: `/tmp/journey-*.png` (referenced per finding; copy out before reboot if needed).

## Summary (max 10 bullets)

- Receptionist intake works end-to-end (ticket PSC-300001 created) but a REQUIRED field (Khu vực) ships with an EMPTY catalog on the live API — every first-time intake dead-ends until the user discovers the inline "+" (journey-09/10).
- Khách Hàng list renders 51 rows with 100% EMPTY cells (name/phone/address all blank); "Thêm Khách Hàng" modal dies with "Không thể kết nối máy chủ" — the entire customer journey is unusable except through the repair-form picker, which still has data (journey-22/23/24).
- The same empty-cell disease hits Danh Mục → Model (Tên model blank), Quản Lý → Chi nhánh (names blank), Nhân Sự → Ngân hàng (all blank) — every real-API list renders label-less rows while mock lists render fine. Users cannot identify any row.
- Sub-page navigation is broken IA-wide: Quản Lý Kho (7 sub-pages), Xuất Kho (4), Tài Chính (3), Báo Cáo (8) have NO visible sub-nav — no tab strip, no sidebar children, no palette entries. Sub-pages are reachable only by typing URLs or clicking scattered in-page buttons. nav-config.tsx declares `children` for all of them but only Danh Mục / Nhân Sự / Quản Lý / Phân Quyền render a tab strip.
- The two repair pages overlap ~80% (same ticket list, same columns family, same detail page); KT differs only by an always-open 12-field search panel, camera button, and absence of bulk print/status actions. The split is legacy parity, not user value.
- 4 notification surfaces (bell dropdown, news dropdown, /thong-bao, /tin-tuc) show the SAME PSC-2000xx status events reworded; /tin-tuc is additionally a hard crash (dynamic-import error persists after reload) (journey-56/57/58/60/61).
- Warehouse mental model kho→xuất is incoherent: Tồn kho shows negative company-wide KPIs (Tổng tồn -1.169, Tổng tiền -2.99B đ), item rows show negative stock (-27) yet Bán hàng happily sells the same item showing "<= 122" then "<= 0" — and a saved sale NEVER appears in the Bán Hàng list (search by customer: 0 rows) (journey-27/29/35/41).
- Finance modal "Lập Phiếu Thu" failed on first save ("Không thể tải dữ liệu"), succeeded on identical retry — flaky critical path; its customer field is free-text, unlinked to the customer entity used everywhere else (journey-45/46).
- Dev/demo artifacts in prod: /gallery ("Thư viện giao diện") fully browsable, command palette exposes "Demo: Cuộc gọi đến", dashboard "Kế hoạch của bạn" tab duplicates the "Kế hoạch nhanh" calendar shown on the same screen's Tổng quan tab (journey-59/62/04/02).
- Dashboard "Phiếu sửa chữa gần đây" rows link to SC-2024-xxxxx ids that do not exist in the repair store → "Không tìm thấy phiếu sửa chữa" dead end on the very first click a manager makes (journey-81/82).

## Journey walkthroughs

### J1 — Receptionist intake (Lập phiếu)
Steps: dashboard → "Lập phiếu" (1 click) → Model dropdown (1) → pick model (1) → Serial (type) → Mô tả hư hỏng (type) → Hình thức BH radio (1) → Khu vực: open → EMPTY ("Không có kết quả") → "+" → modal → type name → Lưu (4 clicks + type) → Khách hàng picker → pick (2) → "Lưu & Đóng" (1). **11 clicks + 4 typed fields** for the happy path; +4 clicks caused by the empty Khu vực catalog.
Friction: (a) required Khu vực has no data and no hint that "+" is the escape hatch; (b) Model dropdown label format "iPhone 14 Pro — iPhone 15 - Apple" reads as noise — the parent Sản phẩm ("iPhone 15") is a mislabeled category (an iPad Air 5 lists "iPhone 15" as its product); (c) "BH sửa chửa" typo in radio label (journey-13, should be "sửa chữa"); (d) Model auto-fill of Sản phẩm/Nhà sản xuất works as documented (journey-07); (e) after "Lưu & Đóng" the list opens with a success toast and the new ticket is findable (journey-15/16).
Verdict: works, but first-run dead end on Khu vực is a Critical data-seeding/UX issue; Product taxonomy data is garbage.

### J2 — Technician (sua-chua-bao-hanh-kt vs sua-chua-bao-hanh)
KT page (journey-17/18): permanently-open 12-field search panel (Số phiếu SC/hãng, Serial, tên KH, phone, NSX, Sản phẩm, Model, Tình trạng, Hình thức, Tỉnh, Huyện), 175 rows (vs 51 on the main page — different default scope), row actions = Xem chi tiết + Cập nhật hình ảnh only. **There is NO "my tickets" filter — a technician cannot filter by themselves in one click; Kỹ thuật filter exists on main page's advanced filter but on KT page there is no KTV dropdown at all** (snapshot: fields listed above). Status change on KT page: not available in-row; the tech must open detail → there is no status control on the detail page either (only history log) → status is changed from the MAIN page's per-row "Đổi tình trạng" dialog (journey-79). So the "technician page" cannot do the technician's #1 action.
Overlap with main page: same entity, same detail route, same columns minus Hành động/bulk bar. Split is unjustified for users; it exists for legacy parity.
Verdict: COMBINE (see F-C3).

### J3 — Customer management
/khach-hang: 51 rows, ALL cells empty (journey-22/23). Search "Minh" → rows stay empty (journey-25) — cannot verify what matched. Bộ lọc panel has 7 fields (Tỉnh/TP, Nhóm KH, Tên, SĐT, Email, Địa chỉ, MST) — filtering into a table with no visible data is meaningless. "Thêm Khách Hàng" → modal shows "Không thể kết nối máy chủ" (journey-24) → journey hard-blocked; edit is equally unreachable (no identifiable row to click). Meanwhile the repair form's customer picker returns names+phones fine, and Bán hàng picker shows "Trịnh Minh Khôi" 3× (dupe records, no dedupe hint) (journey-37).
Click cost to create a customer: N/A — impossible from the customers page at review time.
Verdict: FIX the /khach-hang read/create path before any UX polish matters; add row-identity fallback (at least render name from the same source the pickers use).

### J4 — Warehouse → Sales
/quan-ly-kho → redirects to Xem Tồn Kho. KPI cards: Tồn đầu kỳ -1.092, Tổng tiền -2.993.590.000 đ, Tổng tồn -1.169 (journey-27) — nonsense negative aggregates presented without warning. Search "Pin iPhone" works (mã/tên filter) → HH00001, Số lượng -27 (journey-29). From here NOTHING links to Xuất Kho — no "sell/issue this item" action; the pencil icon edits the stock row. User must know to click sidebar Xuất Kho → lands on Cấp Linh Kiện (not Bán hàng) → must know the URL or find… nothing: there is no visible link to Bán hàng anywhere on the page (journey-30/31; snapshot grep for "Bán Hàng" on the page returned only breadcrumb items). I reached /xuat-kho/ban-hang by URL. Sale form: item picker → "Thêm hàng" → payment method → customer → Lưu; **saved sale does not appear in the Bán Hàng list** — filter by customer name returns "Không có phiếu bán hàng nào" (journey-41). No toast confirmed the save either.
Hops for "check stock → sell it": 2 sidebar hops + 1 URL-only hop + form = effectively broken for a user who doesn't know routes.
Verdict: mental model incoherent — kho and xuất are two isolated silos joined only by the sidebar; sale persistence bug on top.

### J5 — Finance & reporting
/tai-chinh → Chứng Từ with 4 KPI cards and Lập Phiếu Thu/Chi buttons (journey-43). Phiếu Thu modal: Loại thu (5 options incl. "Phiếu Thu Sửa Chữa", "Phiếu Thu Bán Hàng"), Hình thức, Tên khách hàng (FREE TEXT — not the shared customer picker), Số tiền, Chi nhánh, Nội dung. First save → error "Không thể tải dữ liệu. Vui lòng thử lại." (journey-45); identical retry → success toast "Đã lập phiếu thu PTT-20260713-251" (journey-46).
/bao-cao → redirects to Báo Cáo KPI. Filter vocabulary check: KPI report filters = Chi nhánh / Kỹ thuật / Nhóm sản phẩm + ngày/tháng/năm radio (journey-47); Doanh thu report = Chi nhánh + Từ/Đến ngày only (journey-49/50); result columns "DT sửa chữa / DT bán hàng / Tổng doanh thu / Tổng chi phí / Lợi nhuận" match Tài Chính's "Doanh thu / Chi phí" vocabulary well enough. But the data pages filter by "Nhà kho, Hình thức thu chi" (Bán Hàng list) and "Loại thu" (5 phiếu types) while reports have no such dimension — no phiếu-type drilldown. Bigger issue: the other 7 reports (KPI Tiếp nhận, Tình trạng kỹ thuật, Tình trạng chung, Máy tồn, SCBH Kỹ thuật, Xuất kho) are UNREACHABLE from the UI — no tab strip on /bao-cao pages, no palette entries (palette search "bao cao" → only the module link, journey-83).
Verdict: reachability is the defect, not vocabulary.

### J6 — Admin cluster
/danh-muc: 14-catalog tab strip, works, but Model tab shows blank Tên model column (journey-51); Khu vực catalog is populated here (Tỉnh/Quận/Xã/tiền công rows, journey-52) — yet the repair form's Khu vực combobox was empty, i.e., two "Khu vực" sources disagree (form reads real API, catalog shows mock/another set).
/quan-ly: 3 tabs; Chi nhánh names blank (journey-53); Người dùng rows show branch+role but Tên đăng nhập/Tên đầy đủ blank (journey-54); Hóa đơn tab duplicates /tai-chinh/hoa-don (route constant literally says `manageInvoices: '/quan-ly/hoa-don' // redirects → financeInvoices`).
/phan-quyen: 3 tabs (Nhóm quyền, Menu, Chức năng) — functional, dense but coherent (journey-55/80). The Menu tab manages the LEGACY app's menu tree (fa fa-* icons, /trang-chu, /quan-ly-kho/ton-kho links) — parity artifact that edits nothing in this SPA.
/tai-khoan: read-only info card + account menu duplicate (journey-67/68). /thong-bao: table of status changes (journey-56). /tin-tuc: CRASHED both attempts (journey-57/58).

## Findings

### F-C1: Khách Hàng module is non-functional (empty rows + create modal cannot connect)
- Severity: Critical
- Area: /khach-hang
- Evidence: /tmp/journey-22, -23 (51 rows, all cells empty), -24 (modal "Không thể kết nối máy chủ"), -25 (search leaves rows empty)
- Problem: The flagship real-API resource renders zero identifying data; create path errors out. A user cannot identify, create, or edit any customer. Downstream pickers still work, proving data exists — the list/create wiring is what is broken.
- Recommendation: FIX — repair the list column mapping (same field source as the repair-form picker) and the create-modal API base URL; add an empty-state banner ("Không tải được dữ liệu máy chủ") instead of silently rendering blank rows. A table that cannot render identity columns must show an error state, not 51 ghost rows.
- Effort: M

### F-C2: Real-API lists systematically render blank identity columns (Model, Chi nhánh, Người dùng, Ngân hàng)
- Severity: Critical
- Area: /danh-muc/model, /quan-ly/chi-nhanh, /quan-ly/nguoi-dung, /nhan-su/ngan-hang
- Evidence: /tmp/journey-51 (Tên model blank), -53 (Chi nhánh names blank), -54 (login/full-name blank), -66 (Ngân hàng all blank)
- Problem: Same defect class as F-C1 across every real-backend table: rows exist, name columns empty. Users see checkmarks and edit icons attached to nothing.
- Recommendation: FIX — one shared mapping bug, fix once in the table adapter; add contract test that every real resource's primary display column is non-empty in list view.
- Effort: M

### F-C3: Two repair modules duplicate one entity with arbitrary capability split
- Severity: High
- Area: /sua-chua-bao-hanh, /sua-chua-bao-hanh-kt
- Evidence: /tmp/journey-16 (main list: 15 status chips, 8 bulk buttons, per-row Đổi tình trạng/Xem/Lịch hẹn), -17/-18 (KT: 12-field always-open search, per-row Xem + Cập nhật hình ảnh only), -19/-21 (both land on the same detail page PSC-200001)
- Problem: ~80% overlap (same tickets, same detail); the "technician" page lacks the technician's core actions — no "my tickets" preset (no KTV filter at all) and no status change. Meanwhile the main page owns status change. Users must ping-pong between both pages to do one technician workflow.
- Recommendation: COMBINE — one list route with role presets: default view = current main page; a "Kỹ thuật" saved view adds the KT search panel fields and photo action, auto-filters `Kỹ thuật = current user`, and keeps per-row Đổi tình trạng. Keep the old KT URL as a redirect to the preset. Migration: move "Cập nhật hình ảnh" into the shared row action set; delete the KT page component.
- Effort: L

### F-C4: Required "Khu vực" field is empty at point of use while its catalog has data elsewhere
- Severity: High
- Area: /sua-chua-bao-hanh/tao-moi vs /danh-muc/khu-vuc
- Evidence: /tmp/journey-09, -10 ("Không có kết quả" for empty and typed query), -12 (inline create works), -52 (Danh Mục Khu Vực full of rows)
- Problem: Two different Khu vực sources: the form reads a (near-empty, live-API) region list; the catalog page shows a populated set with Tỉnh/Huyện/Xã + tiền công. First-time intake dead-ends on a required field; data created inline (ZZTEST) does not carry the fee metadata the catalog defines.
- Recommendation: FIX — point the form combobox at the same catalog datasource; seed production regions; keep inline "+" as fallback with the full catalog fields (or mark created rows as draft for admin completion).
- Effort: M

### F-C5: Sub-page navigation missing for 4 of 8 primary modules
- Severity: High
- Area: /quan-ly-kho/* (7 pages), /xuat-kho/* (4), /tai-chinh/* (3), /bao-cao/* (8)
- Evidence: /tmp/journey-27 (Tồn Kho: no tabs), -31 (Cấp Linh Kiện: no tabs, no link to Bán hàng), -75 (Công Nợ reached only by URL), -47/-83 (8 reports declared, only KPI reachable; palette knows only module names); src/config/nav-config.tsx lines 77–130 declare `children` that neither Sidebar (NavItem.tsx renders no children) nor these pages render; DanhMuc/NhanSu/QuanLy/PhanQuyen DO render tab strips (journey-51/65/53/55)
- Problem: 22 declared sub-pages have no clickable path. Employees must memorize URLs. The two page families behave inconsistently (admin modules get tabs, operational modules don't) — the exact inverse of usage frequency.
- Recommendation: MODIFY — render the same "Danh mục con" tab-strip component on quan-ly-kho, xuat-kho, tai-chinh, bao-cao layouts from the existing nav-config children; also register children as palette commands ("Mở Tồn kho", "Mở Bán hàng"…). Zero new IA, just render what config already declares.
- Effort: M

### F-C6: Saved Bán hàng ticket never appears in the Bán Hàng list
- Severity: High
- Area: /xuat-kho/ban-hang, /xuat-kho/ban-hang/tao-moi
- Evidence: /tmp/journey-38 (form after Lưu: no toast, form persists), -40 (list top = PBH-20260327-1 dated 27/03), -41 (filter Tên khách hàng "Đặng Văn Minh" → "Không có phiếu bán hàng nào")
- Problem: Either save silently fails or the list ignores new records; either way the receptionist cannot confirm a sale exists — data-loss anxiety on a money flow.
- Recommendation: FIX — persist and prepend the new sale (mock store) and always toast success/failure; a form that stays populated after Lưu with no feedback is a dead end.
- Effort: M

### F-C7: Four surfaces for the same notification stream; one of them crashes
- Severity: High
- Area: header bell, header news dropdown, /thong-bao, /tin-tuc
- Evidence: /tmp/journey-60 (bell: PSC-200001–8 status lines), -61 (news: same PSC-200001–8 re-labeled "ELECTROLUX, PSC-200001" etc.), -56 (/thong-bao = same rows as bell in table form), -57/-58 (/tin-tuc crashes with dynamic-import error, twice)
- Problem: Same event stream fanned into 4 UIs with different labels ("Tin tức" is actually repair-status events wearing brand names — not news). Duplicate badge counts (20 vs 10) invite confusion. The only differentiated surface (/tin-tuc) is broken.
- Recommendation: COMBINE — one notification center: keep bell dropdown (peek) + /thong-bao (full list with filters). DELETE the news dropdown and /tin-tuc route (no unique content; page crashes anyway). Migration: if company announcements are a future need, reintroduce as a distinct content type inside /thong-bao with a type filter, not a parallel module.
- Effort: S

### F-C8: Dashboard "Kế hoạch của bạn" tab duplicates the "Kế hoạch nhanh" calendar on the same page
- Severity: Medium
- Area: /trang-chu
- Evidence: /tmp/journey-02 (Tổng quan tab: "Kế hoạch nhanh" month calendar Tháng 7/2026 with events), -04 ("Kế hoạch của bạn" tab: same month, same events "Thu hồi linh kiện lỗi", "Đào tạo nhân viên", larger)
- Problem: Two renderings of one calendar dataset a single click apart; the tab adds nothing but size.
- Recommendation: COMBINE — keep the compact "Kế hoạch nhanh" card, link its header to a full-screen calendar (could be the existing tab content as a route or modal); remove the top-level tab pair, freeing the dashboard from a two-tab IA for one real view.
- Effort: S

### F-C9: Dashboard "Phiếu sửa chữa gần đây" links to non-existent tickets
- Severity: High
- Area: /trang-chu → /sua-chua-bao-hanh/:id
- Evidence: /tmp/journey-81 (rows SC-2024-00448…), -82 (click → "Không tìm thấy phiếu sửa chữa")
- Problem: The recent-tickets widget uses a different id scheme (SC-2024-xxxxx) than the repair store (PSC-xxxxxx); every click dead-ends. This is the first drill-down a manager tries.
- Recommendation: FIX — source the widget from the same mock repair store as the list page (real PSC ids); add a fallback "ticket not found → back to list with search prefilled".
- Effort: S

### F-C10: /gallery dev route and "Demo: Cuộc gọi đến" command ship in production
- Severity: Medium
- Area: /gallery, command palette
- Evidence: /tmp/journey-59 ("Thư viện giao diện" with 15 status chips, StatCards incl. a permanent "Đang tải" skeleton card), -62 palette listing "Demo: Cuộc gọi đến" and "Bản đồ chi nhánh" next to real actions
- Problem: Component gallery and call-center demo are reachable by any user; the gallery even renders fake KPIs (Doanh thu 45.800.000 đ) that could be mistaken for data.
- Recommendation: DELETE from production builds (env-gate the route registration and the demo command; README already labels gallery "(dev)"). Safe: no business flow links to them.
- Effort: S

### F-C11: Duplicate Hóa đơn entry points (Tài Chính tab vs Quản Lý tab)
- Severity: Low
- Area: /tai-chinh/hoa-don, /quan-ly/hoa-don
- Evidence: src/constants/routes.ts line 101 (`manageInvoices: '/quan-ly/hoa-don' // redirects → financeInvoices`); /tmp/journey-76 (finance invoices list); Quản Lý tab strip shows "Hóa đơn" as a sibling tab (journey-53)
- Problem: Same page listed in two modules; users learn two mental locations for one artifact. The redirect makes the Quản Lý tab a silent teleport out of the Quản Lý context (breadcrumb flips to Tài Chính).
- Recommendation: DELETE the "Hóa đơn" tab from Quản Lý (keep the redirect for old links). Invoices are financial documents; one home.
- Effort: S

### F-C12: Tồn kho KPI cards present impossible negative aggregates as normal numbers
- Severity: Medium
- Area: /quan-ly-kho/ton-kho
- Evidence: /tmp/journey-27 (Tồn đầu kỳ -1.092 / Tổng tiền -2.993.590.000 đ / Tổng tồn -1.169), -29 (row Số lượng -27 while Bán hàng cap shows "<= 122")
- Problem: Company-wide negative stock and negative inventory value render without any warning styling or explanation; sale form disagrees with stock page about availability of the same item (HH00001: -27 vs <=122). Numbers that can't be trusted are worse than no numbers.
- Recommendation: MODIFY — reconcile the two availability sources (stock view must match the sale cap); style negative aggregates as alerts with a "kiểm kê" call-to-action, or clamp mock data to realistic values.
- Effort: M

### F-C13: Receipt modal uses free-text customer, bypassing the customer entity
- Severity: Medium
- Area: /tai-chinh (Lập Phiếu Thu/Chi)
- Evidence: /tmp/journey-44 (modal: "Tên khách hàng *" plain textbox), vs repair form & sale form using the search picker (journey-13, -37)
- Problem: Receipts store an unlinked string → công nợ and customer history cannot connect payments to customers; three different customer-entry affordances across the app for one concept.
- Recommendation: MODIFY — reuse the shared customer combobox (with free-text fallback flagged as "khách lẻ"), aligning all three money-touching forms on one picker.
- Effort: S

### F-C14: First-save failures on money flows (receipt failed then succeeded unchanged)
- Severity: Medium
- Area: /tai-chinh Lập Phiếu Thu (observed), /khach-hang create (hard fail, F-C1), Bán hàng save (silent, F-C6)
- Evidence: /tmp/journey-45 (error toast on first Lưu), -46 (success toast PTT-20260713-251 on identical retry)
- Problem: Flaky first-attempt failure trains users to double-submit — on financial documents this risks duplicates the day the first attempt actually succeeded server-side.
- Recommendation: FIX — add retry/idempotency on the client call (single-flight with generated document number) and distinguish "server unreachable" from validation errors in the toast copy.
- Effort: M

### F-C15: Technician cannot change ticket status from the KT page or detail page
- Severity: High
- Area: /sua-chua-bao-hanh-kt, /sua-chua-bao-hanh/:id
- Evidence: /tmp/journey-18 (KT rows: only Xem chi tiết + Cập nhật hình ảnh), -19/-20/-21 (detail: print actions, history tables, no status control), -79 (Đổi tình trạng exists only as main-list row action)
- Problem: The core loop "tech finishes repair → set Sửa Xong" requires leaving the technician surface, finding the same ticket again in the receptionist list, and using its row menu: ≥5 extra clicks + a page switch per ticket.
- Recommendation: MODIFY — put "Đổi tình trạng" on the detail page header (both entry routes benefit) and on KT rows. This stands even if F-C3's merge happens later.
- Effort: S

### F-C16: Command palette is navigation-only but presents as global search; header offers two identical affordances
- Severity: Medium
- Area: header "Tìm kiếm ⌘K" button, Ctrl+K palette
- Evidence: /tmp/journey-62/-63 (button and shortcut open the same dialog), -64 (query "PSC-300001" → "Không tìm thấy kết quả" — cannot find tickets), palette options limited to 12 modules + 4 actions (snapshot)
- Problem: A search box labeled "Tìm kiếm" that cannot find a phiếu, customer, or item violates the promise of the label; sub-pages aren't registered either (searches "tồn kho", "chuyển kho", "doanh thu" → module-level hits only).
- Recommendation: MODIFY — phase 1: register all nav-config children + per-page commands (cheap, config exists); phase 2: add entity search (phiếu by id, customer by phone) or relabel the trigger "Đi tới…" so it stops promising data search. Keep one trigger (button = shortcut is fine), no need to delete either.
- Effort: M (phase 1 S)

### F-C17: Sidebar dual-highlight and misleading active state on sub-routes
- Severity: Low
- Area: sidebar (NavLink matching)
- Evidence: /tmp/journey-74 (both "Quản Lý Kho" AND "Xuất Kho" highlighted on an unknown /quan-ly-kho/* route), -75 ("Xuất Kho" still tinted while on /tai-chinh/cong-no after history navigation)
- Problem: Two active items at once destroys the user's "where am I" signal, compounding F-C5's missing sub-nav.
- Recommendation: FIX — use exact-prefix NavLink matching per top route; add the 404 page's module to breadcrumb instead of leaving stale highlights. ("Không tìm thấy trang" page itself says "Đang phát triển — sẽ sớm hoàn thiện", a contradictory message for a 404 — reword.)
- Effort: S

### F-C18: Ngân hàng (bank catalog) lives under Nhân Sự
- Severity: Low
- Area: /nhan-su/ngan-hang vs /danh-muc
- Evidence: /tmp/journey-65/-66 (first tab of Nhân Sự is "Ngân hàng" with Mã/Tên/Địa chỉ columns); README lists ngan-hang as a shared real-API catalog also used by Khách hàng bank fields
- Problem: A shared reference catalog (used by customer bank account fields per README) is filed under HR, where a receptionist maintaining customer data would never look; Nhân Sự's first tab is also its least-used one.
- Recommendation: REARRANGE — move Ngân hàng into Danh Mục (15th catalog tab); keep route redirect. HR keeps payroll-relevant tabs starting at Phòng ban.
- Effort: S

## Proposed IA (revised sidebar/nav sketch)

Ordering principle: daily operations first (frequency), money next, admin last. Merge repair pages; collapse notifications; render sub-tabs everywhere.

```
NGHIỆP VỤ (daily)
├─ Trang chủ                       /trang-chu   (single view; calendar card links to full calendar)
├─ Sửa Chữa-Bảo Hành               /sua-chua-bao-hanh
│    view presets: [Tiếp nhận] [Kỹ thuật (my tickets)]   ← replaces /sua-chua-bao-hanh-kt (redirect)
├─ Khách Hàng                      /khach-hang
├─ Kho                             /kho          ← merges Quản Lý Kho + Xuất Kho into one module,
│    tabs: Tồn kho | Nhập kho | Xuất: Cấp LK | Bán hàng | Trả hàng | Chuyển kho | Thu hồi/Trả LK…
│    (rationale: one physical inventory, in/out are verbs of the same noun; today the split
│     plus missing sub-nav makes 11 pages invisible. If merging modules is too big, minimum
│     viable fix = render tab strips in both existing modules and cross-link Tồn kho row → "Xuất bán".)
├─ Tài Chính                       /tai-chinh
│    tabs: Chứng từ | Công nợ | Hóa đơn        (Quản Lý loses its Hóa đơn tab)
└─ Báo Cáo                         /bao-cao
     tabs: KPI KT | KPI Tiếp nhận | Tình trạng KT | Tình trạng chung | Máy tồn | SCBH KT | Doanh thu | Xuất kho

QUẢN TRỊ (admin, collapsed group header)
├─ Danh Mục                        /danh-muc     (15 tabs: +Ngân hàng from Nhân Sự)
├─ Nhân Sự                         /nhan-su      (9 tabs, Ngân hàng removed)
├─ Quản Lý                         /quan-ly      (Chi nhánh | Người dùng)   ← Hóa đơn tab deleted
└─ Phân Quyền                      /phan-quyen   (could later fold into Quản Lý as a tab;
                                                  keep separate now to match permission model)

HEADER: bell (peek) → /thong-bao only. News dropdown + /tin-tuc deleted.
        "Đi tới…" palette (Ctrl+K) registers every tab above.
REMOVED FROM PROD: /gallery, Demo call-center command.
```

Migration notes: all old URLs keep 301-style redirects (hash router aliases); KT users get the "Kỹ thuật" preset as their default view via role; nav-config children already contain 90% of the tab data — the work is rendering, not modeling.

## Unresolved questions

1. Is the empty-identity-columns defect (F-C1/2) a backend contract change (field renames after the address-normalization release) or an ngrok/API availability issue at review time? Repo suggests recent `khach-hang` schema work (address cascade). Backend panelist should confirm root cause.
2. Is Sửa Chữa-Bảo Hành KT required to stay verbatim for legacy parity (README says taxonomy khớp verbatim)? If parity is contractual, F-C3 becomes "differentiate properly" (add KTV filter + status action to KT) instead of merge.
3. Sale-save silence (F-C6): mock-store bug or intentional out-of-scope (README: "luồng Bán hàng không đổi, không thuộc phạm vi")? If out of scope, at minimum add the failure toast.
4. Should Phân Quyền's "Menu" tab (legacy fa-icon menu tree) drive THIS app's nav someday, or is it pure parity display? Affects whether the admin cluster can be consolidated.
5. Khu vực dual-source (F-C4): which source is canonical for production — the live API region list (empty) or the mock catalog rows?

Status: DONE_WITH_CONCERNS
Summary: Walked all 6 journeys on the live site (created ticket PSC-300001, receipt PTT-20260713-251, ZZTEST region + attempted customer/sale); delivered 18 findings with combine/delete/modify/rearrange verdicts and a revised IA. Two journeys (customer management, kho→sale confirmation) are hard-blocked by live defects, so several IA recommendations are contingent on backend fixes.
Concerns/Blockers: /khach-hang and all real-API lists render blank identity columns; /tin-tuc crashes on dynamic import (both retried); sale save never appears in its list — these limited depth of edit-flow verification. Screenshots live in /tmp (journey-01…84) and are not persisted to the repo.
