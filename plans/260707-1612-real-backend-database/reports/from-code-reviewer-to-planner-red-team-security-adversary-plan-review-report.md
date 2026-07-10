# Red-Team Security-Adversary Plan Review — Real Backend + Database

Reviewer role: Security Adversary + Fact Checker. Target: `plans/260707-1612-real-backend-database/`.
Every finding is backed by a `file:line` citation from the actual codebase.

---

## Finding 1: Generic-CRUD wire parity leaks the user password/hash column

**Severity:** Critical

**Location:** Phase 2 §Architecture / §Implementation step 5 ("Identity CRUD modules: người-dùng … through the generic CRUD"); Plan acceptance criterion "makeHttpApi<T> satisfies MockApi<T> byte-for-byte."

**Flaw:** The whole plan's lever is a byte-identical wire contract: `MockApi<T>.list/get` return the entire entity `T`. The mock factory returns rows wholesale — `applyParams` slices `[...rows]` and `get` does `return { ...row }` with no field projection (`src/mock/masterdata/index.ts:68`, `:89`). `NguoiDung` carries `password?: string` (`src/types/masterdata-types.ts:197`), and the user config exposes it as a plain `type: 'text'` create field (`src/config/crud-configs/nguoi-dung.config.ts:51-57`). If the NestJS `CrudController<NguoiDung>` reproduces the wire shape "byte-for-byte" and runs the user table "through the generic CRUD" (Phase 2 step 5), then `GET /api/v1/nguoi-dung` serializes the password/hash for every row to any user with `nguoi-dung:xem`.

**Failure scenario:** A low-trust receptionist with `xem` on Người Dùng calls `GET /api/v1/nguoi-dung?pageSize=1000`. The response includes `password` (or its hash) for every admin. Offline cracking / credential reuse → full account takeover, privilege escalation to super-admin.

**Evidence:** `src/mock/masterdata/index.ts:68` (`data = result.slice(...)`, no projection), `:89` (`return { ...row }`), `src/types/masterdata-types.ts:197` (`password?: string`), `src/config/crud-configs/nguoi-dung.config.ts:51-57` (plaintext text field).

**Suggested fix:** Break the "byte-identical" rule for identity: the user resource MUST use an explicit response DTO/allowlist that never emits the password/hash column. Add a plan invariant: every entity that has a secret column requires an output-field allowlist, and generic CRUD must project columns (deny-by-default select list), not `SELECT *`. Add a contract test asserting no `password`/secret field ever appears on any list/get response.

---

## Finding 2: The RBAC seed source does not exist in seedable data — perms live in browser localStorage

**Severity:** Critical

**Location:** Phase 2 §Implementation step 2 ("seed the real matrix from the mock's checkbox maps … verify counts round-trip: ~200 menu_function rows") and §Risk ("seed migration verifies cell counts round-trip").

**Flaw:** The plan assumes the 202-cell matrix is a fixture it can seed and round-trip. It is not. The only place cells are stored is the Zustand `permission-store`, persisted to **localStorage** (`src/store/permission-store.ts:98-104`, `partialize` of `menuTreeChecked`/`functionMatrixChecked`). There is no `*_ROWS` array of assignments to seed from. Worse, the role seed `NHOM_QUYEN_ROWS` carries only `maNhom`/`tenNhom`/`moTa` — zero permission cells attached (`src/mock/masterdata/nhom-quyen.mock.ts:18-28`). So "seed the real matrix from the mock" has no data source: a fresh DB seed produces roles with **no permissions at all**, or requires inventing them.

**Failure scenario:** Team seeds prod from `*_ROWS`, every non-super role lands with an empty permission set. Either (a) the app is unusable for all non-admins (support floods), or (b) someone "temporarily" grants broad perms to unblock, and that over-grant ships. Both are RBAC failures on day one.

**Evidence:** `src/store/permission-store.ts:98-104` (localStorage-only persistence), `src/mock/masterdata/nhom-quyen.mock.ts:18-28` (roles have no cells), `src/mock/masterdata/index.ts:142` (`NHOM_QUYEN_ROWS` is the only role export).

**Suggested fix:** Replace "seed from the mock's checkbox maps" with an explicit, authored `role_menu` + `menu_function` seed matrix that is code-reviewed as a security artifact, and delete the false "round-trip verification" claim. Define least-privilege default sets per the 8 named roles (`src/mock/masterdata/nhom-quyen.mock.ts:7-16`). Do NOT trust any browser-persisted state as a permission source.

---

## Finding 3: Permission cell ids are UI slugs disconnected from role ids and resource keys

**Severity:** Critical

