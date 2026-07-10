# Red-Team Plan Review — Scope & Complexity Critic (YAGNI)

**Reviewer role:** Scope & Complexity Critic / Contract Verifier
**Plan:** `plans/260703-1908-reference-ui-parity-tdd/` (7 phases, mock-data-only React prototype)
**Verdict:** The plan is spec-faithful and well-decomposed, but carries several premature abstractions and over-scoped builds for a no-backend prototype. Findings below are backed by codebase evidence.

---

## Finding 1: `InventoryView` host abstraction replaces an existing, cheaper config-spread pattern

- **Severity:** High
- **Location:** Phase 5, Architecture "Inventory views" + Implementation Step 5 (`src/features/inventory/inventory-view.tsx` + 3 configs)
- **Flaw:** The plan introduces a *new* parameterized `InventoryView` host so "W2/W3/W4 differ only by config (not forked pages)." But the three pages **already** achieve exactly that today — they share one config via object spread and the generic `CrudTablePage`. The plan replaces a working ~15-line spread pattern with a new bespoke host + 3 config files + `fetchInventory(kind, params)` + a `mock-data.test.ts` pinning period math. That is net-new indirection to reach a state the code is already in.
- **Failure scenario:** Wasted build of a second table-host abstraction that duplicates `CrudTablePage`'s responsibilities (filter bar, pagination, columns). Two divergent table hosts now must be maintained; future column tweaks require knowing which host a page uses. The stated benefit ("share one host") is already delivered for free.
- **Evidence:**
  - `src/pages/quan-ly-kho/TonKhoKyThuatPage.tsx:9,14` → `import { tonKhoConfig }` then `...tonKhoConfig`
  - `src/pages/quan-ly-kho/TonKhoLKXacPage.tsx:9,14` → same spread
  - `src/pages/quan-ly-kho/XemTonKhoPage.tsx:11,60` → `config={tonKhoConfig}`
  - `src/components/crud/CrudTablePage.tsx:73-311` — generic host already renders filters + columns + pagination from a config, no entity code.
- **Suggested fix:** Keep the existing 3 pages on `CrudTablePage` with three column/filter configs (`ton-kho`, `lk-xac`, `ky-thuat`) that spread a shared base. If `CrudTablePage` lacks read-only-mode / KPI-strip / Từ Kỳ-Đến Kỳ, add those as opt-in config flags to the *existing* host (the plan already does this for bulk-select in P6) rather than forking a parallel `InventoryView`. Deletes an entire new feature dir + its tests.

---

## Finding 2: "Full-page line-item editor template" pays weak rent — 6 admittedly-divergent consumers + a bespoke outlier wrapper

- **Severity:** High
- **Location:** Phase 2 R5 + Phase 5 Architecture "Line-item editor template" + Risk "Editor template generality vs 6 divergent grids"
- **Flaw:** The plan builds one `LineItemEditor<TLine>` template, then admits every one of the 6 consumers supplies a *different* header fieldset, a *different* line-entry panel, and a *different* line-grid column set — and that Trả Hàng is an "outlier" needing "a bespoke wrapper over the template rather than bending the template." When the shared surface is "action-footer buttons `Lưu`/`Lưu & Thêm mới` + an add-row" and everything domain-specific is passed in as config/render-props, the abstraction captures almost no duplication while adding a generic-types indirection layer. The line grids verified in the plan itself confirm the divergence: Receiving `Mã|Tên|Ngăn chứa|Số lượng|Đơn giá|Thành tiền|Cập nhật giá|Serial`; Cấp LK 14 cols with `Hình|Serial|Số phiếu|...`; Chuyển Kho cùng vs khác differ by `Ngăn chứa`/`Số lượng chuyển`; Trả Hàng is two-stage. Six shapes, one thin footer in common.
- **Failure scenario:** The template becomes a leaky pass-through: consumers spend effort satisfying a generic contract (`lineColumns` + `headerFields` + `onAddLine` + totals-agg defs) that a plain per-editor component + a shared `SaveBar`/`Thêm dòng` primitive would deliver with less ceremony. The "outlier wrapper" for Trả Hàng is a tell that the abstraction doesn't fit; the net is a template maintained for ~1.5 real reuses of non-trivial logic.
- **Evidence:**
  - Phase 5 Risk Assessment line: *"the Trả Hàng two-stage flow is the outlier — allow it a bespoke wrapper over the template rather than bending the template."*
  - Phase 5 W1b / S1b / S2b / S3b / S4b line-grid column lists (all distinct) — the 6 grids share no column set.
  - No existing line-item editor to preserve: `find src -name "*.tsx"` shows warehouse/stock-out pages are 1.2–2.0K list wrappers only (`src/pages/xuat-kho/BanHangPage.tsx` is 47 lines of `CrudTablePage`), so there is no current duplication being consolidated.
