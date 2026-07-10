# Red-Team Plan Review — Failure Mode Analyst (Flow Tracer)

Plan: `plans/260707-1612-real-backend-database/` (plan.md + phase 01-07)
Reviewer posture: hostile. Verification role: trace the actual data/control flow the
plan proposes and find where it breaks. Every finding cites `file:line` from the real
codebase.

---

## F1 — CRITICAL — The "440 tests stay green after each flip" gate is false; the suite is white-box, coupled to in-memory array mutation

**Location:** plan.md acceptance criteria + every phase's "Flip + regression" step
(e.g. phase-05 step 7 line 94, phase-06 step 6 line 81-82, phase-04 step 6 line 84);
TDD contract plan.md:81-95.

**Flaw:** The plan treats "440 tests green" as the load-bearing safety net that proves a
mock→real flip is behavior-preserving. But a large share of those tests assert against
**module-memory array identity**, not observable UI/query behavior. A real HTTP data path
returns a value from the server and does NOT mutate the mock's exported arrays — so these
tests cannot pass against a real backend regardless of correctness.

**Failure scenario:** Phase 6 flips finance to real. `thanhToanCongNo` now POSTs to the
API and returns a voucher, but `THU_CHI_ROWS` and the `CONG_NO_ROWS` row object are never
touched (they are no longer in the data path). Tests that assert
`expect(row.daTra).toBe(before.daTra + amount)`,
`expect(THU_CHI_ROWS.length).toBe(before + 1)`,
`expect(THU_CHI_ROWS[0].id).toBe(voucher.id)` all fail. Same for warehouse:
`traHang([id])` in the domain test asserts the in-memory row's `tinhTrang` flips. The
gate does not "stay green" — the author is forced to either (a) rewrite/delete these
tests during the flip (destroying the regression evidence the plan leans on), or (b) keep
them pointed at the still-mock path (so the gate proves nothing about the real path). The
plan never acknowledges this and budgets zero work for it.

**Evidence:**
- `src/mock/finance-mock.test.ts:28-29` — `expect(row.daTra).toBe(before.daTra + amount)` / `expect(row.conLai).toBe(before.conLai - amount)` (mutates the exported `CONG_NO_ROWS` object).
- `src/mock/finance-mock.test.ts:39-40` — `expect(THU_CHI_ROWS.length).toBe(before + 1)` / `expect(THU_CHI_ROWS[0].id).toBe(voucher.id)`.
- `src/mock/finance-mock.ts:138-141` — settle mutates `row.daTra`/`row.conLai` in place; `finance-mock.ts:170` `THU_CHI_ROWS.unshift(voucher)`.
- `src/domains/warehouse/warehouse-domain.test.ts:44-56` — `duyetTraLK`/`traHang` asserted by mutating the in-memory `target` row.
- `src/domains/warehouse/mock-mutations.ts:16-19,31-33` — status flip is an in-place array write.
- `src/domains/repair/mock-mutations.test.ts:59` — `expect(MOCK_TICKETS.length).toBe(before - 1)` (delete asserted by array splice).
- 5 test files / 7 assertion sites grep-matched for `_ROWS|MOCK_TICKETS|.length).toBe|row.daTra` white-box coupling; broader `from '@/mock'`/`MOCK_TICKETS`/`_ROWS` import coupling appears in 15 test files.

**Suggested fix:** Split the gate honestly. (1) Tests that assert on mock internals are
*characterization tests of the mock* — they retire when a resource flips; say so and
budget the rewrite. (2) The real regression net must be **MSW-backed contract tests** that
assert observable behavior (query result shape, mutation → refetch), which the plan only
names for `khach-hang` (phase-01 step 1). Every flipped resource needs its own MSW
contract suite BEFORE the flip, or the "green suite" is theater. Re-baseline the "440"
number per phase; do not claim an unchanged count.

---

## F2 — CRITICAL — Settle-debt "one transaction" hides a lost-update race on `con_lai`; the plan's CHECK constraint converts it into hard user-facing failures