**Location:** Phase 2 §Architecture ("functionMatrixChecked is keyed by menuId … role_menu(role_id, menu_id) + menu_function(menu_id, verb)") and step 4 (PermissionGuard derives `{resource, verb}` from method+path).

**Flaw:** The guard needs to map an HTTP route (`/api/v1/khach-hang`, verb `create`) to a permission cell. But the matrix cells are keyed by **presentation-layer slugs** like `fg-khach-hang-3:them`, generated from a Vietnamese label + array index via `slugify(label, index)` (`src/features/permissions/function-permission-matrix.tsx:103-114`, cell format `${groupId}:${actionId}` at `:161-163`). The group list is hand-ordered UI labels with duplicates deliberately index-suffixed (`'Nhà kho'` twice, `src/features/permissions/function-permission-matrix.tsx:76,90,104-105`). There is no mapping from `resourceKey` (e.g. `khach-hang`, `src/config/crud-configs/nguoi-dung.config.ts:8`) to `fg-khach-hang-3`. And `functionMatrixChecked` is keyed by `menuId` (`menu-1`, `menu-42`, `draft` in tests — `src/store/permission-store.test.ts:48,63`), not by roleId, so a role→cells resolution requires a `role_menu` join that has no seed data (see Finding 2).

**Failure scenario:** The guard's `{resource,verb}` derived from the URL will never equal `fg-phieu-sua-chua-13:doi-tinh-trang`. Whoever writes the mapping does it by hand under deadline; a single wrong index (e.g. the duplicate `Nhà kho` groups at indices differing by label case, `:76` vs `:90`) mis-grants warehouse write to a read-only role, or leaves a sensitive action ungated (guard falls back to method→verb default, Phase 2 step 4).

**Evidence:** `src/features/permissions/function-permission-matrix.tsx:103-114` (slug = label+index), `:161-163` (cell id shape), `:59-101` (hand-ordered dup labels), `src/store/permission-store.test.ts:48,63` (`menu-1`/`menu-42` keys), no resourceKey↔slug map anywhere in `src/`.

**Suggested fix:** Add an explicit, reviewed `resource_key ↔ permission_code` mapping table as a first-class artifact (not derived from UI slugs). The plan currently hand-waves this as "translate menu-keyed cells faithfully" — make it a dedicated sub-task with a completeness test that every route's required code exists in the map, and every map entry resolves to a real route.

---

## Finding 4: Two conflicting branch-id namespaces break JWT branch scoping (D4)

**Severity:** Critical

**Location:** D4 / Phase 1 §"Branch scope" (`WHERE branch_id IN (:userBranches)` from the JWT; `X-Chi-Nhanh` can narrow but not widen), Phase 3 group 5 ("chi_nhanh already seeded P1 as the branch dim").

**Flaw:** The codebase has **three** branch id namespaces that do not agree:
- `src/mock/seed/branches.ts:6` → `BranchId = 'dak-lak' | 'dak-nong' | 'ctv-tuyen-huyen'` (slug ids, 3 branches) — used by warehouse rows (`src/domains/warehouse/list-fetchers.ts:26-30` filters on `r.branchId`) and `activeBranch` (`src/store/app-store.ts:11`).
- `src/mock/masterdata/chi-nhanh.mock.ts:14` → `id: cn-${i+1}` (`cn-1`, `cn-2`, …) — this is the CRUD "branch dimension" the plan seeds, and it is what `NguoiDung.chiNhanhId` / `chiNhanhPhuIds` reference (`src/mock/masterdata/nguoi-dung.mock.ts:47,49-51`).
- `activeBranch: 'all'` default (`src/store/app-store.ts:37`) — a literal, not an id.

So the JWT branch set (built from `nguoi_dung.chiNhanhId` = `cn-*`), the row `branch_id` on warehouse/repair data (`dak-lak`/`dak-nong`), and the `X-Chi-Nhanh` header hint live in different namespaces. `WHERE branch_id IN (:userBranches)` compares `cn-1` against `dak-lak` → matches nothing, or (if "fixed" by dropping the filter for empties) matches everything.

**Failure scenario:** Because the sets never intersect, the naive implementer "fixes" the empty-result bug by treating an empty/unmatched branch set as "no restriction" — silently disabling branch isolation for every scoped query. A Đắk Lắk user reads Đắk Nông's tickets, customers, and receivables. Multi-tenant isolation is gone.

**Evidence:** `src/mock/seed/branches.ts:6`, `src/domains/warehouse/list-fetchers.ts:26-30`, `src/store/app-store.ts:11,37`, `src/mock/masterdata/chi-nhanh.mock.ts:14`, `src/mock/masterdata/nguoi-dung.mock.ts:47,49-51`.

