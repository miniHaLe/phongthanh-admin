# Backend Database Entity + Endpoint Map

Grounding: `src/mock/masterdata/{index,make-mock-api}.ts`, `khach-hang/san-pham/khu-vuc/nhan-vien.mock.ts`, `src/domains/repair/{types,status,mock-mutations}.ts`, `src/domains/warehouse/{types,mock-data}.ts`, `src/mock/finance-mock.ts`, `src/store/permission-store.ts`, `src/mock/seed/{index,ky,branches}.ts`.

## 0. Conventions (apply to every table)

- **`BaseEntity`** columns on all tables: `id` (PK), `created_at` (timestamptz not null), `updated_at` (timestamptz null), `active` (bool not null default true). Add audit: `created_by`, `updated_by` (FK `users.id`), and `branch_id` where tenant-scoped.
- **IDs**: mock uses opaque strings (`kh-1`, string counter). Real backend → use `uuid` PK, keep a `code`/`ma` business key where the mock has `maSP`/`maNV`/`maHH`.
- **Soft-delete**: mock `remove()` hard-splices; but every entity carries `active`. Decision: keep `active` as the soft-delete/enable flag (the UI already filters on it) and make `DELETE` set `active=false` for referenced masterdata; hard-delete only for leaf rows with no FK children.
- **vi-collation**: search + sort use `localeCompare(…, 'vi')`. In Postgres create a `vi-x-icu` collation (ICU) and apply it to text columns used for sort/search (`ten*`, names). Alternatively `unaccent` + `pg_trgm` for search. This is a **must-configure**, not automatic.
- **Pagination/list contract**: every list endpoint mirrors `ListParams` → `{ page, pageSize, sort, dir, search, filters }` and returns `PagedResult` → `{ data, total, page, pageSize }`. This is the single seam the SPA's TanStack Query layer already speaks; the backend should preserve it verbatim so `MockApi<T>` is swapped 1:1 for an HTTP client.
- **Branch (chi nhánh)** = tenant dimension. Only 3 branches (`dak-lak`, `dak-nong`, `ctv-tuyen-huyen`); `'all'` is a UI-only selector, NOT a row. Put `branch_id` FK on every transactional table; masterdata is mostly global (shared across branches) — confirm per table.

---

## 1. Simple CRUD tables (the ~44 `makeMockApi<T>` entities)

Grouped by module. Only key columns + FKs listed.

### 1a. Catalog / product masterdata
| Table | Key columns | FKs |
|---|---|---|
| `nhom_san_pham` (product group) | ten_nhom_sp | — |
| `san_pham` (product/service) | ma_sp, ten_sp, tien_khoan | nhom_san_pham_id |
| `nhom_hang_hoa` (goods group) | ten | — |
| `hang_hoa` (goods/parts SKU) | ma_hh, ten_hh, gia_nhap, gia_von | nhom_hang_hoa_id, don_vi_tinh_id, nha_san_xuat_id |
| `nha_san_xuat` (manufacturer) | ten | — |
| `model` (device model) | ten | san_pham_id / nha_san_xuat_id |
| `don_vi_tinh` (unit) | ten | — |
| `loi_sua_chua` (fault catalog) | ten | — |
| `thoi_han` (warranty term) | ten, so_ngay | — |
| `phi_giao` (delivery fee) | ten, so_tien | — |

### 1b. Location / route masterdata
| Table | Key columns | FKs |
|---|---|---|
| `tinh` (province) | ten | — (may stay a static lookup, see §4) |
| `quan` (district) | ten | tinh_id |
| `phuong_xa` (ward) | ten | quan_id, tinh_id |
| `khu_vuc` (delivery route) | ten_khu_vuc, cay_so, tien_cong, tien_cong_2 | tinh_id, quan_id, xa_id |
| `nha_kho` (warehouse) | ten_nha_kho | branch_id |
| `ngan_chua` (bin/shelf) | ten | nha_kho_id |

### 1c. Customer
| Table | Key columns | FKs |
|---|---|---|
| `nhom_khach_hang` (customer type, 9-value) | ten | — (may stay static lookup) |
| `khach_hang` | ten_kh, dien_thoai, dien_thoai_2, email, dia_chi, nguoi_tao, ghi_chu | loai_khach_hang_id, phuong_xa_id, quan_id, tinh_id, **dai_ly_id (self-FK → khach_hang)** |

Note self-referencing `dai_ly_id` (dealer/parent) on `khach_hang` — recursive FK, dealers have null parent.

