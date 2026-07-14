---
title: "Fullstack Live Review Remediation: UIUX, IA, API, Data Flow"
description: "Remediate 93 findings from a 5-agent live-site + code review: blank-cell render bug, silent data loss, API 500s, duplicate fetches, component inconsistency, missing sub-navigation, repair-workflow gaps"
status: in-progress
priority: P1
branch: "feature/customer-model-relational-address"
tags: [frontend, backend, api, uiux, refactor, tech-debt]
blockedBy: []
blocks: [260707-1612-real-backend-database]
created: "2026-07-13T11:23:54.357Z"
createdBy: "ck:plan"
source: skill
---

# Fullstack Live Review Remediation: UIUX, IA, API, Data Flow

## Overview

Remediation plan from a 5-agent fullstack review of the live deploy (https://minihale.github.io/phongthanh-admin) + codebase, 2026-07-13. 93 findings deduplicated into 8 phases ordered by user harm: restore data visibility (every real-API table renders blank identity cells), stop silent data loss, harden API contracts, kill duplicate fetches, then systemic UI consolidation, IA restructure, repair-workflow consolidation, polish. Security explicitly out of scope (user directive).

Source reports (all in `../reports/`):
- `from-uiux-layout-reviewer-to-planner-260713-1632-layout-hierarchy-consistency-report.md` (F-A1..A22)
- `from-interaction-reviewer-to-planner-260713-1632-interaction-states-forms-feedback-report.md` (F-B1..B18)
- `from-journey-reviewer-to-planner-260713-1632-user-journey-ia-duplication-report.md` (F-C1..C18)
- `from-backend-reviewer-to-planner-260713-1632-api-db-system-logic-report.md` (F-D1..D17)
- `from-frontend-reviewer-to-planner-260713-1632-frontend-domain-logic-report.md` (F-E1..E18)

Headline root causes (all proven with file:line + runtime repro):
1. **Blank cells everywhere**: explicit `cell: undefined` in column builders overrides TanStack's default renderer — `src/components/crud/CrudTablePage.tsx:129-137` + fork `src/pages/danh-muc/KhachHangPage.tsx:81-89`. API returns full data.
2. **Raw error page on stale chunks**: zero `errorElement` in route tree; lazy import rejections hit React Router's default stack-trace screen.
3. **Silent data loss**: "Thêm Đại Lý" writes to an in-memory mock array while the list reads the real API (`src/features/customer/create-customer.ts:24-38`); Bán hàng saves vanish; legacy `diaChi` destroyed on edit.
4. **Deploy regression trap**: push-to-main rebuilds Pages against a dead Render URL (`x-render-routing: no-server`); working ngrok URL survives only in manual dispatch.
5. **Shared organisms exist but adoption is partial and inconsistent** (red-team corrected): `filter-panel/` (21 consumers), `status-badge.tsx`, `page-header.tsx`, `data-table-toolbar.tsx`, `empty-state.tsx` all exist — but CrudFilterBar forks the filter organism, 3 status-badge forks remain, 4 admin pages carry identical inline tab strips, and the table engine is forked (CrudTablePage vs KhachHangPage).
6. **22 sub-pages unreachable**: `nav-config.tsx` declares children for Kho/Xuất Kho/Tài Chính/Báo Cáo that nothing renders.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Data Visibility & Deploy Hotfix](./phase-01-data-visibility-deploy-hotfix.md) | In Progress |
| 2 | [Data-Loss & Write-Path Fixes](./phase-02-data-loss-write-path-fixes.md) | Completed |
| 3 | [API Contract Hardening](./phase-03-api-contract-hardening.md) | In Progress |
| 4 | [Fetch Efficiency & Determinism](./phase-04-fetch-efficiency-determinism.md) | In Progress |
| 5 | [Shared UI Component System](./phase-05-shared-ui-component-system.md) | In Progress |
| 6 | [Navigation & IA Restructure](./phase-06-navigation-ia-restructure.md) | Completed |
| 7 | [Repair Workflow Consolidation](./phase-07-repair-workflow-consolidation.md) | Completed |
| 8 | [Feedback Responsive & Dark-Mode Polish](./phase-08-feedback-responsive-dark-mode-polish.md) | In Progress |

