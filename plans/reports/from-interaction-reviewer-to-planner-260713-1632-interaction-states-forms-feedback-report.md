# Live UIUX Review — Interactions, States, Forms, Feedback

Reviewer lens: interactions, hover/focus/active states, forms & dialogs, feedback (loading/empty/error/success). Live site https://minihale.github.io/phongthanh-admin/ tested 2026-07-13, 1440x900, agent-browser session `interact`. Evidence screenshots in `/tmp/interact-*.png`. Test records prefixed `ZZTEST-` were created on the real API and deleted afterwards (verified "Đã xóa").

## Summary (most severe first)

- Data tables on both real-API screens render every identifying cell EMPTY (name, phone, address, email, mã NSX) — all row-level interactions (edit, delete, sort verification) are blind.
- Customer create accepts phone `"abc"` and writes it to the real DB with a success toast — no phone format validation.
- "Thêm Đại Lý" dialog: submit with required phone empty silently closes the dialog, saves nothing, shows nothing — total input loss.
- "In Biên Nhận"/"In Tem" print flow replaces the SPA with a bare receipt document; history is empty, Escape does nothing — user stranded.
- Branch selector switch ("Tất cả chi nhánh" → "Đắk Lắk") changes zero data on /khach-hang and gives zero feedback.
- Excel export: silent success on /khach-hang (file appears, no toast), silent no-op on /danh-muc (no file, no toast, 2 attempts).
- Three different validation paradigms coexist (inline, toast-only, native `confirm()`), and dirty-dialog Escape protection exists only on the Danh Mục drawer.
- Lập phiếu: footer submit with errors above the fold gives no toast, no scroll-to-error — button feels dead.
- Vietnamese collation broken in table sort (Buôn ordered before Bảo).
- No loading skeleton/spinner observed anywhere despite slow ngrok API (0 spinner elements during fetches).

## Findings

### F-B1: All identifying columns render empty in real-resource tables
- Severity: Critical
- Area: `/#/khach-hang` table; `/#/danh-muc/nha-san-xuat` table (real-API resources)
- Evidence: /tmp/interact-10-khachhang-loaded.png, /tmp/interact-75-nsx-edit.png. Cell dump row 1 khach-hang: `"1"|""|""|""|""|""|""|""|""|""|""|""|"Khách lẻ"|""|""|"13/07/2026 05:13 PM"|""`. NSX row 1 dump: `""|"1"|""|""|""|""` yet its edit dialog shows `NSX017 / Acer` and delete-confirm says "xóa **Acer**". Repro: login → Khách Hàng → observe Tên khách hàng/Điện thoại/Địa chỉ/Email columns blank for all 50 rows; Danh Mục → Nhà sản xuất → Mã/Tên columns blank.
- Problem: Data exists (edit dialogs and Excel export contain it) but table cells render empty strings. Users cannot identify which row they are editing/deleting/selecting; delete-confirm names a record the user cannot see in the row. Every interaction downstream of the table is guess-work.
- Recommendation: Fix row cell accessors to match the new relational API field names (likely renamed keys after the relational-address migration). Add a regression test asserting non-empty name cell for seeded data.
- Effort: M