### 1d. HR / org masterdata
| Table | Key columns | FKs |
|---|---|---|
| `chi_nhanh` (branch) | ten (this backs the tenant dim, see §3) | — |
| `phong_ban` (department) | ten | — |
| `chuc_vu` (job title) | ten | — |
| `nhan_vien` (employee) | ma_nv, ho_ten, gioi_tinh, ngay_sinh, sdt, email, luong_co_ban, cmnd, so_tai_khoan, ma_so_thue, locked | chi_nhanh_id, phong_ban_id, chuc_vu_id, ngan_hang_id, **phu_cap_ids (M:N → phu_cap)** |
| `ngan_hang` (bank, HR domain) | ten | — |
| `phu_cap` (allowance, HR domain) | ten, so_tien | — |
| `ung_luong` (salary advance) | so_tien, ngay | nhan_vien_id, ky_id |

`nhan_vien.phu_cap_ids` is an array in the mock → **needs a join table** `nhan_vien_phu_cap (nhan_vien_id, phu_cap_id)`. Flag §4.

### 1e. Auth / permission masterdata (also see §3 for enforcement)
| Table | Key columns | FKs |
|---|---|---|
| `nguoi_dung` (user) | ten_dang_nhap, ho_va_ten, email | nhom_quyen_id, nhan_vien_id, chi_nhanh_id |
| `nhom_quyen` (role/group) | ten | — |
| `menu` (menu node, ~50) | ten, path, icon, thu_tu | parent_id (self-FK, tree) |
| `chuc_nang` (function group + action leaf) | ma, ten, mo_ta | parent_id (self-FK: group→leaf) |

### 1f. Finance / period lookups (small, mostly static)
| Table | Key columns | Notes |
|---|---|---|
| `ky` (accounting period) | ten (`M/YYYY`), thang, nam | Static-generated 1/2018→7/2026. See §4 — likely a computed lookup, not a mutable CRUD table. |
| `hinh_thuc_thanh_toan` (payment method) | ten | Static lookup (Tiền mặt/Chuyển khoản/Công nợ). |
| `loai_thu_chi` (voucher type, 12) | ten | Static lookup — see §2c. |

---

## 2. Bespoke aggregates (real schema design required)

### 2a. Repair tickets
The mock `RepairTicket` is a fat embedded object (snapshots + arrays). Normalize into a header + child tables. Snapshot fields (`khachHang` embedded, `kyThuat` name, `tenSanPham`) should become FKs **plus** optional denormalized snapshot columns for historical accuracy (customer/tech name at time-of-service — repair tickets are legal/warranty records, so snapshot is justified, not premature).

**`repair_ticket`** (header)
- `so_phieu` (display no, e.g. `PSC-226297`), `so_phieu_hang`, `so_phieu_dai_ly`, `so_serial`
- `branch_id` FK, `ky_id` FK (Kỳ hoàn tất)
- `tinh_trang` (status enum — see §4, the 15-value non-contiguous set), `hinh_thuc` (enum: bao_hanh/sua_dich_vu/bh_sua_chua), `loai_bao_hanh` (enum tai_tram/nha_khach), `warranty_at` (0|1)
- flags: `is_overdue`, `is_quick`, `la_may_da_sua`
- FKs: `khach_hang_id`, `nha_san_xuat_id`, `san_pham_id`, `model_id`, `ky_thuat_id` (→ nhan_vien)
- snapshots: `khach_hang_snapshot` (jsonb or flat cols), `ten_san_pham`, `ky_thuat_name`
- money: `gia_bao_gia`, `chi_phi_du_kien`, `chi_phi_thuc_te`, `chi_phi_linh_kien`, `chi_phi_nhan_cong`
- text: `mo_ta_loi`, `noi_dung_sua_chua`, `cach_giai_quyet`, `phu_kien_kem_theo`, `ghi_chu`, `noi_mua`
- dates: `ngay_nhan`, `ngay_hen_tra`, `ngay_giao`, `ngay_sua_xong`, `ngay_hoan_thanh`, `ngay_mua`
- `nguoi_nhan`

**Child tables** (each 1:N off `repair_ticket_id`):
- `repair_status_history` — status, changed_at, changed_by, note, gia, noi_dung_sc. **Append-only; this is the audit trail — never UPDATE, only INSERT.** Current `repair_ticket.tinh_trang` is a denormalized cache of the latest row here.
- `repair_dispatch_log` — ky_thuat, ngay_tao, nguoi_tao, tien_cong, tinh_trang, ngay_huy, nguoi_huy (technician dispatch journal).
- `repair_parts_issued` — ten, so_luong, ngay_cap, nguoi_cap (+ FK hang_hoa_id). **Must link to warehouse movements — see §2b integration note.**
- `repair_parts_returned` — ten, so_luong, ngay_tra, nguoi_tra (+ FK hang_hoa_id).
- `repair_part` (`parts`) — quote/BOM lines: hang_hoa_id, so_luong, don_gia, thanh_tien.
- `repair_branch_transfer_log` — tu_chi_nhanh, den_chi_nhanh, ngay_chuyen, nguoi_chuyen, ghi_chu.
- `repair_media` — url, kind (image|video).
- `repair_loi_sua_chua` — M:N join to `loi_sua_chua` (mock stores `loiSuaChua: string[]`).