**Location:** phase-06 §Invariants lines 47-55, step 1 line 73-75, success criteria
lines 86-87; risk line 95.

**Flaw:** The plan specifies settle-debt as: read `cong_no`, `da_tra += amount`, recompute
`con_lai`, insert `chung_tu`, all in one transaction, with a CHECK `con_lai >= 0`. "One
transaction" is necessary but NOT sufficient for correctness under concurrency. If the
service reads `con_lai` into app memory, computes `new_con_lai = con_lai - amount`, and
writes it back, two concurrent settlements on the same receivable under READ COMMITTED
both read the same starting `con_lai` and the second overwrites the first (classic
lost update) — OR, if written as `da_tra = da_tra + :amount`, the CHECK fires and the
second transaction ROLLS BACK with a constraint violation surfaced to the cashier as a
raw 500. The mock hides this entirely because it is single-threaded and clamps with
`Math.min(input.soTien, row.conLai)` (finance-mock.ts:138) — there is no concurrency and
no failure path to design against, so the plan inherits a false sense of safety.

**Failure scenario:** Two cashiers (or a double-click / retry) settle the same ticket's
receivable. Under the naive read-modify-write, `da_tra` ends up incremented once instead
of twice (money lost) or the second request 500s with a constraint error and the client's
`maybeThrow`-style retry (the mock throws 3% by design, so retries WILL exist) re-posts,
creating a duplicate `chung_tu` thu voucher for a settlement that partially applied. The
plan's "rollback test" (step 1) only proves all-or-nothing within ONE transaction; it does
not test two concurrent transactions, which is where the money bug lives.

**Evidence:**
- `src/mock/finance-mock.ts:130-172` — settle is a synchronous read-modify-write with `Math.min` clamp and no locking/versioning; `maybeThrow(0.03)` at :132 proves the app already models transient failures and thus retries.
- `src/types/finance-types.ts:60` — `conLai` invariant `> 0 while listed`; a CHECK `>= 0` turns a concurrent over-settle into a rollback, not a clamp.
- phase-06:51-53 — the transaction spec never mentions row locking (`SELECT … FOR UPDATE`) or an atomic `SET con_lai = con_lai - :amount WHERE con_lai >= :amount` guarded write.

**Suggested fix:** Specify the write as a single atomic conditional UPDATE:
`UPDATE cong_no SET da_tra = da_tra + :amt, con_lai = con_lai - :amt WHERE id = :id AND con_lai >= :amt` and treat **0 rows affected** as "already settled / insufficient balance"
→ return a domain 409 with a VI message, NOT a CHECK-constraint 500. Add
`SELECT … FOR UPDATE` on the receivable at the top of the tx. Make settle **idempotent**
via a client-supplied idempotency key (unique on `chung_tu`) so retries after the 3%-style
transient failure cannot double-post. Add a concurrency test (two overlapping settles), not
just a rollback test.

---

## F3 — CRITICAL — Warehouse period-close has no defined behavior for concurrent voucher posts, partial close, or snapshot-vs-live drift; negative-stock races are undefined

