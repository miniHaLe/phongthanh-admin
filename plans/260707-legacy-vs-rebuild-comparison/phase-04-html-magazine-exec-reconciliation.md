---
phase: 4
title: "HTML magazine + exec reconciliation"
status: completed
priority: P2
dependencies: [2, 3]
---

# Phase 4: HTML magazine + exec reconciliation

> **The markdown doc-set is already "done" + reconciled at the end of Phase 3.**
> This phase is the exec-facing view; it must NOT be the thing that gates the
> engineering deliverables. Kept as the full editorial magazine per user decision.

## Overview

Produce `docs/legacy-vs-rebuild-comparison.html` — a self-contained VI editorial
magazine rendering the same decisions + strongest before/after contrasts for a
stakeholder/exec audience. Runs the final doc-set gate.

## Requirements

- Functional: self-contained HTML (inline CSS/JS, **redacted screenshots embedded
  as data-URIs**, no network assets); cover; per-section gap-closure visual;
  strongest before/after contrasts; security-posture band; honesty-flags callout;
  citations as visible refs.
- Non-functional: responsive, keyboard-friendly, reduced-motion; editorial
  magazine style (warm paper, ink, muted red accent — no SaaS gradients/cards).
  **HTML ≤ 2 MB** (red-team H5) — downscale/compress screenshots to fit.
- Language: **tiếng Việt** throughout (cover, sections, captions), VI strings from
  `vi-term-glossary.md`. Candor: limitations framed "giai đoạn nguyên mẫu / dữ liệu
  mô phỏng" — visible callout, not omitted.
- **Screenshots optional (red-team H5)**: the before/after story stands on TEXT
  contrast. If Phase 1 produced zero/partial screenshots, the HTML renders cleanly
  with none — no empty boxes. Screenshots are garnish, not the thesis.
- Consistency: numbers/claims match the markdown docs (already reconciled in Phase 3).

## Architecture

- Content is a re-presentation of Phase-2 (gap closure) + Phase-3 (defects), not
  new analysis. Pull the exec summary, the per-section rollups, the top ~6
  before/after contrasts, and the honesty-flags block.
- Style contract: the built-in editorial magazine contract (paper `#faf7f2`, ink
  `#0a0a0a`, accent `#b8232c`, serif display, mono labels, hairline rules).
  Diagrams in CSS/SVG only. No external fonts/images required.
- Honesty preserved: the "known limitations" + "recon-not-pentest" caveats get
  their own visible callout — not buried.

## Related Code Files

- Create: `docs/legacy-vs-rebuild-comparison.html`
- Reference (read-only): `docs/legacy-vs-rebuild-comparison.md`,
  `docs/legacy-vs-rebuild-appendix.md`, `docs/legacy-defect-catalog.md`,
  `docs/assets/legacy-audit-evidence.md`, `docs/assets/screenshots/*.png` (if any),
  `docs/assets/vi-term-glossary.md`.

## Implementation Steps

1. **Consistency check** — the markdown was reconciled in Phase 3; re-verify the
   HTML's numbers/claims match before composing. Markdown is source of truth.
2. **Compose HTML (tiếng Việt)** — cover; methodology/evidence band; per-section
   gap-closure (visual rollup: closed/deviation/deferred); top before/after
   contrasts (repair workspace, warehouse inventory, permission matrix, security
   posture) — text contrast primary, redacted screenshots on the "before" side
   WHERE captured; security band (confirmed vs likely, pentest caveat, LOW-sev
   formula-injection not inflated); honesty-flags callout ("giai đoạn nguyên mẫu");
   exec metrics framed features-not-parity; citations as visible refs.
3. **Self-containment + byte budget** — inline all CSS/JS; base64-embed any
   redacted screenshots as data-URIs (downscaled/compressed, HTML ≤ 2 MB); no
   `<link>`/CDN; renders cleanly with ZERO screenshots; verify it opens offline.
4. **A11y pass** — semantic headings, keyboard focus, `prefers-reduced-motion`,
   contrast on the paper palette.
5. **Final doc-set gate** — all deliverables exist (comparison, appendix, catalog,
   evidence, glossary, HTML), honesty flags in each exec+record surface, vendor
   disclaimer present, no code files touched, each markdown ≤800 lines, HTML ≤2 MB
   self-contained, no PII in any screenshot/data-URI, no creds in committed files.

## Success Criteria

- [ ] `docs/legacy-vs-rebuild-comparison.html` opens offline, self-contained, ≤ 2 MB.
- [ ] Renders cleanly whether Phase 1 produced screenshots or none (no empty boxes).
- [ ] Numbers/claims match the markdown docs; metrics framed features-not-parity.
- [ ] Security band: confirmed-vs-likely + "requires authorized pentest" + LOW-sev formula-injection not inflated.
- [ ] Honesty-flags callout visible (not buried); no unredacted PII in any embedded image.
- [ ] Editorial style contract followed; responsive + keyboard-friendly + reduced-motion.
- [ ] Final gate passes: all deliverables present, docs-only, within caps.

## Risk Assessment

- **HTML drifts from markdown** → markdown reconciled in Phase 3 is source of truth; HTML is a view.
- **Screenshot dependency** → optional; text contrast carries the story; renders with none.
- **Byte bloat** → ≤2 MB budget; compress/downscale; drop screenshots before breaking the budget.
- **Fluff creep** → honesty-flags callout mandatory + visible; before/after keeps the limitation side.
- **PII in embedded images** → only redaction-passed screenshots may embed (enforced at Phase 1).
- **Over-engineered HTML** → CSS/SVG only, no build step, no external assets; one file.
