---
title: "Legacy vs Rebuild Comparison Doc-Set"
description: "Documentation comparing the legacy ASP.NET site to the React rebuild — gap closure, old-site defects (functional + security + a11y + UX), and honest rebuild limitations. Markdown doc-set + HTML magazine."
status: completed
priority: P2
branch: ""
tags: [documentation, comparison, legacy-parity, security-audit]
blockedBy: []
blocks: []
created: "2026-07-07T06:00:21.703Z"
createdBy: "ck:plan"
source: skill
---

# Legacy vs Rebuild Comparison Doc-Set

## Overview

Produce authoritative documentation comparing the legacy ASP.NET admin
(`http://phongthanh.phanmemsuachuabaohanh.com`, login `khoa`/`123456`) against
the from-scratch React rebuild (this repo). Three concerns: (a) **gaps** old→new,
(b) the old site's **bugs & issues** (functional + security + accessibility + UX),
(c) an **honest** account of the rebuild's own deliberate deviations + known
limitations. Serves both an engineering/QA record and a stakeholder exec summary.

**Documentation only — no code changes.** This is a synthesis of the existing
comparison corpus (33 KB gap matrix + 12 section spec files + 7 phase completion
notes) plus a fresh live audit (recon + light probing, login-confirmed).

**Non-negotiable frame:** every gap/bug is 3-column — old gap/bug → rebuild
handling → honesty flag. A one-sided "old bad / new good" doc is rejected.

Brainstorm source:
[`plans/reports/brainstorm-260707-legacy-vs-rebuild-comparison-docset-report.md`](../reports/brainstorm-260707-legacy-vs-rebuild-comparison-docset-report.md)

## Deliverables

| File | Purpose | Lang | Audience |
|------|---------|------|----------|
| `docs/legacy-vs-rebuild-comparison.md` | Exec summary (VI) + methodology + per-section gap **rollups** + deliberate deviations + known limitations | VI exec / EN body | Eng/QA + exec |
| `docs/legacy-vs-rebuild-appendix.md` | The 12 detailed per-section gap tables (split planned UP FRONT, not conditional) | EN | Eng/QA |
| `docs/legacy-defect-catalog.md` | Old-site defects: functional / security & data-integrity / a11y / UX, each with evidence + confidence tag + rebuild handling | EN | Eng/QA |
| `docs/legacy-vs-rebuild-comparison.html` | Editorial magazine: same decisions + before/after + **redacted** screenshots | VI | Stakeholder/exec |
| `docs/assets/legacy-audit-evidence.md` | Raw live-audit probe outputs (headers, HTTP codes, export bytes, endpoint observations) — citation source, **PII-stripped** | EN | Eng (appendix) |
| `docs/assets/screenshots/*.png` | Old-site page captures — **PII-redacted before save** | — | HTML embed source |
| `docs/assets/vi-term-glossary.md` | Canonical VI strings for status vocab + confidence tags + honesty flags (defined once, used by all VI output) | VI | Internal |

> **Language split (validate + red-team):** exec-facing output — the
> `comparison.md` **exec summary** + the **HTML magazine** — in **Vietnamese**.
> Engineering record — `appendix`, `defect-catalog`, `evidence`, and the
> `comparison.md` body/tables — in **English** (matches source corpus, less
> translation drift). VI status/confidence/honesty strings come from the glossary.
>
> **Appendix split is UNCONDITIONAL** — 88+ high-sev rows × 12 sections blows the
> 800-line cap with near-certainty; main doc = rollups, appendix = detail tables.
> `docs.maxLoc` cap = 800 lines/file, enforced per file.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Live-audit evidence pass](./phase-01-live-audit-evidence-pass.md) | Completed |
| 2 | [Gap-closure comparison matrix](./phase-02-gap-closure-comparison-matrix.md) | Completed |
| 3 | [Legacy defect catalog](./phase-03-legacy-defect-catalog.md) | Completed |
| 4 | [HTML magazine + exec reconciliation](./phase-04-html-magazine-exec-reconciliation.md) | Completed |

## Completion note (2026-07-07)

All 4 phases complete. Deliverables in `docs/`:
`legacy-vs-rebuild-comparison.md` (216 lines), `legacy-vs-rebuild-appendix.md`
(340), `legacy-defect-catalog.md` (142), `assets/legacy-audit-evidence.md` (253),
`assets/vi-term-glossary.md` (56), `legacy-vs-rebuild-comparison.html` (504 KB,
self-contained), `assets/screenshots/*.jpg` (3 PII-redacted).

