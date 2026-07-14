# Red-Team Plan Review — Failure Mode Analyst (Flow Tracer)

Plan: `plans/260713-1817-fullstack-live-review-remediation/`
Reviewer lens: Murphy's Law — mid-migration states, phase-ordering breakage, data migration, deploy/rollback, cascading failure. Security out of scope per directive.
All citations grep-verified against the working tree (branch `feature/customer-model-relational-address`).

---

## Finding 1: Phase 3 seed "backfill" is a guaranteed no-op on the live DB — `onConflictDoNothing` discards the new address codes for every existing row

- **Severity:** Critical
- **Location:** Phase 3, "Architecture" (seeds bullet) + "Related Code Files" (`api/src/seed/seed-database.ts (252-270 — map legacy fixture provinces to official codes)`) + success criterion "Seeded customers display Tỉnh/TP + Phường/Xã in the live table"
- **Flaw:** The plan's chosen mechanism for the backfill is editing the fixture mapping inside `seedDatabase`. But the seed routine inserts with `ON CONFLICT (id) DO NOTHING` on all 14 tables — the khach_hang insert at `api/src/seed/seed-database.ts:248-273` ends with `.onConflictDoNothing({ target: schema.khachHang.id })`. On any database where the 50 customers already exist (the live Render DB — `render.yaml` `buildCommand` runs `npm run seed` on every deploy), the enriched rows are silently skipped. The new `tinhThanhCode`/`phuongXaCode` values never reach existing rows.
- **Failure scenario:** Phase 3 lands, CI is green (e2e global-setup seeds a *fresh* DB where the insert path applies the codes), deploy runs `db:migrate && seed` — every conflict-skips — live table still shows blank Tỉnh/TP for all 50 customers. Success criterion fails in prod while passing in every automated gate: the exact "passes CI, breaks in production" shape. Worse, if someone "fixes" it by flipping to `onConflictDoUpdate`, every redeploy re-stamps seed values over any customer a user has since edited — repeated silent data clobber on a live table, on every deploy, forever.
- **Evidence:** `api/src/seed/seed-database.ts:1-4` ("Idempotent", `ON CONFLICT (id) DO NOTHING`), `:272` (khachHang conflict target), 14/14 inserts use `onConflictDoNothing` (grep count); `render.yaml` buildCommand `npm run db:migrate && npm run seed`; schema columns exist and are nullable-paired (`api/src/db/schema/khach-hang.ts:30-31,66`).
- **Suggested fix:** Backfill must be a one-shot Drizzle *migration* (UPDATE ... WHERE tinh_thanh_code IS NULL AND id IN (seed ids), guarded so user-edited address rows are untouched), not a fixture edit. Keep the fixture edit only for fresh installs. Add an explicit "run against a pre-seeded DB" test that asserts existing rows gain codes.

---

## Finding 2: Phase 4 removes `refetch()` from `onSaved`, but the dealer modal that Phase 2 rewires has NO cache invalidation — dealer creates silently stop appearing again

- **Severity:** High
- **Location:** Phase 4, "Related Code Files" (`customer-editor-dialog.tsx / them-khach-hang-modal.tsx / QuickCreateKhachHang.tsx / src/pages/danh-muc/KhachHangPage.tsx (drop refetch() from onSaved — invalidation already refetches)`) × Phase 2, "Implementation Steps" step 1
- **Flaw:** Flow trace of the three save paths wired in `KhachHangPage.tsx`:
  - `CustomerEditorDialog.save()` → `queryClient.invalidateQueries({ queryKey: ['khach-hang'] })` (`customer-editor-dialog.tsx:38`) — invalidation exists; dropping refetch is safe.
  - `QuickCreateKhachHang` → invalidates (`QuickCreateKhachHang.tsx:31`) — safe.
  - `ThemDaiLyModal` → **zero** `queryClient`/invalidate calls (grep exits 1); its ONLY list-refresh mechanism is the page callback `onCreated={() => listQuery.refetch()}` (`KhachHangPage.tsx:284-285`). And `persistCustomer` itself does not invalidate (`create-customer.ts:11-19` — bare `customerApi.create`).
  Phase 2 step 1 ("Dealer modal → persistCustomer; delete/gate createCustomer; align address fields; inline errors; never close on failure") never specifies adding invalidation to the modal. Phase 4 then sweeps `KhachHangPage.tsx` dropping `refetch()` from the saved/created callbacks on the premise "invalidation already refetches" — true for two paths, false for the dealer path.
