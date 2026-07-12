---
title: Verification Migration And Docs
status: completed
completed: 2026-07-12
---

# Phase 05 - Verification, Migration Rehearsal, And Docs

## Verification Order

1. Run fixture/schema/migration-focused API tests.
2. Run catalog/customer/repair-create frontend unit tests.
3. Run clean frontend TypeScript (`npx tsc --noEmit -p tsconfig.app.json`),
   lint, full unit suite, and build.
4. Run API lint/build/Jest through `npm run test:api:with-db`.
5. Run guarded production build with every released real resource enabled.
6. Run focused Playwright customer/model flows, then relevant UIUX suites.

## Mandatory Scenarios

- Official snapshot is exactly 34/3,321 with unique codes and valid parents.
- Migration and rollback preserve all legacy customers and addresses.
- Model FK/filter/sync behavior works in mock and real modes.
- Customer branch ownership follows JWT primary branch, independent of address.
- Customer creation persists across reload and finance/address values round trip.
- Province/commune mismatch is rejected in API/DB even if UI is bypassed.
- 375px and desktop dialogs remain usable, keyboard-accessible, and overflow-free.
- No unrelated CRUD resource or public response contract regresses.

## Review Gate

The delegated code reviewer must check every acceptance criterion, callers of
changed contracts, migration safety, resource allowlists, and new lint/type/build
errors. Any behavioral regression stops finalization for user direction.

## Documentation

- Update `README.md`, `ARCHITECTURE.md`, `docs/codebase-summary.md`, and
  `api/README.md` for real resources, commands, data version, and architecture.
- Update env/deployment examples and Docker resource flags.
- Document Decision 19/2025/QD-TTg source URL, effective date, snapshot checksum,
  transformation steps, and validation counts.
- Record migration/rollback notes and the intentional legacy-address retention.

## Completion Evidence

- Save test/review/migration reports under this plan's `reports/` directory.
- Sync every phase status and the root plan before final handoff.
- Evaluate docs impact explicitly and write the required technical journal.

## Completion

- [x] Frontend focused/full tests, TypeScript, lint, and production build pass.
- [x] API lint/build/Jest and official fixture validation pass.
- [x] 375px customer/repair route smoke passes.
- [x] Forward, rollback, ledger reconciliation, and reapply rehearsal pass.
- [x] Code review reports no remaining in-scope findings.
- [x] README, architecture, API, deployment, and provenance docs updated.

Unresolved questions: None.
