# Red-Team Review — Security Adversary + Fact Checker

**Plan:** `plans/260703-1908-reference-ui-parity-tdd/` (D5-reconciled)
**Lens:** Security Adversary / Fact Checker
**Date:** 2026-07-04
**Verdict:** DONE_WITH_CONCERNS — 2 Critical, 3 High, 2 Medium. The security helpers (F7/F8/F9) are the right idea but their *enforcement mechanism* (a 3-string grep guard) has a hole that a live in-repo export path already falls through, and one D5 factual premise about the dashboard status layer is provably wrong.

---

## Finding 1: The grep-guard that "forces" all exports through F8 is bypassed by an existing live CSV export path

- **Severity:** Critical
- **Location:** plan.md §"Acceptance criteria" (line 116) + Phase 2 Risk "Security primitives consumed, not enforced" (line 187) + Phase 7 X1 (line 51) / Success Criteria (line 117)
- **Flaw:** The plan's *only* enforcement that "F7/F8/F9 are the only print/export/external-open paths" is a grep for three literals: `document.write`, `XLSX.writeFile`, `window.open(`. An export can be hand-rolled — and one already is in the repo — using `URL.createObjectURL` + `document.createElement('a')` + `a.click()`, which matches none of those three strings. So the guard reports "clean" while an unneutralized, string-concatenated export ships. F8 (formula/CSV injection neutralization) is therefore unenforced against exactly the pattern it exists to stop.
- **Failure scenario:** A P3-P7 "Xuất Excel" handler (or the existing reports one) emits a cell `=HYPERLINK("http://evil","click")` or `@SUM(...)` from mock free-text (customer name, Ghi chú). No `'` prefix is added because the code never routed through `export-xlsx.ts`. The plan's whole-plan grep sweep passes (no `XLSX.writeFile`/`document.write`/`window.open(`), the phase is marked complete, and the injection surface is live. The existing `mockCsvDownload` does exactly this **today**: `` const csv = `"${title}"\n...` `` with no neutralization.
- **Evidence:**
  - `src/components/reports/export-excel-menu.tsx:36-54` — `mockCsvDownload` builds CSV by string concat (`"${title}"`), downloads via `a.click()` (line 49) + `createObjectURL` (line 44). No `= + - @` neutralization.
  - Consumers proving it is live: `src/mock/reports/report-configs.ts:49`, `src/pages/reports/kpi/KpiReportFilterForm.tsx:135,139,146`.
  - Guard-bypass proof: `grep -rn "document.write|XLSX.writeFile|window.open(" src/` → **0 hits**; `grep -rn "\.click()" src/` → `export-excel-menu.tsx:49`. The export escapes all three guard strings.
- **Suggested fix:** Broaden the guard grep to include the anchor-download idiom (`\.click()`, `createObjectURL`, `\.download\s*=`) and `Blob(`. Better: make the neutralization live in a single choke-point that ALL export code must import (lint rule / ESLint `no-restricted-imports` forbidding `createElement('a')` for download outside `export-xlsx.ts`). And rewire `mockCsvDownload` in Phase 2, not defer to Phase 7 X1 — it is live from day one.

---

## Finding 2: D5 falsely claims `dashboard-mock.ts` has its own status vocabulary independent of `status.ts`

