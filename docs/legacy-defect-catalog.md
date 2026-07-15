# Legacy Defect Catalog

**Subject:** the deployed legacy ASP.NET admin instance
(`phongthanh.phanmemsuachuabaohanh.com`, vendor "Phần Mềm Quốc Bảo") **as observed
on 2026-07-07**. Companion to
[legacy-vs-rebuild-comparison.md](./legacy-vs-rebuild-comparison.md).

> **Vendor scope disclaimer.** These findings describe **the deployed instance as
> observed on 2026-07-07 at recon level — this is NOT a formal security audit or
> penetration test.** Security claims are **evidence-bound** (each cites a probe in
> the [evidence appendix](./assets/legacy-audit-evidence.md) or a section-file spec)
> and are **never bare product-level assertions** about the vendor's software.
> Several observations are era/stack-bound (a ~2014 ASP.NET/AdminLTE2 deployment),
> not necessarily negligence. **This catalog + the screenshots are
> internal-distribution only pending owner sign-off.**

**Confidence legend** (glossary §2): **confirmed** = directly observed 2026-07-07 or
verified in shipped rebuild code · **likely** = strong inference from a _named_
observed artifact · **unconfirmed** = not provable by read-only recon → requires an
authorized pentest.

**Rebuild honesty note.** The "Rebuild handling" column describes a **mock/in-memory
prototype** (no backend; writes lost on reload; permission matrix has no
enforcement). Where the rebuild "fixes" something, it does so in the prototype — not
in a shipped production system.

> **Current rebuild status — 2026-07-15.** The preceding honesty note and the
> historical "Rebuild handling" cells describe the 2026-07-07 comparison
> baseline. The repo now has a NestJS/Postgres backend for auth and 18 release
> resources; most repair, warehouse, finance, HR, and report workflows remain
> mock-backed. Full permission-matrix enforcement remains deferred. Legacy
> findings and historical handling cells below are intentionally unchanged.

---

## 1. Functional defects

Mostly `confirmed` — either observed live on 2026-07-07 or documented in the 260703
section specs (which were verified from mirrored partials).

