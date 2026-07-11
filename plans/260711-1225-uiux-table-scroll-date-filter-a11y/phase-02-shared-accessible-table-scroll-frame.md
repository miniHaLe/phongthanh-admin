---
phase: 2
title: Shared Accessible Table Scroll Frame
status: completed
priority: P1
dependencies:
  - 1
---

# Phase 2: Shared Accessible Table Scroll Frame

## Overview

Put wide tables inside one bounded, accessible scroll frame with non-trackpad
controls. This creates the shared contract used by all affected table pages.

## Requirements

- Functional: Wide table content scrolls horizontally inside its own frame.
- Functional: Mouse users can scroll with visible left/right icon controls.
- Functional: Keyboard users can focus the scroll frame and move horizontally.
- Non-functional: Desktop density remains compact; controls do not cover table
  text or resize rows.

## Architecture

Recommended minimal design:

- Extend `DataTable` with an inner content width prop such as `tableClassName`
  or `contentClassName`.
- Render min-width on the `<Table>` or inner content wrapper, never on the
  outer route container.
- Wrap the scrollable viewport in a `role="region"`/`tabIndex={0}` container
  with a route/table-specific accessible label.
- Add small icon-only scroll buttons using lucide `ChevronLeft`/`ChevronRight`
  when horizontal overflow exists. Use `aria-label` and Tooltip if existing
  tooltip primitives are already available.
- Use ResizeObserver or scroll measurements to enable/disable controls without
  layout shift.
- Keep visual styling restrained: border, existing card surface, 8px radius,
  no decorative gradient/orb/card nesting.

Do not rely only on hidden browser scrollbars. The user explicitly cannot scroll
some tables without a trackpad.

## Related Code Files

- Modify: `src/components/shared/data-table/data-table.tsx`
- Modify: `src/components/shared/data-table/data-table.test.tsx`
- Modify: `src/components/shared/index.ts` only if a new shared scroll frame is
  exported separately
- Optional create: `src/components/shared/data-table/table-scroll-frame.tsx`
- Optional create: `src/components/shared/data-table/table-scroll-frame.test.tsx`

## Tests Before

- Add Vitest/Testing Library coverage for the new scroll frame or extended
  `DataTable` props before implementation:
  - accessible region label is rendered
  - scroll buttons render only when configured/overflowing
  - button clicks call `scrollBy` or update scroll position
  - disabled state reflects left/right scroll bounds

## Implementation Steps

1. Add the narrowest shared API:
   `tableClassName?: string`, `scrollLabel?: string`, and optional scroll
   controls if needed. Avoid a second table primitive unless it removes real
   duplication.
2. Move `overflow-x-auto` responsibility into the shared table frame.
3. Add keyboard handling for horizontal movement:
   `ArrowLeft`, `ArrowRight`, `Home`, `End` when the scroll frame has focus.
4. Add visible controls outside table cells so controls do not obscure column
   text. Keep controls at least `44x44` on mobile.
5. Add `data-table-scroll-frame` or similar stable test selector.
6. Preserve loading, empty, error, sorting, selection, row click, pagination, and
   toolbar behavior.
7. Verify screen-reader names are specific enough, e.g. "Bảng thu chi" or the
   page/table title passed by route.

## Tests After

- Extend `DataTable` tests for loading/error/empty states to ensure the wrapper
  does not break colspan or sticky header behavior.
- Run focused component tests for the shared data-table area.

## Regression Gate

```bash
npm run test -- --run src/components/shared/data-table/data-table.test.tsx
npm run type-check
```

## Success Criteria

- [ ] `DataTable` supports inner table min-width without page-level overflow.
- [ ] Scroll frame is keyboard focusable and named.
- [ ] Visible scroll controls work with mouse/touch and meet mobile target size.
- [ ] Existing table states and selection/sorting behavior unchanged.
- [ ] No global shell overflow policy change used as the primary fix.

## Risk Assessment

- Risk: scroll controls add visual clutter to dense admin tables. Mitigate with
  compact icon buttons, disabled states, and only show when horizontal overflow
  exists.
- Risk: new wrapper breaks sticky headers or table semantics. Mitigate by keeping
  semantic `<table>` unchanged inside the scroll viewport.
