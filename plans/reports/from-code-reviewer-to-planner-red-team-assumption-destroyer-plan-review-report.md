# Red-Team Review — Assumption Destroyer / Scope Auditor

**Target:** `plans/260703-1908-reference-ui-parity-tdd/` (D5-reconciled)
**Reviewer lens:** Assumption Destroyer (unstated deps, false "will work") + Scope Auditor (symbol/state boundary collisions)
**Date:** 2026-07-04
**Verdict:** BLOCKED — the D5 reconciliation rests on two grep-falsifiable factual claims (`dashboard-mock.ts` "does not import status.ts"; the 3001–3008 seed block is "free"). Both are false against the current tree. Fix before P1 starts.

---

## Finding 1: `dashboard-mock.ts` DOES import `status.ts` — the plan's central Finding-3 claim is factually false

- **Severity:** Critical
- **Location:** Phase 1 §Overview (line 12), §Consumer migration strategy (line 58), §N3 (line 48); plan.md Data-Layer table (line 75), F3 disposition (line 137, 163)
- **Flaw:** The plan asserts — repeatedly and load-bearingly — that `dashboard-mock.ts` "does NOT import [status.ts], carries its own vocab, migrated as a separate layer, **not counted among the 15**." Grep proves the opposite: `dashboard-mock.ts:10-17` imports `REPAIR_STATUSES`, `STATUS_BUCKET`, and `type RepairStatus` directly `from '@/domains/repair/status'`. It has NO local vocab — `RepairStatus`/`REPAIR_STATUSES`/`STATUS_BUCKET` are the *shared module's* snake exports. The Data-Layer table (plan.md:75) calling it "own snake `RepairStatus` + `STATUS_BUCKET` (doesn't import status.ts)" is wrong on both counts.
- **Failure scenario:** The whole "15 importers, and separately 2 self-vocab layers" framing collapses. When P1 rewrites `status.ts` to numeric ids and deletes `STATUS_BUCKET`/`RepairStatus`, `dashboard-mock.ts` fails to compile at its import site — but the plan never lists it among the type-checked importers the compiler will flag; it's filed under "migrated in its own step, the compiler won't flag it." The compiler WILL flag it (it's a real import), so the mitigation rationale is inverted. Worse, if the implementer trusts the plan and treats `dashboard-mock` as an independent vocab island, they may re-add a local snake enum to "keep it self-contained," reintroducing the exact snake ids the phase's step-20 grep is supposed to prove gone.
- **Evidence:** `src/mock/dashboard-mock.ts:10-17` (`} from '@/domains/repair/status'` with `REPAIR_STATUSES,` `STATUS_BUCKET,` `type RepairStatus`); `src/mock/dashboard-mock.ts:271` (`openBuckets.has(STATUS_BUCKET[t.status])`), `:274` (`t.status === 'qua_han'`); `src/domains/repair/status.ts:14,36,67` (these symbols are defined here, snake). `grep -rln "repair/status'" src/` returns exactly 15 files, `dashboard-mock.ts` among them.
- **Suggested fix:** Correct the Finding-3 text: `dashboard-mock.ts` IS a `status.ts` importer (one of the 15). Re-derive the count as: 15 grep importers = 13 UI/type consumers + `dashboard-mock.ts` + `repair-tickets.ts` (deleted P1). `sua-chua-report-mock.ts` is the ONLY true self-vocab layer (grep confirms it imports no status module; it holds its own `REPAIR_STATUSES_VN` at line 76). Rewrite plan.md:75 to "imports `status.ts` (shared snake vocab)."

---

## Finding 2: The "15 status.ts importers" Modify list lists a non-importer and omits two real importers

