# Backend Review — API, DB, System Logic

Reviewer lens: API design, DB schema/seeds, system logic, client HTTP seam. Live API verified read-only via ngrok. Branch: `feature/customer-model-relational-address`.

## Summary (most severe first)

- **Blank customer cells are a client render defect, NOT an API/seed defect** — live API returns fully-populated rows; every column built with explicit `cell: undefined` renders empty. Proven empirically (vitest repro through real page component).
- **"Thêm Đại Lý" silently writes to the in-memory mock array in production** — dealer records never reach the API, vanish on reload, success toast lies.
- **Push-to-main redeploys Pages against a DEAD Render URL** (`x-render-routing: no-server` confirmed live) — the working ngrok URL only survives manual `workflow_dispatch`.
- Filter **values** are unvalidated → live-confirmed 500s (`filters[loaiKhachHangId]=abc` → 500; nested object on numeric filter → 500).
- DB unique-constraint and FK violations are unmapped → 500 instead of 409/400 with VI message (model/bank duplicate names, bad `phuongXaId`).
- `ngan-hang` list has no default sort and CRUD list has no id tiebreaker → no `ORDER BY` at all → nondeterministic pagination.
- Client offers `pageSize: 300`; server caps at 200 → selecting 300 yields a 400 error state.
- All 50 seeded customers have NULL modern address codes (`tinhThanhCode`/`phuongXaCode`) — the new Phường/Xã + Tỉnh/TP columns render blank for 100 % of seed data even after the render bug is fixed; no backfill exists.
- dia-ly: 483 KB payload fetched twice per customer-page load, no `Cache-Control`, no compression, and THREE competing geography sources (API, bundled snapshot, legacy TINH/QUAN/XA mock).
- Editing a legacy customer can silently destroy its `diaChi` (form cannot display legacy address; server recomposes from street only).

## Root-cause analyses (mandatory items)

### 1. Empty customer table cells

**Cause:** columns without a `renderCell` are mapped to TanStack ColumnDef with an explicit own-property `cell: undefined`. TanStack resolves columnDefs by object spread, so an *own* `undefined` property overrides the library's default accessor-value renderer; `flexRender(undefined, ctx)` renders nothing. Columns *with* `renderCell` (Loại, Ngày tạo) get a function and render fine — exactly the observed pattern (only "Trung tâm bảo hành"-valued Loại + createdAt visible).

**Evidence:**
- `src/pages/danh-muc/KhachHangPage.tsx:81-89` — `cell: col.renderCell ? (...) : undefined` (bespoke customer page).
- `src/components/crud/CrudTablePage.tsx:129-137` — identical pattern; affects EVERY generic CRUD page (ngan-hang, nha-san-xuat, san-pham, model included).
- `src/components/shared/data-table/data-table.tsx:491-494` — `flexRender(cell.column.columnDef.cell, …)` with no fallback.
- Empirical: table-core resolves `{cell: undefined}` → `undefined`, while omitting the key → default function; full React render of production `NganHangPage` shows row loads (9 rows) with `firstDataRowText: "1"` (only STT) and `tenNganHang: "Vietcombank"` absent from DOM.
- Live API refutes the "empty seed" hypothesis: `GET /api/v1/khach-hang?page=1&pageSize=3` returns `tenKH: "Trần Văn Em"`, `dienThoai: "0886771450"`, `diaChi: "28 Hùng Vương"`, `email: "kh1@gmail.com"` — data is present on the wire.
- Not an api/ or DTO defect: `api/src/khach-hang/khach-hang.service.ts:120-123` returns full rows + `nganHangTen` enrichment.

**Why CI passed:** page tests assert only headers, never cell values (`src/pages/nhan-su/NganHangPage.test.tsx:12-14`); `data-table.test.tsx:18-19` uses columns *without* the explicit `cell` key. Phantom coverage.

**Fix:** omit the `cell` key when there is no `renderCell` (conditional spread) at both sites, and add one cell-value assertion to the page tests. Frontend owns the edit; root cause documented here.

**Secondary cause (data):** even fixed, Phường/Xã + Tỉnh/TP columns stay blank for all seed rows — see F-D7.

### 2. dia-ly payload, duplication, and authority

