# Frontend Code Review — Domain Logic, Data Flow, Architecture

Reviewer lens: frontend domain logic, state/data-flow, component architecture, duplication/dead code. No visual design, no api/ server internals (referenced only to verify client contracts), no security audit.

## Summary (most severe first)

- **Empty table cells (live bug) root-caused**: `cell: col.renderCell ? … : undefined` explicitly clobbers TanStack's default cell renderer — every non-renderCell column renders blank. Empirically reproduced against repo's installed `@tanstack/react-table`. Affects KhachHangPage AND all 35 CrudTablePage catalogs.
- **Raw "Unexpected Application Error!" (live bug) root-caused**: zero `errorElement` anywhere in the route tree; lazy chunk-load failures on GitHub Pages hit React Router's default error screen with stack trace. No retry-on-chunk-fail pattern.
- **Double dia-ly + ngan-hang fetches (live bug) root-caused**: two `CustomerEditorDialog` instances mount eagerly on /khach-hang page load; `useCustomerReferenceData` is a hand-rolled useState/useEffect fetch (bypasses TanStack Query dedupe) and `fetchVietnamAdministrativeSnapshot` has no in-flight promise dedup.
- **Two geography sources confirmed**: khach-hang.config.ts statically imports the 677KB bundled snapshot for renderCells/filters while the editor fetches `/api/v1/dia-ly` — table names and form names can diverge; static import forces the snapshot chunk to load eagerly even in real mode.
- **Silent data loss in prod**: "Thêm Đại Lý" writes synchronously to the in-memory mock array, never the real API; shows success toast, then refetch shows nothing.
- Repair-list "Tồn" dwell counter always renders `0 ngày 0:0'` — fixed REF_NOW (2024-07-01) predates all mock ticket dates (generated from Date.now(), 2026).
- Search + text filters fire one network request per keystroke (no debounce) on real resources.
- Missing `manualSorting` — client re-sorts server-sorted pages with code-point order, breaking Vietnamese collation.
- Bulk delete is fire-and-forget: success toast before any request completes, N invalidations, N+1 toasts.
- ~100-line `makeMockApi` fully duplicated in two files; khachHangConfig.fields (60 lines) is dead config with phantom test coverage.

## Findings

### F-E1: Explicit `cell: undefined` clobbers TanStack default renderer — all plain columns render empty
- Severity: **Critical**
- Area: `src/components/crud/CrudTablePage.tsx`, `src/pages/danh-muc/KhachHangPage.tsx`
- Evidence: CrudTablePage.tsx:129-137 (`cell: col.renderCell ? ({row}) => … : undefined`); KhachHangPage.tsx:81-89 (identical fork). Empirical repro with repo's node_modules: a ColumnDef `{ accessorKey: 'a', cell: undefined }` renders `<td></td>` while `{ accessorKey: 'b' }` (property absent) renders the value — object spread in TanStack's `createColumn` (`{...defaultColumnDef, ...columnDef}`) lets a present-but-undefined `cell` key overwrite the default renderer.
- Problem: Every column WITHOUT a `renderCell` (tenKH, dienThoai, dienThoai2, diaChi, email, maSoThue, soTaiKhoan, nguoiTao on khach-hang; equivalents on all 35 CrudTablePage catalogs) renders an empty cell. This is the exact live symptom (name/phone/address blank while Phường/Xã, Tỉnh, Ngân hàng — which have renderCell — display). Accessor keys themselves are correct: verified `tenKH`/`dienThoai`/`diaChi` match `api/src/db/schema/khach-hang.ts:26-28` and the DTO (`api/src/khach-hang/khach-hang.dto.ts:26-28`).
- Recommendation: MODIFY — conditionally spread instead of assigning undefined: `...(col.renderCell ? { cell: ({row}) => col.renderCell!(…) } : {})` in both files (or fix once, see F-E12). Add one DataTable test asserting a plain accessor column renders its value through the CrudTablePage column builder.
- Effort: S

