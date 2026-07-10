---
phase: 5
title: "Warehouse stock-movement ledger (BUILD)"
status: pending
priority: P1
dependencies: [4]
---

# Phase 5: Warehouse stock-movement ledger (BUILD, not migrate)

> **This is a NET-NEW BUILD, not a migration.** Verified against the code: the mock's
> inventory is fabricated from a seeded RNG — `tonDauKy(ky)` re-runs a chain from k=0 on
> every call and `deltaFor()` reseeds a fresh RNG per call; the "mutations" flip status
> flags on unrelated rows and never move stock. There is **no ledger and no source
> documents to port.** A real product must construct the ledger from scratch. Start with
> a design spike.

## Overview

Build a real inventory system: a `stock_movement` ledger (every nhập/xuất/chuyển voucher
line writes one immutable row) as the source of truth, voucher-entry endpoints + UI, and
a `stock_period_snapshot` (per Kỳ × kho × hàng-hóa) written at period-close as a read
cache matching the mock's `InventoryRow` shape. Tồn kho becomes a ledger aggregation, not
an RNG output.

## Requirements

- Functional: voucher entry (Nhập kho, Cấp LK, Bán hàng, Trả hàng 4-type, Chuyển kho ×2)
  writes stock_movement rows in a transaction; inventory views (Xem Tồn Kho + LK Xác +
  Kỹ Thuật) read aggregated balances; DSCapLK/DSTraLK/DSTraLKXac reflect real
  parts flows; the parity carry-forward invariant holds:
  `tonDauKy(ky) = tonCuoiKy(prevKy)`, `tonCuoiKy = tonDauKy + Σnhập − Σxuất`.
- Non-functional: money `bigint` VND (giá vốn, tổng tiền); negatives possible
  (unclamped, as the mock allowed); TDD on the ledger math; branch-scoped; each voucher
  action permission-gated.

## Architecture

**Design spike (step 0):** confirm the ledger grain + snapshot strategy before schema.
Recommended (verified as the correct call):
```
stock_movement        # IMMUTABLE ledger. one row per voucher line:
                      #   id, ky_id, branch_id, nha_kho_id, ngan_chua_id, hang_hoa_id,
                      #   ky_thuat_id?, loai (nhap|xuat|chuyen_in|chuyen_out|tra|...),
                      #   so_luong (signed), gia_von (bigint), voucher_id, voucher_type,
                      #   created_by, created_at
stock_period_snapshot # READ CACHE, written at Kỳ-close:
                      #   ky_id, branch_id, nha_kho_id, hang_hoa_id, ton_dau_ky,
                      #   nhap, xuat, ton_cuoi_ky, gia_von, tong_tien  (= mock InventoryRow)
voucher tables        # phieu_nhap_kho, phieu_xuat (cap_lk/ban_hang/tra_hang/chuyen_kho)
                      #   header + line items; each line writes a stock_movement row
```
**Tồn kho read** = latest closed `stock_period_snapshot` for the from-Kỳ + on-the-fly sum
of `stock_movement` since that snapshot. Do **NOT** recurse from k=0 over unbounded
history (the mock's approach won't scale). Snapshot at period-close bounds the sum.

**Kỳ (period) entity** already exists (seeded P1/P3). Period-close is an operation that
computes + writes the snapshot for a Kỳ, then that Kỳ's balances are immutable.

**Coordinates with Phase 4:** repair parts-issue (`cap-linh-kien`) writes a
`stock_movement` (xuat) row; parts-return writes a `tra` row. The P4 stubs get wired to
real ledger movements here.

## Related Code Files

- Create: `api/src/warehouse/**` — stock_movement + snapshot + voucher schemas +
  migrations; ledger service (aggregation + carry-forward); period-close service; voucher
  services + controllers (permission-gated); inventory read services for the 3 views +
  DSCapLK/DSTraLK/DSTraLKXac.
- Create (frontend): voucher-entry wiring is mostly present (the P5-parity editors exist)
  — point them at real endpoints; the NEW surface is period-close (admin action).
