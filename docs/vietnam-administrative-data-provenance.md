# Nguồn dữ liệu đơn vị hành chính Việt Nam

## Phạm vi snapshot

Ứng dụng dùng snapshot hai cấp theo **Quyết định 19/2025/QĐ-TTg**, hiệu lực từ
`2025-07-01`:

| Thuộc tính        | Giá trị               |
| ----------------- | --------------------- |
| Version           | `official-2025.07.01` |
| Tỉnh/Thành phố    | 34                    |
| Phường/Xã/Đặc khu | 3.321                 |
| Mã cấp tỉnh       | 2 chữ số              |
| Mã cấp xã         | 5 chữ số              |

Ứng dụng không gọi dịch vụ địa lý bên ngoài lúc runtime. Backend seed dữ liệu từ
fixture đã đóng băng; frontend có snapshot tạo sẵn cho mock fallback.

## Nguồn và chuỗi biến đổi

- Văn bản quyết định: [Cổng thông tin Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=214409).
- Danh mục chính thức: [Tổng cục Thống kê/NSO](https://danhmuchanhchinh.nso.gov.vn/).
- Công cụ chuyển đổi trung gian: `zindont/vietnam-address-kit`, giấy phép MIT,
  ghim tại commit `faa205f656149acbd4c6f03ec1407a2e7cd6dff4`.
- SHA-256 bảng chuyển đổi đầu vào:
  `213966723785859dedd7c88965d6f12f8c3c508c91796e003804cf60a1054fc2`.

Commit trung gian chỉ hỗ trợ trích xuất. Quyết định và dịch vụ NSO vẫn là nguồn
thẩm quyền. Script chuẩn hóa loại đơn vị, tên không dấu dùng cho tìm kiếm, mã cha,
version, ngày hiệu lực và nguồn văn bản; sau đó kiểm tra số lượng, mã duy nhất,
định dạng mã và toàn vẹn quan hệ tỉnh-xã.

## Hiệu chỉnh chính thức

Nguồn chuyển đổi trung gian có sai khác ở mã `24496`. Dịch vụ chính thức
[`DMDVHC.asmx`](https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx) xác nhận:

| Mã      | Tên dùng trong ứng dụng | Loại | Tỉnh/Thành phố |
| ------- | ----------------------- | ---- | -------------- |
| `24496` | Xã Ea Kly               | Xã   | `66`           |

Cả script backend và frontend đều áp dụng hiệu chỉnh này trước khi ghi output.
Test API và frontend kiểm tra trực tiếp mã `24496`.

## Artifact và checksum

| Artifact                                | SHA-256                                                            |
| --------------------------------------- | ------------------------------------------------------------------ |
| `api/seed-fixtures/tinh-thanh.json`     | `64085f3a7c9100f322f8da896ed901449e878733278cee363044431c6bba7563` |
| `api/seed-fixtures/phuong-xa-2025.json` | `773edd21db2db11d2668df47ef7af18393f403198464b5768ffdbe1032f7df22` |

Metadata máy đọc nằm tại `api/seed-fixtures/dia-ly-metadata.json`. Snapshot
frontend nằm tại `src/data/vietnam-administrative-snapshot.ts` và được tạo bởi
`scripts/generate-vietnam-administrative-snapshot.mjs` từ đúng commit đã ghim.

## Tạo lại và xác minh

Không sửa fixture thủ công. Chuẩn bị hai file JSON đầu vào tại commit đã ghim,
sau đó chạy:

```bash
node api/scripts/build-official-geography.mjs \
  <current-provinces.json> <current-wards.json>
npm run data:generate:vn-admin
sha256sum api/seed-fixtures/tinh-thanh.json \
  api/seed-fixtures/phuong-xa-2025.json
npm run test:api:with-db
```

Chỉ chấp nhận thay snapshot khi đã đối chiếu lại nguồn chính thức, cập nhật
version/ngày hiệu lực/checksum, đạt đúng count kỳ vọng và toàn bộ test quan hệ.

## Chính sách tương thích

- Dữ liệu mới lưu mã `tinh_thanh_code` + `phuong_xa_code`; composite FK đảm bảo
  Phường/Xã thuộc đúng Tỉnh/Thành phố.
- Các cột địa chỉ cũ vẫn tồn tại để đọc dữ liệu lịch sử.
- Không suy đoán đơn vị sau sáp nhập từ địa chỉ tự do, tên cũ hoặc fuzzy match.
- Migration không copy `dia_chi` sang `ten_duong`; khách hàng cũ chỉ nhận mã mới
  khi người dùng xác nhận và cập nhật rõ ràng.

## Tham chiếu

- `api/seed-fixtures/dia-ly-metadata.json`
- `api/scripts/build-official-geography.mjs`
- `scripts/generate-vietnam-administrative-snapshot.mjs`
- `api/src/db/migrations/0001_cool_sunspot.sql`
- `api/src/db/migrations/0001_cool_sunspot.down.sql`
