---
title: "Red-Team Review — Legacy vs Rebuild Comparison Doc-Set Plan"
date: 2026-07-07
type: red-team-review
plan: plans/260707-legacy-vs-rebuild-comparison/
reviewers: [security-legal-boundary, assumption-destroyer, scope-failure-critic]
verdict: FIX-THEN-PROCEED
---

# Red-Team Review — Legacy vs Rebuild Comparison Doc-Set

3 hostile reviewers (security/legal boundary, assumption destroyer, scope/failure
critic). Consensus verdict: **FIX-THEN-PROCEED**. Strong convergence — the core
synthesis doc-set is sound and mostly pre-authored; the risk lives in the scope
that got bolted on during validate (live probing, screenshots, HTML, full-VI).

## Consolidated findings by severity

### CRITICAL
- **C1 — PII in screenshots, no redaction control.** The pages named for capture
  (`/Repairing/Index_8`, warehouse inventory, reports, editor popups) render live
  customer data — names, phones, addresses, serials, payroll/financials. The plan
  base64-embeds them as data-URIs into a *shareable* HTML. The only leak control
  guards the password/cookie and misses the far larger customer-PII payload.
  Data-URIs make it worse: PII survives copy/forward, invisible to file scanners.

### HIGH
- **H1 — "Read-only" export fetch not verified non-mutating.** Legacy ASP.NET
  report/export endpoints can write audit rows, stamp "last exported", or run a
  "mark as processed" flow. Plan asserts read-only, never verifies method/params
  are non-mutating before firing.
- **H2 — Live audit (P1) is a single point of failure gating ~90% synthesis
  work.** P2+P3 depend on P1, but the 12 gap tables + functional/a11y/UX defects
  need ZERO live access. If login rotates / site down / export needs params, the
  whole chain stalls. Plan's own fallbacks prove synthesis works without live data.
- **H3 — HTML magazine is highest-effort, lowest-marginal-value + on critical
  path.** P4 explicitly does "no new analysis" — a bespoke renderer of two
  markdown files that already have an exec front page. Yet it's on the critical
  path (blocks on 2+3) and owns the final gate.
- **H4 — 800-line cap obviously blown; split is falsely "conditional."** 88
  high-sev rows + 12 section tables + 5 prose sections in one VI file is 800+
  lines with near-certainty. Appendix split should be unconditional + pre-designed
  + tracked (it's currently an untracked 5th file).
- **H5 — Screenshot flake fallback is lip service + data-URI bloat unacknowledged.**
  Browser-skill reliability unproven in this env (even auth was validated via curl,
  not the browser skill). "Skip-if-unavailable" doesn't cover flaky/partial; P4's
  before/after has no text-only fallback. 8 × ~400 KB PNG × 1.33 ≈ ~4 MB HTML —
  defeats the "one clean self-contained file" claim.

### MEDIUM
- **M1 — Confidence tags scoped only to security rows.** Extend {confirmed,
  likely, unconfirmed} to functional/gap rows too. The source corpus admits many
  old-site specs are "inferred from controller conventions, not observed" /
  "AJAX partials not captured" — those gaps must inherit "likely", not be asserted.
- **M2 — "Closed" = self-reported + mock-only.** Phase completion notes are
  self-graded by the implementing session; several carried DONE_WITH_CONCERNS +
  residuals fixed in later phases (proving earlier "green" missed them). "Closed"
  for a mock rebuild means "verified in mock/in-memory only" — make that qualifier
  mandatory; promote the cross-check from risk-note to acceptance criterion. Carry
  the two live residuals (KT-board probabilistic ≥10 margin; permission
  no-enforcement) as inline caveats.
- **M3 — Static-vs-live reconciliation has no receiver.** P1 "flags discrepancies
  for P2/P3 to reconcile" but P2/P3 have no step that consumes them. P1 must emit
  a named discrepancy list; P2/P3 acceptance must require consuming it.
- **M4 — Formula-injection conflates "unsanitized present" with "vulnerable."**
  A `=SUM()` system cell isn't a finding. Need a two-part gate: unescaped
  formula-leading cell AND it derives from user-controllable free-text (Ghi chú /
  tên KH) → "confirmed (LOW severity — self-inflicted, needs malicious internal
  user)". The upstream red-team already classified this as low-sev self-inflicted.
- **M5 — Defamation / copyright exposure.** Cataloguing security defects in a
  named third-party vendor's product (footer: "Phần Mềm Quốc Bảo") in a shareable
  doc, if overstated, is trade-libel shaped. Screenshots reproduce vendor-branded
  copyrighted UI. Need a scope disclaimer + internal-distribution gate + owner
  sign-off before external circulation.
- **M6 — Full-VI translation load + terminology drift, no glossary.** ~250 KB
  English analysis → VI across 4-5 files with no controlled vocabulary drifts
  (Đã đóng vs Hoàn tất vs Khắc phục for "Closed"). The honesty flags + confidence
  tags are the highest-stakes strings — must be fixed VI terms defined once.

### LOW
- **L1 — Exec front page wedged in a 600-line eng doc** — an exec falls off a
  cliff after one screen. Make the HTML the sole exec artifact, or extract the
  exec summary to its own file.
- **L2 — Exec metrics launder self-reported mock completion as verified parity.**
  "88 gaps addressed / 440 tests" prove the rebuild has features + tests, NOT that
  it matches the verified old site. Don't present as parity-proof.
- **L3 — Production creds hardcoded in plan.md; no authorization stamp.**

## Fix categorization

**Auto-fix (hardens the plan, reverses no user decision) — applied directly:**
C1 (redaction gate), H1 (non-mutation pre-check), H2 (decouple audit from
synthesis), H4 (unconditional split), M1 (tags on all rows), M2 (Closed=mock +
cross-check), M3 (discrepancy receiver), M4 (two-part formula gate), M5
(disclaimer + distribution gate), M6 (VI glossary), L2 (metrics caveat), L3
(auth stamp + creds by username).

**Needs user decision (reverses a validate-decision or cuts chosen scope):**
- H3 — defer the HTML magazine? (brainstorm chose markdown + HTML)
- H5 + C1 — screenshots: keep (with redaction), or cut given the PII/legal risk?
  (validate chose "yes, browser screenshots")
- M6 — full-VI everywhere, or VI only for the exec-facing artifact? (validate
  chose "full Vietnamese")

## Verdict

**FIX-THEN-PROCEED.** The honesty scaffolding (3-column frame, confidence tags,
dated evidence) is genuinely good and pre-empts ~60% of the attacks. Land the
auto-fixes; bring the 3 scope reversals back to the user (new evidence: PII/legal
risk + single-point-of-failure + gold-plating were not visible at validate time).

## Unresolved questions for the user
1. HTML magazine now, or defer to a follow-up?
2. Screenshots: keep with a mandatory redaction gate, or cut (text-only contrast)?
3. Full-VI everywhere, or VI only for the exec HTML (eng record in English)?
