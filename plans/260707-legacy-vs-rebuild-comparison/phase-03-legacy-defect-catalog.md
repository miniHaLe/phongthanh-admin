---
phase: 3
title: "Legacy defect catalog"
status: completed
priority: P1
dependencies: []
---

# Phase 3: Legacy defect catalog

> **Decoupled from Phase 1 (red-team H2).** Write from the static corpus with
> security rows defaulting to `likely/unconfirmed`; Phase 1 upgrades specific rows
> to `confirmed` if/when it runs. Do NOT block on Phase 1.
>
> **Owns the cross-doc reconcile gate (red-team H3).** Moved here from Phase 4 so
> "markdown docs done" doesn't depend on the HTML magazine. After this phase,
> reconcile numbers/claims across comparison.md + appendix + this catalog.

## Overview

Write `docs/legacy-defect-catalog.md` (**English**) — the old site's bugs & issues
across four lenses: functional, security & data-integrity, accessibility, UX
friction. Each defect carries evidence (section-file ref OR Phase-1 probe #) +
confidence tag + how the rebuild handles it.

## Requirements

- Functional: four defect categories, each a table of `Defect | Evidence |
  Confidence | Rebuild handling`. Confidence ∈ {confirmed, likely, unconfirmed}.
- Non-functional: ≤ 800 lines; every claim tagged; no unqualified assertions;
  contrast against the rebuild's F7/F8/F9 hardening explicitly.
- Language: **English**.
- **Vendor scope disclaimer (red-team M5)** at the top: findings describe "the
  deployed legacy instance as observed on [date], recon-level, not a formal audit";
  security claims are evidence-bound, never bare product-level assertions about the
  vendor's product. This catalog is **internal-distribution only** pending owner sign-off.
- Phase 1 (if run) supplies confirmed tags; absent Phase 1, security rows stay
  `likely/unconfirmed` — the catalog ships either way.

## Architecture

- **Functional defects** (from the 260703 corpus, mostly confirmed): HTTP 500 on
  `/RoleFunction/Index`; copy-paste branch-list title ("Danh sách nhà sản xuất");
  `Số phiếu hãng`→`filters.soPhieu` filter bug; typos (Mỡ, Sản phầm); naming/model
  inconsistencies (Xác≠xác nhận, warranty-label drift, Chuyển Kho invented statuses).
- **Security & data-integrity** (Phase-1 confirmed + reasoned): no HTTPS, missing
  security headers, EOL ASP.NET/IIS stack, cookie flags; **formula-injection** —
  scoped to the exact field observed, "confirmed (LOW severity — self-inflicted,
  needs malicious internal user)" ONLY if Phase-1's two-part gate passed, else
  "present but not shown exploitable" or "likely"; jQuery XSS surface on free-text
  (likely — named artifact); CSRF/GET-mutation exposure (likely, "requires
  authorized pentest"). Contrast: rebuild's F8 export neutralization, F7
  print-window textContent, F9 openExternal scheme allowlist + noopener. Note the
  upstream review classified formula-injection as low-severity self-inflicted, not
  a breach-class vuln — the catalog must not inflate it.
- **Accessibility** (heuristic, from stack + mirror): AdminLTE2/Bootstrap3
  contrast, popup-window focus traps, keyboard nav gaps. Flagged as heuristic
  where not directly tested. Contrast: rebuild's shadcn/Radix a11y primitives.
- **UX friction**: popup windows for editors, no bulk operations, full-page
  reloads, dual pagination, mandatory "Tìm kiếm" button. Contrast: SPA routes,
  bulk-select, TanStack Query invalidation, as-you-type filtering.

## Related Code Files

- Create: `docs/legacy-defect-catalog.md`
- Reference (read-only): `docs/assets/legacy-audit-evidence.md` (Phase 1),
  the 12 section specs, gap matrix, `ARCHITECTURE.md` (F7/F8/F9 + a11y notes).

## Implementation Steps

1. **Functional defects table** — each documented bug with its section-file line
   ref + how the rebuild fixed/deviated (typos corrected per V4, filter bug fixed
   with independent `soPhieuHang` key, RoleFunction rebuilt as ChucNang taxonomy).
2. **Security & data-integrity table** — pull confirmed items from Phase-1
   evidence (cite #N); reason the rest as "likely" with a one-line rationale;
   tag every row; add the rebuild-hardening contrast column referencing F7/F8/F9.
3. **Accessibility table** — heuristic findings tied to the known stack
   (AdminLTE2/BS3) + observed markup; mark "heuristic — not user-tested";
   contrast with the rebuild's Radix/shadcn + keyboard-nav primitives.
4. **UX-friction table** — reference-vs-rebuild interaction deltas; each with the
   concrete old behavior + the rebuild's replacement.
5. **Summary band** — counts per category + the honest note that security/a11y
   rows are recon-level, not a formal audit/pentest.
6. **Cross-doc reconcile gate (moved here from P4)** — diff comparison.md +
   appendix + this catalog for any contradictory number/claim; fix at the markdown
   source. After this, the markdown doc-set is internally consistent and "done"
   independent of the HTML magazine.

## Success Criteria

- [ ] Vendor scope disclaimer + internal-only marking at the top.
- [ ] Four categories, each a table with Evidence + Confidence + Rebuild-handling columns.
- [ ] Every security row tagged; each `likely` names its observed artifact; exploit claims say "requires authorized pentest".
- [ ] Formula-injection scoped to the observed field + severity-qualified (not inflated, not generalized).
- [ ] Functional defects each cite a section-file ref; confirmed-security each cite a Phase-1 evidence # (or tagged likely if Phase 1 not run).
- [ ] Rebuild F7/F8/F9 hardening explicitly contrasted against the old export/print/link surfaces.
- [ ] Cross-doc reconcile done — comparison.md + appendix + catalog numbers agree.
- [ ] File ≤ 800 lines.

## Risk Assessment

- **Security theater / overclaiming** → confidence tag mandatory; unproven → `likely`
  with a named artifact, never asserted; formula-injection severity-qualified + field-scoped.
- **Defamation (named vendor)** → scope disclaimer + evidence-bound claims + internal-only distribution.
- **A11y hand-waving** → label a11y findings "heuristic, not user-tested".
- **Unfair comparison** → note where the old constraint is era/stack-bound (2014
  ASP.NET) rather than negligence, to keep the contrast credible.