- **Suggested fix:** Ship a small shared **`EditorSaveBar`** (the `Lưu`/`Lưu & Thêm mới`/back buttons) + a **`LineGrid`** dumb table that takes `columns` + `rows` + `onRemove`, and write each of the 6 editors as a plain page composing them. Same reuse of the genuinely-common parts, no generic `LineItemEditor<TLine>` type gymnastics, no outlier-wrapper. Cut the template from P2 scope.

---

## Finding 3: Faithfully rebuilding the 202-checkbox permission matrix + ~50-node menu tree is gold-plating for a no-enforcement mock

- **Severity:** High
- **Location:** Phase 7, "Permissions (phan-quyen)" P1/P2 + Architecture "Permission matrix" + Success Criteria
- **Flaw:** Open decision #3 already states the matrix is a **working mock, localStorage-persisted, with no enforcement**. The plan nonetheless specs pixel-faithful reconstruction: a ~50-node checkbox tree mirroring the sidebar, a `41 groups × Xem/Thêm/Sửa/Xóa + specials = 202 checkboxes` matrix, a `permission-store` zustand slice, a `pt-permissions` localStorage key added to `ALL_STORE_KEYS`, and spec tests asserting the exact node/checkbox counts. Since nothing reads these bits at runtime (no auth, no route guards — grep confirms zero authorization in the app), the 202 checkboxes are decorative state. The current pages are 3 thin config wrappers (`NhomQuyenPage.tsx` 322B, `MenuPage.tsx` 290B, `ChucNangPage.tsx` 320B) over standard CRUD.
- **Failure scenario:** Significant effort (static tree data for ~50 + 41×4 nodes, parent/child toggle logic, persistence, count-assertion tests) sunk into UI that demonstrates nothing a smaller sample can't. The "202" is a spec-count fetish; a representative subtree conveys the same design intent for a demo.
- **Evidence:**
  - Phase 7 P2: *"202-checkbox function-permission matrix (41 groups × Xem/Thêm/Sửa/Xóa + special actions...)"* + Success Criteria bullet asserting all 202 render.
  - `plan.md:96` open decision #3: *"...as working mock, state persisted locally, no enforcement."*
  - Current pages are trivial wrappers: `src/pages/phan-quyen/NhomQuyenPage.tsx` (322B), `MenuPage.tsx` (290B), `ChucNangPage.tsx` (320B); configs `src/config/crud-configs/nhom-quyen.config.ts`, `menu.config.ts`, `chuc-nang.config.ts` are plain column/field lists.
  - No enforcement to satisfy: `grep -rniE "bulk|rowSelection" src/` returns nothing; no authorization layer exists anywhere.
- **Suggested fix:** Build the tree/matrix component generically and feed it the **real hierarchy but render lazily/collapsed**, and drop the "exactly 202 / exactly ~50" count assertions from the TDD plan — assert *structure* (parent toggles children, state persists) on a small fixture, not a magic count. If a full matrix is genuinely wanted for the demo, generate rows from the existing `MENU_ROWS` + a 4-action constant rather than hand-authoring 202 static nodes. Cuts static-data authoring and brittle count tests.

---

## Finding 4: Payroll derivation engine is built on an admittedly-unspecified formula

