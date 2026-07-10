# Legacy vs Rebuild — Comparison Record

**Legacy system:** ASP.NET MVC admin (`phongthanh.phanmemsuachuabaohanh.com`,
vendor "Phần Mềm Quốc Bảo") · **Rebuild:** React 18 + Vite + TypeScript + Tailwind
+ shadcn/ui prototype (this repo). · **Compiled:** 2026-07-07.

> **How to read this document.** Every gap is presented in a **3-column frame**:
> _old gap → rebuild handling → honesty flag_. This is deliberately **not** an
> "old bad / new good" doc — the rebuild is a **mock/in-memory prototype**, and its
> limitations are stated as flatly as the legacy system's defects. Detailed
> per-section tables live in the companion **[appendix](./legacy-vs-rebuild-appendix.md)**;
> old-site defects (functional/security/a11y/UX) live in the
> **[defect catalog](./legacy-defect-catalog.md)**; live-probe evidence lives in
> **[the evidence appendix](./assets/legacy-audit-evidence.md)**. Vietnamese
> load-bearing strings come from **[the glossary](./assets/vi-term-glossary.md)**.

---

## Tóm tắt điều hành (Executive Summary — tiếng Việt)

**Bối cảnh.** App gốc là hệ quản trị sửa chữa–bảo hành viết trên ASP.NET MVC (nền
tảng khoảng 2014: IIS 8.5, .NET 4, jQuery/AdminLTE2). Bản dựng lại (repo này) là
**nguyên mẫu (prototype) frontend React** dựng lại từ đầu, đối chiếu giao diện với
app gốc.

**Đã làm gì.** Bản dựng kế thừa bộ khung đọc dữ liệu sẵn có và bổ sung **12 trang
còn thiếu**, chuẩn hóa **bộ 15 trạng thái sửa chữa của app gốc** (id + màu hex cố
định), dựng lại các cột/nhãn/taxonomy khớp app gốc, và bổ sung các workflow giao
dịch (đổi trạng thái, điều phối kỹ thuật, báo giá, in phiếu, xuất Excel, ma trận
phân quyền). Toàn bộ được bọc bởi **440 bài kiểm thử tự động** (xác định, chạy lặp
cho cùng kết quả).

**Đọc con số cho đúng.** Các chỉ số dưới đây nói rằng **bản dựng CÓ các tính năng
này và CÓ bài kiểm thử cho chúng** — **KHÔNG** phải "đã xác minh ngang bằng app
gốc" (not verified parity). Việc đối chiếu ngang bằng thực sự cần chạy song song
hai hệ với dữ liệu thật.

| Chỉ số | Giá trị | Nghĩa (khung "có tính năng", không phải "đạt parity") |
|---|---|---|
| Trang dựng mới | 12 | Số trang app gốc trước đây không có bản địa phương |
| Gap mức cao được xử lý | ~88 (trong bản mock) | Đã dựng lại **ở tầng mô phỏng**; xem cột "Cách xử lý" từng mục |
| Bộ trạng thái | 15 (id + hex cố định) | Thay cho bộ 16 trạng thái tự chế trước đây |
| Chi nhánh | 3 | Đắk Lắk, Đắk Nông, Cộng tác viên tuyến huyện |
| Bài kiểm thử | 440 (xác định) | Kiểm thử tính năng đã dựng — không đo mức tương đương với app gốc |
| Primitive dùng chung | F7/F8/F9 | In phiếu / xuất Excel / mở link ngoài đã được làm cứng an ninh |

**Một lưu ý trung thực (bắt buộc).** Bản dựng là **toàn bộ dữ liệu mô phỏng (mock)
trong bộ nhớ — mọi thay đổi mất khi tải lại trang; không có backend.** Ma trận phân
quyền chỉ là mô phỏng giao diện, **không có hiệu lực thực thi**. Đây là **giai đoạn
nguyên mẫu**, không phải sản phẩm production.

---

## 1. Methodology

### 1.1 Two evidence sources (each dated + caveated)

| Source | What it provides | Reliability caveat |
|---|---|---|
| **Static corpus (260703)** | The master gap matrix (88 high / 121 medium / 75 low across ~50 reference pages), 12 per-section verified specs (exact columns/labels/endpoints), and 7 rebuild phase-completion notes. | Verified from mirrored partials on **2026-07-03**. The live site may have changed since; where a spec was "inferred/not captured", the row inherits `likely`. |
| **Live audit (260707)** | Fresh read-only recon of the running legacy site: auth handshake, transport/header posture, HTTP 500 sweep, one verified-non-mutating export inspection, XSS/CSRF surface notes, 3 PII-redacted screenshots. See **[evidence appendix](./assets/legacy-audit-evidence.md)**. | Recon-level, **not a formal pentest**, dated **2026-07-07**. Security claims not provable by read-only recon are tagged `likely/unconfirmed`. |

