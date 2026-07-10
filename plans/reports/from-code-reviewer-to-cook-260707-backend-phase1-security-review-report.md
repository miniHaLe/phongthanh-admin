# Phase-1 Backend Security Review — Phong Thành admin

Reviewer: code-reviewer (adversarial, live-probed against localhost:3210 + Postgres 5434)
Date: 2026-07-07 (original) · 2026-07-08 (re-verification section appended)
Scope: api/src/{crud,auth,khach-hang,db,seed}, main.ts, src/api/ frontend seam, prod build guard.

> **RE-VERIFICATION (2026-07-08): C1, H1, H2, H3, M1 all RESOLVED — independently
> re-probed against the rebuilt live API, not taken on trust. See the
> "Re-verification" section at the end. M2 deferral to Phase 3 is ACCEPTABLE
> (conditions below). Verdict: no remaining blockers for Phase 1.**

## Headline

**CRITICAL: the CREATE path has no write-side branch check.** A single-branch,
non-super user can plant a `khach_hang` row into ANY branch by choosing a
`tinhId` that derives to a foreign `branchId`. Verified live: `tiepnhan1`
(branchIds=["cn-1"], superScope=false) created a row with `branchId="cn-2"`,
then got 404 reading it back — a write-only cross-tenant injection. This breaks
Gate 4 ("forged input cannot widen scope") on the one path that isn't
read-gated. Fix before ship.

Everything else (sort/filter allowlists, secret non-leak, read/update/delete
branch scoping, refresh reuse-detection by hash, seed) is fundamentally sound.
One HIGH functional break (frontend refresh is 403'd by its own CSRF guard) and
one HIGH auth-availability bug (benign concurrent refresh nukes the family) also
need fixing.

---

## CRITICAL

### C1 — Cross-branch CREATE: no write-side scope enforcement
`api/src/crud/crud.service.ts:145-164` (`create`) +
`api/src/khach-hang/khach-hang.resource-config.ts:51-55` (`stampCreate`).

`create()` derives `branchId` from client-supplied `tinhId` via `branchIdForTinh`
and inserts it with NO check that the derived branch is in `user.branchIds`.
`get/update/remove` are all gated by `branchScopeCondition`, but `create` is not.

**Live proof:** `tiepnhan1` (cn-1) POSTed `{tinhId:"tinh-dak-nong",...}` →
201 with `branchId:"cn-2"`; row confirmed in DB under cn-2; creator then gets
404 on GET of that id. A cn-1 clerk can pollute cn-2's customer list with rows
neither they nor anyone auditing by creator can see through normal scoped reads.

**Impact:** Multi-tenant write isolation is broken. This is the exact "forged
input cannot widen scope" invariant Gate 4 promises, on the only unguarded verb.
When ~37 more resources reuse this generic engine in Phase 3, every one inherits
the hole.

**Fix:** enforce the derived/target branch against the caller's scope in
`create` for branch-scoped resources. Concretely, after `stampCreate` computes
`branchId`, reject when `!user.superScope && !user.branchIds.includes(branchId)`
with a 403 (or 400 VI). Put this in the engine (`CrudService.create`), not in
per-resource config, so it covers all future resources by default:

```ts
if (this.config.branchColumn) {
  const target = (stamped as Record<string, unknown>)[this.config.branchColumn.name]
  if (!user.superScope && !user.branchIds.includes(target as string)) {
    throw new ForbiddenException('Không thể tạo bản ghi ngoài phạm vi chi nhánh')
  }
}
```
(or expose the derived branch from `stampCreate` explicitly rather than reading
it back off the column name.)

**Test gap that hid this:** the e2e suite covers cross-branch GET/PATCH (404)
but has NO cross-branch CREATE test. Add one: `tiepnhan1` create with
`tinhId=tinh-dak-nong` must be rejected, and no row must persist.

---

## HIGH

### H1 — Frontend refresh is blocked by its own CSRF guard (auth breaks after 15m)
`src/api/http-client.ts:38-52` (`refreshAccessToken`) vs
`api/src/auth/csrf-header.guard.ts` on `POST /auth/refresh`.

The refresh `fetch` sends `credentials:'include'` but does NOT set
`X-Requested-With: XMLHttpRequest`. The backend route requires that header and
returns 403 without it. **Verified live:** refresh without the header → 403
`"Thiếu tiêu đề bảo mật CSRF"`; with the header → 200.

**Impact:** the transparent 401-refresh-retry never succeeds in production.
Every access-token expiry (15 min TTL) fails to refresh → user is bounced to
login. This defeats criterion 10 ("no regression") at the seam and the entire
in-memory-access-token auth model.

**Why CI is green:** the MSW contract test (`http-client.contract.test.ts:157`)
mocks `/auth/refresh` with no CSRF assertion — a phantom-green test that proves
the retry wiring but not the header contract.

**Fix:** add the header to the refresh fetch (and to the eventual login/logout
callers when wired):
```ts
const res = await fetch(`${apiUrl()}/auth/refresh`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
})
```
Strengthen the contract test to assert the server would 403 without the header
(assert `request.headers.get('x-requested-with') === 'XMLHttpRequest'` in the
MSW handler).

### H2 — Benign concurrent refresh trips reuse-detection and revokes the whole family
`api/src/auth/auth.service.ts:121-168` (`refresh`).

The `usedAt`/`revokedAt` check (line 133) and the "mark used" UPDATE (155-158)
are not atomic and not a compare-and-swap (the UPDATE is `WHERE id=row.id`, no
`used_at IS NULL` guard). Two+ concurrent refreshes presenting the SAME valid
token all read `usedAt=null`, all pass the gate; the losers then re-enter and
hit the reuse branch, which revokes the ENTIRE family — including the token the
winner was just issued.

**Verified live:** 5 concurrent refreshes with one token → 1×200, 4×"revoked".
DB shows the winner's freshly-minted token in a fully-`revoked_at` family. The
legitimate user is logged out.

**Impact:** availability + wrong security semantics. Two browser tabs, a reload
mid-refresh, or any client that doesn't perfectly coalesce (the frontend
`coalescedRefresh` only dedupes within one JS context, not across tabs) will
kick the user out. It also poisons the theft signal: reuse-detection is supposed
to mean "stolen token replayed," but here it fires on ordinary concurrency.

