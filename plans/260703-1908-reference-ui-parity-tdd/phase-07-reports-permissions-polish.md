---
phase: 7
title: "Reports + permissions + polish"
status: completed
effort: "L"
---

> **Completed 2026-07-07.** Gate clean: `test` 440 pass (125 files, deterministic ×4), fresh `tsc --noEmit`, `lint` (0 errors), `build` all green. Main session landed shared foundation (pt-permissions store key, report routes/nav rewired to the 6-canonical + 2-local-extra set per V5, retired SuaChua/TiepNhan pages). 2 parallel agents: reports (R1-R8 — status-per-technician column chart + drill-down, tình trạng chung column+pie, máy tồn tri-mode, KPI KTV multi-selects + 3 exports, KPI Tiếp nhận own route, SCBH cost list, shared period-mode-filter, §5b palette), permissions (menu tree ~66 nodes + 202-cell function matrix, pt-permissions localStorage, no enforcement). Main session did admin A1 Chi Nhánh (Hotline/Người liên hệ/Toạ độ/Chính/Chuyển CN + map) + A2 Người Dùng (Điện thoại/Quyền/Khóa toggle/Chi nhánh phụ) — A3 account profile already from P2; cross-cutting sweep (X1 security grep clean — all export/print/external via P2 F7/F8/F9 helpers, converted the last raw window.open in ImageUploadSection to anchor-download; X2 no dead-seed/bucket/snake-status refs); X3 docs (README + ARCHITECTURE). Also eliminated a class of 5%-error-injection test flake globally by pinning Math.random in test setup.

## Plan complete
All 7 phases done. Final: 440 tests / 125 files, tsc + lint + build clean, deterministic. Legacy 15-status vocab everywhere, reference columns/taxonomies verbatim, 3 branches, security helpers (F7/F8/F9) the only print/export/external paths, no dead-seed refs, no second KhuVuc symbol.

# Phase 7: Reports + permissions + polish

## Overview

Final phase: implement the reference's 6 canonical reports (replacing/retiring the invented local report set), build the permission-assignment mocks (Nhóm Quyền menu-tree + RoleMenu 202-checkbox function matrix), correct the Chi nhánh / Người dùng admin pages, add the /User/Detail account-profile page, and run the cross-cutting completeness sweep (bulk-select/delete + Lưu & Thêm mới + Excel export everywhere the reference has them, dead-code removal, docs update). Consumes P1 legacy-15 status palette (chart colors) and P2 `export-xlsx` + bulk-select + autocomplete-create primitives.

## Context links

- Spec (contract): `plans/reports/ref-ui-parity-sections/section-reports.md` (6 reports) and `section-admin-perm-account.md` (7 pages incl. permission matrix + User/Detail) — read BOTH fully incl. `## Addendum — verified from mirrored partials (260703)` (Role/RoleMenu list columns verified). Status palette in gap matrix §5b.
- Local code consumed: `src/pages/reports/*` (7 pages + kpi/), `src/components/reports/*`, `src/mock/reports/{report-configs,report-types,kpi-mock,sua-chua-report-mock}.ts`, `src/pages/phan-quyen/*` (4), `src/pages/quan-ly/*` (3), `src/config/crud-configs/{chi-nhanh,nguoi-dung,nhom-quyen,menu,chuc-nang}.config.ts`, `src/constants/routes.ts`, `src/config/nav-config.tsx`, `src/routes/index.tsx`, `src/components/shell/UserMenu.tsx`, README.md, ARCHITECTURE.md.
- P1 outputs: legacy 15-status module (ids+hex) for chart palettes + status single-select. P2: `export-xlsx.ts`, DataTable bulk-select, ServerAutocomplete + `[+]`, map modal (from P2 shell), print-window.
- Open decisions (from plan.md §"Open decisions" + Validation Log): **#2 OVERRIDDEN by validation V5 — reference 6 reports + `Doanh Thu`/`Xuất Kho` kept as local extras** (only SuaChua/TiepNhan retired); #3 permission matrix as working mock, localStorage-persisted, no enforcement.

