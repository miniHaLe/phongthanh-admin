---
title: "Single-HTML Consolidation + Vietnamese Fonts — Brainstorm"
date: 2026-07-07
type: brainstorm
status: approved
mode: ultracode
handoff: /ck:plan (default)
audience: [stakeholder-exec, engineering-qa-record]
supersedes_ui: docs/legacy-vs-rebuild-comparison.html (abbreviated → comprehensive)
---

# Single Stakeholder HTML + Vietnamese Font Fix — Brainstorm Report

## 1. Problem statement

The legacy-vs-rebuild doc-set currently ships as **6 files** (5 markdown + 1
abbreviated HTML magazine). The user wants **ONE self-contained HTML** for
stakeholder convenience, with two explicit top priorities: **(a) Vietnamese
spelling correctness** and **(b) reliable font rendering** of Vietnamese diacritics.

## 2. Research findings (parallel agents + independent empirical verification)

### 2.1 Vietnamese spelling — NOT broken (verified)

A full VI-language audit of the exec summary, glossary, and all HTML strings found
**zero genuine spelling/diacritic errors in the rebuild's own prose**. Tone-mark
placement, hỏi/ngã, `nữa`/`nửa`, `kỹ` are all correct modern standard. The only VI
"typos" (`Mỡ`, `Sản phầm`) are **intentional legacy-defect citations**, correctly
quarantined in defect rows (`F-4`) — must NOT be "fixed".

**Conclusion:** the "spelling" concern is really a **rendering** concern. The fix is
fonts, not orthography. (One operational must-do: normalize all VI text to **NFC**
so precomposed glyphs render without mark-positioning dependency.)

### 2.2 Fonts — the real problem, now solved with hard numbers

Current stack `Iowan/Palatino/Georgia` + **zero embedded fonts**. On Windows this
falls to Georgia (decent) or Palatino Linotype/Book Antiqua (**inconsistent
stacked-diacritic rendering**); Iowan is macOS-only. The content is dense with
stacked-diacritic national chars (`ự ệ ấ ề ứ ế ớ ầ ữ ử ợ ể ờ ẫ ẩ ễ`) and the
`Đ/đ + ắ` combo in `Đắk Lắk`/`Đắk Nông` — the classic weak-font casualties.

**Fix = embed a full-Vietnamese-subset webfont as base64 `@font-face`.**