**Fix:** make rotation an atomic claim. Change the "mark used" to a conditional
update and treat "0 rows affected" as "someone else already rotated this exact
token in a legitimate race" rather than a family-revoking reuse:
```ts
const claimed = await this.db.update(refreshToken)
  .set({ usedAt: new Date() })
  .where(and(eq(refreshToken.id, row.id), isNull(refreshToken.usedAt)))
  .returning({ id: refreshToken.id })
if (claimed.length === 0) {
  // lost a benign race on a not-yet-used token — do NOT revoke the family
  throw new UnauthorizedException('Phiên đăng nhập đang được làm mới, thử lại')
}
```
Reserve family revocation for presenting a token whose row was ALREADY
`usedAt`/`revokedAt` at read time (true replay of a spent token). A short grace
window (accept the previous token for N seconds) is a common alternative if you
want double-submits to both succeed; the minimal correct fix is the atomic
claim above.

### H3 — TOCTOU on update/remove: write has no branch predicate (latent, not currently exploitable)
`api/src/crud/crud.service.ts:166-188`.

`update`/`remove` do `await this.get(id, user)` (read-scoped) then
`UPDATE/DELETE ... WHERE id=id` with NO branch predicate on the write itself.
Today this is safe ONLY because `branchId` is server-owned and immutable in this
slice (update DTO excludes it, and update deliberately does not re-derive it from
`tinhId`). **Verified:** cross-branch PATCH/DELETE both 404 via the read gate.

**Why it's still HIGH:** correctness depends on an external invariant
(branch immutability) enforced elsewhere, not on the write. The moment any
future resource allows the branch column to change, or the read gate is
refactored, this becomes a real cross-branch write. Defense-in-depth belongs on
the write.

**Fix:** apply `scopedRowCondition(id, user)` to the UPDATE/DELETE `where` too,
and treat 0-rows-affected as the 404. Then the read pre-check becomes belt-and-
suspenders instead of the sole guard:
```ts
const [updated] = await this.db.update(this.config.table)
  .set({ ...dto, updatedAt: new Date() })
  .where(this.scopedRowCondition(id, user))
  .returning()
if (!updated) throw new NotFoundException(this.config.notFoundMessage(id))
```
(Keep the `get` if you want the 404 to distinguish "not found" from "not yours"
identically; the scoped write alone already collapses both to 404, which is the
desired behavior.)

