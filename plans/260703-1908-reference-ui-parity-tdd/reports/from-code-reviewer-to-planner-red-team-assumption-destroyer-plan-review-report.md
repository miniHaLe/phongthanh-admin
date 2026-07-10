# Red-Team Plan Review — Assumption Destroyer (Scope Auditor lens)

Plan: `plans/260703-1908-reference-ui-parity-tdd/` (7 phases, reference UI parity TDD)
Reviewer posture: hostile. Every finding grep-verified against `src/`.
Date: 2026-07-04

---

## Finding 1: Seed data P1 regenerates is DEAD — the live pages read a different data layer

- **Severity:** Critical
- **Location:** Phase 1, "R4 seed regeneration" + "TDD Plan 1.1 characterization" + "Implementation Steps 11-18"
- **Flaw:** P1's core deliverable (D3) is "regenerate the relational mock seed to reference models" in `src/mock/seed/*` (`SEED_REPAIR_TICKETS`, `SEED_CUSTOMERS`, new `chung-tu.ts`/`cong-no.ts`/`cham-cong.ts` etc.), and it locks that seed with characterization tests (`SEED_REPAIR_TICKETS.length === 500`, `SEED_CUSTOMERS.length === 150`). But **none of that seed data is wired to any rendered page.** The live repair workspace generates its own `MOCK_TICKETS` inside `src/domains/repair/mock-data.ts`; the customer/catalog pages read `*_ROWS` from `src/mock/masterdata/*`; finance pages read `src/mock/finance-mock.ts`. The only thing anyone imports from `@/mock/seed` is the generic `ListParams`/`PagedResult`/`BaseEntity` **types**.
- **Failure scenario:** P1 completes, all seed tests green, `npm run build` clean — and the app renders exactly the same invented data as before, because `SEED_REPAIR_TICKETS` (legacy statuses, 15 buckets) is never read by `MOCK_TICKETS` (which still hardcodes `status: 'cho_tiep_nhan'` at line 549 and weights over the 16-status `STATUS_WEIGHTS`). P3–P7 then "consume the P1 seed" that no page actually uses; the parity work silently no-ops or each phase quietly re-wires its page to a new source without the plan saying so, exploding scope mid-phase.
- **Evidence:**
  - `grep SEED_REPAIR_TICKETS src/ | grep -v src/mock/seed/` → empty (zero external consumers).
  - `grep SEED_CUSTOMERS / SEED_STAFF / SEED_PRODUCTS` outside seed → empty.
  - `src/domains/repair/mock-data.ts:360` `export const MOCK_TICKETS = Array.from(...)` — own generator; `:159` `const STATUS_WEIGHTS: Record<RepairStatus, number>`; `:549` `status: 'cho_tiep_nhan'`.
  - `src/config/crud-configs/khach-hang.config.ts:5` `import { khachHangApi } from '@/mock/masterdata/khach-hang.mock'` (not SEED_CUSTOMERS).
  - `src/mock/finance-mock.ts:8-12` imports `@/mock/masterdata` + `finance-types`, never `financials.ts`/`chung-tu.ts`.
  - `grep "from '@/mock/seed'"` consumers: `crud-types.ts`, `masterdata/index.ts`, `finance-mock.ts`, `use-crud.ts`, `masterdata-types.ts` — all type-only.