Mock mutations (`updateTicketStatus`, `dispatchTechnician`, `setQuote`, `checkoutDelivery`, `transferBranch`…) all mutate header in place + append history → in the backend these become **transactional service methods** (update header + insert child row atomically), NOT plain CRUD. They are the reason repair cannot use the generic `makeMockApi` seam.

### 2b. Warehouse inventory — LEDGER vs CARRY-FORWARD (critical decision)

The mock **computes** inventory: `tonDauKy(ky) = tonDauKy(prev) + nhap(prev) - xuat(prev)`, closing `= opening + nhap - xuat`, with per-(product, kỳ) seeded deltas and **no materialized transaction rows, no clamp (can go negative)**. `InventoryRow` is a pure read-model.

**Recommendation: materialize a movements/ledger table.** In a real product the `nhập/xuất` deltas are not random — they are the sum of real documents that already exist as their own entities in the warehouse domain: `receiving_voucher` (Nhập kho), `check_out_slip` (Cấp linh kiện), `selling_order` (Bán hàng), `return_slip` (Trả hàng), `moving_slip` (Chuyển kho), plus repair `parts_issued/returned`. So:

- **`stock_movement`** (the ledger): id, hang_hoa_id, kho_id, ngan_chua_id, branch_id, ky_id, direction (`in`|`out`), qty (signed or direction+qty), gia_von, serial, source_type (`receiving`|`checkout`|`selling`|`return`|`transfer`|`repair_issue`|`repair_return`), source_id (FK to the originating voucher/slip), created_at. Every voucher line writes one movement row.
- **Inventory per Kỳ** then becomes a query: `opening(ky) = Σ movements before ky.start`, `nhap/xuat within ky = Σ movements in [ky.start, ky.end)`, closing = opening + nhap − xuat. Optionally a **`stock_period_snapshot`** materialized table (hang_hoa_id, kho_id, ky_id, ton_dau_ky, nhap, xuat, ton_cuoi_ky) rebuilt/rolled-forward at period close for fast reads — this matches the mock's `InventoryRow` shape exactly.

