# Red-Team Plan Review — Scope & Complexity Critic (Contract Verifier)

Plan: `plans/260713-1817-fullstack-live-review-remediation/` (plan.md + phases 1-8)
Lens: YAGNI / over-engineering / scope creep / double-planning. Security out of scope per user directive.
All evidence grep-verified against working tree at `e344fa7` (branch `feature/customer-model-relational-address`).

---

## Finding 1: Phase 5 parallel-reimplements the existing FilterPanel organism — the repo's dominant filter component (21 consumers) is never mentioned

- **Severity:** Critical
- **Location:** Phase 5, sections "Overview", "Architecture", "Related Code Files"; plan.md "Headline root causes" #5
- **Flaw:** P5 declares "one FilterBar" a *missing* organism and picks `CrudFilterBar` (4 page consumers) as the base to generalize. The repo already has exactly the organism described — `src/components/shared/filter-panel/filter-panel.tsx` (collapsible header, filter-count badge, "Xóa bộ lọc", responsive labeled grid, saved-views slot) — with **21 consumer files**. The word "FilterPanel" appears **zero** times in phase-05 or plan.md (`grep -n "FilterPanel\|filter-panel" phase-05... plan.md` → no match). Worse, the pages P5 names as migration *targets* already consume FilterPanel: "Xuất Kho micro-controls" — `src/pages/xuat-kho/BanHangPage.tsx:17,146` renders `<FilterPanel>`; `ban-hang-filters.tsx:12` imports `filterControlClassName` from the filter-panel module; CapLinhKienPage, TraHangPage, ChuyenKhoPage, ThuChiPage, CongNoPage, DsTraLKPage, DsTraLKXacPage, ThuHoiLKPage, report-page/report-filter-panel all consume it.
- **Failure scenario:** Implementer generalizes the 4-consumer `CrudFilterBar` into "the one FilterBar", migrates SCBH/KT/TonKho/XuatKho onto it — which migrates Xuất Kho pages **off** the organism they already share — and finishes with **two** competing organisms (FilterPanel still owns reports + warehouse + finance). Success criterion "grep finds no page-local filter-bar" is unreachable; churn on ~20 files nets a third paradigm instead of the promised 5→1 consolidation.
- **Evidence:**
  - FilterPanel consumers (21): `grep -rln "FilterPanel|filter-panel" src --include="*.tsx" --include="*.ts"` — part-return-filters, ban-hang-filters, ChuyenKhoPage, ThuHoiLKPage, report-page, issued-usage-filters, part-return-xac-filters, cap-linh-kien-filters, chuyen-kho-filters, tra-hang-filters, BanHangPage, CapLinhKienPage, ThuChiPage, TraHangPage, DsTraLKPage, report-filter-panel, DsTraLKXacPage, CongNoPage, store-keys, GalleryPage, shared/index (first 10 + total listed)
  - CrudFilterBar consumers (4 pages + engine): ChamCongPage, NhanVienPage, HangHoaPage, KhachHangPage, CrudTablePage
  - `src/components/shared/filter-panel/filter-panel.tsx:1-45` — already implements the exact contract P5 specifies ("collapsible 'Bộ lọc', labeled grid, apply/clear")
- **Suggested fix:** Rewrite P5's FilterBar work item as: converge `CrudFilterBar` INTO `FilterPanel` (4-page migration), then migrate the genuinely bespoke bars (SCBH `RepairFilters`, KT 12-field card, XemTonKho cascade). Delete "generalize CrudFilterBar into the one FilterBar organism".

## Finding 2: Phase 5 "Create: src/components/shared/status-badge.tsx" — the file already exists, and one of the four named consumer surfaces already uses it

