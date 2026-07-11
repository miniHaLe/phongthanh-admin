# Verification Report — Responsive Table Grouped Composition Recovery

Date: 2026-07-11
Status: PASS — plan completed

## Result

Shared content-safe `DataTable` behavior and eight composite routes pass the
required type, lint, unit, build, browser, workflow, width, protected-value, and
review gates. No failed or skipped full-UIUX tests.

## Before / Current / Final Width Evidence

| State | Scope | Width evidence (`scrollWidth/clientWidth`) | Result |
|---|---|---:|---|
| Before | Fixed width-only prototype used as review baseline | 1582/1582 | Frame fit, but protected document, serial, date, model, and currency values clipped. |
| Current | Final eight-route composite assertion matrix | `scrollWidth <= clientWidth + 1` on 8/8 routes | All route assertions pass; exact individual pairs were not supplied separately. |
| Final | Representative repair, repair-KT, and finance tables | 1582/1582 each | Frame fit with 0 protected-value failures. |

The final browser contract separately asserts each visible
`data-table-protected` element has `scrollWidth <= clientWidth + 1`. Synthetic
overlength protected content remains fully visible and expands only the bounded
table scroll frame.

## Command Results

| Gate | Result | Evidence |
|---|---|---|
| `npm run type-check` | PASS | 10.41s |
| `npm run lint` | PASS | 0.13s; 0 errors, 111 warnings: 110 `only-export-components`, 1 `exhaustive-deps` |
| `npm run test` | PASS | 134/134 files; 481/481 tests |
| Focused Playwright hard gates | PASS | 19/19 |
| Full `npm run test:e2e:uiux` | PASS | 222/222; 0 failed; 0 skipped; 586.17s |
| `npm run build` | PASS | Standard build completed |
| `env VITE_REAL_RESOURCES=khach-hang npm run build:prod` | PASS | Production resource guard and build completed |

## Browser And Workflow Coverage

- 8/8 composite-route fit assertions pass at the contracted 1920x1080 frame.
- Expanded and collapsed sidebar states pass; representative final width is
  1582/1582.
- Protected values, synthetic overlength scrolling, and 44px touch targets pass.
- Visibility migration/reset, density, sort-only and composite sorting,
  selection, pagination, filters, exports, actions, dialogs, prints, repair
  mobile cards, keyboard scrolling, dark mode, and focus coverage pass.

## Screenshots

- Path: `plans/260711-1527-responsive-table-1080p-fit/reports/screenshots/`
- Count: 95 PNG screenshots.
- Includes repair, repair-KT, finance, warehouse, stock-out, and shared runtime
  route captures across phone, tablet/landscape, desktop, and 4K profiles.

## Reviewer Findings And Resolution

- Stage 1 code review: PASS, 9/10.
- No side effects or public-contract regressions reported.
- Review-baseline defect: blanket fit-cell clipping hid protected values even at
  1582/1582 frame fit.
- Resolution: content-safe shared primitives, explicit descriptive clamping,
  sort-only/composite sorting, persisted repair visibility migration, bounded
  overlength scrolling, and browser-level protected-value assertions.
- Final evidence: 0 protected-value failures and all 8 route assertions pass.

## Docs Impact

Minor. Updated `docs/codebase-summary.md` with the content-safe/composite table
architecture and verification contracts. Updated `README.md` with the current
UIUX screenshot output path.

## Rollback Notes

- Composite definitions remain route-local; shared `DataTable` support is opt-in.
- Existing table IDs and density state remain stable; repair visibility uses the
  versioned migration and dormant affected order state is cleared.
- `tableClassName` and optional `tableMinWidth` compatibility remain available.
- If a route-specific data budget regresses, revert that route to its prior
  scrollable composition while keeping the shared bounded-scroll contract.

## Residual Risks

- Lint remains green with 111 warnings; warnings are not resolved by this plan.
- Production values may exceed known fixtures. The synthetic overlength gate
  verifies safe bounded scrolling, but future domain shapes still need the same
  protected-value contract.
- Exact final width pairs were supplied only for representative repair,
  repair-KT, and finance tables; the remaining routes are evidenced by passing
  fit assertions rather than separately recorded numeric pairs.

## Unresolved Questions

None.