**Location:** phase-05 §Architecture lines 47-58 (snapshot as read cache; "Tồn kho =
latest closed snapshot + since-snapshot delta"), Kỳ-close lines 57-58, risk lines 120-121.

**Flaw:** The plan's read model is "snapshot at Kỳ-close + sum of `stock_movement` since
that snapshot." It never defines the **isolation boundary of the close operation** against
in-flight voucher posts. Period-close reads all movements for the Kỳ, computes balances,
writes `stock_period_snapshot`, and marks the Kỳ immutable. If a voucher post commits a
`stock_movement` row for that Kỳ *between* the close's aggregation read and the immutability
flip, the snapshot is wrong (drifts from the live sum) and — worse — the plan says the Kỳ's
balances are now "immutable," so the drift is frozen and the carry-forward invariant
`tonDauKy(ky) = tonCuoiKy(prevKy)` (phase-05:32) silently breaks for every downstream
period. There is also no defined behavior for a **partial/failed close** (snapshot written
for some product×kho rows, process dies) — the read path can't tell a partial snapshot from
a complete one, so it returns wrong balances with no error.

**Failure scenario:** Admin runs period-close at month end while a warehouse clerk posts a
nhập-kho voucher. The close aggregates before the voucher's movement row commits; the
snapshot omits that stock; the Kỳ is frozen. Next period opens with `tonDauKy` short by the
voucher quantity, and every subsequent period inherits the gap — a permanent, silent
inventory shortfall. Separately, two clerks posting a xuất on the last unit of a product
race: both read "1 available" and both post, driving stock to -1. The plan says negatives
are "unclamped … as the mock allowed" (phase-05:35, warehouse-domain.test.ts:24-31) and
treats this as a *feature*, so there is no guard and no reconciliation — the negative is
accepted as truth.

**Evidence:**
- `src/domains/warehouse/mock-data.ts:82-89` — `tonDauKy` recomputes from k=0 every call; the mock has NO snapshot and NO concurrency, so the plan is inventing the snapshot/close semantics from nothing and there is no reference behavior to characterize.
- `src/domains/warehouse/warehouse-domain.test.ts:28-31` — negatives asserted as expected/allowed (`anyNegative === true`), which the plan carries forward as "unclamped," removing the natural guard against oversell races.
- phase-05:57-58 — "that Kỳ's balances are immutable" stated with no concurrency fence around the close; risk line 120-121 addresses double-*post* idempotency but NOT close-vs-post ordering or partial close.

**Suggested fix:** Define close as: `SELECT … FOR UPDATE`/advisory-lock the Kỳ, reject or
queue voucher posts targeting a Kỳ in `closing`/`closed` state (state machine on the Kỳ),
compute snapshot inside the same tx, flip to `closed` atomically. Make the snapshot write
all-or-nothing (single tx over all product×kho rows) so a partial close is impossible; add
a post-close assertion that `snapshot == live aggregation` as a gate (the plan lists it as a
success criterion at :103 but not as a close-time invariant check). Decide explicitly
whether xuất may drive stock negative under concurrency; if "yes" is truly intended,
document that oversell is unreconciled and out of scope, because "the mock allowed it" is
not a business rule — the mock has no stock at all.

---

## F4 — CRITICAL — Dual-run flip has a data-loss window: mock writes are module-memory-only and vanish at the flip; seeded id-preservation does not prevent it

**Location:** plan.md acceptance "rollback = remove from list, no code revert" (lines
108-109, 133), phase-01 seeder step 7 lines 112-113, every phase's flip step.

**Flaw:** The plan sells the flip as instant and reversible because the wire shape is
identical. But it traces only the *read* contract. On the *write* side, all mock mutations
live in module memory and are explicitly "lost on any page reload" — the seeder copies the
**original seed arrays** into Postgres, NOT the session's accumulated mock writes. So at the
moment a resource flips real, any records a user created/edited under the mock in that
session silently disappear from the real DB (they were never persisted anywhere durable),
and the seeder's `ON CONFLICT (id) DO NOTHING` (phase-01:113) means re-running the seed will
NOT resurrect them either. Rollback is equally lossy in the other direction: flipping back
to mock discards everything written to Postgres while real. The `id`-preservation the plan
relies on protects FK integrity of the *seed*, not the in-flight writes.

**Failure scenario:** Finance is mock; a cashier settles three receivables (mutating
`CONG_NO_ROWS` + unshifting three `THU_CHI_ROWS`) and creates two Phiếu Chi. Ops flips
finance to real mid-day. The three settlements and two vouchers evaporate — they were only
in browser module memory, never sent to a server. The receivables now show their *seed*
`con_lai` again (unpaid), and the customer is asked to pay twice. Nothing errors; the
"byte-identical wire shape" guarantee is fully satisfied while money is lost.

**Evidence:**
- `src/domains/repair/mock-mutations.ts:6-8` — "these writes live in module memory only — they are lost on any page reload; resetDemo() regenerates the seed identically."
- `src/domains/warehouse/mock-mutations.ts:2-4` — same durability note.
- `src/mock/masterdata/index.ts:94-101` — mock `create` uses `genId()` = `String(++_idCounter)` starting at 10000 (`index.ts:10-14`); these client-generated ids are session-local and never reconciled with the server's id space.
- `src/mock/finance-mock.ts:115,142,170` — settle-created vouchers get ids `tc-settle-N` from a module counter and are unshifted into a module array; nothing persists them.
- phase-01:113 — seeder is `ON CONFLICT (id) DO NOTHING` from `*_ROWS` only.

**Suggested fix:** State the invariant plainly in the plan: **the flip is safe only from a
clean state (post-`resetDemo` / fresh load) with no un-persisted mock writes.** Gate each
flip behind "no local mock mutations pending." Because the app is a demo/prototype today,
the honest position is: flips happen at deploy boundaries, not live during a user session;
document that any pre-flip mock activity is discarded. Also confirm the id space: mock
`create` yields integer-string ids from 10000; if Postgres uses serial/uuid PKs, define the
id strategy so client-created rows during real-run don't collide with seed ids (`"1".."N"`)
or with the `10000+` counter.

---

## F5 — HIGH — Repair status "denormalized cache in same transaction" prevents intra-row divergence but not concurrent-transition ordering divergence

**Location:** phase-04 §Architecture lines 41-44, risk line 102-103 ("a test asserts they
never diverge").

**Flaw:** The plan asserts the header `trang_thai_id` and the append-only
`repair_status_history` "never diverge" because both are written in one transaction. That
guarantees they agree *at commit of a single transition*. It does NOT guarantee the header
reflects the **latest** history row under concurrent transitions. Two transitions on the
same ticket committing in interleaved order (A: →Đã sửa xong(9), B: →Giao máy(10)) can
commit such that the header ends on A's status while history's newest row is B's, or
vice-versa, depending on commit order and isolation level. The mock cannot exhibit this
(single-threaded, in-place write at mock-mutations.ts:42-43), so the "never diverge" test —
if written the obvious single-threaded way — passes while the real system diverges.

**Failure scenario:** A technician marks a ticket "sửa xong" while a front-desk user marks
it "giao máy" simultaneously. Both transactions append their history row and set the header.
Header lands on status 9; history's newest is status 10 (or the reverse). The workspace list
(which reads the header cache, per phase-04:34) shows a status inconsistent with the audit
trail, and the state-machine's next-transition validation (phase-04:46-49) is evaluated
against a stale header, permitting an illegal transition.

**Evidence:**
- `src/domains/repair/mock-mutations.ts:42-53` — `updateTicketStatus` sets `t.tinhTrang` then appends history in one synchronous pass; no ordering/versioning; the header is trivially always "latest" only because it is single-threaded.
- `src/domains/repair/mock-mutations.ts:20-23` — `pushHistory` also stamps `updatedAt`; nothing enforces monotonicity across concurrent writers.
- phase-04:41-43,102 — "denormalized cache … same transaction … never diverge" — same-tx atomicity conflated with cross-transaction ordering.

**Suggested fix:** Make the header a *derived latest* under a lock: `SELECT … FOR UPDATE`
the `phieu_sua_chua` row at the start of any transition, validate the transition against the
locked current status, append history, set header — so concurrent transitions serialize and
the header is provably the newest. The divergence test must be a **concurrent** test (two
overlapping transitions), not a single-threaded one. Optionally derive header via
"latest history row" trigger to make divergence structurally impossible.

---

## F6 — HIGH — Money is `number` (JS float) across every finance/warehouse mock source; the "bigint end-to-end" claim requires a client-side type migration the plan omits

**Location:** plan.md D2 line 40, acceptance line 124 ("Money is VND `bigint` … DB → API →
client, no float"); phase-03:77, phase-05:34-35, phase-06:20.

**Flaw:** The plan claims bigint "end to end (DB → API → client)." Postgres `bigint`
serialized to JSON exceeds `Number.MAX_SAFE_INTEGER` only above ~9e15, so VND values are
practically safe as numbers — BUT the actual issue is the reverse: the plan asserts an
end-to-end bigint contract while every client type is `number` and the client does
arithmetic on those numbers (totals, sums, VAT). If the API sends bigint **as a string**
(the correct way to avoid precision loss, and what most Postgres drivers do for `bigint`),
the byte-identical-wire-shape guarantee (acceptance :107) BREAKS: the client expects
`soTien: number` and gets `soTien: "1500000"`, silently coercing in template strings but
producing `NaN`/string-concatenation in the client-side reductions the app performs. The
plan never resolves the bigint-JSON serialization format, yet stakes the "zero page-code
change" promise on it.

**Failure scenario:** Invoice composer sums lines client-side today
(`items.reduce((s, it) => s + it.thanhTien, 0)`, finance-mock.ts:347). Post-flip the API
returns `thanhTien` as a JSON string (driver default for bigint). The reduce becomes string
concatenation → `tongThanhTien = "450000450000"`; VAT/`tong_cong` are garbage; the "server
recomputes totals" safeguard doesn't help because the *list/display* path still trusts the
wire number. Or, if the API sends bigint as a JS number, values are fine but the plan's
"bigint end-to-end" claim is cosmetic, not real.

**Evidence:**
- `src/types/finance-types.ts:33` (`soTien: number`), `:58-60` (`soTien/daTra/conLai: number`) — all money is `number`.
- `src/mock/finance-mock.ts:295,347,364` — client-side money arithmetic (`reduce`, `+`) on those numbers; `tongThanhTien + tienThue` computed in the browser.
- `src/domains/warehouse/mock-data.ts:60` (`giaVon: number`), inventory `tongTien` derived by client math.
- plan.md:124, phase-03:77 — assert bigint DB↔API↔client without specifying JSON serialization (number vs string) or a client type migration.

**Suggested fix:** Pin the bigint JSON representation NOW (recommend: numbers for values
provably < 2^53, which all VND amounts are, so keep client `number` and document the
2^53 ceiling as acceptable). Then the "byte-identical" claim holds and no client type churn
is needed — but this must be an explicit decision, not an unstated assumption. If any value
could exceed 2^53, the client types must move to `bigint`/string and the "zero page-code
change" acceptance criterion is false and must be struck.

---

## F7 — HIGH — Server-side re-derivation of `CONG_NO`/`THU_CHI`/inventory from RNG-seeded arrays creates FK-orphan and value drift the seeder cannot preserve idempotently

**Location:** phase-06 step 2 line 76 ("seed from `finance-mock` preserving ids + FK to
repair (P4)/khach-hang (P3)"), phase-05 step 6 lines 90-93, phase-03 risk lines 84-87.

**Flaw:** The plan seeds finance/warehouse "from the existing `*_ROWS` arrays … preserving
id." But those arrays are **not stable seed data** — they are re-derived at import time from
other mock arrays via `SeededRandom` and by *filtering/slicing* `MOCK_TICKETS`. `CONG_NO`
takes `MOCK_TICKETS.filter(t => t.chiPhiThucTe > 0).slice(0, 60)` and mints ids `cn-sc-${t.id}`
(cong-no.ts:35-49). If Phase 4's repair seed drops, reorders, or filters tickets differently
than the mock's live-layer derivation (e.g. the KT-board ≥10-per-status probabilistic
generator shifts which tickets exist — a known fragility), the set of `cong_no` rows and
their `phieu_sua_chua_id` FKs change, orphaning receivables or pointing them at the wrong
ticket. `finance-mock.ts` *further* re-derives `branchId` via `rngTC.pick(BRANCHES)` for
non-ticket rows (finance-mock.ts:50,91) — a value that changes if branch order or RNG
seeding shifts, so re-running the seeder is NOT idempotent in the values, only in the ids.

**Failure scenario:** Phase 4 seeds `phieu_sua_chua` from `MOCK_TICKETS` (250). Phase 6
seeds `cong_no` expecting `cn-sc-<ticketId>` FKs to resolve. But `chiPhiThucTe > 0` filtering
differs by one row between the two seeders' snapshots → a `cong_no.phieu_sua_chua_id` points
to a ticket that wasn't inserted → FK violation on seed (best case, seed aborts mid-run) or,
if FK deferred, an orphan receivable no repair ticket backs. Re-seeding to "fix" it does
nothing because `ON CONFLICT (id) DO NOTHING` keeps the bad row.

**Evidence:**
- `src/mock/seed/cong-no.ts:33-49` — `CONG_NO` derived by `MOCK_TICKETS.filter(...).slice(0,60)`, ids `cn-sc-${t.id}`, FK-dependent on the exact repair set.
- `src/mock/finance-mock.ts:48-51,88-92` — `branchId` re-picked via `rngTC.pick`/`rngCN.pick(BRANCHES)` at import, so a value re-run is non-idempotent unless the RNG + array order are byte-stable.
- `src/mock/finance-mock.ts:67,105` — `tenKhachHang` for non-ticket rows re-picked via RNG, another non-stable value.
- Known fragility: the KT-board ≥10-per-status count is probabilistic (agent memory `phase1-kt-weighting-fragility`), so the ticket population feeding these derivations is not guaranteed stable across generator edits.

**Suggested fix:** Freeze the seed. Generate the finance/warehouse seed **once** into a
static fixture (JSON) captured from the current mock output, and seed the DB from that
frozen artifact — not by re-running `SeededRandom` derivations at seed time. Seed
`phieu_sua_chua` and `cong_no`/`chung_tu` from the SAME frozen ticket snapshot so FKs are
guaranteed to resolve. Make the seeder validate FK closure (every `phieu_sua_chua_id` in
`cong_no` exists) and FAIL loudly on orphan, rather than `ON CONFLICT DO NOTHING`, which
masks drift.

---

## F8 — HIGH — Permission-matrix state persisted in browser localStorage becomes an authority-confusion trap when the server becomes the enforcement source

**Location:** phase-02 §Client change lines 60-63 ("permission-store … stops being the
access gate … keeps its EDITOR role"), risk "Perms in JWT go stale" lines 116-118.

**Flaw:** Today the permission matrix is a Zustand slice persisted to localStorage
(`STORE_KEYS.permissions` = `pt-permissions`, permission-store.ts:99). Phase 2 demotes it to
a UX mirror + editor but KEEPS it persisted client-side, while the server becomes the real
gate and login embeds the effective set in the JWT. This creates two divergent sources of
permission truth on the client: the stale localStorage editor state and the fresh
server-issued set. On a role change, the JWT-embedded perms go stale until refresh
(the plan acknowledges this at :116-118), but the *localStorage* copy is even staler — it
survives logout unless explicitly cleared, so User B logging in on a shared kiosk can see
User A's persisted matrix render (menu nodes/buttons shown) until the server 403s the
action. The plan's "defense in depth" framing masks that the client now shows a UI that
contradicts what the server permits, and the persisted copy is not tied to identity.

**Failure scenario:** Admin edits roles in the editor (writes `pt-permissions`
localStorage), then a lower-privilege user logs in on the same browser. The persisted matrix
paints buttons the server will reject; user clicks, gets a 403 toast per action — confusing,
and every hidden-by-design admin action is briefly visible. Worse, if any residual code path
still reads the persisted store as truth (the plan only *demotes* it, doesn't delete it), a
stale localStorage entry silently re-grants UI access.

**Evidence:**
- `src/store/permission-store.ts:5` — "Persisted to localStorage; pure UI mock, no runtime enforcement."
- `src/store/permission-store.ts:8,39,99` — `persist(...)` with `name: STORE_KEYS.permissions`.
- `src/lib/store-keys.ts:15` — `permissions: 'pt-permissions'` persisted key.
- phase-02:60-63 — store demoted but retained + persisted; no step clears it on logout or ties it to `user_id`.

**Suggested fix:** The server-issued effective set (from the JWT/auth-store) must be the
ONLY source the render guards read; the persisted editor state must be namespaced by
`user_id` and CLEARED on logout (add to `resetDemo`/logout the `pt-permissions` key). Add a
test asserting no render guard reads the persisted permission store — only `auth-store`.
Treat the localStorage matrix purely as unsaved-editor scratch, never as an access signal.

---

## F9 — MEDIUM — Deployment seed is not proven reproducible because the seed source is RNG-derived at import; "fresh-DB reproducibility" CI can pass while prod differs

**Location:** phase-07 step 4 line 67, risk "Fresh-DB reproducibility" lines 96-97;
phase-01 seeder line 112-113.

**Flaw:** Phase 7 claims reproducibility is proven by "CI spins a clean Postgres, runs
migrations + seed, runs the backend suite." But the seed arrays are computed from
`SeededRandom` at module import (finance-mock.ts:45,86,251; mock-data.ts:55,73). Determinism
holds ONLY if the RNG algorithm, seed constants, and source-array *order* are byte-identical
between the CI build and the production build. Any dependency bump, tree-shaking change, or
edit to an upstream array (which reorders `.map`/`.slice` inputs) shifts the derived data —
so CI seeds dataset X, prod seeds dataset X' from the same code at a different commit, and
"reproducible" is only within a single build, never across the migration timeline the plan
spans (7 phases, many edits). The plan's rollback story ("remove from `VITE_REAL_RESOURCES`",
phase-07:98-99) also has no DB rollback: once real data is written, flipping the flag back to
mock strands that data with no migration-down path defined.

**Failure scenario:** Phase 3 edits an upstream lookup array's order (adds a row). Every
downstream RNG-derived seed shifts. The prod DB, seeded at the Phase 7 commit, contains
different demo rows than the Phase 1 CI run validated. A report aggregation test that passed
in CI (asserting a specific status distribution, phase-07:61) now mismatches prod data.
Because there is no forward-only migration for seed *data* (only schema), and no down
migration, there is no clean rollback — only a destructive re-seed.

**Evidence:**
- `src/mock/finance-mock.ts:45,86,251` — module-level `new SeededRandom(...)`; `src/domains/warehouse/mock-data.ts:55,73` — per-index RNG.
- `src/mock/seed/cong-no.ts:24,33` — RNG + `MOCK_TICKETS.filter().slice()` derivation order-dependent.
- phase-07:96-97 — reproducibility claim scoped to "a clean Postgres … every build," which proves within-build, not across-commit determinism; no data-migration/rollback path is specified.

**Suggested fix:** Same as F7 — freeze seed data to a versioned static fixture checked into
the repo; the seeder loads the fixture, never re-runs RNG at seed time. Then reproducibility
is a file hash, not a hope. Define seed data as versioned, forward-only migrations with an
explicit "this run replaces demo data" flag, and document that flag-flip rollback does NOT
roll back committed DB writes (the plan's "instant rollback" claim is read-path only).

---

## F10 — MEDIUM — `filters` allowlist is asserted per-resource but the current wire contract is a permissive substring/exact-match the tests encode; a strict allowlist silently changes list results and can fail characterization

**Location:** plan.md verified-correction #4 lines 62-63, phase-01 §Server lines 63-66 +
step 2 line 101, acceptance line 118.

**Flaw:** The plan correctly flags `filters` (`Record<string, unknown>`) as an injection
gate and mandates a per-resource column allowlist. But the *current* mock semantics are:
search matches ANY string field case-insensitively (`applyParams`, index.ts:31-38) and
filters do a stringified exact match on ANY key (index.ts:41-49). The characterization tests
(the plan's step-1 safety net) lock THESE permissive semantics. A strict server allowlist
that rejects/ignores non-allowed columns will produce DIFFERENT list results for any page
that currently passes a filter key not on the (yet-undefined) allowlist — so either the
characterization test fails (blocking the flip) or the allowlist must be reverse-engineered
to exactly match every key any page sends, which the plan does not enumerate. The security
fix and the "byte-identical behavior" goal are in direct tension and the plan doesn't
reconcile them.

**Failure scenario:** A repair-list page sends `filters: { nhaSanXuat: 'X', model: 'Y' }`
(22-field filter set per phase-04:82). The Phase 1 allowlist, defined for `khach-hang`, is
copied without enumerating repair's 22 fields; `model` is omitted; the server silently drops
it; the list returns MORE rows than the mock did; the page shows unfiltered data. No error —
just wrong results, and the characterization test (if it only covered `khach-hang`) never
catches it.

**Evidence:**
- `src/mock/masterdata/index.ts:31-49` — permissive search (any string field) + exact-match filter on any key; this is the behavior the characterization tests pin.
- `src/hooks/use-crud.ts:69-72` — `filters` passed through opaquely as `Record<string, unknown>`; no client-side allowlist.
- phase-04:82 — repair list has a "22-field filter allowlist"; phase-01 only defines the allowlist mechanism for `khach-hang`, leaving 38+ resources' allowlists unspecified.

**Suggested fix:** For EACH resource, derive the filter allowlist from the actual keys its
page/config sends (enumerate them from `src/config/**` and the filter panels), not from a
generic template. Decide the mismatch policy explicitly: unknown filter key → 400 (fail
loud, forces completeness) is safer than silent-ignore (which changes results invisibly).
The characterization test per resource must assert the allowlist covers every key the page
emits, or the security fix will silently corrupt list results.

---

## Cross-cutting observation (not a numbered finding)

The plan's foundational lever — "every entity flows through `MockApi<T>` and the flip is
byte-identical" — is verified TRUE for the **read** path (`use-crud.ts:74-79`,
`makeMockApi.list`). It is FALSE for the **write/mutation** path, which is where F1, F2,
F4, F5, and F8 concentrate: bespoke mutations (settle, status-transition, period-close,
voucher-post) do NOT go through `MockApi<T>` — they are direct module-array mutations
(finance-mock.ts, repair/mock-mutations.ts, warehouse/mock-mutations.ts) with no wire
contract, no concurrency model, and no persistence. The plan's confidence is calibrated to
the CRUD read seam and over-generalized to the transactional write surfaces that are the
actual risk. Every "flip + 440 green" claim should be re-scoped to acknowledge the write
path has no existing contract to preserve.

## Unresolved questions

1. Bigint JSON serialization: numbers (accept 2^53 ceiling) or strings (client type
   migration)? This decides whether "zero page-code change" is achievable. (F6)
2. Is the flip permitted during a live user session, or only at deploy boundaries from a
   clean state? The answer determines whether F4 is a documented constraint or a real bug. (F4)
3. What is the id strategy for rows created under real-run — serial/uuid/preserved-string —
   and does it collide with the mock's `10000+` counter or the `"1".."N"` seed ids? (F4)
4. Is negative stock under concurrent xuất a real business rule or a mock artifact the plan
   is wrongly canonizing? (F3)
5. Are `phieu_sua_chua` (P4) and `cong_no`/`chung_tu` (P6) seeded from ONE frozen ticket
   snapshot, guaranteeing FK closure? (F7)

Status: DONE — 10 findings (4 Critical, 4 High, 2 Medium); the plan's "440-green flip" gate
and "instant rollback" both fail on the transactional write path, which never went through
the `MockApi<T>` seam the plan is built on.
