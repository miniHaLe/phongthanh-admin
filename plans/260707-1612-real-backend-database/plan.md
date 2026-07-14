---
title: "Real Backend + Database (NestJS + Postgres + Drizzle)"
description: "Turn the 100%-mock React SPA into a real deployable product: NestJS + Postgres + Drizzle backend + real JWT auth + server-side RBAC (closes the no-enforcement limitation) + multi-branch isolation. Ships in two releases: v1 = auth + RBAC + CRUD + repair + reports + deploy (warehouse/finance stay mock behind a dev-only flag); v2 = the net-new stock_movement ledger + finance transactions. Migrated incrementally, TDD."
status: in-progress
priority: P1
branch: ""
tags: [backend, database, nestjs, postgres, drizzle, auth, rbac, tdd, migration, security]
blockedBy: [260713-1817-fullstack-live-review-remediation]
blocks: []
created: "2026-07-07T10:25:36.634Z"
createdBy: "ck:plan"
source: skill
---

# Real Backend + Database (NestJS + Postgres + Drizzle)

## Overview

The app is a Vite + React 18 + TS SPA that is **100% mock/in-memory** — its #1
documented limitation. This plan adds a real deployable backend + database, closing
the mock-only (#1) and permission-no-enforcement (#2) limitations.

**The seam — with its verified LIMIT.** ~37 config-backed CRUD entities flow through
ONE interface, `MockApi<T>` (`src/types/crud-types.ts:52`), consumed via
`CrudConfig.mockApi` + `useCrud` (`src/hooks/use-crud.ts:76`). For those, a real
`makeHttpApi<T>` drops in behind the interface and the page is unchanged. **BUT** the
high-value core — repair (`src/domains/repair/*`), warehouse
(`src/domains/warehouse/list-fetchers.ts`), finance (`src/mock/finance-mock.ts`),
reports — reaches data through **bespoke fetchers + exported mutation functions**, NOT
`MockApi<T>`. **52 runtime files bypass the seam** (`grep -rln 'import.*\(MOCK_\|_ROWS\)'
src/pages src/features src/domains | grep -v .test` = 52). Those phases are **bespoke
endpoint + client rewires**, not config-line flips. The plan is honest about which is
which (red-team correction, 2026-07-07).

Brainstorm (approved, adversarially verified):
[`../reports/brainstorm-260707-1618-real-backend-database-architecture-report.md`](../reports/brainstorm-260707-1618-real-backend-database-architecture-report.md)
· Entity/endpoint map:
[`../reports/workflow-subagent-260707-1618-backend-entity-endpoint-map-report.md`](../reports/workflow-subagent-260707-1618-backend-entity-endpoint-map-report.md)

## Release strategy (red-team scope split, 2026-07-07)

- **v1 (ship first) = Phases 1-4 + v1 reports + deploy.** Delivers a real, enforced,
  multi-tenant product: auth, server-side RBAC, ~37 CRUD entities, the repair workspace,
  the reports that read only real tables (status/KPI), and a deployed instance.
  **Warehouse + finance stay on mock behind the dev-only flag** and are NOT user-reachable
  in the v1 deploy (see Finding 7 — no partially-enforced prod).
- **v2 = Phases 5-6 + reports completion.** The net-new `stock_movement` ledger + voucher
  entry + finance transactions, then the two reports that depend on them (Máy tồn,
  SCBH cost).

## Locked decisions (brainstorm 260707 + red-team 260707)

- **D1 — Stack:** NestJS + Postgres + **Drizzle** + own auth (JWT access + httpOnly
  refresh). REST contract mirrors `ListParams`→`PagedResult<T>`. **Repo shape: sibling
  `api/` dir, NOT a monorepo move** (red-team Finding: moving `src/`→`apps/web` risks the
  440 tests for the sake of ~4 shared types; keep `src/` in place, copy/re-export the
  wire types into `api/`).
- **D2 — Money:** VND stored as **`bigint` in Postgres**, transported on the wire as a
  **JSON string** (revised from "bigint end-to-end" — every client money field is
  TypeScript `number`, and JSON `number` truncates above 2^53). Client money types
  migrate `number`→`string` + arithmetic sites updated. Money is explicitly CARVED OUT of
  the byte-identical wire guarantee.
- **D3 — Warehouse (v2):** **full build** — real `stock_movement` ledger + voucher-entry
  UI + `stock_period_snapshot` at Kỳ-close. Kept as locked (audit-correct, matches the
  legacy Kỳ accounting). Deferred to v2; NOT a port (mock inventory is RNG-fabricated).
- **D4 — Branch scope:** multi-branch users + `toàn hệ thống` super-scope; every scoped
  query = `WHERE branch_id IN (:userBranches)` from the JWT; **empty set ⇒ DENY, never
  all** (Finding 4). **Branch-id namespace must be reconciled first** — the code has three
  conflicting namespaces (`dak-lak`… in `branches.ts:6`, `cn-1`… in `chi-nhanh.mock.ts:14`,
  literal `'all'` default in `app-store.ts:20`) — Phase 1 spike reconciles to one canonical
  `chi_nhanh.id`.
- **D5 — Approach:** TDD, Khách hàng vertical slice first, dual-run per-resource flag
  (**dev/CI-only, never a user-reachable partial-enforcement deploy**), seed from FROZEN
  fixture snapshots (not RNG re-derivation).

## Security gates (red-team — all mandatory, day one)

1. **Sort-column allowlist** — `sort` is a free-form client string
   (`src/hooks/use-crud.ts:36`) interpolated into `ORDER BY <col> COLLATE …`; Drizzle
   doesn't parameterize identifiers → SQL injection / schema leak. Per-resource sort-column
   allowlist + `dir` enum; unknown → 400 VI message. (Phase 1 acceptance.)
2. **Filter-column allowlist, branch never filterable** — `filters: Record<string,unknown>`
   (`use-crud.ts:22`) toward a WHERE clause; the mock filters ANY key
   (`src/mock/masterdata/index.ts:41-49`). Per-resource filter allowlist; `branch_id`/
   `chiNhanhId` NEVER on any allowlist; JWT branch predicate is a non-negotiable trailing
   `AND`; unknown key → 400 (fail loud, not silent-ignore). (Phase 1.)
3. **Identity response DTO — no secret leak** — mock `list`/`get` return the full entity
   (`index.ts:68,89`); `NguoiDung.password` (`src/types/masterdata-types.ts:197`) would
   serialize through generic CRUD. Deny-by-default column projection; explicit response
   DTOs; a contract test asserts no secret field appears on any response. (Phase 2.)
4. **Guard completeness** — a test enumerates all non-CRUD routes; each MUST carry an
   explicit `@RequirePermission`; CI fails if any special-action route lacks one (else it
   ships public under the method→verb fallback). (Phase 2.)
5. **Dual-run is not a deploy mode** — a build guard fails the prod build unless
   `VITE_REAL_RESOURCES` = all v1 resources (mock bundle excluded from prod). Mock login
   accepts any creds (`src/pages/auth/LoginPage.tsx:39`) + mock data is unguarded array ops
   → no partially-enforced environment may be user-reachable. (Phase 1 + 7.)

## Concurrency & integrity gates (red-team — the write path never went through the seam)

- **Settle-debt** (`finance-mock.ts:130` is a single-threaded read-modify-write): atomic
  guarded UPDATE (`WHERE con_lai >= :amt`, 0-rows → domain 409), `SELECT … FOR UPDATE`,
  idempotency key. (Phase 6.)
- **Repair status** (header `trang_thai_id` cache vs append-only history): `SELECT … FOR
  UPDATE` the ticket per transition; a concurrent-divergence test, not just same-tx. (P4.)
- **Warehouse period-close**: Kỳ state machine + lock; reject posts to a closing Kỳ;
  all-or-nothing snapshot; close-time `snapshot == live` assertion. (Phase 5, v2.)
- **Seed FK closure**: freeze ONE static ticket-snapshot fixture; seed repair (P4) and
  finance (P6) from it; validate FK closure + fail loud (the mock's `CONG_NO` is a
  probabilistic `MOCK_TICKETS.filter(...).slice(0,60)`, `cong-no.ts:33`).

## Testing reality (red-team Finding 2 — the "440 stay green" gate is false)

The 440-test suite is white-box: it asserts in-memory array identity
(`finance-mock.test.ts:28`, `mock-mutations.test.ts:59`, `warehouse-domain.test.ts:44`)
and pins `Math.random=()=>0.999` to suppress the mock's 5% throw (`src/test/setup.ts:24`).
These tests **characterize the mock and must retire on flip** — they cannot pass against
real HTTP. So:
- The regression gate is **MSW-backed contract tests per resource** written BEFORE each
  flip (assert the exact wire shape + real 401/403/409/timeout paths the mock never
  exercised), NOT "the existing 440 stay green."
- Re-baseline the test count per phase; don't claim the mock suite as backend proof.

## Phases

| Phase | Rel | Name | Status |
|-------|-----|------|--------|
| 1 | v1 | [Backend skeleton + auth + Khách hàng vertical slice](./phase-01-backend-skeleton-auth-khach-hang-vertical-slice.md) | ✅ Completed (2026-07-08) |
| 2 | v1 | [Real permission enforcement + identity](./phase-02-real-permission-enforcement-identity.md) | Pending |
| 3 | v1 | [Simple CRUD fan-out (~37 config entities)](./phase-03-simple-crud-fan-out.md) | Pending |
| 4 | v1 | [Repair workspace endpoints (bespoke rewire)](./phase-04-repair-workspace-endpoints.md) | Pending |
| 5 | v2 | [Warehouse stock-movement ledger (BUILD)](./phase-05-warehouse-stock-movement-ledger.md) | Pending |
| 6 | v2 | [Finance: chứng-từ, công-nợ, invoices (BUILD)](./phase-06-finance-chung-tu-cong-no-invoices.md) | Pending |
| 7 | v1+v2 | [Reports + deployment](./phase-07-reports-deployment.md) | Pending |

Dependency chain: **v1:** 1 → 2 → 3 → 4 → 7(v1 subset: status/KPI reports + deploy).
**v2:** (5, 6) after 4 → 7(v2 subset: Máy-tồn/SCBH reports). 6 depends on 4+5.

## TDD contract (per phase, `--tdd`)

1. **Characterization** — lock the CURRENT mock wire behavior the migration must preserve
   (the `PagedResult` shape, vi-sort order, filter semantics) via MSW — NOT the white-box
   mock unit tests (which retire on flip).
2. **Failing backend spec** — endpoint→status, permission-denied→403, branch-forgery→scoped,
   sort/filter-allowlist→400, secret-field-absent, concurrency (lost-update, divergence).
3. **Implement** until green.
4. **Per-resource contract gate** — the MSW contract test for the flipped resource stays
   green; re-baseline the frontend suite (retiring the mock white-box tests it replaces).

Backend: Jest/Vitest + supertest + a throwaway Postgres (testcontainers or test schema).

## Acceptance criteria (plan level)

- [ ] For the ~37 CRUD entities: `makeHttpApi<T>` satisfies `MockApi<T>`; a migrated CRUD
      page needs only the `apiFor()` config line. For repair/warehouse/finance/reports:
      bespoke endpoints + client rewire (NOT a config flip) — budgeted as such.
- [ ] Per-resource dual-run flag flips mock↔real; **dev/CI-only** — a build guard blocks a
      prod build that isn't fully real for its release.
- [ ] Server owns `id`/`createdAt`/`updatedAt`/`active` + vi-collation sort with a
      **sort-column allowlist** (unknown → 400).
- [ ] **Filter-column allowlist** per resource; `branch_id` never filterable; JWT branch
      predicate is a hard trailing AND; `filters[branch_id]=other` → empty.
- [ ] Real JWT auth (access + httpOnly `Secure; SameSite=Strict; Path=/auth/refresh`
      refresh, rotation + reuse-detection + family revocation, CSRF on the cookie route);
      permission matrix ENFORCED (403); UI matrix is a mirror. Guard-completeness test.
- [ ] Identity endpoints use response DTOs; **no secret column ever serialized** (test).
- [ ] Branch-id namespace reconciled to one canonical `chi_nhanh.id`; multi-branch +
      super-scope; empty set ⇒ deny.
- [ ] Money: `bigint` in DB, **string on the wire**, client money types migrated; a value
      > 2^53 round-trips exactly (test).
- [ ] RBAC seed = an **authored, code-reviewed least-privilege** `role_menu` +
      `menu_function` matrix (NOT "round-tripped from the mock" — the cells live only in
      browser localStorage and are menuId-keyed UI slugs; that source does not exist).
- [ ] `CURRENT_USER` bypass removed — server stamps `createdBy`/`nguoiLap` from the JWT
      (`grep 'CURRENT_USER' src` = ~13 runtime files).
- [ ] Seed from frozen fixtures (FK-order, preserve id, idempotent, FK-closure validated);
      super-admin role + admin user ship.
- [ ] Concurrency-safe: settle-debt, status-transition, period-close (v2) use row locks /
      guarded updates; lost-update + divergence tests.
- [ ] Persisted permission matrix (`pt-permissions`) namespaced by user + cleared on
      logout; render guards read ONLY the server set.
- [ ] **v1 ships** (auth + RBAC + CRUD + repair + status/KPI reports + deploy) with
      warehouse/finance excluded from the prod bundle; **v2** adds the ledger + finance +
      remaining reports.
- [ ] No secrets committed; docs' mock-only + no-enforcement honesty flags updated to
      "resolved" only for what actually shipped (per release).

## Out of scope

- Rewriting the React UI beyond the CRUD `apiFor()` wiring + the bespoke
  repair/warehouse/finance rewires + the money type migration.
- New product features not present in the mock.
- Multi-currency (VND only).
- The monorepo move (rejected — sibling `api/` instead).

## Open decisions (resolved in-phase)

- **Hosting target** — Phase 7 (v1 deploy).
- **Is any menu a real "role holder," or is `nhóm-quyền` the sole role?** — Phase 2.
- **Repair status-transition graph** — no transition rules exist in code
  (`grep 'transition' src/domains/repair/status.ts` = 0); Phase 4 must obtain the allowed
  graph from product/legacy, and where uncertain, **allow + log, don't invent blocking 409s**
  that break current free-transition flows.
- **Are `tonKhoApi`/`nhapKhoApi` config entries live or dead?** — the Xem Tồn Kho page
  reads bespoke `fetchInventory` (`XemTonKhoPage.tsx:128`), not `tonKhoApi`; confirm the
  config-backed inventory tables are dead code before Phase 3 wastes effort on them.

## Red Team Review

### Session — 2026-07-07 (4-lens adversarial panel: Security / Failure-Mode / Assumption / Scope)

Reports: `reports/from-code-reviewer-to-planner-red-team-{security-adversary,failure-mode-analyst,assumption-destroyer,scope-complexity-critic}-plan-review-report.md`.
34 raw findings → deduped to 15 → **14 accepted, 1 rejected.**

**Severity:** 5 Critical, 8 High, 1 Medium accepted.

| # | Finding | Sev | Disposition | Applied |
|---|---------|-----|-------------|---------|
| 1 | Seam covers ~37 CRUD only; 52 files bypass it → "zero page change" false for the domain core | Critical | Accept | Overview, Phases 3/4/5/6/7 |
| 2 | "440 tests stay green" false — white-box, array-identity, `Math.random` pinned | Critical | Accept | Testing reality; TDD contract |
| 3 | Byte-identical wire leaks `NguoiDung.password`; preserves SELECT*/arbitrary-filter/sort | Critical | Accept | Security gate 3; Phase 2 |
| 4 | RBAC seed source doesn't exist (localStorage-only, menuId-keyed UI slugs) | Critical | Accept | D5; Phase 2 (authored seed) |
| 5 | Branch-id namespace conflict breaks JWT scoping | Critical | Accept | D4; Phase 1 spike |
| 6 | Concurrency: settle lost-update / period-close race / status divergence | High | Accept | Concurrency gates; P4/P5/P6 |
| 7 | Dual-run = data-loss window + partial-enforcement if deployed | High | Accept | D5; Security gate 5 |
| 8 | Money `number` client contradicts bigint | High | Accept | D2 (string on wire) |
| 9 | Sort column → ORDER BY SQL injection (no allowlist) | High | Accept | Security gate 1; Phase 1 |
| 10 | `ton-kho` config dead; Phase 3/5 collide | High | Accept | Open decisions; Phase 3 |
| 11 | Seed FK-orphan drift (probabilistic ticket filter) | High | Accept | Concurrency/seed gate |
| 12 | Repair transition graph doesn't exist; P4 invents 409s | High | Accept (softened) | Open decisions; Phase 4 |
| 13 | Persisted permission matrix → authority confusion | Medium | Accept | Phase 2 |
| 14 | `CURRENT_USER` bypass → spoofable audit authorship | Medium | Accept | Acceptance; Phase 2 |
| 15 | Cited source reports missing | High | **Reject** | Verified present (`../reports/`, 10KB+19KB) — reviewer checked the wrong dir |

### Whole-Plan Consistency Sweep

Re-read plan.md + all 7 phase files after edits. Decision deltas applied: v1/v2 split,
money-string, sibling-api (not monorepo), authored RBAC seed, dual-run dev-only, sort+filter
allowlists, identity DTO, concurrency locks, frozen-fixture seed, transitions allow+log,
corrected CRUD count (~37 not 44/39), dead ton-kho config flagged. No stale "bigint
end-to-end", "440 stay green", "monorepo", or "round-trip from mock" claims remain. Phase
dependencies reflect the v1/v2 release boundary. **0 unresolved contradictions.**

## Validation Log

### Session — 2026-07-07 (critical-questions interview)

Red Team Review already present with file:line verification → skipped the re-verification
pass per the validate guard. Resolved two open decisions from code, locked four via interview.

**Resolved from code:**
- **`tonKhoApi`/`nhapKhoApi` config = DEAD** — no page imports `finance-tables/ton-kho`;
  Xem Tồn Kho uses bespoke `fetchInventory` (`XemTonKhoPage.tsx:128`). Excluded from Phase 3;
  belongs to Phase 5's ledger.
- **Role holder = `nhóm-quyền`** — `menuTreeChecked` is keyed by roleId (`role-1`,
  `permission-store.test.ts:21`), `functionMatrixChecked` by menuId. Confirms the two-level
  `role_menu` + `menu_function` model (Phase 2). The "is a menu a role holder?" open question
  is resolved: no — menu sits between role and cells.

**Locked via interview:**
- **V1 — Hosting:** **Single VPS + docker-compose** (api + Postgres + nginx). Phase 7 targets
  this; CI builds + deploys to the VPS; secrets via the host's env/secret file, not committed.
- **V2 — Negative stock:** **Warn, don't block.** The v2 ledger allows a voucher that drives
  on-hand negative but logs/flags it (matches the mock's permissiveness; avoids blocking
  out-of-order entry). Removes the "confirm with product" caveat in Phase 5 — this IS the
  product answer.
- **V3 — Repair transitions:** **Allow + log all.** Preserve free-transition behavior, record
  an audit trail, never reject. Confirms Phase 4's softened approach as final (no blocking 409s
  invented).
