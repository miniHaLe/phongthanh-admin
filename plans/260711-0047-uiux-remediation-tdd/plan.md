---
title: UIUX Runtime Audit Remediation TDD
description: >-
  Remediate the runtime UI/UX audit with tests-first gates for mobile
  ergonomics, touch targets, 4K scaling, semantic HTML, and API verification.
status: completed
priority: P1
branch: ''
tags:
  - frontend
  - uiux
  - accessibility
  - testing
  - api
  - tech-debt
blockedBy: []
blocks: []
created: '2026-07-11'
createdBy: 'ck:plan'
source: skill
auditSource: plans/reports/260710-uiux-runtime-audit/report.md
predictReport: plans/260711-0047-uiux-remediation-tdd/reports/predict-report.md
---

# UIUX Runtime Audit Remediation TDD

## Overview

Fix every issue from `plans/reports/260710-uiux-runtime-audit/report.md` through a TDD execution path. Scope covers shared UI primitives, shell/mobile layout, repair/table workflows, 4K dashboard scaling, nested button semantics, noisy tests, and the API test environment blocker.

No app code implemented in this plan. Implementation must create failing or diagnostic tests first, make the smallest scoped changes, then run the phase gate before moving on.

## Scope Challenge

- Existing code: React 18 + Vite + Tailwind + shadcn/Radix primitives; Vitest/Testing Library already broad; no Playwright dependency yet; API has Jest e2e but needs local Postgres on `127.0.0.1:5434`.
- Minimum changes: shared primitive sizing, shell scroll/safe-area behavior, repair/table mobile workflow affordances, dashboard large-screen composition, semantic fix on news rows, reproducible API test env.
- Complexity: touches more than 8 files; necessary because failures are systemic across primitives, shell, feature pages, tests, and API env.
- Selected mode: hold scope. No decorative redesign; fix operational admin UX quality and verification.

## Source Evidence

- Runtime audit: `plans/reports/260710-uiux-runtime-audit/report.md`
- Runtime JSON: `plans/reports/260710-uiux-runtime-audit/runtime-audit-results.json`
- Screenshots: `plans/reports/260710-uiux-runtime-audit/screenshots/*-v3.png`
- Verified existing gates from audit: frontend type-check, lint, Vitest, build, prod build with `VITE_REAL_RESOURCES=khach-hang`; API lint/build.
- Blocked gate from audit: `cd api && npm test` because Postgres was unavailable on `127.0.0.1:5434`; compose full stack also requires `INITIAL_ADMIN_PASSWORD`.

## Prediction Verdict

Verdict: CAUTION. Proceed, but constrain the remediation to shared primitives plus highest-risk workflows before broader polish.

See `reports/predict-report.md`.

Key mitigations:

- Centralize responsive sizing in primitives and shared table controls; avoid one-off page patches.
- Keep desktop operator density; increase mobile targets and font size with responsive classes.
- Add strict browser/a11y gates only after baseline proves deterministic.
- Do not mark API tests passed without the real Postgres-backed e2e suite.

## Acceptance Criteria

- Mobile workflows at `375x812`, `480x854`, and `854x480` have no obscured primary controls, footer overlap, or incoherent text/control overlap.
- Touch targets for interactive controls are at least `44x44` CSS px on mobile, or have an equivalent hit area with visible focus.
- Mobile text inputs/select/search fields render at `>=16px` to avoid iOS zoom and improve readability.
- Dashboard and repair list render cleanly at `1366x768`, `1920x1080`, `2560x1440`, and `3840x2160` with deliberate large-screen composition, not underscaled 1080p density stretched across 4K.
- News page has no nested interactive controls and no `validateDOMNesting` warning.
- UI e2e covers auth validation, navigation, command palette, topbar menus, mobile drawer, theme, CRUD sheet/actions, repair filters/actions, table pagination, notifications/news, export/print where applicable, and route render smoke across the viewport matrix.
- API verification covers frontend prod resource gate and backend Jest e2e against a real local test DB when env is present.
- Every phase ends with focused tests plus the broad gate listed in that phase. Failures are fixed or explicitly documented as blocked before next phase.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Prediction and Baseline Gates](./phase-01-prediction-and-baseline-gates.md) | Completed |
| 2 | [Shell and Mobile Viewport Foundation](./phase-02-shell-and-mobile-viewport-foundation.md) | Completed |
| 3 | [Touch Targets and Form Controls](./phase-03-touch-targets-and-form-controls.md) | Completed |
| 4 | [Repair and Table Mobile Workflows](./phase-04-repair-and-table-mobile-workflows.md) | Completed |
| 5 | [Large Screen Dashboard Scaling](./phase-05-large-screen-dashboard-scaling.md) | Completed |
| 6 | [News Semantics and Test Noise](./phase-06-news-semantics-and-test-noise.md) | Completed |
| 7 | [API Test Environment and CI Gates](./phase-07-api-test-environment-and-ci-gates.md) | Completed |
| 8 | [Final Cross Resolution Verification](./phase-08-final-cross-resolution-verification.md) | Completed |

## Test Cadence

Run the narrow gate first, then the shared gate after each phase.

| Phase | Focused gate | Shared gate |
|-------|--------------|-------------|
| 1 | New UIUX audit baseline command records known failures deterministically | Completed |
| 2 | Shell/mobile Playwright specs for footer, scroll, drawer, FAB, dashboard | Completed |
| 3 | Primitive/control Vitest + Playwright touch/input measurements | Completed |
| 4 | Repair/table mobile interaction specs | Completed |
| 5 | Dashboard 2560/3840 layout metrics + screenshots | Completed |
| 6 | News semantic regression + console-warning gate | Completed |
| 7 | `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`; `cd api && npm run lint && npm run build && npm test` | Completed |
| 8 | Full route/interaction/viewport matrix and screenshot diff review | Completed |

## Cross-Plan Dependencies

No unfinished local `plans/*/plan.md` files found during pre-creation scan. The API test-env phase relates to the backend roadmap named in `README.md` (`plans/260707-1612-real-backend-database/`), but no plan file exists locally to update or block against.

## Not In Scope

- Replacing the app visual language with a marketing site or hero-style UI.
- Rewriting all table pages into cards before the shared table pattern is validated.
- Changing backend business behavior outside test environment reliability.
- Mocking API test success or weakening failing tests.

## Open Questions

- Mobile table-heavy pages: default plan implements mobile card/action summaries for top workflows while preserving desktop tables. Confirm if horizontal table scroll is preferred instead.
- 4K strategy: default plan uses capped content width plus larger dashboard composition. Confirm if true density scale-up across all pages is preferred.
- API tests: provide local Docker/env approval if `docker compose up -d db` is not acceptable in the implementation environment.