- **Severity:** High
- **Location:** Phase 5, "Related Code Files" ("Create: `src/components/shared/status-badge.tsx`"), "Architecture" StatusBadge bullet, step 2; plan.md root-cause #5 ("no … StatusBadge … contracts")
- **Flaw:** `src/components/shared/status-badge.tsx` exists (44 lines, built over `hexOf`/`labelOf` from `src/domains/repair/status.ts` — precisely the domain anchor P5 specifies), committed 2026-07-10 (`9145e5a`). It is already consumed by `RepairListPage.tsx:104` (mobile cards) and `RecentTicketsTable.tsx:70` (dashboard — which P5 lists as a surface to *migrate*). The real remaining work is migrating 3 forks: `use-repair-table-columns.tsx:63-70` (renderStatusCell), `use-repair-kt-columns.tsx:106`, `ThongBaoPage.tsx:44-51`. plan.md's root-cause #5 ("no FilterBar/StatusBadge/TableToolbar/PageHeader contracts") is false on every count: FilterPanel (Finding 1), StatusBadge (this), `page-header.tsx` (42 consumer files), `data-table-toolbar.tsx`, `empty-state.tsx` (20 files) all exist. The phase reframes an **adoption** problem as a **creation** problem.
- **Failure scenario:** "Create" instruction produces either a Write conflict or a second badge implementation; "migrate 4 consumer surfaces + snapshot tests per status id" budgets work for a surface (dashboard) that needs zero changes. Reviewer trust in the phase's component inventory — the premise of the whole phase — collapses.
- **Evidence:** `ls src/components/shared/` → `status-badge.tsx`, `status-badge.test.tsx`, `page-header.tsx`, `empty-state.tsx`, `bulk-actions-bar.tsx`, `print-menu.tsx`, `filter-panel/`; `grep -rln StatusBadge src | grep -v test` → RepairListPage, RecentTicketsTable, GalleryPage, shared/index
- **Suggested fix:** Change "Create" to "Modify (dark-mode tokens per F-A19 if needed)"; scope migration to the 3 actual forks; correct plan.md root-cause #5 to "shared organisms exist but adoption is partial and inconsistent".

## Finding 3: Phase 5 success criteria exceed its file list — five filter-bar migrations with zero named files, plus unbounded "all list pages" sweeps, inside one "L" phase

- **Severity:** High
- **Location:** Phase 5, "Implementation Steps" 3-4, 7 vs "Related Code Files"; "Success Criteria" 1-3
- **Flaw:** Step 3 commits to "FilterBar migration page-by-page (SCBH, SCBH-KT, Tồn Kho, Xuất Kho, reports variant)" — none of `RepairFilters.tsx`, `RepairKtFilters.tsx`, `XemTonKhoPage.tsx`, the 6 `src/features/stockout/*-filters.tsx` files, or `report-filter-panel.tsx` appears in Related Code Files. Step 4/7 bullets ("all list pages' export labels", "one bottom pagination bar contract on every paged table") are unbounded: 33 pages consume `CrudTablePage`, 26 pages/features render `DataTable` directly, and "Xuất" labels appear in **22 files across 13 directories**. The criterion "grep finds no page-local filter-bar or badge forks" cannot be met by the listed files.
- **Failure scenario:** Implementer either silently expands scope to ~30 unlisted files (untracked churn on the highest-traffic screens) or satisfies the file list and fails the criteria — both outcomes discovered mid-phase, not at planning.
- **Evidence:** `grep -rln CrudTablePage src/pages | grep -v test | wc -l` = 33; export-label surfaces: 22 files (CrudTablePage, repair-batch-toolbar, chuyen-kho/tra-hang batch toolbars, BangLuongPage, ChamCongTongHopPage, NhapKhoPage, 3 report pages, KPI pages, ThuChiPage, BanHangPage, …); Related Code Files contains only 14 bullets, two of which are the vague "repair/KT/dashboard/Thông báo status renderings" and "all list pages' export labels"
- **Suggested fix:** Split P5: 5a = engine dedup + builders + dead-code deletion (bounded, listed); 5b = adoption sweep with an explicit page checklist. Cut "one pagination contract on every paged table" to the pages actually flagged by findings (F-A2 names SCBH/KT totals).

## Finding 4: Phase 2 Bán hàng work item prescribes building behavior that already exists, under a wrong file path, in a README-frozen flow

