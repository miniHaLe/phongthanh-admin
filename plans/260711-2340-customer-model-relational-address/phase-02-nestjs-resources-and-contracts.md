---
title: NestJS Resources And Contracts
status: completed
completed: 2026-07-12
---

# Phase 02 - NestJS Resources And Contracts

## Context

The generic CRUD engine supports authenticated global resources, while customer
needs extra relational preparation and compatibility address composition.

## Files

- `api/src/app.module.ts`
- `api/src/crud/**` only if a narrow reusable hook is demonstrably simpler
- `api/src/{nha-san-xuat,san-pham,model,ngan-hang,dia-ly,khach-hang}/**`
- `api/test/**`
- `scripts/assert-real-resources.mjs`
- `docker-compose.yml`, `api/Dockerfile`, env examples as required

## Implementation

- Add CRUD modules, Zod DTOs, resource configs, and ID generators for
  manufacturer, product, model, and bank.
- Add authenticated read-only geography endpoints returning snapshot metadata,
  provinces, and province-qualified commune records.
- Keep existing `PagedResult`/REST conventions for catalog resources.
- Return explicit model relation metadata required by autocomplete results.
- Extend customer DTOs with normalized address and optional finance fields.
- Validate tax as empty, ten digits, or `10-digits-3-digits`; keep bank accounts
  as text and trim only surrounding whitespace.
- Validate province/commune presence as a pair and rely on DB FK enforcement for
  final consistency.
- Compose `diaChi` server-side from street plus official commune/province names
  for new writes while preserving legacy reads.
- Stamp customer `branchId` from authenticated `user.branchIds[0]`; reject an
  empty primary branch and never derive ownership from address.
- For customer update, merge existing and patch address fields before validation
  and recomposition. Prefer a customer-specific service wrapper over broad CRUD
  changes unless a small hook is clearly reusable and regression-tested.
- Extend resource release flags and Docker production build arguments.

## Tests

- CRUD/list/filter/create/update tests for all four global resources.
- Model FK and filter behavior; invalid parent IDs fail cleanly.
- Geography endpoint returns exact snapshot/version/counts.
- Customer branch stamping, address composition, province/commune mismatch,
  optional finance data, tax formats, and leading-zero account round trip.
- Existing sort/filter/branch/security gates remain green.

## Risks

- Generic CRUD changes have a wide blast radius; use customer-specific logic
  when it keeps unrelated resources unchanged.
- Super-scope users still require a stable primary branch in JWT `branchIds[0]`.

Unresolved questions: None.

## Completion

- [x] Add authenticated catalog and geography resources.
- [x] Add relational Model validation and batched name enrichment.
- [x] Add customer normalized address/finance persistence and bank enrichment.
- [x] Stamp customer ownership from JWT primary branch.
