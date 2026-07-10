# Red-Team Plan Review — Failure Mode Analyst

Plan: `plans/260703-1908-reference-ui-parity-tdd/` (7 phases)
Reviewer posture: hostile / Murphy's Law. Verification role: Flow Tracer.
Scope: data loss, race/ordering, migration + rollback holes, trust of behavioral claims — all backed by `src/` evidence.

---

## Finding 1: Two disconnected ticket data systems — P1 seed regeneration never reaches the page the mutations run against

- **Severity:** Critical
- **Location:** Phase 1 §"Related Code Files" / TDD Plan 1.1; Phase 3 §Architecture "Mutable mock store"; Phase 4 §Architecture
- **Flaw:** The plan treats `src/mock/seed/repair-tickets.ts` (`SEED_REPAIR_TICKETS`) as *the* ticket source it regenerates in P1, and treats `MOCK_TICKETS` as the thing P3/P4 mutate. These are two unrelated arrays. `SEED_REPAIR_TICKETS` has **zero importers outside its own file**; `fetchRepairList` / `fetchRepairById` / `createRepairTicket` read the *other* array, `MOCK_TICKETS`, which is built from its own inline seed (own `CUSTOMER_NAMES`, own `STATUS_WEIGHTS`, own `kh-XXXX` ids, `SeededRandom(42)`), fully disconnected from `src/mock/seed/*`.
- **Failure scenario:** P1 "regenerates the relational seed to reference models," edits `SEED_REPAIR_TICKETS`, and its characterization/spec tests (`SEED_REPAIR_TICKETS.length === 500`, `id === 'sc-seed-00001'`, "all 15 legacy status ids appear in `SEED_REPAIR_TICKETS`") go green — while the actual repair-list page still renders the untouched 250-ticket `MOCK_TICKETS` with snake_case statuses. P3 then wires mutations + statusCounts against `MOCK_TICKETS`. Result: green test suite, but the app either shows old data or requires an unplanned, large rewire of `mock-data.ts` onto the seed system (customers, staff, products all keyed differently: `kh-0001` vs `kh-seed-0001`, `PSC-200001` vs `sc-seed-00001`). This rewire is nowhere in the plan and is a phase-sized task by itself.
- **Evidence:**
  - `src/mock/seed/repair-tickets.ts:104` `Array.from({ length: 500 }` with ids `sc-seed-${…}` — `grep -rln SEED_REPAIR_TICKETS src` returns only `repair-tickets.ts` itself.
  - `src/domains/repair/mock-data.ts:361` `{ length: 250 }`; `MOCK_TICKETS` consumers = only `mock-data.ts`; customers minted inline as `kh-${idx}` (`randomCustomer`), no `kh-seed` linkage (`grep kh-seed src/domains/repair/mock-data.ts` → empty).
  - P1 TDD 1.1 asserts `SEED_REPAIR_TICKETS.length === 500` and `id === 'sc-seed-00001'` (phase-01 line ~75) — passes without touching the page's data.
- **Suggested fix:** Add an explicit P1 decision + step: EITHER (a) point `fetchRepairList`/`fetchRepairById`/`createRepairTicket` at `SEED_REPAIR_TICKETS` and delete the inline `MOCK_TICKETS` seed (with an id/reference remap for customers/staff/products), OR (b) drop the seed system and regenerate inside `mock-data.ts`. Until one source of truth exists, every "seed regenerated" success criterion is a phantom-green.

---

## Finding 2: In-memory mutations survive `resetDemo()`; created vouchers/tickets silently vanish on any reload — data-loss claims are inverted

- **Severity:** High
- **Location:** Phase 1 Risk Assessment ("`resetDemo()` available"); Phase 3/4/5/6 (all "mutates the in-memory mock store (D4)"); Phase 5 non-functional ("created editors … via mock create/update mutation")
- **Flaw:** The plan leans on `resetDemo()` as the recovery path for bad persisted state and implies mock-store writes are session-durable. Both assumptions are backwards. `resetDemo()` only removes **localStorage** keys then hard-reloads. The mock arrays (`MOCK_TICKETS`, `THU_CHI_ROWS`, every `makeMockApi` rows array) are module-level constants rebuilt from seed on every reload. So: (a) `resetDemo()` does **not** clear a mutated in-memory store to a "clean" curated state — it rebuilds the *original* seed and wipes every user mutation, and (b) any plain F5 / route-driven full reload also destroys all created vouchers, dispatched techs, settled debts, uploaded images.
- **Failure scenario:** A reviewer creates a Nhập Kho voucher (P5) or a repair ticket (P4 `Lưu & Đóng` → navigate to list), then reloads to check the list — the voucher is gone. Worse, `resetDemo()` is offered in P1 as the *fix* for stale saved-views, but it also silently discards everything the user built in-session, which no phase acknowledges as data loss. The existing code already flags this exactly once (`createRepairTicket` comment "in-memory only, lost on reload") — the plan generalizes voucher creation across 6 editors without carrying that caveat forward.
- **Evidence:**
  - `src/demo/demo-reset.ts` — `resetDemo` loops `ALL_STORE_KEYS`, `localStorage.removeItem`, `window.location.reload()`; docstring: "seed arrays are module-level constants (not stored in localStorage) so they regenerate identically on reload."
  - `src/domains/repair/mock-data.ts` `createRepairTicket`: `MOCK_TICKETS.unshift(ticket)` with comment "Push to mock array for immediate detail view (in-memory only, lost on reload)."
  - `src/mock/masterdata/index.ts:77` `makeMockApi` — "rows array is mutated in place so all operations are consistent per session" (per-session only).