- **Suggested fix:** Before any seed regeneration, P1 must decide and STATE the data-layer strategy: either (a) rewire `MOCK_TICKETS`, `khach-hang.mock`, `finance-mock` to consume the seed (large, unscoped in current plan), or (b) do the status/model work directly in the live layers (`domains/repair/mock-data.ts`, `masterdata/*`, `finance-mock.ts`) and treat `src/mock/seed/*` as the dead code it is (delete, don't regenerate). The current plan does neither — it regenerates dead data and asserts on it.

---

## Finding 2: P6 customer page cannot see P1's customer taxonomy — two disconnected customer models

- **Severity:** Critical
- **Location:** Phase 6, "CU1 Khách Hàng" + Phase 1 "R4 Customer seed gets Loại 9-value taxonomy… daiLyTramId… nguoiTaoId… Tỉnh/Quận/Xã ids"
- **Flaw:** P1 adds the 9-value `Loại`, `daiLyTramId`, `Người tạo`, Tỉnh/Quận/Xã to `SEED_CUSTOMERS` in `src/mock/seed/customers.ts`. P6's `KhachHangPage` renders from `khachHangConfig` → `khachHangApi` → `KHACH_HANG_ROWS` in `src/mock/masterdata/khach-hang.mock.ts`, a **completely separate** 50-row generator with invented fields (`maKH`, `tongPhieu`, `khuVucId`/`phuongXaId` pointing at string ids `kv-1..kv-4`/`px-1..px-5`). P1's customer work is invisible to the page that P6 says consumes it. The plan's P1 explicitly says "masterdata mocks … NOT touched" (N4), so P6 must silently rewrite the masterdata customer model AND its Tỉnh/Quận/Xã wiring — unscoped work hidden inside a "config rewrite."
- **Failure scenario:** P6 developer opens CU1, discovers the page's data source (`masterdata/khach-hang.mock`) has none of the P1 fields and a conflicting location model (`kv-1` string ids vs P1's `tinhId/quanId/xaId`). To ship the 15-column reference table they must rewrite `khach-hang.mock.ts` + `masterdata-types.ts KhachHang` + re-point Tỉnh/Quận/Xã — none of which is in the P6 file list, and all of which P1 declared off-limits. Estimate blows up; or the page ships with wrong/empty columns.
- **Evidence:**
  - `src/mock/masterdata/khach-hang.mock.ts:1` "50 seeded rows"; `:60` `Array.from({ length: 50 }`; `:52-53` `KHU_VUC_IDS = ['kv-1'..]`, `PHUONG_XA_IDS = ['px-1'..]`; `:65` `maKH`; `:80` `tongPhieu`.
  - `src/config/crud-configs/khach-hang.config.ts:5-7` imports `khachHangApi`, `KHU_VUC_ROWS`, `PHUONG_XA_ROWS` from masterdata.
  - `src/mock/seed/customers.ts:121-122` `SEED_CUSTOMERS = Array.from({ length: 150 }`, has `khuVucId/phuongXaId` (P1 will swap to tinh/quan/xa).
  - Phase 1 N4: "`masterdata/` mocks and their CrudConfigs are NOT touched."
- **Suggested fix:** Pick one customer model. Either move the customer page onto `SEED_CUSTOMERS` in P1 (and delete the masterdata customer mock), or scope the masterdata `khach-hang.mock`/`KhachHang`-type rewrite explicitly into P6's file list and remove the N4 "not touched" claim. Same collision exists for KhuVuc/PhuongXa (Finding 3) and Phí giao.

---

## Finding 3: `KhuVuc`/`PhuongXa` exist in TWO type systems; P1 deletes only one, P6/masterdata still bind the other