- **Severity:** Critical
- **Location:** plan.md §"Data-Layer Reconciliation (D5)" table (line 75): "`own snake RepairStatus + STATUS_BUCKET (doesn't import status.ts)`"; Resolution pass F3 (line 163) "dashboard-mock.ts … migrated as their own layer, not via status.ts import"; F15 (line 149, 172).
- **Flaw:** The load-bearing D5 premise — that dashboard is a *separate* layer P1 can migrate independently — is factually false. `dashboard-mock.ts` **imports** `REPAIR_STATUSES, STATUS_BUCKET, STATUS_LABEL, BUCKET_HEX, bucketOf, RepairStatus` directly from `@/domains/repair/status`. Dashboard and repair share ONE status module. This is the opposite of what the plan asserts and drove the F3/F15 dispositions.
- **Failure scenario:** P1 "migrates dashboard-mock to legacy 15 as its own layer" per D5 — but there is no own layer to migrate; touching `status.ts` mutates repair + dashboard atomically. Deleting `qua_han` (F15) does not just orphan a dashboard derivation — it fails to type-check across `status.ts`, the live repair `mock-data.ts`, the rendered dashboard tile, and dashboard types simultaneously. F15's fold site names only `dashboard-mock.ts`, so the plan under-scopes the deletion and P1's "migrate dashboard independently" step is built on a non-existent boundary.
- **Evidence:**
  - `src/mock/dashboard-mock.ts:10-17` — `import { REPAIR_STATUSES, STATUS_BUCKET, STATUS_LABEL, BUCKET_HEX, bucketOf, type RepairStatus } from '@/domains/repair/status'`.
  - `src/domains/repair/status.ts:30` defines `'qua_han'` inside the shared `REPAIR_STATUSES`; `:33` `RepairStatus`, `:67` `STATUS_BUCKET`.
  - `grep -rl "from '@/domains/repair/status'" src/` → **15 files** including `dashboard-mock.ts` (confirms F3's count of 15, and that dashboard is one of them, not separate).
- **Suggested fix:** Correct the D5 table row — dashboard-mock consumes `status.ts`, it is not a fourth independent status layer. Re-scope F15/`qua_han` deletion as a single cross-cutting change to `status.ts` and its 15 importers, and enumerate the real fold sites (see Finding 3).

---

## Finding 3: `qua_han` deletion (F15) under-scopes its blast radius — misses a rendered dashboard tile and the live repair layer

- **Severity:** High
- **Location:** plan.md F15 (line 149) + Resolution F15 (line 172): "`dashboard-mock.ts` derives overdueCount via `status === 'qua_han'`; P1 deletes that status without respecifying overdue derivation." Fold site names only `dashboard-mock.ts`.
- **Flaw:** `qua_han` is referenced in 6 files, including a **rendered UI tile** and the **live repair generator** the plan otherwise treats as canonical — neither is in F15's fold site. Deleting the status without touching these breaks the build and silently drops a user-visible dashboard tile.
- **Failure scenario:** P1 removes `'qua_han'` from `REPAIR_STATUSES`. `WorkQueueTiles.tsx` still declares a tile `{ status: 'qua_han', label: 'Quá hạn' }` → type error or a dead red tile that never lights. `mock-data.ts:175` still weights `qua_han: 3` in the LIVE repair generator → type error. F15 only respecified the dashboard `overdueCount`, so these two sites are missed.
- **Evidence:**
  - `src/components/dashboard/WorkQueueTiles.tsx:39-40` — `status: 'qua_han', label: 'Quá hạn'` (a rendered KPI tile).
  - `src/domains/repair/mock-data.ts:175` — `qua_han: 3` (weight in the live `MOCK_TICKETS` generator).
  - `src/types/dashboard-types.ts:25-26` — `/** Tickets in qua_han status */ overdueCount`.
  - `grep -rln qua_han src/` → 6 files: `status.ts, WorkQueueTiles.tsx, dashboard-mock.ts, mock-data.ts, repair-tickets.ts, dashboard-types.ts`.
- **Suggested fix:** Expand F15's fold site to enumerate all 6 (minus the dead `repair-tickets.ts` being deleted). Decide the `WorkQueueTiles` "Quá hạn" tile's fate: re-derive it from the same SLA rule, or drop the tile — the plan currently does neither.

---

## Finding 4: F9 `openExternal` scheme-allowlist contract is under-specified and its tests miss the standard bypass vectors

- **Severity:** High
- **Location:** Phase 2 R14 F9 (line 45), Architecture (line 60), TDD Plan §2.2 (line 118), Success Criteria (line 166).
- **Flaw:** The plan designates `openExternal` as the *sole* external-open security boundary but specifies only "parses the URL, no-ops unless scheme ∈ {http:,https:}" and tests only `javascript:alert(1)` and `data:`. A naive `new URL(url).protocol` check has well-known escapes the contract neither forbids nor tests: uppercase `HTTPS:`/`JavaScript:` (protocol is lowercased by `URL` — OK — but a hand-rolled regex/`startsWith` check is not), leading/embedded whitespace or `\n`/`\t`/`\x00` in the scheme (`java\nscript:`), and **protocol-relative** `//evil.com` (which `new URL(url, base)` resolves to the page's own scheme → passes an http(s) check yet navigates off-origin). The contract says "the final URL scheme" but never pins the parser (WHATWG `URL` vs string check) or the protocol-relative case.
- **Failure scenario:** A later phase passes a mock-derived or config URL like `//evil.com/x` or ` javascript:alert(1)` (leading space) into `openExternal`. If the implementer used `url.startsWith('http')` or `new URL(url, location.href)` per the loose spec, the malicious/off-origin target opens. The test suite (only `javascript:alert(1)` exact + `data:`) is green, so nobody notices. The plan's "this is the only external-open path" guarantee is only as strong as this one under-specified function.
- **Evidence:**
  - Phase 2 line 118 `open-external.test.ts` cases: `javascript:alert(1)` and `data:…` rejection only — no uppercase, whitespace/newline, null-byte, or protocol-relative case.
  - Phase 2 line 60 contract: "`openExternal` parses the URL, throws/no-ops unless scheme ∈ {http:,https:}" — parser unspecified; no mention of protocol-relative or whitespace normalization.
  - `grep -rin "window.open|http|maps" src/ | grep -v node_modules` → no existing external-open code, so the entire contract is greenfield and rests solely on this spec (nothing to fall back on).
- **Suggested fix:** Pin the implementation to WHATWG `new URL(url)` **without a base** (so protocol-relative and relative URLs throw), reject on parse failure, and check `u.protocol === 'http:' || u.protocol === 'https:'`. Add test cases: `HTTPS://ok` (accept, normalized), `//evil.com` (reject), `  javascript:alert(1)` (reject), `java\tscript:alert(1)` (reject), `http:\x00//x` (reject). State these in the F9 success criteria.

---

## Finding 5: F8 neutralization spec is ambiguous about numeric-looking `+`/`-` and only partially covers whitespace/control-char prefixes

- **Severity:** High
- **Location:** Phase 2 R14 F8 (line 44), Architecture `neutralizeCell` (line 58), TDD Plan §2.1 (line 117).
- **Flaw:** The spec says "first char ∈ `= + - @` (also after leading whitespace, and the tab/CR variants)" and the test asserts `'+1'` and `'-1'` get prefixed. But `+1`/`-1`/`-0.5` are legitimate numeric cell values (phone-adjacent, deltas, coordinates like `-12.34` a Toạ độ latitude for the branch map). Blindly prefixing every `+`/`-`-leading string with `'` corrupts real negative numbers into text, breaking downstream sums and the very coordinate strings F9/branch-map rely on. The spec neither carves out numeric values nor defines "leading whitespace" precisely (space only, or also `\t\r\n\f`, and what about a leading `\x00`?). "tab/CR variants" is hand-wavy about *which* control chars and whether they are stripped or trigger neutralization.
- **Failure scenario:** A Toạ độ cell `-12.345678, 105.83` or a finance delta `-1500000` is exported; `neutralizeCell` prefixes `'`, so Excel shows `'-12.34…` as text. Users' pivot/sum formulas silently drop these rows. Alternatively, an attacker uses ` \t=cmd` (tab then `=`) — if "tab variant" was implemented as "strip tab then check," fine; if implemented as "first char is tab, not in set, pass through," the payload survives. The spec is too loose to know which.
- **Evidence:**
  - Phase 2 line 117 test: asserts `'+1'`, `'-1'`, `'@x'`, `'\t=x'` all get `'` prefix — i.e., the plan *intends* to neutralize `+1`/`-1`, which will corrupt legitimate negatives.
  - `src/mock/seed/branches.ts` (whole file) has **no** `toaDo` field today; Phase 2 Unresolved #6 (line 198) + Phase 7 A1 add coordinate strings like `21.029743, 105.833882` and negatives — future cells `neutralizeCell` will see.
- **Suggested fix:** Neutralize only when the trimmed value starts with `= @` OR starts with `+`/`-` **and is not a valid number** (`Number.isNaN(Number(v))` gate). Explicitly enumerate the whitespace/control set to trim before the check (`\t \r \n \f  `) and add a test for a real negative (`-12.34` must pass through untouched) and a `\t`-then-`=` payload.

---

## Finding 6: F2 "second KhuVuc" barrel collision is real, but the plan misidentifies which KhuVuc is live — the reconciliation could delete the wrong symbol's consumers

- **Severity:** Medium
- **Location:** plan.md §D5 "Naming (Finding 2)" (line 82), Finding 2 disposition (line 136): "live `masterdata-types.ts` `KhuVuc{maKhuVuc,tenKhuVuc}` … P1 deletes only the seed copy."
- **Flaw:** There are **three** KhuVuc-family symbols, and the "seed copy" the plan says P1 deletes (`reference-data.ts` `KhuVuc{id,ten,tinh}` + `KHU_VUC`) is only consumed by `customers.ts` — itself a dead seed being deleted. So deleting it is safe, but the plan's framing ("delete only the seed copy") implies `reference-data.ts` survives. It also does not state that `reference-data.ts`'s `KHU_VUC` becomes fully dead once `customers.ts` is deleted, nor that the *live* catalog KhuVuc is a **different** file (`masterdata/khu-vuc.mock.ts` → `KHU_VUC_ROWS`, backed by `masterdata-types.ts`), not the barrel one. The barrel-collision fix (name new entity `TUYEN`) is correct, but the surrounding inventory is muddled enough to risk deleting/keeping the wrong file.
- **Failure scenario:** An implementer reads "P1 deletes only the seed copy" and deletes `customers.ts` but keeps `reference-data.ts`'s now-orphaned `KHU_VUC`/`KhuVuc{id,ten,tinh}` (dead code that still `export *`s through the barrel), or conversely touches `khu-vuc.mock.ts`'s `KHU_VUC_ROWS` (the live one wired to 4 catalog configs) thinking it is the collision source. Either way the "no second KhuVuc symbol" acceptance grep (plan.md line 115) is satisfied while dead or wrong code lingers.
- **Evidence:**
  - `src/types/masterdata-types.ts:69-71` — live `KhuVuc{maKhuVuc,tenKhuVuc}` (NOT re-exported through the seed barrel).
  - `src/mock/seed/reference-data.ts:17` `interface KhuVuc{...}`, `:338` `export const KHU_VUC` — flows through `seed/index.ts:` `export *`.
  - Only consumer of reference-data `KHU_VUC`: `src/mock/seed/customers.ts:6` (the dead seed). Grep `KHU_VUC` outside reference-data → all hits are the *live* `KHU_VUC_ROWS` in `masterdata/*` configs (`khach-hang/phi-giao/phuong-xa.config.ts`), a different symbol.
- **Suggested fix:** In D5 "Naming," state precisely: (a) live catalog KhuVuc = `masterdata-types.ts` + `khu-vuc.mock.ts` `KHU_VUC_ROWS` (keep); (b) `reference-data.ts` `KhuVuc`/`KHU_VUC` are dead once `customers.ts` is deleted — remove them too, not just `customers.ts`; (c) new route entity = `TUYEN`. Add both dead symbols to the P1 delete list.

---

## Finding 7: F7 print hardening covers `document.title` but the spec leaves the print *body* / PrintLayout company-header path unproven for untrusted mock free-text

- **Severity:** Medium
- **Location:** Phase 2 R14 F7 (line 43), Architecture (line 59), TDD §2 print test (line 119): the F7 test only proves the *title* string cannot inject.
- **Flaw:** F7's stated defense is "title set via `textContent`/`doc.title`" and the *body* is "safe because `renderToStaticMarkup` escapes React." That is true **only if** every untrusted field reaches the body as React children/text, never via `dangerouslySetInnerHTML` or an attribute sink (`href`, `style`, `src`). The plan's P3 prints (`bien-nhan`, `phieu-sc`, etc.) render customer name, address, Ghi chú, Hư hỏng — free-text — and the PrintLayout has a "company header" + signature slots. Nothing in the F7 contract forbids a per-doc layout from putting a mock URL into an `href` or using `dangerouslySetInnerHTML` for rich Ghi chú, and the single F7 test asserts only the *title*. `renderToStaticMarkup` does NOT sanitize `href="javascript:..."` or `dangerouslySetInnerHTML`.
- **Failure scenario:** A P3 print layout renders `<a href={customer.website}>` or `<div dangerouslySetInnerHTML={{__html: ghiChu}}>` for formatting. `renderToStaticMarkup` emits it verbatim into the printed doc; on print-preview a `javascript:`/`onerror` payload from mock free-text executes in the print window. The F7 test (title-only) is green.
- **Evidence:**
  - Phase 2 line 119 F7 test: asserts only `openPrintWindow('<img src=x onerror=...>', ...)` — an untrusted **title** — is inert. No assertion about body attribute sinks.
  - `grep -rn dangerouslySetInnerHTML src/` → **0 today** (good baseline), but nothing in the F7 contract or lint config prevents a P3 print layout from introducing one; the plan authors 5 new print docs in `src/features/repair-list/prints/` (Phase 3 line 72) full of free-text fields.
- **Suggested fix:** Add to F7's contract: (a) print layouts MUST NOT use `dangerouslySetInnerHTML`; (b) any URL rendered in a print doc goes through the F9 scheme check; enforce via an ESLint `react/no-danger` rule scoped to `prints/**`. Add a body-level F7 test: a customer-name field containing `<img onerror>` renders as escaped text, and a Ghi chú with a `javascript:` link is not clickable.

---

## Fact-Check Ledger

| Plan claim | Result | Evidence |
|---|---|---|
| `SEED_REPAIR_TICKETS`/`SEED_CUSTOMERS`/`SEED_FINANCIALS` have zero page importers | **VERIFIED** | `repair-tickets.ts:103`, `customers.ts:121`, `financials.ts:49` are the only refs; no importers |
| `seed/branches.ts` `BRANCHES`/`BRANCH_NAME` widely imported (keep) | **VERIFIED** | ~28 importers of `@/mock/seed/branches` |
| Shared types `BaseEntity`/`ListParams`/`PagedResult` in `seed/index.ts` kept | **VERIFIED** | `seed/index.ts` defines them; consumed by `use-crud.ts:14`, `masterdata-types.ts:5`, `crud-types.ts:7`, `finance-mock.ts:13`, `masterdata/index.ts:7` |
| dashboard-mock.ts has own status vocab, doesn't import status.ts | **FAILED** | `dashboard-mock.ts:10-17` imports `STATUS_BUCKET`/`RepairStatus` from `@/domains/repair/status` (Finding 2) |
| "15 real status.ts consumers" (F3) | **VERIFIED** | `grep -l "from '@/domains/repair/status'"` → 15 files |
| Existing raw `window.open` / `document.write` / `XLSX.writeFile` to route through helpers | **FAILED (none exist)** | 0 hits for all three; the real live export is `a.click()` CSV in `export-excel-menu.tsx:49` (Finding 1) |
| `export-excel-menu.tsx` exists (Phase 7 X1 target) | **VERIFIED** | `src/components/reports/export-excel-menu.tsx:36` `mockCsvDownload` |
| Live `KhuVuc` in `masterdata-types.ts` `{maKhuVuc,tenKhuVuc}` | **VERIFIED** | `masterdata-types.ts:69-71` |
| Second `KhuVuc` in `reference-data.ts` collides via barrel | **VERIFIED (but 3-way, mislabeled)** | `reference-data.ts:17,338`; only `customers.ts:6` consumes it (Finding 6) |
| Third `HINH_THUC` in `reference-data.ts` (F4) | **VERIFIED** | `reference-data.ts:537` `HINH_THUC` + `:543` `HinhThuc` type + repair-domain copy in `mock-data.ts` |
| `date-fns` available for `formatDateTime` (P3) | **VERIFIED** | `package.json:41` `date-fns ^3.6.0` |
| Recharts present for P7 charts | **VERIFIED** | `package.json:49` `recharts ^2.15.4` |
| `qua_han` deletion scoped to dashboard-mock (F15) | **FAILED (under-scoped)** | also `WorkQueueTiles.tsx:39-40`, `mock-data.ts:175`, `dashboard-types.ts:25` (Finding 3) |
| `xlsx` not yet installed (P2 adds it) | **VERIFIED** | not in `package.json` |
| No existing external-open/geo/map code | **VERIFIED** | 0 hits for `window.open`/geo/maps in `src/` (F9 is greenfield — Finding 4) |
| No existing `dangerouslySetInnerHTML` | **VERIFIED** | 0 hits (Finding 7 is preventive) |

---

Status: DONE_WITH_CONCERNS
Summary: Two Critical issues — the export "enforcement" grep guard is bypassed by a live in-repo `a.click()` CSV export path with zero formula-neutralization (Finding 1), and the D5 claim that `dashboard-mock.ts` owns an independent status vocabulary is provably false since it imports `status.ts` (Finding 2). Three High findings tighten the F8/F9 helper contracts (numeric `-`/`+` corruption; protocol-relative/whitespace scheme bypass) and correct the `qua_han` deletion blast radius. All findings carry file:line evidence.
Concerns: The security helpers are sound in intent but their guarantee rests entirely on (a) a 3-string grep that misses anchor-download and (b) under-specified helper contracts. Fix the guard mechanism and pin the F8/F9 contracts before P2 starts, and correct the D5 dashboard-layer premise before P1 starts (it changes what P1 does).
