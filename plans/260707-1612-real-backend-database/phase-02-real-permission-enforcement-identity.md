---
phase: 2
title: "Real permission enforcement + identity"
status: pending
priority: P1
dependencies: [1]
---

# Phase 2: Real permission enforcement + identity

## Overview

Turn the 202-checkbox permission matrix + menu tree from **UI-only mock** into
**enforced server-side authorization** — closing the plan's #2 limitation. Migrate the
identity tables (người-dùng, nhân-viên, nhóm-quyền, menu, chức-năng) and gate every
endpoint with a permission guard driven by the real, menu-keyed RBAC model.

## Requirements

- Functional: login resolves a user's effective permission set + branch set; every
  endpoint enforces its required permission (403 otherwise); the admin permission
  screens read/write the real role model; the client `permission-store` becomes a
  mirror (hides buttons/menu nodes) but is NOT the enforcement source.
- Non-functional: RBAC model matches the CODE reality (menu-keyed, see correction),
  not the naive role-keyed assumption; TDD (permission-denied paths tested first).

## Architecture

**⚠️ The RBAC seed source does NOT exist (red-team Findings 2/3 — Critical).** The
matrix cells live ONLY in browser `localStorage` (`src/store/permission-store.ts:98-104`,
key `pt-permissions`); the role mock has zero cells attached
(`src/mock/masterdata/nhom-quyen.mock.ts:18-28`). The cells are keyed by **menuId**
(`menu-1`/`menu-42`) and their ids are **presentation slugs** built from label+array-index
via `slugify(label, index)` (`function-permission-matrix.tsx:103-114`), with deliberate
duplicate labels ('Nhà kho' twice, `:76,90`). So "seed the real matrix from the mock's
checkbox maps, round-trip ~200 rows" is **false — there is nothing to round-trip.**

**Therefore:** the RBAC seed is an **explicitly authored, code-reviewed least-privilege
matrix**, NOT a translation of browser state. And a first-class
`resource_key ↔ permission_code` map is required (the URL-derived `{resource,verb}` can
never equal a UI slug like `fg-khach-hang-3:them`), with a completeness test.

**Corrected RBAC model (verified against `permission-store.ts:12-15` +
`function-permission-matrix.tsx`):** `functionMatrixChecked` is keyed by **menuId**,
`menuTreeChecked` by roleId — a two-level model, NOT a flat `role_permission`.

```
role (nhom_quyen)         # the role holder
menu                      # ~50-node menu tree
chuc_nang                 # function taxonomy (entity → action leaves)
menu_function(menu_id, verb)          # which {xem,them,sua,xoa,+special} cells a menu exposes  (~200 rows)
role_menu(role_id, menu_id)           # which menus a role's tree includes
user_role(user_id, role_id)
user_branch(user_id, branch_id)       # multi-branch (D4); + user.super_scope bool
```
**Effective permission set** for a user = `⋃ over roles r: { menu_function rows where
menu ∈ role_menu(r) }`. Computed once at login, embedded in the JWT (or fetched into a
client `auth-store`).

**Open decision (resolve here):** is any menu itself a "role holder," or is `nhóm-quyền`
the sole role entity? Confirm against the seed data before finalizing `role_menu`.

**Enforcement guard (NOT fully table-driven — verified):**
- **~164 CRUD cells:** a `PermissionGuard` derives `{resource, verb}` from HTTP
  method + path (`GET→view`, `POST→create`, `PATCH→update`, `DELETE→delete`) and checks
  it against the user's effective set.
- **~38 special-action cells** (`dieu-phoi-ky-thuat`, `doi-tinh-trang`,
  `chuyen-chi-nhanh`, `xuat-ton-excel`, `duyet`, …): each bespoke endpoint carries an
  explicit `@RequirePermission('<menu>','<action>')` decorator. The guard reads the
  decorator when present, else falls back to the method→verb mapping.

**Client change:** `permission-store` keeps its EDITOR role but stops being the access
gate. Add `hasPermission(code)` reading the server-issued set to hide menu nodes/buttons
(UX only; server still enforces = defense in depth). **The persisted `pt-permissions`
localStorage (Finding 13) must be namespaced by `user_id` and cleared on logout** — else
on a shared machine User B sees User A's persisted matrix paint buttons until each action
403s. Render guards read ONLY the server set (auth-store), never the persisted editor state.

**Identity secret-leak DTO (Finding 1 — Critical):** mock `list`/`get` return the full
entity with no projection (`src/mock/masterdata/index.ts:68,89`); `NguoiDung` carries
`password?: string` (`src/types/masterdata-types.ts:197`) as a plain text field
(`nguoi-dung.config.ts:51-57`). Running người-dùng through the byte-identical generic CRUD
would serialize the password on every list/get → a receptionist harvests every admin's
hash. **Identity endpoints MUST use explicit response DTOs; the generic CRUD select is
deny-by-default; a contract test asserts no secret column appears on any response.**

**`CURRENT_USER` bypass (Finding 14):** ~13 runtime files import `CURRENT_USER` and stamp
`nguoiLap`/`createdBy` client-side (`finance-mock.ts:21`, create pages). Post-auth the
**server stamps authorship from the JWT `sub`**, never a client-supplied value; remove the
`CURRENT_USER` write path so audit fields aren't spoofable.