The live audit is a **non-blocking enrichment**: it _upgrades_ specific rows to
`confirmed` and adds a **[static-vs-live discrepancy list](./assets/legacy-audit-evidence.md#static-vs-live-discrepancies)**
that this document consumes (see §1.3). The synthesis stands on the static corpus
alone; the live pass sharpens it.

### 1.2 The 3-column frame & status vocabulary

Every gap row uses: **Gap (old) | Severity | Confidence | Rebuild status | Note | Source**.

- **Rebuild status** ∈ exactly three buckets (glossary §1):
  **Closed (mock)** = _Đã xử lý (chỉ trong bản mô phỏng)_ — the mock qualifier is
  mandatory; **Deliberate deviation** = _Lệch có chủ đích_;
  **Deferred** = _Hoãn lại (kèm lý do)_. There is no fourth "done" bucket — this
  forces honesty about the in-memory nature.
- **Confidence** ∈ {`confirmed`, `likely`, `unconfirmed`} on **all** rows, not
  security-only. Any gap whose source section-file marked the old-site spec
  "inferred / not captured / unverified" inherits `likely` — never asserted as
  `confirmed`.
- **"Closed (mock)"** rows are cross-checked against **both** the phase completion
  note **and** the shipped code file named in the section spec (see §3).

### 1.3 Consuming the live-audit discrepancies (260707)

Five static-vs-live divergences were observed and are reconciled here:

| # | Reconciliation applied in this doc-set |
|---|---|
| D-1 | `X-Frame-Options` is **present (`SAMEORIGIN`) on the login page but absent on authed app pages** — not globally "missing" as the 260703 corpus said. Catalog uses the nuanced statement. |
| D-2 | The `/RoleFunction/Index` HTTP 500 **also leaks a full stack trace + source view paths** (`customErrors=Off`) → upgraded to a confirmed info-disclosure finding. |
| D-3 | The list export is an **HTML-table-masquerading-as-`.xls`**; the sampled data had **no formula-leading cell** → formula-injection is `unconfirmed` (not "likely safe", not "confirmed"). |
| D-4 | The legacy "Excel" export mechanism is recharacterized as an HTML `<table>` dump (not OOXML) — which the rebuild's real SheetJS `.xlsx` replaces. |
| D-5 | Missing HSTS/CSP/`X-Content-Type-Options`/`Referrer-Policy` **confirmed** on both surfaces, now dated. |

---

## 2. Per-section gap-closure rollups

Rollup format: severity counts (from the 260703 gap matrix) → how the rebuild
handled the bulk of them. **Full per-row detail tables are in the
[appendix](./legacy-vs-rebuild-appendix.md).** Section-total confidence is
**`likely`** wherever the underlying section spec relied on inferred/AJAX-unverified
columns (flagged per section); status-vocabulary and shipped-code facts are
**`confirmed`** against the phase notes + code tree.

| # | Section | Sev (H/M/L) | Rollup — rebuild handling | Section confidence |
|---|---|---|---|---|
| 1 | Shell / nav / layout | 4 / 6 / 6 | **Closed (mock):** RepairingM KT board route, notification bell → history list, News dropdown + list/detail, call-center demo toast (Ctrl+Shift+G), User-Detail profile, branch-map modal, footer. **Deliberate deviation:** flat frequency-ranked IA kept (D1) instead of the accordion tree. | confirmed (nav facts) |
| 2 | Repair workspace (Index_8) | 8 / 8 / 3 | **Closed (mock):** 15-status legend w/ live counts, 14-col table, 7 row-action modals, dispatch lifecycle, báo giá flow, batch toolbar (5 prints + SMS-as-toast + Chuyển CN), 22-field filter set (incl. the `soPhieuHang` bug **fixed**), Excel export. **Deliberate deviation:** as-you-type filtering (no "Tìm kiếm" button); no row-click. | confirmed |
| 3 | Repair KT dashboard (/RepairingM) | 3 / 5 / 2 | **Closed (mock):** whole technician board built, 10-status subset `[2,4,6,7,8,9,13,15,16,17]`, 14 cols, photo-upload modal. **Deliberate deviation:** plan-calendar "Kế hoạch của bạn" folded into the dashboard as a tab (D1), not the home page. | confirmed (status), likely (KT cols) |
| 4 | Customer (/Customer/Index) | 3 / 5 / 4 | **Closed (mock):** reference column set, 9-value Nhóm KH taxonomy, Thêm Đại Lý second create flow, phone2/location/đại lý fields; Excel export. **Deferred:** bulk-select scoped to delete-only (open decision #4). | likely (some cols inferred) |
| 5 | Finance (ChungTu/CongNo/Invoice) | 9 / 9 / 6 | **Closed (mock):** ChungTu 12-type + 5-state collection, Phiếu Thu/Chi flows, per-row print, per-ticket Công nợ + settle-debt modal, Invoice composer w/ MST + VAT. **Deliberate deviation:** invented approval `Trạng thái` dropped; Công nợ has no Hạn TT/overdue (reference removed it). | likely (ChungTu form inferred) |
| 6 | Catalog A (Hàng hóa, Sản phẩm…) | 5 / 14 / 16 | **Closed (mock):** Hàng hóa reference cols + 3 price tiers + NSX/Model, Kho xác flag, Tiền khoán on Sản phẩm, In Barcode; app-wide bulk-delete + Lưu&Thêm + Excel. | likely (AJAX cols) |
| 7 | Catalog B (Khu vực, Phí giao…) | 7 / 11 / 7 | **Closed (mock):** Tỉnh→Quận→Xã hierarchy (P1 TUYEN), Phí giao product-linked (Cộng/Trừ/Công), Lỗi SC labor prices, Thời hạn Tháng/Năm (soNgay deleted). **Deliberate deviation:** `KhuVuc` symbol kept, only its fields re-modeled (avoids barrel collision). | likely |
| 8 | Warehouse | 14 / 20 / 6 | **Closed (mock):** 6 full-page line-item editors, 4 inventory views w/ Kỳ + technician axis + Giá vốn, DSCapLK usage list re-modeled, DSTraLK duyệt flow, **new DSTraLKXac** (trả hãng + Mã vận đơn), Kỳ carry-forward math. | likely (result cols unverified) |
| 9 | Stock-out | 10 / 11 / 4 | **Closed (mock):** Cấp LK / Bán hàng / Trả hàng (4 hình thức) / Chuyển kho (×2 dual editors) full-page editors, prints, exports. **Deliberate deviation:** "Tìm kiếm" vs "Tìm chi tiết" produce the same result locally. | likely |
| 10 | HR (10 pages) | 11 / 13 / 6 | **Closed (mock):** 4 stub pages built (Ngân hàng, Phụ cấp, Loại Phạt Thưởng, Ứng lương), NhanVien full editor + Khóa toggle, Bảng lương 17-col + totals, Chấm công exception model, Kỳ entity. **Deferred:** payroll **Tổng/Thực lãnh formula** (static sum shipped). | confirmed (build), likely (cols) |
| 11 | Reports (6 canonical) | 8 / 9 / 8 | **Closed (mock):** 6 reference reports (Tình trạng KT/chung, Máy tồn, KPI KTV/Tiếp nhận, SCBH KT) w/ charts + drill-down + tri-mode period. **Deliberate deviation:** local Doanh thu/Xuất kho reports **kept** alongside (V5). | likely (result cols mock) |
| 12 | Admin / Permissions / Account | 6 / 10 / 7 | **Closed (mock):** Chi nhánh full fields + map, Người dùng Khóa toggle + Chi nhánh phụ, menu-tree (~50 nodes) + **202-checkbox function matrix**. **Known limitation:** the matrix is **UI-only, no enforcement**; ChucNang taxonomy reconstructed because the reference RoleFunction page is HTTP 500. | confirmed (build), likely (taxonomy est.) |

**Totals:** 88 high / 121 medium / 75 low gaps across the corpus; the large
majority are **Closed (mock)** — verified in-memory only — with the deviations and
deferrals named per section above and detailed in the appendix.

---

## 3. "Closed (mock)" cross-check + the two live residuals

Every "Closed (mock)" claim is backed by **both** a phase completion note **and** a
shipped code file (verified present in the `src/` tree, 569 TS/TSX files). Examples
of the code-file anchors:

| Closed claim | Phase note | Shipped code file (verified present) |
|---|---|---|
| 15-status canonical vocab | P1 | `src/domains/repair/status.ts` |
| 15-status legend + live counts | P3 | `src/components/shared/status-legend.tsx` |
| Row-action modals + dispatch | P3 | `src/features/repair-list/components/*` + `src/domains/repair/mock-mutations.ts` |
| KT technician board | P4 | `src/features/repair-kt/RepairKtListPage.tsx` |
| New DSTraLKXac (trả hãng) | P5 | `src/pages/quan-ly-kho/DsTraLKXacPage.tsx` |
| Real client-side .xlsx export (F8) | P2 | `src/lib/export-xlsx.ts` |
| Print-window (F7) | P2 | `src/components/print/print-window.tsx` |
| External-link allowlist (F9) | P2 | `src/lib/open-external.ts` |
| 202-checkbox permission matrix | P7 | `src/features/permissions/function-permission-matrix.tsx` |

### Two live residuals — carried inline, not buried

1. **KT-board ≥10 count is probabilistic.** The seed guarantees each of the 10
   KT-subset statuses has ≥10 tickets, but the observed **thinnest margin is 3**
   (i.e. the invariant holds by a small buffer and is regenerated by the PRNG).
   Any future edit to the P3+ ticket generator must re-verify this. → tagged an
   inline caveat wherever the KT board's counts are cited.
2. **Permission matrix has no enforcement.** The 202-checkbox function matrix and
   ~50-node menu tree persist to `localStorage` (`pt-permissions`) but **gate
   nothing** — every route/action is reachable regardless of checkbox state. This
   is a mock of the _UI_, not the _authorization system_.

---

## 4. Deliberate deviations (what + why defensible)

| Deviation | What changed | Why it's defensible |
|---|---|---|
| **Flat IA (D1)** | Kept the flat frequency-ranked sidebar + section tabs instead of the reference accordion tree. | Fewer clicks to frequent pages; missing routes were _added into_ the flat structure, so no content parity was lost — only nav cosmetics differ. |
| **SPA routes vs popup windows** | Repair detail/create and all editors are SPA routes, not `window.open` popups. | No popup-blocker fragility, back-button works, deep-linkable. Legacy popups are an era-2014 constraint. |
| **As-you-type filtering** | Lists filter as you type instead of requiring a "Tìm kiếm" button. | Lower interaction cost; reference's mandatory-button pattern is a full-page-reload artifact. |
| **Single pagination** | One bottom pager + page-size selector instead of dual top/bottom pagers. | Reduces UI noise; dual pagers were a workaround for long reload-heavy pages. |
| **Corrected legacy typos (D3)** | Rendered "Mở" (not the legacy typo "Mỡ"), "Sản phẩm" (not "Sản phầm"). | Data fidelity, not bug-for-bug mimicry. The legacy strings are documented in the defect catalog. |
| **Dropped invented features** | Removed the rebuild's own earlier inventions: approval-state pills, day-matrix chấm công, invented `Trạng thái` columns, snake_case statuses, per-ticket overdue clock. | These never existed in the reference; keeping them would have been _reverse_ drift. |
| **Loại bảo hành label split** | Index_8 filter uses "Tại Trạm/Nhà Khách"; create form uses "Tại TTBH/Tại Nhà". | Each matches its own reference screen verbatim — faithful, though internally inconsistent (a legacy trait, preserved). |

---

## 5. Known limitations (the honesty flags)

All five honesty flags apply to this deliverable and the whole doc-set (VI strings
in [glossary §3](./assets/vi-term-glossary.md)):

1. **Mock-only.** 100% mock/in-memory. Every create/update/delete is lost on any
   page reload — there is **no backend**. This is a prototype.
2. **Permission matrix has no enforcement.** UI mock only (see §3 residual 2).
3. **Payroll Tổng/Thực lãnh = documented static sum.** Bảng lương ships static
   seeded rows; the real payroll-derivation formula is **deferred** until specified.
4. **Some report result-columns are plausible-mock, unverified.** Several report
   result tables (KPI KTV, KPI Tiếp nhận, Máy tồn, SCBH) were built from inferred
   columns because the reference renders them via AJAX partials not mirrored in 260703.
5. **Security claims are recon-level.** Anything not provable by read-only recon is
   tagged `likely/unconfirmed; requires authorized pentest` — see the defect catalog.

### Deferred gaps (explicit)

- Payroll formula (above).
- Reference report result-column verification (mock vs live AJAX) — spot-check
  deferred; rows stay `likely` where unverified.
- Full backend/persistence — out of scope for the prototype by design.

---

## 6. Scope & distribution

- **Documentation only** — no code files were touched producing this doc-set.
- The **[defect catalog](./legacy-defect-catalog.md)** and the **screenshots** are
  **internal-distribution only** pending owner sign-off: they reproduce a named
  third-party vendor's ("Phần Mềm Quốc Bảo") branded UI and recon-level security
  observations. External circulation needs owner approval.
- No password or session cookie appears in any committed file; the live audit
  referenced credentials by username only.

---

_Companion files:_
[appendix (detail tables)](./legacy-vs-rebuild-appendix.md) ·
[defect catalog](./legacy-defect-catalog.md) ·
[evidence appendix](./assets/legacy-audit-evidence.md) ·
[VI glossary](./assets/vi-term-glossary.md) ·
[HTML magazine](./legacy-vs-rebuild-comparison.html)