- **Suggested fix:** State the durability model once at plan level: mock writes are session-only, lost on reload, and `resetDemo()` is a *wipe*, not a *restore*. If created records must survive reload for demo credibility, add a persistence step (e.g. persist mutated arrays under a `STORE_KEYS` key + rehydrate) — otherwise every "creates a voucher/ticket" success criterion should read "…for the current session only."

---

## Finding 3: Status snake→numeric swap breaks saved views restored from `pt-filter-state`; the specified defensive parse doesn't cover that path

- **Severity:** High
- **Location:** Phase 1 §Risk Assessment ("URL filter params change shape") + Unresolved; Phase 3 R9/R10
- **Flaw:** P1's mitigation is "parse defensively (drop non-numeric values → fall back to `OPEN_STATUS_IDS`)" and names URL params + `pt-saved-views` / `pt-filter-state`. But repair-list filters are URL-based (`useRepairFilters`), while saved views are a **separate** persistence path: `SavedView.filters: Record<string, unknown>` stored under `STORE_KEYS.filterState` (`pt-filter-state`) and applied by restoring a whole filter object, *not* through `fromParams`. A saved view captured today holds `tinhTrang: ['cho_tiep_nhan', …]`. After the swap, `fetchRepairList` does `new Set(params.tinhTrang)` then `set.has(t.tinhTrang)` where tickets now carry numeric ids — every restored slug silently matches zero rows. The plan's "defensive parse" is specified only for the URL `fromParams` seam; nothing coerces or drops stale slugs inside a restored `SavedView.filters` blob.
- **Failure scenario:** User has a saved view "Đang xử lý" from before the upgrade. Post-P1 they click it: list goes empty with no error, no fallback to `OPEN_STATUS_IDS` (the fallback lives in the URL parser they bypassed). Looks like a data-loss bug; is actually a silent vocabulary mismatch.
- **Evidence:**
  - `src/components/shared/filter-panel/use-filter-state.ts` — `SavedView.filters: Record<string, unknown>`, persisted `{ name: STORE_KEYS.filterState }`.
  - `src/lib/store-keys.ts` — `filterState: 'pt-filter-state'`, `savedViews: 'pt-saved-views'`.
  - `src/domains/repair/mock-data.ts` filter: `const set = new Set(params.tinhTrang); results = results.filter((t) => set.has(t.tinhTrang))` — exact-match on status id, no coercion.
  - `src/features/repair-list/hooks/use-repair-filters.ts` `fromParams` is the *only* place defensive parsing could hook; saved-view restore does not pass through it.
- **Suggested fix:** Specify the defensive coercion at the *consumer* boundary (inside `fetchRepairList`, or a `normalizeStatusFilter()` applied to both URL and saved-view inputs), not only in `fromParams`. Add a P1 spec test: a `SavedView` with legacy slug `tinhTrang` restores to `OPEN_STATUS_IDS` (or drops the key) rather than yielding an empty list.

---

## Finding 4: HinhThuc migration is a genuine cross-phase race — P3 rebuilds the filter to 3 reference values but does not own the type migration; P4 "owns it if P3 hasn't"

