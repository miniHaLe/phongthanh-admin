---
title: "Real Backend + Database Architecture — Brainstorm"
date: 2026-07-07
type: brainstorm
status: approved
mode: ultracode
handoff: /ck:plan (default)
scope: production-intent backend + DB for the Phong Thanh React SPA
verified_by: adversarial architecture review (3 findings corrected)
---

# Real Backend + Database — Architecture Brainstorm

## 1. Problem statement

The app is a Vite + React 18 + TS SPA, **100% mock/in-memory** (no backend, no DB) —
the #1 documented limitation. User wants a **real deployable product** backend +
database. Purpose: this is meant to become the actual system, so it needs real auth,
real permission enforcement (closing limitation #2), migrations, and hosting.

## 2. The decisive asset: a clean uniform seam

Verified in `src/types/crud-types.ts` + `src/hooks/use-crud.ts`: **every entity's data
access goes through one interface** — `MockApi<T> = { list, get, create, update,
remove }` — produced by `makeMockApi()`. Pages and TanStack Query hooks touch nothing
else. `ListParams`/`PagedResult<T>` are flat + JSON-serializable.

**Consequence:** a real `makeHttpApi<T>` with the identical signature drops in behind
the same interface. Pages, query keys (`[resourceKey, params]`), and mutations are
byte-identical across the switch. This is the migration lever — it makes per-entity,
dual-run, instant-rollback migration possible. **This is the most trustworthy part of
the whole plan** (verifier confirmed).

Real config surface: **~39 config-backed CRUD tables** (28 `crud-configs/` + 11
`finance-tables/`) + the bespoke domains — not "44/23" as first estimated.

One friction point (real, mechanical): the field is named `config.mockApi` and typed
against `@/mock/seed`. Seam-swap = rename `mockApi`→`dataApi` + relocate the type
across ~39 configs. Not free, but low-risk and scriptable.

## 3. Recommended stack — Option B (verified)

**Primary: self-hosted Node API (NestJS) + Postgres + Drizzle ORM + own auth
(JWT access + httpOnly refresh), exposing the REST contract the SPA already speaks.**

| Why B over Supabase (runner-up) | |
|---|---|
| This is **not a CRUD app** — 44 CRUD + ~44 domain modules with real sequenced logic (15-status repair workflow, inventory carry-forward, per-ticket receivables, VAT invoices). That logic wants to live in typed, testable **app code**, not SQL/RLS. | |
| The **202-permission matrix** is an RBAC action model, a poor structural fit for Postgres RLS (row-ownership). Middleware guards express it far more cleanly. NestJS's guard/interceptor structure is a natural home. | |
| PostgREST does **not** swap cleanly onto `list(params)` — the app's "search any string field" + free-form `filters` + vi-collation need a hand-written adapter + per-table search config either way. B is genuinely cleaner. | |
| **Pick Supabase instead only if** you must ship in ~2 weeks with a tiny ops team and accept modeling permissions + warehouse math around RLS + DB functions. |

**Runner-up decision (yours):** Drizzle vs Prisma is a genuine toss-up — pick on team
familiarity. (The "Drizzle expresses warehouse math better" argument is weak because,
per §5, there IS no existing math to preserve.)

## 4. Database shape (grounded in the mock)

Full entity+endpoint map:
[`workflow-subagent-260707-1618-backend-entity-endpoint-map-report.md`](./workflow-subagent-260707-1618-backend-entity-endpoint-map-report.md).

- **~39 simple CRUD tables** — catalog, location, customer (self-FK `dai_ly_id`), HR.
  All share `BaseEntity` (id/created_at/updated_at/active) + `branch_id` where scoped.
  Map ~1:1 to the `MockApi<T>` contract.
- **Bespoke aggregates:** repair (ticket header + status-history + dispatch-log +
  parts child tables); finance (chứng-từ 12-type, công-nợ per-ticket with invariant
  `con_lai = so_tien − da_tra`, hóa-đơn + VAT); warehouse (see §5 — the hard one).
- **Cross-cutting:** users/roles/permissions (§6), branches as tenant dim, audit cols.
- **Must-configure, not automatic:** `vi-x-icu` ICU collation + `unaccent` for
  Vietnamese sort/search; money as VND integer vs numeric (decide — affects every
  finance/warehouse column); soft-delete via `active`.

## 5. ⚠️ The corrected scope — warehouse + finance are NET-NEW, not "port"

**This is the single most important finding, and it corrects the optimistic framing.**

The adversarial review read `warehouse/mock-data.ts` + tests in full and proved:
- The displayed inventory is **fabricated from a seeded RNG** — `tonDauKy(ky)` re-runs
  a chain from k=0 on every call; `deltaFor()` reseeds a fresh RNG per call. **There is
  no ledger, no stored deltas, no source documents.**
- The mutations flip **status flags** on a *different* set of rows — they don't move
  stock. Display and mutations are two disconnected systems.

**Implication:** you cannot "port" warehouse logic — there's nothing transactional to
port. A real product must **build a `stock_movement` ledger** (every nhập/xuất/chuyển
voucher line writes a row) as the source of truth, plus a `stock_period_snapshot`
written at Kỳ-close (the mock's `InventoryRow` shape becomes a read-cache).
**On go-live the warehouse numbers change** (real vouchers, not RNG), and this needs
voucher-entry UI that **doesn't exist in the mock at all.** Finance is similar — needs
real settle-transactions + per-ticket receivables tied to repair, not display shapes.

**Where the multi-week time actually goes:** the 39 CRUD tables are a low-risk
mechanical fan-out. The warehouse/finance/auth third is a net-new ledger + authz build.
Plan must label these **"build," not "migrate,"** with their own design spike.

## 6. Real permission enforcement (closes limitation #2) — corrected model

The 202-checkbox matrix (~41 groups × {Xem/Thêm/Sửa/Xóa} + ~38 special actions) IS a
clean `(group, verb)` RBAC vocabulary → ~200 permission rows, linear, no RLS explosion.

**Two corrections the verifier caught (both real schema gaps):**
1. **The store is keyed by `menuId`, not `roleId`.** `functionMatrixChecked` binds cells
   to a *menu* record; `menuTreeChecked` is keyed by role. Real model is two-level:
   `role_menu(role_id, menu_id)` + `menu_function(menu_id, verb)`; effective permissions
   = the join. Getting this wrong silently mis-assigns permissions on seed migration.
2. **The guard is NOT purely table-driven.** 4 CRUD verbs map from HTTP method
   (GET→view, POST→create…) — ~164 cells. The ~38 special actions (`dieu-phoi-ky-thuat`,
   `doi-tinh-trang`, `xuat-ton-excel`…) need explicit `@RequirePermission(...)`
   annotations per bespoke endpoint. It's "one guard + ~38 annotated routes," not "one
   guard, done."

**Branch scoping (real tenant isolation):** allowed branch set comes from the user's
**token, not a request header** — middleware injects `WHERE branch_id IN (:userBranches)`.
A user cannot read another branch's data even by forging `X-Chi-Nhanh`. Non-negotiable.

**`filters` is an injection gate (hard, day one):** the wire field is
`Record<string, unknown>` passed toward a WHERE clause. Server MUST enforce a
per-resource **filterable-column allowlist**. Not a footnote — a security gate.

## 7. Migration strategy (incremental, dual-run, instant rollback)

1. Backend skeleton: Postgres + auth (JWT+refresh) + generic CRUD router + permission
   middleware + branch-scope middleware + `filters` allowlist.
2. Client: `makeHttpApi<T>` + `apiFor(resource, seed)` that switches mock↔real per
   resource via an env allowlist (`VITE_REAL_RESOURCES`). One switch, instant rollback.
3. **Prove ONE slice end-to-end: `Khách hàng`** (real CRUD, FK target for repair,
   exercises search + vi-sort + pagination + branch scope). Validates the entire spine.
4. Identity tables + wire real permission enforcement (replace permission-store as the
   enforcement source; it stays only as the admin editor).
5. Fan out lookups → remaining CRUD (parallelizable, mechanical).
6. **Repair → warehouse → finance → reports** — each a "build" phase with bespoke
   endpoints (warehouse/finance get design spikes per §5), still returning
   `PagedResult`/entity shapes so list pages stay unchanged.

**Seeding:** the existing `*_ROWS` seed arrays are valid `T[]` with real Vietnamese data
→ a Node seeder bulk-inserts them (preserving `id` for FK integrity, FK-order,
`ON CONFLICT DO NOTHING`). Same seeder feeds demo/staging/test. Ship a super-admin role
+ admin user so the app is usable post-deploy.

## 8. Honest effort reality

- **Low-risk, ~as-estimated:** the seam swap + 39-table CRUD fan-out.
- **Under-estimated by a meaningful multiple:** warehouse + finance (net-new ledgers) +
  auth/session security (refresh rotation, CSRF, branch-forgery). This is where the
  real multi-week cost and liability live. Do NOT let these ride the "mechanical
  fan-out" framing.

## 9. Decisions — LOCKED (2026-07-07)

1. **Stack:** ✅ **NestJS + Postgres + Drizzle + own JWT auth** (Option B). REST contract
   matching the existing `MockApi<T>` seam.
2. **Money type:** ✅ **VND integer** (`bigint`, no decimals). Applies to every
   finance/warehouse money column. No rounding/decimal handling.
3. **Warehouse scope:** ✅ **Full build** — real `stock_movement` ledger (every
   nhập/xuất/chuyển voucher line = one row) + voucher-entry UI + `stock_period_snapshot`
   at Kỳ-close. Inventory numbers become real transactions, not seeded RNG. This is a
   "build" phase with its own design spike, NOT a migration.
4. **Branch scope:** ✅ **Multi-branch users + `toàn hệ thống` super-scope.** A user may
   be assigned one or several branches (+ optional super-scope for admins). Every scoped
   query = `WHERE branch_id IN (:userBranches)`; super-scope skips the filter. Allowed
   branch set comes from the **token**, never the request header.
5. **Approach:** ✅ **TDD** (`/ck:plan --tdd`), **Khách hàng vertical slice first**.

**Still open (non-blocking, decide during planning):**
- **Hosting target** (VPS vs Fly/Railway vs cloud Postgres) — shapes the ops/CI-CD phase,
  not the schema. Can be decided when scoping deployment.
- **Is any menu a real "role holder," or is `nhóm-quyền` the sole role?** — finalizes the
  `role_menu` + `menu_function` join model (§6 correction 1). Resolve in the auth phase.

## 10. Next step

Handoff to `/ck:plan` once §9 decisions are made. Given this refactors critical behavior
and has strong existing test coverage to preserve, recommend `/ck:plan --tdd`.
