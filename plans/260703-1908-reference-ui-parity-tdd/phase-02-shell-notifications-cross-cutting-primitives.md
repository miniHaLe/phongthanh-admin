---
phase: 2
title: "Shell + notifications + cross-cutting primitives"
status: completed
effort: "L"
---

> **Completed 2026-07-04.** Gate clean: `test` 111 pass (37 files), `type-check`, `lint` (0 errors), `build` all green. Built: export-xlsx (F8), open-external (F9), print-window/print-layout (F7), CSV exporter hardened (C3), DataTable row-selection + selection-column + bulk-actions-bar, ServerAutocomplete + [+], KyPicker/KyRangePicker, LineItemEditor, notification store + NotifBadge/NewsBadge/SupportDropdown, call-center demo (Ctrl+Shift+G), /thong-bao, /tin-tuc(+detail), /tai-khoan pages, BranchMapModal, AppFooter, dashboard "Kế hoạch của bạn" tab. Security grep verified: all raw document.write/window.open/createObjectURL/XLSX.writeFile sinks live only inside the sanctioned F7/F8/F9 helpers.

# Phase 2: Shell + notifications + cross-cutting primitives

## Overview

Build every cross-cutting primitive the later phases consume (xlsx exporter, print-window helper, DataTable bulk-select, ServerAutocomplete + [+] quick-create, line-item editor template, Kỳ picker, `openExternal` link helper) and close the shell-level gaps: real notification bell + `/thong-bao` list, News dropdown + `/tin-tuc` list/detail, demo call-center toast, `/tai-khoan` profile page, Bản đồ chi nhánh modal, dashboard "Kế hoạch của bạn" calendar tab, support dropdown, footer. Flat IA per D1 — new routes only, no sidebar restructuring. Depends on Phase 1 (test infra, legacy statuses, Kỳ entity/lookups, live-layer edits per D5).

> **Security primitives (red-team Findings 6-9) are baked in here, once, so P3-P7 consume hardened helpers and never hand-roll.** These are cheap to add now and expensive to retrofit across every "Xuất Excel" / print / external-link site later. See plan.md §"Data-Layer Reconciliation (D5) → Security helpers" and R14 below.

## Context links

- Spec: `plans/reports/ref-ui-parity-sections/section-shell-nav-layout.md` (header widgets, call-center, modals, footer, home calendar)
- Spec: `plans/reports/ref-ui-parity-sections/section-admin-perm-account.md` (§Thông Tin Tài Khoản /User/Detail + trimmed/user-detail.html addendum)
- Spec: `plans/reports/ref-ui-parity-sections/section-repair-kt-dashboard.md` (§Trang chủ — "Kế hoạch của bạn" FullCalendar spec)
- Spec: `plans/reports/brainstorm-260703-repair-detail-create-refspec.md` (custom.js §: bell/news mark-seen endpoints, item anatomy, call-center JS)
- Decisions: `plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md` §6 (D1, D4), §8 open decision #1 (calendar as dashboard tab)
- Local code: `src/components/shell/*`, `src/components/shared/*` (data-table, toast, print-menu, index.ts), `src/constants/routes.ts`, `src/config/nav-config.tsx`, `src/routes/index.tsx`, `src/pages/DashboardPage.tsx`, `src/store/app-store.ts`, `src/lib/store-keys.ts`, `src/demo/demo-reset.ts`, `src/components/crud/CrudTablePage.tsx`

## Requirements

Functional (traceable to shell gap table / plan.md ownership rows):

