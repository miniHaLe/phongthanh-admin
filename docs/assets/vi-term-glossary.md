# Bảng thuật ngữ tiếng Việt (VI Term Glossary)

> **Nguồn duy nhất (single source of truth)** cho mọi chuỗi tiếng Việt mang tính
> "load-bearing" trong bộ tài liệu so sánh: trạng thái đối chiếu, mức độ tin cậy
> (confidence), và các cờ trung thực (honesty flags). Bản exec tiếng Việt của
> `legacy-vs-rebuild-comparison.md` và bản HTML magazine **phải dùng nguyên văn**
> các chuỗi dưới đây — không diễn giải lại theo từng file.

## 1. Trạng thái đối chiếu (gap status buckets)

Chỉ có **3 bucket** — không có bucket thứ tư. Điều này ép tính trung thực.

| Khóa (khi trích dẫn EN) | Chuỗi VI chuẩn | Ý nghĩa |
|---|---|---|
| `Closed (mock)` | **Đã xử lý (chỉ trong bản mô phỏng)** | Tính năng đã được dựng lại và kiểm thử **chỉ ở tầng dữ liệu mock/in-memory**. KHÔNG có backend; dữ liệu mất khi tải lại trang. Từ hạn định "(chỉ trong bản mô phỏng)" là **bắt buộc**. |
| `Deliberate deviation` | **Lệch có chủ đích** | Bản dựng cố ý làm khác app gốc, có lý do bảo vệ được (ví dụ SPA thay cho cửa sổ popup). |
| `Deferred` | **Hoãn lại (kèm lý do)** | Chưa làm, có ghi rõ lý do (chờ đặc tả, ngoài phạm vi giai đoạn nguyên mẫu). |

## 2. Mức độ tin cậy (confidence tags)

Gắn cho **mọi dòng** — cả gap chức năng lẫn bảo mật, không chỉ riêng bảo mật.

| Khóa (EN) | Chuỗi VI chuẩn | Ý nghĩa |
|---|---|---|
| `confirmed` | **Đã xác nhận** | Quan sát trực tiếp trong đợt audit (kèm ngày) hoặc kiểm chứng bằng file mã nguồn đã ship. |
| `likely` | **Nhiều khả năng** | Suy luận mạnh từ một hiện vật quan sát được (phải nêu tên hiện vật đó). |
| `unconfirmed` | **Chưa xác nhận** | Không thể chứng minh bằng recon chỉ-đọc → cần một đợt pentest được ủy quyền. |

## 3. Cờ trung thực (honesty flags) — bắt buộc xuất hiện ở mọi bản

| Khóa | Chuỗi VI chuẩn |
|---|---|
| `mock-only` | **Toàn bộ là dữ liệu mô phỏng (mock) trong bộ nhớ — mọi thay đổi mất khi tải lại trang; không có backend.** |
| `perm-no-enforce` | **Ma trận phân quyền (202 ô chọn) chỉ là mô phỏng giao diện — không có hiệu lực thực thi.** |
| `payroll-static-sum` | **Cột Tổng / Thực lãnh của bảng lương là tổng tĩnh có tài liệu hóa — công thức tính lương thực được hoãn lại.** |
| `report-mock-cols` | **Một số cột kết quả trong báo cáo là dữ liệu mô phỏng hợp lý, chưa đối chiếu với partial AJAX của app gốc.** |
| `security-recon-only` | **Các nhận định bảo mật không chứng minh được bằng recon chỉ-đọc đều gắn "nhiều khả năng / chưa xác nhận; cần pentest được ủy quyền".** |

## 4. Cụm từ candor cho bản exec (HTML)

Dùng để nêu giới hạn một cách "cân xứng nhưng luôn hiển thị" (không bao giờ giấu):

- **"giai đoạn nguyên mẫu"** — prototype phase.
- **"dữ liệu mô phỏng"** — simulated/mock data.
- **"chưa phải kiểm thử an ninh chính thức"** — not a formal security audit/pentest.

## 5. Khung 3 cột (dùng nhất quán mọi nơi)

Mọi gap/bug trình bày theo **3 cột**: **Vấn đề ở bản cũ → Cách bản dựng xử lý →
Cờ trung thực**. Tài liệu một chiều kiểu "cũ xấu / mới tốt" bị từ chối.

## 6. Chỉ số exec (khung diễn giải bắt buộc)

Các con số (12 trang bổ sung, ~88 gap mức cao, 440 bài kiểm thử, 15 trạng thái, 3
chi nhánh) trình bày theo hướng **"bản dựng CÓ các tính năng này + có kiểm thử"**,
**KHÔNG** phải **"đã xác minh đạt ngang app gốc"** (not verified parity).