**Cause of double fetch:** `KhachHangPage` permanently mounts TWO `CustomerEditorDialog` instances — the edit dialog (`KhachHangPage.tsx:262`) and `ThemKhachHangModal` (`KhachHangPage.tsx:277` → `them-khach-hang-modal.tsx:16` renders `CustomerEditorDialog` unconditionally). Each instance runs `useCustomerReferenceData()` at the top of the component (`customer-editor-dialog.tsx:28`), whose `useEffect` with `[]` deps fires on MOUNT, not on open (`use-customer-reference-data.ts:19-49`). The module-level memo in `vietnam-geography.ts:5,13-14,22-24` caches the *resolved value*, not the in-flight promise — the two concurrent mount-time calls both miss the cache and both hit the network. Result: 2 × 483 KB on every /khach-hang load before the user clicks anything.

**Payload quantified (live):** `GET /api/v1/dia-ly` = **482,982 bytes**, 34 provinces + 3,321 communes. Response headers: weak `ETag` only — **no `Cache-Control`**, **no `Content-Encoding`** even when `Accept-Encoding: gzip` is sent (no compression middleware in `api/src/main.ts`; no `compression` dependency). The endpoint streams the entire two-table snapshot with per-commune `provinceName` strings (`api/src/dia-ly/dia-ly.controller.ts:21-52`).

**Authority conflict — three sources:**
1. API snapshot (DB, versioned via `snapshotVersion` metadata) — used only by `CustomerForm` selects.
2. Bundled `VIETNAM_ADMINISTRATIVE_SNAPSHOT` (661 KB source, statically imported in `src/config/crud-configs/khach-hang.config.ts:8`) — used by table `renderCell` (`:12-23`), field options (`:99-112`), and filter options (`:150-157`) even in real mode, and it defeats the lazy-import gating in `vietnam-geography.ts:15-19` by being in the prod bundle unconditionally.
3. Legacy mock `TINH/QUAN/XA` (`them-dai-ly-modal.tsx:28,104-105`).

If the DB is reseeded with a newer snapshot, the table shows stale names while the form shows new ones.

**Recommendation:** DB/API is authoritative. (a) Server-enrich list rows with `tinhThanhTen`/`phuongXaTen` (same pattern as `nganHangTen`, `khach-hang.service.ts:43-49`) so the table never needs a client-side snapshot; (b) add `Cache-Control: private, max-age=86400` (or version-keyed URL `/dia-ly?v=<snapshotVersion>` + `immutable`) and compression middleware; (c) cache the in-flight promise in `vietnam-geography.ts`; (d) drop the static bundle import from `khach-hang.config.ts` after (a). Effort M.

### 3. ngan-hang double fetch

**Cause:** same two always-mounted `CustomerEditorDialog` instances. Each `useCustomerReferenceData()` calls `nganHangConfig.mockApi.list({page:1,pageSize:200,sort:'tenNganHang',...})` directly (`use-customer-reference-data.ts:23-29`) using raw `useState`/`useEffect` — it bypasses React Query entirely, so there is no query-key dedup, no `staleTime`, no shared cache (contrast `use-crud.ts:74-79`, which would have deduped both callers under one key). Two mounts ⇒ two identical HTTP calls. A third call site exists at `src/features/repair-create/quick-create/QuickCreateKhachHang.tsx:23`.

**Layer split:** the query-side cause is the hook's fetch design (no React Query / no promise coalescing) — backend-seam side, mine. The "two mounted dialog instances on one page" mount pattern is the frontend panelist's to restructure. Fix on my side: convert `useCustomerReferenceData` to `useQuery` with keys `['dia-ly-snapshot']` / `['ngan-hang','reference']` and `staleTime: Infinity` for the snapshot; or lift to a single provider. Effort S.

## Findings

### F-D1: Explicit `cell: undefined` blanks all plain columns on every CRUD table
- Severity: Critical
- Area: src/pages/danh-muc/KhachHangPage.tsx / src/components/crud/CrudTablePage.tsx
- Evidence: KhachHangPage.tsx:81-89; CrudTablePage.tsx:129-137; data-table.tsx:491-494; vitest repro (production `NganHangPage` renders rows with empty name cells); live API returns full data (root-cause 1)
- Problem: every column without `renderCell` renders empty on the live deploy — customer name, phone, address, email, tax code, account number invisible. Affects all six real resources plus every mock CRUD page.
- Recommendation: conditionally spread the `cell` key only when `renderCell` exists; add cell-value assertions to page tests (current tests assert headers only — phantom coverage).
- Effort: S
- Overlaps-existing-plan: none