- R1 Client-side `.xlsx` exporter (SheetJS) — real file download, column-header + row mapping API (D4; every "Xuất Excel"/"Xuất ra Excel" P3-P7).
- R2 Print-window helper + base print layout — opens printable window from a React element, print CSS (D4; 5 repair prints P3, phiếu prints P4-P6).
- R3 DataTable bulk-select: checkbox column with select-all ("Chọn tất cả" tooltip), controlled rowSelection, bulk-actions bar (gap: "Row multi-select … missing" — Index_8, Chi Nhánh, Role, RoleMenu, HR pages).
- R4 `ServerAutocomplete`: async mock-fetch options, hidden-id binding, optional `[+]` quick-create modal (gaps: "autocomplete + [+] quick-create missing" — Sản Phẩm, Model, Khu Vực, Ứng Lương).
- R5 Full-page line-item editor template with "Lưu" / "Lưu & Thêm mới" footer (gap: Receiving/Create "no product line entry at all"; ×6 editors P5, Invoice P6).
- R6 Kỳ picker: single `Kỳ` select + range pair labeled exactly `Từ Kỳ` / `Đến Kỳ`, options "M/YYYY" from Phase 1 Kỳ entity (gaps: Xem Tồn Kho, HR ×4).
- R7 Notification bell wired to a store: unseen count badge, "Đánh dấu tất cả là đã đọc" header action, per-item "Đánh dấu là đã xem", status-colored items, footer "Danh sách" → new `/thong-bao` list page (gap: bell hardcoded 3 mocks, RepairingStatusHistory list missing).
- R8 News dropdown (envelope icon, blue badge): unread bold, per-item "Đánh dấu là đã xem" check action, footer "Danh sách" → new `/tin-tuc` list page + `/tin-tuc/:id` detail (gap: News surface missing entirely).
- R9 Demo call-center toast: sticky toast "Có cuộc gọi mới !" + `{name} - {number}` + "Tiếp nhận" button navigating to repair intake (`ROUTES.repairCreate` + caller query params); unknown-caller error variant "Không xác định - {number}"; demo-triggered via dev hotkey + command-palette action (D4).
- R10 `/tai-khoan` read-only profile page per /User/Detail: box "Thông tin người dùng", fields Chi nhánh, Tên đăng nhập, Họ và tên, Điện thoại, Email, Khóa tài khoản, Quyền, Chi nhánh phụ (multi); reachable from UserMenu item "Thông tin tài khoản".
- R11 "Bản đồ chi nhánh" modal: global dialog, branch list + static/embed map plotting branch Toạ độ, search input placeholder "Search Box" (D4: embedded/static, no Google API).
- R12 Dashboard "Kế hoạch của bạn": tabs on DashboardPage — default KPI dashboard preserved (open decision #1) + calendar tab with seeded colored plan events (ref default event color #f39c12).
- R13 Support dropdown "Thông tin liên hệ hỗ trợ:" + footer "Version 1.0.0" / "Copyright © 2026 Phát triển bởi Phần Mềm Quốc Bảo" (shell medium/low gaps — cheap parity wins).
- **R14 Security-hardened primitives (red-team Findings 6-9, tightened by session #2 M3/C3 — build once, consumed by P3-P7):**
  - **F7 print-window:** `openPrintWindow` must build the printable document via DOM APIs / `textContent` (or escape all interpolated values), NEVER by string-concatenating untrusted mock free-text into a `document.write` HTML string. This covers **both** the doc chrome (`<title>`) **and** the print body / `PrintLayout` fields (company header, customer name, Ghi chú) — because `PrintLayout` is a React component, its interpolated fields are escaped by construction; the rule is "no untrusted value reaches raw HTML via concat anywhere in the print path."
  - **F8 xlsx exporter:** `buildSheetAoa`/cell mapping must neutralize spreadsheet/CSV formula injection — a cell **string** whose first non-whitespace char ∈ `= + - @` (also tab `\t` / CR `\r` prefixed) is prefixed with `'`. **M3 correction — do NOT corrupt legitimate numeric negatives:** the guard applies only to values emitted as strings that are NOT valid numbers. A numeric cell (`-1`, `+3.5`, a coordinate/delta passed as `number`) is emitted as a number and never prefixed; a value like `-1` that is genuinely a number should reach the sheet as a number. Only non-numeric strings that begin with a formula trigger get the `'`.
  - **F9 external-link helper:** a single `openExternal(url)` (new `src/lib/open-external.ts`) that (a) `encodeURIComponent`s any interpolated query value (via `buildMapUrl`/`buildGeoUrl`), (b) **parses the URL and validates the lowercased scheme ∈ {`http`,`https`}** — rejecting `javascript:`/`data:`, **protocol-relative `//host`, uppercase/mixed-case `HTTPS:`, and schemes obfuscated with leading/embedded whitespace or newlines** (normalize before the check), (c) opens via `window.open(url, '_blank', 'noopener,noreferrer')` (or an `<a rel="noopener noreferrer">`) to kill tabnabbing. All "Bản đồ" / "Định vị" / external URLs in P3+ go through it. **Reject → no-op (do not open), not throw**, so a bad mock GPS value silently fails safe.
  - **C3 — replace the live CSV exporter:** the app already ships `mockCsvDownload` (`src/components/reports/export-excel-menu.tsx:36`) — `Blob` + `URL.createObjectURL` + `a.click()` + string-concatenated CSV, with NO formula neutralization. It is the real export path (consumed by `report-configs.ts` + `KpiReportFilterForm.tsx`) and it bypasses a `document.write`/`XLSX.writeFile`/`window.open` grep. P2 must **route `mockCsvDownload` through the F8-hardened exporter** (either replace its body with `export-xlsx`, or apply `neutralizeCell` to every CSV field before concatenation). This is not optional cleanup — it's the primary injection surface.

Non-functional:

- All primitives generic + config-driven (plan.md rule: later phases extend in place, never fork).
- No sidebar top-level additions (D1); new pages reached from header widgets/user menu + command palette.
- Seeded randomness only (`SeededRandom`), mock-delay pattern matches existing `src/mock/*`.
- New persisted state registered in `src/lib/store-keys.ts` so `resetDemo()` clears it.
- **Durability model documented (Finding 6):** mock CRUD writes (e.g. `MOCK_TICKETS.unshift`) live in module memory only — they are lost on **any** page reload, not just `resetDemo()`. `resetDemo()` clears persisted localStorage keys + reloads → the module-level seed regenerates identically, so the app returns to baseline. This is acceptable for a mock prototype, but the plan must NOT claim created vouchers/tickets survive a reload. P5/P6 (which generalize creation across 6 editors) inherit this caveat explicitly — see their Risk sections. If cross-reload persistence of demo creates is ever wanted, that is a separate opt-in (persist the mutable arrays under a `STORE_KEY`), out of scope here.
- App shippable at phase end: type-check, lint, test, build clean; no dead routes.

## Architecture

- **Exporter** `src/lib/export-xlsx.ts`: new dep `xlsx` (SheetJS). Pure `buildSheetAoa(columns, rows)` (testable) + `exportToXlsx({ filename, sheetName, columns, rows })` calling `XLSX.utils.aoa_to_sheet` + `writeFile`. Columns = `{ header: string; accessor: (row) => string | number | null }[]` so consumers pass exact Vietnamese headers. **F8 hardening:** a `neutralizeCell(value)` helper wraps every emitted string cell — if the string (after trimming leading whitespace) starts with `= + - @` (or tab/CR-prefixed variants), prepend `'`. Applied inside `buildSheetAoa` so ALL consumers get it for free; headers are trusted constants but run through the same path for simplicity.
- **Print** `src/components/print/print-window.tsx`: `openPrintWindow(title, element)` — `renderToStaticMarkup` (react-dom/server) renders the *element* (trusted React tree, auto-escaped by React) → `window.open` → the surrounding document shell (`<title>`, CSS) is assembled with the `title` set via `doc.title = title` / `textContent`, NOT concatenated into the `document.write` HTML string. **F7 hardening:** no untrusted value (title, and any mock free-text that reaches the doc chrome) is placed into raw HTML via string concat; interpolation goes through React (escaped) or DOM `textContent`. `src/components/print/print-layout.tsx`: `PrintLayout` base (company header, doc title, children, signature row slots) that P3+ per-doc layouts compose — because it's a React component, its interpolated fields are escaped by construction. Existing `PrintMenu` untouched (P3 rewires its stub handlers).
- **External-link helper (F9)** `src/lib/open-external.ts`: `openExternal(url: string)` + `buildMapUrl(address)` / `buildGeoUrl(lat, lng)` builders. Builders `encodeURIComponent` the interpolated parts; `openExternal` parses the URL, throws/no-ops unless scheme ∈ {`http:`,`https:`}, then `window.open(url, '_blank', 'noopener,noreferrer')`. This is the ONLY sanctioned way P3+ opens Bản đồ / Định vị / any external URL — no raw `window.open('…?q='+x)` anywhere.
- **DataTable extension** (extend in place, no fork): add `enableRowSelection` / `rowSelection` / `onRowSelectionChange` props to `data-table.tsx` (TanStack built-in row selection); new `selection-column.tsx` exporting `buildSelectionColumn<T>()` (checkbox header aria-label + tooltip "Chọn tất cả", cell checkbox stopPropagation vs `onRowClick`); new `bulk-actions-bar.tsx` ("Đã chọn N dòng" + actions slot, renders only when N>0) fed to existing `toolbar` slot. CrudTablePage NOT converted here (consumers opt in per phase).
- **ServerAutocomplete** `src/components/shared/server-autocomplete.tsx`: Popover + cmdk Command; `fetchOptions(query) → Promise<{id,label}[]>` debounced; controlled `{id,label}` value (mirrors legacy visible-text + hidden-id inputs); optional `quickCreate: { title, renderForm, onCreate }` → `[+]` button beside input opens Dialog, created record auto-selected. Modal shell reuses existing `SheetModal`/Dialog primitives.
- **Line-item editor** `src/components/shared/line-item-editor/`: generic `LineItemEditor<TLine>` — header-fields slot (render prop), editable lines table (config: column defs with cell renderers, add/remove row), totals footer (config: aggregate defs), action footer with buttons `Lưu` and `Lưu & Thêm mới` + back. Page-level template only; P5/P6 supply configs.
- **Kỳ picker** `src/components/shared/ky-picker.tsx`: `KyPicker` (single, label `Kỳ`) + `KyRangePicker` (pair `Từ Kỳ` / `Đến Kỳ`), shadcn Select over Phase 1 Kỳ entity list (descending, "M/YYYY" display e.g. "7/2026").
- **Notification store** `src/store/notification-store.ts` (zustand): two feeds — `notifications: NotificationItem[]` `{ id, repairId, phieuCode, statusId, changedBy, at, seen }` (RepairingStatusHistory analog; status color from Phase 1 legacy status module) and `news: NewsItem[]` `{ id, title, author, at, body, repairId?, seen }`; actions `markSeen/markAllSeen/markNewsSeen/markAllNewsSeen`. Feeds seeded by `src/mock/notifications-mock.ts` + `src/mock/news-mock.ts` (SeededRandom, derived from Phase 1 repair-ticket seed). Persist seen-ids only under new `STORE_KEYS.notifications = 'pt-notifications'`.
- **Shell composition**: `NotifBadge.tsx` rewritten store-driven; new `NewsBadge.tsx`, `SupportDropdown.tsx`, `AppFooter.tsx`, `BranchMapModal.tsx` (open-state zustand store exported from same file — global open trigger for P4/P6 toolbars + command palette); `TopBar` order: search · NotifBadge · NewsBadge · SupportDropdown · BranchSwitcher · ThemeToggle · UserMenu (ref order bell → news → support → user).
- **Call-center demo** `src/demo/call-center-demo.tsx`: `useCallCenterDemo()` hook mounted inside `AppShell` (needs router context) — registers dev hotkey (Ctrl+Shift+G) + command-palette action "Demo: Cuộc gọi đến" via `useRegisterCommands`; fires sonner sticky toast (duration Infinity) with custom JSX.
- **Routes** (flat IA, D1): add to `ROUTES` — `notifications: '/thong-bao'`, `news: '/tin-tuc'`, `newsDetail: (id) => '/tin-tuc/${id}'`, `account: '/tai-khoan'`. Wire in `src/routes/index.tsx` under AppShell. No `nav-config.tsx` change — pages hang off header widgets/user menu (command-palette entries registered by each page for discoverability).
- **Dashboard**: wrap existing DashboardPage body in shadcn Tabs — `Tổng quan` (existing content, default) + `Kế hoạch của bạn` → new `src/components/dashboard/PlanCalendar.tsx` (custom month grid — no FullCalendar dep; prev/next month nav, colored event chips) + `src/mock/plan-events-mock.ts`.
- **Current user** `src/mock/current-user-mock.ts`: single mock profile powering `/tai-khoan` + UserMenu header (adds Điện thoại + Chi nhánh phụ list without touching the NguoiDung model — P6 owns that model).

## Related Code Files

- Create:
  - `src/lib/export-xlsx.ts` + `src/lib/export-xlsx.test.ts`
  - `src/lib/open-external.ts` + `src/lib/open-external.test.ts` (F9)
  - `src/components/print/print-window.tsx` + `print-window.test.tsx`
  - `src/components/print/print-layout.tsx`
  - `src/components/shared/data-table/selection-column.tsx` + `selection-column.test.tsx`
  - `src/components/shared/bulk-actions-bar.tsx` + `bulk-actions-bar.test.tsx`
  - `src/components/shared/server-autocomplete.tsx` + `server-autocomplete.test.tsx`
  - `src/components/shared/ky-picker.tsx` + `ky-picker.test.tsx`
  - `src/components/shared/line-item-editor/line-item-editor.tsx` (+ `line-item-editor-types.ts` if >200 LOC) + `line-item-editor.test.tsx`
  - `src/store/notification-store.ts` + `notification-store.test.ts`
  - `src/mock/notifications-mock.ts`, `src/mock/news-mock.ts`, `src/mock/plan-events-mock.ts`, `src/mock/current-user-mock.ts`
  - `src/components/shell/NewsBadge.tsx` + `NewsBadge.test.tsx`
  - `src/components/shell/SupportDropdown.tsx`
  - `src/components/shell/BranchMapModal.tsx` + `BranchMapModal.test.tsx`
  - `src/components/shell/AppFooter.tsx`
  - `src/demo/call-center-demo.tsx` + `call-center-demo.test.tsx`
  - `src/pages/thong-bao/ThongBaoPage.tsx` + `ThongBaoPage.test.tsx`
  - `src/pages/tin-tuc/TinTucPage.tsx`, `src/pages/tin-tuc/TinTucDetailPage.tsx` + `TinTucPage.test.tsx`
  - `src/pages/tai-khoan/TaiKhoanPage.tsx` + `TaiKhoanPage.test.tsx`
  - `src/components/dashboard/PlanCalendar.tsx` + `PlanCalendar.test.tsx`
- Modify:
  - `package.json` (add `xlsx`)
  - `src/components/reports/export-excel-menu.tsx` (**C3** — route `mockCsvDownload` through the F8-hardened `export-xlsx`/`neutralizeCell`; it's the live CSV export path, currently unsanitized) + `export-excel-menu.test.tsx`
  - `src/constants/routes.ts` (4 new routes)
  - `src/routes/index.tsx` (wire /thong-bao, /tin-tuc, /tin-tuc/:id, /tai-khoan)
  - `src/components/shared/data-table/data-table.tsx` (rowSelection props)
  - `src/components/shared/index.ts` (export selection column, bulk bar, autocomplete, ky-picker, line-item editor)
  - `src/components/shell/NotifBadge.tsx` (store-driven rewrite) + `NotifBadge.test.tsx`
  - `src/components/shell/TopBar.tsx` (NewsBadge, SupportDropdown) + `TopBar.test.tsx` (characterization)
  - `src/components/shell/UserMenu.tsx` ("Thông tin tài khoản" item, phone in header) + `UserMenu.test.tsx`
  - `src/components/shell/AppShell.tsx` (AppFooter, BranchMapModal mount, useCallCenterDemo)
  - `src/lib/store-keys.ts` (`notifications: 'pt-notifications'`)
  - `src/pages/DashboardPage.tsx` (Tabs wrap) + `DashboardPage.test.tsx`
- Delete: none

## TDD Plan

1. **Characterization tests (lock existing behavior before touching files):**
   1. `data-table.test.tsx`: renders headers/rows from column defs; sort toggle asc→desc; empty state shows "Không có dữ liệu"; `onRowClick` fires with row original; `toolbar` slot renders.
   2. `TopBar.test.tsx`: renders search trigger "Tìm kiếm", bell button, theme toggle, user menu (survives the widget additions).
   3. `UserMenu.test.tsx`: menu contains "Đổi mật khẩu" and "Đăng xuất"; Đăng xuất navigates to `ROUTES.login`.
   4. `DashboardPage.test.tsx`: renders PageHeader "Trang chủ" and KPI content (WorkQueueTiles) with seeded query client — must still pass after Tabs wrap with `Tổng quan` as default.
2. **Failing spec tests (cite section-shell-nav-layout.md / section-admin-perm-account.md; write before implementation):**
   1. `export-xlsx.test.ts`: `buildSheetAoa([{header:'Chi nhánh',…},{header:'Điện thoại',…}], rows)` returns `[['Chi nhánh','Điện thoại'], …rowValues]` in column order; `exportToXlsx` appends `.xlsx` to filename and calls SheetJS writeFile (spy). **F8:** a **string** cell `'=SUM(A1)'` (and `'@cmd'`, `'\t=x'`, `'  =x'`) is emitted prefixed with `'` (assert `"'=SUM(A1)"`); a normal string `'Nguyễn'` is untouched. **M3:** a **numeric** cell `-1` / `3.5` (accessor returns a `number`) is emitted as the number, NOT string-prefixed (assert the cell === `-1`, not `"'-1"`) — the guard never corrupts legit negatives/deltas.
   2. `open-external.test.ts` (F9): `buildMapUrl('12 Lê Lợi, Q1 & <b>')` percent-encodes the address into the query; `openExternal('https://maps…')` calls `window.open` with `'_blank','noopener,noreferrer'` (spy). **M3 edge cases — all no-op (window.open NOT called):** `'javascript:alert(1)'`, `'data:text/html,x'`, `'//evil.com'` (protocol-relative), `'  javascript:alert(1)'` (leading whitespace), `'java\nscript:alert(1)'` (embedded newline); **`'HTTPS://ok.com'` (uppercase scheme) IS allowed** (scheme lowercased before check). `buildGeoUrl(10.77, 106.7)` yields an `https:` URL.
   2b. `export-excel-menu.test.tsx` (**C3**): the menu's download path routes through the hardened exporter — a report row cell `'=HYPERLINK("http://x")'` is neutralized in the produced file (spy the exporter / assert the emitted CSV/sheet cell is `'`-prefixed); no raw un-neutralized `Blob` concat of a formula-leading cell.
   3. `print-window.test.tsx`: `openPrintWindow('Phiếu test', <div>NỘI DUNG</div>)` produces a window whose `document.title === 'Phiếu test'`, contains the rendered element markup, and `@media print` CSS (mock `window.open`). **F7:** `openPrintWindow('<img src=x onerror=alert(1)>', <div>ok</div>)` does NOT inject a live `<img>`/executable node into the doc chrome — the title string is set via `textContent`/`doc.title`, so it appears escaped/inert (assert the raw markup is not present as an element).
   3. `selection-column.test.tsx` + `bulk-actions-bar.test.tsx`: header checkbox has accessible name "Chọn tất cả"; checking 2 rows → `rowSelection` has 2 keys; BulkActionsBar shows "Đã chọn 2 dòng" and renders passed action button; hidden when selection empty; row-checkbox click does NOT fire `onRowClick`.
   4. `server-autocomplete.test.tsx`: typing calls `fetchOptions` with query (debounced, fake timers); option select sets `{id,label}`; `[+]` button visible only with `quickCreate`; quick-create submit calls `onCreate` and selects returned option.
   5. `ky-picker.test.tsx`: `KyPicker` label "Kỳ", options formatted "M/YYYY" (assert "7/2026" present, descending order); `KyRangePicker` renders exactly two selects labeled "Từ Kỳ" and "Đến Kỳ".
   6. `line-item-editor.test.tsx`: footer has buttons "Lưu" and "Lưu & Thêm mới"; "Thêm dòng" appends a line row; row remove works; totals footer recomputes from line values; `onSave` receives `{ saveAndNew: boolean }`.
   7. `notification-store.test.ts`: seeded unseen count > 0; `markSeen(id)` decrements; `markAllSeen()` → 0; news equivalents; seen-ids persist under `pt-notifications`.
   8. `NotifBadge.test.tsx`: badge shows store unseen count; dropdown header action "Đánh dấu tất cả là đã đọc" zeroes badge; items show phiếu code + status name with Phase 1 legacy status hex; footer link "Danh sách" hrefs `/thong-bao`.
   9. `NewsBadge.test.tsx`: unread items bold; per-item action "Đánh dấu là đã xem" marks seen; footer "Danh sách" hrefs `/tin-tuc`; item click navigates to `/tin-tuc/:id`.
   10. `call-center-demo.test.tsx`: `triggerDemoCall(known)` toast contains "Có cuộc gọi mới !", `{name} - {number}` heading, button "Tiếp nhận"; clicking Tiếp nhận navigates to `ROUTES.repairCreate` with `num` query param and dismisses toast; unknown variant renders "Không xác định - {number}".
   11. `TaiKhoanPage.test.tsx`: heading "Thông tin người dùng"; labels exactly `Chi nhánh`, `Tên đăng nhập`, `Họ và tên`, `Điện thoại`, `Email`, `Khóa tài khoản`, `Quyền`, `Chi nhánh phụ`; Chi nhánh phụ renders multiple branch names; `UserMenu.test.tsx` extended: item "Thông tin tài khoản" navigates `/tai-khoan`.
   12. `BranchMapModal.test.tsx`: dialog title "Bản đồ chi nhánh"; search input placeholder "Search Box"; lists seeded branches; store `open()` shows dialog.
   13. `ThongBaoPage.test.tsx` / `TinTucPage.test.tsx`: pages render at `/thong-bao`, `/tin-tuc` (memory router); list rows match store feeds; detail page shows title/author/date/body.
   14. `DashboardPage.test.tsx` extended: tab triggers exactly "Tổng quan" and "Kế hoạch của bạn"; calendar tab renders current-month grid with ≥1 seeded event chip.
   15. `routes` assertions (in a small `routes.test.ts`): `ROUTES.notifications === '/thong-bao'`, `ROUTES.news === '/tin-tuc'`, `ROUTES.account === '/tai-khoan'`.
3. **Implementation order to green:** lib primitives (export-xlsx → print) → DataTable selection + bulk bar → ServerAutocomplete → KyPicker → LineItemEditor → mocks + notification store → NotifBadge/NewsBadge/SupportDropdown → routes + ThongBao/TinTuc/TaiKhoan pages → UserMenu → BranchMapModal + AppFooter + AppShell wiring → call-center demo → Dashboard tabs. Re-run characterization suite after each shell-file edit.

## Implementation Steps

1. `npm install xlsx`. Add `STORE_KEYS.notifications = 'pt-notifications'` in `src/lib/store-keys.ts` (auto-included in `ALL_STORE_KEYS` for demo-reset).
2. Write characterization tests (TDD Plan §1) against current `data-table.tsx`, `TopBar.tsx`, `UserMenu.tsx`, `DashboardPage.tsx`; commit green baseline.
3. Build `src/lib/export-xlsx.ts`: `buildSheetAoa` + `exportToXlsx` per Architecture, including the **F8 `neutralizeCell`** guard — prefix `'` only on **string** cells whose first non-whitespace char ∈ `= + - @` (incl. `\t`/`\r`-prefixed); **numeric cells pass through untouched** (M3 — never corrupt `-1`/deltas). Consumers later render buttons labeled `Xuất Excel` / `Xuất ra Excel` / `Xuất Excel File` per their own specs — exporter API stays label-free.
3c. **C3 — harden the existing CSV export.** Rewrite `src/components/reports/export-excel-menu.tsx` `mockCsvDownload` to route through `export-xlsx` (or run every field through `neutralizeCell` before the CSV concat). This is the app's live export path (`report-configs.ts` + `KpiReportFilterForm.tsx` consume it) and today it's unsanitized `Blob`+`createObjectURL`+concat — the primary injection surface, invisible to the `document.write`/`window.open` greps.
3b. Build `src/lib/open-external.ts` (**F9**): `openExternal(url)` (scheme allowlist `http/https` + `window.open(...,'noopener,noreferrer')`) + `buildMapUrl(address)` / `buildGeoUrl(lat,lng)` (encodeURIComponent). This is the sanctioned external-link path for all later phases.
4. Build `src/components/print/print-window.tsx` (`openPrintWindow`) and `print-layout.tsx` (`PrintLayout` with props: `title`, `companyHeader?`, `signatures?: string[]`, children). Base print CSS: A4-ish margins, black-on-white, table borders. **F7:** render the element via `renderToStaticMarkup` (React escapes it); set the doc `title` via `doc.title`/`textContent`, never by concatenating it into the `document.write` HTML string.
5. Extend `src/components/shared/data-table/data-table.tsx` with `enableRowSelection`, `rowSelection`, `onRowSelectionChange` (pass through to `useReactTable`, add `state.rowSelection`). Create `selection-column.tsx` (`buildSelectionColumn<T>()` — header Checkbox aria-label/tooltip "Chọn tất cả", cell Checkbox with `onClick` stopPropagation) and `bulk-actions-bar.tsx` (props `count`, `children`; renders "Đã chọn {count} dòng" + children, null when count 0). Export both from `src/components/shared/index.ts`.
6. Build `src/components/shared/server-autocomplete.tsx`: props `value`, `onChange`, `fetchOptions`, `placeholder`, `quickCreate?`. Debounce 250ms; loading spinner row; empty row "Không có kết quả". `[+]` icon Button opens Dialog with `quickCreate.title` + `renderForm(close, select)`. Export from barrel.
7. Build `src/components/shared/ky-picker.tsx`: `KyPicker` + `KyRangePicker` (labels exactly `Kỳ`, `Từ Kỳ`, `Đến Kỳ`), options from Phase 1 Kỳ entity module (descending, display "M/YYYY"). Export from barrel.
8. Build `src/components/shared/line-item-editor/line-item-editor.tsx`: generic template per Architecture; action buttons labeled exactly `Lưu` and `Lưu & Thêm mới`, add-row button `Thêm dòng`. Export from barrel.
9. Build mocks: `src/mock/notifications-mock.ts` (≈20 status-change items derived from Phase 1 repair seed: phieuCode, legacy statusId, changedBy staff name, timestamps) and `src/mock/news-mock.ts` (≈10 items; title pattern `{n}. {TÊN NSX}, {phieuCode}` matching ref sample "1. SUPOR, 20180829-8200"; author, datetime, 1-2 sentence body, linked repairId). SeededRandom only.
10. Build `src/store/notification-store.ts` per Architecture (persist partialize: seen ids only).
11. Rewrite `src/components/shell/NotifBadge.tsx`: red unseen-count badge (hidden at 0); dropdown header row with action `Đánh dấu tất cả là đã đọc`; items = status-colored badge (legacy hex + status name) + phiếu code + changedBy + relative time, item click → `ROUTES.repairDetail(repairId)` + `markSeen`; per-item hover action `Đánh dấu là đã xem`; footer link `Danh sách` → `ROUTES.notifications`.
12. Build `src/components/shell/NewsBadge.tsx` (Mail icon, blue badge): dropdown header `Đánh dấu tất cả là đã đọc`; items: bold-when-unread title, meta line (author + datetime), body preview, leading check icon button with tooltip `Đánh dấu là đã xem`; item click → `ROUTES.newsDetail(id)`; footer `Danh sách` → `ROUTES.news`.
13. Build `src/components/shell/SupportDropdown.tsx` (HelpCircle icon): panel titled `Thông tin liên hệ hỗ trợ:` with placeholder contact body (ref body empty — see Unresolved).
14. Add routes: `notifications: '/thong-bao'`, `news: '/tin-tuc'`, `newsDetail: (id: string) => `/tin-tuc/${id}``, `account: '/tai-khoan'` in `src/constants/routes.ts`; wire lazy pages in `src/routes/index.tsx` (inside AppShell children). No nav-config edits (D1 — header-accessed pages).
15. Build `src/pages/thong-bao/ThongBaoPage.tsx`: PageHeader `Thông báo` (breadcrumb Trang chủ / Thông báo); DataTable over notification feed — columns (inferred, see Unresolved): STT, `Phiếu sửa chữa`, `Tình trạng` (legacy status pill: bg hex, white pill, bold uppercase per §5b render rule), `Người đổi`, `Thời gian`, `Đã xem`; toolbar action `Đánh dấu tất cả là đã đọc`; row click → repair detail. Register command-palette entry "Thông báo".
16. Build `src/pages/tin-tuc/TinTucPage.tsx` (PageHeader `Tin tức`; list of news cards/rows: title, author, datetime, unread bold, `Đánh dấu là đã xem` action; row click → detail) and `TinTucDetailPage.tsx` (title, meta, body, link `Xem phiếu sửa chữa` → repairDetail when repairId present; marks item seen on mount). Register command-palette entry "Tin tức".
17. Build `src/mock/current-user-mock.ts` (fields for all 8 profile labels; ≥2 Chi nhánh phụ entries from branch seed) and `src/pages/tai-khoan/TaiKhoanPage.tsx`: breadcrumb `Trang chủ / Thông tin tài khoản`, box `Thông tin người dùng`, two-column read-only rows with labels exactly `Chi nhánh`, `Tên đăng nhập`, `Họ và tên`, `Điện thoại`, `Email`, `Khóa tài khoản` (value `Mở` — ref shows typo "Mỡ", see Unresolved), `Quyền`, `Chi nhánh phụ` (comma-separated). No actions (ref is static).
18. Update `src/components/shell/UserMenu.tsx`: add item `Thông tin tài khoản` → `ROUTES.account` above `Đổi mật khẩu`; show current-user phone in the label header (ref user-header shows phone).
19. Build `src/components/shell/BranchMapModal.tsx`: zustand `useBranchMapStore` (`open/close`) exported from same file; Dialog (~80% width) titled `Bản đồ chi nhánh`; left: input placeholder `Search Box` filtering branch list (name + Toạ độ); right: OpenStreetMap iframe embed centered on selected branch coordinates (static embed, D4 — no Google API). Register command-palette action `Bản đồ chi nhánh`.
20. Build `src/components/shell/AppFooter.tsx`: right `Version 1.0.0`, left `Copyright © 2026 Phát triển bởi Phần Mềm Quốc Bảo` (external link to phanmemquocbao.com). Mount footer + `<BranchMapModal />` in `AppShell.tsx`; add `NewsBadge` + `SupportDropdown` to `TopBar.tsx` right cluster (order: bell, news, support — ref order).
21. Build `src/demo/call-center-demo.tsx`: `useCallCenterDemo()` — registers Ctrl+Shift+G hotkey + command-palette action `Demo: Cuộc gọi đến`; `triggerDemoCall()` picks a seeded customer → sticky `toast.success` custom JSX: line `Có cuộc gọi mới !`, heading `{name} - {number}`, buttons `Tiếp nhận` (→ `navigate(ROUTES.repairCreate + '?num=' + number + '&kh=' + customerId)`, dismiss toast) and `Từ chối` (dismiss; ref deny-call POST is server-only — mock as dismiss); every 3rd trigger uses unknown-caller `toast.error` `Không xác định - {number}` (no Tiếp nhận id). Mount hook in `AppShell`. Document hotkey in `src/demo/demo-script.md`.
22. Update `src/pages/DashboardPage.tsx`: wrap content in Tabs — `Tổng quan` (existing markup unchanged, default) and `Kế hoạch của bạn` → `PlanCalendar` (custom month grid: weekday header T2-CN, prev/next month buttons, event chips colored per event, default #f39c12) fed by `src/mock/plan-events-mock.ts` (seeded events in current month). FAB + PageHeader stay outside tabs.
23. Full gate: `npm run test && npm run type-check && npm run lint && npm run build`. Verify no dead routes (visit /thong-bao, /tin-tuc, /tin-tuc/:id, /tai-khoan manually via `npm run dev`).

## Success Criteria

- [ ] `xlsx` installed; `exportToXlsx` downloads a real .xlsx (manual spot-check) and `buildSheetAoa` unit tests green, **including the F8 formula-injection neutralization test (string cells) AND the M3 numeric-negative-preserve test** (`-1` stays a number, not `'`-prefixed).
- [ ] `openPrintWindow` + `PrintLayout` exist with tests; opening a print window renders element markup with print CSS, **and the F7 test proves an untrusted `title` string cannot inject a live node** (set via `textContent`/`doc.title`); the print body path is React-escaped.
- [ ] `src/lib/open-external.ts` exists (**F9**): `openExternal` opens only `http/https` (case-insensitive) with `noopener,noreferrer`, no-ops on `javascript:`/`data:`/protocol-relative/whitespace-or-newline-obfuscated schemes, and `buildMapUrl`/`buildGeoUrl` encode interpolated values — tests green. This is the only external-open path P3+ may use.
- [ ] **C3:** `export-excel-menu.tsx` `mockCsvDownload` routes through the F8-hardened path (no unsanitized formula-leading cell in the produced file) — test green.
- [ ] DataTable supports controlled row selection; `buildSelectionColumn` header reads "Chọn tất cả"; BulkActionsBar shows "Đã chọn N dòng"; all pre-existing DataTable characterization tests still green.
- [ ] ServerAutocomplete fetches mock options, binds `{id,label}`, and `[+]` quick-create modal creates + selects; exported from `src/components/shared/index.ts`.
- [ ] KyPicker/KyRangePicker render "Kỳ" / "Từ Kỳ" / "Đến Kỳ" with "M/YYYY" options from the Phase 1 Kỳ entity.
- [ ] LineItemEditor template renders header slot, editable lines, totals, and buttons "Lưu" / "Lưu & Thêm mới".
- [ ] Bell badge = store unseen count; "Đánh dấu tất cả là đã đọc" works; footer "Danh sách" reaches working `/thong-bao` list page with legacy-status-colored rows.
- [ ] News dropdown with blue badge, bold unread, per-item "Đánh dấu là đã xem"; `/tin-tuc` list + `/tin-tuc/:id` detail pages work.
- [ ] Ctrl+Shift+G (and palette action) fires sticky toast "Có cuộc gọi mới !" with "Tiếp nhận" navigating to repair intake with caller params; unknown variant shows "Không xác định - {number}".
- [ ] `/tai-khoan` shows all 8 labels exactly (Chi nhánh, Tên đăng nhập, Họ và tên, Điện thoại, Email, Khóa tài khoản, Quyền, Chi nhánh phụ) and UserMenu has "Thông tin tài khoản".
- [ ] "Bản đồ chi nhánh" modal opens globally, filters branches via "Search Box" input, embeds a map on branch coordinates.
- [ ] DashboardPage has tabs "Tổng quan" (default, KPI content unchanged — characterization green) and "Kế hoạch của bạn" with seeded event calendar.
- [ ] Support dropdown "Thông tin liên hệ hỗ trợ:" and footer "Version 1.0.0" / "Copyright © 2026 Phát triển bởi Phần Mềm Quốc Bảo" present.
- [ ] New persisted state cleared by `resetDemo()` (pt-notifications in ALL_STORE_KEYS).
- [ ] `npm run type-check && npm run lint && npm run test && npm run build` all clean; no dead routes.

## Risk Assessment

- **DataTable regression** (highest): row-selection touches the one shared table used by every CRUD page. Mitigation: characterization tests first (step 2); selection strictly opt-in (`enableRowSelection` default off); rollback = revert `data-table.tsx` edit — new files are additive.
- **Bundle weight**: `xlsx` (~400KB) — mitigate with dynamic `import('xlsx')` inside `exportToXlsx` so it stays out of the initial chunk. `react-dom/server` import in print-window — dynamic-import likewise.
- **Sticky toast + navigation coupling**: sonner custom JSX with router navigation only works under RouterProvider — hook mounted in AppShell, test with memory router. Fallback: window.location assignment.
- **Phase 1 contract drift**: Kỳ lookup + legacy status module APIs are P1 deliverables; if shapes differ, adjust picker/bell only (single import sites). Blocked if P1 unfinished — do not start before P1 merges. Bell/notification items derive from the **live** repair data (`MOCK_TICKETS`) per D5, not the deleted seed arrays.
- **Security primitives are consumed, not enforced, downstream**: F7/F8/F9 only protect if P3-P7 actually route through these helpers. Mitigation: the helpers are the *only* exported way to print/export/open-external (no raw `document.write`/`window.open` in later phases); the whole-plan sweep + per-phase success criteria check for raw usages. These are mock-app hardening (defense-in-depth against self-inflicted XSS/CSV-injection via free-text mock fields), not a claim of a hostile threat model.
- **Spec gaps for /thong-bao, /tin-tuc** (see Unresolved): columns/layout inferred; keep pages thin (single file each) so a later mirror capture can correct cheaply.
- **Rollback**: every deliverable is additive (new files/routes) except data-table.tsx, TopBar.tsx, UserMenu.tsx, AppShell.tsx, DashboardPage.tsx edits — each independently revertible; removing new routes from routes.ts + constants fully de-wires new pages.

## Unresolved

1. `/RepairingStatusHistory/Index` list page was never mirrored (only the dropdown footer link) — column set inferred from dropdown item anatomy (phiếu, status, người đổi, thời gian, đã xem). Correct when a mirror capture exists.
2. `/News/Index` + `/News/Detail` layouts not mirrored — list/detail inferred from dropdown item anatomy (title/author/datetime/body + repair link).
3. Status viết-tắt strings (bell items show "color/viết-tắt status badge" per custom.js) not captured — using full legacy status names.
4. News title semantics of "1. SUPOR, 20180829-8200" (leading number = ordinal vs id; SUPOR = manufacturer?) unverified — mock uses `{n}. {TÊN NSX}, {phieuCode}`.
5. Support dropdown contact body empty in the capture — shipping placeholder contact lines.
6. Branch Toạ độ values: if Phase 1 seed omits `toaDo`, Phase 2 adds mock coordinates to `chi-nhanh.mock.ts` (format per ref tooltip: `21.029743, 105.833882`).
7. **RESOLVED (validation V4):** ref /User/Detail shows lock value "Mỡ" (legacy typo) — **render the correct "Mở".** D3 is data/column/taxonomy fidelity, not bug-for-bug UI-string parity; correct all such verbatim typos + note in report.
8. Deny-call POST (`/api/CallCenter/CallRing`) is server-side — mocked as toast dismissal only; confirm no visible UI expected.
