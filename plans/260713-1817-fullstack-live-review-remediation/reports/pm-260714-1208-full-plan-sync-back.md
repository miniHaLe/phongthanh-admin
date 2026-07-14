# PM Sync-Back: Fullstack Live Review Remediation

Date: 2026-07-14 12:08 +07
Plan status: in-progress

## Metrics

| Metric | Result |
|---|---:|
| Phases completed | 3/8 (38%) |
| Phase success criteria verified | 51/59 (86%) |
| Plan-level acceptance verified | 6/9 (67%) |
| Frontend tests | 642 passed |
| API tests | 64 passed |
| Playwright UIUX | 222 passed |
| Review | PASS_WITH_RISK, 0 critical |

## Phase Status

| Phase | Status | Criteria | Remaining |
|---|---|---:|---|
| 1. Data visibility/deploy | in-progress | 5/8 | live API cells, Pages rollout, live-finding report |
| 2. Write paths | completed | 9/9 | none |
| 3. API contracts | in-progress | 5/6 | live address backfill proof |
| 4. Fetch/determinism | in-progress | 7/8 | manual deployed request-count check |
| 5. Shared UI | in-progress | 7/9 | status-renderer convergence, export-label contract |
| 6. Navigation/IA | completed | 6/6 | none |
| 7. Repair workflow | completed | 6/6 | none |
| 8. Responsive/dark polish | in-progress | 6/7 | reviewed dark-mode screenshot evidence |

## Completed Work

- Honest customer/dealer/sales writes, legacy-address protection, chunked bulk delete, validation feedback.
- CRUD filter/constraint/order contracts, forced-password guard, branch-scoped customer access, guarded migration.
- Shared builders, filters, tabs, dirty-close flow, repair scaffolding/status actions, navigation reachability.
- Loading/refetch feedback, print-block feedback, mobile customer cards/branch access, chart empty/order handling.
- Local gates green: type-check, lint, production build, frontend/API/UIUX tests, docs validation.

## Remaining Risks

- MacBook API/ngrok rollout not executed here: `vars.API_URL`, readiness-gated Actions run, deployed-bundle smoke open.
- Live migration match set unknown until MacBook Postgres backfill is inspected.
- Phase 5 wording exceeds current convergence: direct status colors remain outside shared badge/legend surfaces; contextual export labels remain.
- Screenshot files regenerated, but no current-plan before/after manifest or pixel sign-off.

## Next Action

1. On MacBook: pull, backup, migrate, start API/ngrok, verify readiness, set `API_URL`, dispatch Pages.
2. Record deployed commit, smoke results, live backfill rows, live-only finding re-check.
3. Decide whether Phase 5's two remaining criteria require more code or scoped wording changes.
4. Review dark-mode/mobile screenshots and record sign-off.

## Unresolved Questions

1. Migrate every remaining direct status-color renderer, or narrow Phase 5 to badge surfaces only?
2. Normalize contextual labels such as `Xuất Excel File` / `Xuất Excel Chi Tiết`, or narrow criterion to primary list exports?