- **Severity:** Critical
- **Location:** Phase 1, Architecture "reference-data.ts: KhuVuc/PhuongXa interfaces + arrays move to tinh-quan-xa.ts" + Phase 6 "C8 Khu vực / C9 Phường/Xã"
- **Flaw:** The plan treats `KhuVuc`/`PhuongXa` as one thing living in `src/mock/seed/reference-data.ts`. There are actually **two independent definitions**: (1) seed `reference-data.ts` (`KhuVuc {id,ten,tinh}`) consumed only by `seed/customers.ts`; (2) `src/types/masterdata-types.ts` (`KhuVuc {maKhuVuc,tenKhuVuc}` / `PhuongXa {maPhuongXa,tenPhuongXa,khuVucId}`) consumed by the live catalog: `khu-vuc.mock.ts`, `phuong-xa.mock.ts`, `khu-vuc.config.ts`, `phuong-xa.config.ts`, `khach-hang.config.ts`, `phi-giao.config.ts`, `phi-giao.mock.ts`, `phuong-xa.mock.ts`, and re-exported from `masterdata/index.ts`. P1 deletes the seed copy; the masterdata copy (the one that renders on C8/C9 pages) is untouched by P1 but must be fully re-modeled to Tỉnh→Quận→Xã by P6 — again unscoped and colliding with the seed regeneration.
- **Failure scenario:** After P1, the KhuVucPage/PhuongXaPage still render the flat masterdata `KhuVuc {maKhuVuc,tenKhuVuc}` with no Tỉnh/Quận. P6 must replace the masterdata type + both mocks + 4 configs to the hierarchy, coordinate ids with P1's `tinh-quan-xa.ts`, and keep `phi-giao.mock`/`khach-hang.config` compiling. If P1's `tinh-quan-xa.ts` also exports a `KHU_VUC` symbol (it plans to, as the Tuyến entity) and the seed barrel `index.ts` does `export * from './reference-data'` + will add `export * from './tinh-quan-xa'`, a **duplicate `KHU_VUC` export** breaks the barrel build.
- **Evidence:**
  - `src/types/masterdata-types.ts:69-78` second `KhuVuc`/`PhuongXa` interface.
  - `src/mock/masterdata/khu-vuc.mock.ts:24` `KHU_VUC_ROWS`; `phuong-xa.mock.ts:43` `PHUONG_XA_ROWS`; `masterdata/index.ts:130-131` re-exports.
  - `src/config/crud-configs/{khu-vuc,phuong-xa,phi-giao,khach-hang}.config.ts` all bind masterdata KhuVuc/PhuongXa.
  - `src/mock/seed/reference-data.ts:17-27,338,348` the seed copy; `src/mock/seed/index.ts:10` `export * from './reference-data'` (barrel re-export → collision risk with new `tinh-quan-xa` `KHU_VUC`).
- **Suggested fix:** P1 must name which layer it is changing and rename the new Tuyến entity away from `KHU_VUC` to avoid the barrel `export *` collision (e.g. `TUYEN`). P6's C8/C9 must list `masterdata-types.ts`, `khu-vuc.mock.ts`, `phuong-xa.mock.ts` in its modify set. Reconcile the two location models before P1 starts.

---

## Finding 4: "17 files consume the status module" conflates real importers with a substring false-positive; the true type-migration surface differs

- **Severity:** High
- **Location:** Phase 1, Overview + "Modify: Status consumers" list + Risk "17-file status migration"
- **Flaw:** The count is presented as if 17 files import the status module and each needs migration. Actual: 15 files directly import `@/domains/repair/status`; `useDashboard.ts` is listed as a consumer ("comment only") but references **zero** status/bucket symbols; `sua-chua-report-mock.ts` does **not import** the status module at all — its `REPAIR_STATUSES_VN` is a self-contained local array (the grep "17" match is the substring `REPAIR_STATUSES`). So two of the 17 are phantom consumers, while the plan under-scopes the real risk: the `RepairStatus` **type** flows into files that the migration list treats casually. This is the highest-regression phase and the headline number is not grep-true.
- **Failure scenario:** Reviewer trusts "17 consumers, all listed" and the numeric-union type "forces compile errors at every consumer." But `sua-chua-report-mock.ts` won't error (no import) and can silently keep its stale VN labels; `useDashboard.ts` edit is a no-op. Meanwhile the `use-repair-filters.ts` default `tinhTrang: OPEN_STATUSES.slice(0,4)` (line 27) and `dashboard-types.ts` `bucket` field (line 62) are the real breakage points and get one line of attention each.
- **Evidence:**
  - `grep -l` direct importers of status module = 15 files.
  - `src/hooks/useDashboard.ts`: `grep Bucket|bucket|RepairStatus|STATUS` → empty.
  - `src/mock/reports/sua-chua-report-mock.ts:76` `const REPAIR_STATUSES_VN = [...]` local; `grep import ... status` → empty.
  - `src/features/repair-list/hooks/use-repair-filters.ts:9,27,67-69` `OPEN_STATUSES` + `tinhTrang` array serialization is the real migration hotspot.
  - `src/types/dashboard-types.ts:8,62` imports `Bucket`, distribution slice has `bucket: Bucket`.
- **Suggested fix:** Recount from grep, drop the phantom `useDashboard.ts`/`sua-chua-report-mock.ts` "consumer" framing (they are independent edits, not type-driven), and call out the true compile-breakers (`use-repair-filters` default, `dashboard-types.bucket`, `StatusDistributionChart entry.bucket`).

---

