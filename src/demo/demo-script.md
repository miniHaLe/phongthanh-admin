# Kịch bản Demo — Phong Thành Admin

Hướng dẫn từng bước cho người thuyết trình. Tổng thời gian ước tính: ~10 phút.

---

## 1. Khởi động

1. Chạy `npm run dev` — trình duyệt mở tại `http://localhost:5173`.
2. Màn hình chào hiển thị trang **Trang chủ** với các KPI card và biểu đồ Recharts.
3. Chỉ ra URL không cần backend — toàn bộ dữ liệu là mock, 100% chạy phía client.

---

## 2. Chế độ tối (Dark mode)

1. Nhấn biểu tượng mặt trăng / mặt trời ở góc trên-phải thanh header.
2. Giao diện chuyển sang dark — sidebar, card, bảng đều đổi màu nhất quán.
3. Tải lại trang — chế độ tối vẫn được giữ (lưu qua Zustand persist → localStorage).

---

## 3. Command Palette (⌘K / Ctrl+K)

1. Nhấn `Cmd+K` (macOS) hoặc `Ctrl+K` (Windows/Linux).
2. Palette mở — gõ "sửa" để lọc nhanh mục Sửa chữa.
3. Gõ "danh mục" — hiển thị tất cả 14 nhóm danh mục.
4. Nhấn `Enter` hoặc click để điều hướng; nhấn `Esc` để đóng.
5. Thử từ bất kỳ route nào — palette hoạt động toàn cục.

---

## 4. Bộ lọc, sắp xếp và cấu hình cột — trang Sửa Chữa

1. Điều hướng tới **Sửa Chữa - Bảo Hành** (`/sua-chua-bao-hanh`).
2. **Bộ lọc:**
   - Nhấn thanh bộ lọc, chọn trạng thái "Đang sửa chữa".
   - Kết quả thu hẹp ngay lập tức; badge bộ lọc hiển thị số lượng đang áp dụng.
   - Nhấn "Xóa bộ lọc" — bảng phục hồi toàn bộ dữ liệu.
3. **Sắp xếp:**
   - Click tiêu đề cột "Ngày nhận" — mũi tên ↑ xuất hiện (tăng dần).
   - Click lần 2 — chuyển sang giảm dần.
4. **Cấu hình cột:**
   - Nhấn nút "Cột" ở góc phải toolbar.
   - Ẩn/hiện cột "Ghi chú" — bảng cập nhật ngay, trạng thái được lưu vào localStorage.
5. **Phân trang:**
   - Chọn 50 dòng/trang — bảng tải trang mới (keepPreviousData: không nhấp nháy).

---

## 5. Giao diện mobile / drawer điều hướng

1. Mở DevTools → chế độ thiết bị → chọn iPhone 14 (390 × 844).
2. Sidebar ẩn; nhấn biểu tượng hamburger (≡) ở header — drawer trượt ra từ trái.
3. Điều hướng sang **Khách hàng** qua drawer — drawer đóng tự động.
4. Trên bảng Sửa chữa ở mobile: chỉ hiển thị các cột ALWAYS (STT, Phiếu SC, Khách hàng, Trạng thái).

---

## 6. Trạng thái trống / lỗi

1. Trong bộ lọc Sửa chữa: chọn một tổ hợp bộ lọc không có kết quả.
2. Hiển thị **EmptyState** "Không tìm thấy kết quả" với nút "Xóa bộ lọc".
3. (Nếu có mock lỗi) Chỉ ra component ErrorBoundary bắt lỗi và hiển thị nút "Thử lại" thay vì crash toàn trang.

---

## 7. Dashboard KPIs

1. Quay lại **Trang chủ**.
2. Chỉ ra 4 KPI card: Tổng phiếu, Doanh thu, Phiếu hoàn thành, Đang sửa.
3. Biểu đồ cột Recharts: doanh thu theo tháng — hover tooltip hiển thị giá trị VNĐ.
4. Biểu đồ tròn: phân bổ trạng thái — 5 bucket màu, legend ở bên phải.
5. Thử đổi chi nhánh ở header (Đắk Lắk / Đắk Nông / Tất cả) — số liệu thay đổi.

---

## 8. CRUD Danh mục — Luồng 1: Nhà sản xuất

1. Điều hướng **Danh Mục → Nhà Sản Xuất** (`/danh-muc/nha-san-xuat`).
2. **Tạo mới:** nhấn "+ Thêm mới" → sheet trượt ra từ phải → nhập "Sony" → Lưu → toast "Thao tác thành công" → hàng mới xuất hiện.
3. **Sửa:** click biểu tượng bút chì trên hàng → đổi tên → Lưu.
4. **Xóa:** click biểu tượng thùng rác → dialog xác nhận → Xác nhận → hàng biến mất.

---

## 9. CRUD Danh mục — Luồng 2: Khu vực

1. Điều hướng **Danh Mục → Khu Vực** (`/danh-muc/khu-vuc`).
2. Lặp lại luồng tạo/sửa/xóa — minh họa template CrudTablePage hoạt động nhất quán trên mọi entity.
3. Tìm kiếm theo tên khu vực — ô search lọc kết quả real-time (debounce 300ms).

---

## 10. Reset demo

- Nhấn `Ctrl+Shift+R` (dev mode) — tất cả trạng thái Zustand bị xóa khỏi localStorage, trang tải lại về trạng thái ban đầu.
- Hoặc gọi `resetDemo()` từ DevTools console: `import('/src/demo/demo-reset').then(m => m.resetDemo())`.
