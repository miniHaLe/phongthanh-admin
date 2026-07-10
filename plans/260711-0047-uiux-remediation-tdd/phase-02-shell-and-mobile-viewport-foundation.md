---
phase: 2
title: Shell and Mobile Viewport Foundation
status: completed
priority: P1
dependencies:
  - 1
---

# Phase 2: Shell and Mobile Viewport Foundation

## Overview

Fix app-level mobile layout so primary content, footer, drawers, and floating actions stop competing for the same vertical space.

## Requirements

- Functional: mobile routes scroll normally; footer never obscures active controls; drawer/topbar remain reachable; dashboard and repair list no longer appear trapped behind fixed chrome.
- Non-functional: keep desktop shell density; support dynamic mobile viewport units and safe-area inset; no page-specific hacks unless the shell cannot solve it.

## Architecture

Change shell layout first because page fixes cannot be trusted while the viewport container and footer behavior are wrong. Prefer `min-h-dvh`, explicit scroll containers, and mobile footer stacking/hiding rules over absolute positioning.

## Related Code Files

- Modify: `src/components/shell/AppShell.tsx`
- Modify: `src/components/shell/AppFooter.tsx`
- Modify: `src/components/shell/TopBar.tsx`
- Modify: `src/components/shell/SidebarDrawer.tsx`
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/features/repair-list/RepairListPage.tsx`
- Modify: `src/components/shared/QuickLapPhieuButton.tsx` or actual FAB owner if different
- Modify: `tests/e2e/uiux-runtime.spec.ts`

## Tests Before

1. Add failing Playwright assertions at `375x812`, `480x854`, and `854x480`:
   - visible footer does not overlap focusable elements
   - bottom FAB has safe offset from footer/safe area
   - mobile drawer open/close controls meet hit target and stay visible
   - main content scrolls to bottom without hiding final controls
2. Add route snapshots for `/trang-chu` and `/sua-chua-bao-hanh`.

## Refactor

1. Replace `h-screen overflow-hidden` shell assumptions with dynamic viewport-safe layout.
2. Ensure `main` owns scroll and has responsive bottom padding when footer or FAB exists.
3. Make footer wrap/stack or collapse secondary text on small screens.
4. Keep topbar/drawer controls in stable dimensions; avoid header text overlap.

## Tests After

1. Run focused e2e shell specs.
2. Run `npm run test:e2e:uiux`.
3. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Inventory shell elements that can occupy bottom/top viewport space.
2. Add tests that fail on current screenshots.
3. Apply shell layout fix.
4. Verify dashboard and repair list on mobile portrait/landscape.
5. Remove Phase 1 known failures resolved by this phase.

## Success Criteria

- [x] No footer overlap or obscured primary controls on mobile route smoke tests.
- [x] Mobile drawer, command palette trigger, and topbar menus remain reachable.
- [x] Dashboard mobile screenshot no longer shows KPI/content compressed against footer.
- [x] Repair list mobile screenshot has usable vertical scroll and visible controls.

## Risk Assessment

- Risk: shell changes affect every route. Mitigation: run full route smoke after focused tests.
- Risk: footer hiding removes useful version/copyright info. Mitigation: keep info accessible on desktop and compact/mobile-safe on small screens.