## Phase Dependencies

```
P1 (hotfix) ──► P2 (write paths) ──► P3 (API contracts) ──► P4 (fetch/determinism)
   │                        └──► P5 (shared UI) ──► P6 (nav/IA)
   │                                          └──► P7 (repair) ──► P8 (polish sweep)
```

- P1 first: everything else needs visible cells + stable deploys to verify against; it also produces the live-finding re-verification list later phases consume.
- P2 needs P1 (verify writes by reading visible rows).
- **P4 depends on P1 AND P3** (red-team corrected — P4's `khach-hang.config.ts` edits are gated on P3's `daiLyTen` enrichment; the original P3∥P4 claim contradicted their file lists). P5's builder extraction should also land before P4's lookup migration (P4 handles the fallback if not).
- P6/P7 consume P5 organisms (tab strip, PageHeader/BulkActionsBar/PrintMenu); P8 last.
- Shared-file rule: `KhachHangPage.tsx`, `CrudTablePage.tsx`, `khach-hang.config.ts` are touched by P1/P2/P3/P4/P5 — run those phases SEQUENTIALLY, never in parallel.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Why |
|-------------|------|--------|-----|
| Blocks | `260707-1612-real-backend-database` | in-progress | This plan's Phase 3 fixes the shared CRUD engine (missing ORDER BY tiebreaker, filter-value validation, constraint mapping). Landing those before 260707-1612 Phase 3 fans out ~37 CRUD resources prevents multiplying the defects. Branch-semantics + mustChangePassword findings (F-D10, F-D14) also feed its Phase 2. |

## Acceptance Criteria (plan-level)

- [ ] Every real-API list renders identity columns (name/phone/address) with live data; regression test asserts cell values, not just headers.
- [x] Chunk-load failure shows a Vietnamese error view with one-shot reload, never a stack trace.
- [ ] Push-to-main cannot silently rebind the frontend to a dead API URL.
- [x] No write path shows success while the backing store ignored the write.
- [x] Malformed filter values, duplicates, and bad FKs return 4xx VI messages, never 500.
- [x] /khach-hang page load fires ≤1 dia-ly fetch and ≤1 ngan-hang fetch.
- [ ] One FilterBar, TableToolbar, StatusBadge, PageHeader contract used by all list pages.
- [x] All declared sub-pages reachable by visible navigation + command palette.
- [x] Technician can filter own tickets and change status without leaving their surface.

## Validation Gates

Per phase: `npm run type-check && npm run lint && npm run test`; UI phases add `npm run test:e2e:uiux`; API phases add `npm run test:api:with-db`. Live-deploy checks re-run the smoke path (login → /khach-hang → cells visible → create/edit round-trip).

## Red Team Review

### Session — 2026-07-13
**Reviewers:** Failure Mode Analyst (Flow Tracer), Assumption Destroyer (Scope Auditor), Scope & Complexity Critic (Contract Verifier). Security Adversary omitted per user's no-security directive.
**Findings:** 30 (26 accepted, 4 rejected/absorbed)
**Severity breakdown:** 3 Critical, 12 High, 15 Medium
**Reports:** `./reports/from-code-reviewer-to-planner-red-team-{failure-mode-analyst,assumption-destroyer,scope-complexity-critic}-plan-review-report.md`

