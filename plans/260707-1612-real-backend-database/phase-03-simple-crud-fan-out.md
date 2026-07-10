---
phase: 3
title: "Simple CRUD fan-out (~39 tables)"
status: pending
priority: P1
dependencies: [2]
---

# Phase 3: Simple CRUD fan-out (~39 tables)

## Overview

Migrate the remaining simple-CRUD entities (**~37 config-backed tables** — verified:
`grep 'mockApi:' src/config src/mock src/domains` = 37, not 39/44: catalog, location,
customer-adjacent, HR lookups) from mock to real, reusing the proven Phase 1 spine.
Mechanical and parallelizable — each entity is a table + Drizzle schema + sort/filter
allowlist + one `apiFor()` config line + a seeder block, flipped behind the dual-run flag.

> **Dead-config check first (Finding 10):** the config-backed `tonKhoApi`/`nhapKhoApi`
> (`src/config/finance-tables/ton-kho.config.ts`) are **not consumed by any page** — Xem
> Tồn Kho reads bespoke `fetchInventory` (`XemTonKhoPage.tsx:128`), which Phase 5 rebuilds.
> Confirm these inventory config tables are dead before wasting a schema+seeder on them;
> if dead, exclude from the fan-out (they belong to Phase 5's ledger, not here).

## Requirements

- Functional: each entity has a real table, endpoints, filter allowlist, seeded data,
  and its page works against Postgres unchanged. FK relationships enforced (e.g.
  `khach_hang.dai_ly_id` self-FK, `hang_hoa` → nhóm/đvt/nsx, `phuong_xa` → quan → tinh).
- Non-functional: migrate in **FK-dependency order** (lookups before referencing
  entities); TDD per entity (characterization + contract); flip one at a time.

## Architecture

Same generic `CrudService<T>` + `CrudController` from Phase 1. Per entity the only new
artifacts are: a Drizzle schema (columns + FKs + `branch_id` where scoped + audit), a
per-resource `{ searchColumns, filterAllowlist }` config, a seeder block, and the
`apiFor()` swap in the existing config file.

**FK-ordered migration groups (from the entity map):**
1. **Location:** tinh → quan → phuong_xa → khu_vuc; nha_kho → ngan_chua.
2. **Catalog lookups:** don_vi_tinh, nhom_san_pham, nhom_hang_hoa, nha_san_xuat, model,
   loi_sua_chua, thoi_han, phi_giao, nhom_khach_hang.
3. **Catalog entities:** san_pham (Tiền khoán bigint), hang_hoa (gia_* bigint, FKs).
4. **HR lookups:** phong_ban, chuc_vu, ngan_hang, phu_cap, loai_phat_thuong.
5. **Org:** chi_nhanh (already seeded P1 as the branch dim), nhan_vien (M:N phu_cap).

**Static vs CRUD lookups (decide per table):** a few (tinh, nhom_khach_hang 9-value)
rarely change — keep as CRUD tables for uniformity unless there's a reason to freeze
them. Note the decision inline; don't silently drop CRUD.

**Parallelizable:** each entity owns its own table + config line, no shared mutable
state → safe to fan out across implementers with strict file ownership (one entity =
one schema file + one config edit + one seeder block).

## Related Code Files

- Create: `api/src/<module>/*.schema.ts` + migrations per entity; per-resource
  filter/search config; seeder blocks.
- Modify: the ~39 config files under `src/mock/masterdata/*` + `src/config/crud-configs/*`
  (swap `makeMockApi` → `apiFor`); extend `VITE_REAL_RESOURCES`.
- Reference (read-only): entity map §1 (all simple tables + key cols + FKs), each mock
  file's `*_ROWS` (seed source + the field set to reproduce).

## Implementation Steps

1. **TDD per group:** characterization (mock wire shape + vi-sort + filter semantics per
   entity) + backend contract specs (CRUD + FK-constraint violations → VI error).
2. **Migrate group 1 (location)** first — everything downstream FKs into it. Schema +
   migration + seeder + flip + green, per entity.
3. **Groups 2-5** in dependency order; parallelize within a group by file ownership.
4. **FK integrity:** creating a child with a bad parent id → 400/409 with VI message
   (the mock silently allowed it; real DB enforces — this is an improvement, test it).
5. **Regression after each flip:** the entity's MSW contract test green (suite
   re-baselined — the entity's white-box mock test retires); its page verified against
   Postgres.
6. **Batch flip:** once all green individually, flip the whole group in
   `VITE_REAL_RESOURCES` and run the full suite.

## Success Criteria

- [ ] All ~39 simple entities have real tables + endpoints + filter allowlists + seeded
      data; each page works unchanged against Postgres.
- [ ] Migration done in FK order; FK violations return VI errors (not 500s).
- [ ] Money columns (san_pham.tien_khoan, hang_hoa.gia_*) are `bigint` VND.
- [ ] `khach_hang.dai_ly_id` self-FK + location cascades resolve correctly.
- [ ] All simple-entity MSW contract tests green; frontend suite re-baselined (the mock
      white-box unit tests for flipped entities retired, not counted as backend proof).
- [ ] Any "keep as static lookup" decision is documented, not silent.

## Risk Assessment

- **FK order mistakes** → seed + migrate strictly parent-before-child; the seeder's
  FK-ordered insert doubles as the canonical order.
- **Field drift** (a mock field with no column, or vice versa) → characterization test
  pins the exact `T` shape per entity; schema must satisfy it.
- **Fan-out merge conflicts** → strict one-entity-per-file ownership; the shared generic
  CRUD code is NOT edited during fan-out (it was finalized in Phase 1).
- **vi-collation at scale** → the collation is set once (Phase 1); each text sort column
  just references it.
