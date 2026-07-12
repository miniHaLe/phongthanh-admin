---
role: tester
date: 2026-07-12
plan: ../plan.md
status: passed
---

# Tester Report - 2026-07-12 - Customer Model Address Validation

## Summary

- Requested implementation passes focused frontend, full frontend, real Postgres API, TypeScript, lint, production build, rollback-hash verification, and focused 375px route smoke gates after final reviewer fixes.
- No reproducible behavioral regression found in model parent consistency, visible-text filters, active bank lookup, inactive-bank edit fallback compilation, exact model fields, normalized customer address, province clearing, street clearing, bank enrichment, account leading zeroes, or official geography data.
- No lint warning remains in changed customer/model/catalog/geography/API files.

## Results

| Gate                              | Result                      | Evidence                                                  |
| --------------------------------- | --------------------------- | --------------------------------------------------------- |
| Focused frontend                  | PASS                        | 11 files, 42 tests                                        |
| Clean app TypeScript              | PASS                        | zero diagnostics                                          |
| API lint/build/Jest with Postgres | PASS                        | 2 suites, 35 tests                                        |
| Full frontend Vitest              | PASS                        | 139 files, 498 tests                                      |
| Frontend/API lint                 | PASS with baseline warnings | exit 0; 111 warnings total; 0 scoped warnings             |
| Guarded production build          | PASS                        | six release resources accepted; 1,394 modules transformed |
| Focused Playwright 375px          | PASS                        | repair list + customer route, 2 tests                     |
| Geography fixture checksums       | PASS                        | both SHA-256 values match metadata                        |
| Migration rollback ledger hash    | PASS                        | down SQL hash exactly matches SHA-256 of migration 0001   |

## Requested Behavior Coverage

- Model catalog filters by manufacturer/product and rejects incompatible triples.
- Complete catalog refresh removes deleted persisted models from repair compatibility validation; regression test rejects the removed model afterward.
- Model quick-create renders exactly Product, Manufacturer, Model name, Note; returned model selected with parent IDs.
- API model creation requires valid manufacturer/product parents and filter returns created model.
- Geography snapshot returns exact 34 provinces/cities and 3,321 communes, version `official-2025.07.01`.
- Official correction verified in frontend and API: code `24496` is `Xã Ea Kly`, type `commune`, province `66`.
- Fixture SHA-256 values match `dia-ly-metadata.json`: provinces `64085f3a...7563`, communes `773edd21...df22`.
- Manufacturer, product, model, bank, and customer visible-text filters are accepted and return matching records.
- Customer address composes from street + commune + province; mismatched pair rejected at service and DB FK boundaries.
- Clearing province also clears commune; clearing street keeps the official commune/province address.
- Customer branch ownership stamped from JWT primary branch.
- Tax validation exercised; create/reference options request active banks only; inactive existing bank fallback is included in final type/lint/test/build state; bank name enriched; account number leading zeroes round-trip.
- Update preserves customer group and explicit null clears address/finance fields.

## Commands

```bash
npx vitest run src/api/http-client.contract.test.ts src/domains/repair/model-relation.test.ts src/features/model/model-catalog-data.test.ts src/features/repair-create/quick-create/QuickCreateModel.test.tsx src/features/customer/customer-form-values.test.ts src/data/vietnam-administrative-snapshot.test.ts src/config/crud-configs/model.config.test.ts src/config/crud-configs/khach-hang.config.test.ts src/config/crud-configs/ngan-hang.config.test.ts src/config/crud-configs/nha-san-xuat.config.test.ts src/config/crud-configs/san-pham.config.test.ts
sha256sum api/seed-fixtures/tinh-thanh.json api/seed-fixtures/phuong-xa-2025.json
sha256sum api/src/db/migrations/0001_cool_sunspot.sql
rg -n 'b33584b9c4b0eed001111f524e1e1ff7761073295a6d1cc56a4c2b9676525f09' api/src/db/migrations/0001_cool_sunspot.down.sql
npx tsc --noEmit -p tsconfig.app.json
npm run test:api:with-db
npm run test
npm run lint
env VITE_REAL_RESOURCES=khach-hang,nha-san-xuat,san-pham,model,ngan-hang,dia-ly npm run build:prod
npx playwright test -c playwright.config.ts tests/e2e/uiux-runtime.spec.ts --grep 'customers renders cleanly at phone-375|repair-list renders cleanly at phone-375'
```

## Findings

1. Existing lint baseline remains noisy: 111 warnings, mostly React Fast Refresh export warnings. No lint errors and no scoped warnings.
2. Jest emits a non-failing `ts-jest` deprecation warning for `isolatedModules` configuration.
3. Playwright evidence is responsive route smoke only; exact form/persistence behavior is covered by Vitest and API integration tests, not a browser persistence flow against the real API.
4. Inactive existing-bank fallback has no dedicated UI assertion; final TypeScript, full Vitest, lint, build, and customer-route smoke include the implementation.

## Unresolved Questions

- None blocking.
