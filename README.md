# Phong Thành Admin

Giao diện quản trị cho chuỗi cửa hàng sửa chữa điện thoại Phong Thành — React 18 + Vite + TypeScript + Tailwind v3 + shadcn/ui.

Phần lớn dữ liệu vẫn là **mock** phía client. Backend thật (NestJS + Postgres +
Drizzle, thư mục [`api/`](./api/README.md)) đã được dựng cho phân hệ **Khách hàng**
(auth JWT + phân quyền theo chi nhánh); các phân hệ còn lại sẽ chuyển sang backend
thật theo lộ trình trong `plans/260707-1612-real-backend-database/`. Cờ
`VITE_REAL_RESOURCES` (dev/CI) chọn resource nào gọi API thật; bản build production
bắt buộc mọi resource của release phải là thật.

---

## Yêu cầu

- **Node.js** ≥ 18
- **npm** (đi kèm Node.js)

---

## Khởi động nhanh

```bash
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

---

## Build production

```bash
npm run build       # xuất ra thư mục dist/
npm run preview     # xem trước bản build tại localhost:4173
```

## Kiểm thử

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang npm run build:prod
npm run test:api:with-db
```

`test:e2e:uiux` chạy Playwright qua ma trận viewport mobile → 4K và lưu
screenshot ở
`plans/260711-1527-responsive-table-1080p-fit/reports/screenshots/`.
`test:api:with-db` khởi động compose Postgres `db`, rồi chạy API lint/build/Jest
với database test `phongthanh_test`.

---

## Các phân hệ

| # | Phân hệ | Đường dẫn |
|---|---------|-----------|
| 1 | Trang chủ (Dashboard KPI + Kế hoạch của bạn) | `/trang-chu` |
| 2 | Sửa chữa - Bảo hành (Index_8) | `/sua-chua-bao-hanh` |
| 3 | Sửa chữa - Bảo hành KT (bảng kỹ thuật) | `/sua-chua-bao-hanh-kt` |
| 4 | Khách hàng | `/khach-hang` |
| 5 | Quản lý kho (tồn kho, DS cấp/trả LK, trả LK xác) | `/quan-ly-kho` |
| 6 | Xuất kho (cấp LK, bán hàng, trả hàng, chuyển kho) | `/xuat-kho` |
| 7 | Tài chính (thu chi, công nợ, hóa đơn) | `/tai-chinh` |
| 8 | Báo cáo (6 báo cáo chuẩn + Doanh thu/Xuất kho) | `/bao-cao` |
| 9 | Danh mục (14 danh mục) | `/danh-muc` |
| 10 | Nhân sự (10 trang, bảng lương, chấm công) | `/nhan-su` |
| 11 | Quản lý (chi nhánh, người dùng) | `/quan-ly` |
| 12 | Phân quyền (cây menu + ma trận chức năng) | `/phan-quyen` |
| — | Thông báo / Tin tức / Tài khoản | `/thong-bao` `/tin-tuc` `/tai-khoan` |
| — | Đăng nhập / Đổi mật khẩu | `/dang-nhap` `/doi-mat-khau` |
| — | Gallery (dev) | `/gallery` |

> **Nâng cấp parity với app tham chiếu (ASP.NET legacy):** toàn bộ trạng thái sửa chữa dùng bộ **15 trạng thái legacy** (id + hex cố định), cột/nhãn/taxonomy khớp verbatim với app gốc. 3 chi nhánh: Đắk Lắk, Đắk Nông, Cộng tác viên tuyến huyện.

---

## Tính năng nổi bật

- **Chế độ tối** — nhấn biểu tượng mặt trăng/mặt trời ở header; lưu tự động qua localStorage.
- **Command Palette** — `Cmd+K` / `Ctrl+K` mở bảng tìm kiếm nhanh tất cả phân hệ.
- **Thông báo & Tin tức** — chuông thông báo + dropdown tin tức (đếm chưa đọc, đánh dấu đã xem).
- **Xuất Excel client-side** — xuất `.xlsx` thật (SheetJS) với chống formula-injection; in phiếu qua print-window.
- **Bản đồ chi nhánh** — modal nhúng bản đồ theo toạ độ chi nhánh.
- **Demo call-center** — `Ctrl+Shift+G` mô phỏng cuộc gọi đến → tiếp nhận phiếu.
- **Bộ lọc nâng cao** — trang Sửa chữa hỗ trợ lọc theo 22 trường tham chiếu.
- **Reset demo** — `Ctrl+Shift+R` (chỉ ở chế độ dev) xóa toàn bộ state lưu trữ và tải lại trang về trạng thái ban đầu.

---

## Cấu trúc dự án

Xem [`ARCHITECTURE.md`](./ARCHITECTURE.md) để biết chi tiết về thiết kế, mock contract, và quy ước component.
