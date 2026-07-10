# Legacy Live-Audit Evidence Appendix

> **Scope & authorization.** Owner-authorized, read-only reconnaissance of the
> owner's own production instance `http://phongthanh.phanmemsuachuabaohanh.com`,
> performed **2026-07-07**. Authenticated by username `khoa` (password/session
> cookie never written to disk). No state-changing request was issued; the single
> "export" request (E5) is an HTTP **GET** file download. This is recon-level, not
> a formal penetration test. Findings describe the **deployed legacy instance as
> observed on this date** — not a product-level claim about the vendor
> ("Phần Mềm Quốc Bảo", a third party). **Internal-distribution only** pending
> owner sign-off.

This file is the citation target for the comparison doc-set. Narrative docs cite
`see evidence #N`. All "raw result" fields are **structural** (status codes,
headers, escaping presence/absence, byte counts) and **PII-stripped** — no customer
names, phones, addresses, serials, or money values are reproduced.

Confidence legend: **confirmed** = directly observed this pass; **likely** = strong
inference from an observed artifact (artifact named); **unconfirmed** = not
observable by read-only recon (→ requires authorized pentest).

---

## Environment fingerprint

| Property | Value | Source |
|---|---|---|
| Web server | `Microsoft-IIS/8.5` | `Server` header |
| Framework | ASP.NET MVC `5.2`, .NET CLR `4.0.30319` | `X-AspNetMvc-Version`, `X-AspNet-Version` |
| Powered-by | `ASP.NET` | `X-Powered-By` header |
| Transport | Plain HTTP only; **no TLS listener** on 443 | E-TLS below |
| Front-end | jQuery + AdminLTE2 / Bootstrap 3, SignalR 2.2.2 | mirrored `<script>` refs |
| Vendor branding | "Phần Mềm Quốc Bảo" (`phanmemquocbao.com`) | page footer |

IIS 8.5 ships with Windows Server 2012 R2 (extended support ended 2023-10-10);
.NET 4.0.30319 is the CLR string carried by the 4.x family. Stack is **era-2014**
and past mainstream vendor support — a maintenance/patch-currency observation, not
an exploit claim.

---

## Evidence entries

### #1 — Auth handshake reproduced · confirmed
- **Date:** 2026-07-07
- **Endpoint:** `GET /Admin/Login` → `POST /Admin/Login`
- **Probe:** Scrape `__RequestVerificationToken` (hidden form field) from the login
  GET; POST `UserName` + `Password` + token with a cookie jar.
- **Raw result:** GET returns `200`, sets `__RequestVerificationToken` cookie
  (`path=/; HttpOnly`, **no Secure**). POST returns `302 Found`, `Location: /`,
  sets `__Auth` cookie (`path=/; HttpOnly; SameSite=Lax`, **no Secure**). A
  subsequent authed `GET /Repairing/Index_8` returns `200` (`Danh sách phiếu sửa chữa`).