| ID | Defect | Evidence | Conf | Rebuild handling |
|---|---|---|---|---|
| F-1 | **`/RoleFunction/Index` returns HTTP 500** — the role/function permission-management page is outright broken ("The partial view 'Create' was not found"). `/RoleFunction/Create` also 500s. | [evidence #5](./assets/legacy-audit-evidence.md), screenshot `01-rolefunction-http500.jpg`; `section-admin-perm-account.md` | confirmed | Permission surface rebuilt as menu-tree + 202-checkbox **function matrix** (`function-permission-matrix.tsx`); ChucNang taxonomy reconstructed from RoleMenu spec since the reference page is unreachable. **Honesty:** matrix is UI-only, **no enforcement**. |
| F-2 | **Copy-paste box title bug** — the branch-list box is titled *"Danh sách nhà sản xuất"* (manufacturer list) instead of a branch title. | `section-shell-nav-layout.md` / gap matrix §2 | likely | Rebuilt lists use correct per-entity titles from CrudConfig; no shared copy-paste title. |
| F-3 | **Filter field wiring bug** — *"Số phiếu hãng"* input writes `filters.soPhieu`; the quick-search heuristic blocks combining that with other fields. | `section-repair-main.md`; gap matrix Index_8 medium | confirmed | **Fixed**: independent `soPhieuHang` filter key; all 22 reference filters combine freely (`use-repair-filters.ts`, P3). |
| F-4 | **Display typos** — *"Mỡ"* (should be *Mở*) and *"Sản phầm"* (should be *Sản phẩm*) shown in the reference UI. | `section-admin-perm-account.md`, `section-catalog-a.md` | confirmed | **Corrected** to "Mở" / "Sản phẩm" (D3/V4). This is a deliberate deviation from bug-for-bug fidelity — see comparison §4. |
| F-5 | **Naming / model inconsistencies** — *"Xác"* used where *"xác nhận"* is meant; warranty labels drift across screens (Tại Trạm/Nhà Khách vs Tại TTBH/Tại Nhà); Chuyển Kho uses invented status values inconsistently. | `section-warehouse.md`, `section-stock-out.md` | likely | Rebuild uses a single canonical taxonomy per concept; the warranty-label split is **preserved verbatim per screen** (each faithful to its own reference screen — a documented deviation, not a new fix). |
| F-6 | **Export is HTML masquerading as `.xls`** — the repair-list "Xuất Excel" returns `Content-Type: application/ms-excel` + `filename=….xls`, but the body is an **HTML `<table>` dump** (~2,486 rows, 41 cols), not a real OOXML workbook. | [evidence #7](./assets/legacy-audit-evidence.md) | confirmed | Rebuild exports **real `.xlsx`** via SheetJS (`export-xlsx.ts`), with formula-injection neutralization (F8). See S-4 below. |

---

## 2. Security & data-integrity

Per the vendor-scope disclaimer: evidence-bound, recon-level, **not a pentest**.
Every row is confidence-tagged; each `likely` names its observed artifact; each
exploit-level claim says "requires authorized pentest". The rebuild-hardening
contrast references the shared primitives **F7** (print-window), **F8** (xlsx
export neutralization), **F9** (external-link allowlist).

| ID | Finding | Evidence | Conf | Severity framing | Rebuild handling / contrast |
|---|---|---|---|---|---|
| S-1 | **No HTTPS / cleartext transport** — HTTP-only, no TLS listener on 443, no HTTP→HTTPS redirect, no HSTS. Login POST + `__Auth` session cookie transit in cleartext. | [evidence #2](./assets/legacy-audit-evidence.md) | confirmed | High impact for a PII system, but exploitation needs network-path (LAN/MITM) access → deployment-context-dependent. | Rebuild is a client-only prototype (no auth transport of its own); N/A at prototype stage, but any production deployment should be TLS-only + HSTS. |
| S-2 | **Error-detail disclosure (`customErrors=Off`)** — the HTTP 500 page renders a **full managed stack trace + candidate view paths + a full Windows drive path** (`C:\Users\Administrator\Desktop\HOST\…\Views\RoleFunction\Index.cshtml`) to remote users. | [evidence #5](./assets/legacy-audit-evidence.md), screenshot 01 | confirmed | Info disclosure, LOW–MED (leaks framework/version + server directory layout + that the app runs from an **Administrator account's Desktop** — a deployment-hygiene smell; no DB creds/connection strings observed in the sample). | Rebuild has no server error pages; a production backend should set `customErrors=RemoteOnly` / equivalent. |
| S-3 | **Missing security response headers** — no CSP, `X-Content-Type-Options`, `Referrer-Policy`, or HSTS on either surface. `X-Frame-Options` is **present (`SAMEORIGIN`) on the login page but absent on authed app pages** (inconsistent — clickjacking protection covers login only). | [evidence #4](./assets/legacy-audit-evidence.md) (discrepancy D-1) | confirmed | Standard hardening gaps; era-typical for a 2014 stack. Clickjacking exposure on authed pages is `likely` (no frame-busting observed), exploitability requires a hostile embedding context. | Rebuild ships no headers itself (static prototype); production hosting should add CSP + `nosniff` + a global `X-Frame-Options`/`frame-ancestors`. |
| S-4 | **Formula-injection surface on the list export** — the export emits an HTML `<td>` table (Excel parses `=`-leading cells on open) containing user-controllable free-text columns (Tên khách hàng, Địa chỉ, Hư hỏng, Phụ kiện). | [evidence #7](./assets/legacy-audit-evidence.md) | **unconfirmed** | Two-part gate result: the sampled export had **no formula-leading cell present**, so neither condition (unescaped formula-leading cell AND user-free-text origin) was met on this data → **"unconfirmed — no triggering value present; escaping not observed"**, explicitly NOT "likely safe". Scoped to the **one export observed** (`ExcelRepairingList`), not generalized. **Upstream review classified formula-injection as LOW-severity self-inflicted (needs a malicious internal user), not a breach-class vuln** — do not inflate. | Rebuild's export routes **all** cells through `neutralizeCell` (F8): prefixes `'` to any string starting `= + - @`, without touching valid negative numbers. Every export path verified to route through it (P7 security grep sweep). |
| S-5 | **Client-side XSS surface (free-text → `window.open`/DOM)** — `repairing_8.js` has **9** `window.open("…" + var)` call-sites concatenating record fields (id, num, phone) into URLs/print markup with no visible escaping wrapper. | [evidence #9](./assets/legacy-audit-evidence.md) (named artifact: `repairing_8.js`) | likely | DOM-sink exposure where record-derived values flow unescaped; **not executed** (would require injecting a payload = a mutation) → **requires authorized pentest** to demonstrate breakout. | Rebuild: print via **F7** (`print-window.tsx`, `renderToStaticMarkup` React-escaped, title set via `doc.title` not string concat); external links via **F9** (`open-external.ts`, scheme allowlist http/https, `noopener,noreferrer`, rejects `javascript:`/`data:`). |
| S-6 | **CSRF / anti-forgery coverage unproven** — anti-forgery tokens ARE used on the login form and at least one data form (`Customer/Index`); `SameSite=Lax` on session cookies gives partial mitigation. Whether **every** state-changing action validates a token can't be shown by read-only recon. | [evidence #8](./assets/legacy-audit-evidence.md) | unconfirmed | No GET-reachable state change observed in mirrored `href`s (delete/approve are JS POSTs). Full CSRF posture → **requires authorized pentest**. | Rebuild is client-only mock (no real mutations to forge); N/A at prototype stage. |
| S-7 | **Session cookie flags** — `__Auth`, `ASP.NET_SessionId` are `HttpOnly; SameSite=Lax` but **not `Secure`**; anti-forgery cookie has no `SameSite`. | [evidence #3](./assets/legacy-audit-evidence.md) | confirmed | `HttpOnly`+`Lax` are good; missing `Secure` is moot **only because there's no HTTPS** (S-1) — with TLS added, `Secure` becomes mandatory. | N/A (prototype has no auth cookies); production must set `Secure` once on HTTPS. |
| S-8 | **End-of-life stack** — IIS 8.5 (Windows Server 2012 R2, extended support ended 2023-10-10), ASP.NET MVC 5.2 / .NET 4, jQuery + AdminLTE2. | [evidence: environment fingerprint](./assets/legacy-audit-evidence.md) | confirmed | Patch-currency/maintenance observation, not an exploit. Era-bound. | Rebuild is React 18 + Vite + current tooling (supported stack). |

---

## 3. Accessibility (heuristic — not user-tested)

> **All rows are `likely` / heuristic** — inferred from the known stack
> (AdminLTE2 / Bootstrap 3, jQuery) and observed markup, **not** verified with a
> screen reader or automated a11y audit against the live site.

| ID | Issue (heuristic) | Basis | Conf | Rebuild handling / contrast |
|---|---|---|---|---|
| A-1 | AdminLTE2 / BS3 default palette has **low-contrast** secondary text + muted labels below WCAG AA in places. | Known theme defaults; observed screenshots | likely (heuristic) | Rebuild uses shadcn/ui tokens with light/dark contrast pairs; `prefers-reduced-motion` + focus-visible primitives. |
| A-2 | **Popup-window editors** (repair detail/create, prints via `window.open`) create focus traps / new-window context that screen readers and keyboard users handle poorly. | 9 `window.open` sites (evidence #9) | likely (heuristic) | Rebuild replaces popups with SPA routes + Radix dialogs (focus-trap, ESC, restore-focus) and a `useFocusTrap` hook for custom overlays. |
| A-3 | **Keyboard-navigation gaps** — jQuery/AdminLTE2 dropdowns + custom widgets often lack full ARIA roles / arrow-key support. | Stack heuristic | likely (heuristic) | Rebuild uses Radix primitives (menus, dialogs, comboboxes) with built-in keyboard + ARIA; an aria-live announcer (`announce.ts`) for page/filter changes. |
| A-4 | **Data tables** likely lack `scope`/caption/consistent header semantics for AT. | Stack heuristic | likely (heuristic) | Rebuild DataTable uses semantic `<table>` structure + accessible column config. |

---

## 4. UX friction

Interaction deltas — the concrete old behavior vs the rebuild's replacement. Old
behaviors are `confirmed` from the section specs/live UI; the rebuild side describes
prototype behavior.

| ID | Friction (old) | Evidence | Conf | Rebuild replacement |
|---|---|---|---|---|
| U-1 | **Popup windows** for editors and prints — blocker-fragile, no back-button, not deep-linkable. | `section-repair-main.md`; evidence #9 | confirmed | SPA routes + dialogs; deep-linkable, back-button works. |
| U-2 | **No bulk operations** on most lists — one-at-a-time actions. | gap matrix (repeated "no bulk delete" across catalog/HR/warehouse) | confirmed | DataTable bulk-select + `BulkActionsBar` (delete, batch status/tech, duyệt) where reference has the need. |
| U-3 | **Full-page reloads** — every search/filter is a server round-trip behind a mandatory "Tìm kiếm" button. | `section-repair-main.md`, warehouse/stock-out specs | confirmed | As-you-type client filtering + TanStack Query cache invalidation; no full reload. (Deliberate deviation — see comparison §4.) |
| U-4 | **Dual pagination** (top + bottom pagers) — UI noise from long reload-heavy pages. | multiple section specs ("dual pager" lows) | confirmed | Single bottom pager + page-size selector. |
| U-5 | **Mandatory "Tìm kiếm" button** before any results — extra interaction on every query. | `section-repair-main.md` | confirmed | Results filter live; button not required. |
| U-6 | **Dual "Tìm kiếm" / "Tìm chi tiết"** searches with unclear difference. | `section-warehouse.md`, `section-stock-out.md` | likely | Rebuild keeps both labels but they produce the same result locally (documented deviation — the distinct detail shape wasn't mirrored). |

---

## 5. Summary band

| Category | Count | Dominant confidence | Note |
|---|---|---|---|
| Functional | 6 | confirmed | F-1/F-3/F-4/F-6 confirmed live or in specs; F-2/F-5 likely |
| Security & data-integrity | 8 | mixed | S-1/S-2/S-3/S-7/S-8 confirmed; S-5 likely (named artifact); **S-4/S-6 unconfirmed → require authorized pentest** |
| Accessibility | 4 | likely (heuristic) | **none user-tested** — inferred from stack + markup |
| UX friction | 6 | confirmed | interaction deltas from section specs |

**Honest framing.** The security and accessibility rows are **recon-level and
heuristic respectively — not a formal audit or pentest**. The lone data-integrity
concern (S-4 formula-injection) is **`unconfirmed` on the sampled data and, even in
the worst case, LOW-severity/self-inflicted** — it is **not** inflated to a
breach-class claim. The strongest _confirmed_ findings are the **HTTP 500 +
stack-trace/server-path disclosure** (F-1/S-2) and **cleartext transport** (S-1).

---

## 6. Cross-doc reconcile gate (markdown doc-set "done")

Diffed the three markdown deliverables + evidence appendix for contradictory
numbers/claims. Result: **consistent**. Reconciled points:

| Claim | comparison.md | appendix | this catalog | evidence | Status |
|---|---|---|---|---|---|
| Gap severity totals | 88H / 121M / 75L | 88H / 121M / 75L (per-section sums match) | — | — | ✅ agree |
| Test count | 440 (deterministic) | 440 (P7) | — | — | ✅ agree |
| 15-status vocab + KT subset `[2,4,6,7,8,9,13,15,16,17]` | §Exec / §3 | §2, §3 | — | — | ✅ agree |
| `/RoleFunction` HTTP 500 + stack-trace leak | §1.3 D-2 | §12 low + §1 | F-1 / S-2 | #5 | ✅ agree |
| Formula-injection = **unconfirmed** (no triggering cell), LOW/self-inflicted, scoped to `ExcelRepairingList` | §1.3 D-3 | §8 note | S-4 / F-6 | #7 | ✅ agree — not inflated, not "safe" |
| X-Frame-Options present on login / absent on authed pages | §1.3 D-1 | — | S-3 | #4 (D-1) | ✅ agree — nuanced statement used everywhere |
| Permission matrix **no enforcement** | §3 residual 2, §5 flag 2 | §12 note | F-1 note | — | ✅ agree |
| Payroll Tổng/Thực lãnh = static sum, formula deferred | §5 flag 3 | §10 Deferred | — | — | ✅ agree |
| Export is HTML-as-`.xls` (not OOXML) | §1.3 D-4 | §8 F-6 ref | F-6 | #7 | ✅ agree |

**After this gate, the markdown doc-set (comparison + appendix + catalog + evidence
+ glossary) is internally consistent and "done" independently of the HTML magazine.**

---

_Companion files:_
[comparison record](./legacy-vs-rebuild-comparison.md) ·
[detail appendix](./legacy-vs-rebuild-appendix.md) ·
[evidence appendix](./assets/legacy-audit-evidence.md) ·
[VI glossary](./assets/vi-term-glossary.md).
