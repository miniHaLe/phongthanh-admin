# Red-Team Review — Failure Mode Analyst / Flow Tracer

**Plan:** `plans/260703-1908-reference-ui-parity-tdd/` (D5-reconciled)
**Reviewer lens:** Murphy's Law failure modes + Flow Tracer (verify "edit layer L → page P changes" against the real entry→target path).
**Verdict:** BLOCKED. The D5 reconciliation rests on a factual claim about `dashboard-mock.ts` that the source contradicts, and it missed at least two live render layers plus a guaranteed seed-number collision. Multiple phases will go green while shipping stale/inconsistent data — the exact Finding-1 class the reconciliation claims to close.

---

## Finding 1: D5's central premise about `dashboard-mock.ts` is false — it DOES import `status.ts`

- **Severity:** Critical
- **Location:** plan.md §"Data-Layer Reconciliation (D5)" line 75; Phase 1 lines 12, 32, 48, 58, 61, 78, 90, 116, 145 (repeated ~8×)
- **Flaw:** The plan classifies `dashboard-mock.ts` as an independent 4th layer with its **"own snake `RepairStatus` + `STATUS_BUCKET` (doesn't import `status.ts`)"** and repeatedly instructs P1 to "migrate off snake `RepairStatus`… delete its local `RepairStatus`/`STATUS_BUCKET`/`REPAIR_STATUSES`; import `status.ts`." **Traced the actual import path: it already imports them from the shared module.** `dashboard-mock.ts:10-17` imports `REPAIR_STATUSES, STATUS_BUCKET, STATUS_LABEL, BUCKET_HEX, bucketOf, type RepairStatus` from `@/domains/repair/status`. There is no local vocab to delete. `dashboard-mock.ts` is **not a separate layer** for status purposes — it is one of the `status.ts` consumers (making the "15 importers, dashboard is separate" count in Finding 3 also wrong; dashboard IS an importer).
- **Failure scenario:** P1 is written to a false model. The `qua_han` "deletion" (Findings 15) is planned as a local dashboard change, but `qua_han` lives in the **shared** `status.ts:30` and its bucket mapping `status.ts:83`. Deleting it ripples through every `status.ts` consumer (StatusBadge, StatusLegend, repair table columns, KT board, KpiCharts) — not the isolated dashboard edit the plan describes. The P1 author, told dashboard "carries its own vocab, migrated in its own step," may edit a local copy that doesn't exist, leave the shared `qua_han` in place, and ship a half-migration where the grep gate (`grep qua_han → nothing`) fails at the end with no plan for the blast radius.
- **Evidence:** `src/mock/dashboard-mock.ts:10-17` (`} from '@/domains/repair/status'`); `src/domains/repair/status.ts:14-31` (`qua_han` in shared `REPAIR_STATUSES`), `:63`, `:83`.
- **Suggested fix:** Correct the D5 table and all Phase-1 prose: `dashboard-mock.ts` is a `status.ts` **consumer**, not a self-vocab layer. Re-scope the `qua_han` removal as a **shared `status.ts` change** (16→15) with an explicit consumer list, and treat dashboard's `overdueCount` re-derivation as a downstream fix. Re-audit Finding 3's "15 vs 17" count — dashboard IS an importer.

---

## Finding 2: The "fixed REF clock" the SLA-overdue rule derives against does not exist in the live layer