- **V4 — Auth bootstrap:** **Seed super-admin + env-set initial password**
  (`INITIAL_ADMIN_PASSWORD`), **forced change on first login**. No hardcoded secret; reproducible
  on a fresh VPS deploy. Phases 1-2.

**Whole-plan consistency sweep:** re-read plan.md + all 7 phases after propagation. The four
decisions removed prior ambiguity (hosting "TBD", negative-stock "confirm with product",
transition uncertainty, bootstrap unspecified) without contradicting any red-team decision.
**0 unresolved contradictions.**

## Dependencies

Consumes (read-only) the completed parity corpus in
`plans/260703-1908-reference-ui-parity-tdd/` and the comparison doc-set in `docs/`.
Both source plans are `completed` — no blocking relationship.

**Blocked by `260713-1817-fullstack-live-review-remediation` (2026-07-13):** its Phase 3
hardens the shared CRUD engine (filter-value validation, Postgres 23505/23503 → 409/400
mapping incl. DELETE, `id ASC` pagination tiebreaker, ILIKE escape) — land those in
`api/src/crud/crud.service.ts` BEFORE this plan's Phase 3 fans the engine out to ~37
resources. Handoff notes for this plan's Phase 2: (a) the server-side `mustChangePassword`
guard + client JWT-claim gate land in the remediation plan's Phase 3 — do not re-plan them
here, extend them to RBAC; (b) `khach_hang.branch_id` has two conflicting semantics
(creator-branch stamp at `khach-hang.resource-config.ts` vs province-derived seed at
`seed/branch-map.ts`) — the remediation plan documents the decided rule; consume it, and
the stale comment at `crud.service.ts:164-166` is removed there. Both plans touch
`auth.controller.ts` and `crud.service.ts` — do not run their API phases in parallel.
