---
phase: 7
title: "Repair Workflow Consolidation"
status: completed
effort: "L"
priority: P2
dependencies: [5]
---

# Phase 7: Repair Workflow Consolidation

## Overview

Close the technician-workflow gap and de-duplicate the twin repair pages. Today the "technician page" (SCBH-KT) cannot do the technician's two core actions — no "my tickets" filter (no KTV field at all) and no status change anywhere on KT or detail — while the two pages fork ~850 LOC of column scaffolding for ~80% overlapping content. This phase ALSO owns the entire SCBH toolbar rework (moved out of Phase 5 — red-team SC8 flagged the double-planning).

Findings: F-C3, F-C15, F-A2, F-A12, repair column-scaffolding dup, F-B12, F-B8.

**Decision RESOLVED (Validation Session 1 — differentiate in place):** KT page stays; it gains the status-change row action and the roster-gated "Phiếu của tôi" chip; columns/status taxonomy untouched. The full COMBINE (one route + role presets, KT URL redirect) remains PARKED in plan.md's deferred follow-ups — do not start it.
<!-- Updated: Validation Session 1 - OQ4 resolved: differentiate in place -->>

## Requirements

- Functional (default path): technician can (a) reach their own tickets in one click on KT, (b) change status from KT rows AND from the detail header. Bulk/print actions grouped sanely on SCBH; breadcrumb leaf = sidebar label.
- Non-functional: one shared column-scaffolding module (label arrays, meta-stack cell builders) consumed by both pages; action cells remain per-page.

## Architecture

- Shared scaffolding: `use-repair-table-columns.tsx` (437 LOC) and `use-repair-kt-columns.tsx` (415 LOC) duplicate identical label arrays, META_LABEL_CLASS, and group/cell builders. Extract `src/features/repair-shared/` (labels, group builders, meta-stack cells); keep per-page action-column modules.
- Status change: lift the main list's "Đổi tình trạng" dialog into `repair-shared`; mount as KT row action + detail-page header button. Canonical 15-status module untouched.
- **My-tickets (red-team corrected — no broken default):** the only session identity is the mock admin `'Nguyễn Quản Trị'` (`current-user-mock.ts:20-24`), which matches ZERO tickets — `kyThuat` values come exclusively from the 12-name TECHNICIANS pool. A default-on filter would ship an empty-by-default page. Revised spec: add the "Kỹ thuật" field to the KT filter panel + a one-click "Phiếu của tôi" preset CHIP that applies `kyThuat = session user` — active only when the session identity resolves to a roster member, otherwise the chip is disabled with tooltip "Tài khoản chưa gắn kỹ thuật viên". Default view = unfiltered (current behavior). Real identity mapping arrives with 260707-1612 phase 2; the chip is forward-compatible. The "saved-view mechanism" mentioned by the panel does NOT exist (only an unused `savedViewsSlot` prop) — no persistence work here; the chip is stateless.
- SCBH toolbar (owns it fully; Phase 5 provides only generic PageHeader/BulkActionsBar organisms): "Lập phiếu" → PageHeader primary slot; five "In…" functions → the EXISTING `print-menu.tsx` shared component (currently Gallery-only — adopt, don't reinvent a split-button); "Xóa"/"Chuyển chi nhánh" → `BulkActionsBar` (already rendered at RepairListPage.tsx:239 — extend, don't duplicate) appearing only with selection; drop "Tải lại trang"; KT's duplicated totals row deduped.
- Detail page: create-form submit feedback (F-B8: failed submit → toast "N lỗi cần sửa" + scroll/focus first invalid field); read-only "Sửa gấp" checkbox → static badge or `disabled` (F-B12).
- Breadcrumb: KT leaf renamed to match sidebar ("Sửa Chữa-Bảo Hành KT").

## Related Code Files

- Create: `src/features/repair-shared/` (column labels, group builders, meta cells, status-change dialog export)
- Modify: `src/features/repair-list/hooks/use-repair-table-columns.tsx`, `src/features/repair-kt/hooks/use-repair-kt-columns.tsx` (consume shared module; action columns stay local)
- Modify: KT filter panel component (add Kỹ thuật field + "Phiếu của tôi" chip with roster-membership gating)
- Modify: repair detail page (status-change header action; Sửa gấp render)
- Modify: `src/features/repair-list/` toolbar (`repair-batch-toolbar.tsx`: PrintMenu adoption, BulkActionsBar-gated bulk actions, header primary action, drop reload); KT totals dedup
- Modify: `src/features/repair-create/` submit feedback (error-count toast + scroll-to-first-error)
- Modify: breadcrumb/label constants for KT leaf
- Stretch (gated): route-level preset merge + `/sua-chua-bao-hanh-kt` redirect

## Implementation Steps

1. Extract repair-shared scaffolding; both pages consume. Verification: existing unit/e2e suites + the phase-final `test:e2e:uiux` run (no separate intra-phase screenshot gate — red-team SC10); visible diffs called out in PR.
2. Status-change dialog shared; mount on KT rows + detail header; visibility follows the same rule as the main list's row action (no permission enforcement exists yet — pointer for 260707-1612 phase 2).
3. KT "Kỹ thuật" filter + "Phiếu của tôi" chip (roster-gated, stateless); e2e: chip disabled state for the mock admin + chip applies filter when a roster identity is stubbed.
4. SCBH toolbar regroup (PrintMenu, BulkActionsBar, header action, drop reload); KT totals dedup.
5. Create-form submit feedback; Sửa gấp static render.
6. Breadcrumb alignment.
7. (Gated stretch) preset merge + redirect if user approves post-parity-decision.

## Success Criteria

- [x] With a roster-member identity (test stub), KT → "Phiếu của tôi" → status change = ≤3 clicks, no page switch (e2e); with the mock admin, chip is visibly disabled with tooltip, list unfiltered.
- [x] Status change available from KT row and detail header; updates reflect in both lists.
- [x] Shared scaffolding module consumed by both pages; duplicated label arrays deleted.
- [x] SCBH toolbar: 1 primary + PrintMenu + selection-gated BulkActionsBar; zero-selection state shows no bulk buttons; KT totals appear once.
- [x] Failed create-submit shows error-count toast and focuses first invalid field.
- [x] Existing repair e2e suites green; phase-final uiux run green.

## Risk Assessment

- Legacy-parity constraint (README: taxonomy verbatim) → default path changes chrome/actions, NOT columns/status taxonomy; 15-status module untouched.
- Extracting 850 LOC of column code risks subtle visual regressions → phase-final uiux screenshots diffed in PR review; no behavior changes in the same commit as the extraction.
- "Phiếu của tôi" ships partially inert (disabled for the only real identity) until real identity lands — deliberate: an honest disabled chip beats an empty-by-default page; e2e covers both states.
