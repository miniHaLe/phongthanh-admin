# UIUX Remediation Completion

---
date: 2026-07-11
plan: plans/260711-0047-uiux-remediation-tdd/plan.md
status: completed
---

## Context

Executed UIUX runtime audit remediation with TDD gates. Scope covered mobile
ergonomics, shell layout, touch controls, repair mobile workflow, 4K dashboard,
news semantics, and reproducible API tests.

## What Happened

- Added Playwright UIUX runtime harness with route, viewport, console, touch,
  font, overlap, and screenshot checks.
- Centralized mobile-safe sizing in UI primitives while preserving desktop
  density.
- Added mobile repair cards/actions and repaired shell footer/drawer/FAB spacing.
- Reworked dashboard composition for 1366 → 4K.
- Fixed news nested interactive markup and BranchMapModal test iframe noise.
- Added API DB-backed test path: `npm run test:api:with-db`.
- Updated docs and plan sync-back.

## Verification

- `npm run type-check`: pass
- `npm run lint`: pass with warnings
- `npm run test`: 129 files, 454 tests pass
- `npm run test:e2e:uiux`: 41 tests pass
- `npm run build`: pass
- `env VITE_REAL_RESOURCES=khach-hang npm run build:prod`: pass
- `npm run test:api:with-db`: API lint/build/Jest pass

## Decisions

- Keep React Router future warning as a narrow Playwright allowlist item.
- Keep DB-backed API tests real; no mocked e2e success.
- Preserve dense desktop tables; add purpose-built mobile repair cards.

## Next

- Optional: enable React Router future flag in a router-focused task.
- Optional: update `ts-jest` isolatedModules config in API maintenance.

## Unresolved Questions

None blocking.