**Live audit (260707)** reproduced auth + probed read-only. Confirmed/upgraded:
HTTP 500 on `/RoleFunction/Index` + `/Create` now shown to leak a **full stack
trace + Windows drive path** (`C:\Users\Administrator\Desktop\HOST\…`,
`customErrors=Off`); no-HTTPS cleartext; missing HSTS/CSP/nosniff/Referrer-Policy;
`X-Frame-Options` present on login but absent on authed pages. Export is an
**HTML-table-masquerading-as-`.xls`** with **no formula-leading cell in the
sample** → formula-injection `unconfirmed` (LOW/self-inflicted, scoped to
`ExcelRepairingList`, not inflated). 5 static-vs-live discrepancies emitted +
consumed by P2/P3.

Code-reviewer audit: **12/12 acceptance criteria PASS**. One Medium self-
contradiction (catalog called S-4 "confirmed" while tagged unconfirmed) fixed;
opaque internal codes (Finding N / M1 / X1-X2) expanded to plain language.
No code files touched; no password/session cookie in any committed file; each
markdown ≤800 lines; HTML ≤2 MB self-contained; all PII redacted before save.

## Locked decisions (brainstorm 260707 + validate 260707)

- **Evidence**: synthesize existing corpus + fresh live audit (both, each caveated by date).
- **Audience**: engineering/QA record + exec summary front page.
- **Format**: markdown doc-set + self-contained HTML magazine.
- **Bug depth**: broadest — functional + security/data-integrity + accessibility + UX.
- **Audit depth**: recon + light probing, INCLUDING **fetch + inspect one real
  `.xlsx`/CSV export** for formula-injection (read-only, authenticated) — converts
  that claim from "likely" to "confirmed". Exploit-level still deferred to
  "requires authorized pentest".
- **Language (validate + red-team)**: **VI for exec-facing** (comparison.md exec
  summary + HTML magazine); **EN for the engineering record** (appendix,
  defect-catalog, evidence). VI honesty/confidence/status strings are fixed in
  `vi-term-glossary.md` (defined once — no per-file paraphrase).
- **Screenshots (validate + red-team)**: **YES, with a mandatory PII-redaction
  gate** — browser capture (agent-browser/chrome-profile), but blur/box all
  customer PII (names, phones, addresses, money/payroll) BEFORE the PNG is saved;
  prefer demo/seed records; embedding in HTML is gated on a logged redaction pass;
  screenshots + security catalog are **internal-distribution only** pending owner
  sign-off (vendor "Phần Mềm Quốc Bảo" is a third party). HTML byte budget ≤ 2 MB.
- **HTML magazine (red-team)**: **KEEP** the full editorial magazine. To de-risk:
  the cross-doc consistency-reconcile gate moves to Phase 3's tail (not Phase 4),
  so "done on the markdown docs" doesn't depend on the magazine.
- **Candor (validate)**: full limitations flatly in the eng record;
  proportionate-but-visible ("giai đoạn nguyên mẫu / dữ liệu mô phỏng") in the HTML
  exec view — never omitted.
- **Live-audit decoupling (red-team H2)**: the synthesis docs (P2 gap tables, P3
  functional/a11y/UX defects) are written **independently of Phase 1** — security
  rows default to `likely/unconfirmed`; Phase 1 is a **non-blocking enrichment**
  that UPGRADES specific rows to `confirmed`. Phase 1 no longer hard-blocks P2/P3.

## Honesty flags (must appear in every deliverable)

- Rebuild is 100% mock/in-memory — writes lost on any reload, no backend.
- Permission matrix (202-checkbox) is UI mock, **no enforcement**.
- Payroll Tổng/Thực lãnh = documented static sum, formula deferred.
- Some report result-columns are plausible-mock, unverified vs live AJAX partials.
- Security claims not provable by read-only recon → "likely / unconfirmed;
  requires authorized pentest".

## Acceptance criteria (plan level)

- [ ] Every documented gap/bug traceable to evidence (section-file ref OR probe output in the appendix).
- [ ] **Confidence tags on ALL rows** (functional gaps + security) — not security-only.
      Any gap whose source section-file marks the old-site spec "inferred / not
      captured / unverified" inherits `likely`, never `confirmed`.