- **Severity:** High
- **Location:** Phase 1 §Modify (line 77), §Implementation step 8 (line 117)
- **Flaw:** The Modify "Status consumers (15 importers)" list enumerates 14 files, one of which — `src/hooks/useDashboard.ts` — does **not** import `repair/status` at all (grep: absent from the 15). The list is padded with a non-importer ("comment only") to reach the headcount, while the two importers that actually need handling by a different mechanism (`dashboard-mock.ts` = compile break on rewrite; `repair-tickets.ts` = deleted, its import vanishes with the file) are pulled out into separate prose. Net: the "15" is coincidentally numerically right but compositionally wrong, so an implementer working the Modify list will (a) waste effort hunting a non-existent import in `useDashboard.ts`, and (b) not see `dashboard-mock.ts` in the type-safe-migration list where it belongs.
- **Failure scenario:** Implementer migrates the 13 real consumers + edits a comment in `useDashboard.ts`, runs `type-check`, and is surprised by an error in `dashboard-mock.ts` that the plan filed under a later step — or, having "finished the 15," skips it. Characterization suite for `dashboard-mock.test.ts` then fails on the snake→numeric shape change with no plan step owning the fix.
- **Evidence:** `grep -rln "repair/status'" src/` → the 15 are: StatusDistributionChart, WorkQueueTiles, status-badge, status-legend, `mock-data.ts`, `types.ts`, RepairStatusTimeline, use-repair-filters, use-repair-table-columns, RepairFilters, `dashboard-mock.ts`, `mock/seed/repair-tickets.ts`, GalleryPage, KpiCharts, `types/dashboard-types.ts`. `useDashboard.ts` is NOT in the set. Plan line 77 lists `useDashboard.ts` and omits `dashboard-mock.ts` + `repair-tickets.ts` from the "15 importers."
- **Suggested fix:** Split the list honestly: 13 UI/type importers to migrate by hand (compiler-guarded), `dashboard-mock.ts` as a 14th importer migrated in step 7 (call out that the compiler WILL flag it), `repair-tickets.ts` as the 15th whose import dies with the file (deleted). Drop `useDashboard.ts` from the importer list (keep only as an optional stale-comment cleanup, since it's not an importer).

---

## Finding 3: The Finding-13 seed fix assigns block 3001–3008 that `inventory-mock.ts` already owns — the fix reintroduces the collision it claims to remove

- **Severity:** Critical
- **Location:** Phase 1 §Architecture (line 62), §Implementation step 19 (line 128), §Success Criteria (line 139); plan.md F13 (line 147, 170)
- **Flaw:** Finding 13 says "each new lookup module gets a distinct unique seed (3001–3008); no reuse of 2001/2002/2003." But `src/mock/inventory-mock.ts` **already uses SeededRandom seeds 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008** — the entire block the plan hands to `ky`/`tinh-quan-xa`/`chung-tu`/`cong-no`/`tra-hang`/`cham-cong`/`loi-sua-chua`/`phi-giao`. The plan's grep-free "assign 3001–3008" instruction produces eight NEW pairwise-correlated RNG streams (each new lookup shares a seed with an inventory generator), which is precisely the correlated-stream / duplicate-seed defect Finding 13 exists to prevent. The plan only checked 2001/2002/2003 and never grepped the 3000 block.
- **Failure scenario:** `ky.ts` (seed 3001) and inventory `rngTK` (seed 3001) emit identical pseudo-random sequences; wherever both drive id suffixes or picks over lists of equal length, ids/selections correlate — and if any future test asserts cross-module id disjointness or "unique seed per module" (the plan's own Success Criteria bullet), it fails. The Success Criteria line "Each lookup module uses a distinct SeededRandom seed (3001–3008)" is self-satisfied on paper yet false in the tree, so it can never be honestly checked off.
- **Evidence:** `src/mock/inventory-mock.ts:55,85,142,185,232,279,337,378` → `new SeededRandom(3001..3008)` (rngTK…rngDSTL). Plan step 19: "assign the 3001–3008 block (ky=3001…phi-giao=3008)." Note also 2001/2002/2003 are each *already* used twice today (`finance-mock.ts:17,82,127` AND `BangLuongPage.tsx:32`/`ChamCongPage.tsx:28`/`ChamCongTongHopPage.tsx:28`), so Finding 13's premise is real — but its fix collides.
- **Suggested fix:** Grep `SeededRandom(` across `src/` first (seeds 99, 1001–1023, 2001–2003, 3001–3008 are taken). Assign the 8 new lookups a genuinely free block, e.g. 4001–4008. Add a one-line "reserved seed registry" note to `ARCHITECTURE.md` C4 so future phases grep before assigning.

---

## Finding 4: P6 "keep the symbol name KhuVuc, re-model its fields" breaks ~13 consumers of the live `{maKhuVuc,tenKhuVuc}` shape — plan claims 4

- **Severity:** Critical
- **Location:** plan.md §Naming (line 82), F2 (line 136, 162); Phase 6 lines 18, 42–43, 73, 96, 106–107
- **Flaw:** Finding 2's TUYEN rename correctly avoids a *new* symbol collision, but the plan then hands P6 a shape break it under-scopes. plan.md:136 states the live `KhuVuc{maKhuVuc,tenKhuVuc}` is "used by C8/C9/phi-giao/khach-hang" (4 sites). Grep of the live shape (`maKhuVuc`/`tenKhuVuc`/`KHU_VUC_ROWS`/`khuVucId`/`khuVucConfig`/`KhuVucPage`) hits **~13 files**, including a hardcoded field-allowlist in a shared component. P6 says "keep the symbol name; re-model its fields to Tỉnh/Quận/Xã ids + Cây số/Tiền công" — replacing `maKhuVuc`/`tenKhuVuc` with hierarchy ids silently breaks every consumer that reads those two properties or the `khuVucId` foreign key.
- **Failure scenario:** After the re-model, `phuong-xa.config.ts` and `khach-hang.config.ts` still call `KHU_VUC_ROWS.map(r => ({ label: r.tenKhuVuc, value: r.id }))` — `tenKhuVuc` is now `undefined`, so every Khu-vực autocomplete/label renders blank. `CrudTablePage.tsx:45` hardcodes `'tenKhuVuc'` in its render/search field allowlist; dropping that field makes the column render/search silently no-op. `phuong-xa.mock.ts:47`/`khach-hang.mock.ts:75` seed `khuVucId` from `KHU_VUC_ROWS` — the FK target's id semantics change from a flat KV id to a Tỉnh/Quận/Xã composite, orphaning the join. None of these 6+ files are in P6's "4 consumers" mental model.
- **Evidence:** `grep -rln "maKhuVuc\|tenKhuVuc\|KHU_VUC_ROWS\|khuVucId\|khuVucConfig\|KhuVucPage" src/` → 13 files: `CrudTablePage.tsx`, `phuong-xa.config.ts`, `khach-hang.mock.ts`, `khu-vuc.config.ts`, `phi-giao.mock.ts`, `phuong-xa.mock.ts`, `KhuVucPage.tsx`, `routes/index.tsx`, `phi-giao.config.ts`, `khach-hang.config.ts`, `masterdata/index.ts`, `khu-vuc.mock.ts`, `masterdata-types.ts` (plus the deleted-shape `customers.ts`/`reference-data.ts`). Specific breakers: `CrudTablePage.tsx:45` (`'tenKhuVuc'`), `phuong-xa.config.ts:21,54,74` + `khach-hang.config.ts:46,67` (`r.tenKhuVuc`), `phuong-xa.mock.ts:47`/`khach-hang.mock.ts:75` (`khuVucId` FK).
- **Suggested fix:** Replace plan.md:136's "used by C8/C9/phi-giao/khach-hang" with the grep'd 13-file consumer list. In P6, add an explicit sub-task: when re-modeling `KhuVuc`, either (a) keep `tenKhuVuc`/`maKhuVuc` as derived/compat fields so downstream configs keep working, or (b) enumerate and migrate all 13 consumers + the `khuVucId` FK re-keying in `phuong-xa`/`khach-hang`. State which. "Keep the symbol name" is not the same as "keep the shape," and only the shape is what the 13 consumers depend on.

---

## Finding 5: P1's Công-nợ derivation depends on ticket fields (`chiPhi`, `ktvId`) that do not exist under those names

- **Severity:** High
- **Location:** Phase 1 §Architecture "Công nợ derivation" (line 65), TDD 2.6 (line 99), Implementation steps 12 & 14 (lines 121, 123)
- **Flaw:** The plan derives Công-nợ rows and gates id-12 tickets on a scalar `chiPhi`: step 14 "derive rows from live `MOCK_TICKETS` with `chiPhi > 0`"; step 12 "`chiPhi = 0` for id 12"; TDD 2.6 "repair rows' ticket link resolves … + carries `ktvId` + customer phone." The live ticket model has **no `chiPhi` field and no `ktvId`**. Cost is split across four fields (`chiPhiDuKien`, `chiPhiThucTe`, `chiPhiLinhKien`, `chiPhiNhanCong`); the technician is a name string `kyThuat`, not an id. So P1's cong-no lookup + its deep-equal spec test reference a data shape that isn't there — either the implementer invents a `chiPhi`/`ktvId` field (scope creep P3 is supposed to own) or the test can't be written as specified.
- **Failure scenario:** `cong-no.test.ts` asserts `conLai === soTien - daTra` on rows derived from `chiPhi > 0`; with no `chiPhi`, the implementer picks one of the four cost fields arbitrarily (say `chiPhiThucTe`, which is `0` for non-completed tickets), silently changing which tickets become receivables and making the "row count / KTV link" assertions non-reproducible against P3's later field additions. `ktvId` resolution can't be tested because only a `kyThuat` name exists.
- **Evidence:** `src/domains/repair/types.ts:82` (`kyThuat: string // technician name snapshot`), `:85-88` (`chiPhiDuKien`/`chiPhiThucTe`/`chiPhiLinhKien`/`chiPhiNhanCong`, no bare `chiPhi`); `src/domains/repair/mock-data.ts:330-333` generates the four `chiPhi*` fields, no `chiPhi`. `grep -n "chiPhi\b\|ktvId" src/domains/repair/` finds no `chiPhi` and no `ktvId`.
- **Suggested fix:** Name the real field in P1: derive receivables from `chiPhiThucTe` (or a defined `tongChiPhi = linhKien + nhanCong`), and either add an explicit `ktvId` to the ticket model in P1 (and say so — it's a field addition, currently P3-owned) or key Công-nợ on the existing `kyThuat` name. Update TDD 2.6 and steps 12/14 to the actual field names so the deep-equal test is writable.

---

## Finding 6: P1/P3 ticket-field boundary is ambiguous, and P3 puts a `khuVuc` field back on the ticket after Finding 2 banned the name

- **Severity:** High
- **Location:** Phase 1 step 12 (line 121: "reference fields per P3's list added incrementally (P3 owns the full set — P1 only lands … whatever fields the cong-no lookup needs)"); Phase 3 lines 52, 101
- **Flaw:** Two problems. (a) The P1/P3 split is defined by a forward reference ("whatever the cong-no lookup needs" / "P3 owns the full set"), so P1 tests can't know which fields to assert without reading P3 — a circular dependency. Since P1's cong-no derivation needs cost + technician + customer-phone on the ticket (Finding 5), those become P1-owned fields by side effect, contradicting "P3 owns the field set." (b) P3 step at line 52 adds a field literally named `khuVuc?` to the live ticket type/generator — reintroducing the `KhuVuc` naming the D5 reconciliation spent Finding 2 eliminating. A `khuVuc?` ticket field plus a `TUYEN` lookup plus a live `KhuVuc` masterdata entity is three overlapping "khu vực" concepts, exactly the ambiguity Finding 2 was meant to kill.
- **Failure scenario:** P1 lands cost/tech fields to satisfy cong-no; P3 assumes those are unset and re-adds them, double-owning. Separately, grep-based acceptance checks for "no second KhuVuc symbol" pass (the field is `khuVuc`, lowercase, not a type), but readers/tests conflate the ticket's freetext `khuVuc?` with the `TUYEN`/masterdata `KhuVuc` entity, producing the naming confusion the reconciliation claimed to resolve.
- **Evidence:** Phase 1 line 121 (P1 lands only cong-no-needed fields); Phase 3 line 52 (`ngayGiao?, …, khuVuc?, daiLy?, …` added to the live layer) and line 101 (same list in the implementation step). Finding 2 (plan.md:82) bans a second `KhuVuc` — silent on a `khuVuc?` ticket field.
- **Suggested fix:** Freeze the P1↔P3 field ledger explicitly: list the exact fields P1 adds (driven by cong-no: e.g. `chiPhiThucTe` already exists, add `ktvId` if needed) and the exact fields P3 adds; no "whatever/incrementally." Rename the P3 ticket field from `khuVuc?` to something unambiguous (`tuyenId?` if it references TUYEN, or `diaBan?`/`khuVucText?` if freetext) so the three concepts stay distinct.

---

## Finding 7: The Finding-2 barrel-collision rationale is misdescribed — the named collision path doesn't exist, which weakens confidence the real risk was analyzed

- **Severity:** Medium
- **Location:** plan.md F2 (line 136: "`seed/index.ts:10 export *` + new `KHU_VUC` (Tuyến) = duplicate barrel export → build break")
- **Flaw:** The stated collision mechanism is inaccurate. `masterdata-types.ts`'s `KhuVuc` is NOT re-exported through `src/mock/seed/index.ts` (it lives behind `@/types`, and the seed barrel does not re-export masterdata-types). The seed barrel's only `KhuVuc`/`KHU_VUC` today comes from `reference-data.ts` (`export * from './reference-data'`), which P1 is *removing* (KhuVuc/PhuongXa → tinh-quan-xa.ts). So a new `TUYEN` export cannot clash with a `masterdata-types` `KhuVuc` via the barrel — they're in different barrels. The rename to TUYEN is still correct and worth doing (avoids reader/type confusion and a *future* barrel merge), but the plan's justification cites a build-break path that grep does not support. A rationale that misstates the mechanism is a signal the collision surface wasn't fully mapped — and indeed the real shape risk is downstream in P6 (Finding 4), not in the P1 barrel.
- **Failure scenario:** Low direct risk, but the false "build break" rationale could lead a reviewer to accept TUYEN as *sufficient* protection and skip the actual P6 shape-migration scoping (Finding 4). It also means the acceptance bullet "grep finds no second `KhuVuc` symbol" tests the wrong thing — there was never going to be a second one via this path.
- **Evidence:** `src/mock/seed/index.ts:9-15` re-exports only `branches, reference-data, customers, staff, products, financials, repair-tickets` — no masterdata-types. `src/types/masterdata-types.ts:5-7` imports `BaseEntity` from `@/mock/seed` and re-exports only `BaseEntity`, not `KhuVuc`. `reference-data.ts:17,338` is the sole barrel `KhuVuc`/`KHU_VUC`, and P1 removes it (step 10).
- **Suggested fix:** Reword F2's mechanism: the risk is *type/name confusion + a future barrel merge*, not a current `seed/index.ts` double-export (that path requires `reference-data`'s KhuVuc, which P1 deletes). Keep the TUYEN rename. Redirect the "no second KhuVuc" acceptance to where it bites: P6's shape migration (Finding 4).

---

## Finding 8: A third `HINH_THUC` in `reference-data.ts` survives P1's deletions and is only vaguely owned

- **Severity:** Medium
- **Location:** plan.md D5 "HinhThuc" (line 88: "The stray third `HINH_THUC` in `reference-data.ts` is reconciled by P3"); Phase 1 step 10 (line 119, removes only KhuVuc/PhuongXa from reference-data)
- **Flaw:** P1 keeps `reference-data.ts` (only strips KhuVuc/PhuongXa, adds SAN_PHAM) and explicitly retains `HINH_THUC` (step 64: "`LOAI_BAO_HANH`/`HINH_THUC`/lookup tables stay"). But its only consumer today is `repair-tickets.ts:14,150` — which P1 **deletes**. So after P1, `reference-data.ts`'s `HINH_THUC` is dead code with zero importers, left for "P3 to reconcile" against the P3-owned warranty taxonomy. Dead-but-retained lookup + a same-named concept owned elsewhere is the ownership ambiguity Finding 4 (warranty) was supposed to close.
- **Failure scenario:** P1's step-20 acceptance greps for `SEED_*` dead refs but not for the newly-orphaned `HINH_THUC`; it lingers. P3 builds its `hinhThuc` taxonomy (`Bảo hành/Sửa dịch vụ/BH sửa chữa`) as a fresh construct; the stale `reference-data.ts` `HINH_THUC` (whatever its values) coexists, and a later reader imports the wrong one.
- **Evidence:** `src/mock/seed/reference-data.ts:537,543-544` (`HINH_THUC` + `HinhThuc` + `HINH_THUC_LABEL`); sole importer `src/mock/seed/repair-tickets.ts:14,150` (deleted by P1 per Phase 1 step 6/line 82). Phase 1 step 64 keeps `HINH_THUC`.
- **Suggested fix:** Since P1 deletes `HINH_THUC`'s only consumer, P1 should delete `HINH_THUC`/`HinhThuc`/`HINH_THUC_LABEL` from `reference-data.ts` too (it becomes dead on the same commit), OR the plan must name P3 as the definitive owner and add a grep guard. Don't leave an orphaned same-named lookup across a phase boundary.

---

## Summary of grep-verified factual errors in the plan

| Plan claim | Reality (grep) | Finding |
|---|---|---|
| `dashboard-mock.ts` "does not import status.ts, own vocab" | Imports `REPAIR_STATUSES`/`STATUS_BUCKET`/`RepairStatus` from `@/domains/repair/status` (`:10-17`) | 1 |
| "15 status.ts importers" = the Modify list | Modify list includes non-importer `useDashboard.ts`, omits importers `dashboard-mock.ts` + `repair-tickets.ts` | 2 |
| Assign new lookups seeds 3001–3008 (unique) | `inventory-mock.ts:55-378` already uses 3001–3008 | 3 |
| Live `KhuVuc{maKhuVuc,tenKhuVuc}` "used by 4 sites" | ~13 files consume the shape / `khuVucId` FK | 4 |
| Cong-nợ derives on `chiPhi > 0`, ticket has `ktvId` | No `chiPhi` (four `chiPhi*` fields); no `ktvId` (only `kyThuat` name) | 5 |
| F2 barrel collision via `seed/index.ts:10 export *` + masterdata `KhuVuc` | masterdata `KhuVuc` not in seed barrel; barrel's only KhuVuc is deleted by P1 | 7 |

---

Status: BLOCKED
Summary: The D5 reconciliation is well-structured but sits on two grep-falsifiable Critical errors — `dashboard-mock.ts` demonstrably imports `status.ts` (Finding 3's core claim is inverted) and the "unique" seed block 3001–3008 is already fully owned by `inventory-mock.ts` (Finding 13's fix reintroduces the collision). P6's "keep the KhuVuc symbol, re-model fields" also under-scopes ~13 consumers to "4."
Concerns: Findings 1, 3, 4 are build/test breakers that change what P1/P6 must do and must be corrected before P1 starts. Findings 5–6 (cong-no field names, P1/P3 field ledger + `khuVuc?` re-naming) and 8 (orphaned `HINH_THUC`) are concrete and cheap to fix now. Finding 7 is a rationale correction, not a code risk.
