# Phase 1 Completion — Real Backend + DB (Khách hàng vertical slice)

**Workflow:** `/ck:cook plan.md --auto` · **Date:** 2026-07-08 · **Plan:**
[`../260707-1612-real-backend-database/plan.md`](../260707-1612-real-backend-database/plan.md)

## Outcome

Phase 1 (the foundational v1 slice) is **complete and green**. The app now has a
real deployable NestJS + Postgres + Drizzle backend behind the existing `MockApi<T>`
seam, proven end-to-end on **Khách hàng**. Nothing else migrates until this slice is
green (plan gate) — it is.

## What shipped

**Backend (`api/`, sibling dir — no `src/` move, D1):**
- NestJS app: ConfigModule (fail-loud env validation), Drizzle + pg, health route,
  global `JwtAuthGuard` + `@Public()`.
- Postgres schema + migration incl. `vi-VN-x-icu` ICU collation + `unaccent`.
  Tables: chi_nhanh, tinh, quan, xa, loai_khach_hang, nhom_quyen, nguoi_dung,
  khach_hang, refresh_token.
- **Auth:** `POST /auth/login` (access JWT w/ sub/roleIds/branchIds/superScope +
  httpOnly refresh cookie `Secure; SameSite=Strict; Path=/auth/refresh`),
  `/auth/refresh` (rotation + reuse-detection w/ grace window + family revocation),
  `/auth/logout`; CSRF header guard on cookie routes; bcrypt; no user-enumeration.
- **Generic CRUD engine** (`CrudService` + controller factory): `ListParams`→
  `PagedResult`, vi-collation sort (text-only), per-resource sort + filter
  allowlists, branch scope on read AND write, deny-by-default DTOs.
- **Khách hàng** wired through the engine; seeder from frozen fixtures (FK order,
  preserve id, idempotent, FK-closure validated); super-admin stamped (super-scope
  by login name, `must_change_password`).
- e2e: 25 supertest specs against a throwaway `phongthanh_test` DB.

**Frontend seam (`src/api/`):**
- `makeHttpApi<T>` (Bearer + transparent 401-refresh-retry w/ CSRF header + timeout
  + non-2xx→Vietnamese `Error`), `apiFor`/`isReal` dual-run switch on
  `VITE_REAL_RESOURCES`, VI error map, in-memory access-token holder.
- `khach-hang.config.ts` flipped: `mockApi: apiFor('khach-hang', KHACH_HANG_ROWS)`
  (the one-line change the seam promised).
- Prod build guard (`scripts/assert-real-resources.mjs` + `build:prod`) — fails a
  prod build unless the release's resources are real (Gate 5, fail-closed).
- MSW contract test (8) — the regression gate that replaces the retired mock
  white-box tests.

## Step-0 branch-namespace reconciliation (D4)

Three conflicting namespaces → canonical **`chi_nhanh.id` (`cn-1|cn-2|cn-3`)**
(`nguoi_dung` already used it). `khach_hang` rows carry no branch → `branch_id`
derived at seed from `tinhId` (`tinh-dak-lak`→cn-1, `tinh-dak-nong`→cn-2).
Invariant **empty branch set ⇒ deny** (via `inArray([])`→`false`). Note: cn-3
(Cộng tác viên) has no province in the data, so it currently has 0 customers — a
data reality, not a bug; scoping logic verified correct.

## Bugs found + fixed during verification

| # | Sev | Bug | Fix |
|---|-----|-----|-----|
| Express-5 | High | NestJS 11 ships Express 5 whose default `simple` query parser does NOT expand `filters[key]=value` → the filter allowlist (Gate 2) was silently bypassed AND legit filtering broke | `app.set('query parser','extended')` + gate-2 e2e test |
| COLLATE | High | `COLLATE "vi-VN-x-icu"` applied unconditionally 500'd on non-text sort columns — incl. khach-hang's **default `createdAt` sort** (first page load) | apply COLLATE only when `column.dataType==='string'` + regression e2e |
| C1 | **Critical** | `create` had no write-side branch check — a non-super user could POST a row into ANY branch (live-verified) | `assertBranchWritable` in `create()` (engine-level, all future resources inherit) + 2 e2e |
| H1 | High | Frontend `refreshAccessToken` omitted the CSRF header → refresh always 403'd in prod (users bounced every 15 min) | send `X-Requested-With` + contract assertion |
| H2 | High | Refresh reuse-detection non-atomic → benign concurrent refresh (2 tabs/reload) revoked the whole family, logging users out | atomic CAS claim + grace-window theft distinction + smoke (4/4) |
| H3 | High (latent) | update/delete write used `WHERE id` only (no branch predicate) | `scopedRowCondition` on the write itself |
| M1 | Medium | Unmapped `tinhId` on create → 500 | `BadRequestException` (400 VI) in `stampCreate` + e2e |

All found by the mandatory `code-reviewer` gate or by manual live verification, not
shipped. C1/H1/H2 were live-verified exploitable before the fix.

## Verification (all green)

- Backend e2e: **25/25** (auth, CRUD, 5 security gates, branch forgery, refresh
  rotation/reuse/CSRF).
- Frontend suite: **448/448** (126 files; +8 contract, zero regressions), typecheck
  clean, backend tsc clean.
- Live smoke: branch-scope + forgery **7/7**, full-stack seam **6/6**, refresh-race
  **4/4**.
- Prod build guard: blocks non-real, passes with khach-hang real, full `build:prod`
  succeeds.

## Config reconciliation

Dev Postgres on host **5434** (5433 taken locally) — `docker-compose.yml` + both
`.env.example` aligned. API on **3210** (3000 taken); frontend `VITE_API_URL`
default + `.env.example` aligned.

## Deferred (not blocking Phase 1)

- **M2 — deny-by-default column projection in the engine.** khach-hang has no secret
  column so Gate 3 holds today; becomes a prerequisite when `nguoi_dung` is wired
  through the generic engine (Phase 3). Flagged.
- Money `bigint`→string wire migration: convention set (no money field on khach-hang);
  first exercised by a money-bearing entity in a later phase.

## Unresolved questions

1. **`nguoiTao` stores the JWT `tenDangNhap` (login), not `hoTen` (display).** The
   token doesn't carry `hoTen`; storing login avoids a per-create DB round-trip.
   Confirm this is acceptable for the audit/display field, or add the lookup.
2. **Will Phase 3 wire `nguoi_dung` through the generic CRUD engine?** If yes, the
   M2 deny-by-default projection must land first (else `passwordHash` serializes).
3. Grace window for refresh reuse = 10s (env-overridable). Confirm the value fits the
   product's tab/retry behavior.