| # | Finding (reviewer) | Sev | Disposition | Applied To |
|---|---|---|---|---|
| FM1 | Seed backfill is a no-op on live DB (`onConflictDoNothing`) | Critical | Accept | P3 (one-shot guarded UPDATE migration) |
| FM2 | P4 refetch removal re-breaks dealer path (no invalidation there) | High | Accept | P2 (invalidation requirement) + P4 (per-consumer precheck, dealer msw test) |
| FM3 | Constraint mapping missed DELETE; self-FK guarantees 23503 | High | Accept | P3 (remove() catch, criterion widened) |
| FM4 | "—" fallback excludes renderCells returning `''` | High | Accept | P1 (normalize at flexRender site; tests pinned to non-geo columns) |
| FM5/AD2 | My-tickets default matches zero tickets; saved-view mechanism phantom | High | Accept | P7 (roster-gated "Phiếu của tôi" chip, no default, no saved-view work) |
| FM6/AD7 | Deploy gate couples deploys to ephemeral ngrok; var-unset blocks first push | High | Accept | P1 (OQ2 precondition, verified var step, retry+skip-gate, api-url empty-string) |
| FM7 | DB probe in /health → restart loops (liveness vs readiness) | Medium | Accept | P1 (/health/ready split) |
| FM8 | Bulk delete: 300 parallel DELETEs vs rate limiter; per-item invalidation persists | Medium | Accept | P2 (chunking, invalidation suppression, 300 removal moved into P2) |
| FM9 | "Zero-diff" fork merge false — forks already disagree | Medium | Accept | P5 (anatomy decision = explicit deliverable) |
| FM10/SC6 | Cross-plan handoff fictional (260707-1612 has no note; one-sided dep) | Medium | Accept | P3 (server guard pulled IN; pointer note deliverable) + plan.md |
| AD1 | diaChi criterion tests the already-safe path; touched-path destroy survives | Critical | Accept | P2 (corrected trigger, composed-non-empty rule, explicit clear affordance) |
| AD3 | Print "non-conforming caller" is a ghost; all 13 sites conform on HEAD | High | Accept | P8 (re-scoped to popup-blocked feedback) + P1 (live-finding re-verification step) |
| AD4 | P4 hook-based lookups break renderCell contract P5 export depends on | High | Accept | P4 (lookups-context contract decision, sequencing, export-disabled window) |
| AD5 | Dealer rewire underscoped (legacy 3-level form; geography dep; P4 collision) | High | Accept | P2 (geography dep + P4 joint-work requirement retained; default later superseded by Validation OQ5 → full rewire) |
| AD6 | pageSize-300 exists in 7 files, plan fixed 1 | Medium | Accept | P2 (both real consumers) + P5 (centralized constant) |
| AD8 | Tab strip: 4 page-local forks unconsolidated; P6 would create a 5th | Medium | Accept | P5 (extraction + 4 admin consumers) + P6 (mount-only) |
| AD9 | mustChangePassword: 3rd/4th state copies; redirect-loop unspecified | Medium | Accept | P3 (JWT-claim decode = single source; /doi-mat-khau exclusion) |
| AD10 | "Invalidate once" contradicted by per-mutation onSuccess invalidation | Medium | Accept | P2 (explicit suppression option) |
| SC1 | P5 reimplements FilterPanel (21 consumers) via 4-consumer CrudFilterBar | Critical | Accept | P5 (converge INTO FilterPanel; Xuất Kho stays) |
| SC2 | "Create status-badge.tsx" — exists; dashboard already migrated | High | Accept | P5 (adoption of 3 forks) + plan.md root-cause #5 corrected |
| SC3 | P5 criteria exceed file list; unbounded sweeps | High | Accept | P5 (5a/5b split, explicit checklist, scoped export sweep) |
| SC4 | Bán hàng: persistence+toast already exist; real cause = branchId + invalidation; wrong path | High | Accept | P2 (re-scoped to the two real defects; correct file paths) |
| SC5 | Dealer default reverses README scope freeze while OQ unresolved | High | Accept | P2 flipped to feedback-only pending decision; Validation OQ5 then explicitly unfroze the flow → full rewire (user decision, README to be updated) |
| SC7 | P3∥P4 declared but file lists collide; phantom path; inflated refetch count | Medium | Accept | plan.md graph + P4 deps [1,3], corrected paths/counts |
| SC8 | SCBH toolbar double-planned P5+P7; PrintMenu exists unused | Medium | Accept | P7 owns toolbar; P5 clause removed; PrintMenu adopted |
| SC9 | Non-finding redesign items (sidebar reorder, login masthead, KPI grid) | Medium | Accept | P6/P8 trimmed; parked in Deferred Follow-ups |
| SC10 | Verification gold-plating (fuzz, screenshot gates, wire-count pins, 15 snapshots) | Medium | Accept | P3/P4/P5/P7 (enumerated tables, cache-based dedup asserts, 1 snapshot + map test) |
| FM (misc) | Health-gate runtime≠buildtime caveat | Medium | Accept (noted) | P1 risk note |
| AD (systemic) | Stale-bundle confound on all live-only evidence | High | Accept | P1 step 9 (re-verification list) + P8 consumption |
| SC (verified-clean tally) | 13 plan claims grep-confirmed correct | — | No action | — |

