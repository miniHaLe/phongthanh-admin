---
phase: 7
title: API Test Environment and CI Gates
status: completed
priority: P1
dependencies:
  - 1
---

# Phase 7: API Test Environment and CI Gates

## Overview

Make API verification reproducible instead of blocked by local Postgres or missing compose secrets.

## Requirements

- Functional: `cd api && npm test` can provision `phongthanh_test` against local compose Postgres; full-stack compose failure clearly tells developer which secrets are needed.
- Non-functional: no committed secrets; no fake DB mocks for the e2e suite; CI docs/scripts are explicit.

## Architecture

Keep API e2e real: Jest global setup drops/recreates the test DB and runs migrations/seeds. Add env examples/scripts/docs so developers and CI can start only the DB for tests without requiring full-stack `INITIAL_ADMIN_PASSWORD`.

## Related Code Files

- Modify: `api/README.md`
- Modify: `api/test/global-setup.ts`
- Modify: `api/test/load-test-env.ts`
- Modify: `api/jest.config.mjs`
- Modify: `docker-compose.yml`
- Create or modify: `api/.env.test.example` if not present
- Create or modify: `scripts/test-api-with-db.sh` or npm script if preferred
- Modify: root `package.json` only if adding aggregate verification scripts

## Tests Before

1. Reproduce current blocker:
   - `cd api && npm test` fails with Postgres unavailable if DB is down.
   - `docker compose ps db` or full compose path complains about missing `INITIAL_ADMIN_PASSWORD` for full stack.
2. Add a preflight test/script that fails fast with actionable DB start instructions when `127.0.0.1:5434` is unavailable.

## Refactor

1. Document two paths:
   - DB-only test path: `docker compose up -d db && cd api && npm test`
   - full-stack path: requires exported or `.env.docker` secrets.
2. Add test env example with non-secret deterministic test values only where appropriate.
3. Improve API test preflight errors without skipping tests.
4. Optionally add root scripts:
   - `test:api`
   - `test:api:with-db`
   - `verify`
   if this matches existing package script style.

## Tests After

1. Run `docker compose up -d db`.
2. Run `cd api && npm run lint`.
3. Run `cd api && npm run build`.
4. Run `cd api && npm test`.
5. Run `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`.
6. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Write preflight/documentation changes.
2. Validate DB-only compose path does not require app secrets.
3. Validate API Jest e2e passes against `phongthanh_test`.
4. Keep full-stack secret requirement intact.
5. Document any environment-specific blockers in the plan report if local Docker is unavailable.

## Success Criteria

- [x] API lint/build pass.
- [x] API Jest e2e passes with local compose DB.
- [x] Full-stack compose still fails loudly when production-like secrets are absent.
- [x] Frontend prod build with real `khach-hang` resource passes.
- [x] No `.env`, token, password, or local secret committed.

## Risk Assessment

- Risk: making compose easier could weaken secret posture. Mitigation: DB-only path must not change API/web service secret requirements.
- Risk: tests depend on local Docker availability. Mitigation: preflight explains blocker; CI can provide Postgres service with same env vars.