- **Severity:** Critical
- **Location:** Phase 1 line 116 ("`receivedDate` older than the SLA window (deterministic constant, e.g. 7 days before the **fixed REF clock**)"); plan.md line 87; Unresolved #5 (line 159)
- **Flaw:** The Finding-15 fix requires a stable "now" to compare `receivedDate` against. **Traced the clock: the live layer uses a moving wall clock, not a fixed reference.** `dashboard-mock.ts:163` seeds dates via `rng.isoDateWithin(60)`, and `isoDateWithin`'s ref defaults to `Date.now()` (`seeded-random.ts:59`). The existing `todayReceipts` logic at `dashboard-mock.ts:259` also uses `Date.now() - 86_400_000`. The only **fixed** `2024-07-01` clock (`BASE_TIMESTAMP = 1_719_792_000_000`) lives exclusively in the **dead seed files P1 deletes** — `customers.ts:119`, `financials.ts:46`, `staff.ts:72`, `repair-tickets.ts:94`. After P1 deletes those, no fixed REF clock exists anywhere in `src/`.
- **Failure scenario:** Because dates are generated relative to `Date.now()` at module-load and compared to `Date.now()` at call-time, the dataset **regenerates every process start** and drifts with the real calendar. An SLA rule "`receivedDate` older than 7 days before a fixed clock" is uncomputable — the author either (a) hardcodes a `2024-07-01` constant that has no relationship to the `Date.now()`-seeded `receivedDate` values (→ likely ALL 50 tickets "overdue," since real-now ≫ 2024), or (b) uses `Date.now()`, making the spec test `overdueCount` **nondeterministic** and time-dependent — a flaky test that passes in CI today and breaks as wall-clock advances. Either way the dashboard `overdueCount` is silently wrong.
- **Evidence:** `src/lib/seeded-random.ts:59` (`ref: number = Date.now()`); `src/mock/dashboard-mock.ts:163`, `:259`; fixed clock only in deleted files: `src/mock/seed/customers.ts:119`, `financials.ts:46`, `staff.ts:72`, `repair-tickets.ts:94`.
- **Suggested fix:** Before writing the SLA rule, decide the clock model. Either (a) pin a module-level `REF_NOW` constant in `dashboard-mock.ts` and pass it explicitly into `isoDateWithin(60, REF_NOW)` so both generation and the overdue comparison share one frozen instant, or (b) derive overdue from a per-ticket seeded `slaDueDate` field independent of any wall clock. Resolve Unresolved #5 (fixed clock vs Kỳ range to 7/2026) as a **P1 prerequisite**, not a deferred flag — the overdue derivation cannot be specified without it.

---

## Finding 3: The new lookup modules' seed block (3001–3008) collides head-on with the live inventory layer

- **Severity:** High
- **Location:** Phase 1 line 128 ("assign the **3001–3008** block (ky=3001…phi-giao=3008)… Finding 13 — no reuse")
- **Flaw:** P1's own anti-collision fix (Finding 13) assigns seeds **3001–3008** to the new Kỳ/Tỉnh-Quận-Xã/taxonomy modules. **Traced current seed usage:** `inventory-mock.ts` — the LIVE P5 layer — **already occupies 3001 through 3008** across its 8 generators (`inventory-mock.ts:55,85,142,185,232,279,337,378`). The plan hands the new modules the exact seeds a live layer is using.
- **Failure scenario:** Not a build error (different files), but the fix meant to *prevent* correlated RNG streams *creates* them: the new Kỳ generator (3001) and `TON_KHO_ROWS` (3001) draw identical pseudo-random sequences, so any test asserting cross-layer independence, or any human eyeballing "why do inventory quantities and Kỳ ids move together," hits a silent correlation. Worse, if a later consolidation ever imports both under one module scope, ids derived from the same seed collide. The plan's stated Finding-13 goal ("no reuse of 2001/2002/2003") is undercut by reusing 3001–3008 instead — and 2001/2002/2003 are *also* still duplicated between `finance-mock.ts` and the three `nhan-su/*Page.tsx` files.
- **Evidence:** `src/mock/inventory-mock.ts:55` (`new SeededRandom(3001)`) through `:378` (3008); `finance-mock.ts:17,82,127` (2001/2002/2003) duplicated in `pages/nhan-su/BangLuongPage.tsx:32`, `ChamCongPage.tsx:28`, `ChamCongTongHopPage.tsx:28`.
- **Suggested fix:** Pick a demonstrably-free block. Current occupied ranges: 42, 99, 1001–1023, 2001–2003, 3001–3008, 8001–8005. Assign the new modules e.g. **4001–4009** and add a one-line "seed registry" comment somewhere central so future phases don't re-collide. Note that Finding 13 is only half-fixed until the 2001–2003 finance/nhan-su duplication is also addressed.

---

## Finding 4: P5's new Kỳ ledger creates two inventory sources that disagree (a fresh Finding-1 disconnect)

