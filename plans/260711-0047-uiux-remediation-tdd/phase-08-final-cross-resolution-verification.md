---
phase: 8
title: Final Cross Resolution Verification
status: completed
priority: P1
dependencies:
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
---

# Phase 8: Final Cross Resolution Verification

## Overview

Run the complete UI/UX, API, build, accessibility, and interaction verification matrix and publish the final remediation report.

## Requirements

- Functional: every previously found issue is either fixed or explicitly blocked with evidence; all buttons/functions/APIs in the audited surface are exercised.
- Non-functional: screenshots prove mobile-to-4K rendering; no hidden failures, weakened tests, or undocumented skips.

## Architecture

Use the Phase 1 browser harness in strict mode. Convert baseline diagnostics into hard failures once the known-failure list is empty. Keep generated screenshots/reports under `plans/reports/` or test artifacts.

## Related Code Files

- Modify: `tests/e2e/uiux-runtime.spec.ts`
- Modify: `tests/e2e/uiux-audit-helpers.ts`
- Modify: `package.json`
- Create: `plans/reports/<date>-uiux-remediation-verification/report.md`
- Create: `plans/reports/<date>-uiux-remediation-verification/runtime-audit-results.json`
- Create: `plans/reports/<date>-uiux-remediation-verification/screenshots/*`

## Tests Before

1. Flip the UIUX harness to strict mode.
2. Confirm any remaining known-failure entry causes the final gate to fail.
3. Run final route/interaction inventory once before report composition to expose last defects.

## Refactor

No product refactor unless verification finds a missed defect. Any missed defect gets fixed with a focused test first, then the full final gate reruns.

## Tests After

1. Run `npm run type-check`.
2. Run `npm run lint`.
3. Run `npm run test`.
4. Run `npm run build`.
5. Run `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`.
6. Run `npm run test:e2e:uiux`.
7. Run `cd api && npm run lint && npm run build && npm test` with DB available.
8. Run final manual screenshot review for `375x812`, `480x854`, `854x480`, `768x1024`, `1366x768`, `1920x1080`, `2560x1440`, `3840x2160`.

## Implementation Steps

1. Execute strict UIUX route sweep at all viewports.
2. Execute interaction suite:
   login validation, command palette, route navigation, topbar dropdowns, theme, mobile drawer, CRUD add/edit/delete smoke, repair filters/actions, pagination, saved views, notifications/news, export/print smoke, branch map modal.
3. Execute API gates and frontend real-resource prod build.
4. Save report, JSON metrics, and screenshots.
5. Compare against `plans/reports/260710-uiux-runtime-audit/report.md` finding by finding.
6. Update plan status only after all gates pass or blockers are documented.

## Success Criteria

- [x] All high/medium audit findings fixed with tests.
- [x] Touch target, input font, overlap, console warning, failed request, and route smoke checks pass in strict mode.
- [x] 480p-to-4K screenshots reviewed and no component is covered, cramped, or incoherent.
- [x] API tests and real-resource prod build verified or blocked with exact environment cause.
- [x] Final report lists commands run, results, screenshots, residual risks, and unresolved questions.

## Risk Assessment

- Risk: final matrix is long and may expose unrelated latent defects. Mitigation: classify by severity; fix blockers, document non-blocking residual risk.
- Risk: screenshots alone miss keyboard/accessibility regressions. Mitigation: include keyboard path and accessible-name assertions in strict harness.