**Trade-off:**
- *Ledger + on-read compute*: single source of truth, auditable, correct history, supports serial tracking; cost = heavier queries, need indexes on (hang_hoa_id, kho_id, created_at) and careful period-boundary logic.
- *Snapshot-per-period (the mock's shape as a real table)*: fast reads, matches UI 1:1; cost = must be recomputed/reconciled on any back-dated movement, risk of drift from truth. 
- **Do both**: ledger = truth, snapshot = read cache rebuilt at Kỳ close (or on demand). Do NOT ship the mock's "seeded delta with no underlying rows" model — it has no source documents and cannot be corrected or audited.

Negative stock: mock allows it (no clamp). Keep that as a business rule (allow oversell/negative, warn) rather than a DB constraint, unless the business wants a hard block.

Supporting warehouse voucher tables (each header + `_line` child, all `branch_id`-scoped): `receiving_voucher`(+lines), `check_out_slip`, `selling_order`, `return_slip`, `moving_slip` (trang_thai enum Chưa/Đã/Không xác nhận), `issued_part_usage` (DSCapLK), `part_return` (DSTraLK, trang_thai Chờ/Đã duyệt), `part_return_xac` (DSTraLKXac, trang_thai Chưa/Đã trả hãng). These carry ticket-linkage columns (`so_phieu_sc`, `so_phieu_hang`, `ticket_status_id`) → FK to `repair_ticket`.

### 2c. Finance
- **`chung_tu`** (Thu Chi voucher, 12-type): so_chung_tu, `loai_thu_chi` (enum/lookup, 12 values), `tinh_trang` (2=Đã thu, 4=Đã chi, 5=…), hinh_thuc_id, so_phieu_sc_nk (→ repair_ticket), ky_thuat_id, so_tien, noi_dung, nguoi_tao_id, nguoi_thu_chi_id, ngay_lap, ngay_thu_chi, branch_id, ten_khach_hang (snapshot). The `thanhToanCongNo` / `createPhieuThu` / `createPhieuChi` mutations INSERT here.
- **`cong_no`** (per-ticket receivable): so_phieu (→ repair_ticket), loai_phieu, ngay_lap, ky_thuat_id, `so_tien`, `da_tra`, `con_lai`, customer_id, dien_thoai, branch_id. **Invariant: `con_lai = so_tien − da_tra`.** `thanhToanCongNo` decrements `con_lai`, increments `da_tra`, AND inserts a matching `chung_tu` (Phiếu thu) — must be **one transaction** (mock mutates both arrays in one call). Consider deriving `con_lai` from a `cong_no_payment` child table (payment history) rather than a mutable column, so partial payments are auditable. Reference has receivables only (no payables side).
- **`hoa_don`** (VAT invoice) header: so_hoa_don, ngay_xuat, ten_khach_hang_mua, hinh_thuc_id, ma_so_thue, ten_don_vi, dia_chi, customer_id, `vat_rate`, `tong_thanh_tien`, `tien_thue`, `tong_thanh_toan`, nguoi_lap, branch_id.
- **`hoa_don_item`** (invoice line): hoa_don_id, ma_hang, ten_hang, don_vi_tinh, so_luong, don_gia, thanh_tien. Totals (`tong_thanh_tien`, `tien_thue`, `tong_thanh_toan`) are **computed** from lines + vat_rate — store them (invoices are immutable records) but validate on write.

### 2d. Reports
The 6 reports (`src/mock/reports/*`, KPI + sửa-chữa report + charts) are **read-only aggregations over the above tables** — confirmed. They are queries/materialized views, NOT new base tables:
- `fetchFinanceKpi` = SUM over `chung_tu` (by tinh_trang, period, branch) + SUM `cong_no.con_lai`.
- Repair KPIs = counts/grouping over `repair_ticket` by `tinh_trang` / branch / Kỳ.
- Inventory KPI trio = SUM over the inventory read-model / `stock_period_snapshot`.
Implement as SQL views or endpoint-level aggregate queries; add a materialized view only if a report is slow. No report owns mutable state.

---

## 3. Cross-cutting: users, roles, permissions (with REAL enforcement)

Currently `permission-store.ts` holds two checkbox maps in localStorage with **zero enforcement** (comment: "pure UI mock, no runtime enforcement"). To back the 202-checkbox matrix + ~50-node menu tree with real RBAC:

- **`users`** = `nguoi_dung` (§1e): ten_dang_nhap, password_hash, ho_va_ten, email, nhom_quyen_id (role), chi_nhanh_id, nhan_vien_id, active/locked.
- **`roles`** = `nhom_quyen`.
- **`menu`** — tree via parent_id (~50 nodes).
- **`chuc_nang`** — function groups (parent) + action leaves (Xem/Thêm/Sửa/Xóa + specials like "Xem tồn", "Xuất tồn excel"). ~202 leaves total = the matrix cells.
- **`role_menu_permission`** (backs `menuTreeChecked`): (nhom_quyen_id, menu_id) — which menu nodes a role can see. PK composite.
- **`role_function_permission`** (backs `functionMatrixChecked`, the 202 cells): (nhom_quyen_id, chuc_nang_id) — which action leaves a role holds. PK composite.

**Enforcement**: middleware/guard resolves the user's role → permission set on login (cache in JWT claims or session), and each endpoint declares the `chuc_nang` code it requires (e.g. `khach_hang:Sửa`). Menu tree drives sidebar visibility; function permissions gate the actual API calls. This is the #2 flagged limitation — the tables above make it enforceable server-side; the frontend store becomes a read-cache of the server's permission response, not the source of truth.

**Audit columns**: add `created_by`/`updated_by` (→ users) everywhere; the repair/finance domains already track `nguoi_tao`/`nguoi_thu_chi`/`changed_by` as names — promote these to user FKs + keep name snapshot.

---

## 4. Tricky / risky mappings (flag: won't translate cleanly)

1. **15-status enum, non-contiguous ids** (`RepairStatusId = 1|2|4|6|7|8|9|10|11|12|13|14|15|16|17` — **3 and 5 do not exist**). Map to a `repair_status` lookup table with the exact fixed ids + labels + hex, NOT a Postgres native enum (native enums renumber/reorder badly and the gaps are load-bearing for URL filter serialization). FK `repair_ticket.tinh_trang → repair_status.id`. Preserve ids exactly — they appear in saved URL filter views and the reference's `/ReportStatusTechnician`. Also preserve display-order vs id-order vs KT-board-subset as **separate ordered lists/columns** (the code keeps 3 distinct orderings; do not collapse).

2. **Kỳ period entity**: mock generates 103 monthly periods deterministically from a formula, no stored rows. Options: (a) computed/virtual lookup (derive from year+month, no table) — simplest, but FKs (`repair_ticket.ky_id`, `stock_movement.ky_id`) need a real referencable key; (b) seed a real `ky` table 1/2018→present and roll forward monthly via a job. **Recommend (b)** — a real DB needs a period table for period-close (inventory snapshot) and to FK against. `ky.id` format `ky-YYYY-MM`.

3. **vi-collation**: `localeCompare(…, 'vi')` and case-insensitive substring search are done in JS today. Postgres needs ICU `vi-x-icu` collation on sortable text columns + `unaccent`/`pg_trgm` for accent-insensitive search. Must be explicitly configured; default `C`/`en_US` collation will sort Vietnamese wrong.

4. **Soft-delete via `active`**: uniform flag exists but mock `remove()` hard-deletes. Decide per table (masterdata with children → soft; leaf logs → hard). Filtered lists must default to `active=true`.

5. **Embedded snapshots & arrays that need normalization**:
   - `repair_ticket.khachHang` (embedded Customer object), `loiSuaChua: string[]`, `parts[]`, `images[]`, `dispatchLog[]` → child tables / jsonb (snapshot) as noted §2a.
   - `nhan_vien.phuCapIds: string[]` → `nhan_vien_phu_cap` join table.
   - `khach_hang.daiLyId` self-FK (recursive dealer hierarchy) — watch for cycles on delete.

6. **Warehouse "seeded delta, no underlying rows"** (§2b) — the single biggest non-relational leap. The mock's inventory has no transactions behind the numbers; a real DB must invent the `stock_movement` ledger and wire every voucher to it. Nothing in the current mock produces those rows, so this is net-new backend logic, not a mapping.

7. **Money as JS `number`** — use `numeric(18,2)` (or integer VND, no decimals — VND has no minor unit) not float. Confirm VND-integer with the business; the mock uses plain integers (e.g. `soTien`, `giaVon`).

8. **`tinhTrang` overloaded**: repair uses the 15-status enum; `chung_tu.tinhTrang` (2/4/5) and warehouse slips (`Chưa/Đã xác nhận`) use their OWN small enums. Do not share one status table across domains — three separate lookups.

9. **`branch = 'all'`** is a UI sentinel, never persist it; endpoints treat missing `branch_id` filter as "all branches the user may see" (RBAC-scoped).

---

## Endpoint map (summary)

- **~40 masterdata resources**: uniform REST `GET /api/{resource}` (list, accepts `ListParams`), `GET /:id`, `POST`, `PUT/PATCH /:id`, `DELETE /:id` → returns `PagedResult`/entity. Direct 1:1 replacement of each `makeMockApi<T>`.
- **Repair** (non-CRUD service endpoints): `GET /api/repair/tickets` (rich filters + `statusCounts`), `GET/POST /tickets`, `PATCH /tickets/status` (batch), `POST /tickets/dispatch`, `POST /tickets/:id/quote`, `POST /tickets/:id/checkout`, `POST /tickets/transfer`, `POST /tickets/:id/parts-issue|parts-return|media`, `GET /tickets/:id/history`.
- **Warehouse**: `GET /api/warehouse/inventory?kind=&kyId=&branchId=…` (read-model), `GET/POST` for each voucher type (receiving/checkout/selling/return/moving), each POST writing `stock_movement` rows.
- **Finance**: `GET/POST /api/finance/chung-tu`, `POST /cong-no/:id/thanh-toan` (transactional), `GET /cong-no`, `GET/POST /hoa-don`, `GET /finance/kpi`.
- **Reports**: `GET /api/reports/{name}` (aggregate/read-only).
- **Auth/RBAC**: `POST /api/auth/login`, `GET /api/auth/me` (returns permission set), `GET/PUT /api/roles/:id/permissions` (menu tree + function matrix).

---

## Unresolved questions

1. Money type — VND integer (no decimals) vs `numeric(18,2)`? Mock uses plain integers.
2. `stock_movement` ledger + period-snapshot: adopt full ledger now, or ship snapshot-only first and back-fill the ledger later? (Affects whether negative-stock and back-dated corrections are supported at launch.)
3. Are `tinh/quan/phuong_xa/nhom_khach_hang/hinh_thuc/loai_thu_chi` mutable masterdata or fixed static lookups? Mock treats some as static seed, some as CRUD (`phuong_xa`, `khu_vuc` are CRUD).
4. Hard-delete vs soft-delete policy per masterdata table with FK children — need business confirmation on referential behavior.
5. Multi-branch visibility rule for a user: single home branch, or can a role span branches (RBAC branch scope)?