## Finding 5: `SEED_FINANCIALS` "zero consumers" is true but irrelevant — deleting `financials.ts` does not connect `chung-tu.ts` to the finance pages

- **Severity:** High
- **Location:** Phase 1, Architecture "`chung-tu.ts` (replaces `financials.ts` — grep shows zero consumers of `SEED_FINANCIALS` outside seed)" + Phase 6 F1 ChungTu
- **Flaw:** The plan's grep claim is correct (`SEED_FINANCIALS`/`SeedFinancialTransaction` have no external consumers), and it uses that to justify deleting `financials.ts` and adding `chung-tu.ts`. But it implies the finance pages will then use `chung-tu.ts`. They won't: `ThuChiPage`/`CongNoPage`/`HoaDonPage` render from `src/mock/finance-mock.ts`, which builds `ThuChi`/`CongNo`/`HoaDon` from `masterdata` rows and `finance-types`, with no link to `financials.ts` OR the new `chung-tu.ts`. So P1 deletes dead code and adds new dead code, and P6's "12-type ChungTu" must rewrite `finance-mock.ts` + `finance-types.ts` from scratch — heavy work hidden behind "config rewrite."
- **Failure scenario:** P6 F1 developer expects to bind the page to P1's `chung-tu.ts` (12 `LOAI_THU_CHI`, PTT/PCC codes, settled/unsettled invariants) and finds the page reads `finance-mock.ts`, which has none of it. To deliver the 15-column reference table they re-author `finance-mock.ts` + `ThuChi` type; the `chung-tu.ts` P1 built and tested goes unused, or must be re-plumbed. Same for Công nợ (`cong-no.ts` vs `finance-mock` CongNo) and Hóa đơn.
- **Evidence:**
  - `src/mock/seed/financials.ts:10,49` only exports `SeedFinancialTransaction` + `SEED_FINANCIALS`; grep for either outside seed → empty.
  - `src/mock/finance-mock.ts:8-12,246` builds ThuChi/CongNo/HoaDon from `masterdata` + `finance-types`; no `financials`/`chung-tu` import.
  - Phase 6 lists `src/mock/finance-mock.ts` under Modify (good) but the P1→P6 dependency table (plan.md) says "Relational seed regeneration … Consumers: all," implying pages consume seed — they don't.
- **Suggested fix:** Either P1 builds `chung-tu.ts`/`cong-no.ts` as `finance-mock.ts` replacements and rewires the finance pages (scope into P1), or P1 skips them and P6 owns the finance data model entirely (remove them from P1, they are premature). Do not create tested-but-unwired seed modules.

---

## Finding 6: `Kỳ` entity shape is defined in P1 but the `kyId` foreign keys consumers rely on are never guaranteed on the entities that carry them