### F-D2: "Thêm Đại Lý" persists to the mock array in real mode — silent data loss
- Severity: Critical
- Area: src/features/customer/create-customer.ts / them-dai-ly-modal.tsx
- Evidence: create-customer.ts:24-37 (`createCustomer` unshifts into `KHACH_HANG_ROWS`, id `kh-new-N`, never calls `customerApi.create`); them-dai-ly-modal.tsx:87-99 calls it then toasts success; KhachHangPage.tsx:282 mounts the modal
- Problem: with `khach-hang` real, the list reads from the API, so a created dealer appears nowhere, is lost on reload, and the user is told it succeeded. Modal also sends only legacy `tinhId/quanId/phuongXaId` from mock lookups (them-dai-ly-modal.tsx:28,93-95).
- Recommendation: route the dealer flow through `persistCustomer` (async, API-backed) like `CustomerEditorDialog`; delete the legacy `createCustomer` path or gate it to mock-only.
- Effort: S
- Overlaps-existing-plan: none

### F-D3: Pages deploy default points at a dead Render service
- Severity: Critical
- Area: .github/workflows/deploy-pages.yml
- Evidence: deploy-pages.yml:10,34 default `https://phongthanh-admin-api-minihale.onrender.com`; live probe: `HTTP/2 404`, `x-render-routing: no-server`
- Problem: any push to `main` rebuilds the production frontend with `VITE_API_URL` = the dead URL (the `github.event.inputs.api_url` fallback is empty on push events). The currently-working ngrok binding exists only in the last manual dispatch and is silently reverted by the next merge.
- Recommendation: move the API URL to a repo variable (`vars.API_URL`) consumed by both triggers; fail the build if a `/health` probe against the target URL does not return 200.
- Effort: S
- Overlaps-existing-plan: phase 7 of 260707-1612 (deployment) — but the drift breaks the ALREADY-shipped deploy, so it cannot wait for phase 7.

### F-D4: Filter values unvalidated → 500s from user-controllable input
- Severity: High
- Area: api/src/crud/crud.service.ts / list-params.dto.ts
- Evidence: crud.service.ts:52-68 validates the filter KEY against the allowlist but passes the raw VALUE to `eq()`; list-params.dto.ts:14 `z.record(z.string(), z.unknown())`; khach-hang.resource-config.ts:27 `parse: (raw) => Number(raw)` yields `NaN`. Live: `filters[loaiKhachHangId]=abc` → HTTP 500; `filters[tenKH][a]=1` (nested via `extended` qs, main.ts:27) → HTTP 500
- Problem: error-boundary violation — allowlisted keys with malformed values reach Drizzle/Postgres and surface as `Internal server error` instead of the 400 VI contract; trivially triggerable, pollutes logs.
- Recommendation: per-filter value schema (string/number/boolean) in `filterableColumns`; reject non-scalar values and `NaN` with the existing 400 VI message.
- Effort: S
- Overlaps-existing-plan: none (gate 2 covered keys only)

### F-D5: DB constraint violations unmapped — duplicates and bad FKs return 500
- Severity: High
- Area: api/src/crud/crud.service.ts / model, ngan-hang, khach-hang services
- Evidence: unique indexes `model_parent_name_unique` (danh-muc-thiet-bi.ts:72-76), `ngan_hang_ma_unique` (:91), name-normalized uniques (:29-32,47-50); no try/catch around `insert`/`update` (crud.service.ts:200-204, 217-221); khach-hang FKs `phuongXaId→xa.id`, `quanId`, `daiLyId` (khach-hang.ts:36-44) while `validateReferences` checks only `nganHangId` + `tinhId` (khach-hang.service.ts:101-118)
- Problem: creating a duplicate model/bank name or posting a stale `phuongXaId`/`daiLyId` produces a Postgres error → 500. The client maps 409 to a proper VI message (vi-error-map.ts:24-25) but the server never emits one.
- Recommendation: catch Postgres error codes `23505` → 409 and `23503` → 400 with VI messages in `CrudService`, once, for all resources.
- Effort: M
- Overlaps-existing-plan: none