---

## MEDIUM

### M1 — Unmapped/invalid `tinhId` on create → 500 instead of 400
`api/src/khach-hang/khach-hang.dto.ts:22` + `api/src/seed/branch-map.ts:16-22`.

The create DTO validates `tinhId` is a non-empty string but not that it is a
known tinh. A valid-Zod-but-unmapped value (e.g. `tinh-hanoi`) passes validation,
then `branchIdForTinh` throws a raw `Error` → uncaught → **500 verified live**
(`{"statusCode":500,"message":"Internal server error"}`). Even a mapped-but-
nonexistent tinh would 500 on the FK constraint.

**Impact:** unhandled error propagation at a trust boundary; a client can trigger
500s with ordinary input. Not a data-integrity hole (the insert is rejected), but
a 500 is the wrong contract and leaks "something threw."

**Fix:** validate `tinhId` against the known set at the boundary (or catch the
derivation error and rethrow as `BadRequestException` with a VI message). Prefer
boundary validation so the FK/derivation invariants are checked once.

### M2 — Generic engine `select()` returns all columns — future secret-leak footgun
`api/src/crud/crud.service.ts:85,108,134` and `nguoi_dung.passwordHash`.

The engine uses `db.select()` (all columns) with no projection/deny-list.
khach-hang has no secret column so Gate 3 holds TODAY (verified: no
password/passwordHash in responses). But the engine has NO structural guard: the
day `nguoi_dung` (or any table with a secret) is wired into this generic CRUD,
`passwordHash` serializes straight to the client. The gate is "this resource
happens to have no secrets," not "the engine cannot leak secrets."

**Fix (before Phase 3 wires sensitive tables):** add an explicit
`selectColumns` / `serializableColumns` allowlist to `CrudResourceConfig` and
have the engine project only those, or a `redactColumns` deny-list applied to
every returned row. Deny-by-default projection is the durable form of Gate 3.

### M3 — `nguoiTao` from JWT `tenDangNhap` — not spoofable, but note the trust source
`api/src/khach-hang/khach-hang.resource-config.ts:54`.

`nguoiTao: ctx.user.tenDangNhap` comes from the verified JWT payload, NOT from
the request body, so it is NOT client-spoofable (confirmed: create body has no
`nguoiTao`, Zod would strip it, and stampCreate overwrites regardless). This is
correct. One caveat: the audit field stores a login name, and the token is
signed with a symmetric `JWT_SECRET`; audit integrity is only as good as that
secret's secrecy. Acceptable for Phase 1; flagging so it's a conscious choice.

---

## LOW

### L1 — MSW contract tests are partly phantom-green
`src/api/http-client.contract.test.ts`. The 401-refresh-retry test (H1) and the
error-map tests assert client wiring but not the server-side contract they claim
to gate (CSRF header, real status semantics). They pass while H1 ships broken.
Tighten handlers to assert the headers/shape the real backend enforces.

### L2 — CSRF header value is a fixed well-known string
`api/src/auth/refresh-cookie.util.ts:17`. `X-Requested-With: XMLHttpRequest` is
fine as defense-in-depth alongside `SameSite=Strict`; documented and acceptable.
No action; noted for completeness.

### L3 — SQL-injection residue: none found
The `COLLATE "vi-VN-x-icu"` template (`crud.service.ts:100`) interpolates a
Drizzle column object (parameterized identifier, allowlist-resolved) and a
`sql\`DESC\`` fragment derived from an enum-validated `dir`. No raw user string
reaches SQL. Verified live: `sort=tenKH;DROP TABLE` → 400. Clean.

---

## Acceptance criteria verdict

