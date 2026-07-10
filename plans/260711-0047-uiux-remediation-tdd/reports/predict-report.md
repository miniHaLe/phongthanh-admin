---
type: predict-report
date: 2026-07-11
proposal: "UIUX Runtime Audit Remediation TDD"
verdict: caution
---

# Prediction Report: UIUX Runtime Audit Remediation TDD

## Verdict: CAUTION

Proceed with the remediation, but avoid a broad visual rewrite. The highest leverage path is shared primitives, shell layout, table/repair mobile workflow, dashboard large-screen composition, semantic fixes, and reproducible API gates.

## Agreements

- The audit problems are real and systemic; page-only fixes will miss shared causes.
- Tests must come before refactors because layout regressions are hard to spot in Happy DOM.
- Mobile and desktop need different density contracts; one global size bump would hurt operator workflows.
- API tests cannot be counted as passed without the real Postgres-backed e2e suite.

## Conflicts & Resolutions

| Topic | Architect | Security | Performance | UX | Devil's Advocate | Resolution |
|-------|-----------|----------|-------------|----|------------------|------------|
| Shared primitives vs page patches | Centralize | Low security concern | Shared change broad | Needed for consistency | Could break many pages | Centralize, but gate with broad route smoke |
| Playwright addition | Correct tool | Avoid credentials | Adds install cost | Required for layout | Could be overkill | Add it because viewport/overlap cannot be trusted in unit tests |
| Mobile table strategy | Derive from DataTable | No auth impact | Avoid duplicate render cost | Needs card/action summaries | Horizontal scroll may be enough | Implement repair-first mobile summary, preserve desktop table |
| 4K scaling | Add page composition | No data impact | Avoid global zoom | Must feel intentional | Could be low business value | Dashboard-focused cap/composition, not global redesign |
| API env | Needed for confidence | Keep secret requirements | DB setup costs time | Verifies real flows | Might block local dev | Add DB-only path and preflight; no fake pass |

## Risk Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Shared primitive change regresses many routes | High | Add route smoke and representative CRUD/table tests before changing primitives |
| Mobile card/action summaries diverge from desktop table behavior | Medium | Derive actions from existing config; repair-list first |
| Browser tests become flaky | Medium | Prefer layout metrics over pixel assertions; screenshots for review |
| Secret posture weakened while fixing API tests | High | Keep full-stack compose secrets required; DB-only test path only starts Postgres |
| Scope grows into full redesign | Medium | Keep operational admin constraints; no marketing/hero/decorative redesign |

## Recommendations

1. Create browser baseline first; use strict mode only after remediation removes known failures.
2. Fix shell and primitives before page-level repair/table polish.
3. Keep responsive density: mobile `44px` targets and `>=16px` inputs; desktop remains compact with `md:` sizing.
4. Use dashboard-specific 4K composition before touching global typography.
5. Treat API e2e as blocked unless Postgres test DB is available; never skip it silently.

## Unresolved Questions

- Confirm mobile table strategy: repair-first card/action summary vs accepted horizontal scroll.
- Confirm 4K strategy: content cap plus dashboard composition vs global density scale-up.
- Confirm whether implementation may start Docker DB locally for API e2e.