- **Failure scenario:** P2 ships; its acceptance ("row visible in /khach-hang after refetch") passes because the `onCreated` refetch is still there. P4 ships; dealer create now persists to the real API but the list never refetches — the row appears only after a manual reload. This reinstates the exact class of symptom P2 exists to kill ("save succeeded but not visible"), one phase later, in the one flow that was the headline data-loss finding (F-D2/F-E5). P4's msw-count test ("Create/edit customer fires exactly one list GET") is specced against customer create/edit, not dealer create, so the regression sails through the gate.
- **Evidence:** `src/pages/danh-muc/KhachHangPage.tsx:262-285` (three callbacks, all `listQuery.refetch()`); `src/features/customer/them-dai-ly-modal.tsx` (no queryClient import anywhere); `src/features/customer/create-customer.ts:11-19`; `src/hooks/use-crud.ts:75` (list key `[key, listParams]`, prefix-invalidatable).
- **Suggested fix:** Phase 2 step 1 must state "ThemDaiLyModal invalidates `['khach-hang']` on success (same as CustomerEditorDialog)". Phase 4's refetch-removal step gets a precondition: grep every onSaved/onCreated consumer for an invalidation before deleting its refetch, and the ≤1-GET msw test must cover the dealer path too.

---

## Finding 3: Phase 3's constraint mapping covers create/update only — the delete path stays a raw 500, and the khach_hang self-FK guarantees bulk delete hits it

- **Severity:** High
- **Location:** Phase 3, "Architecture" ("one try/catch in `CrudService` create/update translating 23505 → 409 and 23503 → 400") + success criterion "No user-controllable input path on **list** endpoints returns 500"
- **Flaw:** `CrudService.remove()` (`api/src/crud/crud.service.ts:228-233`) executes a bare `.delete()`; there is no try/catch anywhere in the file today (grep: zero hits). `khach_hang.dai_ly_id` is a self-FK (`api/src/db/schema/khach-hang.ts:44`: `daiLyId ... references((): AnyPgColumn => khachHang.id)`) with no `onDelete` action → default NO ACTION. Deleting a customer that is another customer's đại lý parent raises Postgres 23503 **on the DELETE**, which the phase's create/update-scoped mapping never touches. The phase's own success criterion quietly narrows "no 500s" to list endpoints, so the gap passes acceptance by construction.
- **Failure scenario:** Phase 2's bulk-delete acceptance test is literally "bulk delete of N rows with one forced failure" — in production the natural forced failure IS a dealer-parent row. User selects all rows on /khach-hang, bulk delete fires, parent rows return raw 500 ("Internal server error", English), the "x thành công / y lỗi" toast counts them as generic errors with no actionable message, and the API error log fills with unhandled FK violations. The plan fixes 500s on the read path while shipping a user-triggerable 500 on the destructive path — after the phase named "API Contract Hardening" is complete.
- **Evidence:** `api/src/crud/crud.service.ts:228-233` (remove, no error mapping); `api/src/db/schema/khach-hang.ts:44`; phase-03 line 26 (create/update scope) and line 56 (list-scoped criterion); `src/api/vi-error-map.ts:24` maps 409 client-side, nothing maps a delete-conflict today.
- **Suggested fix:** The 23503 catch must wrap `remove()` too (→ 409 "Không thể xóa: bản ghi đang được tham chiếu" is the conventional mapping), with a contract test deleting a dealer-parent. Widen the success criterion from "list endpoints" to "list + mutation + delete".

---

## Finding 4: Phase 1's "—" fallback explicitly excludes custom renderers — but the columns everyone complained about ARE custom renderers returning `''`, so the phase's own criterion is unsatisfiable as specced

