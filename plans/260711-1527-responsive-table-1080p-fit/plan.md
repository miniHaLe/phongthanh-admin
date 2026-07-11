---
title: Responsive Table Grouped Composition Recovery
description: >-
  Replace width-only table fitting with composite metadata columns that keep
  every operational value visible at 1920x1080 and scroll safely below it.
status: completed
priority: P1
branch: ''
tags:
  - frontend
  - uiux
  - accessibility
  - responsive
  - refactor
blockedBy: []
blocks: []
created: '2026-07-11T15:27:00+07:00'
updated: '2026-07-11T20:19:59+07:00'
createdBy: ck:cook
source: skill
revision: grouped-composite-columns
---

# Responsive Table Grouped Composition Recovery

## Overview

Revise the current width-only prototype after review found clipped document
numbers, serials, dates, models, and currency. Use fewer visible composite
columns, but preserve every displayed field, action, filter, export field, sort
target, API contract, and workflow.

## Verified Starting Point

- Current prototype fits all eight changed routes at 1582px / 1582px inside
  the expanded-sidebar 1920x1080 frame.
- Type-check, 459 unit tests, standard build, and production guarded build pass.
- Review found protected values clipped by blanket fit-cell overflow-hidden.
- Table matrix reached 163 passes; six mobile date-filter cases failed because
  sortable header controls were narrower than 44px.
- This revision intentionally supersedes the old no-columns-removed rule:
  visible column count may shrink through composite cells; displayed data may not.

## Design Contract

- Maximum default/reset inner-table composition: 1560px.
- DataTable remains the sole horizontal scroll owner.
- Protected values use data-table-protected: identifiers, phone, serial, stock
  code, dates, quantities, and currency never wrap, clip, or ellipsize.
- Composite tables use content-safe auto layout: normal domain values fit the
  1560px budget; unexpected overlength protected values expand only the inner
  table and trigger bounded frame scrolling instead of clipping.
- Descriptive values may clamp to two lines with full text via title, tooltip,
  detail navigation, or dialog.
- Composite cells use a two-column label/value grid; no card conversion.
- Primary text stays 14px; secondary/status 12px; headers 13px minimum.
- Composite columns preserve legacy sort targets through hidden sort-only columns
  and an accessible per-group header sort menu when one visible group owns
  multiple sort fields.
- Where column configuration already exists, visibility operates at composite-group
  level. Existing table IDs stay stable; a Zustand persist migration translates
  old repair visibility keys to composite groups, preserves density, and clears
  dormant affected column-order entries.
- Exports keep their current field-level columns and payload shape.

## Target Visible Groups

| Route family | Composite groups |
|---|---|
| Repair / repair-KT | Select, status, actions, ticket refs, customer, product, assignment, cost, timeline, notes, receiver |
| Stock / confirmed stock | Index/actions, location, item identity, opening, movement, closing, period/serial |
| Issued parts | Status/actions, voucher refs, item identity, location, assignment, issue, delivery, recovery, detail |
| Returned parts | Select/index, status/action, item identity, voucher refs, assignment, created, approved |
| Confirmed returned parts | Select/index, status/tracking, voucher refs, item/location, assignment, recovery, quantity, created |
| Finance | Select, status/type, document refs, party, amount, content, created, collected, print |

## Phases

| Phase | Name | Status |
|---|---|---|
| 1 | [Protected Value And Composite Contract](./phase-01-baseline-and-shared-contract.md) | Completed |
| 2 | [Repair Composite Composition](./phase-02-repair-table-composition.md) | Completed |
| 3 | [Inventory And Finance Composite Composition](./phase-03-wide-inventory-and-finance-tables.md) | Completed |
| 4 | [Cross-Resolution And Workflow Verification](./phase-04-cross-resolution-verification.md) | Completed |

## Acceptance Criteria

- Every changed route with supported domain-length values satisfies
  scrollWidth <= clientWidth + 1 at 1920x1080, expanded and collapsed sidebar,
  default/reset state.
- Every visible data-table-protected element satisfies
  scrollWidth <= clientWidth + 1; no protected value relies on clipping/title.
- At narrower widths, only the table frame overflows; Home/End, arrows, and
  visible scroll buttons reach both edges.
- Synthetic overlength protected values may overflow only the table frame; they
  remain fully visible after horizontal scrolling.
- Sort options, existing group visibility/reset controls, density, selection,
  pagination, filters, exports, row actions, dialogs, and repair mobile cards remain usable.
- Mobile interactive targets, including sortable headers, are at least 44px.
- Status and action labels use at most two deliberate lines; no word-by-word split.
- Type-check, lint, unit tests, focused Playwright, full UIUX Playwright, standard
  build, and production guarded build pass.

## Out Of Scope

- Backend, schema, API, export payload, or filter-contract changes.
- Removing displayed data or auto-hiding fields by viewport.
- Cards for desktop tables, typography-family changes, or application zoom.
- General redesign of already-fitting routes beyond shared regression safety.

## Dependencies

- Existing DataTable scroll, density, visibility, and keyboard behavior.
- Existing route column definitions and export mappings.
- Existing Playwright authentication and viewport harness.

## Rollback

- Keep composite definitions route-local and DataTable support opt-in.
- Keep existing table IDs and use a versioned Zustand persist migration for
  repair visibility keys; preserve density and ignore dormant order behavior.
- Retain tableClassName and optional tableMinWidth compatibility.
- If a route cannot satisfy protected-value fit, revert only that route to its
  prior scrollable composition and report the unresolved budget conflict.

