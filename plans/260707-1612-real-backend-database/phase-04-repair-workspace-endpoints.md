---
phase: 4
title: "Repair workspace endpoints"
status: pending
priority: P1
dependencies: [3]
---

# Phase 4: Repair workspace endpoints

## Overview

Migrate the repair workspace — the app's core domain — from mock mutations to real
transactional endpoints: the ticket aggregate (header + status-history + dispatch-log +
parts-issued/returned child tables), the 15-status workflow, dispatch, quote, batch ops.

> **This is a BESPOKE REWIRE, not a config flip (Finding 1).** The repair surface does
> NOT go through `MockApi<T>`: the list uses `fetchRepairList`
> (`repair-list/RepairListPage.tsx:76`) and **12 files import `mock-mutations.ts`
> directly** (`update-status-modal.tsx:34` etc.). Each mutation call-site is hand-rewired
> to a real endpoint — this is real work, not a `apiFor()` line. Budget accordingly.

## Requirements

- Functional: `phieu_sua_chua` ticket aggregate persisted; status changes go through a
  server-validated transition endpoint (append-only `repair_status_history`, updating the
  denormalized current status); dispatch/quote/parts/checkout as bespoke endpoints;
  the list still returns `PagedResult` so the Index_8 page is unchanged.
- Non-functional: TDD (transition legality + audit trail first); each bespoke endpoint
  carries its `@RequirePermission` code (Phase 2); branch-scoped.

## Architecture

**Aggregate tables (from entity map §repair):**
```
phieu_sua_chua        # header: ma_phieu, khach_hang_id, san_pham_id, model_id,
                      #   trang_thai_id (denormalized cache of latest history), ky_thuat_id,
                      #   branch_id, hinh_thuc, loai_bao_hanh, chi_phi, quote fields, BaseEntity
repair_status_history # APPEND-ONLY audit: ticket_id, trang_thai_id, ghi_chu, gia,
                      #   noi_dung_sc, created_by, created_at  (the source of truth for status)
dispatch_log          # ticket_id, ky_thuat_id, tien_cong, trang_thai, ngay_huy, huy_by
parts_issued          # ticket_id, hang_hoa_id, so_luong, ... (links to warehouse in P5)
parts_returned        # ticket_id, ... (Trả LK / Thu xác)
```
`trang_thai_id` on the header is a **denormalized cache** of the latest
`repair_status_history` row — writes go to history, header is updated in the same
transaction.

**15-status vocabulary + transitions (validation-locked: ALLOW + LOG all).**
<!-- Updated: Validation Session 1 - transitions allow+log, final --> The legacy status set
(ids 1,2,4,6,7,8,9,10,11,12,13,14,15,16,17 from `src/domains/repair/status.ts`) is the
vocabulary. **No transition graph exists in code** (`grep 'transition'
src/domains/repair/status.ts` = 0; `updateTicketStatus` transitions freely). Decision:
**preserve free transitions — allow every status change, record an audit trail, NEVER reject
with a 409.** Do not invent a blocking transition graph (it would break current flows and the
business has not defined one). Header cache + append-only history update atomically regardless.
Transition legality can be tightened later if the business defines rules.

**Bespoke endpoints (each @RequirePermission-gated):**
- `POST /phieu-sua-chua/:id/doi-tinh-trang` (status change + conditional fields + SMS-as-noop)
- `POST /phieu-sua-chua/:id/dieu-phoi-ky-thuat` / `/huy-dieu-phoi` (dispatch lifecycle)
- `POST /phieu-sua-chua/:id/bao-gia` / `/huy-bao-gia` (quote)
- `POST /phieu-sua-chua/:id/cap-linh-kien` / `/checkout` (parts — coordinates with P5)
- `POST /phieu-sua-chua/batch/chuyen-chi-nhanh` (batch transfer)
- Prints/exports reuse the client F7/F8 helpers (server just supplies data).

Maps 1:1 to `src/domains/repair/mock-mutations.ts` function names — but as transactional
service methods, not array splices.

