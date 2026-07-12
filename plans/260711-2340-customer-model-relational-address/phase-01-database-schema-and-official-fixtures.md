---
title: Database Schema And Official Fixtures
status: completed
completed: 2026-07-12
---

# Phase 01 - Database Schema And Official Fixtures

## Context

- Current Postgres has legacy `tinh -> quan -> xa` tables and only customer as a
  real business resource.
- Official source: Decision 19/2025/QD-TTg, signed PDF, effective 2025-07-01.
- New address writes use a two-level hierarchy; legacy data remains intact.

## Files

- `api/src/db/schema/**`
- `api/src/db/migrations/**`
- `api/seed-fixtures/**`
- `api/src/seed/load-fixtures.ts`
- `api/src/seed/validate-fk-closure.ts`
- `api/src/seed/seed-database.ts`
- New deterministic ingestion/validation script under `scripts/` or `api/scripts/`

## Schema

- Add global catalog tables: `nha_san_xuat`, `san_pham`, `model`, `ngan_hang`.
- `model` stores explicit `nha_san_xuat_id` and `san_pham_id`; add FK indexes and
  a composite uniqueness rule for manufacturer/product/normalized model name.
- Add `tinh_thanh` keyed by official two-digit code and `phuong_xa` keyed by
  official five-digit code. Store official name, normalized name,
  administrative type, effective date, snapshot version, and source document.
- Extend `khach_hang` additively with `ten_duong`, `tinh_thanh_code`,
  `phuong_xa_code`, `ma_so_thue`, `ngan_hang_id`, and `so_tai_khoan`.
- Enforce the selected commune's province through a composite FK; index all FKs.
- Preserve `dia_chi`, `tinh_id`, `quan_id`, and `phuong_xa_id` as nullable legacy
  compatibility fields.

## Data Work

- Extract/transform the signed official appendix into committed deterministic
  fixtures; do not call an external service at runtime.
- Validate exactly 34 provinces, 3,321 communes, unique codes, valid parents,
  supported administrative types, source URL, and effective date.
- Seed existing catalog mock values with stable IDs where possible.
- Keep `ten_duong` and official codes null for legacy customers; never copy or
  infer values from the free-text `dia_chi` field.

## Migration And Rollback

- Rehearse forward migration against the seeded test DB and retain old columns.
- Add new constraints only after fixture validation and catalog seed ordering.
- Rollback drops new constraints/columns/tables; no old address value is lost.

## Tests

- Fixture count/checksum tests.
- FK closure and duplicate-code tests.
- Migration preserves every legacy customer and legacy address field.
- Mismatched province/commune pairs fail at the DB boundary.

## Risks

- PDF extraction errors: gate on exact counts plus spot-checks against the signed
  source and province-level resolutions.
- Never map legacy names to merged units by fuzzy or name-only matching.

Unresolved questions: None.

## Completion

- [x] Add catalog, geography, and additive customer schema.
- [x] Commit deterministic 34/3,321 fixtures with checksums and provenance.
- [x] Preserve all legacy customer address values without inferred backfill.
- [x] Add forward/rollback migration and DB relationship constraints.