- **Severity:** High
- **Location:** Phase 5 lines 54, 64, 95, 124 (build ledger in `src/domains/warehouse/mock-data.ts`, derive opening/closing, "replacing the `rngTK.int` fabrication")
- **Flaw:** P5 builds a NEW ledger in a NEW file (`src/domains/warehouse/mock-data.ts`) and derives `tonDauKy/tonCuoiKy` from it. But **traced what the pages actually read:** the ton-kho views render `TON_KHO_ROWS` from the LIVE `inventory-mock.ts`, where each row **independently fabricates** `ton_dau_ky = rngTK.int(10,200)`, `nhap`, `xuat`, and `ton_cuoi_ky = dauKy + nhap − xuat` (`inventory-mock.ts:57-75`). The plan says the ledger "replaces" the fabrication, but the row-level `TON_KHO_ROWS` fields (gia_tri, per-row quantities) and the sibling arrays `NHAP_KHO_ROWS`/`CAP_LINH_KIEN_ROWS`/`BAN_HANG_ROWS` are **separate, unlinked** generators. Deriving KPI from a ledger while row data still comes from `rngTK.int` produces two authorities for the same warehouse.
- **Failure scenario:** The KPI strip (`Tồn đầu kỳ` from ledger) and the table rows (`ton_dau_ky` from `rngTK.int`) show **different opening balances for the same product×kho×Kỳ**. The Finding-10 ledger test passes (it asserts against the ledger it just built), while the rendered table disagrees with its own KPI header — a new disconnect exactly like Finding 1. The plan does not say whether `TON_KHO_ROWS`' per-row `ton_dau_ky`/`ton_cuoi_ky` are *also* re-derived from the ledger, or left as fabricated rows next to a ledger-derived KPI.
- **Evidence:** `src/mock/inventory-mock.ts:57-75` (per-row independent `rngTK.int` fabrication, `cuoiKy = dauKy + nhap - xuat`); `:102,144,195` (sibling arrays with independent RNG); Phase 5 line 95 ("`tonCuoiKy` = opening + nhập − xuất — derived, replacing the `inventory-mock.ts` `rngTK.int(10,200)` fabrication").
- **Suggested fix:** State explicitly that the ledger is the **single source** for ton-kho: `TON_KHO_ROWS` must be *projected from* the ledger (per product×kho, `ton_dau_ky`/`nhap`/`xuat`/`ton_cuoi_ky` all summed from stamped txns), not left as parallel `rngTK.int` rows. Add a spec test asserting KPI `tonDauKy` **equals** the sum of the rendered rows' `ton_dau_ky` for the same filter — the invariant that would have caught Finding 1.

---

## Finding 5: Missed live layers — `mock/reports/*` and `finance-kpi-mock.ts` feed 9+ rendered pages and are absent from the D5 map

- **Severity:** High
- **Location:** plan.md §D5 table (lines 72-78) enumerates only 5 layers; Phase 7 (reports) inherits the gap
- **Flaw:** D5 claims "**four independent mock layers**" (line 70) / five in the table. **Traced page → layer for the report section:** `src/mock/reports/report-configs.ts` (`REPORT_CONFIGS`) is imported by **7 report pages** (`BaoCaoPage`, `BaoHanhReportPage`, `DoanhThuReportPage`, `KyThuatReportPage`, `SuaChuaReportPage`, `TiepNhanReportPage`, `XuatKhoReportPage`); `reports/kpi-mock.ts` (`fetchKpiReport`) feeds `KpiReportPage.tsx:19`; `reports/report-types.ts` types the whole report component tree; and `finance-kpi-mock.ts` (`fetchFinanceKpi`) feeds `hooks/use-finance-kpi.ts:9`. **None** of these four modules appear in the D5 layer table. P1 does touch one file inside it (`reports/sua-chua-report-mock.ts`, to drop `REPAIR_STATUSES_VN` — which does exist, `sua-chua-report-mock.ts:76`), but the *layer as a whole* (`report-configs`, `kpi-mock`, `finance-kpi-mock`) is unclassified.
- **Failure scenario:** P7 ("Reports become canonical, invented reports retired") edits report configs/KPI without a D5 entry telling it these are the live render layer. It may correct a spec in one place while the rendered report reads from `report-configs.ts` / `kpi-mock.ts` unchanged — spec tests green, page stale. This is the precise Finding-1 failure the plan claims D5 eliminated, reproduced in the reports section because the layer was never mapped. Additionally, `sua-chua-report-mock.ts` uses its own free-text `REPAIR_STATUSES_VN` strings (`:76,128,170`) that P1 rewires to `STATUS_LABEL` — but the sibling `kpi-mock`/`report-configs` status handling is unaudited.
- **Evidence:** `src/pages/reports/BaoCaoPage.tsx:8` + 6 sibling report pages importing `@/mock/reports/report-configs`; `src/pages/reports/kpi/KpiReportPage.tsx:19` (`fetchKpiReport` from `@/mock/reports/kpi-mock`); `src/hooks/use-finance-kpi.ts:9` (`fetchFinanceKpi` from `@/mock/finance-kpi-mock`); `src/mock/reports/sua-chua-report-mock.ts:76`.
- **Suggested fix:** Add a **6th (reports) and 7th (finance-kpi) row** to the D5 table: `src/mock/reports/*` → 8 report/KPI pages, owned by P7; `src/mock/finance-kpi-mock.ts` → finance KPI, owned by P6. Give P7 an explicit "edit the layer the report pages read" instruction and a grep gate, same as P1 got for `MOCK_TICKETS`.