## Related Code Files

- Create: `api/src/repair/**` (schemas + migrations for the 5 tables, transition
  service, dispatch/quote/parts services, controllers with permission decorators, a
  `makeRepairApi` if the list needs a bespoke fetch beyond generic CRUD).
- Modify: `src/domains/repair/mock-data.ts` + `mock-mutations.ts` consumers → point the
  list at `apiFor('phieu-sua-chua', ...)` and mutations at real endpoints; extend
  `VITE_REAL_RESOURCES`.
- Reference (read-only): `src/domains/repair/{status,types,mock-data,mock-mutations}.ts`,
  entity map §repair, `KT_BOARD_STATUS_IDS` for the KT board subset.

## Implementation Steps

1. **TDD — transitions + audit:** specs that ANY status change appends one history row +
   updates the header cache atomically (allow + log — no 409 rejection); an audit warning
   is recorded but the change still applies; dispatch assign→cancel lifecycle; quote
   set→clear; permission-denied per action → 403.
2. **Schemas + migrations** for the 5 tables; seed from `MOCK_TICKETS` (250) preserving
   ids + FK to khach-hang/san-pham/nhan-vien (migrated in P3).
3. **Transition service** (validated state machine, append-only history + header cache
   in one transaction).
4. **Dispatch / quote / parts services** + controllers, each `@RequirePermission`-gated.
5. **List endpoint** returning `PagedResult<RepairTicket>` with the 22-field filter
   allowlist + KT-board subset filter; Index_8 + KT board pages unchanged.
6. **Flip + regression:** `phieu-sua-chua` real; repair MSW contract tests green (suite
   re-baselined — the mock-mutation white-box tests retire); verify the repair workspace
   end-to-end (list, status change persists across reload, dispatch, quote, KT board).

## Success Criteria

- [ ] Ticket aggregate persisted; status changes write append-only history + update the
      header cache in one transaction (survive reload).
- [ ] Every status transition is allowed + audit-logged (never rejected); no blocking
      transition graph invented (validation-locked V3).
- [ ] Dispatch, quote, parts, batch-transfer endpoints work + are permission-gated.
- [ ] Index_8 + KT board pages unchanged; list returns exact `PagedResult`.
- [ ] Seeded from MOCK_TICKETS; KT-board ≥10-per-status still holds (or is re-derived
      from real data — the probabilistic residual becomes moot with real tickets).
- [ ] Repair MSW contract tests green; frontend suite re-baselined (white-box
      mock-mutation tests retired, not treated as backend proof).

## Risk Assessment

- **Denormalized status cache drift under CONCURRENCY (Finding 6)** → same-tx atomicity
  guarantees agreement per transition but NOT that the header reflects the *latest* history
  row under interleaved commits (the mock is single-threaded, `mock-mutations.ts:42-53`, so
  can't show this). Mitigation: `SELECT … FOR UPDATE` the ticket row per transition; a
  concurrent-divergence test (two interleaved transitions → header == latest history), not
  just a same-tx test.
- **Transition rules unknown for some statuses** → the mock didn't enforce them; derive
  the allowed graph from the parity spec + observed legacy behavior; where uncertain,
  allow + log rather than block, and flag for product confirmation (don't invent hard
  rules that break existing flows).
- **Parts endpoints couple to warehouse (P5)** → stub the stock side in P4 (record the
  intent) and wire the real ledger movement in P5; keep P4 shippable with parts as
  metadata until then.
- **SMS/print** → SMS stays a noop/toast (D4 from parity); prints reuse client helpers.

## Voucher code contract delivered upstream (2026-07-15)

The frontend/mock create paths now use `PREFIX-yyyymm-N`, where `N` is the
per-prefix ordinal within the local calendar month and legacy seed codes are
ignored. The real repair create endpoint MUST generate `PSC-yyyymm-N`
server-side with a concurrency-safe per-`(prefix, yyyymm)` sequence; never trust
or reuse a client-provided ordinal.