- [ ] **"Closed" means "verified in mock/in-memory only"** — qualifier mandatory;
      each Closed row cross-checked against the phase note AND the shipped code file.
      The two live residuals (KT-board ≥10 probabilistic margin; permission
      no-enforcement) carried as inline caveats, not buried.
- [ ] Zero unqualified security claims — each confirmed-by-probe OR tagged likely/unconfirmed with a named observed artifact.
- [ ] **Formula-injection = two-part gate**: unescaped formula-leading cell AND it
      derives from user-controllable free-text → "confirmed (LOW sev, self-inflicted)".
      Otherwise "present but not shown exploitable". Never a bare product-level claim.
- [ ] **No unredacted PII** in any screenshot, data-URI, or the evidence appendix. HTML ≤ 2 MB.
- [ ] **Vendor scope disclaimer** in the defect catalog + HTML; security catalog + screenshots internal-only pending owner sign-off.
- [ ] All honesty flags present in the comparison doc + catalog + HTML.
- [ ] Exec metrics (88 gaps / 440 tests) framed as "rebuild has features+tests", NOT "verified parity".
- [ ] Both audiences served: eng record complete + VI exec summary/HTML readable standalone.
- [ ] Markdown files ≤ 800 lines each (appendix split done); HTML self-contained (inline CSS/JS, no network assets).
- [ ] `docs/` created; no code files touched; no password/session cookie in any committed file.

## Validation Log

### Session — 2026-07-07 (critical-questions interview)

4 decisions locked — **V-lang and V-screens were later revised by the Red-Team Log
below; read that as authoritative where they differ.**
- **V-lang**: ~~Full Vietnamese everywhere~~ → **revised**: VI exec-facing only, EN eng record.
- **V-probe**: Fetch + inspect one real export → formula-injection confirmed
  (read-only) — retained, now with a non-mutation pre-check + two-part severity gate.
- **V-screens**: ~~Capture 6-10 screenshots, no redaction~~ → **revised**: 3-4 pages,
  mandatory PII-redaction gate, byte budget, internal-distribution only.
- **V-candor**: Full limitations in the record; proportionate-but-visible
  ("giai đoạn nguyên mẫu") in the HTML — retained.

**Whole-plan consistency sweep:** reread plan.md + phase-01..04. Language note in
all 4 phases; screenshots in P1+P4; export-fetch→confirmed reconciled in P1+P3.
**0 unresolved contradictions.**

## Red-Team Log

### Session — 2026-07-07 (3-lens adversarial panel)

Report:
[`plans/reports/from-red-team-to-planner-legacy-comparison-docset-plan-review-report.md`](../reports/from-red-team-to-planner-legacy-comparison-docset-plan-review-report.md).
Verdict **fix-then-proceed**. 15 findings; 12 auto-fixed, 3 taken back to the user.

**User re-decisions (2026-07-07):**
- Screenshots → **keep, with mandatory PII-redaction gate** (was: keep, no gate).
- HTML magazine → **keep the full editorial magazine** (reconcile-gate moved to P3 tail).
- Language → **VI exec-facing only; EN engineering record** (was: full-VI everywhere).

**Auto-fixes applied** (harden without reversing a decision): live-audit decoupled
from synthesis (P1 non-blocking enrichment); export non-mutation pre-check;
PII-strip on evidence appendix; confidence tags on ALL rows + inherit corpus
hedges; "Closed" = mock-verified + code cross-check + 2 residual caveats;
unconditional appendix split; two-part formula-injection gate w/ severity;
vendor disclaimer + internal-distribution gate; exec-metrics-not-parity caveat;
auth stamp + creds-by-username; VI glossary for load-bearing strings.

**Post-red-team consistency sweep:** reread all 5 files after edits — language
split, decoupling, redaction gate, and confidence-tag-all-rows consistent across
plan + phases. **0 unresolved contradictions.**

## Dependencies

Reads (read-only) the completed parity plan's reports:
`plans/260703-1908-reference-ui-parity-tdd/` + `plans/reports/*`. No blocking
relationship — that plan is `completed`; this one consumes its artifacts.

Owner-authorized live audit of the owner's own production instance (2026-07-07),
scope = read-only recon per the boundary in phase-01. Creds referenced by
username only in committed files.