- **Severity:** High
- **Location:** Phase 6, Architecture "Payroll derivation" + Requirements H8 + Unresolved #1
- **Flaw:** The plan commits to deriving `Công BH`/`Công SC` (technician piece-pay) from `HeSo × Lỗi sửa chữa Tiền Công/Tiền Công DV × completed tickets in Kỳ` and `Thực lãnh` from a full deduction chain — while Unresolved #1 states the exact computation is **"not fully specified."** Building a deterministic derivation engine (per employee × Kỳ, reading labor-price catalog + completed-ticket counts + advances + bonuses/penalties) on an unknown formula is speculative complexity: the engine will encode a *guessed* formula that is likely wrong, for a mock table whose only job is to display plausible numbers.
- **Failure scenario:** Effort spent wiring a multi-input derivation (HeSo feed from employee editor, Lỗi sửa chữa join, Kỳ ticket-count aggregation) that produces numbers no one can validate, then gets reworked when the real formula surfaces. The 17-column table + totals row can be demonstrated with seeded static values at a fraction of the cost.
- **Evidence:**
  - Phase 6 Unresolved #1: *"exact computation of Công BH/Công SC ... and Thực lãnh ... not fully specified; plan uses a documented simple derivation, flag for confirmation."*
  - Phase 6 Architecture: *"Payroll derivation: BangLuong rows derived per employee × Kỳ from seed (lương cứng + phụ cấp + ... → tổng/thực lãnh)."*
  - Phase 6 H7b ties `Phí nhân công money (HeSo → feeds Công BH/SC)` — a cross-entity dependency built for the unspecified formula.
