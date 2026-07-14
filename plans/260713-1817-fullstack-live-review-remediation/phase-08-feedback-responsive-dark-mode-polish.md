---
phase: 8
title: "Feedback Responsive & Dark-Mode Polish"
status: in-progress
effort: "M"
priority: P3
dependencies: [5, 6, 7]
---

# Phase 8: Feedback Responsive & Dark-Mode Polish

## Overview

Final sweep over feedback states, mobile, dark mode, data-viz and remaining stranded findings — last because Phases 5-7 change the surfaces it polishes. Every LIVE-ONLY finding in this phase consumes Phase 1's re-verification list; items that didn't reproduce against the fresh deploy are closed without code changes.

Scope trim (red-team SC9): login masthead (F-A22, Low, pure branding) CUT — parked in plan.md follow-ups.

Findings: F-B14, F-B4 (re-scoped), F-B5 (decision-gated), F-B15, F-A6/F-C12, F-A14, F-A16, F-A17, F-A18, F-A19, F-A21, F-C13.

## Requirements

- Functional: loading skeletons on real-API tables + refetch indicator; popup-blocked print gives feedback; branch switch visibly scopes customer data with feedback (validated decision — real scoping); charts never render bare axis frames; mobile keeps branch access and no horizontal clipping.
- Non-functional: dark mode has zero hard-coded light-value leaks on badges/dots/scrollbars/icon tiles.

## Architecture & Scope

- **Loading**: skeleton rows on initial load; dimmed-table + spinner on refetch (TanStack `isFetching`) — DataTable-level, so all pages inherit.
- **Print (red-team re-scoped — the "non-conforming caller" is a ghost):** exhaustive grep shows ALL 13 print call sites already route through `openPrintWindow`; `document.write`/`window.print` exist only inside the helper. The live F-B4 symptom cannot be produced by HEAD — it was a stale-bundle artifact (deploy provenance was broken pre-Phase-1) or a Playwright page-handle artifact. Work here: (1) confirm F-B4 absent from Phase 1's re-verification list; (2) fix the REAL gap — `print-window.tsx:44` returns `null` silently when the popup is blocked → add an error toast/fallback so the user isn't left with a dead click.
- **Branch selector (Validation Session 1 — REAL SCOPING variant selected; branch rule = creator's branch):** selector → khach-hang query param → refetch + loading state + active-branch label in the list header + toast on switch. Admin JWT covering all branches sees the union under "Tất cả chi nhánh" and filters when a branch is picked. Also feeds the Bán hàng branchId fix from Phase 2 (editor stamps active branch).
<!-- Updated: Validation Session 1 - OQ1 resolved: real scoping -->>
- **Ward combobox** (F-B15): keep reverse-sync; province emphasized in option subtitle + type-ahead scoping.
- **KPI negatives** (F-A6/F-C12): negative-state styling (red accent + icon) + `tabular-nums` + no mid-number wrap (abbreviate "−2,99 tỷ" on mobile); reconcile Tồn kho quantity vs Bán hàng cap from one availability source or clamp mock seeds to non-negative.
- **Charts** (F-A14): feed báo-cáo charts from the same dataset as their tables; chronological x-axis; standard in-chart empty state.
- **Mobile**: date-range stacks vertically <md (F-A16); Khách Hàng reuses the existing `RepairMobileCards` pattern <md (F-A17 — component exists, adopt not fork); branch selector into mobile drawer header (F-A18); status-legend behind disclosure on mobile.
- **Dark mode** (F-A19): badge/dot colors through semantic tokens with dark variants (StatusBadge from Phase 5 makes this one map); scrollbar theming (`scrollbar-color` + webkit); icon-tile pastel dark equivalents.
- **Misc**: STT from row index after sort (F-A21); receipt customer field → shared customer combobox with khách-lẻ free-text fallback (F-C13).

## Related Code Files

- Modify: `src/components/shared/data-table/data-table.tsx` (skeleton + isFetching states, STT-from-index option)
- Modify: `src/components/print/print-window.tsx` (44 — popup-blocked feedback)
- Modify: header branch selector (`src/components/shared/branch-switcher.tsx`) + khach-hang query wiring (real scoping — validated)
- Modify: `src/features/customer/customer-form.tsx` (ward scoping emphasis)
- Modify: `src/components/shared/stat-card.tsx` (negative state, tabular-nums, wrap guards) + warehouse mock seeds or availability source
- Modify: `src/pages/bao-cao/` chart components (dataset, axis sort, empty state)
- Modify: responsive: SCBH filter stack, KhachHang mobile cards (adopt RepairMobileCards contract), mobile drawer branch selector
- Modify: `src/index.css` / `tailwind.config.ts` + StatusBadge tokens (dark variants, scrollbar theming)
- Modify: `src/pages/tai-chinh/` receipt modal (shared customer picker)

## Implementation Steps

1. DataTable loading/refetch states (inherited app-wide).
2. Print: verify F-B4 closure from Phase 1 list; popup-blocked toast + unit test.
3. Branch-selector resolution per decided semantics.
4. KPI negative styling + availability reconciliation; chart data/axis/empty fixes.
5. Mobile sweep (viewport e2e at 390x844: no horizontal clip, cards on KhachHang, branch in drawer).
6. Dark-mode token sweep (screenshot diff on 4 dark pages).
7. Misc: STT, receipt picker, ward emphasis.

## Success Criteria

- [x] Cold-load /khach-hang shows skeletons; sort/filter shows refetch indicator.
- [x] Popup-blocked print shows an error toast; normal print returns to intact app (already true on HEAD — regression test).
- [x] Branch switching visibly scopes the customer list (refetch + label + toast) — no silent no-op.
- [x] No bare axis-frame charts; x-axes chronological.
- [x] 390px sweep: no horizontal clipping; Khách Hàng renders cards; branch reachable.
- [ ] Dark mode: no hard-coded light fills on badges/dots/scrollbars (screenshot evidence).
- [x] `npm run test:e2e:uiux` full matrix green.

## Risk Assessment

- Branch-selector work is decision-blocked → schedule last within phase; both outcomes are small.
- Mobile card pattern reuses the existing RepairMobileCards contract — do not fork it.
- Chart rework touches recharts configs only — keep report table as source of truth to avoid double-computing aggregates.