### F-E2: No route errorElement / chunk-retry — raw error page on lazy import failure
- Severity: **Critical**
- Area: `src/routes/index.tsx`
- Evidence: `grep -rn "errorElement|useRouteError" src/` → zero hits. All 80+ pages are `React.lazy` (routes/index.tsx:16-157); Suspense exists (AppShell.tsx:55, routes/index.tsx:180-192) but Suspense does not catch import() rejections.
- Problem: On GitHub Pages a stale-deploy chunk 404 rejects the lazy import during render; React Router's built-in default error boundary shows "Unexpected Application Error!" + stack trace to end users — the observed live symptom. No retry, no friendly Vietnamese message, stack exposure.
- Recommendation: MODIFY — add `errorElement` at the root route and the AppShell layout route rendering a friendly error view; detect chunk-load errors (`TypeError: Failed to fetch dynamically imported module` / `error.name === 'ChunkLoadError'`) and offer/perform a one-shot `window.location.reload()` (guard with a sessionStorage flag to avoid reload loops).
- Effort: M

### F-E3: Duplicate dia-ly + ngan-hang fetches — two eager dialog mounts × non-Query hook × no in-flight dedup
- Severity: **High**
- Area: `src/pages/danh-muc/KhachHangPage.tsx`, `src/features/customer/use-customer-reference-data.ts`, `src/api/vietnam-geography.ts`
- Evidence: KhachHangPage.tsx:262-267 mounts `CustomerEditorDialog` (closed) AND :277-281 mounts `ThemKhachHangModal` which unconditionally renders a second `CustomerEditorDialog` (them-khach-hang-modal.tsx:15-17). Each dialog calls `useCustomerReferenceData()` at top level (customer-editor-dialog.tsx:28) whose effect fires on mount regardless of `open` (use-customer-reference-data.ts:19-30): `Promise.all([fetchVietnamAdministrativeSnapshot(), nganHangConfig.mockApi.list({pageSize: 200, …})])`. `fetchVietnamAdministrativeSnapshot` caches the resolved value but not the in-flight promise (vietnam-geography.ts:13-24), so two concurrent callers both fire `GET /api/v1/dia-ly`.
- Problem: Every /khach-hang visit fires `GET /api/v1/dia-ly` ×2 and `GET /api/v1/ngan-hang?pageSize=200` ×2 before the user opens anything — the observed live duplicates. The hook is a parallel reimplementation of caching the app already standardizes on (TanStack Query), so nothing dedupes or caches banks across the 3 mount sites (KhachHangPage edit, ThemKhachHangModal, QuickCreateKhachHang).
- Recommendation: REARRANGE — rewrite `useCustomerReferenceData` as two `useQuery` calls (`['dia-ly','snapshot']` with `staleTime: Infinity`; `['ngan-hang', {active:true, pageSize:200}]` with long staleTime); additionally gate fetching on dialog `open` (pass `enabled`). Also store the in-flight promise in `vietnam-geography.ts` (`cachedPromise ??= fetch…`) as defense in depth.
- Effort: M

### F-E4: Two geography sources of truth; 677KB snapshot statically bundled into khach-hang chunk
- Severity: **High**
- Area: `src/config/crud-configs/khach-hang.config.ts`, `src/data/vietnam-administrative-snapshot.ts`, `src/api/vietnam-geography.ts`
- Evidence: khach-hang.config.ts:8 static `import { VIETNAM_ADMINISTRATIVE_SNAPSHOT }` used by `tinhName`/`xaName` renderCells (:12-23,:50,:56) and filter options (:153); vietnam-geography.ts:16-18 dynamic-imports the same module only when `!isReal('dia-ly')`. Snapshot source is 677,219 bytes (`wc -c`).
- Problem: (a) Because the module is both dynamically imported (vietnam-geography) and statically imported (config), Vite emits it as a shared chunk that the khach-hang page chunk pulls eagerly — the "snapshot chunk ALSO loads alongside GET /api/v1/dia-ly" live observation. (b) Table cells and filters render names from the build-time snapshot while the editor uses the server snapshot: any server-side data revision shows different names in table vs form. (c) `bankName` fallback (:24-25, :65) reads `NGAN_HANG_ROWS` mock — masked only because `nganHangTen` is server-provided (api/src/khach-hang/khach-hang.service.ts:45) and fixtures reuse `ngh-N` ids (api/seed-fixtures/ngan-hang.json).
- Recommendation: MODIFY — renderCells should resolve names from the fetched snapshot (share the `['dia-ly','snapshot']` query via a small lookup-map hook, built once with `Map`s instead of per-cell `Array.find` over 3,321 communes), keeping the static snapshot import strictly behind the mock path. DELETE the `NGAN_HANG_ROWS`/`KHACH_HANG_ROWS` static imports from the config once F-E13 removes dead fields.
- Effort: M