- **Interpretation:** Standard ASP.NET MVC forms-auth with anti-forgery on the
  login form. Auth cookie is `HttpOnly` + `SameSite=Lax` (good) but **not `Secure`**
  and served over plain HTTP → credentials and the session cookie transit in
  cleartext (see #2, #3).

### #2 — Transport posture: no HTTPS · confirmed
- **Date:** 2026-07-07
- **Endpoint:** `http://…/` and `https://…/`
- **Probe:** Request port 80 root; attempt TLS on 443.
- **Raw result:** Port 80 `GET /` → `302` to `/Admin/Login?ReturnUrl=%2f` (no
  upgrade to HTTPS). TLS attempt on 443 → `Recv failure: Connection reset by peer`
  (no TLS listener). No `Strict-Transport-Security` header anywhere.
- **Interpretation:** **confirmed** — the site is HTTP-only; there is no HTTPS
  endpoint and no HTTP→HTTPS redirect. All traffic, including the login POST and
  the `__Auth` session cookie, is transmitted in cleartext. High-impact for a
  system holding customer PII, but exploitation requires network-path access
  (LAN/MITM) → severity is deployment-context-dependent.

### #3 — Session/auth cookie flags · confirmed
- **Date:** 2026-07-07
- **Endpoint:** `Set-Cookie` on login POST and authed GET.
- **Raw result (values redacted):**
  - `__Auth=<REDACTED>; path=/; HttpOnly; SameSite=Lax` — **no `Secure`**
  - `ASP.NET_SessionId=<REDACTED>; path=/; HttpOnly; SameSite=Lax` — **no `Secure`**
  - `__RequestVerificationToken=<REDACTED>; path=/; HttpOnly` — **no `Secure`, no SameSite**
- **Interpretation:** `HttpOnly` blunts document-cookie theft via XSS; `SameSite=Lax`
  gives partial CSRF mitigation on the session cookies. The **missing `Secure` flag
  is moot only because there is no HTTPS** — with #2, cookies are cleartext regardless.

### #4 — Security response headers largely absent · confirmed (with a live/static discrepancy)
- **Date:** 2026-07-07
- **Endpoint:** `GET /Admin/Login` (unauth) vs `GET /Repairing/Index_8` (authed).
- **Raw result (5×/3× sampled, stable):**

  | Header | Login page | Authed app page |
  |---|---|---|
  | `Strict-Transport-Security` | absent | absent |
  | `Content-Security-Policy` | absent | absent |
  | `X-Content-Type-Options` | absent | absent |
  | `Referrer-Policy` | absent | absent |
  | `X-Frame-Options` | **`SAMEORIGIN` (present)** | **absent** |

- **Interpretation:** No CSP, no `nosniff`, no HSTS, no referrer policy on either
  surface. **Discrepancy vs the 260703 corpus** (which recorded X-Frame-Options as
  missing): it is in fact **present as `SAMEORIGIN` on the login page but absent on
  the authed application pages** — i.e. inconsistently applied, not globally absent.
  Clickjacking protection therefore covers the login screen but **not** the
  authenticated app. Recorded in the discrepancy list below.

### #5 — `/RoleFunction/Index` HTTP 500 + error-detail disclosure · confirmed (NEW, upgrades corpus)
- **Date:** 2026-07-07
- **Endpoint:** `GET /RoleFunction/Index` (also `GET /RoleFunction/Create`).
- **Raw result:** Both return `HTTP 500`. Body is the ASP.NET "Server Error in '/'
  Application" **yellow-screen** with:
  - Exception: `System.InvalidOperationException: The partial view 'Create' was not
    found or no view engine supports the searched locations.`
  - Searched-locations list leaking source view paths:
    `~/Views/RoleFunction/Create.aspx|.ascx|.cshtml|.vbhtml`, `~/Views/Shared/Create.*`.
  - A **full managed stack trace** (`System.Web.Mvc.*` frames) is rendered in the
    response — i.e. `customErrors` is **Off / not RemoteOnly**.
  - The "Source File" line leaks a **full Windows filesystem path including the OS
    account**: `C:\Users\Administrator\Desktop\HOST\phanmemsuachuabaohanh.com\
    phongthanh\Views\RoleFunction\Index.cshtml` — revealing the app runs from an
    **Administrator account's Desktop** (deployment-hygiene smell) and the server
    directory layout.
  - Screenshot: `screenshots/01-rolefunction-http500.jpg` (zero customer PII; the
    server-side path disclosure above is visible in it — that IS the evidence).
- **Interpretation:** Two findings in one. (a) **Functional defect — confirmed:**
  the permission-management page is outright broken (500) — the admin can't reach
  role/function management via this route. (b) **Security — confirmed
  (info disclosure, LOW–MED):** remote users receive full exception detail + stack
  frames + **candidate view paths (`~/Views/...`) AND a full drive path exposing the
  `Administrator\Desktop\HOST\...` deployment location**. This is a **new upgrade**
  over the static corpus, which only recorded "HTTP 500" without the
  `customErrors=Off` disclosure detail. No DB credentials or connection strings were
  observed in the leaked text; truncated to fingerprint here.

### #6 — Authed-route sweep · confirmed
- **Date:** 2026-07-07
- **Endpoint:** spot-check of 6 authed routes.
- **Raw result:** `200 /Customer/Index`; `200 /Repairing/Index_8`;
  `500 /RoleFunction/Index`; `500 /RoleFunction/Create`;
  `404 /Warehouse/Index`, `404 /Report/Index`, `404 /Finance/Index`,
  `404 /Employee/Index` (those modules use different controller names than guessed —
  real names differ, not evidence of breakage).
- **Interpretation:** Only the RoleFunction controller returns 500 in this sweep;
  the 404s are route-name mismatches from black-box guessing, **not** additional
  defects. No other 500 observed this pass.

### #7 — Export / data-integrity light probe (verified-non-mutating GET) · see gate
- **Date:** 2026-07-07
- **Endpoint:** `GET /Repairing/ExcelRepairingList?IsQuick=false&pageNumber=1`
- **Non-mutation pre-check (passed before firing):** The two "Xuất Excel"
  buttons are `<button name="typeName" class="ms-report-btn">`. Handler in
  `/Scripts/CategoryCommon/repairing_8.js` (lines 699–708) rewrites the **search
  filter form** to `method="GET"`, `action="/Repairing/ExcelRepairingList"`, then
  submits. It is the list/search filter form redirected to a file-output action —
  **idempotent GET report export, no mutation verb in any param** (all params are
  filter fields: `FromDate`, `ToDate`, `RepairingStatusId`, `TechnicianId`, …).
  Method is GET → definitively non-mutating. Fired **once**.
- **Raw result (structural, file inspected then discarded — not committed):**
  - `HTTP 200`, `Content-Type: application/ms-excel; charset=utf-8`,
    `Content-Disposition: attachment; filename=DS_PhieuSC_Tu_…-…-2026.xls`,
    `Content-Length: 6,593,418` bytes.
  - **Body is NOT a real XLSX/OOXML file.** Magic bytes are `0d0a…<!DOCTYPE`; body
    is an **HTML `<table>` document** (1 `<table>`, ~2,486 `<tr>`, 41 columns,
    ~99,400 `<td>`) served under an `.xls` filename + `application/ms-excel` type.
    This is the classic legacy "HTML-masquerading-as-Excel" export.
  - Column headers (labels, not PII): `STT, Số phiếu, Số phiếu hãng, Số phiếu DL,
    Tình trạng, Kỹ thuật, Ngày nhận, …, Tên khách hàng, Địa chỉ, Tên quận, Tên tỉnh,
    Điện thoại 1, Điện thoại 2, Email, Nhà sản xuất, Sản phẩm, Model, Số Serial,
    Phụ kiện, Hư hỏng, …` — free-text, customer-controllable columns are present
    (Tên khách hàng / Địa chỉ / Hư hỏng / Phụ kiện).
  - **Formula-leading-cell scan (PII-stripped, count-only):** cells beginning with
    `=` or `@` → **0**; beginning with `+` → **0**; beginning with `-`+letter
    (suspicious, excludes negative numbers) → **0**. The `&#NNN;` entities pervading
    the file are Vietnamese **diacritic** encodings (`&#224;`=à, `&#225;`=á, …),
    i.e. HTML/charset encoding, **not** security escaping of formula characters.
- **Two-part formula-injection gate (result):** The sample contains **no
  formula-leading cell**, so neither gate condition (a: unescaped formula-leading
  cell; b: derived from user free-text) is met on this data. Per the gate rule this
  is **"unconfirmed — no triggering value present in the sample; escaping behavior
  not observed"** — explicitly **NOT** "likely safe." Because the export path emits
  an HTML table (Excel parses formulas from HTML `<td>` on open), the theoretical
  surface exists, but no evidence of active neutralization **or** of a live
  injectable value was captured. Claim is scoped to **this one export
  (`ExcelRepairingList`)** only — not generalized to "exports."

### #8 — CSRF / anti-forgery surface · likely / unconfirmed
- **Date:** 2026-07-07
- **Endpoint:** `GET /Customer/Index`, `GET /Repairing/Index_8`.
- **Raw result:** `Customer/Index` renders 1 form containing 1
  `__RequestVerificationToken` hidden field. The `Repairing/Index_8` **search**
  form (`action=/Repairing/List`, AJAX POST) contains **0** anti-forgery tokens
  (it is a read/list query, so that is expected, not a defect). `SameSite=Lax` on
  the session cookies gives partial CSRF mitigation for top-level cross-site POSTs.
- **Interpretation:** Anti-forgery **is** used on at least the login and a data
  form; whether **every** state-changing action validates a token cannot be proven
  by read-only recon (would require issuing mutations). GET-reachable state changes:
  none observed in mirrored `href`s (delete/approve actions are JS-driven POSTs).
  **Exploitability → requires authorized pentest.**

### #9 — Client-side XSS surface (free-text into `window.open`/DOM) · likely
- **Date:** 2026-07-07
- **Endpoint:** `/Scripts/CategoryCommon/repairing_8.js` (public static asset).
- **Raw result:** **9** `window.open("…" + <var>)` call-sites concatenate raw
  record fields into URLs/markup, e.g.
  `window.open('/repairing/repairingcustomer?id=' + id + '&num=' + phone)` and
  print/label windows built by string concatenation (lines 183–304, 677–730,
  3387–3526 in the mirrored page). No visible output-encoding wrapper at these sites.
- **Interpretation:** **likely** DOM-sink exposure where record-derived values flow
  into `window.open` targets / print markup without an escaping wrapper (named
  artifact: `repairing_8.js` `window.open` concatenations). Whether a stored value
  actually breaks out is **not executed** (would require injecting a payload =
  mutation) → **not confirmed**; requires authorized pentest to demonstrate.

### #10 — Vendor / branding observation · confirmed (non-security)
- **Date:** 2026-07-07
- **Raw result:** Footer: `Copyright © 2026 … Phần Mềm Quốc Bảo`,
  `window.open('http://www.phanmemquocbao.com')`; UI is the vendor's branded
  AdminLTE2 theme.
- **Interpretation:** Screenshots reproduce a **named third party's** branded UI →
  captures are marked "for internal evaluation," branding cropped where not needed
  for the technical point; external circulation needs owner sign-off.

---

## Screenshot manifest (redaction pass logged)

All captures taken 2026-07-07 via `agent-browser` (Chromium/CDP), authenticated as
`khoa`. Format JPEG (byte-budgeted for the ≤2 MB HTML). **Redaction was applied via
injected CSS BEFORE each PNG/JPEG was written** — not after.

| # | File | Page | PII redaction | Verified |
|---|---|---|---|---|
| 01 | `screenshots/01-rolefunction-http500.jpg` | `/RoleFunction/Index` HTTP 500 yellow-screen | **None needed** — error page carries zero customer data; the broken page *is* the evidence | ✔ visual check: only stack trace + view paths |
| 02 | `screenshots/02-repair-list-index8-redacted.jpg` | `/Repairing/Index_8` repair list | All `tbody td` blurred + transparent text (names, phones, addresses, serials, notes) via injected CSS; headers/legend/toolbar kept | ✔ visual check: no legible customer data |
| 03 | `screenshots/03-report-technician-redacted.jpg` | `/ReportStatusTechnician` chart report | `tbody td` + **SVG chart text** (technician names/values) + header username blurred | ✔ visual check: names/values illegible |

Total captured bytes ≈ 952 KB (within the 2 MB HTML budget after embedding).
**Captures that succeeded: 3/3 attempted.** No text-only fallback was needed. All
three are **internal-distribution only** pending owner sign-off (vendor branding).

---

## Static-vs-live discrepancies

> Phases 2–3 **must** consume this section. Where a live observation (2026-07-07)
> differs from the 260703 static corpus, both are dated and the static one is
> marked superseded.

| # | Corpus (260703) said | Live (2026-07-07) observed | Resolution |
|---|---|---|---|
| D-1 | `X-Frame-Options` **missing** | **Present (`SAMEORIGIN`) on the login page**, **absent on authed app pages** — inconsistently applied | Corpus superseded. Clickjacking protection covers login only, not the authenticated app. Use the nuanced statement, not "missing" or "present." |
| D-2 | HTTP 500 on `/RoleFunction/Index` (bare) | 500 **confirmed** AND the response leaks a full stack trace + candidate view paths + a **full Windows drive path** (`C:\Users\Administrator\Desktop\HOST\…`) — `customErrors=Off` | Corpus **upgraded**: the 500 is also a server-path info-disclosure finding (framework version + `Administrator\Desktop` deployment location). `/RoleFunction/Create` also 500s. |
| D-3 | Formula-injection framed as a likely export risk | Export is **HTML-table-masquerading-as-`.xls`**; sample had **no formula-leading cell** → gate result "unconfirmed — no triggering value present" | Neither "confirmed" nor "likely safe." Scope strictly to `ExcelRepairingList`; note the HTML-export nature (Excel still parses `=`-leading `<td>` on open). |
| D-4 | (implicit) exports are `.xlsx` | Export `Content-Type: application/ms-excel` but body is an HTML `<table>` (not OOXML) | Recharacterize the old export mechanism as HTML-table, which is what the rebuild's real SheetJS `.xlsx` replaces. |
| D-5 | Missing security headers (general) | Confirmed absent: HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy` on both surfaces | Corpus confirmed (no change), now with dated evidence. |

_No other material divergences from the 260703 corpus were observed on the pages
probed this pass._