---

## Finding 6: P6 "build the customer fixture rows" conflates two live stores with the dead one — risk of duplicate/oversized customer data

- **Severity:** Medium
- **Location:** Phase 6 lines 74, 108 ("build the customer fixture rows here (P1 deleted the dead `SEED_CUSTOMERS`)… the customer *rows* are built into the live customer/masterdata layer")
- **Flaw:** P6 frames customers as needing to be *built* because "P1 deleted the dead `SEED_CUSTOMERS`." **Traced the customer render paths and found TWO live stores already exist, neither of which is `SEED_CUSTOMERS`:** (1) the catalog KhachHangPage renders `khachHangApi` backed by `KHACH_HANG_ROWS` (50 seeded rows, seed 1001) via `khach-hang.config.ts:5,14`; (2) repair-create's CustomerSection reads `searchCustomers` from `domains/repair/mock-data.ts:567`, which derives customers from `MOCK_TICKETS` (`:292` `randomCustomer`), NOT from any seed. `SEED_CUSTOMERS` (`customers.ts:121`) has **zero** external importers — confirmed. So the live customer rows P6 needs already exist; nothing was lost by deleting `SEED_CUSTOMERS`.
- **Failure scenario:** Taking the plan literally ("build customer fixture rows"), a P6 author creates a *new* customer array in the "live customer/masterdata layer," not realizing `KHACH_HANG_ROWS` already is that layer — producing either a duplicate customer store the page ignores (dead code, Finding-1 again) or a conflicting rewrite of the 50-row seed. Separately, the plan never notes that repair-create customers and catalog customers are **two disconnected stores** — a customer created in KhachHangPage will never appear in repair-create's `searchCustomers`, and vice-versa. If parity expects them linked, that's an unstated gap.
- **Evidence:** `src/config/crud-configs/khach-hang.config.ts:5,14` (`khachHangApi`); `src/mock/masterdata/khach-hang.mock.ts:59,85` (`KHACH_HANG_ROWS`, `khachHangApi`, seed 1001); `src/features/repair-create/sections/CustomerSection.tsx:13,36` (`searchCustomers`); `src/domains/repair/mock-data.ts:567` (derives from tickets); `src/mock/seed/customers.ts:121` (`SEED_CUSTOMERS`, zero importers).
- **Suggested fix:** Reword P6 to "**edit the existing `KHACH_HANG_ROWS`** in `masterdata/khach-hang.mock.ts` to the 15-col reference schema" — not "build fixture rows." Explicitly note the two-store split (catalog `KHACH_HANG_ROWS` vs repair-create ticket-derived customers) and decide whether parity requires reconciling them; if not, document the non-issue so P6 doesn't invent a third store.

---

## Finding 7: P6 edits `finance-mock.ts`, which computes overdue receivables against the wall clock — same silent-drift trap as Finding 2