| # | Criterion | Verdict | Note |
|---|-----------|---------|------|
| 1 | Gate 1 sort allowlist | **MET** | unknown/injection sort → 400 VI (live) |
| 2 | Gate 2 filter allowlist; branch_id/branchId never filterable | **MET** | both → 400 (live); trailing-AND branch predicate confirmed |
| 3 | Gate 3 no secret leak (deny-by-default DTO) | **MET (fragile)** | holds for khach-hang; engine has no structural projection guard — see M2 |
| 4 | Gate 4 branch scope: empty⇒deny, super sees all, forged cannot widen, cross-branch GET/PATCH/DELETE→404 | **FAILED** | read/update/delete OK; **CREATE lets a non-super user write any branch (C1)** |
| 5 | Gate 5 dual-run not a deploy mode (prod build guard) | **MET** | fail-closed superset check; verified logic |
| 6 | Auth: JWT claims, httpOnly refresh cookie flags, rotation+reuse+family revoke, no enumeration, CSRF guard | **PARTIAL** | cookie flags/claims/enumeration/hash-compare all correct; reuse-detection wrong under concurrency (H2); frontend can't satisfy CSRF guard (H1) |
| 7 | Seed: frozen, FK order, preserve id, idempotent, FK-closure, super-scope by login, must_change_password | **MET** | all confirmed in seed-database.ts + validate-fk-closure.ts |
| 8 | Branch namespace → cn-*; branch_id derived tinhId (dak-lak→cn-1, dak-nong→cn-2) | **MET** | branch-map.ts fail-loud on unmapped |
| 9 | Wire shape byte-identical except money; PagedResult; server owns id/createdAt/updatedAt/active | **MET** | PagedResult shape + server-stamped fields confirmed |
| 10 | No regression: FE 448, BE e2e 22, no lint/type errors | **PARTIAL** | BE typecheck clean; BE e2e now 24 `it()` (2 added); but H1 is a live seam regression the suite doesn't catch, and no cross-branch-CREATE test exists |

---

## Recommended actions (priority order)

1. **C1** — enforce branch scope on `create` in the engine + add cross-branch-create e2e test. (blocks ship)
2. **H1** — send `X-Requested-With` on the frontend refresh (and future login/logout) fetch; assert it in the contract test. (blocks ship)
3. **H2** — atomic compare-and-swap rotation; don't revoke family on benign not-yet-used races. (blocks ship)
4. **H3** — put the branch predicate on the update/delete write, not just the read pre-check.
5. **M1** — validate `tinhId` against known tinhs at the boundary → 400 not 500.
6. **M2** — add deny-by-default column projection to `CrudResourceConfig` before Phase 3 wires sensitive tables.

## Unresolved questions

- Product intent on H2 double-submit: should two concurrent legit refreshes BOTH
  succeed (grace window) or should the loser get a soft retry? Either is fine;
  the current "revoke the family" is not.
- Is `nguoiTao` meant to be `hoTen` (display name) rather than `tenDangNhap`
  (login)? The config comment calls it a display-only audit field but stores the
  login. Confirm the intended value.
- Will Phase 3 wire `nguoi_dung` into this generic engine? If yes, M2 becomes
  blocking at that point.

---

# Re-verification (2026-07-08)

All checks below were re-run independently against the rebuilt API on :3210 and
Postgres 5434 — live exploit re-probes, not a reading of the diff. Each planted
test row was cleaned up.

## C1 — cross-branch CREATE — RESOLVED
`crud.service.ts` now calls `assertBranchWritable(row, user)` in `create()`
(engine-level, so all future resources inherit it). The `branchRowKey()` helper
resolves the Drizzle row property (`branchId`) by reference-matching the
configured column against the table — correct, and it fixes the `.name` regression
that would have 403'd in-branch creates.
- Live: `tiepnhan1` (cn-1) POST `tinhId=tinh-dak-nong` (→cn-2) → **403** VI; DB
  shows **0 rows planted**.
- Live: `tiepnhan1` POST `tinhId=tinh-dak-lak` (→cn-1) → **201**, `branchId=cn-1`
  (in-branch path not broken).
- e2e now covers both: "a cn-1 user cannot CREATE a row in cn-2 (write-side
  branch scope, gate 4)" + "a cn-1 user CAN create in their own branch". The
  blind spot I flagged is closed.

## H1 — frontend refresh CSRF — RESOLVED
`http-client.ts refreshAccessToken` sends `X-Requested-With: XMLHttpRequest`.
- Live: refresh WITHOUT header → **403**, WITH header → **200**.
- Contract test now asserts `refreshCsrfHeader === 'XMLHttpRequest'`
  (`http-client.contract.test.ts:178`) — the phantom-green gap is closed.

## H2 — non-atomic reuse-detection — RESOLVED
`auth.service.ts refresh()` rewritten to an atomic CAS claim
(`UPDATE ... SET usedAt WHERE id=? AND usedAt IS NULL RETURNING`) plus a
grace-window split between benign concurrency and theft.
- Part A (benign burst): 5 concurrent refreshes of one token → **1×200, 4×401**,
  and the **winner's new token still refreshes (200)** — family NOT revoked, user
  stays logged in. This was the whole bug; it's fixed.
