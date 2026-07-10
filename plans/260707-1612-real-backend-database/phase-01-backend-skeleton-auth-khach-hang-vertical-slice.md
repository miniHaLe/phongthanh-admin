---
phase: 1
title: "Backend skeleton + auth + Khách hàng vertical slice"
status: completed
priority: P1
dependencies: []
completedAt: "2026-07-08"
---

<!-- Completed 2026-07-08 via /ck:cook --auto. Sibling api/ NestJS+Drizzle+Postgres
built; JWT auth (rotation + reuse-detection w/ grace window + CSRF); generic CRUD
engine w/ sort/filter allowlists + branch scope (read AND write path); khach-hang
flipped to apiFor(). Branch namespace reconciled → chi_nhanh.id (cn-*); khach_hang
branch_id derived from tinhId. 25 backend e2e + 8 MSW contract + 448 frontend +
6 full-stack seam + 7 branch-forgery + 4 refresh-race checks all green. Code-review
found + fixed 1 Critical (cross-branch create) + 3 High (refresh CSRF, non-atomic
reuse-detection, write-side scope) + 2 bugs found in verification (Express-5 query
parser bypassed filter allowlist; COLLATE on non-text sort column 500'd).
Report: ../reports/from-cook-260708-backend-phase1-completion-report.md -->


# Phase 1: Backend skeleton + auth + Khách hàng vertical slice

## Overview

Stand up the NestJS + Postgres + Drizzle backend, JWT auth, the generic CRUD
router + branch-scope + `filters`-allowlist middleware, and prove the ENTIRE spine
end-to-end on ONE entity — **Khách hàng** — including the client `makeHttpApi<T>`
drop-in and the per-resource dual-run flag. Nothing else migrates until this slice is
green and the Khách hàng MSW contract test passes with `khach-hang` flipped to real (the
mock's white-box unit tests for khach-hang retire, replaced by the contract test).

## Requirements

- Functional: a running API with `POST /auth/login` (JWT access + httpOnly refresh),
  `GET/POST/PATCH/DELETE /api/v1/khach-hang` honoring `ListParams`→`PagedResult<T>`,
  vi-collation sort, branch scoping from the JWT, and **sort-column + filter-column
  allowlists**. Client `makeHttpApi<KhachHang>` + `apiFor()` flag; the Khách hàng page
  works against Postgres with only the `apiFor()` config-line change.
- Non-functional: the wire shape is byte-identical to the mock **except money** (D2:
  bigint in DB, string on the wire); TDD; secrets in gitignored `.env`; local
  `docker compose` Postgres for dev.
- **Repo shape: sibling `api/` dir (D1 locked — NOT a monorepo move).** Keep `src/` in
  place; copy/re-export the ~4 wire types (`MockApi`/`ListParams`/`PagedResult`/
  `BaseEntity`) into `api/`. The monorepo `src/`→`apps/web` move was rejected (risks the
  frontend suite for negligible gain).

### Security gates (mandatory, this phase — red-team)

- **Sort-column allowlist (Finding 9):** `sort` is a free-form client string
  (`src/hooks/use-crud.ts:36,122-123`) interpolated into `ORDER BY <col> COLLATE
  "vi-VN-x-icu"`; Drizzle does NOT parameterize identifiers → `?sort=(SELECT password…)`
  blind-exfil or a raw 500 leaking schema. Per-resource sort-column allowlist + `dir`
  enum; unknown column → 400 VI message.
- **Filter-column allowlist + branch never filterable (Finding 5):** `filters`
  (`use-crud.ts:22`) is `Record<string,unknown>`; the mock filters ANY key
  (`src/mock/masterdata/index.ts:41-49`). Per-resource allowlist; `branch_id`/`chiNhanhId`
  NEVER on it; the JWT branch predicate is a hard trailing `AND`; unknown key → 400 (fail
  loud). Test `filters[branch_id]=other` → empty.
- **Auth hardening (Finding 10) — explicit deliverable, not "a vetted recipe":** refresh
  cookie `httpOnly; Secure; SameSite=Strict; Path=/auth/refresh`; CSRF strategy on the
  refresh route; rotation with reuse-detection + token-family revocation; short access
  TTL. There is zero existing auth infra to inherit (`src/pages/auth/LoginPage.tsx:39-42`
  is a `navigate()` stub; `auth-store` does not yet exist).
- **Dual-run is dev/CI-only (Finding 7):** a build guard fails the prod build unless
  `VITE_REAL_RESOURCES` covers all of the release's resources — no user-reachable
  partially-enforced environment (mock login accepts any creds; mock data is unguarded).

## Architecture

**Repo (D1 locked — sibling `api/`, NO monorepo move):**
```
src/               # the existing SPA stays exactly where it is (no move)
api/               # NestJS backend (sibling dir)
api/src/shared/    # copy/re-export of the ~4 wire types (MockApi<T>/ListParams/
                   #   PagedResult/BaseEntity) + Zod — kept in sync by the MSW contract
                   #   tests (a stronger runtime guarantee than a shared compile-time type)
```
The monorepo `src/`→`apps/web` move was rejected: it risks the frontend build/tests for
the sake of ~4 tiny shared types, which the MSW contract tests already protect against
drift.

**Client seam (drop-in for CRUD entities only — money carved out):**
```ts
// src/api/http-client.ts (client) — wire types re-exported into api/src/shared for the server
export function makeHttpApi<T extends BaseEntity>(resource: string): MockApi<T> {
  const base = `${import.meta.env.VITE_API_URL}/api/v1/${resource}`
  return {
    list:   (p)       => req<PagedResult<T>>(`${base}?${toQuery(p)}`),      // GET
    get:    (id)      => req<T>(`${base}/${id}`),
    create: (data)    => req<T>(base, { method: 'POST', body: data }),
    update: (id, d)   => req<T>(`${base}/${id}`, { method: 'PATCH', body: d }),
    remove: (id)      => req<void>(`${base}/${id}`, { method: 'DELETE' }),
  }
}
// src/api/api-for.ts — the ONE switch for all resources
export function apiFor<T extends BaseEntity>(resource: string, seed: T[]): MockApi<T> {
  return isReal(resource) ? makeHttpApi<T>(resource) : makeMockApi<T>(seed)
}
```
`req()` attaches `Authorization: Bearer`, refreshes on 401, and maps non-2xx →
`throw new Error(vietnameseMessage)` so `useCrud.onError` renders the toast unchanged.

**Server (NestJS):** a generic `CrudController`/`CrudService<T>` parameterized per
resource. `list()` builds a Drizzle query from `ListParams`: search across an explicit
per-resource text-column set, `filters` restricted to an allowlist, sort via
`ORDER BY <col> COLLATE "vi-VN-x-icu" <dir>`, `LIMIT/OFFSET` pagination, returns
`{ data, total, page, pageSize }`.

**Branch scope:** `BranchScopeInterceptor` reads `userBranches`/`superScope` from the
JWT and injects `WHERE branch_id IN (...)` on scoped tables. `khach_hang` is
branch-scoped. **Note (Finding 3): no `X-Chi-Nhanh` header exists today** (`grep
'X-Chi-Nhanh' src` = 0) — branch is `useAppStore.activeBranch` persisted to localStorage,
default `'all'`. If a header is introduced it is only the active-branch UI hint and can
NARROW within the JWT-allowed set, never widen; the JWT branch set is the sole source of
truth. A persisted `activeBranch` of `'all'` for a non-super user resolves to the allowed
set (not literal all).

**DB:** Postgres with `CREATE COLLATION "vi-VN-x-icu"` (ICU) + `unaccent`. Drizzle
schema + migrations. `khach_hang` table per the entity map (self-FK `dai_ly_id`,
`branch_id`, BaseEntity + audit cols). Money columns `bigint` (none on khach_hang, but
the convention is set here).

## Related Code Files

- Create: `api/**` (sibling NestJS app: auth module, crud module, khach-hang module,
  drizzle schema + migrations, seed script, `api/src/shared/**` re-exported wire types +
  Zod), `docker-compose.yml` (Postgres).
- Create: `src/api/http-client.ts`, `src/api/api-for.ts`, `src/api/vi-error-map.ts`.
- Modify: `src/mock/masterdata/khach-hang.mock.ts` (swap `makeMockApi` → `apiFor`),
  `src/hooks/use-crud.ts` (no logic change; optional `mockApi`→`dataApi` rename deferred),
  root `package.json` (add `api` scripts, no `src/` move), `.env.example`, `.gitignore`.
- Reference (read-only): `src/types/crud-types.ts`, `src/mock/masterdata/index.ts`
  (`makeMockApi` + `applyParams` = the behavior to reproduce), `src/mock/seed/index.ts`
  (`BaseEntity`, `ListParams`, `PagedResult`), the entity map report.

## Implementation Steps

0. **Setup + branch-namespace reconciliation spike (Finding 4/5):** scaffold a sibling
   `api/` (no `src/` move). **Reconcile the branch-id namespace** — the code has three
   conflicting ones: `dak-lak|dak-nong|ctv-tuyen-huyen` (`src/mock/seed/branches.ts:6`,
   used by warehouse rows + `activeBranch`), `cn-1,cn-2…` (`chi-nhanh.mock.ts:14`, what
   `NguoiDung.chiNhanhId` references), and literal `'all'` (`app-store.ts:20`). Pick ONE
   canonical `chi_nhanh.id`, rewrite row `branch_id`s at seed, and set the invariant
   **empty branch set ⇒ deny, never all**. Handle a persisted `activeBranch` outside the
   JWT-allowed set (reset to an allowed branch, don't silently widen).
1. **TDD — MSW contract (NOT the white-box mock suite — Finding 2):** write MSW-backed
   frontend tests asserting the EXACT wire contract `makeHttpApi` must satisfy (query
   serialization of `ListParams`, `PagedResult` shape, vi-sort order for a known
   Vietnamese set, money as string, real 401/403/409/timeout → VI message). The existing
   mock unit tests are white-box (array identity, `Math.random` pinned to 0.999 in
   `src/test/setup.ts:24` to suppress the 5% throw) — they characterize the mock and
   RETIRE on flip; do NOT treat "the 440 stay green" as backend proof.
2. **TDD — backend spec:** supertest specs for `khach-hang` CRUD (list pagination/sort/
   filter, get 404 → VI message, create/update/delete), auth (login → tokens, protected
   route → 401 without token), branch scope (user A cannot read branch B rows even with
   forged header → empty/scoped), `filters` allowlist (unknown column → ignored/400).
3. **Backend skeleton:** NestJS app, config (`.env`: `DATABASE_URL`, `JWT_SECRET`,
   `JWT_REFRESH_SECRET`), Drizzle + Postgres via docker-compose, health route.
4. **Auth module:** `POST /auth/login` (verify user, issue access JWT w/
   `sub`/`roleIds`/`branchIds`/`superScope` + httpOnly refresh cookie),
   `POST /auth/refresh` (rotation), `POST /auth/logout`. Guard = `JwtAuthGuard` global.
5. **Generic CRUD module:** `CrudService<T>` + `CrudController` factory; vi-collation
   sort; `filters` allowlist per resource; `BranchScopeInterceptor`.
6. **Khách hàng module:** Drizzle `khach_hang` schema + migration; wire it through the
   generic CRUD with its filterable-column allowlist + text-search columns.
7. **Seeder:** Node script importing `KHACH_HANG_ROWS` (+ its FK targets: branches,
   loai-khach-hang, phuong-xa/quan/tinh) → bulk insert preserving `id`, FK-order,
   `ON CONFLICT (id) DO NOTHING`. **Seed a super-admin (validation-locked V4):** create a
   super-admin user whose initial password is hashed from `INITIAL_ADMIN_PASSWORD` (env,
   never committed), with a `must_change_password` flag forcing a change on first login.
   No hardcoded secret; reproducible on a fresh VPS. <!-- Updated: Validation Session 1 -
   auth bootstrap = env password + forced change -->
8. **Client wiring:** `makeHttpApi` + `apiFor` + `isReal` flag (env
   `VITE_REAL_RESOURCES=khach-hang`) + VI error map; flip `khach-hang` config to `apiFor`.
9. **Green + regression:** backend specs green; the Khách hàng MSW contract test green;
   re-baseline the frontend suite (retire the khach-hang white-box mock tests, keep the
   rest). Manually verify the Khách hàng page: list/search/sort/filter/create/edit/delete
   against Postgres.

## Success Criteria

- [ ] Sibling `api/` scaffolded (no `src/` move); frontend suite unaffected by setup.
- [ ] Branch-id namespace reconciled to one canonical `chi_nhanh.id`; empty branch set ⇒
      deny; persisted `activeBranch` outside the allowed set is reset, not widened.
- [ ] `makeHttpApi<KhachHang>` satisfies `MockApi<T>`; Khách hàng page changed only by the
      `apiFor()` config line (money-as-string handled in the shared wire type).
- [ ] Login issues access + httpOnly refresh (`Secure; SameSite=Strict;
      Path=/auth/refresh`); rotation + reuse-detection + family revocation; refresh route
      CSRF-protected; protected routes 401 without token.
- [ ] `GET /api/v1/khach-hang` returns exact `PagedResult`; vi-sort matches
      `localeCompare(...,'vi')` on a fixed dataset (or ICU order documented as the truth).
- [ ] **Sort-column allowlist**: unknown `sort` → 400 VI, never a raw DB error / injection.
- [ ] **Filter-column allowlist**: unknown key → 400; `branch_id` not filterable;
      `filters[branch_id]=other` → empty; JWT branch predicate is a hard trailing AND.
- [ ] Seeder populates khach-hang + FK targets from a **frozen fixture** (idempotent,
      preserve id, FK-order); super-admin role + admin user exist.
- [ ] Dual-run flag flips khach-hang mock↔real (dev/CI); a build guard blocks a prod build
      that isn't fully real for the release.
- [ ] MSW contract test green; no secrets committed; `.env.example` documents required vars.

## Risk Assessment

- **Repo shape** → sibling `api/` (no `src/` move), so the frontend build/tests are
  untouched by setup; the monorepo move was rejected (risk without payoff).
- **vi-collation mismatch** (ICU order ≠ JS `localeCompare`) → characterization test
  pins a known ordering; if ICU differs on edge cases, document + accept ICU as the
  server truth (it's the more correct Unicode order) and update the test's expected
  order with a note.
- **Auth security** (refresh rotation, httpOnly, CSRF) → follow a vetted NestJS auth
  recipe; refresh in httpOnly cookie, access in memory; add CSRF protection on the
  cookie-based refresh route.
- **Seam leaks** (a page bypassing `mockApi`) → grep for direct mock imports in pages
  before flipping; the seam audit from the parity work (P7 X2) confirms none, re-verify.