- **Severity:** Medium
- **Location:** Phase 6 lines 17, 74 (edits live `finance-mock.ts` in place); relates to per-ticket Công nợ, VAT invoices
- **Flaw:** P6 corrects the finance layer in place. **Traced the finance date logic:** `finance-mock.ts` dates all use `isoDateWithin` (moving `Date.now()`, `:56,73,93,118,171,191`) and the Công nợ overdue flag compares `new Date(hanTT) < new Date()` (`:100`) — real wall clock. Like the dashboard (Finding 2), any spec test asserting a specific overdue/`quá hạn` receivable count is time-dependent and will drift as the calendar advances; the data also regenerates each process start.
- **Failure scenario:** P6's Công nợ parity tests ("N receivables overdue," "aging buckets") pass in CI today and silently rot — a test written 2026-07 may report different overdue counts in 2027 with no code change, or fail outright, because `hanTT < new Date()` shifts. Reviewer can't tell a real regression from calendar drift.
- **Evidence:** `src/mock/finance-mock.ts:56,73,93,118,171,191` (`isoDateWithin`), `:94-100` (`hanTT`, `new Date(hanTT) < new Date()`).
- **Suggested fix:** When P6 rewrites the finance layer, freeze a shared `REF_NOW` (same constant chosen in Finding 2) and route all `isoDateWithin` + overdue comparisons through it, so finance spec tests are deterministic. Treat the wall-clock dependency as a P6 acceptance item, not incidental.

---

## Finding 8: In-memory mock writes lost on reload — documented, but the derived-KPI recompute path is not covered

- **Severity:** Medium
- **Location:** plan.md line 88 (Finding 6, "document, don't claim persistence"); Phase 6 line 130; Phase 5 durability note
- **Flaw:** The plan correctly documents that creates live in module memory and vanish on reload. But it stops at "tests cover create→refetch within one session." **Traced the durability blast radius against the new derived layers:** P5's Finding-10 ledger *derives* opening/closing from txn rows. If a stock-out mutation `unshift`es a new txn into module memory (like `MOCK_TICKETS.unshift`, the Finding-6 pattern), then within the same session the derived `tonDauKy`/`tonCuoiKy` for *later* Kỳ change — but any KPI or row already cached by react-query (`staleTime`) won't recompute, and on reload the whole ledger resets to seed. The plan's "create→refetch within one session" test doesn't assert that a mutation correctly propagates through the *derivation* (opening of Kỳ N+1 = closing of Kỳ N after an in-period write).
- **Failure scenario:** A demo user records a stock-out, the row list updates, but the KPI strip (cached, or recomputed from a stale ledger snapshot) shows the pre-mutation opening balance — an inconsistency between what the user just did and what the totals say, with no error. On reload everything silently reverts, contradicting the visible row they added moments ago.
- **Evidence:** Finding-6 write pattern documented at plan.md:88; derived-ledger design at Phase 5 lines 54,95; react-query `staleTime` caching already in use, e.g. `CustomerSection.tsx:38` (`staleTime: 30_000`).
- **Suggested fix:** For P5, add a durability/consistency test: after an in-period ledger mutation, invalidate the KPI query and assert closing(Kỳ N) === opening(Kỳ N+1). Document explicitly that ledger writes are non-durable AND non-transactional across the KPI/row split, so a reviewer knows the recompute boundary. Keep the "no persistence claim" but extend it to "derived aggregates may momentarily desync from cached views."

---

## Cross-phase ordering note (folded, not a separate finding)

The originally-suspected P1→P6 customer gap (P1 deletes customer data P3/P4/P5 depend on) does **not** exist as feared: P3/P4 repair-create customers come from `MOCK_TICKETS`-derived `searchCustomers`, and catalog customers from `KHACH_HANG_ROWS` — both survive P1's `SEED_CUSTOMERS` deletion (Finding 6 evidence). The real defect is the *mislabeling* in Finding 6, not a data-availability gap. No blocking ordering hazard found here.

---

Status: BLOCKED
Summary: D5's core premise is factually wrong — `dashboard-mock.ts` imports the shared `status.ts` (not its own vocab), so the `qua_han` removal ripples through shared status code; the SLA-overdue rule targets a "fixed REF clock" that exists only in deleted files (live layer uses moving `Date.now()`); and the plan missed the `mock/reports/*` + `finance-kpi-mock` live layers feeding 9+ pages. Plus a guaranteed 3001–3008 seed collision with the live inventory layer.
Concerns: Findings 1, 2, 5 must be resolved before P1 starts — they change what P1 does and what "green" means. Finding 3 (seed collision) is a 30-second fix but currently ships correlated RNG. Findings 4, 7 are deterministic-test-vs-wall-clock traps that will produce flaky/rotting spec tests across P5/P6.