- **Severity:** High
- **Location:** Phase 3 R9 + Step 7; Phase 4 §Architecture (`HinhThuc → WarrantyType`) + Step 1 + Risk Assessment
- **Flaw:** P3 Step 7 rebuilds `RepairFiltersAdvanced.tsx` so `Hình thức chung` offers exactly `['Bảo hành','Sửa dịch vụ','BH sửa chữa']` and adds a spec test asserting it. But P3 never migrates the underlying `HinhThuc` type or the seed values — that is explicitly deferred to P4 ("if P3 hasn't migrated `HinhThuc`, this phase owns the migration"). The current `HinhThuc` in `src/domains/repair/types.ts` is `'bao_hanh' | 'sua_chua' | 'sua_chua_tai_nha' | 'tu_van'` and the seed `mock-data.ts` weights those 4. So P3 ships a 3-value filter whose option values cannot match the 4-value data the tickets carry — the filter returns nothing for real rows, yet P3's spec test (asserting only the option labels) passes. "P4 owns it if P3 hasn't" is a NEITHER-owns hole: P3's plan text does not migrate it, so it lands on P4, but P3 has already shipped a filter that depends on the migration having happened.
- **Failure scenario:** After P3 merges, selecting `Hình thức chung = Sửa dịch vụ` filters against tickets whose `hinhThuc` is `sua_chua`/`tu_van` → empty results. Bug sits latent (tests green) until P4 finally migrates the type — and P4 must then also re-touch `RepairFiltersAdvanced.tsx` that P3 already rewrote, plus two `HINH_THUC_LABEL` maps, risking a merge/rework collision the plan calls "extend in place."
- **Evidence:**
  - `src/domains/repair/types.ts:10` `export type HinhThuc = 'bao_hanh' | 'sua_chua' | 'sua_chua_tai_nha' | 'tu_van'`.
  - `src/domains/repair/mock-data.ts` `HINH_THUC_LIST = ['bao_hanh','sua_chua','sua_chua_tai_nha','tu_van']`, weighted `[30,45,15,10]`.
  - Two label maps: `src/features/repair-list/hooks/use-repair-table-columns.tsx:34` and `src/features/repair-detail/RepairDetailPage.tsx:18` (`HINH_THUC_LABEL`), plus a THIRD, unrelated `HINH_THUC` in `src/mock/seed/reference-data.ts:536` (`truc_tiep/gui_hang/bao_hanh/sua_chua_km`) — a fourth naming that neither phase mentions.
  - phase-03 line 35 + line 106 (3-value filter, no type migration); phase-04 line 60 + line 115 + line 149 ("if P3 hasn't").
- **Suggested fix:** Assign the `HinhThuc → WarrantyType 1|2|3` type+seed migration to a single phase (P3, since P3 is the first to depend on the 3-value filter) as an explicit step, and make P3's filter spec test assert that a selected value actually *filters seed rows* (not just that labels render). Delete or reconcile the stray `reference-data.ts` `HINH_THUC` so there is one taxonomy.

---

## Finding 5: Dropping "Quá hạn" from the status vocabulary orphans dashboard overdue logic that the plan does not rewire

- **Severity:** High
- **Location:** Phase 1 §Architecture (15 statuses, "quaHan is a KPI series, not a status"); Step 7 (`QUEUE_STATUSES → [1,2,7,9]`); Unresolved #4
- **Flaw:** The legacy 15-status set has no "Quá hạn". The current app treats `qua_han` as a real status and derives `overdueCount` and branch overdue metrics by filtering `t.status === 'qua_han'`. P1 relabels `quaHan` as a KPI series and remaps queue tiles, but does not specify how `overdueCount` (which is a *derived* concept — overdue = past due date, not a status) is recomputed once the status disappears. Unresolved #4 only covers the 4 queue-tile ids, not the overdue derivation or `STATUS_BUCKET`-based open-count that also vanishes with buckets.
- **Failure scenario:** After P1, `fetchDashboardSummary` either fails to type-check (`qua_han` no longer a valid `RepairStatus`) — good, forces a fix — or, if quietly patched, `overdueCount` becomes constant 0 because no ticket can ever have that status, silently zeroing an operations KPI. The plan's migration list for dashboard-mock only mentions weights + `QUEUE_STATUSES`, not `overdueCount` semantics.
- **Evidence:**
  - `src/mock/dashboard-mock.ts:274` `branchTickets.filter((t) => t.status === 'qua_han')` for `overdueCount`; `:212` `QUEUE_STATUSES = ['cho_tiep_nhan','dang_sua_chua','qua_han','cho_tra_khach']`; `:264` open-count via `STATUS_BUCKET` (`new Set(['tiep_nhan','dang_xu_ly','cho'])`).
  - `src/components/dashboard/WorkQueueTiles.tsx:39` renders a `qua_han` tile.
  - `src/domains/repair/status.ts:30,63,83` — `qua_han` is status #16 with bucket `cho`; P1 deletes buckets and this status.