- **Severity:** High
- **Location:** Phase 1 "R2 Kỳ entity" (`interface Ky {id,ten,thang,nam}`) + Phase 5 W2/W4 (Kỳ column, Từ Kỳ/Đến Kỳ) + Phase 6 H4/H8/H9/H10 (Kỳ select, payroll/chấm-công by Kỳ)
- **Flaw:** P1 specifies the `Ky` *lookup* shape and a `KY_DEFAULT`. But P5's inventory period math ("Tồn đầu kỳ/trong kỳ/cuối kỳ computed deterministically from seed transactions per Kỳ") and P6's payroll/chấm-công-by-Kỳ require every relevant transaction/record to carry a resolvable `kyId`, AND the inventory data to be derivable per period. P1 only puts `kyId` on `cham-cong.ts` records. Inventory transactions (there is no inventory transaction seed today — Finding 1: `MOCK_TICKETS`/masterdata have no warehouse ledger) have no `kyId`. P5's "period math from seed transactions" assumes a seeded inventory ledger that does not exist and P1 does not create.
- **Failure scenario:** P5 builds `fetchInventory(kind, params)` returning `{tonDauKy, nhapTrongKy, xuatTrongKy, tonCuoiKy}` per Kỳ and finds no seeded stock movements to derive them from — there is no receiving/issue/transfer transaction store. Either P5 invents an entire inventory-ledger seed (unscoped; P1 "owns seed") or fakes the period math (violates the "don't fudge in the view" risk note). The Kỳ range end (7/2026) also mismatches the fixed ticket clock (2024-07-01, per P1 Unresolved #5), so any Kỳ-aligned derivation over ticket dates yields empty periods.
- **Evidence:**
  - Phase 1 R2 defines Kỳ as a lookup only; `kyId` FK added only to `cham-cong.ts` (step 16) — not to any inventory/ticket entity.
  - No inventory transaction seed exists: `src/domains/warehouse/` does not exist (P5 creates it); `src/mock/seed/*` has no receiving/issue ledger (only `financials.ts`, `repair-tickets`, `customers`, `products`, `staff`, `reference-data`, `branches`).
  - Phase 5 Architecture: "Period math … computed deterministically from seed transactions per Kỳ"; Risk: "if P1 Kỳ seed is thin, extend the seed (P1 file)."
  - Phase 1 Unresolved #5: ticket clock fixed 2024-07-01 vs Kỳ end 7/2026.
- **Suggested fix:** P1 must specify and seed the inventory-transaction ledger (with `kyId` + dates spanning the Kỳ range) that P5's period math derives from, or P5 must own that seed and the plan must move it out of P1. Reconcile the ticket clock vs Kỳ range so per-period aggregation is non-empty.

---

## Finding 7: Cross-phase primitive contracts (P2 → P3–P7) are named but signatures/props are not pinned; P5's 6 divergent grids stress the line-item template beyond its stated contract

- **Severity:** High
- **Location:** plan.md "Cross-cutting primitive ownership" table + Phase 2 Architecture (LineItemEditor, ServerAutocomplete) + Phase 5 "S3b Trả Hàng two-stage" + "Editor template generality vs 6 divergent grids"
- **Flaw:** The ownership table lists owners/consumers but pins no interface. P2 describes `LineItemEditor<TLine>` with "header-fields slot + line table config + totals + action footer." P5 then demands 6 editors with materially different shapes: Trả Hàng is explicitly two-stage (Kỳ + source pick-table THEN return grid), Receiving has a serial-textarea-when-IsSerial line sub-flow, Chuyển Kho same-branch adds a per-line `Ngăn chứa` column and cross-branch a `Số lượng chuyển` column. P5 itself flags the two-stage flow as "the outlier — allow it a bespoke wrapper." That means the template does not actually cover the consumers, and P2 cannot know it delivered enough because the consumer contracts aren't written down when P2 is built. Same for `ServerAutocomplete` `[+]` quick-create: P2 says "optional quickCreate: {title, renderForm, onCreate}" but P3–P6 need a **table-variant** autocomplete (dropdown with columns Họ tên/ĐT1/ĐT2/Địa chỉ per P3 R9) that P2's popover+cmdk single-column design does not describe.
- **Failure scenario:** P2 ships a generic LineItemEditor validated only by its own thin test ("Thêm dòng appends a row, totals recompute"). P5 starts, discovers Trả Hàng and the 6th grid don't fit, forks a bespoke editor (violating the "extend in place, never fork" rule) or reworks the P2 template mid-P5 — a shared-file change after P2 is "done," breaking the phase-isolation the plan promises. P3's table-variant autocomplete forces a P2 rewrite in P3.
- **Evidence:**
  - plan.md:47-64 ownership table — no signatures.
  - Phase 2 Architecture line-item editor: single generic contract; Phase 2 test (TDD 2.6) only asserts buttons + add/remove/totals.
  - Phase 5 S3b (`tra-hang-editor` two-stage) + Risk "the Trả Hàng two-stage flow is the outlier — allow it a bespoke wrapper over the template rather than bending the template" — self-admitted contract gap.
  - Phase 3 R9 "Tên/ĐT khách hàng table-autocomplete (dropdown columns Họ tên / Điện thoại 1 / Điện thoại 2 / Địa chỉ)" vs Phase 2 ServerAutocomplete single `{id,label}` popover.
- **Suggested fix:** P2 must publish concrete TypeScript prop interfaces (`LineItemEditorProps<TLine>`, `ServerAutocompleteProps`, including the multi-column/table variant and a two-stage/staging hook) derived from an up-front survey of ALL P3–P6 consumers, and P2's tests must exercise at least one representative of each divergent shape. Otherwise the "build once" claim is unfalsifiable until a later phase breaks it.

---

## Finding 8: P2 "no nav-config change (D1)" contradicts P5/P6/P7 all adding sidebar nav children

- **Severity:** Medium
- **Location:** Phase 2 Architecture "No `nav-config.tsx` change — pages hang off header widgets" + Phase 5 (add `Danh sách trả LK xác` child) + Phase 7 (report nav children rework) + Phase 6 (nav labels)
- **Flaw:** P2 states D1 (flat IA) means new pages are reached from header widgets, not the sidebar, and explicitly does not touch `nav-config.tsx`. But P5 adds a nav child under Quản Lý Kho (`nav-config.tsx` in its modify list), P6 modifies nav labels, and P7 reworks report nav children. So "flat IA / no sidebar additions" is not actually the rule — it's the rule only for P2's own pages. The plan presents D1 as a global constraint but three later phases add/rename sidebar entries, which is fine per D1 (flat sidebar, add missing routes) — but P2's framing ("no sidebar top-level additions (D1)") is inconsistent with the plan's own acceptance criterion "All 12 missing pages … reachable from flat IA nav." A missing page reachable only from a header bell is arguably not "in the nav."
- **Failure scenario:** Reviewer/QA checks acceptance "12 missing pages reachable from flat IA nav" and finds `/thong-bao`, `/tin-tuc`, `/tai-khoan` are NOT in the sidebar (only header widgets), so they fail the literal criterion; or a later dev "fixes" it by adding sidebar entries P2 said not to add, and the two phases disagree on where these pages live.
- **Evidence:**
  - Phase 2 Architecture: "No `nav-config.tsx` change"; Non-functional "No sidebar top-level additions (D1)".
  - `src/config/nav-config.tsx` exists (6168 bytes, ~73 label/children/to entries).
  - Phase 5 Related Code Files: `src/config/nav-config.tsx (add 'Danh sách trả LK xác' child; rename DSCapLK label)`.
  - Phase 7 R7: "remove … from nav-config … Update report nav children."
  - plan.md acceptance: "All 12 missing pages exist as working pages … reachable from flat IA nav."
- **Suggested fix:** State the rule precisely: header-widget pages (thong-bao/tin-tuc/tai-khoan) are intentionally NOT sidebar items; the "reachable from flat IA nav" acceptance criterion should be reworded to "reachable from flat IA (sidebar OR header widgets)" so QA doesn't flag P2's pages as missing.

---

## Finding 9: P6 CU1 references reference-volume behavior ("Trang 1 / 4750") the mock seed cannot produce

- **Severity:** Medium
- **Location:** Phase 6 "CU1 Khách Hàng" (default sort newest-first, server-style pagination) + plan.md scale note; also Phase 5 "Trang X / Y" pagination header
- **Flaw:** The reference pages paginate over production volumes (customer list "Trang 1 / N" with thousands of rows). Local mock volumes are tiny: masterdata `KHACH_HANG_ROWS` = 50 rows, `SEED_CUSTOMERS` = 150. The 500-ticket seed is the largest dataset. Any parity behavior that depends on realistic volume (pagination reaching page N, "rows-per-page 20/30/50/100/150/200/300" being meaningful, KPI aggregates looking non-trivial, the 202-checkbox permission matrix feeling populated) is an unstated data-volume assumption. Not fatal, but "reference parity" tests that assert on page counts or aggregate magnitudes will be brittle against 50-row mocks.
- **Failure scenario:** A parity spec asserts pagination header or rows-per-page 300 option is exercised; with 50 customers there is one page and the 300-option is a no-op, so either the test is vacuous (phantom test) or fails against the reference expectation. Payroll/chấm-công/inventory KPI numbers derived from thin seed look empty, undermining the "working mock" acceptance.
- **Evidence:**
  - `src/mock/masterdata/khach-hang.mock.ts:1,60` "50 seeded rows", `length: 50`.
  - `src/mock/seed/customers.ts:122` `length: 150`.
  - Phase 6 CU1: "rows-per-page options 20/30/50/100/150/200/300", "Default sort newest-first"; F-pages "server-style pagination header Trang X / Y".
- **Suggested fix:** Either raise mock volumes where a page's parity depends on it (state target row counts per entity in P1), or explicitly scope parity tests to structure (column order, controls present) and NOT to volume-dependent behavior — and say so, so later phases don't write brittle count assertions.

---

## Finding 10: Seed/status header comments and the plan disagree on phase numbering — a latent "Phase 8" the 7-phase plan doesn't cover

- **Severity:** Medium
- **Location:** Phase 1 (rewrites `status.ts` + touches `src/mock/seed/index.ts`) vs existing in-code contracts
- **Flaw:** The existing `status.ts` header says "Phases 3/4/8 import from here" and `src/mock/seed/index.ts` says "Phase 8 grows volume (500 tickets…)". The current plan is 7 phases; "Phase 8" is a stale artifact from an earlier plan generation. P1 rewrites both files. If P1 preserves these comments (or the mental model behind them), there is a phantom "Phase 8" (seed volume growth to 500) that the 7-phase plan folds into P1 — but P1's characterization test already asserts `SEED_REPAIR_TICKETS.length === 500`, meaning the seed is ALREADY at 500 and the "Phase 8 grows volume" contract is already satisfied/obsolete. This is a symptom of the deeper Finding 1 confusion about which layer is authoritative.
- **Failure scenario:** Developer reads the in-file "Phase 8" contract, assumes seed volume work is deferred, and under-delivers P1's seed; or the stale comment survives into the rewrite and future readers chase a nonexistent phase. Low direct harm, high signal that the seed-layer story is muddled.
- **Evidence:**
  - `src/domains/repair/status.ts:6` "Phases 3/4/8 import from here."
  - `src/mock/seed/index.ts:2-3` "Phase 8 grows volume (500 tickets, relational IDs) against this SAME contract."
  - Current plan has exactly 7 phases (plan.md phase table).
  - `src/mock/seed/customers.ts:122` already `length: 150`, repair seed already targets 500 (P1 characterization asserts it) — "Phase 8 grows volume" already done.
- **Suggested fix:** P1 should scrub stale phase references from `status.ts`/`seed/index.ts` per the "no plan IDs / phase numbers in code" rule, and confirm the seed-volume contract is settled (it already is), removing the "Phase 8" ghost. Fold this into resolving Finding 1's layer decision.

---

## Cross-cutting assessment

The plan is well-structured, cites specs precisely, and the status-module rewrite (Findings 4 aside) is largely sound and grep-consistent (15 direct importers, bucket symbols confined, `RepairStatus` numeric-union migration is real). The TDD discipline is genuine.

The **fatal systemic flaw** (Findings 1, 2, 3, 5, 6) is that the plan is built on a false model of the data layer: it treats `src/mock/seed/*` as the app's data source and pours P1 effort into regenerating + testing it, when the rendered app actually runs on three *other*, disconnected layers (`domains/repair/mock-data.ts` `MOCK_TICKETS`, `mock/masterdata/*_ROWS`, `mock/finance-mock.ts`). Every "P1 seeds X, P5/P6 consumes X" dependency in the ownership table is unverified against who actually reads the data. Until P1 states and enforces a single authoritative data layer, later phases will each silently absorb an unscoped data-rewrite, and P1's seed tests will be green-but-meaningless.

## Unresolved questions for the planner

1. Which data layer is canonical — `src/mock/seed/*`, `domains/repair/mock-data.ts` + `mock/masterdata/*`, or a consolidation? (Blocks Findings 1/2/3/5/6.)
2. Does P1 own the inventory-transaction ledger seed that P5's Kỳ period math derives from, or does P5? It exists in neither today.
3. What is the pinned TypeScript interface for `LineItemEditor`, `ServerAutocomplete` (incl. table-variant + two-stage), and the Kỳ picker, verified against all P3–P6 consumers before P2 builds them?
4. Is "reachable from flat IA nav" satisfied by header-widget-only pages (thong-bao/tin-tuc/tai-khoan)?

Status: DONE | Summary: Plan is spec-accurate but built on a false data-layer model — P1 regenerates and tests dead seed while the live pages read three disconnected mock layers, making most P1→P5/P6 "consumes" dependencies unwired; 10 findings (5 Critical) with file:line evidence.
