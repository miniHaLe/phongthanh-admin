# Ref UI Parity — Group: reports

### Báo cáo tình trạng kỹ thuật (/ReportStatusTechnician/ReportStatusTechnician)

- Ref file: `report-statustechnician.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/reports/KyThuatReportPage.tsx` (partial — nearest match; config 'ky-thuat' in src/mock/reports/report-configs.ts)

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Báo cáo. Box title: **Báo cáo tình trạng kỹ thuật**.

## Filter bar (fieldset "Thông tin tìm kiếm")
| Field | Type | Notes |
|---|---|---|
| Tình trạng | single select `RepairingStatusId` | 15 options w/ per-status color + numeric id: Mới Nhận(1,#FFCC00), Đã Điều Phối(2,#00CCFF), Báo Giá(4,#9966CC), Chờ Báo Giá(15,#31065c), Chờ Xác Nhận(6,#996600), Chờ Linh Kiện(7,#4B0082), Đã Đặt Linh Kiện(17,#112233), Đã Có Linh Kiện(13,#6D5582), Hỏng Khách Trả Lại(11,#CC9911), Chờ Phiếu Hãng(16,#06385c), Trả Lại(8,#CC3300), **Sửa Xong(9,#3300FF — default selected)**, Đã Giao Cho Khách(10,#00FF00), Đã Giao Phiếu Hủy(12,#342c38), Đã Giao Ngoài(14,#009988) |
| Kỹ thuật | text autocomplete `AutoUserTech` → hidden `TechnicianId` | `LoadAutocompleteUserTechinicianNotUserId()` — type name, pick suggestion |
| Từ ngày | datepicker (dd/MM/yyyy) → hidden `FromDate` | default = today |
| Đến ngày | datepicker → hidden `ToDate` | default = today |

## Buttons
- **Xem** (btn-success, submit) — ajax POST `/ReportStatusTechnician/ReportStatusTechnicianPartial`, replaces `#table-update`.

## Result area
- Google Charts **ColumnChart** (`columnchart_values`, height 500): X = Kỹ thuật (technician name), Y = Số lượng (count of tickets in selected status), value annotations on bars, title "Báo cáo kỹ thuật tình trạng {status name}". Empty state: alert "Không có dữ liệu".
- **Drill-down**: clicking a bar loads detail ticket list into `#ResultDetail` via GET `/ReportStatusTechnician/ListRepairingPartial?RepairingStatusId=&TechnicianId=&FromDate=&ToDate=` (detail table columns are a server partial — not captured in trimmed HTML).

## Interactions
- Auto-runs search on page load (`$('.ms-search-btn').click()` in document-ready).
- No table columns in initial page — chart-first report; table only appears via drill-down.
- No pagination controls in captured markup (drill-down partial may paginate server-side).

**Gaps**

| Severity | Gap |
|---|---|
| high | Report itself missing: local 'Báo Cáo Kỹ Thuật' (ky-thuat config) is a flat per-technician summary table (STT, Kỹ thuật viên, Chi nhánh, Tổng phiếu, Hoàn thành, Đang sửa, Quá hạn, Tổng doanh thu, Điểm đánh giá) — it does NOT answer the reference question 'how many tickets in status X per technician'. No status dimension anywhere. |
| high | Missing 'Tình trạng' filter (single-select of the 15 repair statuses with color coding, default Sửa Xong) — the primary input of this report. |
| high | Missing column chart (count per technician for selected status) with click-to-drill-down into the underlying ticket list. Local report has no chart and no drill-down (ReportPage chartSlot exists but is unused for ky-thuat). |
| medium | Missing 'Kỹ thuật' autocomplete filter (search-by-name technician picker); local ky-thuat report only filters by chi nhánh + date range. |
| low | Reference auto-executes the search on page load; local reports show an empty state until the user clicks Tìm kiếm. |
| low | Default date range differs: reference defaults both Từ ngày and Đến ngày to today; local defaults to last 30 days. |

### Báo cáo tình trạng chung (/ReportRepairing/RepairingReportStatus)

- Ref file: `report-repairingstatus.html`
- Local counterpart: MISSING

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Báo cáo tình trạng chung. Box title: **Báo cáo tình trạng chung**.

## Filter bar (fieldset "Thông tin tìm kiếm")
| Field | Type | Notes |
|---|---|---|
| Tên nhà sản xuất | text autocomplete `AutoManufactory` → hidden `ManufactoryId` | `LoadAutocompleteManufactory()`; no label, placeholder only |
| Từ ngày | datepicker → hidden `FromDate` | default = 1 month back |
| Đến ngày | datepicker → hidden `ToDate` | default = today |

## Buttons
- **Tìm kiếm** (btn-success, submit) — ajax POST `/ReportRepairing/RepairingReportStatusPartial`, replaces `#table-update`.

## Result area (side-by-side, 50%/50%)
- Google **ColumnChart** (`columnchart_values`) AND Google **PieChart** (`columnchart_values1`): ticket counts across ALL 15 repair statuses with fixed per-status colors (Đã Đặt Linh Kiện #112233, Chờ Linh Kiện #4B0082, Trả Lại #CC3300, Đã Giao Ngoài #009988, Chờ Phiếu Hãng #06385c, Báo Giá #9966CC, Hỏng Khách Trả Lại #CC9911, Đã Có Linh Kiện #6D5582, Chờ Báo Giá #31065c, Chờ Xác Nhận #996600, Mới Nhận #FFCC00, Đã Giao Cho Khách #00FF00, Đã Giao Phiếu Hủy #342c38, Đã Điều Phối #00CCFF, Sửa Xong #3300FF), value annotations, height 400, title "Báo cáo tình trạng chung".
- Heading **"Danh sách chi tiết"** below charts with two drill-down containers (`#ResultDetail`, `#ResultDetail1`).
- **Drill-down**: clicking a bar (or pie slice) loads ticket list via GET `/ReportRepairing/ListRepairingPartial?ManufactoryId=&FromDate=&ToDate=&RepairingStatusId=` (bar → #ResultDetail, pie → #ResultDetail1). Detail table columns are a server partial — not captured.

## Interactions
- Chart data pre-rendered server-side into the inline script on each search.
- No table/pagination in the initial page; drill-down partial supplies the list.

**Gaps**

| Severity | Gap |
|---|---|
| high | Entire report missing locally. No local page shows the status-distribution overview (count of repair tickets per status). Local report set (sua-chua, ky-thuat, tiep-nhan, xuat-kho, doanh-thu, bao-hanh in src/mock/reports/report-configs.ts) has no status-breakdown report; routes.ts has no /bao-cao/tinh-trang path. |
| high | Missing dual chart visualization (column + pie of all 15 statuses, canonical status colors) with click-to-drill-down ticket list per status segment. |
| medium | Missing 'Nhà sản xuất' (manufacturer) autocomplete filter — this dimension does not exist in any local report filter. |

### Báo cáo máy tồn (/BaoCaoBaoHanh/BaoCaoMayTon)

- Ref file: `report-mayton.html`
- Local counterpart: MISSING

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Báo cáo máy tồn. Box title: **Báo cáo máy tồn** (stagnant/unreturned machines report).

## Filter bar
| Field | Type | Notes |
|---|---|---|
| Chi nhánh | select2 `BranchId` | "Tất cả chi nhánh" + 2 branches (TTBH … Đăk lăk = 1, TTBH … Đăk nông = 3) |
| Xem theo ngày | radio `Type=Day` (default checked) | fields: Từ ngày (datepicker, default 1 month back), Đến ngày (datepicker, default tomorrow) |
| Xem theo tháng | radio `Type=Month` | fields: Năm (number), Từ tháng (number), Đến tháng (number) |
| Xem theo năm | radio `Type=Year` | fields: Từ năm (number), Đến năm (number) |

All three period fieldsets are rendered simultaneously (radio in each legend selects which applies). Hidden `pageNumber` input (class ms-paging-page) → server-side paging of the result partial.

## Buttons (centered bar)
- **Tìm kiếm** (btn-success, `typeName=search`) — ajax POST `/BaoCaoBaoHanh/BaoCaoMayTonPost`, replaces `#ma-list`.
- **Xuất Excel File** (btn-info) — rewires form to GET `/BaoCaoBaoHanh/BaoCaoMayTonExcel` (full-page download with same filters).

## Result area
`#ma-list` placeholder: "Vui lòng nhấn tìm kiếm để hiện kết quả!". Result table columns come from the AJAX partial — not captured in trimmed HTML.

## Interactions
- `#searchDetail` handler (delegated) restores the POST/ajax attributes after an Excel export rewire.

**Gaps**

| Severity | Gap |
|---|---|
| high | Entire report missing locally. No 'máy tồn' (machines sitting in the shop / not yet returned) report exists in REPORT_CONFIGS, routes.ts, or nav-config; grep for mayton/máy tồn in src/ returns nothing. |
| medium | Missing period-mode filter pattern for this report (Day/Month/Year radio with Năm + Từ/Đến tháng + Từ/Đến năm) — locally this tri-mode filter exists only in KpiReportFilterForm, not in the generic ReportPage/baseDateSchema used by the 6 configured reports. |
| medium | Missing 'Xuất Excel File' export wired to this report's data (/BaoCaoBaoHanh/BaoCaoMayTonExcel). |

### Báo cáo KPI Kỹ thuật (breadcrumb: Báo cáo KPI KT SCBH; /BaoCaoBaoHanh/BaoCaoKPIKTV)

- Ref file: `report-kpiktv.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/reports/kpi/KpiReportPage.tsx` (+ KpiReportFilterForm.tsx, KpiResultsTable.tsx, KpiCharts.tsx)

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Báo cáo KPI KT SCBH. Box title: **Báo cáo KPI Kỹ thuật**.

## Filter bar
| Field | Type | Notes |
|---|---|---|
| Chi nhánh | select2 `BranchId` | "Tất cả chi nhánh" + 2 branches |
| Kỹ thuật | select2 **multiple** `TechnicianId` | "Tất cả kỹ thuật" + ~130 technician options (server-rendered) |
| Nhóm sản phẩm | select2 **multiple** `NhomSanPhamId` | "Tất cả nhóm" + 13 groups: MÁY LỌC NƯƠC RO-CÂY NÓNG LẠNH, TI VI LCD, ĐIỆN THOẠI, ĐỒ GIA DỤNG, LINH KIỆN ĐIỆN TỬ, NGUYÊN VẬT LIỆU SỬA CHỬA, DỤNG CỤ SỬA CHỬA, MÁY LẠNH -ĐIỀU HÒA, MÁY GIẶT -MÁY RỬA CHÉN -MÁY SẤY, TỦ LẠNH-TỦ MÁT - TỦ ĐÔNG, THIẾT BỊ ĐIỆN TỬ, Thiết bị vệ sinh, thiết bị thể dục thể thao |
| Xem theo ngày | radio `Type=Day` (default) | Từ ngày / Đến ngày datepickers (defaults: 1 month back → tomorrow) |
| Xem theo tháng | radio `Type=Month` | Năm, Từ tháng, Đến tháng (number inputs) |
| Xem theo năm | radio `Type=Year` | Từ năm, Đến năm (number inputs) |

All three period fieldsets visible at once; hidden `pageNumber` (ms-paging-page) → server-side paging.

## Buttons (centered bar)
- **Tìm kiếm** — ajax POST `/BaoCaoBaoHanh/BaoCaoKPIKTVPost` → `#ma-list`.
- **Xuất Excel File** — GET `/BaoCaoBaoHanh/BaoCaoKPIKTVExcel`.
- **Xuất Excel Luong** — GET `/BaoCaoBaoHanh/BaoCaoKPIKTVLuongExcel`.
- **Xuất Excel 1 Ngày** — GET `/BaoCaoBaoHanh/BaoCaoKPIKTV1NgayExcel`.

## Result area
`#ma-list` placeholder "Vui lòng nhấn tìm kiếm để hiện kết quả!". KPI table columns come from the AJAX partial — not captured in trimmed HTML. No chart in reference page markup.

**Gaps**

| Severity | Gap |
|---|---|
| medium | Kỹ thuật filter: reference is a multi-select (select2 multiple) over the full technician list; local KpiReportFilterForm.tsx uses a free-text Input ('Tìm theo tên…') — cannot select several specific technicians at once. |
| medium | Nhóm sản phẩm filter: reference is a multi-select over 13 named product groups; local uses a free-text Input — no option list, no multi-select. |
| low | Reference shows all three period fieldsets simultaneously (radio in each legend); local mounts only the active mode's fields. Functional parity, different UX. |
| low | Reference Từ tháng/Đến tháng/Năm/Từ năm/Đến năm are plain number inputs; local uses month Selects + bounded number inputs (acceptable modernization). Local additionally disables 'Xuất Excel 1 Ngày' outside day-mode — reference always enables it. |
| low | Reference KPI results are server-paged (hidden pageNumber); local KpiResultsTable renders all rows without pagination. Reference exact KPI column set unverifiable from trimmed HTML (AJAX partial) — local column set (period, kỹ thuật viên, chi nhánh, tổng phiếu, hoàn thành, đang sửa, quá hạn, chi phí) is a plausible but unconfirmed equivalent. |

### Báo cáo KPI Tiếp nhận (/BaoCaoBaoHanh/BaoCaoKPITN)

- Ref file: `report-kpitn.html`
- Local counterpart: MISSING (KpiReportPage.tsx covers only KTV; TiepNhanReportPage.tsx is a different report — a ticket-intake listing, not receptionist KPI)

**Ref spec**

## Heading
Breadcrumb: Trang chủ / Báo cáo KPI Tiếp nhận. Box title: **Báo cáo KPI Tiếp nhận**.

## Filter bar (same layout as KPI KTV)
| Field | Type | Notes |
|---|---|---|
| Chi nhánh | select2 `BranchId` | "Tất cả chi nhánh" + 2 branches |
| Tiếp tân | select2 **multiple** `TechnicianId` | "Tất cả tiếp nhận" + ~34 receptionist options (server-rendered user list) |
| Nhóm sản phẩm | select2 **multiple** `NhomSanPhamId` | "Tất cả nhóm" + same 13 product groups as KPI KTV |
| Xem theo ngày | radio `Type=Day` (default) | Từ ngày / Đến ngày datepickers |
| Xem theo tháng | radio `Type=Month` | Năm, Từ tháng, Đến tháng |
| Xem theo năm | radio `Type=Year` | Từ năm, Đến năm |

Hidden `pageNumber` (ms-paging-page) → server-side paging.

## Buttons
- **Tìm kiếm** — ajax POST `/BaoCaoBaoHanh/BaoCaoKPITNPost` → `#ma-list`.
- **Xuất Excel File** — GET `/BaoCaoBaoHanh/BaoCaoKPITNExcel`. (Only ONE export — no Lương / 1 Ngày variants, unlike KPI KTV.)

## Result area
`#ma-list` placeholder "Vui lòng nhấn tìm kiếm để hiện kết quả!". Result columns from AJAX partial — not captured.

**Gaps**

| Severity | Gap |
|---|---|
| high | Report missing locally: there is no receptionist-KPI page. Local KpiReportPage (route /bao-cao/kpi) is technician-only ('Kỹ thuật viên' field, KpiRow keyed by kyThuat). Local TiepNhanReportPage (/bao-cao/tiep-nhan) is a per-ticket intake list (Số phiếu, Ngày tiếp nhận, Khách hàng, SĐT, Thiết bị, Triệu chứng, NV tiếp nhận, Chi nhánh, Trạng thái, Ghi chú) — not an aggregated KPI per receptionist over Day/Month/Year periods. |
| medium | Missing 'Tiếp tân' multi-select filter (choose specific receptionists) and 'Nhóm sản phẩm' multi-select — TiepNhanReportPage exposes only chi nhánh + date range (baseDateSchema). |
| medium | Missing period-mode filter (Day/Month/Year radio) for the tiếp nhận domain; local tiep-nhan report supports only a date range. |
| low | Export: reference has a single 'Xuất Excel File'; if implemented by cloning the local KPI page, drop the extra Lương/1 Ngày export items for the TN variant. |

### Báo cáo sửa chữa Kỹ thuật / Báo cáo SCBH Kỹ thuật (/BaoCaoChiPhiBaoHanh/RepairingReportChiPhi8)

- Ref file: `report-scbh-kythuat.html`
- Local counterpart: `/home/hale/code/phongthanh-admin/src/pages/reports/BaoHanhReportPage.tsx` (partial — nearest by domain: warranty-cost 'bao-hanh' config)

**Ref spec**

## Heading
Breadcrumb: Trang chủ / **Danh sách phiếu sửa chữa**. Box title: **Báo cáo sửa chữa Kỹ thuật** (warranty-repair cost report per technician — controller BaoCaoChiPhiBaoHanh).

## Filter bar (fieldset "Thông tin tìm kiếm")
| Field | Type | Notes |
|---|---|---|
| Kỹ thuật | select `TechnicianId` (select2, class ListTechId) | options loaded via AJAX helper `GetComboboxAjaxText("", ".ListTechId", "GetTechAll", "Kỹ thuật")` — full technician list |
| Từ ngày | datepicker → hidden `FromDate` | default = 1 month back (24/06/2026) |
| Đến ngày | datepicker → hidden `ToDate` | default = 1 month ahead of Từ ngày (24/07/2026) |

## Buttons
- **Xem Báo Cáo** (btn-success, id searchAll) — rewires form to ajax POST `/BaoCaoChiPhiBaoHanh/ListRepairingPartial8` → replaces `#ma-list`; calls `setDefaultPageding("list")` (server-side paging of result partial).
- **Xuất Excel** (btn-info) — rewires form to GET `/BaoCaoChiPhiBaoHanh/ExcelRepairingChiPhiList8` (download with same filters).

## Result area
`#ma-list` initially empty. Detail/cost table columns come from the AJAX partial (ListRepairingPartial8) — not captured in trimmed HTML; expected content is the list of repair tickets with warranty repair costs (chi phí) per technician.

## Interactions
- Form default action is `/BaoCaoChiPhiBaoHanh/ListRepairingPartial` (data-ajax POST → #ma-list) but the Xem Báo Cáo button always retargets to the ...Partial8 variant before submit.
- No chart; pure filtered list + Excel export.

**Gaps**

| Severity | Gap |
|---|---|
| high | No true local equivalent: reference is a warranty repair COST report scoped per technician (BaoCaoChiPhiBaoHanh, ChiPhi8 endpoints). Local 'Báo Cáo Bảo Hành' (bao-hanh config) is a generic warranty ticket list (Số phiếu, Ngày bảo hành, Khách hàng, Thiết bị, Loại bảo hành, Lỗi phát sinh, Kỹ thuật, Chi nhánh, Trạng thái, Tổng chi phí) filtered only by chi nhánh + date — column overlap exists but reference exact detail columns (AJAX partial) were not verifiable, and per-technician cost focus is absent. |
| medium | Missing 'Kỹ thuật' select filter (AJAX-populated technician dropdown) on the local bao-hanh report — filtering by technician is the report's primary axis. |
| low | Button label differs: reference 'Xem Báo Cáo' vs local 'Tìm kiếm'; reference pairs it with a direct 'Xuất Excel' button (local uses an Excel dropdown menu — acceptable). |
| low | Reference result list is server-paged (setDefaultPageding); local ReportResultsTable renders all mock rows without pagination. |

## Group summary

Compared 6 legacy report pages against the React rebuild's 7 report pages. The sets diverge heavily. Matches: report-kpiktv.html maps well to KpiReportPage (src/pages/reports/kpi/) — main gaps are multi-select Kỹ thuật/Nhóm sản phẩm filters replaced by free-text inputs. Partial matches: report-statustechnician.html loosely maps to KyThuatReportPage but the local page lacks the core status filter, per-technician column chart, and drill-down ticket list; report-scbh-kythuat.html loosely maps to BaoHanhReportPage but lacks the technician filter and cost-report focus. Fully MISSING locally: report-repairingstatus.html (Báo cáo tình trạng chung — column+pie charts of ticket counts across 15 statuses with drill-down, manufacturer filter), report-mayton.html (Báo cáo máy tồn — stagnant machines with Day/Month/Year period modes + Excel), report-kpitn.html (Báo cáo KPI Tiếp nhận — receptionist KPI with Tiếp tân/Nhóm sản phẩm multi-selects; local KPI page is technician-only). Conversely, local xuat-kho and doanh-thu reports have no counterpart among the assigned reference files. Caveat: all reference result tables are AJAX partials stripped from the mirror, so exact reference column headers for results could not be extracted — column-level parity for KPI/máy tồn/SCBH tables is unverified.

Unresolved questions:

- Should Báo cáo KPI TN extend KpiReportPage (mode switch) or be its own route?
- Should the legacy 15-status color palette become the canonical status colors for charts?