**Suggested fix:** Add a Phase 1 spike sub-task to reconcile the branch-id namespaces into ONE canonical `chi_nhanh.id` before any scoping code. Seed a deterministic mapping (`dak-lak`→canonical id) and rewrite warehouse/repair `branch_id`s during seed. Add a test that a scoped query with a non-intersecting branch set returns **empty, never all**. Make "empty branch set ⇒ deny" an explicit invariant, not "⇒ skip filter."

---

## Finding 5: `filters` allowlist is necessary but the plan never scopes it against branch — filterable FK columns can widen access

**Severity:** High

**Location:** Correction #4 ("filters is an injection gate … per-resource filterable-column allowlist mandatory") + Phase 1 §"Branch scope" ("X-Chi-Nhanh … can NARROW within allowed branches but never widen").

**Flaw:** The mock applies filters as `String(row[k]) === String(v)` for ANY key the client sends (`src/mock/masterdata/index.ts:41-49`) — an unbounded equality gate, exactly the injection surface the plan flags. But the plan's allowlist only addresses *which columns are filterable*, not the interaction with branch scope. Filter configs routinely expose `chiNhanhId` as a user-supplied select filter (`src/config/crud-configs/nguoi-dung.config.ts:82-90`). If `chiNhanhId` (or `branch_id`) is on a resource's filter allowlist and the branch scope is applied as a filter rather than a hard AND-ed predicate, a client sending `filters: { branchId: '<other-branch>' }` sets the branch equality itself. The plan says the header "cannot widen," but says nothing about the `filters` field carrying a branch column.

**Failure scenario:** Attacker calls `GET /api/v1/<scoped-resource>?filters[branch_id]=<branch-they-lack>`. If the allowlist includes `branch_id`/`chiNhanhId` (natural, since the UI filters on it), and the implementer applies allowlisted filters as WHERE clauses ORed/merged with scope, the attacker reads another branch. The header is locked down; the JSON `filters` field is the unlocked back door.

**Evidence:** `src/mock/masterdata/index.ts:41-49` (arbitrary-key equality filter, current behavior to reproduce), `src/config/crud-configs/nguoi-dung.config.ts:82-90` (`chiNhanhId` is a client filter), `src/hooks/use-crud.ts:22` (`filters: Record<string, unknown>` on the wire).

**Suggested fix:** Two hard rules in the plan: (1) `branch_id`/`chiNhanhId` are NEVER on any filter allowlist — branch is set only by the JWT-derived scope. (2) The JWT branch predicate is a non-negotiable AND applied after all client filters (`WHERE (client filters) AND branch_id IN (:jwtBranches)`), so no client input can widen it. Add a test that `filters[branch_id]=other` returns empty.

---

## Finding 6: vi-collation ORDER BY column comes from client `sort` with no sort-column allowlist → SQL injection / error surface

**Severity:** High

**Location:** Plan acceptance ("ORDER BY col COLLATE \"vi-VN-x-icu\""), Phase 1 §Server ("sort via `ORDER BY <col> COLLATE …`"). The plan mandates a `filters` allowlist but specifies NO allowlist for the `sort` column.

**Flaw:** `sort` is a free-form client string (`params.sort` → `ListParams.sort?: string`, `src/hooks/use-crud.ts:36,122-123`; `src/mock/seed/index.ts:45`). The mock uses it as an object key safely (`result.sort` on `a[key]`, `src/mock/masterdata/index.ts:52-62`), so no current guard exists. On the SQL side the plan interpolates `<col>` directly into `ORDER BY <col> COLLATE "vi-VN-x-icu"`. Drizzle does not parameterize identifiers — a raw column name in ORDER BY is string-built. Any client can send `sort=<arbitrary>`.

**Failure scenario:** `?sort=(SELECT password FROM nguoi_dung LIMIT 1)` or `sort=1; DROP …`-style ORDER BY injection, or at minimum `sort=nonexistent_col` → unhandled 500 leaking a Postgres error (schema disclosure). Even without full injection, blind ORDER BY subquery injection is a classic data-exfil channel.

**Evidence:** `src/hooks/use-crud.ts:36` (`sort?: string`), `:122-123` (`setSort(sortKey, dir)` passes raw key), `src/mock/seed/index.ts:45` (`sort?: string` on wire), `src/mock/masterdata/index.ts:52-62` (currently only an object-key lookup, so no server-side guard is inherited).

