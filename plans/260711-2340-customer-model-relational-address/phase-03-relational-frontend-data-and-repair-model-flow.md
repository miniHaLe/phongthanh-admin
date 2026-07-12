---
title: Relational Frontend Data And Repair Model Flow
status: completed
completed: 2026-07-12
---

# Phase 03 - Relational Frontend Data And Repair Model Flow

## Context

Repair and catalog currently use separate in-memory model datasets. The repair
form deliberately has no cascade and can submit incompatible IDs.

## Files

- `src/api/**`
- `src/types/masterdata-types.ts`
- `src/mock/masterdata/**`
- `src/domains/repair/{types,reference-data,mock-data}.ts`
- `src/config/crud-configs/{nha-san-xuat,san-pham,model,ngan-hang}.config.ts`
- `src/features/repair-create/sections/DeviceSection.tsx`
- Focused frontend tests

## Implementation

- Introduce one catalog data contract used by catalog pages and repair create,
  with real HTTP resources and deterministic mock fallback.
- Remove the behavioral dependency on the duplicate repair-only model store;
  keep compatibility exports only where needed by untouched repair mock data.
- Convert manufacturer/product/model/bank configs to `apiFor` or a shared API
  instance so create/list operations use the same store.
- Model options include product and manufacturer metadata and render secondary
  text `Product - Manufacturer` for duplicate names.
- Search rules:
  - no parent selected: all matching models;
  - manufacturer selected: same-manufacturer models only;
  - product also selected: same manufacturer and product only.
- Selecting a model is authoritative and fills both parents.
- Changing either parent clears an incompatible selected model and announces the
  reason through an `aria-live="polite"` message.
- Validate relationship compatibility before calling the mock repair mutation;
  add a second guard in the mutation boundary.

## Tests

- Manufacturer-first and product-narrowed searches.
- Model-first parent synchronization.
- Incompatible parent change clears the model.
- Duplicate model labels remain distinguishable.
- Invalid ID triples cannot create a repair ticket.
- Mock and real adapters expose matching wire shapes.

## Risks

- Existing seeded repair tickets rely on old IDs; provide an explicit adapter or
  deterministic migration rather than silently changing ticket snapshots.
- Avoid expanding a shared component unless the behavior benefits all callers.

Unresolved questions: None.

## Completion

- [x] Share catalog adapters between CRUD pages and repair creation.
- [x] Filter models by selected manufacturer/product and sync model-first parents.
- [x] Clear incompatible selections with accessible announcements.
- [x] Reconcile deleted catalog models before the repair mutation guard.