### F-B2: Phone field accepts arbitrary text; invalid record persisted to real DB
- Severity: High
- Area: `/#/khach-hang` → "Thêm Khách Hàng" dialog
- Evidence: /tmp/interact-22-format-validation.png (email format IS validated: "Email không hợp lệ"), /tmp/interact-23-phone-abc-submit.png (success toast "Đã thêm khách hàng" with phone `abc`). Repro: Thêm Khách Hàng → name `ZZTEST-VALIDATION`, phone `abc`, valid email → Lưu → record created. (Cleaned up afterwards.)
- Problem: Phone (required, primary lookup key for the repair workflow's customer picker "Tên / Số điện thoại 1-2") has zero format validation; garbage numbers enter the production DB.
- Recommendation: Add numeric/length pattern validation (same inline mechanism already used for email) on both create and edit dialogs; enforce server-side too.
- Effort: S

### F-B3: "Thêm Đại Lý" silently discards all input when required phone is empty
- Severity: High
- Area: `/#/khach-hang` → "Thêm Đại Lý" dialog
- Evidence: /tmp/interact-41-daily-toast-validation.png (empty-submit shows toast-only "Vui lòng nhập tên đại lý!", no inline errors, viewport at top of dialog does not show the toast), /tmp/interact-42-daily-phone-missing.png (name filled, phone `*` empty → dialog closed, no toast, no record — search for `ZZTEST-DL` returns "Hiển thị 0–0 / 0").
- Problem: Two failures: (1) validation is toast-only while the sibling customer dialog validates inline — inconsistent; (2) with name present and required phone missing, the dialog closes with no success toast, no error, and the record is NOT saved — the user loses everything typed and believes it saved.
- Recommendation: Use the same inline per-field validation as "Thêm Khách Hàng"; never close a dialog on failed submit; add success toast on actual save.
- Effort: S

### F-B4: Print flows replace the app with a dead-end document
- Severity: High
- Area: Repair detail `/#/sua-chua-bao-hanh/PSC-200001` → "In Biên Nhận" (header) — same pattern presumably for "In Tem Sửa Chữa"
- Evidence: /tmp/interact-66-print-biennhan.png, /tmp/interact-67-print-stuck.png. After click: `document.title="Biên nhận"`, app root empty, `history.length` gives no back entry, Escape does nothing. Repro: open any phiếu detail → click "In Biên Nhận".
- Problem: The receipt is written over the SPA document (document.write-style) instead of opening a new tab/iframe print. If the print dialog is cancelled or auto-print fails, the user has no way back except manually retyping the URL; all SPA state lost.
- Recommendation: Render receipt into a hidden iframe and call `iframe.contentWindow.print()`, or `window.open` a separate document; never replace the app document.
- Effort: S

### F-B5: Branch selector changes nothing and says nothing
- Severity: High
- Area: Header branch combobox, tested on `/#/khach-hang`
- Evidence: /tmp/interact-45-branch-daklak.png. Before/after row-date fingerprint identical (`09/02/2026 05:06 PM | 12/02/2026 06:18 AM | 14/02/2026 06:14 AM`), count identical ("Hiển thị 1–20 / 50"), no refetch indicator, no toast. Repro: switch "Tất cả chi nhánh" → "Đắk Lắk" while on Khách Hàng.
- Problem: README states customers are branch-scoped via JWT, yet switching branch alters no data and gives no feedback — either the filter isn't applied (data-scoping bug on a real resource) or it works invisibly. User can't tell which context they're mutating records in.
- Recommendation: Wire branch selection into the customers query (refetch + loading state), show active branch in list header, toast on switch.
- Effort: M

### F-B6: Excel export — silent success on khach-hang, silent no-op on danh-muc
- Severity: High
- Area: `/#/khach-hang` "Xuất Excel File"; `/#/danh-muc/nha-san-xuat` "Xuất ra Excel"
- Evidence: `~/Downloads/khach-hang.xlsx` (27KB, timestamp matches click) with zero UI feedback; danh-muc button clicked twice → no file in ~/Downloads, no toast, no error (verified with `ls` before/after).
- Problem: Successful export gives no confirmation (user may click repeatedly); danh-muc export is entirely broken with no error surfaced.
- Recommendation: Toast on export start/completion; fix or hide the danh-muc export; surface failures.
- Effort: S

### F-B7: Unsaved-changes protection inconsistent — silent close vs native confirm()
- Severity: Medium
- Area: Customer add/edit dialogs (`/#/khach-hang`) vs Danh Mục edit drawer (`/#/danh-muc/nha-san-xuat`)
- Evidence: Customer edit with changed Phường/Xã → Escape → dialog gone instantly, 0 dialogs, no prompt (/tmp/interact-19-ward-selected.png then eval `0`). NSX drawer with cleared name → Escape → native browser `confirm("Bạn có thay đổi chưa lưu. Đóng không?")` (blocked the CDP session; agent-browser reported the js dialog).
- Problem: Same app, two behaviors: modals silently destroy dirty state on Escape/overlay-click; the drawer uses an unstyled native confirm that clashes with the shadcn design system (delete-confirm elsewhere is a styled dialog).
- Recommendation: One shared dirty-check hook rendering the styled AlertDialog on Escape/close for all forms.
- Effort: M

### F-B8: Lập phiếu submit gives zero visible feedback when errors are above the fold
- Severity: Medium
- Area: `/#/sua-chua-bao-hanh/tao-moi` footer buttons "Lưu / Lưu & Thêm mới / Lưu & Đóng"
- Evidence: /tmp/interact-54-lapphieu-submit-incomplete.png (after first "Lưu" click at top scroll: no toast, no inline error visible, eval found no error text at that moment), /tmp/interact-56-luu-dong.png ("Lưu & Đóng" clicked from page bottom — inline errors render at top: "Vui lòng nhập số serial!", "Vui lòng nhập mô tả hư hỏng!" etc., but viewport shows only the top after manual scroll; nothing visible at the button the user just clicked).
- Problem: On a ~22-field page, error messages appear only next to fields, possibly screens away from the submit button; no toast, no error summary, no scroll-to-first-error. First click also produced no errors at all until a subsequent attempt — button appears dead.
- Recommendation: On failed submit: toast "N lỗi cần sửa" + scroll/focus first invalid field.
- Effort: S

### F-B9: Edit button unresponsive on first table row (khach-hang)
- Severity: Medium
- Area: `/#/khach-hang` row 1 "Chỉnh sửa" icon button
- Evidence: Two a11y-ref clicks on row 1's Chỉnh sửa (`ref e160`) → `document.querySelectorAll('[role=dialog]').length === 0`, no route change, no console error (/tmp/interact-16-right-after-edit-click.png). Identical DOM click on row 2's button immediately opened "Chỉnh sửa Khách Hàng" (/tmp/interact-17-edit-row2.png).
- Problem: First row's edit did not open the dialog in repeated attempts while other rows work — possibly overlay/sticky-header interception at that scroll offset or a row-type-specific bug ("Trung tâm bảo hành" row). Either way an icon-only action that sometimes does nothing with no feedback.
- Recommendation: Reproduce with pointer-events audit on row 1; add e2e covering edit-open per row type.
- Effort: S

### F-B10: Table sort ignores Vietnamese collation
- Severity: Medium
- Area: `/#/sua-chua-bao-hanh-kt` group-sort "Phân công → Khu vực" (likely all text sorts)
- Evidence: /tmp/interact-85-khuvuc-sort.png — ascending result order: Ayun Pa, Ayun Pa, **Buôn Ma Thuột**, **Bảo Lộc**. Correct vi collation puts Bảo before Buôn; codepoint sort (U+1EA3 ả > u) produces the observed order.
- Problem: Sorting uses raw codepoint comparison; Vietnamese diacritics order wrong across every sortable text column in a Vietnamese-only product.
- Recommendation: Use `Intl.Collator('vi')` (or `localeCompare('vi')`) in table sort comparators.
- Effort: S

### F-B11: Zero-result filter shows "Chưa có Khách Hàng" (no-data-yet message)
- Severity: Medium
- Area: `/#/khach-hang` search box empty state
- Evidence: /tmp/interact-25-empty-state.png — searching `xyznonexistent999` shows inbox icon + "Chưa có Khách Hàng", pagination reads "Hiển thị 0–0 / 0"; no "no results for your search" wording, no clear-search action; success toast overlaps the empty-state area.
- Problem: Message claims the resource is empty when a filter is active — misleads users into thinking data is gone; no one-click recovery.
- Recommendation: Distinct filtered-empty state: "Không tìm thấy kết quả cho '…'" + "Xóa tìm kiếm" button.
- Effort: S

### F-B12: Inert enabled-looking "Sửa gấp" checkbox on detail view
- Severity: Medium
- Area: `/#/sua-chua-bao-hanh/PSC-200001` (Thông tin phiếu panel)
- Evidence: /tmp/interact-64-detail-view.png shows checked-styled "Sửa gấp" checkbox; DOM: `role=checkbox`, `disabled=false`, no `aria-disabled`, click leaves `data-state` unchanged (`before=unchecked after=unchecked`).
- Problem: Read-only value presented as a live, enabled checkbox; clicks silently ignored. Misleading affordance and wrong a11y semantics (screen readers announce it as an operable, enabled checkbox).
- Recommendation: Render as a static badge/text or set the checkbox `disabled`.
- Effort: S

### F-B13: No cross-field date validation (hẹn giao years before ngày nhận)
- Severity: Medium
- Area: `/#/sua-chua-bao-hanh/tao-moi` "Ngày hẹn giao" vs "Ngày nhận"
- Evidence: Set hẹn giao `2020-01-01`, nhận `2026-07-13`, submitted — inline errors listed only serial/mô tả/khu vực/hình thức/khách hàng; no date error (/tmp/interact-89-date-past.png).
- Problem: Business-impossible schedule accepted silently; delivery promise dates in the past will flow into the mock ticket data.
- Recommendation: Validate hẹn giao ≥ ngày nhận (and warn on past dates) with inline error.
- Effort: S

### F-B14: No loading indicators for slow real-API fetches
- Severity: Medium
- Area: All real-resource screens (khach-hang, danh-muc tabs)
- Evidence: During every navigation and hard reload, `document.querySelectorAll('[class*=spin],[class*=skeleton],[class*=animate-pulse]').length === 0`; table paints rows instantly with (empty) cells and "Hiển thị 1–20 / 50" while ngrok fetch resolves in background (/tmp/interact-11-kh-loading-early.png vs /tmp/interact-12-kh-loaded-full.png identical).
- Problem: No skeleton/spinner/fetching state — combined with F-B1 the user cannot distinguish loading vs loaded vs broken. Sort/filter/pagination changes also give no in-flight indication.
- Recommendation: Skeleton rows on initial load; subtle refetch indicator (e.g., dimmed table + spinner) on query changes.
- Effort: M

### F-B15: Ward combobox lists the whole country before a province is chosen
- Severity: Low
- Area: Customer add/edit dialog "Phường/Xã"
- Evidence: /tmp/interact-18-ward-before-province.png — with Tỉnh/Thành phố = "Chưa chọn", ward dropdown opens with all wards nationwide (starting Phường Ba Đình, Hà Nội). Selecting one back-fills the province correctly (/tmp/interact-19-ward-selected.png).
- Problem: Unscoped list of thousands of wards is heavy to scan and easy to mis-pick between same-named wards in different provinces; the subtitle is the only disambiguation.
- Recommendation: Keep reverse-sync but require/encourage province first (disabled state with hint), or emphasize province subtitle and add type-ahead scoping.
- Effort: S

### F-B16: "Nhấn để search" button is actually a collapse toggle
- Severity: Low
- Area: `/#/sua-chua-bao-hanh-kt` filter panel header
- Evidence: /tmp/interact-90-search-toggle.png — clicking "Nhấn để search" collapses the panel (`aria-expanded=false`); actual search executes via "Tìm kiếm".
- Problem: Label promises search action but performs show/hide; misleading affordance for the page's primary action.
- Recommendation: Rename to "Ẩn/Hiện bộ lọc" (or chevron-only) and keep "Tìm kiếm" as the sole search trigger.
- Effort: S

### F-B17: Dialogs lack Enter-to-submit; save-shortcut advertised only on full-page form
- Severity: Low
- Area: "Thêm Khách Hàng" dialog (all catalog dialogs similar) vs `/#/sua-chua-bao-hanh/tao-moi`
- Evidence: Focus in "Tên khách hàng", pressed Enter → no submit, no validation fired (dialog unchanged). Repair page footer shows "Nhấn Ctrl+Enter để lưu nhanh"; dialogs offer no equivalent.
- Problem: Keyboard-heavy admin data entry requires mouse for every dialog save; inconsistent shortcut affordances.
- Recommendation: Wrap dialog fields in a real `<form>` with default submit on Enter (safe: inline validation already exists).
- Effort: S

### F-B18: Table search inputs have no clear (×) affordance
- Severity: Low
- Area: "Tìm trong Khách Hàng…" (and danh-muc equivalents)
- Evidence: /tmp/interact-24-search-zztest.png — populated search shows no clear button; programmatic empty-fill is ignored (controlled input), user must select-all+delete; combined with F-B11's misleading empty state recovery is unobvious.
- Problem: One-click reset from a zero-result state is missing.
- Recommendation: Add clearable input (× icon) resetting query + focus.
- Effort: S

## Cross-cutting patterns

- Three validation paradigms in one app: inline field errors (customer dialog, quick-create model, lập phiếu), toast-only (đại lý dialog, image-upload dialog), native confirm (danh-mục drawer dirty-check). Pick one system.
- Feedback is all-or-nothing: destructive actions have styled confirm + "Đã xóa"/"Đã cập nhật" toasts (good), while exports, branch switching, and some saves are completely silent.
- Hover/focus generally healthy: sidebar hover tint, KPI card border+ring on hover/focus, visible focus outlines on sidebar links and toolbar buttons (light and dark), table row hover works in both themes; dark-mode interactive states survive the theme flip (/tmp/interact-48-dark-row-hover.png). Command palette (Ctrl+K), notification mark-all-read (badge 20→0), news read-tracking (10→9), pagination, page-size options, column show/hide, filter count badge "Bộ lọc 1" + "Xóa bộ lọc", and quick-create model dialog all behaved correctly.
- Console: only recurring errors are the known `RepairListPage-DnXT3Ygp.js` dynamic-import failures on `/#/sua-chua-bao-hanh` (persists after retry — noted, owned by another panelist). No new console errors were triggered by any interaction tested.
- The empty-cell defect (F-B1) amplifies every other issue: with no row identity, silent actions become dangerous actions.

## Unresolved questions

- Is branch scoping (F-B5) expected to be a no-op for the admin JWT ("all branches" role), or is the filter genuinely not wired? Needs backend-side confirmation.
- F-B9 root cause (row-1 edit dead): overlay interception vs row-type-specific handler — needs a pointer-events audit; I could not distinguish from the live site alone.
- Does "Xuất ra Excel" on danh-muc fail for all catalog tabs or only Nhà sản xuất? (Tested one tab; khach-hang variant works.)
- The earlier "empty-name save shows Đã cập nhật" on the NSX drawer was reproducible only with programmatic value injection; keyboard-cleared value correctly blocks with inline error — treated as non-issue, worth a unit test on trimmed-empty payloads regardless.

Status: DONE_WITH_CONCERNS
Summary: 18 findings filed (1 Critical, 5 High) centered on blank table cells on real-API screens, unvalidated/silently-lost form input, a stranding print flow, and inert/silent feedback across exports and branch switching. ZZTEST records created for validation testing were deleted; only pre-existing console errors (known RepairListPage chunk failure) observed.
Concerns/Blockers: /#/sua-chua-bao-hanh unreachable (known chunk-load error) so its 22-field filter could only be tested via the KT variant; branch-scoping behavior needs backend confirmation before treating F-B5 as frontend-only.
