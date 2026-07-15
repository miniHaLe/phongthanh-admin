---
date: 2026-07-15
session: 260715-1817
topic: voucher-real-db-sync
status: completed
plan: plans/260715-1404-voucher-code-format-and-real-db-sync/plan.md
---

# Voucher Format and Real DB Sync

## Context

Two linked goals: standardize newly created voucher codes, then remove real/mock data drift for users and catalogs. Existing app remained dual-run through `VITE_REAL_RESOURCES`; production must ship the full real-resource set.

Scope delivered frontend voucher generation, real Người Dùng identity CRUD, 15 planned catalog resources including Chi Nhánh, frozen fixture migration, lookup rewiring, customer/product custom write fixes, deployment guard expansion, and regression proof.

No commit, push, PR, merge, or deployment occurred in this session.

## What Happened

- Added shared `PREFIX-yyyymm-N` generator. PSC, PBH, PTH, PCK, PCH, PNK, PTT, PCC use per-type/per-month ordinals. Legacy seed codes ignored and unchanged.
- Added real Người Dùng CRUD: bcrypt-12 create password, immediate login, superScope-only writes, Vietnamese 403 messages, strict server-owned fields, secret-free list/get/create/update responses.
- Added Nhóm Quyền read path and real catalog backend: 14 new tables plus existing Chi Nhánh endpoint, Drizzle migration, resource DTOs/allowlists/modules, frozen fixtures, FK closure validation, ordered idempotent seed.
- Extended generic CRUD with awaited create stamping, response projection, write guard, and Vietnamese unique/FK error translation.
- Rewired runtime catalog consumers through shared lookup APIs. Added paginated lookup fetch, label resolution, async CRUD options, and list/lookup invalidation.
- Replaced direct mock writes for customer, product, model, manufacturer quick-create flows. Customer search now uses real API search.
- Fixed short-viewport customer dialogs: scrollable content, reachable Save, awaited persistence, duplicate-submit guard, errors, query invalidation.
- Expanded production allowlist to 18 resources across env example, Pages workflow, Dockerfile, Compose, and build guard.
- Split test ownership: root Vitest excludes `api/**`; API Jest owns six DB-backed suites.

Adversarial review found and drove four important corrections:

- Người Dùng login/name filters existed in UI but backend rejected them. Added exact allowlists and secret-free filter tests.
- Lỗi Sửa Chữa fallback mixed legacy branch IDs with canonical `cn-*`. Added resource-mode adapter: legacy IDs in mock, canonical lookups in real mode.
- Nullable catalog PATCH fields normalized blank to `undefined`, causing false-success no-op updates. Added explicit nullable DTO helpers: omission no-op; blank/null clears nullable text/FK/money; generated non-null `maNhaKho` stays protected.
- `ALLOW_MOCK_BUILD=1` bypassed production enforcement. Production now rejects override for both `--prod` and `NODE_ENV=production`; non-production preview override remains allowed.

Browser verification initially exposed customer create failure. Post-fix run proved `POST /khach-hang` 201, DB persistence, SPA navigation/search visibility, and hard-reload persistence. Live smoke also proved admin-created user immediate login, secret-free response, warehouse create-to-dependent-dropdown sync, and PBH `-1/-2` sequence with legacy rows preserved.

Verification finish line:

- Frontend: 143 files, 507 tests passed.
- API: 6 suites, 74 tests passed; catalog focused suite 24/24.
- Guard focused suite: 4/4.
- Type-check, API build/lint, root lint, production build, seed idempotency, FK closure, and `git diff --check` passed.
- Production guard: full set pass; missing `phi-giao` fail; production mock override fail; non-production override pass.
- Root lint retained 111 non-blocking existing warnings; ts-jest emitted one deprecation warning.
- Final independent review: PASS, 9.2/10, zero Critical/High/blockers.

## Reflection

Main lesson: green happy-path suites did not prove boundary semantics. First review caught visible filter and namespace regressions. Browser work caught a viewport interaction failure. Adversarial probes caught two deeper contract failures: explicit clear becoming silent no-op, and a production safety bypass.

Shared seams paid off. One voucher helper prevented eight formats drifting. One CRUD engine carried auth projection/error behavior. One lookup seam removed direct-array sync bugs. But generic seams also amplify mistakes: DTO normalization and deployment override ordering affected many resources at once. Boundary tests must accompany shared abstractions.

Dual-run compatibility needs explicit namespace ownership. Lỗi Sửa Chữa could not blindly consume the real Chi Nhánh namespace while its own resource remained mock. Resource-local mode selection made the transition predictable.

Live evidence mattered. Customer persistence looked correct in code and focused tests, yet Save was unreachable in the tested viewport. Browser network plus DB checks converted uncertainty into a concrete fix.

## Decisions Made

| Decision | Rationale | Consequence |
|---|---|---|
| Voucher ordinal = max matching prefix/month + 1 | No counter rollover state; legacy formats naturally ignored | Frontend mock behavior stable; server concurrency still deferred |
| User writes require `superScope` | Existing JWT invariant; role seed IDs not authorization rules | Temporary coarse guard until full RBAC |
| Never serialize password fields | Identity boundary must not expose hashes or create password | Response projection applied to every CRUD read/write response |
| Freeze mock catalog rows as committed fixtures | Preserve IDs/FKs and deterministic migration input | Seed repeatable; fixtures no longer regenerated at runtime |
| Resource's own flag selects Lỗi Sửa Chữa branch namespace | Mock rows use legacy IDs; real DB uses canonical IDs | Both dual-run paths remain internally consistent |
| Explicit blank/null clears only nullable DB fields | PATCH intent must differ from omission | No more false-success nullable updates |
| Blank `maNhaKho` means omit; null rejects | Code is non-null and server-generated when absent | Generated code cannot be accidentally cleared |
| Production mock override forbidden | Dual-run is development behavior, not deploy mode | `ALLOW_MOCK_BUILD=1` remains preview-only |
| Root/API tests use separate runners | Avoid duplicate/misconfigured collection | Vitest frontend ownership; Jest DB/API ownership |

## Next Steps

- Complete Phase 6 docs/parent-plan sync and close plan status.
- Full RBAC matrix, permission guard, role/menu/function tables remain in parent identity phase.
- HR entities, menu/chức-năng catalogs remain deferred.
- Repair, warehouse ledger, finance, invoice, and report bespoke real endpoints remain deferred.
- Server-side voucher sequences must reuse `PREFIX-yyyymm-N` with concurrency-safe per-prefix/month allocation.
- Remove `CURRENT_USER` mock dependence in later backend phases.
- Migrate money wire values from JSON number to string; until then consider `Number.MAX_SAFE_INTEGER` caps.
- Align frontend nullable/canonical types with real response shapes.
- Improve required lookup error states and same-mounted `loadOptions` refresh behavior.
- Optional final manual evidence: create PSC in browser; automated coverage already passes.
- Commit/deploy only after user approval; neither occurred here.

## Unresolved Questions

- When should residual lookup cache/error hardening land: this plan follow-up or parent real-backend phases?
- Should nullable wire types be normalized at HTTP boundary or represented directly as `null` in frontend domain types?