## Requirements

**Exact Vietnamese labels + status ids/hex are normative.** Charts use the canonical 15-status palette (§5b).

### Reports (bao-cao) — reference 6 canonical

- **R1 Báo cáo tình trạng kỹ thuật** (`/bao-cao/tinh-trang-ky-thuat`, rework `KyThuatReportPage`) — filters: **Tình trạng** single-select (15 statuses, per-status color, default **Sửa Xong**), **Kỹ thuật** autocomplete, Từ ngày/Đến ngày (default today). Result: **column chart** (X = technician, Y = count of tickets in selected status, bar annotations, title `Báo cáo kỹ thuật tình trạng {status}`), empty state `Không có dữ liệu`. **Drill-down**: click bar → ticket-list table below. Auto-runs on load. Button **Xem**.
- **R2 Báo cáo tình trạng chung** (NEW `/bao-cao/tinh-trang-chung`) — filters: **Nhà sản xuất** autocomplete, Từ ngày (1 month back)/Đến ngày (today). Result: side-by-side **column chart + pie chart** of ticket counts across all 15 statuses (fixed §5b colors), value annotations, title `Báo cáo tình trạng chung`. Heading `Danh sách chi tiết` below with drill-down containers (bar → list1, pie → list2). Button **Tìm kiếm**.
- **R3 Báo cáo máy tồn** (NEW `/bao-cao/may-ton`) — filters: Chi nhánh select (Tất cả + 2 branches), **Day/Month/Year tri-mode** radio (Xem theo ngày: Từ/Đến ngày; Xem theo tháng: Năm + Từ/Đến tháng; Xem theo năm: Từ/Đến năm). Result: paged list table (mock columns — stagnant/unreturned machines). Buttons **Tìm kiếm** + **Xuất Excel File**.
- **R4 Báo cáo KPI Kỹ thuật** (`/bao-cao/kpi`, rework `KpiReportPage`) — filters: Chi nhánh select, **Kỹ thuật** select2-multiple (full technician list, "Tất cả kỹ thuật"), **Nhóm sản phẩm** select2-multiple (13 named groups: `MÁY LỌC NƯƠC RO-CÂY NÓNG LẠNH`, `TI VI LCD`, `ĐIỆN THOẠI`, `ĐỒ GIA DỤNG`, `LINH KIỆN ĐIỆN TỬ`, `NGUYÊN VẬT LIỆU SỬA CHỬA`, `DỤNG CỤ SỬA CHỬA`, `MÁY LẠNH -ĐIỀU HÒA`, `MÁY GIẶT -MÁY RỬA CHÉN -MÁY SẤY`, `TỦ LẠNH-TỦ MÁT - TỦ ĐÔNG`, `THIẾT BỊ ĐIỆN TỬ`, `Thiết bị vệ sinh`, `thiết bị thể dục thể thao`), Day/Month/Year tri-mode. Result: KPI table. Buttons **Tìm kiếm**, **Xuất Excel File**, **Xuất Excel Luong**, **Xuất Excel 1 Ngày**. Replace free-text technician/group filters with the multi-selects.
- **R5 Báo cáo KPI Tiếp nhận** (NEW `/bao-cao/kpi-tiep-nhan`) — same layout as R4 but **Tiếp tân** multi-select (receptionist list, "Tất cả tiếp nhận") + Nhóm sản phẩm multi-select + Day/Month/Year. Result: KPI table. Button **Tìm kiếm** + **Xuất Excel File** (single export only). Its own route (not a mode-switch on R4).
- **R6 Báo cáo SCBH Kỹ thuật** (`/bao-cao/scbh-ky-thuat`, rework `BaoHanhReportPage`) — filters: **Kỹ thuật** select (full list), Từ ngày (1 month back)/Đến ngày. Result: paged per-technician warranty-cost list. Buttons **Xem Báo Cáo** + **Xuất Excel**.
- **R7 Report nav = reference 6 + 2 local extras (validation V5 — OVERRIDES open decision #2):** the report nav is the reference 6 canonical reports **plus `Doanh Thu` and `Xuất Kho` retained as local additions** (user chose to keep them). Only `Phiếu sửa chữa` (SuaChua) and `Tiếp nhận`-intake — which are redundant with reference reports — are retired from nav/routes. `Doanh Thu`/`Xuất Kho` keep their pages/routes/configs; optionally group them under a "Báo cáo nội bộ (local)" label to signal they're extensions, not reference parity.
- **R8 Generalize tri-mode period filter**: lift the Day/Month/Year radio from `KpiReportFilterForm` into a shared `PeriodModeFilter` reused by R3/R4/R5. Add **Nhà sản xuất** filter dimension where specced (R2).

### Permissions (phan-quyen) — working mocks (open decision #3)

- **P1 Nhóm Quyền** (`NhomQuyenPage`) — list columns exact: `## | [☑ Chọn tất cả] | Mã | Nhóm quyền | Chọn`. Per-row: **view** (fa-eye `ms-view-role` — read-only granted-permissions view) + edit. Bulk delete. Right form `Thông tin nhóm quyền`: Mã, Nhóm quyền, + **Danh sách quyền menu-tree** (~50-node checkbox tree mirroring sidebar hierarchy per spec, parent checks children). `Lưu` / `Lưu & Thêm mới`. Persist checked node ids in localStorage (no enforcement).
- **P2 Menu / RoleMenu** (`MenuPage`) — list columns exact: `## | [☑ Chọn tất cả] | Tên danh mục | Danh mục cha | Icon | Link | Number | Chọn`. Toolbar filter **Danh mục cha** typeahead autocomplete. Bulk delete. Right form `Thông tin danh mục`: Danh mục cha autocomplete (any menu as parent), Tên danh mục, Link, Class icon, Số thứ tự, + **202-checkbox function-permission matrix** (41 groups × Xem/Thêm/Sửa/Xóa + special actions per spec, bonsai-style tree). `Lưu` / `Lưu & Thêm mới`. Persist checkbox state in localStorage. Show Icon column (unhide), remove invented Trạng thái.
- **P3 Chức Năng** (`ChucNangPage`) — reference page is HTTP 500 (broken); keep local as hierarchical function records (entity group → action leaves: Xem/Thêm/Sửa/Xóa + specials) so it can back the P2 matrix. Model = parent/child function taxonomy feeding RoleMenu matrix rows.

### Admin (quan-ly) + account

- **A1 Chi Nhánh** (`ChiNhanhPage`) — columns exact: `[☑ Chọn tất cả] | Chi nhánh | Điện thoại | Hotline | Người liên hệ | Email | Địa chỉ | Chính | Chuyển CN | Chọn` (Chính/Chuyển CN = read-only checkboxes). Form: Tên chi nhánh*, Điện thoại, Hotline, Địa chỉ textarea, Người liên hệ, Email, **Toạ độ** (tooltip `Nhập tọa độ VD(21.029743, 105.833882)`), Chi nhánh chính checkbox, Chuyển chi nhánh checkbox (default checked). Toolbar **map button** (`Sơ đồ chi nhánh` → Bản đồ chi nhánh modal from P2, plots Toạ độ). Bulk delete. `Lưu` / `Lưu & Thêm mới`. Remove invented Mã CN/Tỉnh thành/Trạng thái.
- **A2 Người Dùng** (`NguoiDungPage`) — columns exact: `STT | [☑ Chọn tất cả] | Chi nhánh | Tên đăng nhập | Tên đầy đủ | Điện thoại | Email | Quyền | Khóa | Chọn`. Add **Khóa/Mở khóa** one-click toggle (red `Khóa tài khoản` / green `Mở khóa tài khoản`, `data-lock`). Add Điện thoại + **Chi nhánh phụ** (multi-branch) to model/form. Bulk delete. Header **Thêm người dùng** (→ create page/sheet). Remove read-only Trạng thái text column (replaced by Khóa toggle).
- **A3 Thông Tin Tài Khoản** (NEW `/tai-khoan` — may already exist from P2; if so, verify/complete) — read-only profile: Chi nhánh, Tên đăng nhập, Họ và tên, Điện thoại, Email, Khóa tài khoản, Quyền, **Chi nhánh phụ** (comma-separated). Reached from UserMenu. Two-column layout, no actions.
- **A4 Đổi Mật Khẩu** (`ChangePasswordPage`) — low-priority: optionally render inside AppShell with breadcrumb `Trang chủ / Đổi mật khẩu`; field labels `Mật khẩu cũ` / `Mật khẩu mới` / `Nhập lại mật khẩu`; submit `Đổi mật khẩu`. Keep local zod validation as enhancement.

### Cross-cutting completeness sweep

- **X1** Audit every catalog/list page (P3–P7): confirm bulk-select + `Chọn tất cả` + bulk-delete present wherever the reference has it; `Lưu & Thêm mới` on every master-detail form; Excel export on every list the reference exports; per-row prints wired. Fix stragglers. **Security audit (Findings 7-9 + red-team C3):** confirm every Excel/CSV export routes through P2 `export-xlsx` (F8 neutralization), every print through P2 `print-window` (F7), and every external/map link through P2 `openExternal` (F9). Grep for raw `document.write`, `XLSX.writeFile`, `window.open(` **AND `createObjectURL`/`mockCsvDownload`/`a.click()`** — the last set is the C3 blind spot the first grep misses (`export-excel-menu.tsx`'s Blob+CSV path). `src/components/reports/export-excel-menu.tsx` must have been re-routed through the hardened exporter in P2; verify it here.
- **X2** Grep + remove dead code: invented status enums (incl. any residual snake status ids / `STATUS_BUCKET` / `qua_han`), any leftover dead-seed refs (`SEED_REPAIR_TICKETS`/`SEED_CUSTOMERS`/`SEED_FINANCIALS` — should already be zero after P1's D5 deletion), retired report configs/files, unused generic StockFilterBar/PeriodRangePicker if fully superseded, orphaned mock fns.
- **X3** Docs: update README.md (14-section list → reference-aligned nav, new pages, statuses) + ARCHITECTURE.md (new modules: warehouse/finance domains, line-item editor usage, export/print/bulk/openExternal primitives, Kỳ + Tỉnh/Quận/Xã + `TUYEN` lookups, permission mock, legacy-15 status module, **and the D5 data-layer map — which live layer each section reads**).

## Architecture

- **Charts**: use a charting lib already present (Recharts per ARCHITECTURE `BUCKET_HEX` note) — column + pie with the §5b 15-status palette; `BUCKET_HEX` replaced/extended by the legacy status hex map from P1. Drill-down = click handler sets a filter → renders ticket list below (reuse `report-results-table`).
- **Report host**: extend `report-page.tsx` / `report-configs.ts` to support (a) chart-first reports (R1/R2), (b) tri-mode period filter (R3/R4/R5 via shared `PeriodModeFilter`), (c) multi-select filters (R4/R5), (d) Nhà sản xuất dimension. Each of the 6 reports = a config + result renderer.
- **Permission matrix**: static tree data structures (menu hierarchy for P1 ~50 nodes; function matrix for P2 41 groups × actions). Checkbox state persisted via a zustand slice → localStorage key `pt-permissions` (added to `ALL_STORE_KEYS` for resetDemo). No runtime enforcement — pure UI mock. Tree component = shadcn checkbox + collapsible (parent toggles children).
- **Chi nhánh map**: reuse P2 Bản đồ chi nhánh modal; plot from Toạ độ strings.
- **Người dùng lock**: mock mutation toggles `locked` + `data-lock`; sort active-first.
- **Report nav (V5)**: keep `DoanhThuReportPage`/`XuatKhoReportPage` (local extras — retained in nav + routes); retire only `SuaChuaReportPage`/`TiepNhanReportPage` (redundant with reference reports) from `nav-config.tsx` + `routes.ts` (or keep as redirects). Update `report-configs.ts` accordingly.

## Related Code Files

- Create: `src/pages/reports/TinhTrangChungReportPage.tsx` (R2), `src/pages/reports/MayTonReportPage.tsx` (R3), `src/pages/reports/kpi/KpiTiepNhanReportPage.tsx` (R5) (+ tests)
- Create: `src/components/reports/period-mode-filter.tsx`, `src/components/reports/status-column-chart.tsx`, `src/components/reports/status-pie-chart.tsx`, `src/components/reports/report-drilldown.tsx`
- Create: `src/features/permissions/{menu-permission-tree.tsx,function-permission-matrix.tsx}` + `src/store/permission-store.ts` (+ tests)
- Create: `src/pages/quan-ly/TaiKhoanPage.tsx` (A3, if not delivered by P2)
- Create: config spec test files (report filters/columns, permission tree node counts)
- Modify: `src/pages/reports/{KyThuatReportPage,BaoHanhReportPage}.tsx` (R1/R6 rework), `src/pages/reports/kpi/{KpiReportPage,KpiReportFilterForm}.tsx` (R4 multi-selects), `src/mock/reports/{report-configs,report-types,kpi-mock}.ts`, `src/components/reports/report-page.tsx`
- Modify: `src/pages/phan-quyen/{NhomQuyenPage,MenuPage,ChucNangPage}.tsx` + configs, `src/pages/quan-ly/{ChiNhanhPage,NguoiDungPage}.tsx` + configs
- Modify: `src/constants/routes.ts` (add R2/R3/R5 + tinh-trang-ky-thuat/scbh; remove only SuaChua/TiepNhan), `src/config/nav-config.tsx` (report children = ref 6 + Doanh Thu/Xuất Kho local extras — V5), `src/routes/index.tsx`, `src/components/shell/UserMenu.tsx` (→ /tai-khoan), `src/store/app-store.ts` or store-keys (add pt-permissions), README.md, ARCHITECTURE.md
- Delete: `SuaChuaReportPage`/`TiepNhanReportPage` (only these — V5 keeps Doanh Thu/Xuất Kho); dead invented-status/mock code found in X2

## TDD Plan

1. **Characterization tests**: existing 7 report pages render + filter; KpiReportPage current behavior; permission CRUD pages render; Chi nhánh/Người dùng lists render; UserMenu links resolve. Lock before rework.
2. **Failing spec tests (cite section files)**:
   - R1: filter has Tình trạng single-select with 15 options + default `Sửa Xong`; Kỹ thuật autocomplete present; renders a column chart; auto-runs on mount (results present without clicking); bar click renders drill-down list.
   - R2: page mounts at `/bao-cao/tinh-trang-chung`; renders column + pie; both use §5b palette (assert `Mới Nhận`=`#FFCC00`, `Sửa Xong`=`#3300FF`); Nhà sản xuất filter present.
   - R3: mounts at `/bao-cao/may-ton`; tri-mode radio `['Xem theo ngày','Xem theo tháng','Xem theo năm']`; Xuất Excel File button calls `exportToXlsx`.
   - R4: Kỹ thuật + Nhóm sản phẩm are multi-selects; Nhóm options === the 13-group list; 3 export buttons `['Xuất Excel File','Xuất Excel Luong','Xuất Excel 1 Ngày']`.
   - R5: mounts at `/bao-cao/kpi-tiep-nhan`; Tiếp tân multi-select present; single export `Xuất Excel File`.
   - R6: Kỹ thuật select present; buttons `Xem Báo Cáo` + `Xuất Excel`.
   - R7 (V5): nav report children === the 6 reference labels **plus `Doanh Thu` + `Xuất Kho` (local extras kept)**; only `SuaChua`/`TiepNhan` report routes 404/removed. Assert Doanh Thu/Xuất Kho nav entries STILL present.
   - Permissions: `menu-permission-tree` renders ~50 nodes, parent toggles children, state persists to `pt-permissions`; `function-permission-matrix` renders 41 groups + 202 checkboxes; Nhóm Quyền list has `## | Mã | Nhóm quyền` + view action; Menu list has `Tên danh mục | Danh mục cha | Icon | Link | Number` + Danh mục cha filter.
   - Admin: Chi nhánh headers === A1 list; form has Toạ độ + Chính + Chuyển CN; map button opens modal. Người dùng headers === A2 list incl. Khóa; lock toggle flips state; A3 profile shows Chi nhánh phụ.
3. **Implementation order to green**: period-mode-filter + chart components → report-configs/report-page extension → 6 reports (R1/R4/R6 rework, R2/R3/R5 new) → retire invented (R7) → permission store + tree + matrix → 3 permission pages → Chi nhánh/Người dùng/TaiKhoan → cross-cutting sweep (X1) → dead-code (X2) → docs (X3) → full suite + gates.

## Implementation Steps

1. **`period-mode-filter.tsx`**: lift Day/Month/Year tri-mode from KpiReportFilterForm into a reusable component (all three fieldsets visible, radio selects active) — used by R3/R4/R5.
2. **Chart components**: `status-column-chart` + `status-pie-chart` (Recharts, §5b 15-status palette, value annotations, empty state `Không có dữ liệu`) + `report-drilldown` (click → ticket list via `report-results-table`).
3. **Report host extension** (`report-page.tsx`, `report-configs.ts`, `report-types.ts`): support chart-first reports, tri-mode filter, multi-select filters, Nhà sản xuất dimension, auto-run-on-load flag.
4. **R1 KyThuat rework**: status single-select (15, default Sửa Xong) + Kỹ thuật autocomplete + column chart per technician + drill-down + auto-run.
5. **R2 Tình trạng chung (new)**: NSX autocomplete + column+pie of 15 statuses + dual drill-down. Route + nav.
6. **R3 Máy tồn (new)**: Chi nhánh + tri-mode + paged list + Xuất Excel File. Route + nav.
7. **R4 KPI KTV rework**: Kỹ thuật + Nhóm sản phẩm multi-selects (13 groups) + tri-mode + 3 exports.
8. **R5 KPI Tiếp nhận (new)**: Tiếp tân + Nhóm sản phẩm multi-selects + tri-mode + single export. Own route + nav.
9. **R6 SCBH Kỹ thuật rework**: Kỹ thuật select + per-technician cost list + Xem Báo Cáo/Xuất Excel.
10. **R7 Report nav (V5)**: keep Doanh Thu/Xuất Kho (local extras); retire only SuaChua/TiepNhan nav children + routes; update report-configs; report nav = ref 6 + 2 local.
11. **Permission store + components**: `permission-store.ts` (localStorage `pt-permissions`, add to ALL_STORE_KEYS); `menu-permission-tree` (~50 nodes); `function-permission-matrix` (41 groups × Xem/Thêm/Sửa/Xóa + specials, 202 checkboxes).
12. **Permission pages**: NhomQuyen (list `## | Mã | Nhóm quyền` + view + tree form + bulk); Menu (list 7-col + Danh mục cha filter + matrix form + bulk); ChucNang (hierarchical function taxonomy).
13. **Chi nhánh + Người dùng + TaiKhoan**: A1 columns/form/map/bulk; A2 columns + Khóa toggle + Chi nhánh phụ; A3 profile page + UserMenu link; A4 optional in-shell change-password labels.
14. **Cross-cutting sweep (X1)**: audit P3–P6 outputs for bulk/save-new/export/print completeness; fix gaps.
15. **Dead code (X2)** + **docs (X3)**: grep-remove invented statuses/retired reports/orphan mocks; update README + ARCHITECTURE.
16. Run `npm run test` → green; `npm run type-check && npm run lint && npm run build`; final grep for retired report ids + invented status ids + dead-seed refs (`SEED_REPAIR_TICKETS`/`SEED_CUSTOMERS`/`SEED_FINANCIALS`) + raw `document.write`/`XLSX.writeFile`/`window.open(` bypassing the P2 helpers — all confirm clean.

## Success Criteria

- [ ] 6 reference reports implemented with exact filters + charts: R1 status-per-technician column chart + drill-down (default Sửa Xong), R2 column+pie 15-status (§5b colors) + NSX filter, R3 máy tồn tri-mode + Excel, R4 KPI KTV multi-selects + 3 exports, R5 KPI Tiếp nhận (own route) + single export, R6 SCBH cost report + technician filter.
- [ ] Only `SuaChua` + `TiepNhan`-intake reports retired from nav/routes; **`Doanh Thu` + `Xuất Kho` kept as local extras** (V5); report nav = reference 6 + 2 local.
- [ ] Nhóm Quyền menu-tree (~50 nodes) + Menu 202-checkbox function matrix render, toggle parent→children, persist to localStorage (`pt-permissions`), reset by resetDemo; no runtime enforcement.
- [ ] Chi nhánh: Hotline/Người liên hệ/Email/Chính/Chuyển CN columns + Toạ độ/checkboxes form + map modal + bulk delete. Người dùng: Điện thoại + Quyền + Khóa toggle + Chi nhánh phụ. /User/Detail profile page reachable from UserMenu with Chi nhánh phụ.
- [ ] Cross-cutting sweep complete: bulk-select/delete, Lưu & Thêm mới, Excel export, per-row prints present everywhere the reference has them (verified across P3–P7 pages).
- [ ] Charts use canonical legacy-15 palette; grep finds no invented status ids, retired report ids, or dead-seed refs; all export/print/external-link sites route through the P2 F7/F8/F9 helpers (no raw bypass); dead code removed.
- [ ] README + ARCHITECTURE updated for new modules/entities/statuses.
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` all clean; app has zero dead routes and 0 console errors on every page (browser spot-check).

## Risk Assessment

- **Chart drill-down + palette correctness** → reuse existing Recharts setup; palette is data from §5b (single source in P1 status module); drill-down is a filtered re-render of an existing table component — low risk.
- **202-checkbox matrix performance/complexity** → static tree data + controlled checkbox state in one zustand slice; virtualize only if render lags (unlikely at 202). Parent/child toggle logic unit-tested.
- **Retiring invented reports may orphan nav/command-palette/deep-links** → grep all references (nav-config, routes, command-registry, dashboard tiles) before deleting; convert removed routes to redirects if any inbound links remain.
- **Cross-cutting sweep scope creep** → X1 is an audit of prior-phase outputs, not new build; timebox to fixing confirmed stragglers, log any deferred to report.
- **Reference report result columns unverified** (AJAX partials not mirrored) → KPI/máy tồn/SCBH result tables use plausible mock columns; flag as unverified in report; charts + filters (the verified parts) are exact.
- **Rollback**: changes confined to `src/pages/reports/**`, `src/components/reports/**`, `src/mock/reports/**`, `src/pages/phan-quyen/**`, `src/pages/quan-ly/**`, `src/features/permissions/**`, `src/store/permission-store.ts`, routes/nav/UserMenu, docs — single phase-commit revert restores Phase-6 state; `pt-permissions` localStorage key is additive.

## Unresolved

1. **Reference report result-table columns** (KPI KTV, KPI TN, Máy tồn, SCBH) — AJAX partials not mirrored; mock column sets are plausible but unverified. Confirm against live app or accept mock columns.
2. **KPI TN vs KPI KTV** — implemented as separate routes (R5 own route) per spec unresolved-question default; confirm not a mode-switch on R4.
3. **Permission matrix ↔ ChucNang backing** — RoleFunction reference page is HTTP 500; function taxonomy (41 groups + special actions) reconstructed from the RoleMenu tree spec; confirm the group/action list is complete enough.
4. **RESOLVED (validation V5):** Doanh Thu / Xuất Kho have no reference counterpart — **kept as local-only extras** in the report nav (user chose retain over retire). Only SuaChua/TiepNhan (redundant with reference reports) are retired.
5. **Chi nhánh phụ storage** — multi-secondary-branch on User model; assuming an array FK; confirm shape for /User/Detail + Người dùng form.
6. **Đổi Mật Khẩu placement** — A4 in-shell vs standalone is low-priority cosmetic; default keep standalone, only align labels. Confirm if in-shell move is wanted.
