---
phase: 4
title: "Fetch Efficiency & Determinism"
status: in-progress
effort: "M"
priority: P2
dependencies: [1, 3]
---

# Phase 4: Fetch Efficiency & Determinism

## Overview

Kill duplicate/wasteful fetches and nondeterministic mock behavior: 2× 483 KB dia-ly + 2× ngan-hang per /khach-hang load, per-keystroke request storms, client re-sort corrupting server vi-collation, double refetch after save, 677 KB snapshot bundled eagerly beside the API source, 5% random mock errors and wall-clock seeds shipping to prod.

Findings: F-E3 (=F-D root-cause 2/3), F-E4, F-E7, F-E8 (=F-B10), F-E10, F-E16, F-E6, F-E18, F-D dia-ly caching rec.

**Dependency correction (red-team):** now `dependencies: [1, 3]` — this phase's `khach-hang.config.ts` edits are gated on Phase 3's `daiLyTen` enrichment landing first (the original graph declared P3∥P4 while their file lists collide). The dia-ly `Cache-Control`/compression server work is owned HERE (single owner), not conditionally split with P3.

**renderCell contract decision (red-team):** `khachHangConfig` is a module-scope const whose renderCells are plain sync functions — a hook cannot be called from it. The decided mechanism: column builders accept an optional `lookups` context (plain object of Maps) built by the PAGE from the `['ref-data','dia-ly']` query and passed to BOTH cell render and export accessor. `ColumnConfig.renderCell` gains an optional third arg `(val, row, lookups?)`. This is the same contract Phase 5's `buildCrudColumns`/`exportCrudRows` consume — sequence: Phase 5's builder extraction SHOULD land before this phase's lookup migration (if P5 hasn't landed, implement the lookups arg on the existing duplicated builders and P5 inherits it). Export behavior during the lookup-loading window: export button disabled until the ref-data query resolves (cheap, honest).

## Requirements

- Functional: ≤1 dia-ly and ≤1 ngan-hang request per customer-page visit; table and form show the same geography names; sorted pages preserve server collation; search debounced; mock catalogs deterministic and error-free in prod.
- Non-functional: reference data flows through TanStack Query with explicit keys/staleTime (matches ARCHITECTURE.md `['ref-data', …]` convention).

## Architecture