- **Suggested fix:** Add an explicit P1 step: replace status-based `overdueCount` with a date-derived predicate (e.g. open status AND `ngayHenTra < now`), and replace the bucket-based open-count with an `OPEN_STATUS_IDS` membership check. Add a spec test that `overdueCount` reflects overdue tickets, not a dropped status.

---

## Finding 6: In-place object mutation + `keepPreviousData` can defeat React Query change detection and produce stale/no-rerender

- **Severity:** Medium
- **Location:** Phase 3 §Architecture "Mutable mock store" + Risk Assessment ("route every mutation through one `useRepairMutation` that always invalidates")
- **Flaw:** P3 mutates ticket objects **in place** inside `MOCK_TICKETS` (e.g. `updateTicketStatus` sets `ticket.status = …`), then relies on `invalidateQueries(['repair-list'])`. `fetchRepairList` returns `MOCK_TICKETS.slice()` — a new array of the *same* object references. React Query applies structural sharing / referential equality on results; if a refetch returns rows that are the same object identities with mutated inner fields, and the list is currently displaying via `placeholderData: keepPreviousData`, the previous-data snapshot already points at the same mutated objects, so the "before" and "after" can be reference-equal and skip a visible transition. Invalidation forces the queryFn to run, so counts generally update — but any component memoized on row identity (`useMemo`/`React.memo` keyed on the ticket object) will not see the change because the reference is unchanged.
- **Failure scenario:** Dispatch a technician; the `Kỹ thuật` cell is a memoized cell keyed on `row.original`; the object mutated in place keeps its identity, so the cell does not re-render even though `invalidateQueries` refetched. Intermittent "the toast fired but the row didn't update until I re-filtered."
- **Evidence:**
  - `src/domains/repair/mock-data.ts` `fetchRepairList` returns `MOCK_TICKETS.slice()` (shallow copy, shared element refs).
  - `src/features/repair-list/RepairListPage.tsx:121` `placeholderData: keepPreviousData`; `main.tsx:9` `staleTime: 30_000` (invalidation overrides, but memoized cells still see stable refs).
  - Plan mandates in-place mutation: phase-03 line 50 "`MOCK_TICKETS` (in-place mutation)".
- **Suggested fix:** Mutate immutably — replace the ticket with a shallow-cloned object (`MOCK_TICKETS[i] = { ...t, status }`) so refetched rows get new identities, guaranteeing re-render regardless of memoization. Add this to the `useRepairMutation` contract, and a test asserting the row object reference changes after a mutation.

---

## Finding 7: P1 rollback is not atomic with respect to P3–P7 — reverting P1 (which deletes `financials.ts` and rewrites `status.ts`) cascades

- **Severity:** Medium
- **Location:** Phase 1 §Risk ("`git revert` of the phase commits restores the 16-status app"); Phase 3–7 Risk ("single revert restores prior state")
- **Flaw:** Each phase claims a clean single-commit revert. But P1 **deletes** `src/mock/seed/financials.ts` (creating `chung-tu.ts`) and **removes** all bucket exports + the snake-case `RepairStatus` union. P3–P7 import the new numeric status module, `chung-tu`/`cong-no`/`ky`/`tinh-quan-xa` seeds, and `KT_BOARD_STATUS_IDS`. Once any later phase merges on top, a P1 revert is no longer isolated: it removes exports those phases hard-depend on, breaking the build. The "single revert restores prior state" claim is only true for the *last* phase in the chain, not for P1 after P3+ land.
- **Failure scenario:** A defect surfaces in P1's status hexes after P4 shipped. `git revert <P1 commit>` restores `status.ts` buckets and re-adds `financials.ts`, but P4's `mock-mutations`/KT board still import `KT_BOARD_STATUS_IDS`, numeric `RepairStatusId`, and `chung-tu` — type-check/build fail across the tree. Rollback becomes a multi-phase surgery, contradicting the risk note.
- **Evidence:**
  - phase-01 line 70 "Delete: `src/mock/seed/financials.ts`"; line 51 "Bucket concept deleted (`Bucket`, `STATUS_BUCKET`, `BUCKET_*` all removed)"; line 135 rollback claim.
  - `src/mock/seed/index.ts` currently `export * from './financials'` — deleting the file forces an index edit later phases build on.
  - `financials.ts` `SEED_FINANCIALS` — plan asserts "zero consumers outside seed" (verified: `grep SEED_FINANCIALS src` → only its own file), so deletion is safe *in isolation*, but the `status.ts` rewrite is the cascading part.
- **Suggested fix:** State honestly that P1 is a foundational, non-isolated change: rolling it back after P3+ requires reverting the dependent phases too (or forward-fixing). Reserve the "single-commit revert" claim for phases that touch only additive/leaf files (P2 shell pages, P7 reports), and drop it from P1/P3/P4 where shared contracts change.

