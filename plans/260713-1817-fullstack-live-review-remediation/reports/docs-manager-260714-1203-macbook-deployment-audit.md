---
type: docs-manager
date: 2026-07-14
scope: macbook-ngrok-deployment
status: complete-with-operational-follow-up
---

# MacBook Deployment Documentation Audit

## Summary

Deployment docs now support the real operator flow: update code with Git on the
MacBook, back up Docker Postgres, build/migrate/seed the host-run Nest API,
verify guarded address backfill, expose only through ngrok HTTPS, set
`vars.API_URL`, then dispatch GitHub Pages. No live deployment claimed.

## Findings

- No blocking documentation defect remains.
- Added explicit macOS firewall, LAN denial, loopback Postgres, and no router
  port-forward checks. ngrok needs outbound access only.
- Added migration `0002` post-run counts and pair-integrity query. Untouched seed
  expectation: `50 / 44 / 6 / 0`; guarded skips stay visible instead of hidden.
- Clarified existing live databases must use backup-first normal update, not
  one-time initialization.
- Corrected rollback order: stop current API before starting a detached
  known-good build.

## Files Updated

- `README.md`: concise deployment/network safety statement; remains under 300
  lines.
- `docs/deployment.md`: fresh setup, Git update, readiness, migration/backfill,
  network safety, tunnel rotation, troubleshooting, backup, rollback, restore.
- `docs/codebase-summary.md`: loopback/firewall/no-forwarding deployment contract.
- `api/README.md`: audited; no correction needed.

## Validation

- `git diff --check`: pass.
- Prettier Markdown check for README/API/deployment/summary: pass.
- Documentation validator: 45 internal links pass. Remaining warnings are legacy
  catalog references and shell variables misclassified as env keys.
- Workflow YAML parse: pass; `API_URL`, readiness, manual override, and emergency
  bypass match `.github/workflows/deploy-pages.yml`.
- `docker compose config --quiet`: pass; Postgres resolves to
  `127.0.0.1:5434 -> 5432`.
- Migration count query executed against isolated `phongthanh_test`: returned
  `50 / 44 / 6 / 0`. MacBook live database remains intentionally unverified.
- API commands and env names match `api/package.json`, `api/src/config/env.ts`,
  health controller, migration runner, seed runner, and CORS policy.

## Operational Follow-up

- On MacBook: run the documented migration count query and keep output private.
- Set GitHub `vars.API_URL` only after public `/health/ready` passes.
- Record successful normal and emergency workflow runs plus live smoke results.
- Live rollout, live backfill match set, and visual baseline remain unverified in
  this workspace.

## Unresolved Questions

None for documentation. Operational evidence requires the user's MacBook and
current ngrok tunnel.
