---
date: 2026-07-11
session: responsive-composite-table-recovery
plan: plans/260711-1527-responsive-table-1080p-fit/plan.md
status: completed
---

# Responsive Composite Table Recovery

## Context

Recovered the 1080p table-fit work after review proved fixed-width clipping hid
document numbers, serials, dates, models, and currency despite 1582/1582 frame
measurements. Scope: shared table contract plus repair, repair-KT, warehouse, and
finance compositions.

## What Happened

- Replaced blanket fixed-cell clipping with content-safe composite groups; all
  displayed fields remain available while the visible column count shrank.
- Split values by contract: identifiers, phones, serials, dates, quantities, and
  currency are protected; descriptive prose alone may clamp with full text kept.
- Preserved legacy sorting through hidden sort-only targets and per-group menus.
- Kept the repair table ID stable; migrated legacy visibility keys to group keys,
  preserved density, and cleared dormant replaced order entries.
- Changed metadata grids to `max-content minmax(min-content, 1fr)` after browser
  evidence showed `minmax(0, 1fr)` could compress protected content.
- Pinned E2E `Math.random` to avoid intentional mock failures obscuring UI gates.
- Verified finance printing through a real popup handle; opener is nulled after
  opening while the Chromium document remains usable.
- Verification passed: 481/481 unit tests, 222/222 UIUX tests, type-check, lint,
  standard build, and guarded production build. Review: 9/10, no side effects or
  public-contract regressions. Lint warnings remain non-blocking.

## Reflection

Frame fit was weak evidence: a table can measure perfectly while values inside
cells are already lost. Browser-level content measurements and synthetic
overlength cases produced the useful contract. Composite groups reduced width
without deleting operational data or weakening workflows.

## Decisions

| Decision | Rationale | Impact |
|---|---|---|
| Content-safe composite groups | Fixed clipping passed width checks but lost data | Normal data fits 1080p; exceptional protected values scroll inside the table frame |
| Protected vs descriptive rendering | Operational tokens and prose have different failure modes | Protected values never clip; descriptions clamp deliberately |
| Hidden sort targets + stable state migration | Visible consolidation must not break legacy behavior or preferences | Sort fields remain selectable; repair density and visibility survive upgrade |
| Browser-backed `minmax(min-content, 1fr)` grid | Zero minimum allowed unsafe compression | Composite values retain intrinsic safe width |
| Deterministic E2E mock randomness | Random mock errors made UI evidence flaky | Runtime audits test layout/workflows consistently |
| Real print popup with nulled opener | Stubbed print checks missed browser behavior; opener isolation still required | Finance print contract verified end to end without tabnabbing link |

## Next

- Keep protected-value and bounded-scroll gates for future composite routes and
  production-shaped fixtures.
- Address 111 existing lint warnings separately; current lint gate has 0 errors.
- No commit created: this workspace has no Git metadata.

## Unresolved Questions

- Which canonical Git workspace should receive this completed recovery and journal?