- **Severity:** High
- **Location:** Phase 1, "Risk Assessment" ("apply fallback only for null/undefined/'' **accessor values, not custom renderers**") vs success criterion "Nullable cells render '—', never whitespace"; interacts with Phase 4 "Risk Assessment" (async Maps render "—" until loaded) and Phase 3 Finding 1 above
- **Flaw:** Flow trace of a geography cell: `khach-hang.config.ts:46-57` defines `phuongXaCode`/`tinhThanhCode` with `renderCell: (v) => xaName(...)`, and `tinhName`/`xaName` return `''` for a null code (`khach-hang.config.ts:12-23`). Post-fix, `flexRender` renders the renderCell output — an empty string — and the DataTable fallback is contractually forbidden from touching custom-renderer output per the phase's own risk note. All 50 seeded customers have null codes until the Phase 3 backfill (which is itself a no-op, Finding 1). So after Phase 1 "completes": geography columns still render whitespace, violating criterion 2, and the address portion of criterion 1.
- **Failure scenario:** Three-way ambiguity compounds across phases. Phase 1: '' (whitespace) for null-code rows. Phase 4 swaps the same renderCells to async lookup Maps that "start empty; cells show '—' until ready" — now '—' means (a) no data, (b) seed rows without codes, (c) lookup not yet loaded, and for the loading window EVERY row shows '—' in geography columns even when data exists. Any Phase 1 regression test that asserts a geography *name* renders becomes timing-dependent after Phase 4 (value appears only after the ref-data query resolves) → flaky test or a test pinned to a non-geography column that never guards the actual complaint (blank address columns, F-D7).
- **Evidence:** `src/config/crud-configs/khach-hang.config.ts:12-23,46-57`; phase-01 lines 20, 54, 62; phase-04 line 67; `src/components/shared/data-table/data-table.tsx:491-494` (single flexRender site where the fallback would live).
- **Suggested fix:** Make the fallback normalize the *rendered output*: `const out = flexRender(...); render out === ''/null ? '—' : out` for string-returning renderCells (the config file's own header note says renderCells return strings only — `khach-hang.config.ts:1`). Then '—' is one code path and Phase 4 inherits it. State explicitly in P1 that geography columns show '—' (not names) until P3's backfill lands, and pin the P1 cell-value regression test to a column with guaranteed data (tenKH), plus a separate P3-gated test for geography names.

---

## Finding 5: Phase 7's my-tickets default filters by an identity that matches zero tickets — the "technician workflow fix" ships an empty-by-default page

- **Severity:** High
- **Location:** Phase 7, "Architecture" ("KT filter panel gains a 'Kỹ thuật' field **defaulting to the current user**") + Risk Assessment ("filter defaults from the session's displayed user name; keep clearable so it degrades gracefully")
- **Flaw:** Flow trace of the default value: session identity is `CURRENT_USER.hoVaTen = 'Nguyễn Quản Trị'` (`src/mock/current-user-mock.ts:20-24`). Ticket `kyThuat` values are drawn from the TECHNICIANS roster `kt-01..kt-12` ('Nguyễn Văn An', 'Trần Minh Đức', … — `src/domains/repair/reference-data.ts:389-401`) via `tech.ten` (`src/domains/repair/mock-data.ts:354-355`). 'Nguyễn Quản Trị' is not in the roster. Default filter → zero matches, guaranteed, for the only identity the app has.
- **Failure scenario:** Phase 7 deploys; every user opens SCBH-KT and sees an empty table by default — a strictly worse state than today's unfiltered list, and precisely the "blank data" class of harm this whole plan exists to remediate. "Clearable so it degrades gracefully" is backwards: graceful degradation of a no-match default is default-OFF. The e2e criterion ("open KT → my tickets → mark Sửa Xong ≤3 clicks") can only pass by stubbing a technician identity that prod doesn't have — a phantom gate. And even after real identity lands (260707-1612 P2), any non-KTV user (admins, receptionists) inherits the same empty default, since nothing role-gates the default-on behavior.
- **Evidence:** `src/mock/current-user-mock.ts:20-24`; `src/domains/repair/reference-data.ts:389-401`; `src/domains/repair/mock-data.ts:354-355`; phase-07 lines 29, 57, 68.
- **Suggested fix:** Default the Kỹ thuật filter to OFF; apply the current-user default only when the session identity resolves to a member of the technician roster (by id once real identity exists; by exact name match until then). E2E must assert the no-match-identity case shows the full list, not an empty one.

---

## Finding 6: Phase 1 deploy gate couples every future deploy to a dev-laptop ngrok tunnel, while the decision it depends on (open question 2) is explicitly unresolved

- **Severity:** High
- **Location:** Phase 1, steps 5-6 + Risk Assessment ("`vars.API_URL` requires a repo settings change (document in PR description...)"); plan.md Open Question 2
- **Flaw & failure scenarios (three distinct holes):**
  1. **Ephemeral origin as a hard gate.** The live API origin is a ngrok tunnel (plan.md root cause 4; the client even sets `ngrok-skip-browser-warning` — `src/api/http-client.ts:30`). If `vars.API_URL` is set to the ngrok URL, the pre-build `curl -sf "$API_URL/health"` fails the moment the MacBook tunnel drops or rotates its URL → **every push-to-main deploy is blocked**, including deploys of Phases 2-8 and any emergency frontend fix. Manual dispatch offers no escape while no live URL exists. The plan converts "silently rebind to dead URL" into "cannot deploy at all", and does so *before* resolving whether ngrok is even the sanctioned origin (open question 2 is deferred, yet step 5's repo-var value requires the answer).
  2. **First-push-after-merge gap.** Setting `vars.API_URL` is an out-of-band repo-settings mutation mentioned only as "document in PR description" — not an implementation step, not verified by anything. Merge lands, var unset, first push fails the build. That is the *designed* behavior ("fail loudly"), but nothing in the phase makes the settings change a gated precondition, so Phase 1's own deploy — the hotfix — is the first thing the new gate blocks.
  3. **Empty-string leak if the gate is misordered.** `src/api/api-url.ts:2` is `import.meta.env.VITE_API_URL ?? 'http://localhost:3210'` — `??` does not catch `''`. If the workflow ever exports an empty var but the curl gate is skipped/soft-failed (e.g. someone adds `continue-on-error` while unblocking hole 1), the bundle ships computing `'' + '/api/v1/...'` → same-origin `minihale.github.io/api/v1/...` → every request 404s. The gate is the only thing standing between an empty repo var and a fully-broken deploy; the plan should also harden the code side.
- **Evidence:** `.github/workflows/deploy-pages.yml:35` (current dead-Render fallback, the bug being fixed); `render.yaml` (`plan: free` — Render idles/cold-starts, so even a "healthy" Render URL fails a build-time curl after idle); `src/api/api-url.ts:2`; phase-01 lines 36, 46, 56, 63; plan.md line 89.
- **Suggested fix:** (a) Resolve open question 2 *inside* Phase 1's step list, not in parallel. (b) Make the repo-var creation an explicit numbered step with a verification command (`gh variable list`). (c) Give the health gate a retry-with-backoff (Render cold start) and a documented `workflow_dispatch` override for "deploy frontend against last-known URL, skip gate" so a dead tunnel can't hold frontend hotfixes hostage. (d) Change `api-url.ts` to treat `''` as unset.

---

## Finding 7: Phase 1's DB probe inside `/health` conflates liveness and readiness — a transient DB blip now cascades into API restart loops and blocked frontend deploys

- **Severity:** Medium
- **Location:** Phase 1, step 6 ("Extend `/health` to probe the DB (`SELECT 1`, ~2s timeout) so the gate and Render's health check mean 'actually serving data'")
- **Flaw:** `render.yaml` sets `healthCheckPath: /health` — the same endpoint Render uses for instance health/liveness. Today it is dependency-free (`api/src/health/health.controller.ts:5-10`). Adding a DB probe to that single endpoint means: free-tier Postgres hiccup or connection-pool exhaustion → `/health` non-200 → Render marks the instance unhealthy → restart/failed-deploy loop → the API is fully down for what was a partial, self-recovering degradation. Simultaneously the frontend deploy gate (Finding 6) starts failing, so you can't ship UI changes while the DB blips. One transient fault, two cascaded outages.
- **Failure scenario:** Render free Postgres does maintenance/connection churn at 02:00; `SELECT 1` times out for 90 seconds; Render restart-cycles the API (cold start on free tier ≈ 30-60s each), turning 90 seconds of degraded reads into many minutes of hard downtime; the morning's push-to-main also fails its health gate.
- **Evidence:** `render.yaml` (`healthCheckPath: /health`, `plan: free`); `api/src/health/health.controller.ts:5-10`; phase-01 lines 37, 47.
- **Suggested fix:** Split endpoints: `/health` stays dependency-free (liveness, Render), `/health/ready` adds the DB probe (deploy gate curls the ready endpoint). One line of routing, removes the cascade.

---

## Finding 8: Phase 2's `Promise.allSettled` bulk delete is unbounded-parallel over rows containing self-FK parents — nondeterministic partial failures, and up to 300 concurrent DELETEs against a 600 req/min limiter

- **Severity:** Medium
- **Location:** Phase 2, step 4 (`await Promise.allSettled(ids.map(id => mutateAsync(id)))`) and success criterion "Bulk delete of N rows with one forced failure reports 'N-1 thành công / 1 lỗi'"
- **Flaw:** Two interacting problems the step doesn't spec:
  1. **Ordering race on the self-FK.** Selecting a dealer parent *and* its children deletes them concurrently. Whether the parent delete hits 23503 depends on whether its children's DELETEs commit first — a per-run race. The same selection reports "N thành công" on one click and "N-1 / 1 lỗi" on the next; a retry of the "failed" row then succeeds. Combined with Finding 3 (delete 500s unmapped until — at best — P3), the error the user sees for the loser of the race is a raw 500.
  2. **Unbounded fan-out vs limiter.** `PAGE_SIZE_OPTIONS` still contains 300 when Phase 2 lands (`KhachHangPage.tsx:39`; the 300 removal is scheduled in Phase 3 — ordering inversion). Select-all + bulk delete = up to 300 parallel DELETEs against `API_RATE_LIMIT_MAX` default 600/60s window (`api/src/config/env.ts:27-33`) shared with the page's other traffic → 429s mid-batch counted as failures, plus per-item `invalidate()` in `use-crud.ts:107-108` refetching the list repeatedly mid-flight unless the "invalidate once" sub-step also *suppresses* the per-item invalidation (the plan suppresses per-item *toasts*, but only says "single invalidation" without noting the invalidate lives in the shared onSuccess).
- **Failure scenario:** User selects 300 rows including 3 dealer parents; ~250 DELETEs land, limiter kicks in, toast reports "212 thành công / 88 lỗi" where 85 "errors" are 429s and 3 are FK races; clicking retry produces a different count. Outcome reporting is now honest but meaningless.
- **Evidence:** `src/pages/danh-muc/KhachHangPage.tsx:39,121-126`; `src/hooks/use-crud.ts:104-112`; `api/src/config/env.ts:27-33`; `api/src/db/schema/khach-hang.ts:44`; phase-02 line 48; phase-03 line 36 (300 removal deferred to P3).
- **Suggested fix:** Chunk the batch (concurrency ≤5-10); delete in two passes (non-parent rows, then parents) or let the server report referenced-row conflicts as 409 and surface "đang được tham chiếu" distinctly; move the pageSize-300 removal into Phase 2 or cap bulk selection; suppress the shared onSuccess `invalidate` in bulk mode, invalidate once after settle (the toast suppression alone doesn't do this).

---

## Finding 9: Phase 5's "pure refactor, tests stay green" consolidation is scheduled after three phases of divergent edits to the two forks — and the forks already disagree on visible column order today

- **Severity:** Medium
- **Location:** Phase 5, step 1 ("Extract shared builders; migrate CrudTablePage + KhachHangPage... Pure refactor — tests stay green")
- **Flaw:** The two column builders are not copies today: `CrudTablePage.tsx:113-122` renders **selection column, then STT**, with an edit+delete action pair (`:144-176`) and `meta: { sticky: true }` on STT; `KhachHangPage.tsx:64-72` renders **STT, then selection**, edit-only actions, no sticky meta. A single shared `buildCrudColumns` must pick one order/anatomy — meaning one page's visible layout changes, so "pure refactor" is false by current evidence. The plan then schedules Phases 1, 2, and 4 to each edit *both* files first (P1: cell spread ×2; P2: bulk delete in both; P4: manualSorting in both), growing the divergence the consolidation must reconcile, while the whole point of P5 step 1 is that the fork "let the Phase-1 bug exist twice".
- **Failure scenario:** P5 step 1 lands as a "no-behavior-change" commit; the e2e/screenshot gate fails on the column-order swap (or worse, nobody notices because tests assert headers, the phantom coverage the plan itself calls out); the "fix it in the shared builder" patch then silently changes selection/STT order and sticky behavior on 50+ config-driven pages at once (53 configs in `src/config/crud-configs/`). Alternatively the builder grows order/action/sticky parameters to preserve both variants — reimplementing the fork inside the "shared" module.
- **Evidence:** `src/components/crud/CrudTablePage.tsx:113-122,139-176`; `src/pages/danh-muc/KhachHangPage.tsx:64-72` + edit-only `_actions`; 53 files in `src/config/crud-configs/`; phase-05 line 53.
- **Suggested fix:** Do the fork-merge FIRST (pull P5 step 1 forward, before or with Phase 2's dual-file edits) so P1/P2/P4 each edit one code path — the plan's own root-cause analysis argues for exactly this. If sequencing must stay, P5 step 1 must name the order/anatomy decision (which page changes) as an explicit deliverable, not claim zero diff.

---

## Finding 10: Cross-plan dependency is recorded on one side only — the in-progress backend plan doesn't know it's blocked, and both plans edit the same auth/CRUD files

- **Severity:** Medium
- **Location:** plan.md frontmatter (`blocks: [260707-1612-real-backend-database]`) + Phase 3 "Related Code Files" (mustChangePassword client gate: `src/api/auth-client.ts` + `api/src/auth/auth.controller.ts`; CrudService edits)
- **Flaw:** `plans/260707-1612-real-backend-database/plan.md` frontmatter reads `status: in-progress, blockedBy: [], blocks: []` — it carries no back-reference to this plan. Its Phase 1 is completed and Phases 2-7 are pending/startable. This plan's P3 modifies `api/src/crud/crud.service.ts`, `list-params.dto.ts`, resource configs, and `auth.controller.ts` — the exact files 260707-1612's P2 (identity/mustChangePassword server guard) and P3 (CRUD fan-out) own. The coordination contract exists only as prose here ("land P3 before 260707-1612 phase 3 fan-out"; "full server guard stays with 260707-1612 phase 2, noted there" — it is NOT noted there: grep for mustChangePassword/RequireAuth in that plan's phase-02 file returns nothing).
- **Failure scenario:** Team-mode or a future session resumes 260707-1612 (its status says in-progress, nothing blocks it), starts P2's auth work concurrently with this plan's P3 — both patch `auth.controller.ts` refresh response and both define mustChangePassword semantics (client flag vs server guard) → merge conflict at best; at worst two divergent gate implementations ship, and the client gate (bypassable by definition) is mistaken for done-done, so the server guard gets deprioritized.
- **Evidence:** `plans/260707-1612-real-backend-database/plan.md` frontmatter (blockedBy/blocks empty, in-progress); its `phase-02-real-permission-enforcement-identity.md` contains no mustChangePassword hand-off note (grep empty); phase-03 line 39 of this plan claims "noted there".
- **Suggested fix:** Update 260707-1612's frontmatter (`blockedBy: [260713-1817...]` for its phases 2-3) and add the mustChangePassword hand-off note to its phase-02 file — or drop the "noted there" claim and route the update through the lead/planner. One-sided dependency metadata is how two in-progress plans collide.

---

## Verification summary (flow-tracer method)

| Plan claim | Verdict |
|---|---|
| `cell: undefined` overrides TanStack default in both builders | Confirmed (`CrudTablePage.tsx:129-137`, `KhachHangPage.tsx:81-89`) |
| No `errorElement` in route tree | Confirmed (grep: 0 hits in `src/routes/index.tsx`, 580 lines) |
| Dealer modal writes mock array while list reads API | Confirmed (`them-dai-ly-modal.tsx:28,88-99` → `create-customer.ts:24-38` unshift) |
| Deploy workflow push-path hardcodes dead Render URL | Confirmed (`deploy-pages.yml:35`) |
| 2× always-mounted reference-data fetch | Confirmed (`KhachHangPage.tsx:262,277` → two `CustomerEditorDialog` → `use-customer-reference-data.ts:19-49`, effect not gated on open) |
| "invalidation already refetches" for all onSaved paths | **Refuted for ThemDaiLyModal** (Finding 2) |
| Seed backfill via seed-database.ts reaches live rows | **Refuted** (Finding 1) |
| Constraint mapping closes user-triggerable 500s | **Partial** — delete path excluded (Finding 3) |
| pageSize 300 vs server cap 200 | Confirmed (`KhachHangPage.tsx:39` vs `list-params.dto.ts:10`) |
| `khach-hang.service.ts` update destroys untouched diaChi | Overstated — server already guards untouched forms via hasOwnProperty (`khach-hang.service.ts:147-154`); destruction requires touching an address field, which the phase text does state correctly in Architecture |

## Unresolved questions

1. Is the Phase 3 "seed backfill" intended as a migration or a fixture edit? The phase text says fixture edit, which cannot work on the live DB (Finding 1).
2. What is the sanctioned deploy origin (plan open question 2)? Phase 1's gate design is unsafe to land before this is answered (Finding 6).
3. Should Phase 5's fork-merge move ahead of Phases 2/4 to stop triple-editing both forks (Finding 9)?