### Whole-Plan Consistency Sweep
- Files reread: plan.md + all 8 phase files (post-edit)
- Decision deltas checked: 12 (backfill mechanism, dealer default, diaChi trigger, Bán hàng cause, FilterPanel direction, StatusBadge create→adopt, tab-strip owner, toolbar owner, P4 deps, mustChangePassword source, health split, my-tickets chip)
- Reconciled stale references: 9 (root-cause #5 rewritten; dependency graph redrawn; P2/P3/P4/P5/P6/P7/P8 cross-references updated; OQ5 reworded; deferred list added)
- Unresolved contradictions: 0

## Deferred Follow-ups (parked, not planned)

- Kho + Xuất Kho module merge (journey-report sketch; product decision).
- Sidebar frequency reorder + admin group divider (revisit after 260707-1612 phase 2 permission-driven nav).
- Login-page brand masthead (F-A22, Low).
- Full SCBH/KT route merge via role presets (P7 stretch, gated on OQ4).
- Command-palette entity search (phiếu id / customer phone).

## Validation Log

### Session 1 — 2026-07-13 (5 questions, all open questions resolved)

| # | Question | Decision | Propagated To |
|---|----------|----------|---------------|
| OQ2 | Sanctioned API origin | **Keep ngrok tunnel** — accepted operational cost: every tunnel restart requires `vars.API_URL` update + redeploy; recommend a reserved ngrok domain to stabilize | P1 (gate strategy, risk note) |
| OQ1 | `khach_hang.branch_id` semantic | **Creator's branch** — API's existing create-stamp is correct; seed's province-derivation gets aligned to it; branch-switcher SHOULD visibly scope customer data | P3 (docs, seed alignment), P8 (switcher = real scoping variant) |
| OQ5 | "Thêm Đại Lý" scope | **Full API rewire** — user unfroze the flow: route through `persistCustomer` with normalized street/province/commune address; lands as joint P2+P4 work | P2 (rewire = default, not stretch), P4 (joint dependency) |
| OQ4 | SCBH-KT parity | **Differentiate in place** — KT stays; gains status-change row action + roster-gated "Phiếu của tôi" chip; merge stays parked | P7 (default confirmed; stretch remains parked) |
| OQ3 | Seeded address codes | **Both** — one-shot guarded UPDATE migration AND permanent fallback-render chain (modern code → legacy name) for future legacy imports | P3 (migration + fallback render) |

Verification pass: skipped per validate-workflow guard — `## Red Team Review` already contains a full evidence-backed verification (30 findings, 13 plan claims grep-confirmed, consistency sweep clean).

### Whole-Plan Consistency Sweep (post-validation)
- Files reread: plan.md + all 8 phase files (grep sweeps: `OQ[1-5]|open question`, `feedback-only|stretch|informational|hide the button` — all remaining hits are historical red-team log lines, annotated as superseded)
- Decision deltas checked: 5 (ngrok origin, creator-branch, dealer full rewire, KT differentiate-in-place, backfill+fallback both)
- Reconciled stale references: 11 (P1 precondition + step 5 + risk note; P2 architecture/files/steps/criteria/risks; P3 backfill+branch blocks + step 6/8 + docs bullet; P4 dealer joint-work + criterion; P7 decision gate; P8 branch-selector requirement/files/criterion; plan.md red-team rows AD5/SC5 annotated)
- Unresolved contradictions: 0

## Open Questions

None — all five resolved in Validation Session 1 (see Validation Log).