### F-E5: "Thêm Đại Lý" silently loses data in production (mock-array write behind a real API list)
- Severity: **High**
- Area: `src/features/customer/them-dai-ly-modal.tsx`, `src/features/customer/create-customer.ts`
- Evidence: them-dai-ly-modal.tsx handleSave → `createCustomer(...)` → create-customer.ts:24-38 `KHACH_HANG_ROWS.unshift(row)` (synchronous, local array, id `kh-new-N`), then `notify.success('Đã thêm đại lý')` and `onCreated()` → `listQuery.refetch()` (KhachHangPage.tsx:282-286). With `khach-hang` real (mandatory in prod per scripts/assert-real-resources.mjs), the list reads the HTTP API, which never received the row.
- Problem: User sees a success toast; refetch renders the server list; the dealer vanishes. Data is silently lost on reload. ARCHITECTURE.md:115-116 documents quick-create Đại lý as out-of-release-scope legacy — but the button is live on the production customer page, so the documented scope decision ships a false-success data-loss path. The modal also still uses the legacy 3-level TINH/QUAN/XA model (them-dai-ly-modal.tsx imports `@/mock/seed/tinh-quan-xa`) that the release migrated away from.
- Recommendation: MODIFY — minimum: route the modal through `persistCustomer` (same API path as CustomerEditorDialog) with the dealer-restricted `loaiKhachHangId` options; alternatively hide the button while the flow is out of scope. Do not ship a success toast on a write the backing store ignores.
- Effort: M

### F-E6: Repair-list "Tồn" dwell always `0 ngày 0:0'` — REF_NOW predates all data
- Severity: **High**
- Area: `src/features/repair-list/hooks/use-repair-table-columns.tsx`, `src/domains/repair/mock-data.ts`, `src/lib/format.ts`
- Evidence: use-repair-table-columns.tsx:31 `const REF_NOW = new Date('2024-07-01T00:00:00.000Z').getTime()`; :262 `formatDwell(ticket.ngayNhan, REF_NOW)`. Tickets: mock-data.ts:291 `ngayNhan = rng.isoDateWithin(90)` which defaults `ref = Date.now()` (seeded-random.ts:59) → 2026 dates at runtime. format.ts:50 `ms = Math.max(0, now - start)` → always 0.
- Problem: Every open ticket displays dwell `0 ngày 0:0'`; the counter column is meaningless. The "no wall clock leaks" intent (format.ts:38-42) is broken in the opposite direction: the data uses the wall clock, the formatter uses a stale fixed constant.
- Recommendation: MODIFY — pick one convention: either seed ticket dates from a fixed base date matching REF_NOW, or compute REF_NOW once per session (`Date.now()` at module scope) since the data is wall-clock-relative anyway. Add an assertion test that at least one seeded open ticket yields non-zero dwell.
- Effort: S

### F-E7: Search box and text filters fire one request per keystroke (no debounce)
- Severity: **High**
- Area: `src/hooks/use-crud.ts`, `src/components/shared/data-table/data-table-toolbar.tsx`, `src/components/crud/CrudFilterBar.tsx`
- Evidence: data-table-toolbar.tsx:33 `onChange={(e) => onSearchChange(e.target.value)}` → use-crud.ts:114-115 `setSearch` updates params → new `queryKey: [key, listParams]` (use-crud.ts:75) → immediate fetch. CrudFilterBar.tsx:118-119 text-filter inputs identical. Contrast: ServerAutocomplete debounces 250ms (server-autocomplete.tsx:60,112).
- Problem: Typing "Nguyễn" on /khach-hang (real API) issues 6+ `GET /api/v1/khach-hang?...search=` requests, each cached 30s under a distinct key; responses can race (TanStack keeps latest key active, so no wrong-data render, but the request storm is real for all six real resources and every mock table).
- Recommendation: MODIFY — debounce in one place: keep the input controlled locally in `DataTableToolbar`/`CrudFilterBar` and call `onSearchChange` after ~300ms, matching the ServerAutocomplete convention.
- Effort: S

