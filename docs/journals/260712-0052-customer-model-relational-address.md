---
date: 2026-07-12
session: customer-model-relational-address
status: completed
---

# Journal: 2026-07-12 - Customer, Model và địa chỉ quan hệ

## Bối cảnh

Chuyển Nhà sản xuất, Sản phẩm, Model, Ngân hàng, Địa lý và Khách hàng sang
NestJS/Postgres thật; phiếu sửa chữa vẫn mock. Mục tiêu chính: Model luôn đúng
hãng/sản phẩm, form khách hàng dùng địa chỉ hai cấp sau sáp nhập và dữ liệu cũ
không bị suy đoán hay ghi đè.

## Đã thực hiện

- Thêm schema, migration, seed và API cho bốn danh mục quan hệ, địa lý chỉ đọc,
  cùng các trường địa chỉ/tài chính của khách hàng.
- Model lưu trực tiếp `nhaSanXuatId` và `sanPhamId`; lập phiếu lọc theo cha, chọn
  Model tự đồng bộ cha, đổi cha không tương thích sẽ xóa Model.
- Hai màn hình thêm Model dùng chung contract đúng bốn trường: Tên Sản Phẩm,
  Nhà sản xuất, Tên model, Ghi chú.
- Form khách hàng dùng chung cho tạo/sửa và quick-create; hỗ trợ Tên đường,
  Tỉnh/Thành phố, Phường/Xã, mã số thuế, ngân hàng, số tài khoản. Số tài khoản
  giữ kiểu text để không mất số 0 đầu.
- Đóng băng snapshot Quyết định 19/2025/QĐ-TTg: 34 tỉnh/thành, 3.321 phường/xã,
  có checksum và metadata nguồn. Mã `24496` được sửa theo nguồn NSO chính thức
  thành `Xã Ea Kly`, tỉnh `66`, thay vì tin tuyệt đối dữ liệu trung gian.

## Bẫy và sửa cuối

- Không backfill `diaChi -> tenDuong`; khách hàng cũ giữ nguyên địa chỉ tự do và
  chỉ nhận mã hành chính mới khi người dùng xác nhận.
- Payload cập nhật gửi `null` rõ ràng để xóa trường tùy chọn; đồng thời theo dõi
  `addressTouched` để lần sửa không chạm địa chỉ không vô tình xóa `diaChi` cũ.
- Giữ `loaiKhachHangId` hiện tại khi sửa; API enrich tên ngân hàng thay vì để UI
  hiển thị ID.
- Catalog Model dùng key `['model', 'catalog']`, `staleTime: 0` và cùng prefix với
  CRUD invalidation. Snapshot đầy đủ còn loại Model đã xóa khỏi compatibility
  store, nên boundary tạo phiếu không chấp nhận ID stale.
- Rollback `0001` không chỉ gỡ schema mới mà còn xóa đúng hash khỏi
  `drizzle.__drizzle_migrations`; rehearsal xác nhận có thể forward, rollback,
  reapply mà không mất khách hàng hay địa chỉ legacy.

## Quyết định

| Quyết định                                     | Lý do                                           | Tác động                                     |
| ---------------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Chi nhánh khách hàng lấy từ JWT `branchIds[0]` | Địa chỉ không phải quyền sở hữu dữ liệu         | Không đổi scope theo nơi ở khách hàng        |
| Giữ cột địa chỉ legacy                         | Không có mapping hậu sáp nhập đủ tin cậy        | Đọc dữ liệu cũ an toàn, migration cộng thêm  |
| Model có hai FK bắt buộc                       | Chặn bộ ba hãng/sản phẩm/model sai từ DB đến UI | Filter và quick-create dùng một quan hệ thật |
| Snapshot hành chính cố định                    | Tránh phụ thuộc dịch vụ ngoài lúc runtime       | Seed và mock fallback tái lập được           |
| Đại lý và quick-create Bán hàng ngoài phạm vi  | Đây là giới hạn đã duyệt                        | Hai luồng này vẫn dùng implementation cũ     |

## Xác minh

- Frontend focused: 11 file, 42 test; full Vitest: 139 file, 498 test.
- TypeScript sạch; lint exit 0, không có warning trong phạm vi thay đổi.
- API lint/build/Jest với Postgres thật: 2 suite, 35 test.
- Build production với đủ sáu real resource: đạt, 1.394 module.
- Playwright 375px route smoke: 2 test đạt; checksum fixture và hash rollback đạt.
- Migration rehearsal forward/rollback/reapply đạt; reviewer không còn finding
  trong phạm vi đã duyệt.

## Phản ánh

Phần khó không nằm ở thêm field mà ở tương thích dữ liệu: nếu backfill địa chỉ,
coi chuỗi rỗng như bỏ qua, hoặc giữ cache Model cũ thì UI vẫn có vẻ đúng nhưng
DB và lần reload sẽ sai. Các guard được đặt ở cả form, service và FK giúp lỗi
không phụ thuộc một lớp duy nhất. Đổi lại, browser test mới là route smoke; hành
vi persistence chi tiết hiện được chứng minh bằng Vitest và API integration.

## Bàn giao

- Workspace hiện không có `.git`; chưa thể tạo commit hay cung cấp diff Git.
- Khi đưa vào đúng repository/worktree, chạy lại quality gates trong README rồi
  commit theo conventional commits.
- Không mở rộng Đại lý/Bán hàng nếu chưa có scope mới; đây là giới hạn đã biết,
  không phải regression của thay đổi này.

## Câu hỏi chưa giải quyết

- Không có câu hỏi chặn bàn giao.