- `useCustomerReferenceData` is a hand-rolled useEffect fetch bypassing React Query, mounted by TWO always-mounted `CustomerEditorDialog` instances; `vietnam-geography.ts` caches the resolved value, not the in-flight promise. Rewrite as `useQuery(['ref-data','dia-ly'])` (staleTime Infinity) + `useQuery(['ref-data','ngan-hang'])` (long staleTime), `enabled: open`; promise-coalesce the geography fetch as defense in depth.
- Geography single-source: renderCells/filters in `khach-hang.config.ts` statically import the bundled snapshot (677 KB into the chunk, can diverge from server data). Resolve names via the `lookups` context (Maps, not per-cell `Array.find` over 3,321 communes) from the same `['ref-data','dia-ly']` query; static snapshot stays strictly behind the mock path (`vietnam-geography.ts` dynamic import). Server side (owned here): compression middleware + `Cache-Control` (version-keyed `/dia-ly?v=<snapshotVersion>` + immutable preferred).
- Sorting: DataTable always applies `getSortedRowModel()`; server-sorted pages get re-sorted by code-point. Add `manualSorting` wired from CrudTablePage/KhachHangPage.
- **Refetch-removal scope (red-team corrected):** save-path `refetch()` calls exist in exactly ONE file — `KhachHangPage.tsx:266,280,285` (`customer-editor-dialog.tsx:38` and `QuickCreateKhachHang.tsx:31` already use `invalidateQueries`; `them-khach-hang-modal.tsx` is a pass-through). Precondition per consumer: verify each save path has invalidation BEFORE deleting its refetch — the dealer modal has NO invalidation today; Phase 2's approved FULL REWIRE adds it (validated OQ5), and this phase's reference-data hook rewrite is JOINT work with that rewire (the modal's new normalized address trio consumes the same `['ref-data','dia-ly']` query). msw test covers the dealer path explicitly (red-team FM2).
<!-- Updated: Validation Session 1 - OQ5: dealer rewire joint with this phase -->>

## Related Code Files

- Modify: `src/features/customer/use-customer-reference-data.ts` (React Query rewrite, `enabled` gating)
- Modify: `src/api/vietnam-geography.ts` (cache in-flight promise; remains the mock/real switch)
- Modify: `src/features/customer/customer-editor-dialog.tsx` (pass `open` → `enabled`)
- Modify: `src/config/crud-configs/khach-hang.config.ts` (drop static snapshot import; renderCells take `lookups`; AFTER P3's enrichment)
- Modify: `src/types/crud-types.ts` (renderCell optional `lookups` third arg — the contract Phase 5 builders also consume)
- Create: `src/features/customer/use-geography-lookup.ts` (Maps from the dia-ly query for tinh/xa name resolution)
- Modify: `api/src/main.ts` + `api/src/dia-ly/dia-ly.controller.ts` (compression, Cache-Control/version-keyed snapshot)
- Modify: `src/components/shared/data-table/data-table.tsx` + `src/components/crud/CrudTablePage.tsx` + `src/pages/danh-muc/KhachHangPage.tsx` (`manualSorting: true` for server-driven tables; drop client sort model there)
- Modify: `src/components/shared/data-table/data-table-toolbar.tsx` + `src/components/crud/CrudFilterBar.tsx` (~300ms debounce, local controlled input — matches ServerAutocomplete's 250ms convention)
- Modify: `src/pages/danh-muc/KhachHangPage.tsx` (drop the three save-path `refetch()` calls after invalidation precheck)
- Modify: `src/mock/masterdata/make-mock-api.ts` + `src/mock/masterdata/index.ts` (gate `maybeThrow(0.05)` on `import.meta.env.DEV`; keep injection behind an explicit env flag for tests)
- Modify: `src/mock/masterdata/khach-hang.mock.ts`, `nhan-vien.mock.ts` (fixed base timestamp instead of `Date.now()`)
- Modify: `src/features/repair-list/hooks/use-repair-table-columns.tsx` (REF_NOW: session `Date.now()` at module scope OR re-seed dates from fixed base — decide with report Q2; default session-now since data already uses wall clock)
- Modify: `src/pages/danh-muc/ModelPage.tsx` (drop `staleTime: 0`; default/longer staleTime for catalog)

## Implementation Steps

1. React Query rewrite of reference data + enabled gating + promise coalescing; dedup assertion via React Query cache (one entry per `['ref-data',…]` key) — not brittle wire-count pinning (red-team SC10); one msw test covers the dealer-modal path end-to-end.
2. `lookups` contract in crud-types + geography lookup hook; migrate config renderCells/filters; export disabled until ref-data ready; verify snapshot chunk no longer in the khach-hang chunk graph (`vite build` + chunk inspection).
3. dia-ly server caching + compression; verify 2nd visit serves from HTTP cache.
4. `manualSorting` + debounce; vi-collation E2E: sorted page order matches server order (Bảo < Buôn).
5. Remove KhachHangPage save-path refetches (after per-consumer invalidation precheck).
6. Mock determinism: DEV-gate error injection; fixed-base timestamps; dwell fix (non-zero dwell test for open tickets).
7. ModelPage staleTime.

## Success Criteria

- [ ] React Query cache holds exactly one `['ref-data','dia-ly']` and one `['ref-data','ngan-hang']` entry after /khach-hang cold load with both dialogs mounted; manual live check confirms single network fetch each.
- [x] khach-hang route chunk no longer pulls the 677 KB snapshot module in real mode.
- [x] Typing 6 chars in search issues ≤2 requests.
- [x] Sorted list page renders exactly the server's order (Bảo < Buôn).
- [x] Repair "Tồn" column shows non-zero dwell for seeded open tickets.
- [x] No `maybeThrow` in prod builds; mock timestamps stable across reloads.
- [x] Create/edit customer (all three entry points incl. the rewired dealer path) fires exactly one list GET afterwards.
- [x] Export on geography columns emits names once ref-data resolved; button disabled before.

## Risk Assessment

- Async lookups mean geography cells render "—" until the ref-data query resolves (consistent with Phase 1 fallback semantics; staleTime Infinity → one-time cost per session). Do not pin cell-value tests to geography columns during the loading window.
- `manualSorting` on tables that ALSO support client-only columns (sort-only groups on composite tables) — scope this phase to CrudTablePage/KhachHangPage server tables; composite repair tables keep current behavior until Phase 7 touches them.
- Shared-file collisions: this phase edits `khach-hang.config.ts`, `CrudTablePage.tsx`, `KhachHangPage.tsx` — all also touched by P2/P3/P5. Sequencing: P2 → P3 → P4, and P5's builder extraction ideally before step 2 (see contract decision above). Do not run P4 in parallel with P2/P3/P5.
