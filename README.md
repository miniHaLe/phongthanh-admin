# Phong Thành Admin

Giao diện quản trị chuỗi cửa hàng sửa chữa điện thoại Phong Thành, dùng React
18 + Vite + TypeScript + Tailwind v3 + shadcn/ui.

Backend thật trong [`api/`](./api/README.md) dùng NestJS + Postgres + Drizzle,
phục vụ JWT auth và 21 resource của release. Khách hàng bị giới hạn theo chi
nhánh trong JWT; Người dùng có projection loại bỏ bí mật và write guard quản trị;
`nhom-quyen` cùng `dia-ly` là read-only. `dia-ly` cung cấp địa giới chính thức
2025, còn `phuong-xa` giữ danh mục định tuyến sửa chữa legacy ở bảng riêng.

Phiếu sửa chữa và phần lớn nghiệp vụ vận hành vẫn dùng mock client. Cờ
`VITE_REAL_RESOURCES` chọn adapter thật ở dev/CI; build production bắt buộc đủ
toàn bộ resource sau:

```text
khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao,ngan-hang,dia-ly,tin-tuc
```

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
env VITE_REAL_RESOURCES=khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao,ngan-hang,dia-ly,tin-tuc npm run build:prod
npm run test:api:with-db
```

`test:e2e:uiux` chạy Playwright qua viewport mobile đến 4K.
`test:api:with-db` khởi động Postgres compose, rồi chạy API lint/build/Jest với
database test `phongthanh_test`.

Mốc xác minh release 2026-07-16: 214 file / 785 test Vitest, 223/223 ca
Playwright, 16 suite / 115 test API; build thường và build production đủ 21
resource đều đạt.

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
| -   | Tin tức nội bộ            | `/tin-tuc`                   |
| -   | Thông báo / Tài khoản     | `/thong-bao` `/tai-khoan`    |
| -   | Đăng nhập / Đổi mật khẩu  | `/dang-nhap` `/doi-mat-khau` |
| -   | Gallery, chỉ dev          | `/gallery`                   |

Toàn bộ sửa chữa dùng bộ 15 trạng thái legacy với id và màu hex cố định. Ba
chi nhánh cấu hình: Đắk Lắk, Đắk Nông, Cộng tác viên tuyến huyện.

## Tính năng chính

- Giao diện responsive, dark mode, command palette `Cmd+K` / `Ctrl+K`.
- Bảng dữ liệu dùng chung: phân trang, lọc, sắp xếp, ẩn cột, mật độ, mobile card,
  export Excel và print. Các danh sách hỗ trợ bộ kích thước trang legacy đến
  300 dòng; API chấp nhận `pageSize` từ 1 đến 300.
- Một luồng đổi trạng thái dùng chung cho danh sách sửa chữa, bảng KT và chi
  tiết; Dashboard được làm mới sau cập nhật.
- Trang sửa phiếu `/sua-chua-bao-hanh/:id/sua` phân biệt trường bị bỏ qua với
  trường được xóa rõ ràng: giá trị `null` xóa dữ liệu tùy chọn, còn trường không
  gửi lên giữ nguyên dữ liệu cũ.
- Chi nhánh hiển thị theo JWT; lựa chọn cũ không hợp lệ được đưa về phạm vi an
  toàn thay vì gửi request sang chi nhánh không được cấp quyền.
- Form Khách hàng/Đại lý dùng địa chỉ sau sáp nhập, MST, ngân hàng và tài khoản;
  API giữ tương thích với địa chỉ legacy.
- Danh mục thật dùng lookup cache chung; tạo/sửa dữ liệu làm mới các dropdown phụ
  thuộc. Mã phiếu mock mới dùng `PREFIX-yyyymm-N` theo loại và tháng.
- Tin nhắn `/tin-tuc` giữ danh sách, tìm kiếm, tạo và xem chi tiết tin nội bộ;
  trung tâm `/thong-bao` theo dõi lịch sử trạng thái, bấm thông báo mở đúng
  phiếu sửa chữa.
- Reset demo `Ctrl+Shift+R`, chỉ ở dev, xóa state lưu trữ và tải lại dữ liệu.

## Deployment

Frontend chạy trên GitHub Pages. API và Postgres chạy trên MacBook; ngrok cung
cấp HTTPS public. MacBook phải thức, Docker/API/ngrok phải hoạt động thì dữ liệu
thật mới truy cập được. Không mở port trên router: Postgres chỉ bind loopback,
còn API public chỉ đi qua ngrok và được bảo vệ bởi firewall macOS.

Runbook đầy đủ, gồm cập nhật bằng Git, backup, readiness gate, đổi tunnel và
rollback: [`docs/deployment.md`](./docs/deployment.md).

Thiết lập lần đầu hoặc cập nhật riêng Postgres/API trên MacBook, không deploy
frontend:

```bash
./scripts/macbook-api-deploy.sh
```

## Kiến trúc

Xem [`ARCHITECTURE.md`](./ARCHITECTURE.md) và
[`docs/codebase-summary.md`](./docs/codebase-summary.md).