- **Severity:** High
- **Location:** Phase 2, "Related Code Files" ("Modify: `src/domains/warehouse` Bán hàng save path + list source (persist and prepend new sale in the mock store; always toast success/failure)"), step 7; plan.md root-cause #3 ("Bán hàng saves vanish")
- **Flaw:** The save path is not in `src/domains/warehouse` — it is `src/features/stockout-editors/create-selling.ts:31-47`, which **already** `unshift`s into `SELLING_ROWS` (line 45), the same mutable store the list fetcher reads (`src/domains/warehouse/list-fetchers.ts:53-55`). The success toast **already** exists (`BanHangEditorPage.tsx:121` `notify.success('Đã lưu phiếu bán hàng …')`). The observed vanish (F-C6) has a narrower cause the plan never scouts: the editor hardcodes `branchId: BRANCHES[0].id` (`BanHangEditorPage.tsx:106,141`) so a branch-filtered list hides the row, and `BanHangPage.tsx:89-100` uses `useQuery(['ban-hang-list',…], placeholderData: keepPreviousData)` with no invalidation after navigating back. The plan budgets "persist and prepend in the mock store" — already done — against a flow README:12-13 explicitly freezes ("luồng Bán hàng không đổi, không thuộc phạm vi chuyển đổi này").
- **Failure scenario:** Implementer opens `src/domains/warehouse`, finds no save path, re-scouts from scratch, then "implements persistence" that duplicates `create-selling.ts` — churn in a frozen flow to fix a one-line invalidation/branch bug.
- **Evidence:** `create-selling.ts:45` `SELLING_ROWS.unshift(order)`; `BanHangEditorPage.tsx:111-127` (validate → createSelling → notify.success); `git log -- src/features/stockout-editors/create-selling.ts` shows it landed in `9145e5a`, i.e., before the plan was written
- **Suggested fix:** Rewrite step 7 to the proven defect: invalidate `['ban-hang-list']` after save + fix the hardcoded `BRANCHES[0].id`; correct the file path to `src/features/stockout-editors/`. Downgrade plan.md root-cause #3's "Bán hàng saves vanish" from data-loss to display-staleness.

## Finding 5: Phase 2's dealer-flow default reverses an explicit README scope freeze while its open question is unresolved — and the risk note contradicts the work item

