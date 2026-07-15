---
phase: 3
title: "API Contract Hardening"
status: in-progress
effort: "M"
priority: P1
dependencies: [2]
---

# Phase 3: API Contract Hardening

## Overview

Fix the shared CRUD engine's contract violations before `260707-1612` Phase 3 fans it out to ~37 resources: unvalidated filter values → 500s, unmapped constraint violations → 500 instead of 409/400, missing ORDER BY tiebreaker → nondeterministic pagination, client/server pageSize mismatch, seed address gap.

Findings: F-D4, F-D5, F-D6, F-D9, F-D7, F-D12, F-D10 (document), F-D13, F-D14, F-D15, F-D17-server-note. Live-verified: `filters[loaiKhachHangId]=abc` → 500; `search=%` matches all rows; pageSize 300 → raw Zod 400.

## Requirements

- Functional: malformed filter values → 400 with VI message; unique/FK violations → 409/400 VI on create, update, AND delete; deterministic pagination; `daiLyTen` server-enriched; seeded customers get address codes via a one-shot migration.
- Non-functional: fixes land in `CrudService` once, inherited by all resources.

## Architecture

- Filter values: extend `filterableColumns` per-resource config with a value schema (string/number/boolean) defined as ONE shared type; reject non-scalars and `NaN` inside `CrudService.list` using the existing 400 VI error shape.
- Constraint mapping (red-team widened): try/catch in `CrudService` create/update AND `remove()` — `remove()` is a bare delete today and the khach-hang self-FK (`dai_ly_id`, NO ACTION) guarantees 23503 on dealer-parent deletes (Phase 2's bulk delete surfaces these as row failures). Map `23505` → 409 and `23503` → 400/409 with VI messages ("đang được tham chiếu" for referenced-row deletes).
- Ordering: always append `id ASC` tiebreaker; server default `createdAt desc` when `sort` absent.
- **Seed backfill (red-team corrected mechanism; Validation Session 1 = BOTH):** editing fixtures inside `seedDatabase` is a NO-OP on the live DB — every insert is `ON CONFLICT (id) DO NOTHING`, so existing rows never update (and a naive flip to DO UPDATE would clobber user edits on every deploy). Ship BOTH: (a) a one-shot Drizzle migration: `UPDATE khach_hang SET tinh_thanh_code=…, phuong_xa_code=… WHERE tinh_thanh_code IS NULL AND id IN (<seed ids>)` — guarded to NULL-code rows so user-edited addresses are untouched; mapping bounded to the legacy fixture's two provinces (Đắk Lắk/Đắk Nông), validated against `docs/vietnam-administrative-data-provenance.md`; ambiguous rows stay NULL rather than guessed; AND (b) a permanent fallback-render chain in the customer columns — modern code name → legacy address name → "—" — so future legacy imports display sensibly without migrations. Also update the fixture so fresh DBs seed codes directly. Test against a PRE-SEEDED database, not a fresh one.
<!-- Updated: Validation Session 1 - OQ3 resolved: migration + fallback render -->
- **Branch semantic (Validation Session 1 — CREATOR'S BRANCH):** the API's existing create-stamp (`ctx.user.branchIds[0]`) is the decided rule. Align the seed's province-derivation (`branch-map.ts`) to creator-branch semantics (seeded rows keep their current values; the DECISION is documented, no data rewrite needed), delete the stale province-derivation comment at `crud.service.ts:164-166`, record in `docs/codebase-summary.md`. Downstream: Phase 8's branch-switcher ships the REAL-SCOPING variant (customer list visibly filters by branch).
- **mustChangePassword (red-team simplified — one source of truth):** the flag already rides the JWT payload (`api/src/auth/jwt-payload.ts:10`) delivered on every login AND refresh — no API change needed. Client decodes it from the access token in a small selector (no new state in the `auth-token.ts` singleton, no refresh-response field); `RequireAuth` redirects to `/doi-mat-khau` while set, with an explicit pathname exclusion for `/doi-mat-khau` itself (it lives inside the guarded shell — an unconditional redirect would loop). Server-side route guard (allow only `/auth/*` while flagged) is small given the flag is in the payload: land it HERE rather than assuming 260707-1612 owns it — that plan's phase-02 has no mention of it (verified), so "noted there" would be fictional. Record a pointer in this plan's report for the 260707-1612 implementer.

## Related Code Files

- Modify: `api/src/crud/crud.service.ts` (filter-value validation 52-68; constraint catch on create/update/remove 200-233; ORDER BY tiebreaker 92-107; ILIKE escape 71-76)
- Modify: `api/src/crud/list-params.dto.ts` (filter value typing)
- Modify: `api/src/khach-hang/khach-hang.resource-config.ts` + sibling resource configs (per-filter value schemas from the shared type; `parse` no longer emits NaN)
- Modify: `api/src/khach-hang/khach-hang.service.ts` (enrich `daiLyTen` batch lookup like `nganHangTen`)
- Create: `api/drizzle/<next>-backfill-khach-hang-address-codes.sql` (one-shot guarded UPDATE migration)
- Modify: `api/seed-fixtures/khach-hang.json` + `api/src/seed/seed-database.ts` (codes for fresh seeds)
- Modify: `src/config/crud-configs/khach-hang.config.ts` (drop mock `daiLyName` lookup once server enriches) — NOTE: this file is also edited by Phase 4; run P3 before P4's config edits (see plan dependency correction)
- Contract test: pageSize cap (client options already trimmed in Phase 2; centralization in Phase 5 covers the 5 mock-page copies before the 260707-1612 fan-out makes them real)
- Modify: `src/routes/RequireAuth.tsx` (boot refresh via `coalescedRefresh`, F-D13; mustChangePassword redirect with `/doi-mat-khau` exclusion)
- Create: `src/api/jwt-claims.ts` (decode `mustChangePassword` from the in-memory access token — single source of truth)
- Create: `api/src/auth/must-change-password.guard.ts` (server-side: only `/auth/*` while flagged)
- Modify: `src/lib/format.ts` (32 — `HH:mm` 24h or `vi` locale; closes the AM/PM cosmetic; tiny, rides along here since it's the only format.ts touch in the plan)
- Docs: `api/src/crud/crud.service.ts:164-166` stale branch-derivation comment — replace with the decided semantic (creator's branch, validated); record decision in `docs/codebase-summary.md`

## Implementation Steps

1. Filter-value schemas + NaN rejection; contract tests: `filters[loaiKhachHangId]=abc` → 400 VI, nested object → 400, boolean/string/number accepted per schema (enumerated table — no fuzz harness; the malformed classes are enumerable).
2. Postgres error mapping in CrudService for create/update/remove (23505→409, 23503→400/409) + tests: duplicate model name, stale `phuongXaId`, delete of a dealer-parent row.
3. `id ASC` tiebreaker + server default sort; test: two pages over identical `createdAt` never repeat/skip rows; MSW contract test for the 200 cap.
4. ILIKE escape (`%`,`_`,`\`); test `search=%` matches only literal `%`.
5. `daiLyTen` enrichment + config cleanup.
6. Backfill migration (guarded UPDATE) + fixture update + fallback-render chain (modern → legacy → "—") in customer columns; test against pre-seeded DB asserting live rows gain codes and user-edited rows are untouched; verify live table shows Phường/Xã after deploy.
7. Auth: coalesced boot refresh; JWT-claim decode + RequireAuth gate (with exclusion); server guard; e2e: reload during forced-change lands back on /doi-mat-khau, and CRUD calls 403 while flagged.
8. Branch-semantics decision (creator's branch — validated) documented in codebase-summary; stale province-derivation comment removed; pointer note for 260707-1612 phase 2 recorded in this phase's report.

## Success Criteria

- [x] No user-controllable input path on list/create/update/DELETE endpoints returns 500 (enumerated contract-test table across the six real resources).
- [x] Duplicate bank/model create → 409 VI toast; dealer-parent delete → mapped VI error, not raw 500.
- [x] Pagination over identical `createdAt` rows is stable across pages (test).
- [ ] Live seeded customers display Tỉnh/TP + Phường/Xã (backfill verified on the live DB, not just CI).
- [x] Reload during must-change-password lands on /doi-mat-khau; API rejects non-auth calls while flagged; no redirect loop on /doi-mat-khau.
- [x] `npm run test:api:with-db` green; client contract tests green.

## Risk Assessment

- One-shot migration on live data → guarded by `WHERE tinh_thanh_code IS NULL` + seed-id allowlist; dry-run SELECT in the PR; ambiguous mappings stay NULL by design (no-guess rule).
- JWT-claim decode adds a base64 parse on the client → trivial; token is already in memory; no signature verification implied (display-gating only, server guard is authoritative).
- Filter-value schemas per resource risk drift → single shared schema type; engine rejects unknown shapes by default.
- Server mustChangePassword guard could lock out a user whose password change endpoint itself errors → guard allowlists all `/auth/*` including change-password and logout.
