---
phase: 4
title: Date Filter Mobile Ergonomics
status: completed
priority: P1
dependencies:
  - 1
---

# Phase 4: Date Filter Mobile Ergonomics

## Overview

Fix compact date/filter controls that override mobile-safe defaults and make date
filters hard to open, read, or trust on mobile.

## Requirements

- Functional: Date range fields in affected filters accept values and filter data.
- Functional: Filter clear/reset still restores defaults.
- Non-functional: Mobile controls use at least 16px font and 44px target height;
  desktop can stay compact with responsive `md:*` sizing.

## Architecture

Preferred small abstraction:

- Add shared filter control class helpers near `FilterPanel`, for example
  `src/components/shared/filter-panel/filter-control-classes.ts`.
- Use classes like `h-11 text-base md:h-8 md:text-sm` for inputs/select triggers
  used inside dense filter bars.
- For date range pairs, use a responsive grid/flex wrapper that gives each date
  input enough width and does not let the separator cover text.
- Keep native `input[type=date]` unless tests prove a page needs the existing
  `PeriodRangePicker` popover pattern.

## Related Code Files

- Modify: `src/components/shared/filter-panel/filter-panel.tsx` if shared layout
  helpers belong there
- Optional create: `src/components/shared/filter-panel/filter-control-classes.ts`
- Modify: `src/features/stockout/cap-linh-kien-filters.tsx`
- Modify: `src/features/stockout/ban-hang-filters.tsx`
- Modify: `src/features/stockout/chuyen-kho-filters.tsx`
- Modify: `src/features/stockout/tra-hang-filters.tsx`
- Modify: `src/features/warehouse/part-return-filters.tsx`
- Modify: `src/features/warehouse/part-return-xac-filters.tsx`
- Modify: `src/features/warehouse/issued-usage-filters.tsx`
- Modify: `src/pages/tai-chinh/ThuChiPage.tsx`
- Modify: `src/pages/tai-chinh/CongNoPage.tsx` if its date controls fail the
  broadened date smoke tests

## Tests Before

- Phase 1 mobile date/filter tests should fail on routes using `h-8 text-sm`.
- Add or update component-level tests only if introducing a shared class helper
  with meaningful behavior.

## Implementation Steps

1. Inventory all compact filter controls with:
   `rg "className=\"h-8 text-sm\"|type=\"date\"" src/features/stockout src/features/warehouse src/pages/tai-chinh`.
2. Replace repeated classes with shared responsive filter control classes.
3. Ensure `SelectTrigger` gets the same responsive sizing as text/date inputs.
4. Give date range wrappers mobile-safe layout:
   two full-width inputs on narrow screens or a grid with non-overlapping
   separator; compact inline layout only at `md` and above.
5. Verify labels/`htmlFor`/`aria-label` stay connected for date fields.
6. For finance date filters, preserve default 30-day range and date type radio
   behavior.
7. For stock-out/warehouse filters, preserve existing client-side filter keys
   (`dateFrom`, `dateTo`, and `dateType` where present).
8. If a native date input still cannot meet access requirements in testing,
   adapt the existing `PeriodRangePicker` pattern for that page only and document
   the reason in the verification report.

## Tests After

- Date fields pass mobile target/font assertions at phone-375 and phone-480.
- Filling a valid seeded date range keeps expected rows visible on affected pages.
- Clearing filters resets date fields and restores row counts/defaults.

## Regression Gate

```bash
npm run test:e2e:uiux -- --grep "date filter|mobile targets and input fonts"
npm run type-check
```

## Success Criteria

- [ ] No visible enabled mobile filter input/select/date field is under 44px high.
- [ ] No visible mobile filter input/select/date field renders below 16px font.
- [ ] Date filters focus/fill reliably and affect table results.
- [ ] Date range fields do not clip values or overlap separators at 375/480px.
- [ ] Desktop filter density remains compact and scannable.

## Risk Assessment

- Risk: changing every compact class makes desktop too tall. Mitigate with
  responsive classes that only expand before `md`.
- Risk: date filtering appears empty because seeded data is outside the chosen
  range. Mitigate tests with ranges derived from visible row dates when possible.
