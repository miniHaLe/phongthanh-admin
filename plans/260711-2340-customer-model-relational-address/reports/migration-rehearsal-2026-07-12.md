# Migration Rehearsal - 2026-07-12

Status: Passed

## Scenario

- Created temporary Postgres database `phongthanh_migration_rehearsal`.
- Applied `0000_omniscient_mesmero.sql`.
- Inserted one legacy customer with only the original free-text address fields.
- Applied `0001_cool_sunspot.sql`.
- Verified the legacy customer and `dia_chi` remained unchanged and
  `ten_duong` remained null.
- Applied `0001_cool_sunspot.down.sql`.
- Verified the legacy customer and `dia_chi` still existed and the new `model`
  table was removed.
- Verified rollback removed only the `0001` row from
  `drizzle.__drizzle_migrations`.
- Ran `npm run db:migrate` again and verified `0001` reapplied, restored the new
  schema, and left the legacy customer/address unchanged.
- Dropped the temporary rehearsal database.

## Evidence

```text
forward: kh-legacy-rehearsal|12 Đường Cũ, Quận Cũ, Tỉnh Cũ|<null>
rollback: kh-legacy-rehearsal|12 Đường Cũ, Quận Cũ, Tỉnh Cũ
ledger rows after rollback: 1
model table present after reapply: true
ledger rows after reapply: 2
reapply: kh-legacy-rehearsal|12 Đường Cũ, Quận Cũ, Tỉnh Cũ|<null>
```

Unresolved questions: None.