- Modify: `src/domains/warehouse/*` list-fetchers + mutations → `apiFor` + real endpoints;
  `VITE_REAL_RESOURCES`. Wire P4 parts stubs to the ledger.
- Reference (read-only): `src/domains/warehouse/{types,mock-data}.ts` (InventoryRow shape
  to reproduce), `warehouse-domain.test.ts` (the carry-forward invariant to preserve),
  entity map §warehouse.

## Implementation Steps

1. **Design spike:** confirm ledger grain, snapshot-at-close strategy, and the
   read-path (snapshot + delta). Write it into this phase's notes before schema.
2. **TDD — ledger math:** given a sequence of stock_movement rows across Kỳs, assert
   `tonCuoiKy = tonDauKy + Σnhập − Σxuất` and `tonDauKy(ky) = tonCuoiKy(prevKy)`; assert
   period-close snapshot equals the live aggregation; assert negatives are unclamped.
3. **Schemas + migrations:** stock_movement, snapshot, voucher headers + lines.
4. **Ledger + period-close services;** inventory read services for the 3 tồn-kho views +
   the parts lists.
5. **Voucher services + controllers** (nhập/cấp/bán/trả/chuyển), each writing movements
   in a transaction, permission-gated; wire P4 parts endpoints to real movements.
6. **Seed strategy:** since the mock has no real vouchers, seed an initial
   `stock_period_snapshot` (opening balances) + a modest set of demo movement rows so the
   views render meaningfully post-deploy. **Document that go-live inventory numbers differ
   from the mock's RNG values** — this is expected and correct.
7. **Flip + regression:** warehouse resources real; the `warehouse-domain` invariant test
   (ported to hit real aggregation) green; warehouse MSW contract tests green (suite
   re-baselined); verify a voucher entry moves stock and the tồn-kho view reflects it
   across reload.

## Success Criteria

- [ ] `stock_movement` is the immutable source of truth; every voucher line writes a row
      in a transaction.
- [ ] Tồn kho = snapshot + since-snapshot delta; carry-forward invariant holds
      (`tonDauKy(ky) = tonCuoiKy(prevKy)`); period-close snapshot == live aggregation.
- [ ] All 3 inventory views + DSCapLK/DSTraLK/DSTraLKXac read real balances; money is
      `bigint` VND; negatives unclamped.
- [ ] Repair parts-issue/return (P4) write real ledger movements.
- [ ] Voucher endpoints permission-gated + branch-scoped.
- [ ] Go-live inventory-number change is documented (not a silent surprise).
- [ ] Warehouse MSW contract tests + ledger math tests green; frontend suite re-baselined.

## Risk Assessment

- **This phase is the biggest scope + liability** (verified as the underestimated third)
  → the design spike is mandatory before any schema; timebox it and get sign-off on the
  ledger grain.
- **Unbounded aggregation cost** → snapshot-at-close bounds the since-sum; index
  stock_movement on (ky_id, branch_id, nha_kho_id, hang_hoa_id).
- **No source documents to migrate** → seed opening balances + demo movements; be explicit
  that numbers change on go-live; don't fake continuity with the RNG values.
- **Period-close concurrency race (Finding 6 — Critical for this phase)** → a voucher post
  committing between the close's aggregation and the immutability flip permanently freezes
  drift into every downstream `tonDauKy`; partial close is indistinguishable from complete.
  Mitigation: a **Kỳ state machine + lock** (open → closing → closed); reject posts to a
  closing/closed Kỳ; all-or-nothing snapshot write; a close-time `snapshot == live
  aggregation` assertion that aborts the close on mismatch.
- **Concurrency / double-post** → voucher post is transactional + idempotent (voucher_id
  unique); a movement can't be written twice for the same line.
- **Negative stock: WARN, don't block (V2 validation-locked).** <!-- Updated: Validation
  Session 1 - negative stock decided --> A voucher that drives on-hand negative is allowed
  but logged/flagged (an audit warning), never rejected. This matches the mock's
  permissiveness and avoids blocking out-of-order data entry. Do NOT add a hard `< 0` block.
- **Coupling to repair (P4)** → the parts↔movement wiring is the integration seam; test
  it end-to-end (issue part on a ticket → stock decrements).
