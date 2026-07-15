---
phase: 1
title: "Data Visibility & Deploy Hotfix"
status: in-progress
effort: "S-M"
priority: P1
dependencies: []
---

# Phase 1: Data Visibility & Deploy Hotfix

## Overview

Restore the two things every other phase needs to verify against: visible table data and a deploy that can't silently break. Today every real-API list renders blank identity cells (proven client render defect), stale-chunk failures show a raw stack trace, and any push to `main` rebinds the frontend to a dead API URL.

Findings: F-D1/F-E1 (=F-B1, F-C1-list, F-C2), F-A5, F-E2 (=F-C7-crash), F-D3, F-D16.

**Precondition RESOLVED (Validation Session 1):** the sanctioned API origin is the **ngrok tunnel**. `vars.API_URL` holds the current tunnel URL; every tunnel restart requires a var update + redeploy (accepted operational cost — recommend a reserved ngrok domain to eliminate the churn). The health gate + skip-gate dispatch input below are sized for this choice.
<!-- Updated: Validation Session 1 - OQ2 resolved: ngrok origin -->>

## Requirements

- Functional: all columns without a custom renderer display their accessor value; nullable cells show "—"; chunk-load failure shows a Vietnamese error view with one-shot reload; deploys target a configurable, health-checked API URL.
- Non-functional: regression tests assert cell VALUES (current tests assert headers only — phantom coverage).

## Architecture

The column builders map `ColumnConfig` → TanStack `ColumnDef` with an explicit own-property `cell: undefined` when no `renderCell` exists. TanStack resolves columnDefs by object spread, so the present-but-undefined key overrides the library's default accessor renderer; `flexRender(undefined, ctx)` renders nothing. Fix = conditional spread. Two copies exist (generic template + bespoke customer page fork).

"—" fallback (red-team fix): custom renderers like `tinhName`/`xaName` return `''` for null codes, so a fallback that skips renderCell output leaves those columns whitespace. Normalize at the single flexRender site instead: when the rendered output is `''`/null/undefined (accessor default OR string-returning renderCell), render "—". Note "—" semantics until Phase 3 backfills geography codes: it means "no data", not "loading".

Chunk failures: all ~80 routes are `React.lazy`; Suspense does not catch `import()` rejections, and no route defines `errorElement`, so React Router's default error screen (stack trace) renders.

Health endpoints (red-team fix): keep `/health` dependency-free (Render instance liveness — a DB probe there turns transient Postgres churn into instance restart loops). Add `/health/ready` with a `SELECT 1` probe; the deploy gate curls READY, Render keeps probing `/health`.

## Related Code Files

- Modify: `src/components/crud/CrudTablePage.tsx` (129-137 — conditional `cell` spread)
- Modify: `src/pages/danh-muc/KhachHangPage.tsx` (81-89 — same fix in fork)
- Modify: `src/components/shared/data-table/data-table.tsx` (491-494 — "—" normalization for empty rendered values)
- Modify: `src/routes/index.tsx` (add root + AppShell-level `errorElement` with chunk-load detection and one-shot `window.location.reload()` guarded by a sessionStorage flag)
- Create: `src/components/shell/RouteErrorView.tsx` (friendly VI error view + retry button)
- Modify: `.github/workflows/deploy-pages.yml` (API URL from `vars.API_URL` for both push and dispatch; pre-build readiness gate with retry/backoff; documented `workflow_dispatch` skip-gate input for emergencies)
- Modify: `src/api/api-url.ts` (treat empty-string env as unset)
- Modify: `api/src/health/health.controller.ts` (add `/health/ready` with `SELECT 1` + short timeout; `/health` unchanged)
- Modify: `src/pages/nhan-su/NganHangPage.test.tsx`, `src/pages/phan-quyen/ChucNangPage.test.tsx` (+ one CrudTablePage-level test): assert a data cell value (e.g. "Vietcombank", `tenKH`) renders, not just headers. Pin assertions to plain accessor columns (tenKH/tenNganHang) — geography-name assertions are Phase 3's (blank until backfill).

## Implementation Steps

1. Fix `cell: undefined` in both column builders: `...(col.renderCell ? { cell: ({ row }) => col.renderCell!(row.original) } : {})`.
2. Add "—" normalization at the flexRender site for empty rendered values (accessor and string renderCell outputs alike).
3. Add cell-value regression tests pinned to non-geography columns (seeded row's `tenKH`/`tenNganHang` visible in DOM).
4. Add `RouteErrorView` + `errorElement` on root and shell routes; detect `Failed to fetch dynamically imported module`/`ChunkLoadError` → auto-reload once per session, else show retry + back-to-home.
5. Set `vars.API_URL` to the current ngrok tunnel URL (validated decision) as a VERIFIED numbered step (not a PR-description aside): `gh variable set API_URL`, then `gh variable list` confirms. Workflow: `VITE_API_URL: ${{ github.event.inputs.api_url || vars.API_URL }}`; build fails loudly if empty. Recommend reserving an ngrok domain so the value stops rotating.
6. Pre-build gate: `curl -sf --retry 5 --retry-delay 10 "$API_URL/health/ready"`; add `skip_health_gate` dispatch input for emergencies.
7. Add `/health/ready` (DB probe); Render `healthCheckPath` stays `/health`.
8. Live smoke after deploy: login → /khach-hang → identity cells visible → open "Thêm Khách Hàng" (verify the modal loads its reference data; journey review hit "Không thể kết nối máy chủ" here once — confirm fixed or file separately).
9. Post-deploy: re-verify all LIVE-ONLY findings from the panel against this fresh bundle (the reviewed deploy's provenance was unproven — at least one live symptom, the print-flow F-B4, contradicts HEAD code). Record which live findings survive; later phases consume that list.

## Success Criteria

- [ ] /khach-hang, /danh-muc/nha-san-xuat, /danh-muc/model, /quan-ly tabs render name/phone values from the live API.
- [x] Empty rendered values show "—", never whitespace (incl. geography columns pre-backfill).
- [x] Page tests fail if a plain column renders empty for seeded data.
- [x] Killing a chunk URL (devtools block) shows the VI error view, one auto-reload, no stack trace.
- [ ] Push to main with `vars.API_URL` unset or dead fails the build; with a healthy URL, deploy succeeds; skip-gate dispatch path documented and works.
- [x] `/health` remains dependency-free; `/health/ready` fails when DB is down.
- [ ] Live-finding re-verification list recorded in this phase's report.
- [x] `npm run type-check && npm run lint && npm run test` green; `npm run test:api:with-db` green (health change).

## Risk Assessment

- Reload-loop on genuinely broken deploys → sessionStorage one-shot guard; error view still offers manual retry.
- "—" normalization touches every table cell render → gate to string/nullish outputs only; ReactNode renderers (badges, buttons) pass through untouched.
- `vars.API_URL` unset on first post-merge push blocks deploys BY DESIGN — acceptable only because step 5 makes setting it a verified prerequisite in the same PR checklist. Origin = ngrok (validated decision): every tunnel rotation requires a var update + redeploy — accepted operational cost; a reserved ngrok domain removes it.
- Build-time gate ≠ runtime guarantee: a URL healthy at build can die after; the gate only prevents deploying a KNOWN-dead URL (the F-D3 harm).
