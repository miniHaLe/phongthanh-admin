# Red-Team Review: "Real Backend + Database" plan — Assumption Destroyer

Reviewer role: Assumption Destroyer / Scope Auditor. Posture: hostile. Every finding
grep-backed with `file:line`. Central claim under attack: *"every entity's data access
flows through ONE clean `MockApi<T>` seam, so a real `makeHttpApi<T>` drops in with ZERO
page changes."*

**Verdict: the central bet is false as stated.** The clean seam covers the **39
config-backed CRUD tables only** (`src/config/crud-configs/*` + `src/config/finance-tables/*`).
The app's high-value interactive surface — repair workspace, warehouse vouchers/inventory,
finance settle/invoice, HR, reports — reaches data through **bespoke fetchers, bespoke
exported mutation functions, and direct `*_ROWS`/`MOCK_*` array imports** that do NOT
implement `MockApi<T>` and will NOT drop in. **52 non-test runtime files bypass the seam.**
The plan's own phase-4/5/6 text half-admits this (bespoke endpoints, "build not port"), but
`plan.md` and the acceptance criteria still lead with the categorical "ZERO changes" framing.

---

## CRITICAL-1 — "Zero page changes" is false for 52 non-test runtime files

**Location:** `plan.md:24-29`, `plan.md:107-109` (acceptance: "a migrated CRUD page needs
ZERO changes beyond the one `apiFor()` config line"); `phase-01:...:148` ("the seam audit
from the parity work (P7 X2) confirms none [bypass], re-verify").

**Flaw:** The seam (`config.mockApi.list/...` consumed via `useCrud`) is real but narrow.
Outside the 39 configs, pages import mock data and mutation functions **directly**:

- `src/hooks/use-crud.ts:76` calls `config.mockApi.list(...)` — the ONLY true seam
  consumer. It backs the 37 `mockApi:` config entries (`grep 'mockApi:' src/config` = 37).
- Everything else bypasses it. Non-test runtime bypass count = **52 files**
  (`grep -rln 'import.*\(MOCK_\|_ROWS\)' src/pages src/features src/domains | grep -v .test = 52`).

Concrete bypasses (each is a page the "zero change" claim is wrong about):
- Repair list: `src/features/repair-list/RepairListPage.tsx:24,76` → `fetchRepairList(...)`
  (bespoke, `src/domains/repair/mock-data.ts:544`), not `MockApi<T>`.
- Warehouse voucher lists: `src/domains/warehouse/list-fetchers.ts:33-116` — 8 bespoke
  `fetch*List` fns with their own param/return shapes, consumed by
  `src/pages/xuat-kho/{BanHang,CapLinhKien,ChuyenKho,TraHang}Page.tsx`.
- Inventory view: `src/pages/quan-ly-kho/XemTonKhoPage.tsx:42,128` → `fetchInventory(...)`
  (RNG bespoke), not the config seam.

**Failure scenario:** Team schedules Phase 3 as "mechanical, one `apiFor()` line + a seeder
per entity," sizes the whole migration off the 39 configs, then discovers repair/warehouse/
finance/HR/report pages each need bespoke endpoint contracts, param-shape adapters, and
per-file rewrites. Phases 4-6 silently absorb the real cost; the schedule derived from the
"zero change" framing is wrong by a large multiple.

**Evidence:** `use-crud.ts:76`; `grep 'mockApi:' src/config` = 37; 52-file bypass count above;
`repair-list/RepairListPage.tsx:76`; `warehouse/list-fetchers.ts:33`; `XemTonKhoPage.tsx:128`.

**Suggested fix:** Rewrite `plan.md`'s lever paragraph + acceptance criterion to scope the
"zero-change" claim explicitly to the 39 config-backed CRUD tables. Add an inventory of the
bespoke surface (fetchers + mutation fns + direct-import consumers) with a per-file migration
cost, and state plainly that repair/warehouse/finance/HR/report pages require page-level
changes (new client fetch fns + endpoint contracts), not a config line.

---

## CRITICAL-2 — Bespoke mutation functions (not `MockApi<T>`) drive the core domains; 23+ consumer files rewire

**Location:** `phase-04:60` ("Maps 1:1 to `mock-mutations.ts`"), `phase-06:66`, `plan.md:133`
("Out of scope: … beyond the `mockApi`→`dataApi` rename + config wiring").

**Flaw:** The interactive core mutates via **exported functions that splice shared arrays**,
imported directly by feature components — outside the `MockApi<T>` create/update/remove seam:

- Repair: 12 consumer files import from `src/domains/repair/mock-mutations.ts`
  (`updateTicketStatus`, `dispatchTechnician`, `cancelDispatch`, `issuePartsToTech`,
  `checkoutDelivery`, `transferBranch`, `deleteTickets`, `addScheduleReminder`,
  `updateSolution`, `updateSuaGap`) — e.g. `repair-list/components/update-status-modal.tsx:34`.
- Finance: 6 files import `thanhToanCongNo`/`createPhieuThu`/`createPhieuChi`/`createHoaDon`
  from `src/mock/finance-mock.ts` — e.g. `features/finance/thanh-toan-cong-no-modal.tsx`,
  `features/invoice-composer/invoice-composer-page.tsx`. These `unshift` into `THU_CHI_ROWS`/
  `HOA_DON_ROWS` (`finance-mock.ts:170,212,245,373`).
- Warehouse: 5 files import from `src/domains/warehouse/mock-mutations.ts`.

Each has a bespoke signature (`ThanhToanCongNoInput`, `CreateHoaDonInput`, modal-specific
args) — none is `create(data)`/`update(id,data)`. The "rename + config wiring, nothing else"
scope line is contradicted by ~23 mutation-consumer files that need real per-endpoint rewiring.

**Failure scenario:** "Out of scope: beyond rename" is taken literally; a downstream
implementer treats these as covered by the seam swap. They aren't — every modal's submit
handler must be repointed to a bespoke endpoint call, with new error/loading handling.

**Evidence:** `grep 'domains/repair/mock-mutations' src | grep -v .test` = 12 files;
`grep 'thanhToanCongNo\|createPhieuThu\|createPhieuChi\|createHoaDon' src` = 6 non-mock files;
`grep 'domains/warehouse/mock-mutations' src | grep -v .test` = 5; `finance-mock.ts:130,184,217,343`.

**Suggested fix:** Add explicit per-domain "client rewire" inventories to phases 4/5/6
listing each consumer file + the endpoint it must call. Delete or heavily qualify the
`plan.md:133` "out of scope beyond rename" line — it is false for the core domains.

---

## CRITICAL-3 — `X-Chi-Nhanh` header does not exist; branch scope is client-state, and persisted `activeBranch:'all'` becomes a silent access change

**Location:** `phase-01:69-70` ("The client `X-Chi-Nhanh` header is only the active-branch
UI hint; it can NARROW …"); `plan.md:117` ("forging `X-Chi-Nhanh` cannot read another
branch"); D4 (`plan.md:46-48`).

**Flaw:** There is no `X-Chi-Nhanh` header anywhere in the code
(`grep -rn 'X-Chi-Nhanh\|x-chi-nhanh' src` = 0 matches). Branch context is **client zustand
state**, `useAppStore.activeBranch`, **persisted to localStorage `pt-app`** with default
`'all'` (`src/store/app-store.ts:20,37,40`). Repair filters resolve `activeBranch==='all'` →
`'dak-lak'` **on the client** (`features/repair-list/hooks/use-repair-filters.ts:29`;
`features/repair-create/RepairCreateForm.tsx:130`). So today "all branches" is a client
super-scope with no server counterpart.

The plan threat-models a header that isn't there while ignoring the real trust boundary: a
non-super user whose persisted `activeBranch` is `'all'` (the default) will, post-migration,
have the server silently scope them to `IN (:userBranches)`. Lists that were full go partial
with no UI signal, and any client code assuming `'all'` returns everything (dashboard/report
aggregations, `RepairCreateForm` default-branch logic) now diverges from server truth.

**Failure scenario:** After flip, users report "half my tickets disappeared." Root cause:
localStorage `activeBranch:'all'` + client `'all'→'dak-lak'` coercion vs. JWT scope, never
reconciled. Worse, if the server ever trusts a request-supplied branch to *widen*, the
persisted client value is attacker-controlled (localStorage).

**Evidence:** `grep 'X-Chi-Nhanh' src` = 0; `app-store.ts:20,37,40`;
`use-repair-filters.ts:28-29`; `RepairCreateForm.tsx:129-130`.

**Suggested fix:** In Phase 1/2, replace the fictional `X-Chi-Nhanh` narrative with the real
mechanism: derive allowed branches from JWT; treat any client-sent active-branch as a
*narrowing hint only*, validated ⊆ JWT set server-side; define behavior when persisted
`activeBranch` is out of the user's allowed set (reset to a permitted branch, surface a
notice). Add a characterization note that "all" is currently client-super-scope and must map
to `superScope` in the JWT, not to an unfiltered query for ordinary users.

---

## HIGH-1 — Test suite is engineered to hide exactly the failure modes a real backend adds

**Location:** `plan.md:90-91` ("the frontend's existing 440-test suite must stay green after
each entity flips"); every phase's "440 tests green" success criterion.

**Flaw:** The 440 suite's green state is contingent on mock properties a real backend breaks:

- `src/test/setup.ts:24` forces `Math.random = () => 0.999` in a global `beforeEach`, purpose-
  built to suppress the mock's 5% `maybeThrow(0.05)` failures (`make-mock-api.ts:81`;
  `mock-data.ts:548`; `finance-mock`, `inventory-mock`). Real network errors/timeouts/401/403/
  409 are not `Math.random`-gated and will surface in tests that never exercised an error path.
- Mock latency is `mockDelay(300,200)` on a fake timer surface; real latency + `req()` 401→
  refresh→retry introduces async ordering the tests never covered.
- `use-crud.ts:78` `staleTime: 30_000` + `main.tsx:9` `refetchOnWindowFocus:false` mean the
  suite never sees a refetch/invalidation race; instant in-process resolution hid it.

"Suite stays green" is therefore **not** evidence the flip is safe — it is evidence the suite
was written against mock timing/determinism. Using it as the regression gate (the plan's core
safety mechanism) gives false assurance.

**Failure scenario:** Every phase passes "440 green," ships, and production surfaces
loading-flash, error-toast, refetch-race, and 403-handling bugs the suite structurally cannot
catch. The plan has no MSW-latency/error-injection gate to compensate.

**Evidence:** `src/test/setup.ts:24`; `make-mock-api.ts:81`; `use-crud.ts:78`; `main.tsx:9`;
actual test-file count = 125 files (the "440" is the assertion count, per
`docs/legacy-defect-catalog.md:124`).

**Suggested fix:** Add a mandatory contract-test layer (MSW with injected latency + 401/403/
409/500 + slow responses) as the real regression gate per phase, and stop treating "440 mock
tests green" as proof the real swap is safe. Explicitly test refetch/invalidation under
non-instant responses.

---

## HIGH-2 — Two contradictory tồn-kho representations; Phase 3 and Phase 5 collide on `ton-kho`

**Location:** `phase-03:13` ("~39 config-backed tables … Mechanical"); `phase-05:9-16`
("NET-NEW BUILD … RNG-fabricated"); the entity map is treated as consistent.

**Flaw:** `ton-kho` exists **twice**, via different mechanisms:
1. `src/config/finance-tables/ton-kho.config.ts:29` → `mockApi: tonKhoApi` →
   `src/mock/inventory-mock.ts:81` `makeMockApi<TonKho>(TON_KHO_ROWS)` (a `SeededRandom(3001)`
   row set, `inventory-mock.ts:55-81`). This is inside the "simple CRUD" seam counted in Phase 3's 39.
2. `src/pages/quan-ly-kho/XemTonKhoPage.tsx:128` → `fetchInventory(...)` from
   `src/domains/warehouse/mock-data.ts`, the `tonDauKy`/`deltaFor` RNG carry-forward
   fabrication (`mock-data.ts:73-118`) that Phase 5 says has "no ledger to port."

So the Xem Tồn Kho screen the user actually sees does **not** read the config-backed
`tonKhoApi`; it reads the RNG bespoke fetcher. Phase 3 will happily "migrate `ton-kho` as a
simple CRUD table" and produce a real table that no inventory page consumes, while the real
inventory view is a Phase-5 ledger build. The phases overlap on the same name with no
reconciliation.

**Failure scenario:** Phase 3 ships a `ton_kho` table + endpoint, marks it green (its config
page works), and everyone believes inventory is "done for CRUD." Phase 5 then rebuilds
inventory from a ledger, orphaning the Phase-3 table and confusing which is source of truth.

**Evidence:** `ton-kho.config.ts:29`; `inventory-mock.ts:55,81`; `XemTonKhoPage.tsx:42,128`;
`warehouse/mock-data.ts:73-118`.

**Suggested fix:** In Phase 3, explicitly EXCLUDE `ton-kho` (and any inventory read config)
from the "simple CRUD 39" and hand it to Phase 5. Reconcile the two representations: decide
whether the config-backed `tonKhoApi` is dead code to delete or a distinct surface, and state
it. Re-derive the "39" count after removing inventory read-models that are really Phase-5 ledger reads.

---

## HIGH-3 — Repair status transition graph does not exist in code; Phase 4 "derive + enforce 409" invents rules that can break current free-transition flows

**Location:** `phase-04:45-49` ("15-status state machine … The server validates allowed
transitions"); `phase-04:106-107` (risk: "derive the allowed graph … where uncertain, allow + log").

**Flaw:** `src/domains/repair/status.ts` defines status ids, labels, hex, display order, and
KT-board subset — but **no transition graph** (`grep 'TRANSITION\|allowedTransitions\|
canTransition\|nextStatuses' status.ts` = 0). `updateTicketStatus`
(`domains/repair/mock-mutations.ts`) sets status freely. The plan proposes adding server-side
409 rejection on "illegal" transitions whose legality is **unknown and unspecified**. This is
net-new business logic dressed as a "hardening" of existing behavior.

**Failure scenario:** Phase 4 ships a transition table guessed from "parity spec + observed
legacy behavior." Any real workflow that legitimately jumps statuses (reopen, correction,
skip) now 409s, breaking flows that worked in the mock. The "allow + log when uncertain"
escape hatch means the "hardening" is mostly unenforced anyway — the acceptance criterion
("illegal transitions rejected 409") is then unmet or arbitrary.

**Evidence:** `grep transition src/domains/repair/status.ts` = 0 matches; `status.ts:14-117`
(defs only); `mock-mutations.ts` `updateTicketStatus` is unconditional.

**Suggested fix:** Move the transition graph to an OPEN DECISION requiring product sign-off
before Phase 4 implements enforcement. Until then, persist status changes without a 409 gate
(match current behavior) and drop the "hardening" from acceptance, or gate it behind an
explicit, product-approved graph. Do not invent 409 rules under a "characterization" label.

---

## MEDIUM-1 — Identity/current-user is imported directly in ~13 runtime files; Phase 2 does not enumerate the `CURRENT_USER` bypass

**Location:** `phase-02:64-77` (identity migration lists stores/screens, not the direct
`CURRENT_USER` consumers); `plan.md:126` ("admin user ship").

**Flaw:** `src/mock/current-user-mock.ts` `CURRENT_USER` is imported directly by ~13 runtime
files to stamp `nguoiLap`/`createdBy`/creator on vouchers, invoices, customers, products
(e.g. `features/warehouse-editors/NhapKhoCreatePage.tsx`, `invoice-composer`, `finance-mock.ts:21`,
`features/customer/create-customer.ts`). These are a `makeHttpApi` bypass for identity: after
JWT auth, "who created this" must come from the server/auth-store, not a hardcoded mock user.
Phase 2 migrates the identity *tables* and demotes `permission-store`, but never lists these
`CURRENT_USER` call sites.

**Failure scenario:** Post-Phase-2, real users log in but every created voucher/invoice still
records the mock `CURRENT_USER` as author (client-supplied, spoofable), because the direct
imports were never rewired. Audit trails are wrong and forgeable.

**Evidence:** `grep 'CURRENT_USER\|current-user-mock' src | grep -v .test` ≈ 13 files;
`finance-mock.ts:21`.

**Suggested fix:** Add a Phase-2 sub-task enumerating every `CURRENT_USER` consumer and
rewiring author/creator fields to the server identity (never trust client-sent `createdBy`);
add a server-side rule that audit fields are set from the JWT subject, not the request body.

---

## MEDIUM-2 — `mockApi → dataApi` rename is 37 config edits plus a barrel-cycle hazard, not "deferred/mechanical"

**Location:** `plan.md:133` and `phase-01:84` ("optional `mockApi`→`dataApi` rename deferred").

**Flaw:** The rename touches `CrudConfig` (`src/types/crud-types.ts`), `use-crud.ts:76`, and
**37 config files** (`grep 'mockApi:' src/config` = 37). Separately, the codebase already has a
**duplicated** `makeMockApi` factory to work around a real barrel circular-eval bug
(`src/mock/masterdata/make-mock-api.ts:1-13` documents it; `index.ts:77` re-declares the same
factory). Introducing `apiFor()` in the same barrel re-creates that cycle risk (it imports both
`makeMockApi` and `makeHttpApi`). Calling the rename "mechanical/deferred" understates a
cross-cutting edit sitting on a known fragile module-init order.

**Failure scenario:** The rename or `apiFor` wiring reintroduces the undefined-live-binding
cycle the standalone factory was created to dodge; HR mocks (`nhan-vien` reading
`PHONG_BAN_ROWS`/`CHUC_VU_ROWS` at eval time) break at import, failing unrelated pages.

**Evidence:** `grep 'mockApi:' src/config` = 37; `make-mock-api.ts:1-13`; `masterdata/index.ts:77`;
`nhan-vien.mock.ts:3`.

**Suggested fix:** Treat the rename as a scoped, tested refactor with its own step (codemod the
37 configs + type + hook together), and require `apiFor`/`isReal` to live outside the masterdata
barrel to avoid the documented cycle. Note the two duplicated factories must both be handled.

---

## Scope-audit summary (claim vs. reality)

| Plan claim | Reality (grep) | Status |
|---|---|---|
| "ONE clean seam, ZERO page changes" | 52 non-test runtime files bypass `MockApi<T>` | FALSE (narrow) |
| "~39 config-backed tables" | Exactly 39 configs — but that IS the whole clean surface | TRUE-but-misleading |
| "beyond rename + config wiring = out of scope" | ~23 bespoke mutation-consumer files need rewiring | FALSE |
| "X-Chi-Nhanh header … cannot widen" | Header does not exist; branch is persisted client state | FALSE premise |
| "440-test suite green = safe flip" | Suite forces `Math.random=0.999`, suppresses 5% errors; 125 files | FALSE assurance |
| "CRUD logic lives in exactly one place" | Two `makeMockApi` factories (cycle workaround) | FALSE |
| "derive + enforce transitions (hardening)" | No transition graph in code; net-new invented rules | Unfounded |

## Unresolved questions

1. Are the config-backed `tonKhoApi`/`nhapKhoApi`/etc. (in `finance-tables/*.config.ts`) live
   surfaces, or dead code superseded by the `domains/warehouse` bespoke fetchers? This changes
   the real "39" count and which phase owns inventory.
2. What is the authoritative repair status-transition graph (product answer), if any? Phase 4's
   409 enforcement is blocked on this.
3. Does the existing `src/pages/auth/LoginPage.tsx` already have a mock login flow that Phase 1
   must replace, and what does it currently trust for identity/branch?
4. Post-migration behavior when a user's persisted `activeBranch` (localStorage `pt-app`) is
   outside their JWT-allowed branch set — reset, error, or silent scope?

Status: DONE — central "one clean seam / zero page changes" bet holds only for 39 CRUD configs;
52 runtime files, the entire repair/warehouse/finance/HR/report core, bypass it (CRITICAL 1-3).
