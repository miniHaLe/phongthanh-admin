# Journal — Legacy vs Rebuild Doc-Set Completion

**Date:** 2026-07-07 · **Workflow:** /ck:cook --auto · **Plan:**
`plans/260707-legacy-vs-rebuild-comparison/`

## What was built

Docs-only synthesis (4 phases, all decoupled) comparing the legacy ASP.NET admin
vs the React rebuild. 7 deliverables in `docs/`: comparison record + 12-table
appendix + defect catalog + live-audit evidence appendix + VI glossary +
self-contained VI HTML magazine + 3 PII-redacted screenshots.

## What went well

- **Live audit paid off.** The read-only recon didn't just re-confirm the static
  corpus — it produced 5 real discrepancies. The most valuable: the HTTP 500 page
  leaks a full Windows drive path (`Administrator\Desktop\HOST\…`), and the "Excel"
  export is HTML-masquerading-as-`.xls`, not real OOXML. Both materially changed
  the security framing.
- **Non-mutation gate held.** The one executed write-ish probe (export fetch) was
  verified GET-only before firing; everything else was GET/observe. No state change.
- **Redaction gate worked.** Injected CSS blur on all `tbody td` + SVG chart text +
  header username BEFORE each screenshot was saved; verified visually each time.
  First report-page capture leaked technician names via the SVG chart — caught it,
  re-shot with SVG text blurred.
- **Decoupling was correct.** P2/P3 were written from the static corpus with
  security rows defaulting to `likely/unconfirmed`, then P1 evidence upgraded
  specific rows. No phase blocked on another beyond P4's dependency on P2+P3.

## What was tricky

- **My own evidence had an error.** I initially wrote "no filesystem drive paths
  observed" based on a grep that only matched `~/Views/` patterns — but the
  screenshot clearly showed a full `C:\Users\Administrator\…` path. Caught it when
  visually reviewing the rendered magazine, re-probed, corrected evidence + catalog
  + HTML. Lesson: grep patterns lie by omission; the screenshot was ground truth.
- **Formula-injection discipline.** Easy to over-claim. The two-part gate forced
  the honest answer: no formula-leading cell in the sample → `unconfirmed`, not
  "safe" and not "confirmed". Kept it scoped to the one export observed.

## Verification

Code-reviewer subagent: 12/12 acceptance criteria PASS. One Medium self-
contradiction fixed (catalog called S-4 "confirmed" while tagged unconfirmed).
Opaque internal codes (Finding N / M1 / X1-X2) expanded to plain language. All
markdown ≤800 lines; HTML 504 KB self-contained (0 external assets); no
password/session cookie in any committed file.

## Unresolved

- Report result-column verification (mock vs live AJAX) stays deferred → rows
  tagged `likely` where unverified.
- Doc-set + screenshots are internal-only pending owner sign-off (third-party
  vendor branding).