### F-E8: Missing `manualSorting` — client re-sort corrupts Vietnamese collation on server-sorted pages
- Severity: **Medium**
- Area: `src/components/shared/data-table/data-table.tsx`, `src/components/crud/CrudTablePage.tsx`, `src/pages/danh-muc/KhachHangPage.tsx`
- Evidence: data-table.tsx:186-188 always applies `getSortedRowModel()`; CrudTablePage.tsx:362-364 passes controlled `sorting` derived from server params; `grep -rn manualSorting src/` → zero hits. Empirical repro with repo's table-core: server order `Bùi, Đặng, Vũ` (vi collation, matching api/src/crud/crud.service.ts:99-107 `COLLATE "vi-VN-x-icu"` and makeMockApi `localeCompare(...,'vi')` masterdata/index.ts:59) re-sorted client-side to `Bùi, Vũ, Đặng` (code-point).
- Problem: Any sorted text column (tenKH, tenNganHang, tenModel…) displays the current page re-ordered with non-Vietnamese collation, contradicting both backends. Also wasted sort work per render.
- Recommendation: MODIFY — set `manualSorting: true` alongside `manualPagination` in DataTable when `onSortingChange` is external (or expose a `manualSorting` prop wired from CrudTablePage/KhachHangPage), and drop `getSortedRowModel` for manual tables.
- Effort: S