### F-D6: Missing ORDER BY and no id tiebreaker → nondeterministic pagination
- Severity: High
- Area: api/src/crud/crud.service.ts / src/config/crud-configs/ngan-hang.config.ts
- Evidence: crud.service.ts:92-107 applies `orderBy` only `if (params.sort)`; ngan-hang.config.ts has no `defaultSort` (use-crud.ts:60-62 only sends sort when configured), so the NganHangPage list issues no `sort` at all
- Problem: Postgres row order without ORDER BY is undefined — page 2 can repeat or skip rows; even sorted queries on non-unique columns (createdAt ties, seeded rows share identical timestamps, e.g. all ngan-hang rows `2025-07-01T00:00:00Z`) paginate unstably without a tiebreaker.
- Recommendation: always append `id ASC` as a trailing tiebreaker in `CrudService.list`; default to `createdAt desc` server-side when `sort` is absent.
- Effort: S
- Overlaps-existing-plan: phase 3 of 260707-1612 will fan this out to ~37 resources — fix in the engine now, before the fan-out multiplies it.

### F-D7: All seeded customers have NULL modern address codes; no backfill
- Severity: High
- Area: api/src/seed/seed-database.ts / api/seed-fixtures/khach-hang.json
- Evidence: seed maps only legacy fields — no `tinhThanhCode`/`phuongXaCode`/`tenDuong` (seed-database.ts:252-270); live rows confirm `tinhThanhCode: null` on kh-1..kh-3; the shipped columns render ONLY the modern codes (khach-hang.config.ts:46-57), legacy `phuongXaId/quanId/tinhId` columns were removed from the config (present on main, gone on HEAD)
- Problem: after F-D1 is fixed, Phường/Xã and Tỉnh/TP are still blank for 100 % of the 50 seeded customers; the visible address regresses vs main (which rendered legacy names). The schema comment says legacy is "retained for compatibility" (khach-hang.ts:18-20,35) but nothing maps legacy → official codes.
- Recommendation: either seed-time backfill (map the 2-province legacy fixture to official codes — bounded, Đắk Lắk/Đắk Nông only) or render a fallback chain (modern code → legacy name) until backfill lands. Decide before release; silence here reads as data loss to users.
- Effort: M
- Overlaps-existing-plan: none (this branch introduced the two-level address; the plan predates it)

### F-D8: Editing a legacy customer silently destroys its diaChi
- Severity: High
- Area: api/src/khach-hang/khach-hang.service.ts / src/features/customer
- Evidence: the edit form has no field showing existing `diaChi` (customer-form-values.ts:7-20 — only `tenDuong`+codes); any touch of an address field sets `addressTouched` (customer-form.tsx:77-84) and the payload then writes `diaChi: composedAddress || null` (customer-form-values.ts:135-143); server path: `prepareAddress` with no codes returns `diaChi: street || null` (khach-hang.service.ts:60-64), applied via the patch override (:156-164)
- Problem: for the 50 legacy customers (address only in `diaChi`, e.g. "28 Hùng Vương"), a user who opens edit and brushes any address field replaces the stored address with the street text or NULL — without ever seeing the value being destroyed.
- Recommendation: display current `diaChi` read-only in the edit form; server-side, refuse to null a non-empty `diaChi` unless the client explicitly sends the field (distinguish "untouched" from "cleared").
- Effort: M
- Overlaps-existing-plan: none

### F-D9: pageSize option 300 exceeds the server cap of 200
- Severity: High
- Area: src/pages/danh-muc/KhachHangPage.tsx / api/src/crud/list-params.dto.ts
- Evidence: PAGE_SIZE_OPTIONS `[…,200,300]` (KhachHangPage.tsx:39); server `pageSize: …max(200)` (list-params.dto.ts:10); live: `pageSize=500` → 400 "Number must be less than or equal to 200"
- Problem: selecting 300 flips the table into the error state ("Có lỗi xảy ra") with an untranslated Zod message as the toast; contract mismatch between seam and API.
- Recommendation: remove 300 from the client options or raise the server cap; add the cap to the MSW contract test for khach-hang.
- Effort: S
- Overlaps-existing-plan: none