---

## Finding 8: Công nợ "settle → creates a thu voucher in the same mock store" is architecturally possible but P2's new store is a *different* store than the F1 list reads — coupling is unspecified

- **Severity:** Medium
- **Location:** Phase 6 F2 + §Architecture ("keep both in the same mock store so F1 reflects F2 payments") + Risk Assessment
- **Flaw:** The claim that settling a debt creates a ChungTu row visible in F1 is achievable — `makeMockApi` closes over a mutable module array, so pushing into `THU_CHI_ROWS` would surface via `thuChiApi.list`. BUT P6 also *re-models* ChungTu to the 12-type schema and rewrites `ThuChiPage` onto a "reference column config," and P1 replaces `financials.ts` with `chung-tu.ts`. There are now up to three candidate "thu voucher" stores: the legacy `THU_CHI_ROWS` (finance-mock, `TC-` codes, `Thu/Chi` + approval state), P1's `chung-tu.ts` (`PTT-/PCC-`, 12 types), and whatever F1 finally binds to. The plan says "same mock store" without specifying *which* array `thanhToanCongNo` pushes into and whether F1's list reads that same array. If `thanhToanCongNo` pushes a `PTT-` row into `chung-tu` but F1 still lists `THU_CHI_ROWS` (or vice-versa), the settle silently does not appear.
- **Failure scenario:** Settle a debt in F2; a thu voucher is created in store A; F1 lists store B; the payment never shows in Thu Chi. Cross-page invariant "F1 reflects F2 payments" fails silently — exactly the coupling the risk note promises but does not pin down.
- **Evidence:**
  - `src/mock/finance-mock.ts` — `THU_CHI_ROWS` (`TC-` codes, `loai: 'Thu'|'Chi'`, `trangThai: 'Cho duyet'|'Da duyet'|'Huy'`), `congNoApi = makeMockApi(CONG_NO_ROWS)` — separate arrays.
  - `src/mock/seed/financials.ts` `SEED_FINANCIALS` (`PT-/PC-` codes) — deleted by P1, replaced by `chung-tu.ts` (`PTT-/PCC-`, 12 `Loại thu chi`).
  - `makeMockApi` (`src/mock/masterdata/index.ts:77`) confirms in-place shared array — push-visibility works *only within one array*.
- **Suggested fix:** Name the single source-of-truth array for ChungTu after the P1 replacement, and state that both `ThuChiPage` list and `thanhToanCongNo` bind to it. Add a mutation test: `thanhToanCongNo(ticketId, amount)` appends a `PTT-` row that `thuChiApi.list`/the F1 fetcher subsequently returns.

---

## Cross-cutting observations (not numbered findings)

- P2's `pt-notifications` cleanup claim **checks out**: `STORE_KEYS` values flow into `ALL_STORE_KEYS` via `Object.values`, and `resetDemo` iterates `ALL_STORE_KEYS`. Adding `notifications: 'pt-notifications'` auto-wires cleanup. Same holds for P7 `pt-permissions`. (`src/lib/store-keys.ts`, `src/demo/demo-reset.ts`.)
- The store-keys file and `resetDemo` docstrings still reference a "Phase 8" that does not exist in this plan (numbering drift from an earlier plan). Harmless, but the plan reuses "Phase 8" mental model for seed-volume growth that P1 now front-loads — worth reconciling to avoid a reader assuming a later volume phase exists.

---

## Unresolved questions for the planner

1. Which array is the canonical ticket source after P1 — `SEED_REPAIR_TICKETS` or `MOCK_TICKETS`? (Finding 1 blocks P3/P4 realism regardless of green tests.)
2. Are session-only mock writes acceptable for the demo, or must created vouchers/tickets survive reload? (Finding 2 changes P4/P5/P6 success criteria wording and possibly adds a persistence step.)
3. Where does the status-filter defensive coercion live so it covers *both* URL and saved-view restore paths? (Finding 3.)
4. Which single phase owns the `HinhThuc → WarrantyType` type+seed migration, and will its filter test assert real row filtering, not just labels? (Finding 4.)
5. How is `overdueCount` derived once "Quá hạn" is not a status? (Finding 5.)

Status: DONE
Summary: Plan is well-structured but rests on a false "one ticket seed" premise (Finding 1) and inverted durability/reset assumptions (Finding 2); five further high/medium holes in status-migration fan-out, cross-phase HinhThuc ownership, dashboard overdue logic, mutation re-render, and non-atomic P1 rollback — all evidence-backed against `src/`.
