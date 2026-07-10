# Red-Team Plan Review — Scope & Complexity Critic (YAGNI / Contract Verifier)

Plan: `plans/260707-1612-real-backend-database/` (plan.md + phase-01..07)
Reviewer lens: Scope & Complexity Critic (YAGNI enforcer) + Contract Verifier
Verdict: **The plan is technically honest and well-verified, but scoped as one monolithic
7-phase program where a much smaller MVP delivers most of the value. Several abstractions
and the monorepo move are gold-plating that risk the existing 440 green tests for little
gain.**

Grounding (verified frontend-only, no backend exists):
- No `apps/`, `packages/`, `backend/`, `server/`, or `api/` dirs — root Vite SPA only
  (`ls /home/hale/code/phongthanh-admin` → `src/`, root `package.json`).
- `package.json` deps are 100% frontend (React/Radix/TanStack/zod/vite); zero server deps
  (`package.json:17-77`).
- `MockApi<T>` seam confirmed real (`src/types/crud-types.ts:52-57`) and consumed by
  `useCrud` (`src/hooks/use-crud.ts:76,84,97,106`).
- 440 tests confirmed exactly (125 test files; 440 `it()/test()` calls).
- RNG-fabricated warehouse confirmed (`src/domains/warehouse/mock-data.ts:73,82` +
  `SeededRandom`).
- Menu-keyed RBAC confirmed (`src/store/permission-store.ts:12-15`).

---

