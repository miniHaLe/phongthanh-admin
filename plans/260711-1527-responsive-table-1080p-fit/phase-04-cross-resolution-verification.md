---
phase: 4
title: Cross-Resolution And Workflow Verification
status: completed
priority: P1
dependencies: [2, 3]
---

# Phase 4: Cross-Resolution And Workflow Verification

<!-- Updated: Validation Session 1 - normal fit plus overlength bounded scrolling and per-group sort validation -->

## Context Links

- [Plan](./plan.md)
- [Repair composition](./phase-02-repair-table-composition.md)
- [Inventory and finance composition](./phase-03-wide-inventory-and-finance-tables.md)
- tests/e2e/uiux-table-heavy.spec.ts
- tests/e2e/uiux-audit-helpers.ts

## Overview

Prove grouped tables are readable, accessible, behavior-compatible, and free of
protected-value clipping across viewports, densities, themes, and sidebar states.

## Requirements

- Test matrix: 375x812, 480x854, 854x480, 768x1024, 1024x768, 1366x768,
  1536x864, 1920x1080 expanded/collapsed, 2560x1440, 3840x2160.
- Validate comfortable and compact density on representative composite routes.
- Validate light/dark mode and keyboard/touch behavior.
- Produce the required verification report with before/current/final evidence.

## Architecture

- Add data-table-protected overflow checks for every visible protected value.
- Keep frame-level fit checks separate from content-level fit checks.
- For supported domain lengths, require 1080p frame fit. For synthetic overlength
  values, require protected content visibility plus inner-frame scrolling only.
- Add reusable workflow helpers for composite sort menu, group visibility/reset,
  selection, pagination, row action/dialog, export, density, and dark mode.
- Run route-specific critical workflows plus representative shared-contract tests;
  avoid shallow table-visible assertions as proof of compatibility.

## Related Code Files

- Modify: tests/e2e/uiux-table-heavy.spec.ts
- Modify: tests/e2e/uiux-audit-helpers.ts
- Modify if needed: tests/e2e/uiux-viewports.ts
- Modify/create: focused route E2E specs for repair mobile cards and critical actions
- Create: plans/260711-1527-responsive-table-1080p-fit/reports/verification-report.md
- Create/update: screenshots under the plan-specific reports/screenshots directory

## Implementation Steps

1. Assert no document/main overflow and exact frame fit at 1080p for both sidebar
   states and default/reset groups.
2. Assert every protected element fits itself; include document numbers, phone,
   serial, dates, stock codes, quantities, and currency.
3. At constrained widths, verify only the table frame scrolls and keyboard/button
   controls reveal the rightmost header and first-row cell.
4. Verify sortable targets are 44px on touch viewports and status/action labels
   use at most two lines without overlap.
5. Exercise per-group composite sort options, migrated repair group
   visibility/reset, density, selection, pagination, filters, exports, row
   actions, dialogs, and prints.
6. Exercise repair mobile-card selection, navigation, and row actions below 768px.
7. Run dark-mode surface/focus checks on repair, issued-parts, and finance routes.
8. Run all required commands and record exact results, screenshots, measurements,
   reviewer findings, docs impact, rollback notes, residual risks, and questions.

## Commands

- npm run type-check
- npm run lint
- npm run test
- CHOKIDAR_USEPOLLING=1 npm run test:e2e:uiux -- --grep table --workers=1
- CHOKIDAR_USEPOLLING=1 npm run test:e2e:uiux -- --workers=1
- npm run build
- env VITE_REAL_RESOURCES=khach-hang npm run build:prod

## Todo List

- [x] Expanded and collapsed 1080p fit passes.
- [x] Every protected value fits without clipping or ellipsis.
- [x] Synthetic overlength protected values trigger bounded table scrolling only.
- [x] Touch, keyboard, density, visibility, sorting, selection, and pagination pass.
- [x] Route actions, dialogs, exports, prints, filters, and mobile cards pass.
- [x] Dark mode and focus states pass.
- [x] Verification report contains exact evidence and residual risks.

## Success Criteria

- All plan acceptance criteria pass mechanically.
- Full UIUX suite passes without rerun-only exceptions.
- No new lint/type/build errors; existing lint warnings documented separately.
- Reviewer reports no high-priority clipping, interaction, or contract findings.

## Risk Assessment

- Long Playwright runs can expose Vite dynamic-import flakes. Use one worker,
  preserve retry diagnostics, but do not classify rerun-only success as final pass.
- Mock values may be shorter than production values. Include longest known fixtures
  and synthetic boundary values in unit/component tests.

## Security Considerations

Use mock data only in screenshots/reports. Do not record tokens, env values, or
real customer data.

## Deliverable

reports/verification-report.md with before/current/final widths, protected-value
measurements, command results, screenshot paths, reviewer findings, docs impact,
rollback notes, residual risks, and unresolved questions.
