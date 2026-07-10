---
phase: 2
title: "Gap-closure comparison matrix"
status: completed
priority: P1
dependencies: []
---

# Phase 2: Gap-closure comparison matrix

> **Decoupled from Phase 1 (red-team H2).** This is pure synthesis of the existing
> corpus — needs zero live access. Write it independently; security/old-site rows
> default to `likely/unconfirmed` and Phase 1 upgrades them later. Do NOT wait on
> Phase 1. Consume Phase 1's discrepancy list only if it has already run.

## Overview

Write `docs/legacy-vs-rebuild-comparison.md` (main, rollups) +
`docs/legacy-vs-rebuild-appendix.md` (the 12 detailed per-section tables — split
planned UP FRONT). Synthesize the gap matrix + 12 section specs + 7 phase notes
into per-section gap-closure (old gap → rebuild status → honesty flag), plus
deliberate-deviations + known-limitations, fronted by a VI exec summary.

## Requirements

- Functional: **VI exec summary** + methodology + dual evidence sources + per-section
  gap-closure (rollups in main, detail tables in appendix) for all 12 sections +
  deliberate deviations + known limitations. Every row cites its source + confidence.
- Non-functional: main doc AND appendix each ≤ 800 lines (**unconditional split**);
  concise; 3-column honesty frame throughout.
- Language: **English body/tables** (matches source corpus); **the exec summary in
  Vietnamese** (exec-facing). VI status/confidence strings from `vi-term-glossary.md`.
- **Confidence tags on ALL rows (red-team M1)**: any gap whose section-file marks
  the old-site spec "inferred / not captured / unverified" inherits `likely`, not asserted.
- DRY: cite the section-file specs, do not re-transcribe them.

## Architecture

- Source of truth for "old gap": `brainstorm-260703-reference-ui-parity-gap-matrix.md`
  (per-section high/med/low counts) + the 12 `section-*.md` files.
- Source of truth for "rebuild status": the 7 `phase-0X-*.md` completion notes in
  `plans/260703-1908-reference-ui-parity-tdd/` (each has a "Completed" note listing
  what shipped) + the per-phase code-review findings surfaced in-session.
- Status vocabulary per gap: **Closed (verified in mock/in-memory only)** /
  **Deliberate deviation** / **Deferred (with reason)**. The mock qualifier on
  "Closed" is mandatory (red-team M2) — no fourth bucket, forces honesty.
- Exec metrics are framed "the rebuild HAS these features + tests", NOT "verified
  parity" (red-team L2): 12 missing pages built, ~88 high-sev gaps addressed (in
  mock), 15-status vocab, 3 branches, F7/F8/F9, 440 tests. Numbers verified against
  the final gate before publish.

## Related Code Files

- Create: `docs/legacy-vs-rebuild-comparison.md` (main — rollups + VI exec + deviations + limitations)
- Create: `docs/legacy-vs-rebuild-appendix.md` (the 12 detailed per-section tables — UNCONDITIONAL)
- Create: `docs/assets/vi-term-glossary.md` (canonical VI status/confidence/honesty strings — first)
- Reference (read-only): `plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md`,
  `plans/reports/ref-ui-parity-sections/*.md`, the 7 phase files, `README.md`, `ARCHITECTURE.md`,
  `docs/assets/legacy-audit-evidence.md` + its discrepancy list (if Phase 1 has run).

## Implementation Steps

0. **VI glossary first** — write `docs/assets/vi-term-glossary.md`: fixed VI strings
   for the 3 status buckets, the 3 confidence tags, and the 5 honesty flags. All VI
   output (exec summary, HTML) uses these verbatim — no per-file paraphrase.
1. **VI exec summary** (front, ≤1 screen): what was inherited/rebuilt, headline
   metrics framed as features-not-parity, one honest caveat (mock data, no backend).
2. **Methodology** — two evidence sources with dates + reliability notes; the
   3-column frame + confidence-tag definitions; link to the Phase-1 evidence appendix;
   **consume Phase-1's `Static-vs-live discrepancies`** list (if run) — where live
   and static-260703 disagree, show both dated + mark the static one superseded.
3. **Per-section rollups (main) + detail tables (appendix)** — 12 sections (shell,
   repair-main, repair-KT, customer, finance, catalog-a, catalog-b, warehouse,
   stock-out, HR, reports, admin-perm). Table columns: `Gap (old) | Severity |
   Confidence | Rebuild status | Note / deviation reason | Source`. Rollup line per
   section in main doc; full rows in the appendix. Any gap sourced from a section
   file marked "inferred / unverified" → Confidence = `likely`.
4. **Closed cross-check (red-team M2)** — every row marked "Closed (mock)" is
   cross-checked against BOTH the phase completion note AND the shipped code file
   named in the section spec. Carry the two known residuals as inline caveats:
   KT-board ≥10 count is probabilistic (thinnest margin observed); permission
   matrix has no enforcement.
5. **Deliberate deviations** — SPA vs popup windows; corrected typos (Mở, Sản phẩm);
   dropped invented features (approval pills, day-matrix chấm công, invented Trạng
   thái); as-you-type filtering; single pager. Each: what + why defensible.
6. **Known limitations** — the 5 honesty flags + any Deferred gap.
7. **Line-count enforcement** — main doc = rollups + prose ≤800; appendix = the 12
   detail tables ≤800 (split further if needed). Split is done, not conditional.

## Success Criteria

- [ ] VI glossary written first; all VI strings drawn from it.
- [ ] VI exec summary reads standalone; metrics framed features-not-parity.
- [ ] All 12 sections: rollup in main + detail table in appendix, per-row source + confidence.
- [ ] Every gap row is Closed(mock) / Deliberate deviation / Deferred — no vague status.
- [ ] Inferred-spec gaps tagged `likely`; the 2 residual caveats inline; Phase-1 discrepancies consumed (or noted "Phase 1 not yet run").
- [ ] Deliberate-deviations + known-limitations present and honest.
- [ ] Main doc AND appendix each ≤ 800 lines; markdown lints clean.

## Risk Assessment

- **Overstating "Closed"** → mandatory mock qualifier + dual cross-check (note +
  code file); residuals carried inline, not buried.
- **Corpus treated as old-site ground truth** → inferred specs inherit `likely`;
  never assert an old-site column the section file only guessed.
- **800-line overflow** → unconditional pre-planned split (main=rollups, appendix=detail).
- **Stale numbers** → verify against the final gate (440 tests) before publish.
