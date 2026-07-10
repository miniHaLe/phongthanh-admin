# Reference UI Parity — Master Gap Matrix

Synthesis of 12 per-section analyses in `ref-ui-parity-sections/`. Legacy AdminLTE admin (phongthanh) vs React rebuild. Severity counts: **88 high / 121 medium / 75 low** across ~50 reference pages.

## 1. TL;DR

- Rebuild covers the read-only skeleton; nearly all transactional workflows missing (status change, dispatch, báo giá, giao máy, duyệt, thanh toán công nợ, trả hãng, in phiếu, SMS, Excel export).
- 12 reference pages have NO local counterpart, incl. the top-level technician board `Sửa Chữa-Bảo Hành KT` (/RepairingM) and the entire notification/News surface.
- Repair workspace (Index_8): local invented a 16-status vocabulary; reference has 15 fixed color-coded statuses driving legend counts, row actions, prints, KT-scoped subsets. Row actions, multi-select batches, dispatch, quote, progress column all absent.
- Reference home = FullCalendar "Kế hoạch của bạn" plan calendar; local = KPI dashboard. Calendar has no local equivalent.
- SignalR call-center (toast "Có cuộc gọi mới !" → Tiếp nhận → repair intake) — reception's primary entry trigger — missing globally.
- Many local data models are invented, not ported: Công nợ, Trả hàng, Chấm công, Phí giao, Khu vực, Lỗi sửa chữa, Thời hạn, ChungTu taxonomy, repair statuses.
- Permission system is metadata-only locally; reference has ~50-node menu tree (Nhóm Quyền) + 202-checkbox function matrix (Menu).
- Cross-cutting CrudTablePage gaps: no bulk select/delete, no "Lưu & Thêm mới", no Excel export, no autocomplete-with-[+]-quick-create, no per-row print, no full-page line-item editors, no Kỳ (payroll/accounting period) entity.
- Tỉnh→Quận→Xã admin hierarchy + Tuyến/delivery-fee model absent; breaks Khu vực, Phường/Xã, Customer, repair filters.
- IA redesign (flat frequency-ranked sidebar) is intentional and mostly fine; content-level parity is the problem, not nav cosmetics.

## 2. Nav/IA comparison (sidebar order)

