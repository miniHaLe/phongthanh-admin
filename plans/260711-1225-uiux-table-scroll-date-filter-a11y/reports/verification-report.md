# Test Report — 2026-07-11 — UIUX table scroll/date filters

## Test Results Overview
- **Focused UIUX**: 131 passed, 0 failed (`table-heavy|date filters`)
- **Full UIUX**: 172 passed, 0 failed; final rerun after strict console-gate tightening and ArrowLeft/ArrowRight table-scroll coverage
- **Unit/Component**: 456 passed, 0 failed across 129 files
- **API with DB**: 29 passed, 0 failed

## UI Test Results
- **Responsive matrix**: 375, 480, 854x480, 768, 1366, 1920, 2560, 3840
- **Table routes**: repair-KT, finance thu-chi, warehouse inventory/returns/usage, stock-out pages
- **Date routes**: thu-chi, cong-no, warehouse return/usage, stock-out filters
- **Screenshots**: `plans/reports/260711-uiux-remediation-verification/screenshots/`
- **Accessibility**: focusable table scroll frame, labelled scroll region, visible left/right controls, keyboard Home/End/ArrowLeft/ArrowRight scroll, mobile touch/font checks below `md`
- **Dev-server note**: Playwright uses `CHOKIDAR_USEPOLLING=1`; `gotoProtectedRoute` now scopes the known local Vite route-load retry to a failed navigation attempt, while `expectNoConsoleProblems` stays strict for later dynamic-import/network errors. Final run observed one scoped local Vite retry, then product assertions passed.

## Build Status
- `npm run type-check`: PASS after final helper and ArrowLeft/ArrowRight assertion changes
- `npm run lint`: PASS exit 0 after helper tightening; existing warnings remain Fast Refresh `only-export-components` and one `react-hooks/exhaustive-deps`
- `npm run test`: PASS, 456 tests
- `CHOKIDAR_USEPOLLING=1 npm run test:e2e:uiux -- --grep "table-heavy|date filters"`: PASS, 131 tests
- `CHOKIDAR_USEPOLLING=1 npm run test:e2e:uiux`: PASS, 172 tests after final helper and ArrowLeft/ArrowRight assertion changes
- `npm run build`: PASS
- `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`: PASS
- `npm run test:api:with-db`: PASS; API lint/build/Jest pass, 29 tests

## Coverage Metrics
| Metric | Value | Threshold | Status |
|---|---:|---:|---|
| UI route matrix | 172 Playwright tests | Required affected viewports | PASS |
| Unit/component | 456 Vitest tests | Existing suite | PASS |
| API integration | 29 Jest tests | Existing DB suite | PASS |

## Critical Issues
- None open.

## Review Follow-up
- Addressed code-review concern: dynamic-import and `ERR_NETWORK_CHANGED`
  console problems are no longer filtered globally. Only a failed first
  navigation attempt may discard its own known Vite route-load messages before
  retrying.
- Closed residual keyboard coverage gap: table-scroll e2e now asserts
  ArrowLeft/ArrowRight in addition to scroll buttons and Home/End.

## Recommendations
- Keep `DataTable` as the only wide-table scroll owner; avoid page-level `min-w[...]` wrappers under `AppShell`.
- If Vite route-load noise increases, prefer serving built assets for visual smoke or serializing the long UIUX matrix in CI.

## Docs Impact
- Minor: plan/report updated. No user setup, API, or architecture docs changed.

## Unresolved Questions
- None.