Empirically verified (fontTools against real files):
- **Be Vietnam Pro** (user's choice) — VN-foundry sans, SIL OFL. VN subset has FULL
  stacked-diacritic coverage (`ệ ợ ữ ẩ ẵ ễ đ Đ ắ ₫` all present) + GPOS mark/mkmk
  retained. Fetchable from fontsource npm dist (`cdn.jsdelivr.net/npm/@fontsource/
  be-vietnam-pro@latest/files/`). VN subset ~11KB, Latin ~20KB, Latin-ext per weight.
- **JetBrains Mono** — for labels/kickers/tags; VN 3KB + Latin 21KB/weight, full VN.

### 2.3 Byte budget (measured, not estimated)

| Component | base64 in HTML |
|---|---|
| Be Vietnam Pro 400/500/600/700 (VN+Latin+Latin-ext) + JetBrains Mono 400/600 | ~360 KB |
| 3 existing screenshots (JPEG) | ~340 KB |
| HTML + inline CSS (comprehensive) | ~60 KB |
| **TOTAL** | **~760 KB** (budget 2 MB) ✅ |

### 2.4 Content inventory — current HTML is heavily abbreviated

Current HTML (7 sections, 4 tables, 30 rows) **OMITS**: the entire functional /
a11y / UX defect tables (16 rows), all 10 live-audit evidence entries, all 12
appendix detail gap tables (~180 rows), the Closed-mock cross-check + 2 residuals,
the VI glossary, the D-1…D-5 discrepancy list, env fingerprint, section-confidence
column, the 7th deviation row. A true "single comprehensive doc" needs these.

## 3. Locked decisions (user, 2026-07-07)

- **D-font**: **Be Vietnam Pro** (body sans) + **JetBrains Mono** (labels). Both OFL,
  embedded base64, VN-subset, offline. Keep system fallback in CSS var. Serif→sans is
  an intentional shift; VN-foundry sans is the safest diacritic choice for stakeholders.
- **D-scope**: **Full corpus, collapsible detail.** Everything from all 5 markdown
  files goes in; long tables (12 detail gap tables, 10 evidence entries) wrapped in
  native `<details>` so the default view stays magazine-length, expandable for auditors.
- **D-distribution**: **Single HTML, gate sensitive parts visually.** The vendor-branded
  screenshots + security/evidence sections live behind a clearly-labelled
  "NỘI BỘ — internal only" collapsible, with the vendor-scope disclaimer prominent.

## 4. Recommended solution

**One self-contained `docs/legacy-vs-rebuild-comparison.html`** (replacing the
abbreviated one), containing the full corpus, with embedded Be Vietnam Pro +
JetBrains Mono (NFC-normalized), sensitive material gated behind labelled
collapsibles. Byte budget ~760KB. No network assets. The 5 markdown files remain
as the deep source-of-truth record (unchanged).

### Structure (single scroll + TOC + collapsibles)
1. Cover (Be Vietnam Pro display weight) + vendor/internal banner
2. Exec summary + 6-metric grid + 2 honesty callouts
3. Methodology + 2 evidence sources + status vocab + D-1…D-5 discrepancy list + env fingerprint
4. 12-section gap rollup **with** section-confidence column; each row → `<details>` full detail table
5. Closed-mock cross-check (9 code anchors) + 2 residuals
6. Deliberate deviations (full 7)
7. Known limitations / 5 honesty flags + deferred gaps + scope/distribution
8. **[NỘI BỘ collapsible]** Full defect catalog (functional/security/a11y/UX) + 10 evidence entries + 3 screenshots
9. VI glossary (terminology key)

### Font embedding approach
- Fetch Be Vietnam Pro (400/500/600/700) + JetBrains Mono (400/600) VN+Latin+Latin-ext
  woff2 from fontsource npm dist. Base64-inline each with matching `unicode-range`
  `@font-face` (browser decodes only needed ranges).
- Repoint CSS: `--sans:'Be Vietnam Pro',system-ui,sans-serif`; `--mono:'JetBrains
  Mono',ui-monospace,monospace`; `--display:'Be Vietnam Pro'` (700). Keep fallbacks.
- **Normalize ALL VI text to NFC** before embedding (Python `unicodedata.normalize('NFC', …)`).
- OFL license notice in an HTML comment.

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Decomposed (NFD) tone marks fail to stack | Normalize entire HTML to NFC (must-do); Be Vietnam Pro also retains mark/mkmk as belt-and-suspenders |
| Byte bloat | Measured ~760KB; subsets only; drop weights if needed |
| Sensitive vendor material leaks externally | Gated collapsible + prominent internal-only banner; disclaimer preserved |
| Content drift from markdown source | Markdown remains source of truth; HTML built from it; reconcile numbers unchanged (88H/121M/75L, 440, KT subset, formula-injection=unconfirmed) |
| Collapsibles don't print expanded | Add `@media print{details{display:block} details>*{display:revert}}` so print/PDF shows all |
| fontsource CDN unreachable at build | Fonts fetched once at build to base64; final HTML has no network dependency |

## 6. Success criteria

- One `docs/legacy-vs-rebuild-comparison.html`, self-contained, opens offline, ≤2MB.
- Vietnamese renders correctly (embedded Be Vietnam Pro; NFC-normalized) — spot-check
  `Đắk Lắk`, `kiểm thử`, `hiệu lực`, `chuẩn`, `phẩm`, `₫` in a browser screenshot.
- Full corpus present; detail tables + evidence in `<details>`; print CSS expands them.
- Sensitive material gated + disclaimer prominent; no unredacted PII; no creds.
- Numbers still reconcile across the doc; 5 honesty flags present; metrics framed
  features-not-parity.

## 7. Next steps

Handoff to `/ck:plan` (default) with this report. The markdown docs are unchanged;
this is a presentation-layer consolidation + font-embedding task, docs-only.

## Unresolved questions

None blocking. Optional: whether to also embed a Bold-Italic weight (currently
Regular/Medium/SemiBold/Bold only) — deferred unless the design needs emphasis-italic.