| # | Reference (accordion treeview) | Local (flat, primary + admin split) |
|---|---|---|
| 1 | Trang chủ | Trang chủ |
| 2 | Sửa Chữa-Bảo Hành (/Repairing/Index_8) | Sửa Chữa-Bảo Hành |
| 3 | Sửa Chữa-Bảo Hành KT (/RepairingM/Index) | Khách Hàng (promoted from Danh Mục) |
| 4 | Quản Lý Thu Chi [Thu Chi, Thanh Toán Công Nợ] | Quản Lý Kho |
| 5 | Danh Mục [15 children incl. Quản Lý Khách Hàng] | Xuất Kho |
| 6 | Quản Lý Kho [7 children] | Tài Chính (renamed Quản Lý Thu Chi + absorbs Hóa Đơn) |
| 7 | Quản Lý [Chi Nhánh, Người Dùng, Hóa Đơn] | Báo Cáo |
| 8 | Xuất Kho [5 children] | — separator — Danh Mục |
| 9 | Nhân Sự [10 children] | Nhân Sự |
| 10 | Báo Cáo Sửa Chữa [6 specific reports] | Quản Lý |
| 11 | Thông Tin Tài Khoản [3 children] | Phân Quyền |
| 12 | Phân quyền [Nhóm Quyền, Menu, Chức Năng] | (no #12; account items in UserMenu) |

Notes: reference children render in accordion; local children render as per-section tab strips. "Sửa Chữa-Bảo Hành KT" has no local nav item/route at all. Report child sets differ (ref: tình trạng kỹ thuật, tình trạng chung, Máy Tồn, KPI KTV, KPI Tiếp tân, SCBH Kỹ thuật; local: KPI, Phiếu sửa chữa, Kỹ thuật, Tiếp nhận, Xuất kho, Doanh thu, Bảo hành). "Quản Lý Kho" locally lacks child "Danh sách trả LK xác".

## 3. Missing pages (local counterpart MISSING or stub)

| Reference page | Route | Status |
|---|---|---|
| Sửa Chữa-Bảo Hành KT (technician repair board) | /RepairingM/Index | MISSING |
| Danh sách trả linh kiện xác (trả hãng + vận đơn) | /CheckOutForTech/DSTraLKXac | MISSING |
| Thông Tin Tài Khoản (account profile) | /User/Detail | MISSING |
| Ngân Hàng | /NganHang/Index | stub() |
| Phụ Cấp | /PhuCap/Index | stub() |
| Loại Phạt Thưởng | /LoaiPhatThuong/Index | stub() |
| Ứng lương | /UngLuong/Index | stub() |
| Báo cáo tình trạng chung (column+pie, 15 statuses, drill-down) | /ReportRepairing/RepairingReportStatus | MISSING |
| Báo Cáo Máy Tồn | /BaoCaoBaoHanh/BaoCaoMayTon | MISSING |
| Báo Cáo KPI Tiếp tân | /BaoCaoBaoHanh/BaoCaoKPITN | MISSING (local KPI page is KTV-only) |
| Danh sách thông báo (notification list) | /RepairingStatusHistory/Index | MISSING |
| News list + detail (messages dropdown targets) | /News/Index, /News/Detail | MISSING |

Near-missing (page exists, wrong entity): ThuHoiLKPage models a standalone thu-hồi voucher; reference /CheckOutForTech/DSCapLK is an issued-parts usage list. Home plan calendar ("Kế hoạch của bạn") replaced by KPI dashboard.

## 4. Per-section gap summaries (high + medium)

### shell-nav-layout — 4 high / 6 medium / 6 low

| Page | Severity | Gap |
|---|---|---|
| Shell | high | 'Sửa Chữa-Bảo Hành KT' (/RepairingM) nav/route/page missing entirely |
| Shell | high | SignalR call-center missing: toast "Có cuộc gọi mới !" + "Tiếp nhận" → repair intake, deny POST, desktop Notification, auto-open on answered, list refresh |
| Shell | high | Notification bell not wired to RepairingStatusHistory: no mark-all-read, no real items, no "Danh sách" list page |
| Shell | high | News/messages dropdown (fa-envelope-o) missing: unread badge, "Đánh dấu là đã xem", News list/detail pages |
| Shell | medium | 'Danh sách trả LK xác' nav child + route missing |
| Shell | medium | 'Thông Tin Tài Khoản' (/User/Detail) profile page missing |
| Shell | medium | 'Bản đồ chi nhánh' Google Maps modal (Places search) missing globally |
| Shell | medium | Support/contact dropdown (fa-question, "Thông tin liên hệ hỗ trợ:") missing |
| Shell | medium | Report menu child set differs from ref's 6 reports; mapping decision needed |
| Shell | medium | Home concept swap: ref FullCalendar "Kế hoạch của bạn" vs local KPI dashboard; calendar feature dropped |

Lows: sidebar user-panel, footer version/copyright, user-dropdown phone, dead "Trả hàng cho nhà cung cấp" link, "Danh mục chính" header, label renames — cosmetic/intentional IA.

### repair-main (/Repairing/Index_8) — 8 high / 8 medium / 3 low

| Page | Severity | Gap |
|---|---|---|
| Index_8 | high | Status vocabulary mismatch: 15 legacy fixed-id/color statuses vs 16 invented snake_case; business states (Đã Điều Phối, Đã Đặt/Có Linh Kiện, Chờ Phiếu Hãng, Đã Giao Phiếu Hủy, Đã Giao Ngoài, Hỏng Khách Trả Lại) don't exist locally |
| Index_8 | high | Row-actions column missing: Đổi tình trạng, Xem chi tiết, Cấp linh kiện, Giao Máy, Thêm lịch hẹn |
| Index_8 | high | Technician dispatch workflow missing: Điều phối / Đổi kỹ thuật / Hủy điều phối + batch |
| Index_8 | high | Multi-select + all batch ops missing: Chuyển chi nhánh, 5 selection-driven prints (Biên nhận, Giấy Đi Đường, Lệnh Sửa Tại Nhà + Điều phối in, Phiếu SC, Tem), batch status/tech, SMS |
| Index_8 | high | Báo giá (quote) workflow missing: Báo Giá button + DeleteBaoGia |
| Index_8 | high | 'Sửa chữa' progress column missing: Sửa xong, TAT, Giao máy, Tồn dwell counter; Ghi chú lacks HH:/solution/Cập nhật Cách giải quyết |
| Index_8 | high | Per-status live-count legend (15 colored squares + counts) missing; StatusLegend not even rendered |
| Index_8 | high | Cell depth loss: Khách hàng (address/Bản đồ/Định vị), Sản phẩm (NSX/model/Đại lý/repeat-repair red flag), Loại SC 3-line, PSC link-to-edit + PSC hãng/DL |
| Index_8 | medium | Missing filters: DateType selector, Sửa gấp, Kỳ hoàn tất, Địa chỉ; date hardwired to ngayNhan |
| Index_8 | medium | Bug: 'Số phiếu hãng' field writes filters.soPhieu; quick-search heuristic prevents combining fields |
| Index_8 | medium | Option-set mismatches: WarrantyType, WarrantyAt (Tại Trạm/Nhà Khách) replaced by invented lists; status filter uncolored multi-select |
| Index_8 | medium | Excel/PDF export + Tải lại trang missing |
| Index_8 | medium | Server-backed autocompletes (incl. table-autocomplete customer) replaced by static cascading selects |
| Index_8 | medium | ~12 modal workflows missing (UpdateStatus, UpdateTechinican, InsertSchedule, Transfer, CheckOut, Import Excel, ReceiveFast, inline create-partials…) |
| Index_8 | medium | Call-center/SignalR + cross-window refresh missing |
| Index_8 | medium | SMS batch actions (types 1-4, 9) missing |

Lows: dual pager, datetime formats, autofocus/sticky-toolbar/colResizable ergonomics.

### repair-kt-dashboard — 3 high / 5 medium / 2 low

| Page | Severity | Gap |
|---|---|---|
| /RepairingM/Index | high | Entire technician-scoped repair list missing (no route/nav/page) |
| /RepairingM/Index | high | KT column set differs from local admin table: Khu vực, Loại SC, Ngày giao, Chi tiết SC, action + status columns |
| /RepairingM/Index | high | KT-scoped 10-status filter subset (workshop pipeline only) — no role-scoped status concept locally |
| /RepairingM/Index | medium | Repair-photo upload/update workflow (canvasResize) missing |
| /RepairingM/Index | medium | WarrantyType options differ (Bảo hành/Sửa dịch vụ/BH sửa chữa vs invented) |
| /RepairingM/Index | medium | SignalR call-center layout feature missing (global) |
| /Admin/Index | medium | Home = plan calendar "Kế hoạch của bạn" + greeting; local KPI dashboard; calendar widget missing |
| /Admin/Index | medium | Call-center toasts + branch-map modal missing on home (where users idle) |

Lows: dual pager/collapsible search; greeting birthday/time-of-day imagery.

### customer (/Customer/Index) — 3 high / 5 medium / 4 low

| Page | Severity | Gap |
|---|---|---|
| Khách Hàng | high | Column set wrong: missing Điện thoại 2, Phường/Xã, Quận/Huyện, Tỉnh, Loại, Đại lý/Trạm, Người tạo; local invents Mã KH/Tổng phiếu/Trạng thái |
| Khách Hàng | high | 'Nhóm khách hàng' taxonomy (9 values: Khách lẻ … Nhà xe - Chuyển phát) absent from model/column/filter/form |
| Khách Hàng | high | 'Thêm Đại Lý' second create workflow missing |
| Khách Hàng | medium | Tỉnh/Quận cascading autocomplete filters missing (only flat Khu vực select) |
| Khách Hàng | medium | Email + Địa chỉ filter fields missing |
| Khách Hàng | medium | 'Xuất Excel File' export missing |
| Khách Hàng | medium | Multi-select + select-all missing (bulk purpose unmirrored — product decision) |
| Khách Hàng | medium | Model fields missing: Điện thoại 2, Đại lý/Trạm, Người tạo; verify local inventions maKH/tongPhieu/active |

Lows: local-only delete button, nav promotion, datetime format, Sheet vs modal.

### finance — 9 high / 9 medium / 6 low

| Page | Severity | Gap |
|---|---|---|
| Chứng Từ | high | Missing 8/15 columns: Tình Trạng, Số Phiếu SC/NK link, Kỹ thuật, Đại lý/Trạm, Tên khách hàng, Nội dung, Người Thu/Chi, Ngày Thu/Chi |
| Chứng Từ | high | Loại thu chi taxonomy: 12 values vs binary Thu/Chi |
| Chứng Từ | high | Separate 'Lập Phiếu Thu' / 'Lập Phiếu Chi' create flows missing |
| Chứng Từ | high | Per-row print ('in phiếu') missing |
| Chứng Từ | high | Status semantics wrong: collection state (Chưa thu/Đã thu/Đã thu ngoài/Chưa chi/Đã chi) vs invented approval state |
| Chứng Từ | medium | ~11 filters missing incl. Ngày lập vs Ngày thu/chi radio + 4 autocompletes |
| Chứng Từ | medium | Date range doesn't filter table (KPI-only) |
| Chứng Từ | medium | KPI boxes differ: Doanh thu + Doanh thu ngoài, Phải thu, Chi phí, Phải trả (search-scoped) missing |
| Chứng Từ | medium | Two Excel exports missing |
| Chứng Từ | medium | Source-document linking (PSC new tab / PNK modal) missing |
| Chứng Từ | medium | Multi-select missing |
| Công Nợ | high | Wrong model: ref = per-ticket receivables (Số phiếu, Loại phiếu, KTV, Đã trả, Còn lại, ĐT); local = generic manual ledger |
| Công Nợ | high | Settle-debt workflow ('thanh toán' action → voucher) missing — page's entire purpose |
| Công Nợ | medium | Filters missing: Loại thanh toán, Số phiếu, KH autocomplete, Kỹ thuật, Tất cả/Theo ngày toggle |
| Hóa Đơn | high | Missing columns: Hình Thức Thanh Toán, Mã Số Thuế, Người Lập (absent from type too) |
| Hóa Đơn | high | /Invoice/Create full-page composer missing; local create bare sheet, drawer view-only |
| Hóa Đơn | medium | Bulk delete (checkboxes + Xóa) missing |
| Hóa Đơn | medium | Filters missing: Số hóa đơn, MST, Hình thức thanh toán, Tên đơn vị, date range |

Lows: pager style, naming (Chứng Từ/Thu Chi), invented Trạng thái, local-only KPI strip on Công nợ, label diffs.

### catalog-a — 5 high / 14 medium / 16 low

| Page | Severity | Gap |
|---|---|---|
| Hàng Hóa | high | Column set wrong: missing Hình, Mã hàng phụ, Tiếng Anh, Nhà sản xuất, Tên model, Model dùng chung, Người tạo, Ngày tạo, Serial; invents Giá/Tồn/Trạng thái |
| Hàng Hóa | high | 'In Barcode' per-row print (/Print/PrintTemHangHoa8) missing |
| Hàng Hóa | high | Dedicated /Product/Create + /Product/Edit full pages missing; model lacks manufacturer/model/serial/image |
| Hàng Hóa | medium | Import Excel + Xuất ra Excel missing |
| Hàng Hóa | medium | Filters missing: Nhà sản xuất, Model autocompletes, Mã hàng hóa |
| Hàng Hóa | medium | No bulk delete |
| Nhà Kho | high | 'Kho xác' carcass-warehouse flag missing (column + checkbox) — drives Xác inventory workflows |
| Nhà Kho | medium | No bulk delete |
| Sản Phẩm | high | 'Tiền khoán' (piecework) column + money field missing — feeds KPI/khoán |
| Sản Phẩm | medium | Local requires Nhà sản xuất; reference product form has none — schema divergence |
| Sản Phẩm | medium | Nhóm sản phẩm plain select vs autocomplete + [+] quick-create |
| Sản Phẩm | medium | No bulk delete |
| Model | medium | Ghi chú field missing; autocompletes + [+] quick-create missing; no bulk delete (3 mediums) |
| Nhà Sản Xuất | medium | Ghi chú missing; no bulk delete (2 mediums) |
| Ngăn Chứa | medium | No bulk delete |
| Nhóm Hàng Hóa | medium | No bulk delete |

Lows (16): Lưu & Thêm mới, Sheet vs side-form, invented Trạng thái/Mã columns, optional-vs-required codes, page-size options, hover-zoom.

### catalog-b — 7 high / 11 medium / 7 low

| Page | Severity | Gap |
|---|---|---|
| Khu Vực | high | Wrong columns/model: Tên Quận, Tên Xã/Phường, Cây số, Tiền công, Tiền công 2 missing |
| Khu Vực | high | Tỉnh→Quận→Xã hierarchy + [+] quick-add modals missing entirely |
| Khu Vực | medium | Quận filter missing; no bulk delete; no quick-add modals (3 mediums) |
| Phường/Xã | high | Wrong columns/model: Tỉnh, Quận, Cây số, Tiền công, Tuyến link missing; invents Loại/khuVucId |
| Phường/Xã | high | Tỉnh/Quận parents + quick-add missing; Tuyến link (delivery-fee logic) absent |
| Phường/Xã | medium | Tỉnh/Quận/Tuyến filters missing; no bulk delete (2 mediums) |
| Thời Hạn | high | Duration semantics: ref Loại (Tháng/Năm) + value; local stores soNgay days |
| Thời Hạn | medium | No bulk delete |
| Phí Giao | high | Wrong association: ref links to Sản phẩm with Loại phí (Cộng/Trừ/Công) + Ghi chú; local wrongly links to Khu vực |
| Phí Giao | medium | No bulk delete |
| Lỗi Sửa Chữa | high | Labor-price model missing: Chi Nhánh × Nhóm SP × Tên lỗi with Tiền Công / Tiền Công DV |
| Lỗi Sửa Chữa | medium | Chi nhánh + Nhóm SP filters missing; no quick-add + no bulk delete (2 mediums) |
| Đơn Vị Tính | medium | No bulk delete |
| Nhóm Sản Phẩm | medium | No bulk delete |

Lows: Lưu & Thêm mới, invented Mã/Trạng thái columns, page sizes, money-masked inputs.

### warehouse — 14 high / 20 medium / 6 low

| Page | Severity | Gap |
|---|---|---|
| Nhập Kho | high | /Receiving/Create full-page voucher with line items missing (header-only Sheet) |
| Nhập Kho | high | Dual search 'Tìm kiếm' vs 'Tìm chi tiết' missing |
| Nhập Kho | medium | ~8 filters missing (Hình thức thu chi, Số phiếu NK, Hóa đơn, Mã SP, KH, Ngăn chứa cascade, Người tạo, date range) |
| Nhập Kho | medium | Excel export missing; ref columns unverified (AJAX) — likely missing row actions (2 mediums) |
| Xem Tồn Kho | high | Missing 10 columns: Chi nhánh, Model, Giá vốn đầu/trong kỳ, Tồn, Tổng tiền, NSX, Ngăn chứa, Kỳ, Có serial |
| Xem Tồn Kho | high | Từ Kỳ/Đến Kỳ accounting-period selects replaced by generic date range |
| Xem Tồn Kho | medium | Missing filters (Ngăn chứa, NSX, Model, mã hàng); missing row actions (Cập nhật, Xem chi tiết, NK/XK drill-down); Excel + real nhóm hàng options (3 mediums) |
| Tồn Kho LK Xác | high | Straight clone of tonKhoConfig — wrong columns; wrongly includes Tổng tiền |
| Tồn Kho LK Xác | high | Row actions missing: Cập nhật, ViewDetail_Xac, NK/XK drill-down |
| Tồn Kho LK Xác | medium | KPI boxes missing; period/cascade/NSX/Model filters missing (kho should restrict to LK Xác); Excel missing (3 mediums) |
| Tồn Kho Kỹ Thuật | high | Technician dimension missing (column + autocomplete filter) — page's defining axis |
| Tồn Kho Kỹ Thuật | high | 'Trả linh kiện kho kỹ thuật' per-row modal missing |
| Tồn Kho Kỹ Thuật | high | Wrong columns: missing Chi nhánh, Kỳ, Kỹ thuật, NSX, Model, Tồn, Giá vốn; wrongly shows Kho/ĐVT |
| Tồn Kho Kỹ Thuật | medium | KPI boxes missing; period/NSX/Model filters + Excel missing (2 mediums) |
| DSCapLK | high | Wrong entity: ref = issued-parts usage list w/ ticket status; local ThuHoiLKPage = invented thu-hồi voucher |
| DSCapLK | high | Return-status filters missing (Đã/Chưa trả xác LK, Có/Chưa trả LK + 15-status ticket filter) |
| DSCapLK | medium | ~7 filters missing; Excel missing; columns unverified (3 mediums) |
| DSTraLK | high | Duyệt (approve) bulk workflow missing (Chờ duyệt → Đã duyệt) |
| DSTraLK | medium | In Phiếu Trả print; ~6 filters; wrong status set (Chờ duyệt/Đã duyệt vs invented); Excel; columns unverified (5 mediums) |
| DSTraLKXac | high | Entire page missing (trả hãng tracking) |
| DSTraLKXac | high | Trả hãng bulk modal + Chưa/Đã trả hãng + Mã vận đơn missing |
| DSTraLKXac | medium | In BB Kỹ Thuật + In Phiếu Trả Hãng prints + Excel missing |

Lows: read-only views given CRUD sheets, page sizes, "Xác"≠"xác nhận" naming bug.

### stock-out — 10 high / 11 medium / 4 low

| Page | Severity | Gap |
|---|---|---|
| Cấp Linh Kiện | high | /CheckOutForTech/Create full-page dispatch slip with line items missing |
| Cấp Linh Kiện | high | Dual search Tìm kiếm / Tìm chi tiết missing |
| Cấp Linh Kiện | medium | ~6 filters missing incl. Mục Đích (SC dịch vụ/Bảo hành/KT mượn — absent from type); Excel + Báo cáo lợi nhuận missing; columns unverified (3 mediums) |
| Bán Hàng | high | Wrong columns: missing Điện thoại, Người lập, Ghi chú; invents Trạng thái |
| Bán Hàng | high | Row actions missing: Xuất kho print (/Print/Selling), Chi tiết line-item modal, Thêm hình upload |
| Bán Hàng | high | Full-page order create/edit with product lines missing |
| Bán Hàng | medium | Filters (Nhà kho cascade, Hình thức thu chi, Số phiếu/Ghi chú, Mã hàng, date); bulk toolbar; Tìm chi tiết + 2 exports missing (3 mediums) |
| Trả Hàng | high | 'Hình thức trả' 4-type axis missing; local invents customer-refund model (khach_hang, ly_do, tien_hoan) |
| Trả Hàng | high | Wrong columns: missing Hình thức trả, Người lập |
| Trả Hàng | high | Print slip + Chi tiết modal + full-page slip editor missing |
| Trả Hàng | medium | Filters (Hình thức trả, Số phiếu, date); exports + bulk toolbar missing (2 mediums) |
| Chuyển Kho | high | Dual create flows missing: Chuyển cùng chi nhánh vs khác chi nhánh (full pages, product lines) |
| Chuyển Kho | high | Status model wrong: Chưa/Đã/Không xác nhận receipt-confirm flow vs invented values |
| Chuyển Kho | medium | Filter axis differs (Từ/Đến chi nhánh + Số phiếu + date); exports + bulk toolbar; columns unverified (3 mediums) |

Lows: label diffs, unverifiable per-row print/detail on Chuyển kho.

### hr — 11 high / 13 medium / 6 low

| Page | Severity | Gap |
|---|---|---|
| Ngân Hàng | high | Page missing (stub route) — needs Mã/Tên/Địa chỉ CRUD |
| Phụ Cấp | high | Page missing (stub) — Tên, Loại (Ăn Chia/Tiền mặt), Giá trị money |
| Loại Phạt Thưởng | high | Page missing (stub) — Loại (Thưởng/Phạt) radio + Tên loại |
| Ứng Lương | high | Page missing (stub) — NV autocomplete, Kỳ, Ngày ứng, Số tiền, Ghi chú |
| Ứng Lương | medium | Kỳ (payroll period) entity/selector absent app-wide (needed by 4 HR pages); quick-add NV/Kỳ modals + bulk delete (2 mediums) |
| Nhân Viên | high | Khóa/Mở khóa lock toggle column + action missing |
| Nhân Viên | medium | Hình photo + Giới tính columns/fields missing; dedicated full-page Create/Edit (photo upload) missing (2 mediums) |
| Bảng Lương | high | Missing 9/16 columns: Kỳ, Chức vụ, Bảo Hiểm, Tăng ca-Nghỉ, Ứng lương, Thưởng-Phạt, Công BH, Công SC, Tổng lương |
| Bảng Lương | high | Row actions missing: Tạo bảng lương worksheet, per-row Print, per-row Excel |
| Bảng Lương | high | Toolbar missing: Xuất file excel, Cập nhật tiền công KV |
| Bảng Lương | medium | Kỳ + Phòng ban filters, totals row, 'Tổng lương: X VND' aggregate missing |
| Chấm Công | high | Wrong model: ref = exception-record CRUD (Nghỉ/Nghỉ nửa ngày/Đi trễ/Tăng ca/Về sớm + Loại trừ lương); local = read-only invented clock-in/out |
| Chấm Công | high | Wrong columns (missing Giới tính, Chức danh, Chi nhánh, Loại chấm, quantity+unit, Kỳ, Loại trừ) |
| Chấm Công | medium | Kỳ filter + bulk delete missing |
| CC Tổng Hợp | high | Wrong columns: ref = per-employee per-kỳ totals (Ngày nghỉ, Giờ tăng ca, Giờ trễ, Giờ về sớm, Xem); local = invented day matrix |
| CC Tổng Hợp | medium | Kỳ filter missing; Xuất Excel + per-row Xem drill-down missing (2 mediums) |
| Phòng Ban | medium | Bulk delete missing |
| Chức Vụ | medium | Bulk delete missing |
| Ngân Hàng | medium | Bulk delete (once built) |

Lows: Lưu & Thêm mới, invented Trạng thái/moTa, page sizes, name-or-code search.

### reports — 8 high / 9 medium / 8 low

| Page | Severity | Gap |
|---|---|---|
| BC tình trạng kỹ thuật | high | Local ky-thuat report answers different question — no status-per-technician count |
| BC tình trạng kỹ thuật | high | 'Tình trạng' single-select (15 colored statuses, default Sửa Xong) missing |
| BC tình trạng kỹ thuật | high | Column chart + click drill-down to ticket list missing |
| BC tình trạng kỹ thuật | medium | Kỹ thuật autocomplete filter missing |
| BC tình trạng chung | high | Entire report missing (status-distribution overview) |
| BC tình trạng chung | high | Dual column+pie charts (15 statuses, canonical colors) + drill-down missing |
| BC tình trạng chung | medium | Nhà sản xuất filter dimension missing from all local reports |
| BC Máy Tồn | high | Entire report missing |
| BC Máy Tồn | medium | Day/Month/Year tri-mode filter only in KpiReportFilterForm, not generic ReportPage; Excel export missing (2 mediums) |
| KPI KTV | medium | Kỹ thuật + Nhóm sản phẩm multi-selects replaced by free-text inputs (2 mediums) |
| KPI Tiếp nhận | high | Report missing (local KPI page KTV-only; TiepNhanReportPage is an intake list, not KPI) |
| KPI Tiếp nhận | medium | Tiếp tân + Nhóm SP multi-selects; Day/Month/Year period mode missing (2 mediums) |
| BC SCBH Kỹ thuật | high | No true equivalent: warranty COST report per technician (ChiPhi8); local bao-hanh is generic ticket list |
| BC SCBH Kỹ thuật | medium | Kỹ thuật select filter missing on bao-hanh |

Lows: auto-run search, default date ranges, button labels, server paging, all ref result-table columns unverified (AJAX partials).

### admin-perm-account — 6 high / 10 medium / 7 low

| Page | Severity | Gap |
|---|---|---|
| Chi Nhánh | high | Columns missing: Hotline, Người liên hệ, Email, Chính, Chuyển CN; invents Mã CN/Tỉnh thành/Trạng thái |
| Chi Nhánh | high | Form fields missing: Hotline, Người liên hệ, Email, Toạ độ, Chi nhánh chính, Chuyển chi nhánh |
| Chi Nhánh | medium | 'Bản đồ chi nhánh' map modal; bulk delete; persistent side panel + Lưu & Thêm mới (3 mediums) |
| Người Dùng | high | One-click Khóa/Mở khóa row toggle missing (read-only Trạng thái text instead) |
| Người Dùng | medium | Điện thoại column missing; Chi nhánh phụ (multi-branch) concept missing from model/form; bulk delete (3 mediums) |
| Thông Tin TK | high | /User/Detail account-profile page missing entirely |
| Thông Tin TK | medium | 'Chi nhánh phụ' plural-branch concept absent from NguoiDung model |
| Nhóm Quyền | high | ~50-node menu-permission checkbox tree missing — page's core purpose; local is name/desc CRUD |
| Nhóm Quyền | medium | Lưu & Thêm mới + side-by-side layout missing |
| Menu (RoleMenu) | high | 202-checkbox function-permission matrix (41 groups × Xem/Thêm/Sửa/Xóa + special actions) missing |
| Menu (RoleMenu) | medium | Parent-menu typeahead (any depth) vs root-only select |
| Chức Năng | medium | Legacy functions are hierarchical entity→action records feeding the matrix; local flat list can't back a faithful rebuild |

Lows: Đổi Mật Khẩu placement/labels (functionally complete), broken ref RoleFunction page (HTTP 500), naming.

## 5. Reference spec appendix

Full per-page reference specs (exact labels, filters, columns, endpoints, modals) live in the section files — do not duplicate; link:

- [section-shell-nav-layout.md](ref-ui-parity-sections/section-shell-nav-layout.md) — shell, header widgets, sidebar tree, SignalR, home
- [section-repair-main.md](ref-ui-parity-sections/section-repair-main.md) — /Repairing/Index_8 workspace
- [section-repair-kt-dashboard.md](ref-ui-parity-sections/section-repair-kt-dashboard.md) — /RepairingM/Index + /Admin/Index calendar home
- [section-customer.md](ref-ui-parity-sections/section-customer.md) — /Customer/Index
- [section-finance.md](ref-ui-parity-sections/section-finance.md) — ChungTu, CongNo, Invoice
- [section-catalog-a.md](ref-ui-parity-sections/section-catalog-a.md) — Model, Nhà kho, Ngăn chứa, Nhóm HH, Hàng hóa, NSX, Sản phẩm
- [section-catalog-b.md](ref-ui-parity-sections/section-catalog-b.md) — Khu vực, Phường/Xã, Thời hạn, Phí giao, ĐVT, Nhóm SP, Lỗi SC
- [section-warehouse.md](ref-ui-parity-sections/section-warehouse.md) — Receiving, 3 inventory views, DSCapLK, DSTraLK, DSTraLKXac
- [section-stock-out.md](ref-ui-parity-sections/section-stock-out.md) — Cấp LK, Bán hàng, Trả hàng, Chuyển kho
- [section-hr.md](ref-ui-parity-sections/section-hr.md) — 10 nhân-sự pages
- [section-reports.md](ref-ui-parity-sections/section-reports.md) — 6 báo-cáo pages
- [section-admin-perm-account.md](ref-ui-parity-sections/section-admin-perm-account.md) — Chi nhánh, Người dùng, User/Detail, Đổi MK, 3 phân-quyền pages

## 5b. Canonical legacy status palette (verified 260703 from /ReportStatusTechnician + /RepairingM)

15 statuses, fixed ids + hex (ids 3, 5 unused in current build):

| Id | Tên | Hex |
|---|---|---|
| 1 | Mới Nhận | #FFCC00 |
| 2 | Đã Điều Phối | #00CCFF |
| 4 | Báo Giá | #9966CC |
| 6 | Chờ Xác Nhận | #996600 |
| 7 | Chờ Linh Kiện | #4B0082 |
| 8 | Trả Lại | #CC3300 |
| 9 | Sửa Xong | #3300FF |
| 10 | Đã Giao Cho Khách | #00FF00 |
| 11 | Hỏng Khách Trả Lại | #CC9911 |
| 12 | Đã Giao Phiếu Hủy | #342c38 |
| 13 | Đã Có Linh Kiện | #6D5582 |
| 14 | Đã Giao Ngoài | #009988 |
| 15 | Chờ Báo Giá | #31065c |
| 16 | Chờ Phiếu Hãng | #06385c |
| 17 | Đã Đặt Linh Kiện | #112233 |

KT board (/RepairingM) filter subset: 2, 4, 6, 7, 8, 9, 13, 15, 16, 17 (workshop pipeline only — no Mới Nhận, no post-delivery states).

Status cell render: `td` background = status hex; inner label = white pill, black bold uppercase text. UpdateStatus modal exposes per-status conditional fields (Giá, Nội dung sửa chữa, Cách giải quyết, Loại sửa chữa, Loại yêu cầu Đặc/Ứng, Loại linh kiện 8 options, Linh kiện, Số lượng) + "Lưu & SMS" button.

## 6. Decisions (user, 260703)

| # | Question | Decision |
|---|---|---|
| D1 | Nav & IA | **Keep current flat IA** (flat frequency-ranked sidebar + section tabs). Add missing routes/pages (RepairingM KT board, DS trả LK xác, User detail, notification/News lists) into the flat structure. Nav cosmetics NOT reorganized to reference accordion. |
| D2 | Status vocabulary | **Adopt legacy 15** statuses as canonical: fixed ids + hex from §5b replace the invented 16 snake_case set in `src/domains/repair/status.ts`. Legend, filters, charts, seed all regenerate. |
| D3 | Data parity | **Reference is the spec**: port reference columns/fields/taxonomies/models exactly (Công nợ per-ticket, Trả hàng 4 hình thức, Chấm công exception records, Tỉnh→Quận→Xã, ChungTu 12-type, Kỳ entity, Lỗi sửa chữa labor prices, Phí giao per Sản phẩm…). Drop invented fields. Regenerate mock seed. |
| D4 | Integrations | **Working mocks**: demo-triggered incoming-call toast with Tiếp nhận→intake flow, print-layout windows via print CSS, real client-side .xlsx export, map modal (embedded/static). SMS actions simulate with toasts. |

Resolved by verification (former Q6): all previously-unverified AJAX tables + full-page editors mirrored and specced in section-file addenda (260703). RoleFunction page remains HTTP 500 on reference — spec from RoleMenu matrix instead.

## 7. Approved design — phased reference-parity upgrade (user approved 260703, plan mode: /ck:plan --tdd)

Build order (dependencies first; each phase leaves app shippable):

1. **Foundations**: replace status module with legacy 15 (ids+hex, §5b); add Kỳ entity; Tỉnh→Quận→Xã hierarchy; regenerate relational seed to reference models (D3). Highest regression risk — TDD locks current behavior first.
2. **Shell + notification surfaces**: notification bell → RepairingStatusHistory list page; News dropdown + list/detail; demo call-center toast (Tiếp nhận → intake) (D4); user-menu/User-Detail profile page; map modal. Flat IA kept (D1) — only add missing routes.
3. **Repair workspace (Index_8 parity)**: 15-status legend w/ live counts, row-actions column (đổi tình trạng modal w/ conditional fields, điều phối/đổi KT/hủy, cấp LK, giao máy, lịch hẹn, maps), multi-select batch ops (chuyển CN, 5 prints, SMS mock, xóa), báo giá flow, Sửa chữa progress column, reference filters, Excel export.
4. **Repair detail/create + KT board**: detail log sections (điều phối, cấp/trả LK, chuyển CN, lịch sử máy, image gallery, prints); create form reference fields/validation/autocompletes + [+] quick-creates + Lưu/Lưu&Thêm/Lưu&Đóng; new /RepairingM technician board (10-status subset).
5. **Warehouse + stock-out**: full-page line-item editors (Receiving, Cấp LK, Bán hàng, Trả hàng 4 hình thức, Chuyển kho ×2), inventory views w/ Kỳ + technician axis + Giá vốn + drill-downs, DSCapLK usage list, DSTraLK duyệt flow, new DSTraLKXac page (trả hãng + vận đơn).
6. **Finance + catalog + HR**: ChungTu 16-col + 12-type + Phiếu Thu/Chi flows + per-row print; Công nợ per-ticket settle; Invoice composer; catalog model corrections (Khu vực, Phường/Xã+Tuyến, Phí giao, Lỗi SC labor, Thời hạn, Kho xác, Tiền khoán); 4 HR stub pages built; Bảng lương 17-col + totals; Chấm công exception model; NhanVien full editor + Khóa/Mở khóa.
7. **Reports + permissions + cross-cutting polish**: reference 6 reports (charts + drill-down); menu-tree + function-matrix permission mock; app-wide Excel export, bulk-select/delete, per-row prints, autocomplete+quick-create pattern, Lưu & Thêm mới.

Cross-cutting build primitives (Phase 1-2, reused everywhere): client .xlsx exporter, print-window helper, bulk-select DataTable extension, server-style autocomplete component with [+] quick-create modal, Kỳ picker, full-page line-item editor template.

## 8. Remaining open questions (defaults proposed, override in plan review)

1. **Home page**: proposal — keep KPI dashboard as home (fits D1), add "Kế hoạch của bạn" FullCalendar-style plan calendar as a dashboard tab/widget.
2. **Report set**: proposal per D3 — implement the reference 6 reports as canonical; retire invented reports (Doanh thu, Xuất kho list, Phiếu sửa chữa list, Tiếp nhận list) from nav or fold their useful bits into the reference 6.
3. **Permission depth**: proposal — replicate menu-tree + function-matrix UI as working mock (checkbox state persisted locally); no real enforcement (prototype).
4. **Bulk-select purpose on /Customer/Index**: reference markup shows checkboxes but no visible bulk toolbar in mirror; proposal — implement bulk delete only.