## Unresolved Questions

None. User selected grouped/composite composition with displayed data preserved.


## Validation Log

- Tier: Standard (four phases).
- Existing paths checked: shared DataTable/state/config, repair hooks/pages,
  warehouse column modules/pages, finance page, E2E helpers/specs.
- Planned create paths stay under the existing shared data-table module.
- Contract verification: only repair currently exposes column configuration;
  this plan preserves that capability without adding unrelated controls elsewhere.
- Decision deltas checked: column consolidation allowed, displayed data retained,
  protected clipping forbidden, sort targets retained, full UIUX rerun required.
- Whole-plan consistency sweep: five files reread, zero stale no-column-removal
  constraints, zero unresolved contradictions.

### Initial Verification Results — 2026-07-11

Superseded by the post-decision verification in Validation Session 1.

- Claims checked: 40
- Verified: 34 | Failed: 2 | Unverified: 4
- Tier: Standard (Fact Checker + Contract Verifier)
- Verified paths: all existing source/test files cited by the four phases exist;
  planned create paths have valid parent modules.
- Verified contracts: `DataTable` owns scroll/sort rendering, repair owns the
  only explicit column configuration, repair sorting is controlled by legacy
  column IDs, warehouse/finance sorting currently derives from accessor columns,
  and exports/actions live outside visible column composition.
- Failure 1: `columnOrder` is persisted in
  `src/components/shared/data-table/use-table-state.ts:9` but is not consumed by
  `DataTable`; the plan must not claim active order migration unless it adds that
  unrelated behavior.
- Failure 2: real clipping cannot be mechanically proven by happy-dom unit tests;
  content-box `scrollWidth/clientWidth` assertions must run in Playwright. Unit
  tests can verify markers, classes, metadata, and rendering only.
- Initial unverified decisions: sort-menu location, table-state migration scope,
  overlength protected-value fallback, and composite-cell layout. All resolved in
  Validation Session 1.

### Session 1 — 2026-07-11

**Trigger:** Critical-questions validation before implementation

**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** Where should composite groups expose multiple legacy sort targets?
   - Options: Per-group header sort menu | One global table sort menu | One primary sort per group
   - **Answer:** Per-group header sort menu
   - **Rationale:** Keeps sort choice near the affected data and preserves every legacy target.
2. **[State]** How should persisted table state survive composite column IDs?
   - Options: Version repair-list only | Version every table ID | Keep IDs and migrate visibility keys
   - **Answer:** Keep IDs and migrate visibility keys
   - **Rationale:** Preserves stable table identities and user density while translating repair visibility.
3. **[Risk]** What happens when a protected value exceeds supported length budgets?
   - Options: Bounded table scrolling | Enforce domain limits | Shorten plus detail dialog
   - **Answer:** Bounded table scrolling
   - **Rationale:** Data remains fully visible; the table frame absorbs exceptional width.
4. **[UI Architecture]** How should composite metadata be arranged inside cells?
   - Options: Two-column label/value grid | Stacked list | Route-specific layouts
   - **Answer:** Two-column label/value grid
   - **Rationale:** Consistent scanning with less row height than a single stacked list.

#### Confirmed Decisions

- Sorting: per-group header menus backed by hidden legacy sort-only columns.
- State: stable table IDs plus persisted visibility migration; no new column-order feature.
- Overlength values: bounded inner-table scrolling, never clipping.
- Composite layout: shared two-column label/value grid.

#### Impact on Phases

- Phase 1: content-safe auto layout, shared grid primitive, sort menus, and Zustand migration.
- Phase 2: keep repair table ID; migrate old visibility keys to group visibility.
- Phase 3: keep warehouse/finance table IDs; no unnecessary configuration UI or ID churn.
- Phase 4: test both normal fit and synthetic overlength bounded scrolling.

### Post-Decision Verification Results

- Claims checked: 40
- Verified: 40 | Failed: 0 | Unverified: 0
- Factual corrections applied: dormant column order is not treated as a feature;
  browser clipping assertions are assigned to Playwright.
- Architecture decisions resolved: per-group sort menus, stable-ID visibility
  migration, bounded overlength scrolling, and two-column metadata grids.

### Whole-Plan Consistency Sweep

- Files reread: plan.md and all four phase files.
- Decision deltas checked: 4.
- Reconciled stale references: 2 (table-ID versioning and unit-level clipping checks).
- Unresolved contradictions: 0.

## Completion And Verification Log — 2026-07-11

- Full sync-back: 4/4 phases completed; 22/22 phase todo items checked.
- Width evidence: fixed prototype measured 1582/1582 but clipped protected
  values; final representative repair, repair-KT, and finance tables measured
  1582/1582 with 0 protected-value failures; all 8 composite-route assertions pass.
- Quality gates: type-check PASS in 10.41s; lint PASS in 0.13s with 0 errors and
  111 warnings (110 `only-export-components`, 1 `exhaustive-deps`); unit suite
  PASS, 134/134 files and 481/481 tests; standard build PASS; guarded production
  build with `VITE_REAL_RESOURCES=khach-hang` PASS.
- Browser gates: focused hard gates PASS, 19/19; full UIUX PASS, 222/222 with
  0 failed and 0 skipped in 586.17s; 95 screenshots stored under
  `reports/screenshots/`.
- Review: Stage 1 PASS, score 9/10; no side effects or public-contract regressions.
- Detailed evidence: [verification report](./reports/verification-report.md) and
  [PM completion report](./reports/pm-260711-2019-responsive-table-completion.md).
