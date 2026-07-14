---
date: 2026-07-14
time: "11:57 +07:00"
session: fullstack-live-review-remediation-finalize
status: local-verified-live-rollout-pending
severity: high
component: frontend, api, data, navigation, repair, deployment
source_plan: plans/260713-1817-fullstack-live-review-remediation/plan.md
---

# Journal: Fullstack Live Review Remediation Finalize

## Context

Executed eight-phase remediation from 93 live-site/code findings. Large blast
radius: real API tables, customer writes, auth/branch scope, CRUD engine,
navigation, shared UI, repair workflows, dashboard data, Pages deployment.
Goal here: record local outcome, not claim MacBook/live rollout.

## What Happened

- Fixed blank real-API cells and empty-value rendering; added friendly route
  failure handling.
- Rewired customer/dealer writes to real persistence, preserved legacy address
  unless explicitly cleared, corrected sales visibility/invalidation.
- Hardened API filters, deterministic sorting, PostgreSQL 4xx mapping, creator
  branch semantics, forced-password guard, guarded address-code migration.
- Deduplicated customer reference queries, kept server sorting authoritative,
  removed production mock randomness.
- Consolidated CRUD/filter/table/status/tab contracts; exposed declared child
  pages through navigation and command palette; replaced Tin tức with Thông báo
  while keeping redirects.
- Shared repair status flow across list, KT, detail. Dashboard summary, recent
  tickets, distribution now derive from mutable repair store and invalidate on
  shared status change.
- Review cycle found two regressions after first implementation: persisted
  unauthorized branch and stale Dashboard metrics. Both fixed with pre-render
  JWT reconciliation, logout reset, authorized branch options, shared query
  invalidation, focused cross-surface tests.
- Replaced stale Render deployment assumptions with MacBook + Postgres + ngrok
  runbook. Workflow requires configured API URL and `/health/ready`; emergency
  bypass documented. Postgres host port now loopback-only. API network exposure,
  firewall requirement, backup, forward migration, rollback/restore documented.

Verification evidence:

- Frontend: 187 files / 642 tests passed.
- API: 8 suites / 64 tests passed against Postgres.
- Playwright: 222/222 UIUX cases passed, phone through 4K.
- Type-check, six-resource production build, lint, Compose config, docs gates
  passed. Lint remains 0 errors / 109 existing Fast Refresh warnings.
- Final review: `PASS_WITH_RISK`, 0 critical findings, changed public contracts
  documented. High-risk flag retained because diff and deployment blast radius
  remain large.

## Reflection

Local green was necessary, not production proof. Red-team value came from
checking state transitions, not component shape: previous user branch crossed
session boundary; repair mutation crossed Dashboard cache boundary. Both bugs
survived broad suites until explicit end-to-end state assertions were added.

Deployment decision also clarified ownership. Failing Pages before build when
API URL/readiness is absent is safer than silently baking a dead backend. Cost:
MacBook availability and tunnel rotation become deliberate operator duties.

## Decisions

- Keep ngrok as sanctioned API origin; prefer stable/reserved domain.
- Treat `all` as JWT-authorized branch union, never unrestricted database scope.
- Reconcile persisted branch before rendering protected children; reset logout.
- Use guarded forward migration; never use old `0001` down after `0002`.
- Prefer application rollback with current additive DB; full restore only from
  verified backup with API stopped.
- Do not claim deployment, live migration, or live visual sign-off from local
  verification.

## Next

1. On MacBook: back up DB, fast-forward `main`, install, build, migrate, seed,
   start API, then start ngrok.
2. Verify local and public `/health/ready`; keep firewall enabled and no router
   forwarding for port 3210.
3. Set GitHub `vars.API_URL`, dispatch Pages, watch readiness-gated workflow.
4. Record deployed commit/run URL and live smoke: login, customer cells,
   create/edit persistence, address backfill match set, Phase 1 live checks.
5. Review current screenshot corpus against approved baseline if visual sign-off
   is required.

Unresolved questions: none. Remaining items are operator execution/evidence.