- **Severity:** High
- **Location:** Phase 2, "Architecture" dealer bullet + step 1; plan.md Open Question 5 ("Plan defaults to wiring it through `persistCustomer`"); Phase 2 "Risk Assessment" bullet 1
- **Flaw:** README:12-13: "Quick-create Đại lý và luồng Bán hàng **không đổi, không thuộc phạm vi chuyển đổi này**." The plan's *default* (pending an unanswered product question) is to rewire `them-dai-ly-modal.tsx` through `persistCustomer` AND replace its address model — the modal is built on the legacy 3-level TINH/QUAN/XA lookups (`them-dai-ly-modal.tsx:28,46-47,104`) while the normalized model is 2-level street/province/commune with no Quận at all. The risk note claims "the plan changes its persistence, not its UX contract" — swapping a 3-level address cascade for a 2-level trio **is** a UX/form-contract change, contradicting the note in the same file. Minimum remediation for the actual finding (F-B3: silent close, no save, input lost) is feedback-only: inline errors + never-close-on-failure + honest failure toast — none of which require unfreezing persistence.
- **Failure scenario:** Implementer executes the documented default, lands a persistence + address-model rewrite of a frozen flow in a P1 hotfix-track phase; product answer arrives afterward as "freeze stands" and the work is reverted.
- **Evidence:** README:12-13; `them-dai-ly-modal.tsx:28` `import { TINH, QUAN, XA } from '@/mock/seed/tinh-quan-xa'`; `create-customer.ts:23` comment "Dealer compatibility path"; only caller of legacy `createCustomer` is the dealer modal (`grep -rn "createCustomer\b" src` → them-dai-ly-modal.tsx:29,87 — one caller, so the delete-or-gate bullet is at least correctly bounded)
- **Suggested fix:** Flip the default to the feedback-only fix (matches F-B3's actual severity); make "wire through persistCustomer" the gated stretch path contingent on the open-question answer, mirroring how P7 gates its merge path.

## Finding 6: Phase 3's cross-plan handoff is fictional — "noted there" points at a note that does not exist in 260707-1612 Phase 2

- **Severity:** Medium
- **Location:** Phase 3, "Related Code Files" auth bullet ("full server guard stays with 260707-1612 phase 2, **noted there**"); plan.md Cross-Plan Dependencies ("mustChangePassword findings (F-D10, F-D14) also feed its Phase 2")
- **Flaw:** `grep -rn -i "mustChange|doi-mat-khau|change.*password" plans/260707-1612-real-backend-database/phase-02-real-permission-enforcement-identity.md` → **zero matches** (only the unrelated `password?: string` secret-leak gate at line 81). Nothing in the other plan claims ownership of the server-side must-change-password guard. Meanwhile the infrastructure P3 plans to add is largely built: `api/src/auth/auth.service.ts:66,122` already returns `mustChangePassword`; `auth.controller.ts:52` returns it on login; the only real gap is the **refresh** response (`auth.controller.ts:69-70` returns `{ accessToken }` only) + client persistence. The plan books a full "Auth flow" step on a false premise about where the rest lives.
- **Failure scenario:** Both plans assume the other owns the server guard; a user who reloads mid-forced-change keeps app access until token expiry — the exact F-D14 hole — survives both plans' completion.
- **Evidence:** grep above; `src/routes/RequireAuth.tsx` has no mustChangePassword handling; `src/pages/auth/LoginPage.tsx:47` is the only client gate
- **Suggested fix:** Either add the guard note to 260707-1612 phase-02 (via the lead/planner — this plan cannot edit it) before P3 starts, or pull the server guard into P3 (it is ~one guard given the flag already rides the JWT payload, `api/src/auth/jwt-payload.ts:10`).

## Finding 7: Phase 3 and Phase 4 double-book `khach-hang.config.ts` with interdependent edits while plan.md declares them parallelizable; dia-ly server work has conditional ownership

- **Severity:** Medium
- **Location:** plan.md "Phase Dependencies" ("P3 is server-side, parallelizable with P4/P5"); Phase 3 "Related Code Files" bullet 6; Phase 4 "Related Code Files" bullets 4, 6 and "Architecture" bullet 2
- **Flaw:** P3 modifies `src/config/crud-configs/khach-hang.config.ts` ("drop mock `daiLyName` lookup once server enriches; remove pageSize 300") and P4 modifies the same file ("drop static snapshot import; … drop `NGAN_HANG_ROWS`/`KHACH_HANG_ROWS` mock imports **as Phase 3 enrichment lands**"). P4's frontmatter declares `dependencies: [1]` but its own text sequences it after P3 twice ("as Phase 3 enrichment lands"; dia-ly caching "rides with Phase 3 if sequenced first, else here"). So the declared graph (P3 ∥ P4) contradicts the file-level reality (P4 edits gated on P3 outputs), and the dia-ly `Cache-Control`/compression work has no single owner. Additionally P4's file list contains a phantom path and an inflated caller count: `QuickCreateKhachHang.tsx` is at `src/features/repair-create/quick-create/`, not `src/features/customer/`; and the "drop `refetch()` from onSaved" bullet lists **4 files**, but `grep -rn "refetch()" ` finds save-path refetch calls in exactly **1** (`KhachHangPage.tsx:266,280,285`; `customer-editor-dialog.tsx:38` and `QuickCreateKhachHang.tsx:31` use `invalidateQueries`, and `them-khach-hang-modal.tsx` is a pass-through wrapper).
- **Failure scenario:** Two agents execute P3 and P4 in parallel per plan.md, collide on khach-hang.config.ts, and each waits on the other's "lands first" clause; the P4 implementer burns time hunting a QuickCreate file in the wrong directory and "fixing" refetches that don't exist.
- **Evidence:** grep results above; `find src -iname "*QuickCreateKhachHang*"` → `src/features/repair-create/quick-create/QuickCreateKhachHang.tsx`
- **Suggested fix:** Set P4 `dependencies: [1, 3]` (or move the two khach-hang.config edits + dia-ly caching wholly into one phase); correct the QuickCreate path; shrink the refetch bullet to KhachHangPage only.

## Finding 8: SCBH toolbar rework is double-planned in Phase 5 step 6 and Phase 7 step 4 — and the "In ▾ split-button" reinvents the existing PrintMenu

- **Severity:** Medium
- **Location:** Phase 5, step 6 ("demote SCBH's 10-button wall: print variants → 'In ▾' split-button, bulk actions → selection-context bar …, drop 'Tải lại trang'"); Phase 7, "Architecture" SCBH bullet + step 4 + success criterion 4 (identical item list)
- **Flaw:** The same four deliverables (In ▾, selection-context bar, header primary action, drop reload) appear as concrete steps in both phases; P5's parenthetical "(full placement rework lands with Phase 7)" does not remove them from P5's step or from P7's criteria — ownership is split mid-toolbar. Second: `src/components/shared/print-menu.tsx` already implements a print dropdown (default label "In", items with onSelect) — currently consumed only by GalleryPage while `repair-batch-toolbar.tsx:37-42` imports five discrete `print*` functions. Neither phase mentions PrintMenu; P7 would build a new "In ▾ split-button" beside an idle shared component. (P7 does at least acknowledge `BulkActionsBar exists` — and `RepairListPage.tsx:239` already renders it.)
- **Failure scenario:** P5 lands a half-toolbar (print consolidation without placement), P7 redoes the same buttons; or two implementers touch `repair-batch-toolbar.tsx` in consecutive phases with conflicting layouts — churn on the app's highest-traffic screen, twice.
- **Evidence:** grep of both phase files (5 matching bullets quoted above); `print-menu.tsx:25` `label = 'In'`; PrintMenu consumers: GalleryPage only
- **Suggested fix:** Delete the SCBH-toolbar clause from P5 step 6 entirely (P5 keeps only the generic PageHeader contract); P7 owns the whole toolbar and consumes `PrintMenu` instead of inventing a split-button.

## Finding 9: Phase 6/8 carry non-finding redesign items — sidebar frequency reorder (sourced from a "sketch"), login masthead, and a dashboard KPI-grid rework for Low-severity cosmetics

- **Severity:** Medium
- **Location:** Phase 6, "Architecture" Sidebar + Dashboard bullets, "Findings" line ("sidebar-order recommendation (journey report 'Proposed IA')"); Phase 8, "Misc" (login masthead F-A22)
- **Flaw:** The sidebar reorder cites no F-number — its source is the journey report's "Proposed IA (revised sidebar/nav sketch)" (line 199), an appendix sketch, not one of the 93 findings; P6's own Findings line labels it a "recommendation". Its own risk note concedes it is "muscle-memory churn for existing users". The dashboard 5th-KPI fold traces to F-A15 (**Severity: Low**) yet P6 specs a responsive grid rework ("5-col at ≥1920, else merged metric"). Login masthead = F-A22 (**Severity: Low**, "Login card floats in dead space" — pure branding on a pre-auth page). In a remediation plan triaging 93 findings with data-loss items still open, these are gold plating: P6's genuinely findings-driven core (22 unreachable sub-pages, notification dedup, dev artifacts in prod, double-active sidebar) does not need the reorder to succeed, and the reorder churns every e2e nav assertion P6 itself adds in step 7.
- **Failure scenario:** Reorder + group-divider lands with the tab-strip work; nav e2e written the same phase encodes the new order; the follow-up 260707-1612 permission work (which hides nav per role) re-breaks the assertions — paying the churn twice for a zero-finding change.
- **Evidence:** journey report lines 199-201; F-A15 severity Low (layout report:133), F-A22 severity Low (layout report:189); no F-number attached to the reorder in P6's findings line
- **Suggested fix:** Cut sidebar reorder and login masthead from this plan (park as backlog); keep only exact-prefix active matching (F-A? double-active is findings-driven) and the F-C8 tab removal; fold the 5th KPI card with a one-line col-span fix, not a breakpoint matrix.

## Finding 10: Verification burden is gold-plated relative to the defects: filter fuzzing, screenshot-gated refactors, exact network-count tests, and 15 per-status snapshots

- **Severity:** Medium
- **Location:** Phase 3 success criterion 1 ("fuzz the six real resources' filters"); Phase 7 step 1 ("assert zero visual diff (screenshot e2e) before any behavior change"); Phase 4 success criterion 1 ("msw-count test" for exactly 1 dia-ly + 1 ngan-hang GET); Phase 5 step 2 ("snapshot tests per status id" — 15 statuses)
- **Flaw:** Each defect already has a cheap deterministic proof: P3's filter bug is closed by 3-4 example-based contract tests (`abc` → 400, nested object → 400, NaN → 400) — a fuzz harness for six admin CRUD resources is infrastructure the plan never budgets and CI must then maintain. P7's screenshot gate for an internal label-array extraction duplicates the phase-final `test:e2e:uiux` gate the plan already mandates per phase. P4's exact-count msw assertion is brittle by construction — any legitimate future prefetch fails CI with a false positive; asserting "≤1 per key" via query-cache inspection proves the same fix. P5's 15 snapshots pin markup for a 44-line presentational component that already has a unit test (`status-badge.test.tsx`).
- **Failure scenario:** The verification scaffolding (fuzzer, screenshot baselines for intermediate refactor states, count-pinned msw suites) outweighs the fixes, slows every subsequent phase (P5-P8 all touch the same surfaces and re-baseline the same screenshots), and rots into `--update-snapshots` culture.
- **Evidence:** validation gates in plan.md already run `test:e2e:uiux` per UI phase; `status-badge.test.tsx` exists; the six real resources are enumerable (README:7-8) making example-based coverage exhaustive without fuzzing
- **Suggested fix:** Replace "fuzz" with the enumerated malformed-value contract table; drop P7's intra-phase screenshot gate in favor of the existing phase-final suite; assert deduplication via React Query cache (one entry per `['ref-data',…]` key), not wire counts; one representative StatusBadge snapshot + a hex-map completeness unit test.

---

## Contract-Verifier Tally (claims vs grep)

| Plan claim | Grep reality |
|---|---|
| P5: "Create status-badge.tsx" | Exists since `9145e5a` (2026-07-10); 2 consumers already migrated |
| P5: FilterBar missing, generalize CrudFilterBar | FilterPanel exists, 21 consumers; CrudFilterBar has 4 |
| plan.md root-cause 5: "no FilterBar/StatusBadge/TableToolbar/PageHeader contracts" | All four exist (`filter-panel/`, `status-badge.tsx`, `data-table-toolbar.tsx`, `page-header.tsx` — 42 files) |
| P2: "Modify src/domains/warehouse Bán hàng save path" | Save path is `src/features/stockout-editors/create-selling.ts`; already persists + toasts |
| P2: "Modify: dashboard recent-tickets widget (src/pages/dashboard/…)" | `src/pages/dashboard/` does not exist; widget is `src/components/dashboard/RecentTicketsTable.tsx` |
| P3: server guard "noted there" (260707-1612 P2) | Zero mentions in that file |
| P4: drop `refetch()` in 4 files | Present in 1 file (`KhachHangPage.tsx:266,280,285`) |
| P4: `src/features/customer/…/QuickCreateKhachHang.tsx` | Actual: `src/features/repair-create/quick-create/QuickCreateKhachHang.tsx` |
| P2: delete-or-gate `createCustomer` "if no other consumer" | Verified: exactly 1 caller (`them-dai-ly-modal.tsx:29,87`) — claim holds |
| P7: 437+415 LOC hooks, identical label arrays | Verified: 437/415 lines; label arrays diff-identical — claim holds |
| P1: `cell: undefined` in both builders | Verified: `CrudTablePage.tsx:129-137`, `KhachHangPage.tsx:81-89` — claim holds |
| P1: health endpoint lacks DB probe | Verified: `health.controller.ts` returns static `{status:'ok'}` — claim holds |
| P1: deploy workflow hardcodes dead Render URL for push | Verified: `deploy-pages.yml:35` — claim holds |

## Unresolved Questions

1. Who is allowed to edit `plans/260707-1612-real-backend-database/phase-02` to make the mustChangePassword handoff real (Finding 6)? This plan's reviewer/implementer cannot.
2. Is the journey report's observation "no toast confirmed the save" (F-C6) reproducible? Code shows `notify.success` on the save path — if the toast genuinely didn't fire, the defect is in `validate()` silently returning false, which changes P2 step 7 again.
