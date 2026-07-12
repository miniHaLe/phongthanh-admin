---
title: Customer, Model, And Relational Address
status: completed
priority: P1
effort: high
branch: untracked-workspace
tags: [customer, model, postgres, vietnam-geography]
created: 2026-07-11
completed: 2026-07-12
---

# Customer, Model, And Relational Address Plan

Status: Completed
Created: 2026-07-11

## Goal

Persist manufacturer/product/model/bank/customer data in Postgres, make repair
model selection relationally consistent, and replace new customer address entry
with Vietnam's two-level administrative units effective 2025-07-01.

## Approved Scope

- Add real API/DB resources for `nha-san-xuat`, `san-pham`, `model`, and
  `ngan-hang`; repair-ticket persistence remains mock.
- Extend customer create/edit and repair quick-create with normalized address,
  tax, bank, and account fields.
- Seed a frozen official snapshot from Decision 19/2025/QD-TTg: 34
  province-level and 3,321 commune-level units.
- Keep legacy address columns/data for compatibility; do not infer merged units
  from old free-text addresses.
- Leave dealer and sales quick-create flows unchanged.

## Phases

1. [x] [Database schema and official fixtures](phase-01-database-schema-and-official-fixtures.md)
2. [x] [NestJS resources and contracts](phase-02-nestjs-resources-and-contracts.md)
3. [x] [Relational frontend data and repair model flow](phase-03-relational-frontend-data-and-repair-model-flow.md)
4. [x] [Model and customer editors](phase-04-model-and-customer-editors.md)
5. [x] [Verification, migration rehearsal, and docs](phase-05-verification-migration-and-docs.md)

## Dependencies

- Signed Decision 19/2025/QD-TTg snapshot and validation checksum/count report.
- Local Postgres through `docker compose up -d db` for migration and API gates.
- Existing JWT `branchIds`; customer creates use `branchIds[0]` as primary branch.

## Acceptance Criteria

- Model selection cannot produce incompatible manufacturer/product IDs.
- Both Model create surfaces expose exactly product, manufacturer, model name,
  and note; creates persist and become immediately selectable.
- Customer create/edit persists street, official province/commune codes, tax,
  bank, and account; leading account zeroes survive round trips.
- Province/commune relationships are enforced in DB and UI; duplicate commune
  names never trigger an inferred province.
- Real customer creation persists after reload and no longer derives branch
  ownership from address.
- Existing customer display/search/export paths continue receiving `diaChi`.
- Focused and broad frontend/API/build/UI tests pass without unrelated contract
  regressions.

## Rollback

- New catalog/geography tables and additive customer columns can be removed
  without deleting legacy address columns.
- Existing customer rows remain readable because migration does not guess or
  overwrite legacy geography.
- Frontend resource flags can be returned to the prior release set while the
  migration is rolled back in a controlled deployment.

## Progress

- Research and requirements: complete
- Plan review: approved
- Implementation: complete
- Verification and review: complete
- Documentation/finalization: complete
- Overall: 5/5 phases, 100%

Unresolved questions: None.