- Part B (theft): replaying a rotated token >10s later → **401** and the whole
  family is **revoked** (DB: `revoked=true, rows=2`); the legit chain is killed.
  Theft detection preserved.
- Minor nit (LOW, non-blocking): the in-grace loser returns the message "Phiên
  đăng nhập đã bị thu hồi" ("session revoked") even though nothing was revoked.
  A "please retry" message (like the CAS-loser path already uses) would be more
  accurate. Cosmetic only.

## H3 — write-side branch predicate — RESOLVED
`update()` and `remove()` now use `scopedRowCondition(id, user)` on the write
itself (0-rows ⇒ 404), not just the prior `get()`.
- Live: `tiepnhan1` PATCH and DELETE on cn-2 row `kh-50` → **404** both; `kh-50`
  intact in DB. TOCTOU window closed; correct even if `branchId` becomes mutable.

## M1 — unmapped tinhId → 500 — RESOLVED
`stampCreate` wraps `branchIdForTinh` and throws `BadRequestException`.
- Live: admin POST `tinhId=tinh-hanoi` → **400** VI ("Tỉnh không hợp lệ hoặc chưa
  gán chi nhánh"), no longer a 500. e2e covers it.

## Suite re-run (independently executed, not taken on trust)
- Backend: `npx tsc --noEmit` exit 0; `npm test` → **25/25** e2e pass.
- Frontend: `npx tsc -p tsconfig.app.json --noEmit` exit 0; `npx vitest run` →
  **448/448** pass (126 files). (happy-dom teardown noise in stderr; not a failure.)

## M2 deferral — verdict: ACCEPTABLE for Phase 1, conditionally
khach-hang has no secret column, so nothing leaks today (re-confirmed: no
`password*` in responses). Deferring the deny-by-default column projection to
Phase 3 is fine **provided** two guardrails hold:
1. The projection allowlist lands in `CrudResourceConfig` + the engine BEFORE any
   table with a secret/PII column (`nguoi_dung.passwordHash` above all) is wired
   into the generic engine — not after. If `nguoi_dung` goes through this engine
   without projection, `passwordHash` serializes to the client. That specific
   wiring is the hard gate; M2 becomes **blocking** the moment it's on the table.
2. Add a cheap tripwire now so the deferral can't be forgotten: a test asserting
   the engine only returns allowlisted columns (or that no wired resource exposes
   a column named `*passwordHash*`/`*password*`/`*secret*`). Without it, the
   deferral relies on someone remembering across phases.

This is a documented, conscious deferral — acceptable, not a silent gap.

## Answers to the two open questions
- **`nguoiTao` = login vs `hoTen`:** This is a product/UX call, not a security
  one, so it's the user's decision, not mine to settle. Security-wise both are
  fine: the value comes from the verified JWT (`tenDangNhap`), is not
  client-spoofable, and storing the login is actually a *stronger* audit key than
  a display name (unique, stable, immune to rename). If the UI needs to *show* a
  human name, resolve `hoTen` at read time from the login rather than denormalizing
  it onto every row. Recommend: keep storing `tenDangNhap`; surface `hoTen` in the
  view layer. Flagging for the user to confirm the intended displayed value.
- **Phase 3 wiring `nguoi_dung` through the generic engine:** if yes, M2 is a
  hard prerequisite for that step (see above) and the engine must also never
  serialize `passwordHash`. I can't decide the architecture; I'm flagging the
  constraint so it's a conscious choice when Phase 3 is planned.

## Residual items (all non-blocking)
- LOW: H2 in-grace loser message says "revoked" when nothing was revoked
  (cosmetic).
- MEDIUM/deferred: M2 projection — track it with a tripwire test (above) so it
  can't silently slip past the `nguoi_dung` wiring.
- L1 (original): other MSW handlers still assert client wiring more than server
  contract; the refresh one is now fixed. Low priority.

**Re-verification verdict: C1/H1/H2/H3/M1 resolved and live-proven. No remaining
Critical or High. Phase 1 is clear to ship on the security axis, with M2 tracked
as a Phase-3 prerequisite.**