### F-D10: Runtime branch stamping contradicts seed branch derivation
- Severity: Medium
- Area: api/src/khach-hang/khach-hang.resource-config.ts / api/src/seed/branch-map.ts
- Evidence: `stampCreate` uses `ctx.user.branchIds[0]` — the creator's primary branch (khach-hang.resource-config.ts:53-61); seed derives branch from the CUSTOMER's province (branch-map.ts:5-8, seed-database.ts:266); stale comment claims "khach-hang derives it from tinhId" (crud.service.ts:164-166)
- Problem: two conflicting branch semantics in one table. An admin (primary cn-1) creating a Đắk Nông customer stamps cn-1; the equivalent seeded customer carries cn-2 — branch-scoped users then see an inconsistent slice. The misleading comment will propagate the wrong mental model into phase 3.
- Recommendation: pick one rule (creator-branch is defensible), document it, delete the stale comment; if province-derived is intended, stamp from `tinhThanhCode`/`tinhId` at create.
- Effort: S
- Overlaps-existing-plan: phase 2 of 260707-1612 (identity/branch scope) — flag there.

### F-D11: Bulk delete fires N parallel DELETEs and lies about success
- Severity: Medium
- Area: src/pages/danh-muc/KhachHangPage.tsx
- Evidence: `for (const id of selectedIds) deleteMutation.mutate(id)` then immediate `notify.success('Đã xóa …')` (KhachHangPage.tsx:121-126); same pattern in CrudTablePage
- Problem: the success toast fires before any request resolves; partial failures (404s, rate-limit at 600 req/min, main.ts:65-74) are reported per-row as error toasts AFTER the success toast; 200 selected rows = 200 concurrent DELETEs.
- Recommendation: await `Promise.allSettled` of `mutateAsync` and report the real count, or add a bulk-delete endpoint if this is a common flow.
- Effort: S (client) / M (endpoint)
- Overlaps-existing-plan: none

### F-D12: Đại lý/Trạm column resolves names from the mock array in real mode
- Severity: Medium
- Area: src/config/crud-configs/khach-hang.config.ts / api/src/khach-hang/khach-hang.service.ts
- Evidence: `daiLyName` looks up `KHACH_HANG_ROWS` (khach-hang.config.ts:28-29,74-79); the API enriches `nganHangTen` (khach-hang.service.ts:27-50) but not `daiLyTen`
- Problem: a real `daiLyId` renders blank (or a wrong name on mock-id collision, since mock and fixture both use `kh-N`). Same defect class the bank column already solved server-side.
- Recommendation: enrich `daiLyTen` in `KhachHangService.enrichBanks`-style batch lookup (self-join, one query); drop the mock fallback.
- Effort: S
- Overlaps-existing-plan: none

### F-D13: Boot refresh bypasses the coalesced-refresh gate
- Severity: Medium
- Area: src/routes/RequireAuth.tsx / src/api/auth-token.ts
- Evidence: RequireAuth.tsx:18 calls `refreshAccessToken()` directly; the 401-retry path uses `coalescedRefresh(refreshAccessToken)` (http-client.ts:54); server rotation CAS + 10 s grace (auth.service.ts:213-226,179-202)
- Problem: at app boot, RequireAuth's refresh and any concurrent 401-triggered refresh (e.g. a stale-token request racing the reload) rotate independently; the loser gets the benign-race 401 and its request fails outright instead of adopting the winner's token. The server's grace window prevents family revocation, but the client throws a spurious "session expired" error at the user.
- Recommendation: route RequireAuth through `coalescedRefresh` so all callers share one in-flight refresh.
- Effort: S
- Overlaps-existing-plan: none

### F-D14: mustChangePassword is advisory only — escapable after reload
- Severity: Medium
- Area: api/src/auth / src/pages/auth/LoginPage.tsx
- Evidence: only the login RESPONSE carries `mustChangePassword` (auth.controller.ts:50-53); refresh returns `{accessToken}` only (:70); the sole client consumer is the login redirect (LoginPage.tsx:47); no server guard checks the JWT's `mustChangePassword` claim on CRUD routes (jwt.strategy.ts:21-23 passes payload straight through; no interceptor)
- Problem: a seeded user (all seeded with `mustChangePassword: true`, seed-database.ts:239) can log in, ignore/reload past the change screen, and use every API with the initial shared password indefinitely — the V4 "forced change on first login" decision is not actually enforced.
- Recommendation: server-side guard: when `mustChangePassword` is true, allow only `/auth/*`; include the flag in the refresh response so the client gate survives reloads.
- Effort: M
- Overlaps-existing-plan: phase 2 of 260707-1612 (enforcement) — but the flow shipped in phase 1, so the gap is live now.