**Suggested fix:** Add a mandatory per-resource **sort-column allowlist** (same rigor as the filter allowlist) and a fixed `dir ∈ {asc,desc}` enum check, day one. Reject/ignore unknown sort columns (400 with a VI message, never a raw DB error). Add this as an explicit Phase 1 acceptance criterion alongside the filter allowlist — currently it is missing.

---

## Finding 7: Money is `number` client-side; D2 "bigint end-to-end" silently truncates above 2^53

**Severity:** High

**Location:** D2 ("VND integer bigint, every finance/warehouse money column") + acceptance "Money is VND bigint end to end (DB → API → client), no float."

**Flaw:** Every money field in the client `T` types is `number` (`giaMua/giaBanSi/giaBanLe`, `src/types/masterdata-types.ts:76-80`; `giaNhap/giaBan`, `:85-86`; `tienKhoan`, `:101`; `soTien`, `:143`; `tienCong`, `:115-116,166`). The wire contract the plan freezes as "byte-identical" therefore transports money as JSON `number`. A Postgres `bigint` exceeding `Number.MAX_SAFE_INTEGER` (9.007e15) silently loses precision when parsed by JS `JSON.parse`. VND totals (e.g. large invoice/period aggregates) can plausibly approach/exceed this. "End to end bigint" is contradicted by the client type being `number`, and the plan does not call for a client-type migration to `string`.

**Failure scenario:** A period-close snapshot `tong_tien` or an aggregated receivable serializes as `bigint` `9007199254740993`, arrives at the client as `9007199254740992` — a silently wrong financial total in a system whose whole point is transactional integrity. No error is thrown; the books are quietly wrong.

**Evidence:** `src/types/masterdata-types.ts:76-80,85-86,101,115-116,143,166` (money = `number`), plan acceptance "byte-for-byte" wire vs. "bigint end to end" — the two are inconsistent.

**Suggested fix:** Decide and document the money-on-wire representation as **string** (or number-with-documented-safe-ceiling) and migrate the client money types accordingly. This breaks "byte-identical," so the plan must explicitly carve money fields out of the parity guarantee and add a contract test for a value > 2^53.

---

## Finding 8: Dual-run flag creates a mixed-auth window — real endpoints protected, un-flipped resources still mock-open

**Severity:** High

**Location:** D5 / Phase 1 §"dual-run per-resource flag" (`VITE_REAL_RESOURCES`), Phase 7 step 3 ("remove mock fallback … for all migrated resources").

**Flaw:** Enforcement (JWT + RBAC) only exists on flipped resources. Un-flipped resources keep the mock path, whose login "accepts any non-empty credentials" (`src/pages/auth/LoginPage.tsx:39-42`) and whose data access has zero auth (`makeMockApi` just returns arrays, `src/mock/masterdata/index.ts:77-118`). During the P1→P6 window (multiple resources, many weeks), the app ships to any environment with a **partially-enforced** posture: `khach-hang` is real+gated, but every not-yet-migrated resource is fully open and served from bundled seed data in the browser. The RBAC/branch guarantees are per-resource, not global.

**Failure scenario:** The plan deploys after Phase 4 (repair migrated) but before Phase 6 (finance). Finance is still mock → any authenticated-looking user reads/writes công-nợ and chứng-từ with no permission check and no branch scope, because that data path never hits the server. "The app keeps working throughout the migration" is exactly the risk: it keeps working *without enforcement* for un-flipped resources.

**Evidence:** `src/pages/auth/LoginPage.tsx:39-42` (mock accepts any creds), `src/mock/masterdata/index.ts:77-118` (mock API = unguarded array ops), Phase 1 acceptance "dual-run flag flips khach-hang mock↔real" (per-resource, not global).

**Suggested fix:** Make the plan state that **no environment reachable by real users may run in dual-run mode**; dual-run is dev/CI-only. Any deploy target must have all reachable resources flipped real, or the mock bundle excluded from the production build entirely. Add a build-time guard that fails the prod build if `VITE_REAL_RESOURCES` != all. Otherwise a mid-migration deploy is an auth bypass.

---

## Finding 9: Plan's cited source-of-truth reports (entity map, brainstorm) do not exist

**Severity:** High

**Location:** `plan.md` §Overview (links to `../reports/brainstorm-260707-1618-…` and `../reports/workflow-subagent-260707-1618-backend-entity-endpoint-map-report.md`); every phase references "the entity map" for schemas, FKs, filter allowlists, and cell counts (Phase 1 §Related Code Files, Phase 3 §Architecture "from the entity map," Phase 4/5/6 "entity map §…").

