---
title: Model And Customer Editors
status: completed
completed: 2026-07-12
---

# Phase 04 - Model And Customer Editors

## Context

Model quick-create only captures a name. Customer create flows diverge, use the
legacy three-level hierarchy, and bypass the real customer API.

## Files

- `src/features/repair-create/quick-create/**`
- `src/features/customer/**`
- `src/pages/danh-muc/{ModelPage,KhachHangPage}.tsx`
- `src/config/crud-configs/{model,khach-hang}.config.ts`
- `src/components/shared/server-autocomplete.tsx` if accessibility extensions
  can remain backward-compatible
- Related unit and Playwright tests

## Model Editor

- Reuse one validated field contract in quick-create and catalog create/edit.
- Visible fields exactly: `Tên Sản Phẩm*`, `Nhà sản xuất*`, `Tên model*`, and
  `Ghi chú`.
- Remove Model Code from editable fields; retain a returned/list value only if
  needed for legacy display.
- Prefill repair parents, allow edits, persist through API, invalidate queries,
  then select the new model and synchronize both parent fields.
- Use one column on phone and two columns from `sm`; model name and note span the
  full width.

## Customer Editor

- Build reusable customer form sections used by repair quick-create, main create,
  and main edit.
- Preserve existing identity/contact fields and add:
  - `Tên đường`
  - `Tỉnh/Thành phố`
  - `Phường/Xã`
  - `Mã số thuế`
  - `Ngân hàng`
  - `Số tài khoản`
- Remove district from these new surfaces; dealer/sales flows remain unchanged.
- Province selection restricts communes and clears incompatible selections.
- Ward-first exact selection auto-fills province only when normalized name plus
  administrative type resolves to one province. Duplicate names always show
  `Commune - Province` and require explicit selection.
- Bank options reuse active bank catalog rows; account input preserves leading
  zeroes.
- Real mode uses the customer API mutation and invalidates/refetches customer
  queries. Repair quick-create selects the persisted returned customer.
- Show composed address in the selected-customer panel.

## Accessibility And Responsive Gates

- Linked labels, inline errors, `aria-required`, `aria-invalid`, and described
  messages; toast is supplemental only.
- Contextual add buttons, keyboard combobox navigation, Escape/click-outside,
  loading/empty status, and live announcements for inferred/cleared fields.
- Dialogs are viewport-bounded, scroll vertically, retain reachable actions, and
  have no horizontal overflow at 375px.

## Tests

- Exact four model fields and persistent quick-create.
- Unique commune auto-fill; duplicate commune never guesses.
- Province filtering/clearing and official IDs in payload.
- Optional finance blank save; invalid tax inline; leading-zero account round
  trip; real customer persists after reload.
- Keyboard-only and 375px interaction flows.

Unresolved questions: None.

## Completion

- [x] Expose exactly four requested Model fields in both create surfaces.
- [x] Reuse customer create/edit form across catalog and repair quick-create.
- [x] Add searchable post-merger commune selection with province reconciliation.
- [x] Persist tax, bank, account, and explicit nullable edit semantics.