- **Suggested fix:** Seed `Bảng lương` rows with static plausible values per employee × Kỳ (including the `Tạo bảng lương` empty-state CTA), and render the 17 columns + totals from seed. Defer any *live* derivation until the formula is confirmed (Unresolved #1). Keeps the verified/visible parts (columns, totals row, CTA) exact; drops the guessed engine.

---

## Finding 5: P2 line-item-editor template + P6 CrudTablePage `saveAndNew` flag are two overlapping mechanisms for "Lưu & Thêm mới"

- **Severity:** Medium
- **Location:** Phase 2 R5 (LineItemEditor footer `Lưu`/`Lưu & Thêm mới`) vs Phase 6 Architecture (`config.saveAndNew` on CrudSheet) vs Phase 6 Step 1
- **Flaw:** "Lưu & Thêm mới" is specced twice through two different primitives: as a hard-coded footer in the P2 `LineItemEditor` template, and as an opt-in `config.saveAndNew` flag on the existing `CrudSheet`/`CrudTablePage`. Both need the same "save then reset form" behavior and both are tested separately (P2 `line-item-editor.test.tsx`; P6 "CrudTablePage extension: `Lưu & Thêm mới` saves + resets form"). This is parallel implementation of one interaction across two hosts.
- **Failure scenario:** Two save-and-new code paths drift (e.g. one resets autocomplete-create state, the other doesn't); a bug fixed in one is missed in the other. Doubled test surface for one behavior.
- **Evidence:**
  - Phase 2 R5 + Step 8: `LineItemEditor` "action buttons labeled exactly `Lưu` and `Lưu & Thêm mới`."
  - Phase 6 Architecture: "`config.saveAndNew` (`Lưu & Thêm mới`)" on CrudSheet; Step 1 wires it; TDD plan asserts it on CrudTablePage.
  - Existing `src/components/crud/CrudSheet.tsx` (8.5K) already owns single-save; the flag extends it — a separate mechanism from the P2 template.
- **Suggested fix:** Extract one `useSaveAndNew(onSave)` helper (returns `{ save, saveAndNew }`) consumed by both the CrudSheet flag and any full-page editor, so the reset semantics live in one place. Or, if Finding 2 is accepted (no template), this collapses to just the CrudSheet flag.

---

## Finding 6: Full-TDD (characterization → spec → implement) mandated on a zero-test throwaway prototype is over-process outside the P1 hot spot

- **Severity:** Medium
- **Location:** plan.md "TDD Contract (applies to every phase)" + every phase's TDD Plan §1 characterization step
- **Flaw:** The repo has **zero** existing tests, and this is an explicitly mock-data-only prototype (no backend, no persistence, no auth). The plan mandates, for *every* phase, writing characterization tests to "lock current behavior" *before* changes — including for pages that are 47-line `CrudTablePage` wrappers with no logic to regress (e.g. `BanHangPage.tsx`). Characterization tests earn their keep where behavior is subtle and must survive a refactor; snapshotting "this page renders rows from its mock fn" for a config wrapper is phantom coverage that executes code without proving meaningful behavior.
- **Failure scenario:** Large test-authoring cost (characterization + spec, both, per page across ~50 pages) that mostly re-asserts column-header arrays already declared in config files — tests that pass trivially and lock the plan to header strings, raising the cost of any later spec correction (Unresolved items note several headers are still unverified).
- **Evidence:**
  - `find src -name "*.test.*"` → **0 files** (confirmed no current tests).
  - `src/pages/xuat-kho/BanHangPage.tsx` (47 lines) and `NhapKhoPage.tsx` (46 lines) are pure `CrudTablePage` wrappers — no behavior to characterize.
  - Contrast: Phase 1 status migration is a *real* regression risk — `src/domains/repair/status.ts` (16 snake_case statuses) is consumed by 15 files (`grep -rl domains/repair/status src/`), and swapping to legacy-15 ids will break them.
- **Suggested fix:** Keep rigorous characterization tests **only** for Phase 1 (status swap) and Phase 2 `data-table.tsx` (the one shared table). For pure config-wrapper pages, write a single spec test asserting the config's column headers (the one thing that matters) and skip the redundant characterization snapshot. Focus test budget where regression is real, not on greenfield config leaves.

---

## Finding 7: Per-section MVP cut (column/label corrections shipped independently of full editor rebuilds) is not offered

- **Severity:** Medium
- **Location:** Phase 5 (6 editors) + Phase 6 (3 full-page editors) — bundling of list-parity fixes with editor rebuilds
- **Flaw:** The highest-severity, cheapest-to-verify gaps are the **list column sets** (verbatim Vietnamese headers) and **removing invented fields** — pure config edits. These are bundled in the same phases as the expensive, largely-unverified full-page editors (Invoice composer, Hàng hóa editor, NhanVien ~28-field editor, 6 warehouse/stock-out editors). The plan's own Risk sections gesture at "ship lists first, editors second," but no phase is *structured* to land the config-only parity as an independent shippable slice. Several editor specs are explicitly unverified (Phase 5 Unresolved #2/#5; Phase 6 Unresolved #1/#2/#3), so the editors carry rework risk the list fixes don't.
- **Failure scenario:** Verified, high-value list corrections (column order, invented-field removal, taxonomies) are gated behind speculative editor builds; a timebox squeeze risks shipping neither cleanly.
- **Evidence:**
  - Current configs carry the invented fields to remove: `src/config/finance-tables/tra-hang.config.ts:26,28` (`ly_do`, `tong_tien_hoan`), `ban-hang.config.ts:35` (`trang_thai`), `chuyen-kho.config.ts:37` (invented `Trạng thái`) — all fixable by config edit alone.
  - Editors are unverified: Phase 6 Unresolved #1/#2/#3 (payroll, congno modal, chungtu form fields all "not mirrored"); Phase 5 Unresolved #2/#5 (Chuyển Kho/Cấp LK actions, Báo cáo lợi nhuận "unknown").
- **Suggested fix:** Split each of P5/P6 into a **P5a/P6a "config parity"** sub-phase (column sets + invented-field removal + taxonomies + Excel export — all verified, all cheap) that ships green independently, and a **P5b/P6b "editors"** sub-phase for the full-page editors (gated on resolving their Unresolved specs). Delivers the verified parity fast; isolates the speculative work.

---

## Cross-checks that came back clean (no finding)

- **Recharts** is already a dependency (`package.json`), so Phase 7's charts reuse an existing lib — not a new heavy add. `xlsx` is genuinely absent and legitimately added in P2.
- **P1 status migration risk is real and correctly prioritized** — 16 snake_case statuses in `src/domains/repair/status.ts` consumed by 15 files; the characterization-first discipline there is justified (see Finding 6 — keep TDD *here*).
- **The invented-field removals** the plan targets (`ly_do`, `tong_tien_hoan`, `trang_thai`, `khach_hang_ten` refund model) genuinely exist in the current configs — those corrections are grounded, not busywork.

---

## Unresolved questions for the planner

1. Does any consumer read the 202-checkbox permission state at runtime, now or planned? If not, confirm a representative subtree (not the full 202) satisfies the demo goal (Finding 3).
2. Can the 3 inventory pages stay on `CrudTablePage` + config spread (their current pattern) with opt-in read-only/KPI/Kỳ flags, instead of a new `InventoryView` host (Finding 1)?
3. Is a *live* payroll derivation actually needed for the demo, or do seeded static `Bảng lương` values suffice until the formula is confirmed (Finding 4)?
4. Will you split P5/P6 into config-parity vs editor sub-phases so verified list fixes ship independently of unverified editors (Finding 7)?

Status: DONE
Summary: Plan is spec-faithful but over-builds for a no-backend prototype — the InventoryView host duplicates an existing config-spread pattern, the line-item template earns weak rent against 6 divergent grids plus an outlier, and the 202-checkbox matrix + payroll engine + universal TDD are gold-plating best cut or deferred.