**Flaw:** The `reports/` directory is empty (`ls` shows only `.` and `..`). The plan treats the entity/endpoint map as the authoritative spec for table columns, FK order, the "22-field filter allowlist" (Phase 4 step 5), and the "~200 menu_function rows" count (Phase 2 step 2). None of it exists to verify against. The security-relevant allowlists (which columns are filterable/sortable — see Findings 5 & 6) are deferred to a document that isn't present.

**Failure scenario:** Implementers invent the allowlists and schemas ad hoc, with no reviewed source. The filter/sort allowlists — the primary injection defense — get authored under deadline without the claimed spec, maximizing the chance a scoped or secret column slips onto an allowlist.

**Evidence:** `plans/260707-1612-real-backend-database/reports/` is empty (verified via directory listing — only `.`/`..`); `plan.md:32-34` links to the two non-existent reports.

**Suggested fix:** Either restore/attach the entity-endpoint map and brainstorm reports before execution, or downgrade every "from the entity map" reference to an in-phase deliverable with its own review gate. The filter/sort allowlists must be concretely enumerated in the phase files (security artifacts), not deferred to a missing document.

---

## Finding 10: Refresh-token rotation + CSRF on the cookie route is delegated to "a vetted recipe" with no concrete design

**Severity:** Medium

**Location:** Phase 1 §Risk Assessment ("Auth security … follow a vetted NestJS auth recipe; refresh in httpOnly cookie … add CSRF protection on the cookie-based refresh route") and step 4 (`POST /auth/refresh` (rotation)).

**Flaw:** The single most attack-prone surface — a cookie-authenticated `POST /auth/refresh` that mints new access tokens — is specified as one risk bullet pointing at an unnamed recipe. No design for: rotation-reuse detection (detecting a stolen-then-reused refresh token), refresh-token family invalidation, the CSRF mechanism (double-submit vs SameSite vs token), or cookie attributes (`SameSite`, `Secure`, `Path`, domain). The current app has zero auth infra to build on (`src/pages/auth/LoginPage.tsx:39-42` is a `navigate()` stub; no `auth-store` exists — verified missing), so there is no existing pattern to inherit; it is all net-new and under-specified.

**Failure scenario:** A cookie refresh route without CSRF hardening lets an attacker's page trigger `POST /auth/refresh` against the victim's cookie (CSRF), or a leaked refresh token is replayed indefinitely because there's no reuse detection/rotation-family revocation. Session fixation / token replay → persistent account access.

**Evidence:** `src/pages/auth/LoginPage.tsx:39-42` (auth is a stub today), `auth-store.ts` does not exist (verified — Phase 2 lists it as "new"), Phase 1 §Risk (single-bullet delegation to an unnamed recipe).

**Suggested fix:** Promote refresh/rotation/CSRF from a risk bullet to an explicit Phase 1 design deliverable: specify cookie attributes (`httpOnly; Secure; SameSite=Strict; Path=/auth/refresh`), the CSRF strategy for the refresh route, refresh-token rotation with reuse-detection + family revocation, and short access-token TTL. Add abuse tests (replay a rotated token → 401 + family revoked; cross-site POST to /auth/refresh → blocked).

---

## Cross-cutting note (not a separate finding)

Findings 1, 3, 5, 6, and 7 all stem from one root cause the plan under-weights: the "byte-identical `MockApi<T>` wire contract" is treated as a *feature* to preserve, but the mock's behaviors it locks in are **insecure by construction** — `SELECT *` serialization (incl. `password`), arbitrary-key filtering, arbitrary sort keys, and `number` money. The plan should state explicitly that the wire-parity guarantee is deliberately **broken** for: secret-bearing columns (project out), the filter/sort surface (allowlist), branch columns (never client-driven), and money (string). Parity is a migration convenience, not a security contract.

## Unresolved questions

1. Is `nhóm-quyền` truly the sole role holder, or is a menu also a role holder? The plan leaves this open (plan.md §Open decisions) but Findings 2-3 cannot be fully closed until it's resolved with seed data.
2. Which resources are branch-scoped vs global? The plan asserts `khach_hang` is scoped but never enumerates the full scoped set — required to audit Findings 4-5 completeness.
3. What is the authoritative canonical branch id? (`cn-*` vs `dak-lak`/`dak-nong` — Finding 4.)

Status: DONE — 10 findings (4 Critical, 5 High, 1 Medium); the byte-identical wire-parity goal locks in the mock's insecure `SELECT *` / arbitrary-filter / arbitrary-sort / number-money behaviors, the RBAC seed source and branch-id namespace don't actually exist as claimed, and the cited entity-map/brainstorm reports are absent.