### F-E9: Bulk delete: fire-and-forget mutations, false success toast, N invalidations + N+1 toasts
- Severity: **Medium**
- Area: `src/components/crud/CrudTablePage.tsx`, `src/pages/danh-muc/KhachHangPage.tsx`, `src/hooks/use-crud.ts`
- Evidence: CrudTablePage.tsx:224-229 and KhachHangPage.tsx:121-126 (copy-paste): `for (const id of selectedIds) deleteMutation.mutate(id)` then immediately `notify.success('Đã xóa N dòng')`. Each mutation's own onSuccess fires `notify.success('Đã xóa')` + `invalidateQueries` (use-crud.ts:105-112).
- Problem: Summary success toast fires before any DELETE resolves — shown even if all N fail (real API 403/409, or mock's 5% `maybeThrow`). Deleting 10 rows produces up to 11 toasts and 10 list invalidations/refetches. Selection is cleared regardless of outcome.
- Recommendation: MODIFY — `await Promise.allSettled(selectedIds.map(id => deleteMutation.mutateAsync(id)))`, report `x thành công / y lỗi`, invalidate once, and suppress the per-item toast for bulk operations (e.g. a `silent` variant or use `mutateAsync` with local error collection).
- Effort: M

### F-E10: Double refetch after customer save (invalidate + explicit refetch)
- Severity: **Medium**
- Area: `src/features/customer/customer-editor-dialog.tsx`, `src/pages/danh-muc/KhachHangPage.tsx`
- Evidence: customer-editor-dialog.tsx:38 `await queryClient.invalidateQueries({ queryKey: ['khach-hang'] })` (refetches the active list and resolves when done) → :40 `onSaved(saved)` → KhachHangPage.tsx:266 `onSaved={() => void listQuery.refetch()}` fires a second identical request. Same pattern via ThemKhachHangModal (:280) and QuickCreateKhachHang (QuickCreateKhachHang.tsx:33).
- Problem: Every create/edit issues two list GETs back-to-back in real mode.
- Recommendation: MODIFY — drop the `refetch()` from `onSaved` handlers (invalidation already covers active queries), or drop the await+invalidate and keep one mechanism.
- Effort: S

### F-E11: CrudSheet "Lưu & Thêm mới" resets the form before the create resolves; blank number coerces to 0
- Severity: **Medium**
- Area: `src/components/crud/CrudSheet.tsx`
- Evidence: CrudSheet.tsx:161-167 `handleSubmit` calls `onSubmit(values, saveAndNewRef.current)` (async mutation fire) then synchronously `form.reset(buildDefaults(...))`. buildDefaults (:111-113) initializes number fields to `''`; buildSchema (:65-68) uses `z.coerce.number` — `Number('') === 0`, so an untouched required number field submits `0` instead of failing validation.
- Problem: (a) If the create fails (mock 5% error, real 400/409), the user's input is already wiped. (b) Required numeric fields (e.g. `thuTu` in menu.config.ts) silently persist 0.
- Recommendation: MODIFY — reset only in the mutation `onSuccess` path (CrudTablePage already has the hook point at :194-200); for numbers use `z.preprocess(v => v === '' ? undefined : v, z.coerce.number(...))` so blank required numbers error.
- Effort: S

### F-E12: KhachHangPage forks ~150 lines of CrudTablePage internals — and duplicated its bug
- Severity: **Medium**
- Area: `src/pages/danh-muc/KhachHangPage.tsx`, `src/components/crud/CrudTablePage.tsx`
- Evidence: column builder KhachHangPage.tsx:64-114 ≅ CrudTablePage.tsx:112-179; export handler :128-142 ≅ :231-243; bulk-delete confirm :121-126 ≅ :224-229; sorting updater :231-242 ≅ :365-377; `PAGE_SIZE_OPTIONS` :39 ≅ :27. The F-E1 defect exists in both copies — demonstrated fork cost.
- Problem: The bespoke page is justified (two create flows, edit-only row action — header comment :1-8), but it copied mechanics instead of extracting them; fixes must now be applied twice (F-E1, F-E8, F-E9 all ×2).
- Recommendation: REARRANGE — extract `buildCrudColumns(config, params, actions)` and `exportCrudRows(config, rows)` helpers into `components/crud/` consumed by both; keep page-level layout bespoke.
- Effort: M

### F-E13: khachHangConfig.fields is dead config with phantom test coverage
- Severity: **Medium**
- Area: `src/config/crud-configs/khach-hang.config.ts`, `src/config/crud-configs/khach-hang.config.test.ts`
- Evidence: `fields` (khach-hang.config.ts:89-147) are consumed only by CrudSheet; KhachHangPage never renders CrudSheet (uses CustomerEditorDialog/CustomerForm; grep confirms KhachHangPage.tsx:42 is the only khachHangConfig consumer). khach-hang.config.test.ts:27-43 asserts these dead fields ("uses the approved customer editor fields"), implying coverage of an editor that actually lives in customer-form.tsx.
- Problem: 60 lines of unreachable form config — including a bank select built from mock `NGAN_HANG_ROWS` (:130) and province/commune options from the bundled snapshot (:99,:108) — plus a test that green-lights a UI contract no user can reach. Tax regex exists in 3 places (config :120, customer-form-values.ts:73, api dto :18).
- Recommendation: DELETE `fields` from khachHangConfig (and the misleading test block), or explicitly repoint the test at `CustomerForm`. COMBINE the client tax-regex into one exported constant used by both remaining sites.
- Effort: S

### F-E14: Excel export exports only the current page, with raw codes instead of display values
- Severity: **Medium**
- Area: `src/pages/danh-muc/KhachHangPage.tsx`, `src/components/crud/CrudTablePage.tsx`
- Evidence: KhachHangPage.tsx:129 `const rows = result?.data ?? []` (one page, max pageSize); accessor :135-138 `String(row[key] ?? '')` bypasses `renderCell`. Same at CrudTablePage.tsx:232-242. Formula-injection neutralization itself is applied (exportToXlsx → buildSheetAoa → neutralizeCell, export-xlsx.ts:48-57) — that claim holds on both CRUD paths.
- Problem: "Xuất Excel" on khach-hang emits `phuongXaCode` "00123", `nganHangId` "ngh-1", `loaiKhachHangId` 3 instead of names, and silently truncates to the visible page with no user warning.
- Recommendation: MODIFY — reuse `renderCell` when it returns a string (fall back to raw otherwise), and either fetch all pages for export or label the file/notify "trang hiện tại".
- Effort: M

### F-E15: makeMockApi implemented twice (~100 duplicated lines) with contradictory ownership comments
- Severity: **Medium**
- Area: `src/mock/masterdata/index.ts`, `src/mock/masterdata/make-mock-api.ts`
- Evidence: index.ts:1-118 and make-mock-api.ts are line-for-line duplicates of `applyParams` + factory (diff shows only comments and `_idCounter` 10000 vs 90000). index.ts:2-3 claims "CRUD logic lives in exactly one place" — false. make-mock-api.ts:2-12 documents the circular-import reason for its existence.
- Problem: Pagination/sort/filter/search semantics (the mock↔real contract surface) can silently drift between the two copies; they already diverge in id ranges.
- Recommendation: COMBINE — `index.ts` should `export { makeMockApi } from './make-mock-api'` and delete its local copy (barrel re-export does not reintroduce the cycle since make-mock-api imports nothing from the barrel).
- Effort: S

### F-E16: Mock error injection (5%) and wall-clock seeds ship in production mock resources
- Severity: **Medium**
- Area: `src/mock/masterdata/make-mock-api.ts`, `src/mock/masterdata/index.ts`, `src/mock/masterdata/khach-hang.mock.ts`
- Evidence: both factories call `maybeThrow(0.05)` on every `list` (index.ts:80, make-mock-api.ts:~80) — unconditional, not dev-gated; prod ships mocks for every resource outside the 6 real ones (assert-real-resources.mjs asserts only the release set). `khach-hang.mock.ts:81` and `nhan-vien.mock.ts:65` pass `Date.now()` into `isoDateWithin`, contradicting the file header "deterministic via SeededRandom" (khach-hang.mock.ts:2) and C4 (seeded-random.ts:2-4).
- Problem: Production users of mock-backed catalogs hit random "Không thể tải dữ liệu" (~0.25% per load after retry:1, across dozens of tables); timestamps shift every reload, so "deterministic, no flake" guarantees used by tests/screenshots are not actually deterministic.
- Recommendation: MODIFY — gate `maybeThrow` on `import.meta.env.DEV`; seed date fields from a fixed base timestamp.
- Effort: S

### F-E17: `mustChangePassword` enforced only by a one-shot login redirect
- Severity: **Medium**
- Area: `src/pages/auth/LoginPage.tsx`, `src/routes/RequireAuth.tsx`
- Evidence: LoginPage.tsx:47 `navigate(result.mustChangePassword ? ROUTES.changePassword : from)`; the flag is dropped afterwards — RequireAuth.tsx:9-40 checks only token presence; the refresh path (auth-client.ts:89-101) returns no flag.
- Problem: A must-change-password user can navigate anywhere (type a URL, use the sidebar) or simply reload — the client never re-asserts the requirement. Server-side enforcement is the backend panelist's scope; the frontend contract gap is that the guard consumes identity but not this account state.
- Recommendation: MODIFY — persist the flag in the in-memory auth module (alongside the token) and have RequireAuth redirect to ROUTES.changePassword while set; have `/auth/refresh` response include it (coordinate with backend).
- Effort: M

### F-E18: ModelPage `staleTime: 0` + queryFn side effects re-run 3× listAll chains per visit
- Severity: **Low**
- Area: `src/pages/danh-muc/ModelPage.tsx`, `src/features/model/model-catalog-data.ts`
- Evidence: ModelPage.tsx:12-16 `useQuery({ queryKey: MODEL_CATALOG_QUERY_KEY, queryFn: loadModelCatalog, staleTime: 0 })`; loadModelCatalog (model-catalog-data.ts:53-62) runs three `listAll` pagination loops (page-size 200, sequential pages) and mutates global repair reference data via `replaceCatalogRows` inside the queryFn.
- Problem: Every ModelPage mount refires 3+ real HTTP list chains (model/nha-san-xuat/san-pham) even seconds after the last visit; the shared-cache intent of `MODEL_CATALOG_QUERY_KEY` (DeviceSection uses the same key) is defeated for this page, and the queryFn's global mutation makes fetch timing observable elsewhere.
- Recommendation: MODIFY — use the default 30s staleTime (or longer; catalog data) unless there is a documented freshness requirement; keep `replaceCatalogRows` but note it as the sanctioned sync point.
- Effort: S

## Duplication & dead-code inventory

| Item | Locations | Verdict |
|---|---|---|
| `makeMockApi` + `applyParams` full copy | `src/mock/masterdata/index.ts:20-118`, `src/mock/masterdata/make-mock-api.ts` | COMBINE — barrel re-exports make-mock-api (F-E15) |
| CRUD table mechanics (columns/export/bulk-delete/sort-updater/PAGE_SIZE_OPTIONS) | `src/pages/danh-muc/KhachHangPage.tsx:39,64-142,231-242` vs `src/components/crud/CrudTablePage.tsx:27,112-179,224-243,365-377` | REARRANGE — extract shared builders (F-E12) |
| `khachHangConfig.fields` (60 lines, incl. mock bank/geo options) | `src/config/crud-configs/khach-hang.config.ts:89-147`; asserted only by `khach-hang.config.test.ts:27-43` | DELETE — dead; no CrudSheet consumer (F-E13) |
| Tax-code regex ×2 client (+1 server) | `khach-hang.config.ts:120`, `customer-form-values.ts:73` (api dto:18) | COMBINE client copies into one constant |
| `searchKhachHang` ×2 with different data universes | `src/features/repair-create/sections/CustomerSection.tsx:18` (real customerApi) vs `src/features/stockout-editors/ban-hang-header-fields.tsx:28` (repair MOCK_TICKETS-derived) | MODIFY when Bán hàng leaves legacy scope; document divergence until then |
| `createCustomer` legacy sync mock write | `src/features/customer/create-customer.ts:24-38` (only caller: them-dai-ly-modal) | MODIFY/DELETE with F-E5 |
| Repair column-group scaffolding forked | `src/features/repair-kt/hooks/use-repair-kt-columns.tsx` (415 LOC; `REPAIR_KT_COLUMN_LABELS`:27-38) vs `src/features/repair-list/hooks/use-repair-table-columns.tsx` (437 LOC; identical `REPAIR_COLUMN_LABELS`:34-45, `META_LABEL_CLASS`) | REARRANGE — share label arrays + meta-stack cell builders; keep action cells separate |
| `khachHangApi`, `nganHangApi` module exports | `src/mock/masterdata/khach-hang.mock.ts` (bottom), `src/domains/hr/ngan-hang.mock.ts:31` — no consumers outside mock barrel (configs use `apiFor`) | DELETE |
| `TableRetryButton` | `src/components/shared/data-table/data-table.tsx:509-515` — zero consumers | DELETE |
| `unseenCount`/`unseenNewsCount`/`isSeen`/`isNewsSeen` store getters | `src/store/notification-store.ts:36-44` — used only by their own tests; NotifBadge.tsx:29-30 / NewsBadge.tsx:28-29 re-derive inline | DELETE getters or use them in badges (pick one) |
| `ColumnConfig.hidden` flag | declared `src/types/crud-types.ts:30`; set in 3 configs (model.config.ts:43, chuc-nang.config.ts:40, finance-tables/nhap-kho.config.ts:41); zero readers in CrudTablePage/DataTable | MODIFY — wire into initial columnVisibility, or DELETE the flag; today "hidden" columns render visibly |
| `getEntityLabel` candidate `'tenNhom'` listed twice | `src/components/crud/CrudTablePage.tsx:47,63` | DELETE dup entry |
| Route path lists ×3 | `src/routes/index.tsx` + `src/config/nav-config.tsx` (both ROUTES-sourced — consistent) vs `src/mock/masterdata/menu.mock.ts` hardcoded `duongDan` strings (15 entries) | MODIFY — source menu mock paths from ROUTES to prevent drift (mock-UI only, low urgency) |
| `/gallery` dev route in prod bundle | `src/routes/index.tsx:562` — comment "// Dev", no env guard (lazy chunk, auth-gated) | MODIFY — wrap in `import.meta.env.DEV` guard |
| Two geography stores | `src/data/vietnam-administrative-snapshot.ts` (static import in khach-hang.config.ts:8) vs `/api/v1/dia-ly` via `src/api/vietnam-geography.ts` | REARRANGE per F-E4 — snapshot becomes mock-fallback only |

## Unresolved questions

1. Is the "Thêm Đại Lý" button intended to be visible in this release despite the flow being documented out-of-scope (ARCHITECTURE.md:115-116)? If yes, product must accept F-E5's data loss until the follow-up; recommend hiding it instead.
2. `formatDwell` REF_NOW (F-E6): should dwell reflect a fixed demo timeline (then re-seed ticket dates from a fixed base) or real elapsed time (then use session `Date.now()`)? Both are one-line fixes but change demo narrative.
3. F-E17 requires `/auth/refresh` to return `mustChangePassword` — needs backend confirmation; frontend can only persist what it receives.
4. `ColumnConfig.hidden`: was the intent default-hidden-but-toggleable (wire to columnVisibility) or removed scope? Three configs currently set it with no effect.

Metrics: `tsc --noEmit` clean (exit 0). ~608 TS files in src; findings verified by grep + 2 runtime repros against repo node_modules; no code modified.