## Finding 1 — No MVP cut: Phases 5+6 (BUILD) should be a v2, not gate "real product"
**Severity:** High
**Location:** `plan.md:65-79` (phase table + dependency chain); `phase-05-…:9-17`;
`phase-06-…:9-21`
**Flaw (YAGNI / MVP):** The user asked for "a real backend + database" for "a real
deployable product." Phases 1-4 (auth + server-side RBAC + ~39-entity CRUD + repair
workspace) already deliver a real, deployable, enforced product — that is the entire
mock surface *that has data to migrate*. Phases 5 (warehouse ledger) and 6 (finance
transactions) are explicitly **net-new BUILDs with design spikes**, not migrations
(`phase-05-…:9-17` "This is a NET-NEW BUILD"; `phase-06-…:11` "Net-new transactional
build, not a port"). The plan bolts two greenfield accounting/inventory subsystems onto a
migration and calls the whole thing one deliverable. Phase 5's own risk section admits it
is "the biggest scope + liability" (`phase-05-…:113`). That is the definition of an MVP
boundary the plan declined to draw.
**Failure scenario:** The solo effort stalls in the Phase 5 ledger spike (double-entry
grain, period-close snapshots, carry-forward invariants, concurrency/idempotency —
`phase-05-…:39-58,120-121`). Because P5/P6 are inside the same plan and P7 (deploy)
depends on all (`phase-07-…:6` `dependencies: [3,4,5,6]`), nothing ships until the hardest,
least-specified part is done. Half the value (Phases 1-4) sits un-deployed behind the
riskiest third.
**Evidence:** `plan.md:77` "Dependency chain: 1 → 2 → 3 → 4 → (5, 6) → 7";
`phase-07-…:6`; `phase-05-…:113`; `phase-06-…:11`.
**Suggested fix:** Split into two plans. **v1 = Phases 1-4 + a trimmed Phase 7** (deploy
the CRUD+auth+RBAC+repair product; warehouse/finance stay on mock behind the dual-run flag
— the flag exists precisely to allow this, `plan.md:29`). **v2 = the ledger + finance
BUILD**, planned separately with its own spike sign-off. The plan should state explicitly
that ~half the value ships in v1; today it does not.

---

## Finding 2 — Monorepo move (`src/` → `apps/web`) is gold-plating that risks 440 green tests
**Severity:** High
**Location:** `plan.md:97-103` (Repository shape decision); `phase-01-…:28,32-38,92,122`
**Flaw (over-engineering / unnecessary complexity):** Phase 1 step 0 proposes moving the
entire working `src/` into `apps/web` and standing up npm workspaces + `packages/shared`,
justified as "so the wire types are shared, not duplicated" (`plan.md:102-103`). The
current repo is a single Vite app with 125 test files and path aliases (`@/…`). Moving
`src/` rewrites every import root and Vite/tsconfig path config *before any backend value
is produced*, and the plan lists "Repo move breaks the 440 tests" as its #1 Phase-1 risk
(`phase-01-…:137-138`). This is a large mechanical blast radius bought for a small win:
the shared wire types are ~4 interfaces (`MockApi`, `ListParams`, `PagedResult`,
`BaseEntity`).
**Failure scenario:** A day-one refactor churns 125 test files and every alias; a subtle
path/config regression turns the "440 green" safety net red, and now you cannot tell
migration bugs from move bugs. The safety net you depend on for the *entire* migration is
compromised at step 0.
**Evidence:** `phase-01-…:92` "move `src/` to `apps/web`"; `phase-01-…:137-138` (named
risk); 4 shared types only (`src/types/crud-types.ts:52-57` + seed types).
**Suggested fix:** Take the low-risk sibling-`api/` option the plan already lists as the
alternative (`phase-01-…:28`). Keep `src/` exactly where it is. Share the ~4 wire types by
having the backend import/copy a single `wire-types.ts` (they are tiny and change rarely),
or publish them from the existing `src/types` — no workspace move required. Defer any
monorepo restructure to *after* the product ships, if ever (YAGNI). Note: the plan hedges
("or keep root, TBD in spike", `phase-01-…:34`) — make "keep root" the default, not the
fallback.

---

## Finding 3 — `packages/shared` + workspaces is premature abstraction for a solo migration
**Severity:** Medium
**Location:** `plan.md:100-103`; `phase-01-…:36-38`
**Flaw (premature abstraction):** `packages/shared` is introduced to hold Zod schemas +
wire types "so client + server can't drift" (`phase-01-…:38`). For a solo dev migrating
behind a stable interface, drift is caught immediately by the MSW contract tests the plan
*already* mandates (`plan.md:94-95` "Frontend contract tests use MSW to assert
`makeHttpApi<T>` speaks the exact wire shape"). A whole workspace package + its build/lint
wiring is infrastructure for a multi-team drift problem this project does not have.
**Failure scenario:** Time spent configuring workspace resolution, dual tsconfig
references, and package build order — none of which advances the actual auth/CRUD backend
— while the contract already has a test-based guarantee.
**Evidence:** `plan.md:94-95` (MSW contract tests already guard the wire shape);
`phase-01-…:36-38`.
**Suggested fix:** Drop `packages/shared`. Let the MSW contract test be the anti-drift
mechanism (it is stronger than a shared type — it checks runtime serialization, not just
compile-time shape). Copy or re-export the 4 types.

---

## Finding 4 — Full double-entry `stock_movement` ledger + period-close snapshots may exceed the real need
**Severity:** Medium
**Location:** `plan.md:42-45` (D3); `phase-05-…:39-58,80-96`
**Flaw (gold-plating / YAGNI):** D3 locks a "full build" — immutable signed-quantity
ledger, per-Kỳ×kho×hàng-hóa `stock_period_snapshot` at period-close, carry-forward
invariant `tonDauKy(ky) = tonCuoiKy(prevKy)` (`plan.md:42-45`, `phase-05-…:41-58`). The
thing being *replaced* is decorative RNG with no ledger and no source documents
(`phase-05-…:9-17`; `src/domains/warehouse/mock-data.ts:73,82`). There is no evidence in
the plan that the business currently reconciles inventory by accounting period, or that
anyone needs immutable historical balances vs. a current on-hand quantity. The plan is
faithfully rebuilding a *ledger* where the actual requirement may be "know how many parts
are in each kho right now."
**Failure scenario:** Weeks go into period-close semantics, snapshot-vs-live reconciliation
tests (`phase-05-…:83-84`), and concurrency/idempotency for voucher posting
(`phase-05-…:120-121`) — for a deployable admin tool whose users may only need a live
on-hand count. This is the single largest scope item (`phase-05-…:113`) and its necessity
is asserted, not demonstrated.
**Failure scenario (contract angle):** Snapshot is a denormalized read-cache that *must*
equal the live aggregation (`phase-05-…:83-84`, `102-103`). That is a second source of
truth requiring a reconciliation guarantee forever — a durable maintenance cost the on-hand
model does not incur.
**Evidence:** `plan.md:42-45`; `phase-05-…:41-58,113,120-121`; RNG source has no ledger
(`src/domains/warehouse/mock-data.ts:73,82`).
**Suggested fix:** In v2, start the spike from an on-hand-quantity model (a `stock_movement`
append log with a *materialized current balance per (kho, hàng-hóa)* and NO period
snapshots). Add period-close snapshots only if a stakeholder confirms period reconciliation
is a real workflow. D3 is a *locked user decision* — do not silently reverse it; surface
"full ledger vs on-hand" as an explicit product question with the trade-off before v2
starts (per review-audit rules on user decisions).

---

## Finding 5 — Phase 7 bundles CI/CD + multi-target deploy + docs rewrite into the same plan (scope creep)
**Severity:** Medium
**Location:** `phase-07-…:37-48,64-71`
**Flaw (scope creep):** Phase 7 mixes three separable efforts: (a) 6 report SQL
aggregations, (b) a full CI/CD pipeline running two test suites + deploy-on-main
(`phase-07-…:42-45`), and (c) a docs/README/ARCHITECTURE honesty-flag rewrite
(`phase-07-…:64-71`). The hosting target is still undecided (`phase-07-…:39-41` lists
Fly/Railway/VPS as open), yet CI/CD, secret-store wiring, and reproducible fresh-DB
migration are all promised in the same phase. Deployment/ops is its own discipline with its
own decision (`plan.md:141`) — folding it into the feature plan means the whole program is
"not done" until ops is done.
**Failure scenario:** Reports are trivially done, but the phase can't close because the
hosting decision, CI secrets, and deploy pipeline are unresolved — blocking the "shipped"
milestone on ops choices unrelated to backend correctness.
**Evidence:** `phase-07-…:37-48` (deploy + CI/CD + secrets); `phase-07-…:64-71` (docs
rewrite); `phase-07-…:39` (hosting undecided); `plan.md:141`.
**Suggested fix:** Split Phase 7: keep **reports** (they depend on real tables, legitimate
plan-scope) in the migration plan. Move **CI/CD + deploy target + secret management** into
a separate deployment plan/effort with its own hosting decision. The docs honesty-flag
update is a 30-min task that rides along with whichever phase actually resolves each
limitation — not a Phase 7 line item.

---

## Finding 6 — "~39 CRUD tables" over-counts; many are tiny static lookups the plan keeps as CRUD "for uniformity"
**Severity:** Medium
**Location:** `plan.md:71` (Phase 3 "~39 tables"); `phase-03-…:13,40-43`
**Flaw (unnecessary work / YAGNI):** Phase 3 claims "~39 config-backed tables" but the
actual distinct simple-CRUD entities are far fewer: 28 non-test `*.config.ts` in
`crud-configs/`, 23 masterdata `*.mock.ts`, + 6 HR mocks. More importantly, several are
trivially small reference lists that never change: branches (5 rows,
`src/mock/seed/branches.ts`), kỳ (2, `ky.ts`), lỗi-sửa-chữa (2, `loi-sua-chua.ts`),
phí-giao (6, `phi-giao.ts`), nhóm-khách-hàng (10, `nhom-khach-hang.ts`). The plan itself
flags this ("a few … rarely change") but chooses "keep as CRUD tables for uniformity"
(`phase-03-…:40-43`). Uniformity is not a business requirement; each "kept for uniformity"
table still costs a schema + migration + filter allowlist + seeder block + characterization
+ contract tests (`phase-03-…:29-32`).
**Failure scenario:** The fan-out spends real per-entity effort (TDD both directions,
FK-order seeding, `filters` allowlist) on 9-row lookups a user edits once a year, inflating
the phase for no product value.
**Evidence:** counts (28 configs / 23+6 mocks, not 39); tiny seeds
(`src/mock/seed/{branches,ky,loi-sua-chua,phi-giao,nhom-khach-hang}.ts` = 5/2/2/6/10 rows);
`phase-03-…:40-43` ("keep as CRUD tables for uniformity").
**Suggested fix:** Seed the tiny, stable lookups (≤~15 rows, low churn) as read-only
reference data with no create/update/delete endpoints; the existing pages can render them
read-only. Reserve the full CRUD spine for entities users actually mutate. Correct the
"~39" number to the verified count so the phase estimate is honest.

---

## Finding 7 — `makeHttpApi<T>` + `apiFor()` seam is right-sized; the dual-run/rollback machinery is right-sized — but "byte-identical drop-in" oversells coverage
**Severity:** Medium
**Location:** `plan.md:24-29,106-108`; `phase-01-…:40-57`; acceptance
`plan.md:107-108`
**Flaw (contract over-claim, not over-build):** The `makeHttpApi<T>` / `apiFor()` /
per-resource flag design is the correct *minimal* seam — verified: the flag flips a single
interface (`src/hooks/use-crud.ts:76` calls only `config.mockApi.*`), rollback = remove
from a list, no over-built dual-write or shadow-read is proposed (good — the plan avoided
that trap). **However**, the headline claim "a migrated CRUD page needs ZERO changes"
(`plan.md:107`) and "pages … byte-identical across the switch" (`plan.md:28`) only holds
for entities that go through `useCrud`. Warehouse, repair, and finance do **not**: they use
14 bespoke mutation functions (`src/domains/repair/mock-mutations.ts:33-230`) and ~31 files
with bespoke `useQuery`/`useMutation` (grep across `src/domains`, `src/features`,
`src/pages`). Those pages are rewired by hand in Phases 4-6, not flipped by a config line.
**Failure scenario:** Whoever reads the acceptance criteria expects the whole app to flip
via one flag per resource and under-budgets Phases 4-6, where each bespoke endpoint
(status transitions, dispatch, quote, parts, settle-debt) is a manual client+server change,
not a drop-in.
**Evidence:** seam is single-call (`src/hooks/use-crud.ts:76,84,97,106`); bespoke surfaces
(`src/domains/repair/mock-mutations.ts:33-230` = 14 fns; ~31 files with bespoke queries);
finance settle mutates in JS (`src/mock/finance-mock.ts:138-140`).
**Suggested fix:** Scope the "zero-change / byte-identical drop-in" claim explicitly to the
`useCrud`-backed CRUD entities (Phases 1,3). State plainly that Phases 4-6 are bespoke
endpoint work with manual client wiring, and budget them accordingly. Keep the seam design
as-is — it is not over-built; only the coverage claim is.

---

## Summary of recommended scope cuts (priority order)

1. **Ship v1 = Phases 1-4 + reports + minimal deploy.** Defer Phases 5-6 (ledger + finance
   BUILD) to v2. State that ~half the value ships in v1. (Findings 1, 5)
2. **Keep `src/` in place; use sibling `api/`; drop `packages/shared` + workspaces.**
   Protect the 440 green tests. (Findings 2, 3)
3. **Re-open D3 as a product question** (full ledger vs on-hand) before v2; do not silently
   reverse the locked decision — present the trade-off. (Finding 4)
4. **Seed tiny static lookups read-only;** correct the "~39" count. (Finding 6)
5. **Scope the "zero-change drop-in" claim to CRUD entities;** budget Phases 4-6 as bespoke
   work. (Finding 7)

## What the plan got right (risk-calibration only, not praise)
- Factual claims are verified, not assumed: RNG warehouse
  (`src/domains/warehouse/mock-data.ts:73,82`), menu-keyed RBAC
  (`src/store/permission-store.ts:12-15`), `filters` injection gate, and the 440-test count
  all check out. The adversarial-review corrections carried into `plan.md:52-64` are real.
- The seam choice (single interface, per-resource flag, no dual-write machinery) is the
  minimal correct migration mechanism — it avoided the shadow-read/dual-write over-build
  that a red-team would normally expect here.
- Server-side RBAC + JWT-sourced branch scope + `filters` allowlist are genuine security
  requirements, not gold-plating (they close real limitations).

## Unresolved questions (for the planner)
1. Does the business reconcile inventory by accounting period (justifying period-close
   snapshots), or is a live on-hand count sufficient? (Gates Finding 4 / D3.)
2. Is a deployable v1 without warehouse/finance acceptable to the user, with those two
   staying on mock behind the flag? (Gates Finding 1.)
3. Is the monorepo move a hard requirement from anyone, or convenience? (Gates Finding 2.)
