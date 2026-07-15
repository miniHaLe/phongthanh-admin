---
phase: 6
title: "Finance: chứng-từ, công-nợ, invoices (BUILD)"
status: pending
priority: P1
dependencies: [4, 5]
---

# Phase 6: Finance — chứng-từ, công-nợ, invoices (BUILD)

> **Net-new transactional build, not a port** (verified): the mock has display shapes,
> not transactional integrity. Real finance needs atomic settle-transactions, per-ticket
> receivables tied to repair, and invoice totals computed from lines.

## Overview

Build the finance domain on real tables: chứng-từ (12-type vouchers with collection
state), công-nợ (per-ticket receivables with the invariant `con_lai = so_tien − da_tra`,
settled atomically via a chứng-từ), and hóa-đơn (VAT invoices with totals computed from
line items). Money is `bigint` VND throughout.

## Requirements

- Functional: chứng-từ CRUD + Phiếu Thu/Phiếu Chi create flows + per-row print; công-nợ
  list is per-ticket receivables, settle-debt action creates a thu voucher AND decrements
  `con_lai` in one transaction; invoice composer persists header + lines, VAT + totals
  computed server-side from lines.
- Non-functional: TDD on the invariants (receivable never goes negative unless allowed;
  settle is atomic; VAT math); money `bigint`; branch-scoped; permission-gated (`duyet`,
  Phiếu Thu/Chi actions).

## Architecture

**Tables (entity map §finance):**
```
chung_tu       # 12 loai_thu_chi types; trang_thai = collection state
               #   (chua_thu/da_thu/da_thu_ngoai/chua_chi/da_chi); so_tien bigint;
               #   FK phieu_sua_chua_id? (source doc), khach_hang_id?, nguoi_thu_chi,
               #   ngay_thu_chi, branch_id, BaseEntity
cong_no        # per-ticket receivable: phieu_sua_chua_id, khach_hang_id, ky_thuat_id,
               #   so_tien bigint, da_tra bigint, con_lai bigint (= so_tien - da_tra,
               #   enforced), branch_id   — NO Hạn TT / wall-clock overdue (parity M1)
hoa_don        # ma_hoa_don, mst, hinh_thuc_thanh_toan, nguoi_lap, vat_rate,
               #   tong_tien_hang bigint, tien_vat bigint, tong_cong bigint, branch_id
hoa_don_item   # hoa_don_id, hang_hoa_id, so_luong, don_gia bigint, thanh_tien bigint
```
**Invariants (DB + service):**
- `cong_no.con_lai = so_tien − da_tra` — enforced in the settle transaction; a CHECK
  constraint (`con_lai >= 0` unless an explicit overpay flag) guards it.
- **Settle-debt is one transaction:** insert a `chung_tu` (thu) row + increment
  `cong_no.da_tra` + recompute `con_lai`. Either both or neither.
- **Invoice totals computed from lines:** `thanh_tien = so_luong × don_gia`;
  `tong_tien_hang = Σ thanh_tien`; `tien_vat = round(tong_tien_hang × vat_rate/100)`
  (integer VND rounding rule documented); `tong_cong = tong_tien_hang + tien_vat`.
  Never trust client-sent totals — recompute server-side.

**Coordinates with P4/P5:** công-nợ receivables are created from repair tickets (P4);
invoice lines reference hàng-hóa and may pull cost from the warehouse ledger (P5).

## Related Code Files

- Create: `api/src/finance/**` — chung_tu / cong_no / hoa_don / hoa_don_item schemas
  + migrations; settle-debt transaction service; invoice-total service; controllers
  (permission-gated: `chung-tu:duyet`, Phiếu Thu/Chi, invoice create).
- Modify: `src/mock/finance-mock.ts` + `src/config/finance-tables/*` consumers → `apiFor`
  + real endpoints; the settle modal + invoice composer point at real endpoints;
  `VITE_REAL_RESOURCES`.
- Reference (read-only): `src/mock/finance-mock.ts`, `src/config/finance-tables/{thu-chi,
  cong-no,hoa-don}.config.ts`, entity map §finance.

## Implementation Steps

1. **TDD — invariants:** settle-debt atomicity (voucher + da_tra + con_lai in one tx;
   rollback on failure leaves all three unchanged); `con_lai` CHECK; invoice VAT/total
   recomputation ignores client-sent totals; 12-type + collection-state transitions.
2. **Schemas + migrations** for the 4 tables; seed from a **FROZEN ticket-snapshot fixture
   shared with Phase 4 (Finding 11)** — NOT re-derived. The mock's `CONG_NO` is
   `MOCK_TICKETS.filter(t=>t.chiPhiThucTe>0).slice(0,60)` with `cn-sc-${t.id}` FKs
   (`cong-no.ts:33-49`) and RNG-repicked `branchId`/`tenKhachHang` at import
   (`finance-mock.ts:48-51`); if P4 and P6 snapshot different ticket sets (KT-board ≥10 is
   probabilistic), FKs orphan. Freeze one fixture, seed both domains from it, validate FK
   closure + fail loud.
3. **Chứng-từ module:** CRUD + Phiếu Thu/Chi create + per-row print data + `duyet` action.
4. **Công-nợ module:** per-ticket list + settle-debt transaction service.
5. **Invoice module:** composer persistence + server-side total/VAT computation.
6. **Flip + regression:** finance resources real; invariant + concurrency tests green;
   finance MSW contract tests green (suite re-baselined); verify settle-debt persists +
   updates the ledger + công-nợ across reload.

## Success Criteria

- [ ] `con_lai = so_tien − da_tra` holds; CHECK prevents illegal negatives.
- [ ] Settle-debt is atomic (voucher + da_tra + con_lai) — verified by a rollback test.
- [ ] Invoice VAT + totals computed server-side from lines; client-sent totals ignored.
- [ ] Chứng-từ 12-type + collection state; `duyet` permission-gated.
- [ ] Money `bigint` VND throughout; branch-scoped.
- [ ] Finance MSW contract tests green; frontend suite re-baselined (white-box
      finance-mock tests retired).

## Risk Assessment

- **Settle-debt LOST-UPDATE race (Finding 6 — the mock hides it)** → `finance-mock.ts:130`
  is a single-threaded read-modify-write with a `Math.min` clamp; a naive port inherits
  false safety. Concurrent settles under READ COMMITTED lose an update (money lost) or trip
  the `con_lai >= 0` CHECK → 500 → retry (the app models 3% transient failure,
  `finance-mock.ts:132`) → **duplicate `chung_tu`**. Mitigation: atomic guarded UPDATE
  (`WHERE con_lai >= :amt`, 0-rows → domain 409, not a CHECK 500), `SELECT … FOR UPDATE`,
  and an **idempotency key** on settle so a retry can't double-post. A rollback test proves
  single-tx atomicity but NOT concurrency — add a concurrent-settle test.
- **VAT rounding** → pick + document one integer-VND rounding rule (round half up);
  test boundary cases.
- **Receivable/repair coupling** → công-nợ rows are created from ticket events (P4);
  test the create-from-ticket path so receivables don't orphan.
- **Client total tampering** → server recomputes; never persist client totals — tested.

## Voucher code contract delivered upstream (2026-07-15)

Finance mock create paths now emit `PTT-yyyymm-N` and `PCC-yyyymm-N`, with
independent per-prefix monthly ordinals. Real finance writes and settle-debt
transactions MUST allocate these codes atomically on the server; legacy seeded
codes are ignored when determining the next new-format ordinal.
