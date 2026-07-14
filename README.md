# Phong Thành Admin

Giao diện quản trị chuỗi cửa hàng sửa chữa điện thoại Phong Thành, dùng React
18 + Vite + TypeScript + Tailwind v3 + shadcn/ui.

Backend thật trong [`api/`](./api/README.md) dùng NestJS + Postgres + Drizzle,
phục vụ JWT auth và sáu resource: `khach-hang`, `nha-san-xuat`, `san-pham`,
`model`, `ngan-hang`, `dia-ly`. Khách hàng bị giới hạn theo chi nhánh trong JWT;
các danh mục còn lại dùng chung. Quick-create Đại lý dùng cùng adapter Khách
hàng nên được lưu thật khi `khach-hang` chạy real API.

Phiếu sửa chữa và phần lớn nghiệp vụ vận hành vẫn dùng mock client. Cờ
`VITE_REAL_RESOURCES` chọn adapter thật ở dev/CI; build production bắt buộc đủ
cả sáu resource.

## Yêu cầu

- Node.js 24
- npm đi kèm Node.js
- Docker Desktop khi chạy API/Postgres

## Khởi động frontend

```bash
npm ci
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

```bash
npm run build
npm run preview
```

API local: xem [`api/README.md`](./api/README.md).

## Kiểm thử

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e:uiux
env VITE_REAL_RESOURCES=khach-hang,nha-san-xuat,san-pham,model,ngan-hang,dia-ly npm run build:prod
npm run test:api:with-db
```

`test:e2e:uiux` chạy Playwright qua viewport mobile đến 4K.
`test:api:with-db` khởi động Postgres compose, rồi chạy API lint/build/Jest với
database test `phongthanh_test`.

Dữ liệu Tỉnh/Thành phố và Phường/Xã là snapshot cố định theo Quyết định
19/2025/QĐ-TTg, hiệu lực 2025-07-01: 34 đơn vị cấp tỉnh và 3.321 đơn vị cấp xã.
Xem [`docs/vietnam-administrative-data-provenance.md`](./docs/vietnam-administrative-data-provenance.md).

## Các phân hệ

| #   | Phân hệ                   | Đường dẫn                    |
| --- | ------------------------- | ---------------------------- |
| 1   | Trang chủ                 | `/trang-chu`                 |
| 2   | Sửa chữa - Bảo hành       | `/sua-chua-bao-hanh`         |
| 3   | Sửa chữa - Bảo hành KT    | `/sua-chua-bao-hanh-kt`      |
| 4   | Khách hàng                | `/khach-hang`                |
| 5   | Quản lý kho               | `/quan-ly-kho`               |
| 6   | Xuất kho                  | `/xuat-kho`                  |
| 7   | Tài chính                 | `/tai-chinh`                 |
| 8   | Báo cáo                   | `/bao-cao`                   |
| 9   | Danh mục, 15 màn hình con | `/danh-muc`                  |
| 10  | Nhân sự                   | `/nhan-su`                   |
| 11  | Quản lý                   | `/quan-ly`                   |
| 12  | Phân quyền                | `/phan-quyen`                |
| -   | Thông báo / Tài khoản     | `/thong-bao` `/tai-khoan`    |
| -   | Đăng nhập / Đổi mật khẩu  | `/dang-nhap` `/doi-mat-khau` |
| -   | Gallery, chỉ dev          | `/gallery`                   |

Toàn bộ sửa chữa dùng bộ 15 trạng thái legacy với id và màu hex cố định. Ba
chi nhánh cấu hình: Đắk Lắk, Đắk Nông, Cộng tác viên tuyến huyện.

## Tính năng chính

- Giao diện responsive, dark mode, command palette `Cmd+K` / `Ctrl+K`.
- Bảng dữ liệu dùng chung: phân trang, lọc, sắp xếp, ẩn cột, mật độ, mobile card,
  export Excel và print.
- Một luồng đổi trạng thái dùng chung cho danh sách sửa chữa, bảng KT và chi
  tiết; Dashboard được làm mới sau cập nhật.
- Chi nhánh hiển thị theo JWT; lựa chọn cũ không hợp lệ được đưa về phạm vi an
  toàn thay vì gửi request sang chi nhánh không được cấp quyền.
- Form Khách hàng/Đại lý dùng địa chỉ sau sáp nhập, MST, ngân hàng và tài khoản;
  API giữ tương thích với địa chỉ legacy.
- Trung tâm Thông báo thay thế Tin tức. URL legacy `/tin-tuc/*` chuyển hướng về
  `/thong-bao`; bấm thông báo mở đúng phiếu sửa chữa.
- Reset demo `Ctrl+Shift+R`, chỉ ở dev, xóa state lưu trữ và tải lại dữ liệu.

## Deployment

Frontend chạy trên GitHub Pages. API và Postgres chạy trên MacBook; ngrok cung
cấp HTTPS public. MacBook phải thức, Docker/API/ngrok phải hoạt động thì dữ liệu
thật mới truy cập được. Không mở port trên router: Postgres chỉ bind loopback,
còn API public chỉ đi qua ngrok và được bảo vệ bởi firewall macOS.

Runbook đầy đủ, gồm cập nhật bằng Git, backup, readiness gate, đổi tunnel và
rollback: [`docs/deployment.md`](./docs/deployment.md).

## Kiến trúc

Xem [`ARCHITECTURE.md`](./ARCHITECTURE.md) và
[`docs/codebase-summary.md`](./docs/codebase-summary.md).
