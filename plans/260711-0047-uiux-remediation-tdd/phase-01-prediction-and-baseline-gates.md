---
phase: 1
title: Prediction and Baseline Gates
status: completed
priority: P1
dependencies: []
---

# Phase 1: Prediction and Baseline Gates

## Overview

Convert the audit into repeatable checks before fixing UI. This phase creates the browser test harness, interaction inventory, viewport matrix, and baseline report that later phases must drive to green.

## Requirements

- Functional: cover route render, core interactions, touch target measurement, mobile input font measurement, footer overlap detection, console errors, network failures, and screenshot capture.
- Non-functional: deterministic local run; no external services required for mock frontend routes; strict CI mode disabled until remediation phases reduce failures.

## Architecture

Use Playwright for browser/runtime checks because Vitest/Happy DOM cannot reliably measure layout, overlap, hit areas, or 4K rendering. Keep Vitest for component-level regressions. Store audit output under `plans/reports/` or test artifacts, not in source runtime code.

## Related Code Files

- Create: `playwright.config.ts`
- Create: `tests/e2e/uiux-runtime.spec.ts`
- Create: `tests/e2e/uiux-audit-helpers.ts`
- Create: `tests/e2e/uiux-viewports.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Read: `plans/reports/260710-uiux-runtime-audit/report.md`
- Read: `plans/reports/260710-uiux-runtime-audit/runtime-audit-results.json`

## Tests Before

1. Add Playwright and scripts:
   - `test:e2e:uiux`
   - `test:e2e:uiux:headed` if useful locally
2. Write diagnostic tests that currently flag:
   - mobile footer/control overlap
   - touch targets below `44x44`
   - mobile input/select fonts below `16px`
   - console `validateDOMNesting` on `/tin-tuc`
   - layout/route smoke at `375x812`, `480x854`, `854x480`, `768x1024`, `1366x768`, `1920x1080`, `2560x1440`, `3840x2160`
3. Mark known UIUX failures as baseline diagnostics, not CI-blocking yet. Existing build/unit gates must still pass.

## Refactor

No product refactor in this phase. Only test harness, test data selectors if needed, and scripts.

## Tests After

1. Run `npm run test:e2e:uiux` and confirm it produces deterministic known-failure output.
2. Run `npm run type-check`.
3. Run `npm run lint`.
4. Run `npm run test`.
5. Run `npm run build`.

## Implementation Steps

1. Install Playwright as a dev dependency and generate lockfile changes.
2. Configure Vite dev server reuse in Playwright config.
3. Implement auth/dev harness setup without committing credentials or env secrets.
4. Implement viewport matrix and helper assertions for hit boxes, computed font size, overlap, console warnings, failed requests, and screenshot paths.
5. Add route and interaction inventory for:
   auth validation, app navigation, command palette, topbar menus, mobile drawer, theme toggle, CRUD sheet/actions, repair row action, repair filters, table pagination, notifications/news, export/print smoke.
6. Commit baseline report generation behavior to artifacts only.

## Success Criteria

- [x] Browser harness runs locally and reaches protected routes through test auth setup.
- [x] Baseline flags all known audit failures without flaky timeouts.
- [x] Existing frontend gates pass after adding the harness.
- [x] Strict failure thresholds are documented but only enforced in later phases.

## Risk Assessment

- Risk: Playwright adds dependency and browser install overhead. Mitigation: keep it scoped to e2e scripts and document install/run path.
- Risk: tests become brittle by comparing pixels too early. Mitigation: use layout metrics as primary assertions; screenshots support human review.
- Risk: baseline diagnostics mask new failures. Mitigation: maintain an explicit known-failure list and shrink it phase by phase.