### F-D15: ILIKE metacharacters unescaped in search
- Severity: Low
- Area: api/src/crud/crud.service.ts
- Evidence: `const like = \`%${search}%\`` (crud.service.ts:71-76); live: `search=%` matched all 50 rows
- Problem: parameterized (no injection) but `%`/`_` in user input change match semantics — searching "100%" matches "100 anything"; degenerate patterns over 8 searchColumns (khach-hang.resource-config.ts:40-49) forestall index use.
- Recommendation: escape `%`, `_`, `\` in the search term before interpolation.
- Effort: S
- Overlaps-existing-plan: none

### F-D16: /health does not probe the database
- Severity: Low
- Area: api/src/health/health.controller.ts / render.yaml
- Evidence: returns static `{status:'ok'}` (health.controller.ts:6-9); render.yaml `healthCheckPath: /health`
- Problem: the platform health check passes while Postgres is down/misconfigured — dead API keeps receiving traffic; combined with F-D3 the deploy pipeline has no signal that the stack is actually serving data.
- Recommendation: add a `SELECT 1` probe with a short timeout to the health handler.
- Effort: S
- Overlaps-existing-plan: phase 7 of 260707-1612 (deploy) — small enough to fix now.

### F-D17: Date rendering uses English 12-hour AM/PM (client-side source)
- Severity: Low
- Area: src/lib/format.ts
- Evidence: `format(parseISO(iso), 'dd/MM/yyyy hh:mm a')` (format.ts:32) — produces "06/07/2026 12:32 AM" as observed live
- Problem: API emits correct UTC ISO (`createdAt: 2026-07-05T17:32:00.531Z`); the AM/PM English marker in an otherwise-VI UI is a client locale choice, not a backend/timezone bug. Layer note: cosmetic fix belongs to the frontend panelist; recorded here to close the "locale/format source" question — the source is `format.ts:32`, not the API.
- Recommendation: `HH:mm` (24h) or pass the `vi` locale to date-fns.
- Effort: S
- Overlaps-existing-plan: none

## Verified-sound (for risk calibration, no action)

- Branch scoping: `inArray` empty ⇒ deny; branch never filterable/sortable — live probes `filters[branchId]` and `sort=branchId` both 400. Write-path branch assertion present (crud.service.ts:36-40,167-182,199).
- Refresh rotation: hash-stored tokens, CAS claim, family revocation on late reuse, benign-race grace — logic sound (auth.service.ts:157-243).
- Seeds: FK-ordered, idempotent (`onConflictDoNothing`), checksum-pinned geography fixtures, fail-loud FK closure incl. model→nsx/sp and khach-hang self-FK (validate-fk-closure.ts, load-fixtures.ts:163-172).
- Model relational integrity: parent validation + `(nsx, sp, name)` unique + indexes on both FKs; server-side name normalization (model.service.ts:10-19,28-47; danh-muc-thiet-bi.ts:69-77). Enrichment is batched (2 queries), no N+1.
- vi-collation sort guarded to text columns only (crud.service.ts:96-106); `extended` query parser deliberately restored for `filters[k]=v` (main.ts:22-27).
- CORS preflight from `https://minihale.github.io` passes against the live tunnel; CSRF header guard on refresh/logout wired both sides.

## Unresolved questions

1. Which branch semantic is intended for `khach_hang.branch_id` — creator's branch or customer-province branch? (F-D10; blocks a correct phase-2 scope rule.)
2. Is legacy→official address backfill planned for the 50 seeded (and any future imported) customers, or is the fallback-render approach acceptable long-term? (F-D7)
3. Is the ngrok tunnel the sanctioned "production" API now, or is Render coming back? The answer decides whether F-D3's fix is a repo variable or a Render revival.
4. Should `dia-ly` be version-keyed (`?v=<snapshotVersion>`) so the 483 KB payload becomes immutable-cacheable? Server already stores the version metadata.
