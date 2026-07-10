---
phase: 5
title: Large Screen Dashboard Scaling
status: completed
priority: P2
dependencies:
  - 1
---

# Phase 5: Large Screen Dashboard Scaling

## Overview

Give 2560px and 3840px displays a deliberate dashboard composition instead of stretched small-screen density.

## Requirements

- Functional: dashboard KPI tiles, charts, low-stock panel, calendar/plans, and page rhythm scale or cap cleanly from 1080p to 4K.
- Non-functional: no decorative hero/marketing layout; keep operational admin density and scanning speed.

## Architecture

Use a constrained large-screen content shell plus responsive dashboard grid tracks. Avoid global zoom. Scale dashboard-specific spacing, tile min heights, chart containers, and row composition with explicit breakpoints.

## Related Code Files

- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/components/dashboard/WorkQueueTiles.tsx`
- Modify: `src/components/dashboard/WorkQueueTile.tsx`
- Modify: `src/components/dashboard/StatusDistributionChart.tsx`
- Modify: `src/components/dashboard/PlanCalendar.tsx`
- Modify: `src/components/shared/PageHeader.tsx` only if needed for width alignment
- Modify: `src/pages/DashboardPage.test.tsx`
- Modify: `src/components/dashboard/WorkQueueTiles.test.tsx`
- Modify: `tests/e2e/uiux-runtime.spec.ts`

## Tests Before

1. Add Playwright metrics at `1920x1080`, `2560x1440`, and `3840x2160`:
   - dashboard content max width is intentional
   - KPI tiles are not tiny relative to viewport
   - charts have stable dimensions
   - no huge empty dashboard row caused by bad grid spans
2. Add component tests for WorkQueueTiles responsive class contracts where meaningful.

## Refactor

1. Add dashboard page inner width and grid rules.
2. Adjust WorkQueueTiles to avoid cramped two-column mobile and sparse 4K rows.
3. Give chart/card regions stable min heights and responsive layout spans.
4. Review 4K screenshots for visual balance and text readability.

## Tests After

1. Run focused dashboard tests.
2. Run `npm run test:e2e:uiux` large-screen project.
3. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Write failing large-screen metrics.
2. Refactor dashboard layout and KPI/chart sizing.
3. Capture 1366, 1920, 2560, and 3840 screenshots.
4. Keep color/style restrained; no one-note gradient/orb decoration.
5. Remove dashboard 4K known failures from baseline list.

## Success Criteria

- [x] `dashboard-desktop-4k` no longer reads as underscaled 1080p UI on a 3840px canvas.
- [x] 1366px and 1920px layouts remain dense and usable.
- [x] KPI labels/trends fit without awkward truncation on mobile and large desktop.
- [x] Charts and cards have stable dimensions with no layout jumps.

## Risk Assessment

- Risk: a large-screen cap may feel too narrow on 4K. Mitigation: use a generous operational max width and dashboard-specific multi-column composition.
- Risk: scaling typography globally can harm table density. Mitigation: keep changes dashboard-local unless a shared page container is clearly needed.
