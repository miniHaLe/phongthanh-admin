---
date: 2026-07-13
session: fullstack-live-review-remediation
status: completed
severity: critical
component: live-deploy, codebase architecture
---

# Journal: 2026-07-13 - 5-Agent Live-Site Panel + Red-Team Review

## Bối cảnh

Chạy 5-agent fullstack review panel trên live site (https://minihale.github.io/phongthanh-admin, login admin/admin123) + codebase kiểm toàn bộ hành vi thực thế. 3 agent xem layout/tương tác/hành trình qua browser thực, 2 agent đọc logic backend/frontend. Mục tiêu: chứng minh bằng runtime repro những gì cần sửa trước khi xây tính năng mới.

## Những gì được phát hiện (93 findings)

### Lỗi sạch, được chứng minh bằng repro

1. **Blank identity cells mọi bảng real-API**: column builder gán `cell: undefined` overrides TanStack default render. API trả full data, lỗi là client render pure. CI không gặp vì test chỉ check header.
   - Chứng cứ: CrudTablePage.tsx:129-137 + KhachHangPage.tsx:81-89 (fork)

2. **Raw stack traces, không có errorElement**: route tree không define error fallback. Khi chunk stale, user thấy "Unexpected Application Error!".

3. **"Thêm Đại Lý" silent data loss**: viết vào in-memory mock array, real-API list không thấy. Toast thành công nhưng DB rỗng.

4. **Push-to-main rebuilt against DEAD Render URL**: Pages CI points x-render-routing: no-server; ngrok URL (cái work) chỉ sống trong manual workflow_dispatch.

5. **2×–4× unmerged fetches per page**: /khach-hang gọi dia-ly + ngan-hang lần 2. Hai dialog always-mounted, hand-rolled useEffect bypass React Query.

6. **22 sub-pages không thể vào**: nav-config declare children nhưng render ở đâu cũng không có (Kho 7, Xuất Kho 4, Tài Chính 3, Báo Cáo 8).

### Red-team gate (30 findings, 26 accepted + applied)

Chạy 3 hostile reviewers (security lens bị omit per user directive).

**Những near-miss quan trọng mà red-team bắt được:**

- Planned seed backfill sẽ NO-OP trên live DB (mọi insert là onConflictDoNothing).
- Acceptance test diaChi-protection chỉ cover path đã an toàn, touched-but-not-replaced address vẫn live.
- Phase 5 "Create status-badge.tsx" — file đã tồn tại, 2 consumer đã migrate.
- Phase 5 "Generalize CrudFilterBar" sẽ reimplement FilterPanel (21 consumer hiện tại).
- Bán hàng "persistence bug" = hardcoded BRANCHES[0] + missing list invalidation (persistence, toast đã có).
- Phase 4 refetch-removal sẽ re-break dealer path (Phase 2 vừa sửa).

Emotional reality: hai trong ba agent crash API 429 ở cuối, nhưng đều viết report to disk trước → pattern "report-to-disk-early" validated. Bundle reviewed slightly stale so Phase 1 cần "re-verify live findings post-deploy".

## Quyết định được ghi

- Tạo remediation plan: `plans/260713-1817-fullstack-live-review-remediation/` (8 phases, P1, ck plan create).
- Bidirectional blockedBy với `260707-1612-real-backend-database`: phase CRUD-hardening (2/3) phải xong trước DB feature fan-out.
- Handoff notes viết vào 260707-1612 plan.md (nó biết phase 2/3 phải consume remediation auth guard + hardening).

## Khám phá ops

- agent-browser cần: `export XDG_RUNTIME_DIR=/run/user/$(id -u)` (env pointed uid khác) + `--disable-quic` (GitHub Pages lazy chunks).
- Live site talks **ngrok tunnel**, NOT Render (Render suspended) → Pages CI config mất sync. Cập nhật project memory.

## Xác minh

- Tất cả 5 reviewer hoàn thành + report to disk.
- 93 findings documented in:
  - `plans/reports/from-backend-reviewer-to-planner-260713-1632-api-db-system-logic-report.md`
  - `plans/reports/from-frontend-reviewer-to-planner-260713-1632-frontend-domain-logic-report.md`
  - `plans/reports/from-interaction-reviewer-to-planner-260713-1632-interaction-states-forms-feedback-report.md`
  - `plans/reports/from-journey-reviewer-to-planner-260713-1632-user-journey-ia-duplication-report.md`
  - `plans/reports/from-uiux-layout-reviewer-to-planner-260713-1632-layout-hierarchy-consistency-report.md`
- Red-team 30 findings + acceptance assessment in plan.md.

## Phản ánh

Cảm giác bị lật ngược: 5-agent panel được thiết kế để bắt những gì engineer bỏ lỡ, nhưng red-team bắt được những gì *chính cái plan* sắp sửa sai. "Generalize FilterPanel" → "FilterPanel hiện có"; "Create status-badge" → "status-badge.tsx tồn tại". Plan detail chưa đủ cẩn thận với thực trạng codebase. Tốn thêm vòng lặp xác minh lần thứ 2, nhưng nó catches late; better than deploy broken.

Two API 429 crashes ở cuối = rate limit từ live site repro traffic. Nhưng vì report-to-disk-early pattern, không mất dữ liệu → quyết định write report sớm đã save ngày hôm nay.

## Bước tiếp theo

1. Phase 1 (chứng minh + re-verify): fix blank cells, error boundary, silent data loss, ngrok URL, fetch dedup.
2. Run full live-site check lại post-Phase-1 deploy để confirm bundle findings.
3. Phase 2/3: auth guard + CRUD hardening (blocks 260707-1612).
4. Tối ưu nav-config renderability (22 pages).

---

Status: DONE
Summary: 5-agent live review + red-team caught 56 findings total; plan created to remediate in 8 phases with proven root causes (blank cells, error boundary, data loss, DNS/tunnel mismatch, fetch duplication, unreachable routes).
