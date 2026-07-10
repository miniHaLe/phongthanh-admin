---
title: "Reference UI Parity Upgrade (TDD)"
description: "Upgrade the React rebuild to content/interaction parity with the legacy ASP.NET reference (phongthanh.phanmemsuachuabaohanh.com) per approved decisions D1-D4"
status: completed
priority: P1
branch: ""
tags: [reference-parity, tdd, frontend]
blockedBy: []
blocks: []
created: "2026-07-03T13:43:23.183Z"
createdBy: "ck:plan"
source: skill
---

# Reference UI Parity Upgrade (TDD)

## Overview

Bring the mock-data React rebuild (`React 18 + Vite + TS + Tailwind + shadcn/ui`) to reference parity per the approved design in
[`plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md`](../reports/brainstorm-260703-reference-ui-parity-gap-matrix.md) (§6 decisions, §7 phase breakdown).
Scale: ~88 high / 121 medium gaps across ~50 pages.

**Decisions (locked, do not re-litigate):**
- **D1** Keep flat IA (flat sidebar + section tabs). Add missing routes into it. No accordion clone.
- **D2** Legacy 15-status vocabulary is canonical (ids + hex in gap matrix §5b).
- **D3** Reference is the data spec — port columns/fields/taxonomies/models exactly; drop invented fields. *(Mechanism set by D5, not "regenerate seed".)*
- **D4** Integrations as working mocks (call toast, prints via print CSS, real client .xlsx, map modal, SMS toast).
- **D5** (Red-team Finding 1 resolution) **Edit the live data layer each page actually reads — in place.** The `src/mock/seed/*` arrays P1 was originally going to regenerate have **zero page importers** (verified 260704); rendered data comes from other layers. Each phase corrects the layer its pages read, and P1 deletes the dead duplicate seed arrays. No app-wide "single source of truth" rewire (that ripple was the red-team's own warning). See §"Data-Layer Reconciliation (D5)".

**Source-of-truth specs** (exact Vietnamese labels/columns/endpoints — phase files reference, never restate fully):
- Per-section: `plans/reports/ref-ui-parity-sections/section-*.md` (12 files, each with verified 260703 addenda)
- Repair detail/create: `plans/reports/brainstorm-260703-repair-detail-create-refspec.md`
- Mirrored HTML for spot checks: `/tmp/ptref/` (raw + `trimmed/`) — ephemeral, may not survive reboot

## TDD Contract (applies to every phase)

Test stack (installed Phase 1): **Vitest + @testing-library/react + @testing-library/user-event + happy-dom** (Vite-native; no Jest).
Commands: `npm run test` (watchless `vitest run`), `npm run test:watch`.

Per phase discipline:
1. **Lock current behavior**: before refactor steps, write characterization tests for behavior that must survive (only where phase touches existing code).
2. **Spec tests first**: encode the reference spec (column headers in order, filter fields, action labels, status ids/colors, modal flows) as failing tests, citing the section file.
3. Implement until green; then `npm run type-check && npm run lint && npm run build`.
4. Never weaken a test to pass; fix the code or flag the spec conflict in the phase report.

Test placement: co-located `*.test.ts(x)` next to source; shared helpers in `src/test/` (setup, render-with-providers, seeded-query-client).

**Stable code artifacts (red-team M4):** the finding codes and decision labels in this plan (`D5`, `C1`, `F8`, `H3`, etc.) are planning bookkeeping — they must **NOT** appear in code comments, test names, variable names, commit messages, or migration names. In code, describe the behavior/invariant directly (e.g. "neutralize formula-leading cells", "overdue is a seeded field", not "F8 fix" / "C1 fix").

## Cross-cutting primitive ownership (build once, reuse)

| Primitive | Owner | Consumers |
|---|---|---|
| Legacy status module (15 ids+hex, KT subset) | P1 | P3, P4, P5 (DSCapLK filter), P7 (charts) |
| Kỳ (period) entity + seed | P1 | P5 (inventory), P6 (HR ×4), P3 (Kỳ hoàn tất filter) |
| Tỉnh→Quận→Xã hierarchy + `TUYEN` seed | P1 | P6 (Khu vực, Phường/Xã, customers), P3 (filters) |
| Live repair data (`domains/repair/mock-data.ts` `MOCK_TICKETS` + `dashboard-mock.ts` `ALL_TICKETS`) edited in place to legacy statuses/reference fields (D5) | P1 | P3, P4 |
| Shared lookup modules (Kỳ, Tỉnh/Quận/Xã, taxonomies) imported by the pages that need them | P1 | P3, P5, P6 |
| `export-xlsx.ts` client exporter (SheetJS `xlsx`) | P2 | P3-P7 (every "Xuất Excel") |
| `print-window.tsx` helper (+ per-doc print layouts) | P2 | P3 (5 prints), P4, P5, P6 (in phiếu) |
| DataTable bulk-select extension (checkbox col + toolbar slot) | P2 | P3, P5, P6, catalogs |
| `ServerAutocomplete` + `[+]` quick-create modal pattern | P2 | P3, P4, P5, P6 |
| Full-page line-item editor template | P2 | P5 (×6 editors), P6 (Invoice, NhanVien uses form-page variant) |
| Kỳ picker component | P2 | P5, P6 |
| Notification store (bell + news, mock feed) | P2 | shell |
| Demo call-center toast (Tiếp nhận → intake) | P2 | shell, P3/P4 intake |

Rule: a later phase needing a missing primitive extends it in place (same file), never forks.

## Data-Layer Reconciliation (D5) — authoritative

The rebuild has **multiple independent mock render layers**, not one seed (verified 260704, re-verified after red-team 260704). Each phase edits the layer its pages actually read; the `mock/seed/*` ticket/customer/financial arrays are dead and P1 deletes them.

| Live layer (what pages read) | Feeds these pages | Status vocab today | Owning phase(s) |
|---|---|---|---|
| `src/domains/repair/mock-data.ts` → `MOCK_TICKETS` (250, self-generated) | Repair list / detail / create | imports `status.ts` | P1 (status+fields), P3/P4 (extend) |
| `src/mock/dashboard-mock.ts` → `ALL_TICKETS` (own generator) | Home dashboard tiles/branches | **imports `status.ts`** — `REPAIR_STATUSES`/`STATUS_BUCKET`/`RepairStatus` at `dashboard-mock.ts:10-17` (NOT a separate vocab; it is one of the 15 status.ts consumers) | P1 (migrates with the status swap) |
| `src/mock/finance-mock.ts` + `src/config/finance-tables/*` | Finance (thu-chi, cong-no, hoa-don) | n/a | P6 (edit in place) |
| `src/mock/masterdata/*` + `src/config/crud-configs/*` | Catalog (14) + customer + some HR | n/a | P6 (edit in place) |
| `src/mock/inventory-mock.ts` | Warehouse/stock-out lists | n/a | P5 (edit in place) |
| `src/mock/reports/*` (`report-configs.ts`, `kpi-mock.ts`, `sua-chua-report-mock.ts`) | Báo cáo (7 report pages) | `sua-chua-report-mock.ts` imports `status.ts` (migrated P1); `kpi-mock`/`report-configs` n/a | P1 (status-touching bit), P7 (report re-model) |
| `src/mock/finance-kpi-mock.ts` (→ `finance-mock.ts`) | Finance KPI (`use-finance-kpi.ts`) | n/a | P6 |

**Correction (red-team C1/H2, 260704):** an earlier draft called `dashboard-mock.ts` a "separate snake-vocab layer that doesn't import status.ts" — that was **wrong** (`dashboard-mock.ts:10-17` imports the shared module; `qua_han` lives in `status.ts:30`). Dashboard is therefore an ordinary status.ts consumer and migrates with the numeric-union swap — the compiler flags it like the others. And `mock/reports/*` + `finance-kpi-mock.ts` are additional live layers (were missing from the first map), so P7's report re-model has the same "edit the layer pages read" instruction.

**Dead-on-arrival (P1 deletes, zero page importers):** `seed/repair-tickets.ts` (`SEED_REPAIR_TICKETS`), `seed/customers.ts` (`SEED_CUSTOMERS`), `seed/financials.ts`. **Kept from `seed/`:** `branches.ts` (`BRANCHES`/`BRANCH_NAME` — widely imported), the shared `BaseEntity`/`ListParams`/`PagedResult` types in `seed/index.ts`, and `reference-data.ts` lookups still consumed. New shared lookup modules (Kỳ, Tỉnh/Quận/Xã, taxonomies) are added under `src/mock/seed/` and imported directly by consuming pages.

**Naming (Finding 2 — avoid a name clash):** two distinct `KhuVuc` shapes exist today — live `src/types/masterdata-types.ts` `KhuVuc { maKhuVuc, tenKhuVuc }` (the catalog/customer entity, ~15 consumers incl. the hardcoded search-field allowlist at `CrudTablePage.tsx:45` and `khuVucId` FKs) **and** `seed/reference-data.ts` `KhuVuc` (barrel-exported via `seed/index.ts`, deleted by P1). The new Tuyến/route entity is named **`TUYEN` / `Tuyen`** (NOT a third `KhuVuc`) so nothing re-collides once the seed copy is gone. *(Precise mechanism, red-team M2: the collision isn't "masterdata KhuVuc is in the barrel" — it isn't; it's that adding a route entity as `KHU_VUC` would resurrect a barrel export whose name shadows the live type at import sites. `TUYEN` sidesteps it cleanly.)* **P6 KhuVuc re-model blast radius (red-team H3): ~15 files** consume `maKhuVuc`/`tenKhuVuc`/`KHU_VUC_ROWS`/`khuVucId` — P6 keeps the `KhuVuc` symbol name but re-models its fields onto Tỉnh/Quận/Xã ids, and must update all ~15 consumers incl. `CrudTablePage.tsx:45`. P6 lists them (Contract-Verifier count, not "update all consumers").

**Cross-cutting derivations pinned here (so phases agree):**
- **KT board (Findings 14):** `KT_BOARD_STATUS_IDS` is a **set** (membership), canonical value `[2,4,6,7,8,9,13,15,16,17]` (ascending). The KT board *display order* `[2,4,15,6,7,13,17,16,8,9]` is a separate P4 presentation constant — tests assert set-equality (sorted) for membership, sequence-equality only for the display array. Never deep-equal the two.
- **Repair-list display order (P3):** `[1,2,4,15,6,17,13,7,8,11,16,9,10,12,14]` is also presentation-only, separate from the id-ordered `REPAIR_STATUSES`.
- **Overdue is a seeded field, not a computed-vs-now (Findings 15 + red-team H1/M1, user decision 260704):** `qua_han` status is deleted. **There is no stable "now"** — the fixed `2024-07-01` REF clock lived only in the deleted seed files; the live layers (`dashboard-mock.ts`, `mock-data.ts:503`, `finance-mock.ts:100`) use `new Date()`, which makes any "older than N days" rule nondeterministic and calendar-drifting → flaky tests. **Resolution: bake overdue in at generation as seeded data.** Each generated ticket/receivable carries a seeded `isOverdue: boolean` (or a seeded `slaDueDate` relative to its own `receivedDate`), and dashboard/finance overdue counts become `filter(t => t.isOverdue)` — **no wall clock anywhere.** Applies to: `dashboard-mock.ts` `overdueCount`, the live `MOCK_TICKETS` generator, and `finance-mock.ts` Công nợ overdue (`:100`). Determinism preserved; overdue is data, not derivation.
- **HinhThuc / warranty taxonomy (Finding 4):** the `Bảo hành / Sửa dịch vụ / BH sửa chữa` migration is owned by **P3** (repair-list is its first consumer); P4 consumes, never re-owns. The stray third `HINH_THUC` in `reference-data.ts` (`:537`) becomes dead-with-zero-importers once P1 deletes its sole consumer `repair-tickets.ts` — P3 reconciles/removes it.
- **Security helpers (Findings 6-9):** built once in P2 — `resetDemo()` restores baseline; `print-window` builds DOM via `textContent` (no untrusted `document.write` concat), covering the print **body/PrintLayout** too, not just `<title>`; `export-xlsx` neutralizes leading `= + - @` **including after leading whitespace/tab/CR, without corrupting legitimate numeric negatives** (red-team M3 — a bare `-1`/`+1` that parses as a number is left alone; only non-numeric strings starting with a formula trigger get prefixed); `openExternal()` does `encodeURIComponent` + `noopener,noreferrer` + a strict scheme check that rejects `javascript:`/`data:`, **protocol-relative `//host`, case/whitespace/newline-obfuscated schemes** (parse via `URL`, lowercased scheme ∈ {http,https}). P3/P5/P6/P7 consume these, never hand-roll.
- **CSV export path (red-team C3):** the enforcement is NOT just a grep for `document.write`/`XLSX.writeFile`/`window.open` — the live exporter is `mockCsvDownload` (`export-excel-menu.tsx:36`, `Blob`+`URL.createObjectURL`+`a.click()`+string-concat CSV) which those greps miss. P2 must **replace `mockCsvDownload` with the hardened `export-xlsx`** (or apply F8 neutralization to its CSV path), and P7's audit greps additionally for `createObjectURL`/`mockCsvDownload`/`a.click()`.

## Phase dependencies

P1 → P2 → P3 → P4; P5, P6 depend on P1+P2 (parallelizable after P2, but P5 before P6 preferred — inventory feeds finance links); P7 last (needs statuses, Kỳ, exporter, all pages for permission matrix rows).

Each phase leaves the app shippable: `type-check`, `lint`, `test`, `build` all clean; no dead routes.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundations: test infra + legacy statuses + core entities + seed](./phase-01-foundations-test-infra-legacy-statuses-core-entities-seed.md) | Completed (2026-07-04) |
| 2 | [Shell + notifications + cross-cutting primitives](./phase-02-shell-notifications-cross-cutting-primitives.md) | Completed (2026-07-04) |
| 3 | [Repair workspace Index_8 parity](./phase-03-repair-workspace-index-8-parity.md) | Completed (2026-07-04) |
| 4 | [Repair detail/create + KT board](./phase-04-repair-detail-create-kt-board.md) | Completed (2026-07-06) |
| 5 | [Warehouse + stock-out](./phase-05-warehouse-stock-out.md) | Completed (2026-07-06) |
| 6 | [Finance + catalog + HR](./phase-06-finance-catalog-hr.md) | Completed (2026-07-07) |
| 7 | [Reports + permissions + polish](./phase-07-reports-permissions-polish.md) | Completed (2026-07-07) |

## Acceptance criteria (plan level)

- Every high-severity gap in the gap matrix is closed or explicitly deferred with reason in the phase report.
- All 12 missing pages exist as working pages (mock data) reachable from flat IA nav.
- Status vocabulary everywhere = legacy 15 (grep finds no old snake_case status ids).
- Reference column sets match exactly (order + Vietnamese headers) on every ported table — verified by spec tests.
- **D5: reference data reaches the rendered pages** — spec tests run against the LIVE layers (`domains/repair/mock-data.ts`, `dashboard-mock.ts`, `finance-mock.ts`, `masterdata/*`, `inventory-mock.ts`), and grep finds no surviving dead-seed refs (`SEED_REPAIR_TICKETS`/`SEED_CUSTOMERS`/`SEED_FINANCIALS`) nor a second `KhuVuc` symbol (route entity = `TUYEN`).
- **Security helpers (F7-F9) are the only print/export/external-open paths** — grep finds no raw `document.write`, `XLSX.writeFile`, or `window.open(` bypassing the P2 helpers.
- `npm run type-check && npm run lint && npm run test && npm run build` clean at every phase boundary.

## Open decisions carried from brainstorm §8 (defaults; override before affected phase starts)

1. Home stays KPI dashboard; "Kế hoạch của bạn" calendar added as dashboard tab/widget (P2).
2. ~~Reference 6 reports become canonical; invented reports retired from nav (P7).~~ **OVERRIDDEN by validation V5:** reference 6 + `Doanh Thu`/`Xuất Kho` kept as local extras; only SuaChua/TiepNhan retired.
3. Permission menu-tree + 202-checkbox matrix as working mock, state persisted locally, no enforcement (P7).
4. Customer bulk-select drives bulk delete only (P6).

## Red Team Review

### Session — 2026-07-04
**Reviewers:** 4 (Assumption Destroyer, Failure Mode Analyst, Scope & Complexity Critic, Security/Data-Integrity Adversary). **Findings:** 34 raw → 15 after dedup/evidence-filter. All carry `file:line` evidence; controller re-verified the load-bearing ones directly.

**Severity breakdown:** 2 Critical, 10 High, 3 Medium.

| # | Finding | Sev | Disposition | Applies to |
|---|---|---|---|---|
| 1 | **Data-layer disconnect (ROOT):** P1 regenerates `src/mock/seed/*` but live pages read 3 other layers — repair list → `domains/repair/mock-data.ts` `MOCK_TICKETS` (250 rows, snake statuses); catalogs/customer → `mock/masterdata/*`; finance → `mock/finance-mock.ts`. `SEED_REPAIR_TICKETS`/`SEED_CUSTOMERS` have **zero** page importers. P1's seed tests go green while rendered data never changes; each later phase silently absorbs a data-rewire. | Critical | **RESOLVED → D5** (user 260704 chose "edit live layer in place"). Verified: also a **4th** layer `dashboard-mock.ts`. See §"Data-Layer Reconciliation (D5)". | P1 (+ P3/P5/P6) |
| 2 | **KhuVuc/PhuongXa dual type + barrel collision:** live `masterdata-types.ts` `KhuVuc{maKhuVuc,tenKhuVuc}` (used by C8/C9/phi-giao/khach-hang) vs seed `reference-data.ts` `KhuVuc{id,ten,tinh}`. P1 deletes only the seed copy; `seed/index.ts:10 export *` + new `KHU_VUC` (Tuyến) = duplicate barrel export → build break. | Critical | Accept | P1, P6 |
| 3 | "17 status consumers" miscount — 15 real importers; `useDashboard.ts` + `sua-chua-report-mock.ts` don't import it (substring false match). | High | Accept | P1 |
| 4 | HinhThuc cross-phase ownership race — P3 ships the 3-value filter but doesn't migrate the type/seed; P4 "owns if P3 hasn't" = both-or-neither ambiguity. Third `HINH_THUC` in `reference-data.ts` unmentioned. | High | Accept | P3, P4 |
| 5 | Saved-view restore bypasses the defensive status parse — `pt-filter-state` restores `tinhTrang` slugs outside `fromParams` → post-swap view returns 0 rows silently. | High | Accept | P1 |
| 6 | `resetDemo()` inverted durability — wipes in-session writes rather than restoring; any reload destroys created vouchers/tickets. P5/P6 generalize creation across 6 editors without the caveat. | High | Accept (document) | P2, P5, P6 |
| 7 | Print-window HTML injection — `title`/data string-concatenated into `document.write` doc; mock free-text (customer name/Ghi chú) can inject. | High | Accept | P2 |
| 8 | xlsx formula injection — no neutralizing of leading `= + - @` in exported cells. | High | Accept | P2 |
| 9 | New-tab URL injection + tabnabbing — `window.open('…?q='+addr)` without `noopener`/`encodeURIComponent`; `Định vị` opens unvalidated GPS URL (`javascript:` risk). | High | Accept | P2, P3 |
| 10 | P5 inventory Kỳ math ("Tồn đầu/trong/cuối kỳ from seed transactions per Kỳ") needs a seeded inventory-transaction ledger that exists in neither layer today. | High | Accept | P1 or P5 |
| 11 | Over-abstraction: `InventoryView` host + `LineItemEditor` template duplicate the existing `CrudTablePage` config-spread pattern (W2/W3/W4 already spread `tonKhoConfig`); template admits a bespoke outlier (Trả Hàng). | High | Accept (simplify) | P5 |
| 12 | Payroll derivation built on an admittedly-unspecified formula (Unresolved #1) — speculative engine for mock data. | High | Accept (seed static, defer) | P6 |
| 13 | New seed modules "unique seed numbers" unspecified; `SeededRandom(2001/2002/2003)` already duplicated → correlated RNG streams / id collision risk. | Medium | Accept | P1 |
| 14 | KT status membership vs display-order conflated — P1 locks `[2,4,6,7,8,9,13,15,16,17]`; P4 enumerates `[2,4,15,6,7,13,17,16,8,9]` but claims deep-equal against P1 → test fails. (Introduced when controller renamed the symbol during consistency sweep.) | Medium | Accept | P1, P3, P4 |
| 15 | Dashboard overdue logic orphaned — `dashboard-mock.ts` derives `overdueCount` via `status === 'qua_han'`; P1 deletes that status without respecifying overdue derivation. | Medium | Accept | P1 |

Cheap doc fixes folded in on apply: stale "Phase 8" refs in `status.ts`/`seed/index.ts`, nav-config acceptance wording (header-widget pages), `conLai` off-by-one (inclusive RNG vs exclusive spec).

**Rejected/softened respecting user decisions (review-audit rule — don't reverse a user's explicit scope call on an abstract concern):** 202-checkbox matrix and full-TDD were flagged as YAGNI, but D3 (reference-is-spec) + `--tdd` + open-decision-#3 are explicit user choices; softened to "render generically + test structure not exact count" / "scale TDD rigor to risk (full on P1 status swap, light on config-wrapper leaves)" rather than cut.

**Verdict:** Plan is spec-accurate and TDD-disciplined, but Finding 1 is a genuine structural error that must be resolved before P1 starts — it changes what P1 does. Findings 2, 14 are concrete build/test breakers. 7–9 are cheap security hardening best baked into the P2 primitives now.

### Resolution pass — 2026-07-04 (post-decision reconciliation)

Finding 1 resolved by user decision **D5** ("edit live layer in place"). All plan files reconciled to D5 in this pass; the §"Data-Layer Reconciliation (D5)" section above is authoritative. Fold sites for the remaining findings:

- **F1** → D5 section + P1 (edit `MOCK_TICKETS` + `dashboard-mock.ts`, delete dead SEED arrays). Empirically re-verified 260704.
- **F2** → D5 "Naming": new route entity is `TUYEN`/`Tuyen`, not a third `KhuVuc`; catalog Khu vực reconciled in P6 (~15-file blast radius, red-team H3).
- **F3** → P1 (15 real `status.ts` consumers, not 17). *Corrected in red-team session #2: `dashboard-mock.ts` IS one of the 15 (imports status.ts); `sua-chua-report-mock.ts` also imports it. The Modify list must contain the actual 15 importers.*
- **F4** → D5 "HinhThuc": P3 owns the warranty-taxonomy migration; P4 consumes.
- **F5** → P1 (saved-view restore routes through the defensive numeric-id parse; unknown → `OPEN_STATUS_IDS`).
- **F6-F9** → P2 primitives (security requirements + tests baked in). D5 "Security helpers" (hardened per red-team M3 + C3).
- **F10** → P5 (Kỳ-indexed opening/closing derivation, added to the inventory layer P5 edits — simplified per red-team to a deterministic carry-forward, not a materialized ledger).
- **F11** → P5 (use existing `CrudTablePage` config-spread + page-level KPI/filters, not a new `InventoryView` host/`LineItemEditor` template — see red-team H5 for the page-level composition detail).
- **F12** → P6 (seed static `BangLuong` rows; defer the unspecified payroll formula, show components + documented simple sum).
- **F13** → P1 (each new lookup gets a unique `SeededRandom` seed). *Corrected in red-team session #2: 3001-3008 is already taken by `inventory-mock.ts` — use **4001-4008**.*
- **F14** → D5 "KT board": set (membership) vs display-order are distinct constants; never deep-equal.
- **F15** → D5 "Overdue is a seeded field": bake `isOverdue` in at generation, not `qua_han` equality and not a wall-clock compare (red-team H1 + user decision).

### Red Team session #2 — 2026-07-04 (adversarial review of the D5 reconciliation)

**Reviewers:** 4 (Security Adversary/Fact-Checker, Failure-Mode/Flow-Tracer, Assumption-Destroyer/Scope-Auditor, Scope-Critic/Contract-Verifier). **12 findings after dedup (3 Critical, 5 High, 4 Medium), all accepted — every claim controller-verified against source.** This pass caught real errors, including three the reconciliation itself introduced.

| # | Finding | Sev | Disposition | Applied to |
|---|---|---|---|---|
| C1 | Reconciliation wrongly claimed `dashboard-mock.ts` has its own snake vocab & doesn't import `status.ts`. It imports `REPAIR_STATUSES`/`STATUS_BUCKET`/`RepairStatus` (`dashboard-mock.ts:10-17`); `qua_han` is in shared `status.ts:30`. Dashboard is an ordinary status.ts consumer (one of 15). | Critical | Accept | D5 map, P1 |
| C2 | Finding-13 seed fix assigned lookups `3001-3008` — already used by `inventory-mock.ts:55-378`. Reintroduces the collision. Use **4001-4008** (verified free). | Critical | Accept | P1 |
| C3 | F8 grep-guard misses the live CSV exporter `mockCsvDownload` (`export-excel-menu.tsx:36`, Blob+`createObjectURL`+`a.click()`+concat CSV) — exactly the injection surface. Route it through hardened `export-xlsx`; widen P7 audit greps. | Critical | Accept | P2, P7, D5 |
| H1 | SLA-overdue rule has no stable clock (fixed REF lived only in deleted seeds; live layers use `new Date()`). → **seeded `isOverdue` field** (user decision). | High | Accept | D5, P1, P6 |
| H2 | D5 map missed live layers `mock/reports/*` + `finance-kpi-mock.ts`. | High | Accept | D5 map, P7 |
| H3 | KhuVuc re-model blast radius ~15 files (incl. `CrudTablePage.tsx:45` allowlist, `khuVucId` FKs), not "4". | High | Accept | D5, P6 |
| H4 | P1 Công-nợ spec gates on non-existent `chiPhi`/`ktvId`; real fields are `chiPhiThucTe`/`chiPhiDuKien` + `kyThuatId`/`kyThuat`. | High | Accept | P1 |
| H5 | Finding-11 half-done: KPI strip + StockFilterBar render *outside* `CrudTablePage` (`XemTonKhoPage.tsx:52-58`); `CrudConfig` has no KPI slot, `FilterConfig.type` only text/select/date-range (`crud-types.ts:46`). Use page-level composition (precedent `BangLuongPage.tsx:1`), not a new host and not a CrudTablePage-header hack. | High | Accept | P5 |
| M1 | `finance-mock.ts:100` overdue uses wall clock — folded into H1's seeded-field fix. | Medium | Accept | P6 |
| M2 | F2 barrel-collision rationale imprecise (masterdata `KhuVuc` isn't in the seed barrel). `TUYEN` rename still correct; rationale fixed. | Medium | Accept | D5 |
| M3 | F9 scheme allowlist under-specified (protocol-relative/case/whitespace); F8 would corrupt legit numeric negatives. Both contracts tightened. | Medium | Accept | P2 |
| M4 | Finding-code label-leakage risk into code artifacts (comments/test names) — violates Stable Code Artifacts rule. Plan describes behavior; code must not carry `F8`/`C1`-style labels. | Medium | Accept (plan-writing note) | all phases |

**Not reversed (review-audit rule):** Finding-12 static payroll *confirmed sound* by the Scope Critic; F7-F9 *defended* as proportionate (not cut); Finding-10 ledger *simplified* to a deterministic carry-forward within D5 (capability kept). User D1-D5/`--tdd`/open-decisions untouched.

**Verdict:** the D5 direction holds, but C1/C2/C3 are load-bearing corrections that change what P1/P2 do — all applied. **M4 reminder for the cook phase: keep finding codes (`C1`, `F8`, etc.) in the plan only — never in code comments, test names, or commit messages; describe the behavior/invariant directly.**

### Whole-Plan Consistency Sweep (after session #2 edits)
- Files reread: plan.md, phase-01…07.
- Decision deltas checked: 12 (C1 dashboard-mock-is-consumer, C2 seed 4001-4009, C3 CSV exporter, H1 seeded isOverdue, H2 +2 layers, H3 KhuVuc ~15 files, H4 chiPhiThucTe/kyThuatId, H5 page-level KPI, M1 no-clock finance overdue, M2 rationale, M3 F8/F9 edge, M4 label hygiene).
- Reconciled stale references: 1 (phase-01 "Công nợ lookup derivation" `chiPhi`→`chiPhiThucTe`); all seed-number/SLA/vocab/inventory-view claims verified consistent across files.
- Unresolved contradictions: **0** — plan is ready for implementation.

## Validation Log

### Session — 2026-07-04 (critical-questions interview)

Verification pass skipped per validate-workflow guard: `## Red Team Review` already carries two sessions of `file:line` evidence + a controller Full-tier re-verification. Interview focused on genuine cross-phase decisions.

**Decisions (authoritative — override the affected phase defaults):**

- **V1 — 3rd branch lands in P6.** `BranchId` stays 2 (`dak-lak`, `dak-nong`) through P1-P5; **P6 extends it to 3** (add `Cộng tác viên tuyến huyện`) and updates all branch-typed files (weights, filters, KPI, seed) at that point. (Resolves phase-01 Unresolved #2.)
- **V2 — product domain stays phones; appliances only where the reference requires.** Live product/model/warehouse data remains phones; only the Phí giao `SAN_PHAM` lookup uses appliance types (reference-mandated). Mixed domain accepted + documented; **no mass reseed** of models/warehouse/serials. (Resolves phase-01 Unresolved #6.)
- **V3 — `OPEN_STATUS_IDS` verified in P3.** P1 keeps the transitional default (all except 10, 12); **P3 pins the exact set against the live Index_8 default-filter** (one array literal). (phase-01 Unresolved #1 — confirmed the existing approach.)
- **V4 — legacy UI typos are corrected, not reproduced.** Render `Mở` (not `Mỡ`) on /User/Detail lock, `Sản phẩm` (not `Sản phầm`) on the repair filter placeholder, and any similar verbatim typo. D3 = data/column/taxonomy fidelity, NOT bug-for-bug UI-string parity. Overrides phase-02 Unresolved #7 + phase-03 Unresolved (Sản phầm) + phase-04 Unresolved #7.
- **V5 — invented reports kept as local extras.** `Doanh Thu` + `Xuất Kho` are **retained** alongside the reference 6, marked local additions. **This overrides plan open-decision #2 and phase-07 Unresolved #4** (which defaulted to retiring them). Report nav = reference 6 + 2 local.
- **V6 — repair-create `Lưu` navigates to detail.** Confirmed the SPA-native flow (not legacy stay-as-edit-form). Accepted deviation, documented. (phase-04 Unresolved #5 — confirmed.)
- **V7 — ~30 reference-evidence gaps keep their documented defaults, verified at each phase's kickoff.** Unmirrored column sets / inferred modal shapes stay as plausible defaults in the phase files; the owning phase re-mirrors the legacy app at start and corrects if the reference differs. Confirmed the existing per-phase approach — no new reference data exists to decide them earlier. (Covers the remaining phase-02/04/05/06/07 Unresolved items.)

### Whole-Plan Consistency Sweep (after validation propagation)
- Files reread: plan.md, phase-01…07.
- Decision deltas: 7 (V1 branch→P6, V2 phones-domain, V3 open-in-P3, V4 fix-typos, V5 keep-local-reports, V6 save-nav, V7 gaps-deferred).
- Propagated: V1→phase-01 (Unresolved #2) + phase-06 (branch-extend step); V2→phase-01 (Unresolved #6); V4→phase-02/03/04 (typos corrected, `Sản phầm`→`Sản phẩm`, `Mỡ`→`Mở`); V5→phase-07 (R7 + Modify/Delete + criteria) + plan open-decision #2 marked overridden. V3/V6/V7 confirm existing phase defaults (no text change).
- **Reconciled contradiction the sweep caught:** V1 (3rd branch deferred to P6) conflicted with phase-03 `RepairFiltersAdvanced` + phase-04 `TicketInfoSection` which hardcoded `Cộng tác viên tuyến huyện` as a Chi nhánh option. Fixed both to render branch options from `BRANCHES` (2 through P3/P4, 3 after P6) rather than a hardcoded 3-item list — avoids a type error against the 2-value `BranchId`.
- Unresolved contradictions: **0** — plan is ready for implementation.

## Dependencies

<!-- Cross-plan dependencies -->
None — only plan in repo.