## Related Code Files

- Create: `api/src/auth/permission.guard.ts`, `require-permission.decorator.ts`,
  identity Drizzle schemas + migrations (`nguoi_dung`, `nhan_vien`, `nhom_quyen`, `menu`,
  `chuc_nang`, `menu_function`, `role_menu`, `user_role`, `user_branch`), permission
  resolver service, identity CRUD modules.
- Modify: `api/` login (embed effective perms + branch set), `CrudController`
  factory (apply `PermissionGuard` globally), the ~38 bespoke endpoints get decorators
  (stubs now, real endpoints in Phases 4-6).
- Modify: `src/store/permission-store.ts` (demote to editor + `hasPermission`),
  `src/store/auth-store.ts` (new — holds server perm set), menu/button render guards.
- Reference (read-only): `src/features/permissions/function-permission-matrix.tsx`,
  `src/features/permissions/menu-permission-tree.tsx`, entity map §permissions.

## Implementation Steps

1. **TDD — permission specs:** for a seeded role with a known permission subset, assert
   allowed endpoints → 2xx and disallowed → 403; a special-action endpoint → 403 without
   its exact code; branch-scope + permission compose correctly.
2. **Identity schema + migrations + AUTHORED seed:** the 8 tables above. The permission
   matrix seed is a **hand-authored, code-reviewed least-privilege** `role_menu` +
   `menu_function` set (NOT translated from browser localStorage — that source doesn't
   exist, Finding 2). Author a `resource_key ↔ permission_code` map with a completeness
   test (every route resolves to a code; every code to a route). Seed a super-admin with
   all cells so no one is locked out.
3. **Permission resolver:** service that computes a user's effective permission set +
   branch set; wire into login (Phase 1's token) — token now carries perms + branches.
4. **PermissionGuard + decorator:** global guard (method→verb default +
   `@RequirePermission` override); apply to the generic CRUD controller.
5. **Identity CRUD modules:** người-dùng, nhân-viên, nhóm-quyền, menu, chức-năng through
   the generic CRUD (họ get their own filter allowlists); the role-assignment screens
   (nhóm-quyền tree + menu matrix) write `role_menu` + `menu_function`.
6. **Client demote:** `permission-store` → editor + mirror; new `auth-store` holds the
   server set; menu/buttons hide via `hasPermission`; login populates it.
7. **Regression:** per-resource MSW contract tests green (suite re-baselined); backend
   permission specs green; manually verify a low-privilege user is blocked at the API (not
   just UI).

## Success Criteria

### Delivered subset (2026-07-15)

- [x] Real `nguoi-dung` CRUD uses bcrypt-12, superScope-only writes, exact
      visible filters, and response projection that never serializes
      `password` or `passwordHash`.
- [x] Admin-created users can log in immediately; `nhom-quyen` has the real
      read endpoint needed by the user editor.
- [x] Generic CRUD gained additive async create stamping, response projection,
      write guards, and Vietnamese database-constraint errors without breaking
      the existing `khach-hang` slice.
- [ ] Full authored RBAC matrix, `PermissionGuard`, route completeness,
      persisted permission demotion, HR/menu/chuc-nang identity entities, and
      `CURRENT_USER` removal remain owned by this phase.

The interim `superScope` write guard is a coarse seam, not the final RBAC
model. Replace it with the permission guard when the remaining phase executes.

- [ ] RBAC modeled menu-keyed (`role_menu` + `menu_function`); seed is an **authored
      least-privilege matrix** (not translated from localStorage); a `resource_key ↔
      permission_code` map exists with a completeness test.
- [ ] Every CRUD endpoint enforces `{resource,verb}` → 403; a guard-completeness test
      fails CI if any non-CRUD route lacks an explicit `@RequirePermission`.
- [ ] Identity endpoints use response DTOs; **no secret column (password/hash) ever
      serialized** — asserted by a contract test.
- [ ] `CURRENT_USER` write path removed; server stamps `createdBy`/`nguoiLap` from JWT.
- [ ] Login embeds effective perms + branch set; client mirror hides UI, server enforces.
- [ ] Persisted `pt-permissions` namespaced by user + cleared on logout; render guards read
      only the server set.
- [ ] A low-privilege token calling the API directly is blocked at the API.
- [ ] Per-resource MSW contract tests + backend permission specs green (not "the 440").

## Risk Assessment

- **Menu-keyed mis-seed** (the #2 verified risk) → seed migration verifies cell counts
  round-trip; a diff test asserts the seeded model reproduces the mock's checkbox maps
  exactly before trusting it.
- **Guard gaps** (a bespoke endpoint missing its decorator ships as effectively public
  under the method→verb default) → a test enumerates all non-CRUD routes and asserts
  each has an explicit `@RequirePermission`; CI fails if a route lacks one.
- **Perms in JWT go stale** on role change → short access-token TTL + refresh
  re-resolves; or resolve per-request from cache for sensitive actions.
- **Lockout** → always seed a super-admin with all perms + super-scope.
