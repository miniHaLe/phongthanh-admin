---
phase: 2
title: "Data-Loss & Write-Path Fixes"
status: completed
effort: "M"
priority: P1
dependencies: [1]
---

# Phase 2: Data-Loss & Write-Path Fixes

## Overview

Eliminate every path where the UI reports success while the backing store ignored or destroyed the write. Depends on Phase 1 (verifying writes requires visible rows; live-only findings re-verified against a fresh deploy).

Findings: F-D2/F-E5 (=F-B3-sibling), F-D8, F-C6, F-C9, F-C4, F-E9/F-D11, F-E11, F-B2, F-B3, F-B13, F-C14.

## Requirements

- Functional: dealer quick-create never silently loses input or lies about success; legacy `diaChi` never destroyed by a touched-but-not-replaced address; Bán hàng saved sale appears in its list; dashboard recent-tickets links resolve; bulk delete reports true outcome without a refetch storm; "Lưu & Thêm mới" preserves input on failure; phone validated like email; dialogs never close on failed submit.
- Non-functional: one validation paradigm (inline field errors) across customer/dealer forms.

## Architecture

- **Dealer flow (Validation Session 1 — FULL API REWIRE approved; user unfroze the README scope):** route `them-dai-ly-modal.tsx` through `persistCustomer` (real API path) with dealer-restricted `loaiKhachHangId`; replace the legacy 3-level TINH/QUAN/XA selects with the normalized street/province/commune trio. This requires the geography reference data the modal doesn't load today → lands as a JOINT change with Phase 4's reference-data hook rewrite (coordinate the two phases on this file pair; if P4 hasn't landed, the modal may temporarily consume the existing `useCustomerReferenceData` and P4 migrates it). Plus the F-B3 fixes regardless: inline per-field validation, never close on failed submit, success toast only on real save. The rewired flow MUST invalidate `['khach-hang']` — the modal has no queryClient today and its only refresh is the `onCreated → listQuery.refetch()` that Phase 4 deletes (red-team FM2). Delete legacy `createCustomer` (single caller verified).
<!-- Updated: Validation Session 1 - OQ5 resolved: full rewire is the default -->>
- **Legacy `diaChi` (red-team corrected trigger):** the untouched-edit path is ALREADY safe (`writeAddress` gate omits address keys). The destroy path is TOUCHED-without-replacement: brushing any address field sets `addressTouched`, and for legacy rows the composed address is empty → payload explicitly sends `diaChi: null`. Fix: client sends `diaChi` only when the composed address is non-empty; intentional clearing gets an explicit "Xóa địa chỉ" affordance that sends a clear marker; server rejects a null-transition on a non-empty `diaChi` unless the clear marker accompanies it. Show the stored `diaChi` read-only in the edit form.
- **Bán hàng (red-team corrected — display staleness, not persistence):** `create-selling.ts:45` already unshifts into `SELLING_ROWS` and `BanHangEditorPage.tsx:121` already toasts success. The vanish (F-C6) is (a) the editor hardcoding `branchId: BRANCHES[0].id` so branch-filtered lists hide the row, and (b) no invalidation of `['ban-hang-list']` on return. Fix those two; no store rework, flow stays frozen per README.
- **Bulk delete:** awaited `Promise.allSettled` with chunked concurrency (≤10 — 300 parallel DELETEs vs the 600/min limiter yields nondeterministic 429s), per-item toast AND per-item invalidation suppressed in bulk mode (`use-crud.ts:107-108` invalidates per mutation — suppressing only toasts still fires N refetches), single invalidation after settle, true-count toast, selection preserved on failures. Delete-order note: khach-hang has a self-FK (`dai_ly_id`) — parent deletes can 23503; surface these as per-row failures (server-side 409 mapping lands in Phase 3). Remove the 300 option from `PAGE_SIZE_OPTIONS` at the two real-consumer sites (KhachHangPage, CrudTablePage) as a rider — full centralization is Phase 5, contract test is Phase 3.

## Related Code Files

- Modify: `src/features/customer/them-dai-ly-modal.tsx` (persistCustomer rewire + normalized address trio; inline validation; keep dialog open on error; `['khach-hang']` invalidation)
- Delete: `src/features/customer/create-customer.ts` legacy sync write (single caller verified: them-dai-ly-modal)
- Modify: `src/features/customer/customer-form.tsx` + `customer-form-values.ts` (read-only stored `diaChi` on edit; send `diaChi` only when composed non-empty; explicit "Xóa địa chỉ" affordance + clear marker; phone pattern validation mirroring email's inline mechanism)
- Modify: `api/src/khach-hang/khach-hang.service.ts` (reject null-transition of non-empty `diaChi` without clear marker; server-side phone format guard)
- Modify: `src/pages/danh-muc/KhachHangPage.tsx` + `src/components/crud/CrudTablePage.tsx` (bulk delete rework; drop 300 from PAGE_SIZE_OPTIONS)
- Modify: `src/hooks/use-crud.ts` (bulk mode: suppress per-item toast AND per-item invalidation)
- Modify: `src/components/crud/CrudSheet.tsx` (reset only on mutation success; `z.preprocess` so blank required numbers fail instead of coercing to 0)
- Modify: `src/features/stockout-editors/BanHangEditorPage.tsx` (106, 141 — branchId from active branch, not `BRANCHES[0]`) + `src/pages/xuat-kho/BanHangPage.tsx` (invalidate/refetch `['ban-hang-list']` on save/return)
- Modify: `src/components/dashboard/RecentTicketsTable.tsx` (+ its data source) — source real PSC ids from the repair store; ticket-not-found fallback routes to list with search prefilled
- Modify: repair create form (`src/features/repair-create/`) — cross-field date rule: hẹn giao ≥ ngày nhận (inline error)
- Modify: Khu vực form source (`src/features/repair-create/` region combobox) to read the same populated catalog datasource as `/danh-muc/khu-vuc` (F-C4); inline "+" stays as fallback
- Modify: `src/pages/tai-chinh/` receipt submit (F-C14: disable while pending — single-flight; "server unreachable" vs validation copy split in toasts)

## Implementation Steps

1. Dealer modal full rewire: persistCustomer + normalized address trio (joint with P4 on the reference-data hook), inline errors, never-close-on-failure, success toast only on real save, `['khach-hang']` invalidation; delete legacy createCustomer.
2. Phone validation (client both dialogs + server DTO); reuse email's inline error mechanics.
3. `diaChi` protection per corrected trigger; unit test: legacy row + touched province field + save → `diaChi` intact; explicit clear → nulled.
4. Bulk delete rework (chunked, settled, single invalidation, true counts, selection-on-failure) + fetch-count assertion (≤1 list GET after bulk); drop 300 option.
5. CrudSheet: reset on success only; blank-number preprocess.
6. Dashboard recent tickets: real ids + fallback.
7. Bán hàng: branchId + list invalidation; e2e: save → sale visible in list under "Tất cả chi nhánh" AND its own branch. Re-check the journey's "no toast" observation — if `validate()` silently returns false on some input, surface those errors inline.
8. Repair create: date cross-validation; Khu vực datasource swap + seed check.
9. Receipt single-flight + error-copy split.

## Success Criteria

- [x] Creating a dealer persists via the real API: row visible in /khach-hang after refetch AND after reload; modal never closes-and-discards on invalid submit.
- [x] Editing a legacy customer and touching (not replacing) an address field leaves `diaChi` intact (API test at the corrected trigger); explicit "Xóa địa chỉ" clears it.
- [x] Phone `"abc"` rejected inline on both dialogs and 400 on the API.
- [x] Bulk delete of N rows with one forced failure reports "N-1 thành công / 1 lỗi"; failed row stays selected; ≤1 list refetch; no 429s at N=200 (chunked).
- [x] Dashboard recent-ticket click opens an existing detail page.
- [x] Saved Bán hàng sale appears in its list without manual reload.
- [x] "Lưu & Thêm mới" with a failing create preserves the typed input.
- [x] Required numeric field left blank errors instead of persisting 0.
- [x] Repair intake with empty Khu vực API list no longer dead-ends (options present from catalog source).

## Risk Assessment

- Dealer rewire (validated decision) rebuilds a formerly-frozen form's address model and adds a geography-data dependency shared with Phase 4's hook rewrite → coordinate as a joint P2+P4 change on `them-dai-ly-modal.tsx`/`use-customer-reference-data.ts`; update README's scope sentence when it lands.
- `diaChi` clear-marker changes the update DTO shape → coordinate client+server in one PR with contract test.
- Bulk-mode invalidation suppression must not leak into single-delete behavior → explicit option, covered by existing single-delete tests.
