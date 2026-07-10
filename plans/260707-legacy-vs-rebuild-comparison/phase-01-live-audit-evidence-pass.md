---
phase: 1
title: "Live-audit evidence pass"
status: completed
priority: P1
dependencies: []
---

# Phase 1: Live-audit evidence pass

> **Non-blocking enrichment (red-team H2).** Does NOT gate Phases 2-3. The
> synthesis docs are written independently with security rows defaulting to
> `likely/unconfirmed`; this phase UPGRADES specific rows to `confirmed` + adds
> screenshots. If it stalls (login rotates, site down, export needs params), the
> doc-set still ships from the static corpus — Phase 1 findings are additive.

> **Authorization.** Owner-authorized live audit of the owner's own production
> instance, 2026-07-07. Scope = read-only recon per the enumerable boundary
> below. Reference creds by username only in committed files; never write the
> password or a raw session cookie to disk.

## Overview

Drive the live legacy site (recon + light probing) to capture dated, citable
evidence for the security/data-integrity + runtime-defect sections + before/after
screenshots. Output a raw-evidence appendix (**English**) that Phases 2-3 cite.

## Read-only boundary (enumerable — red-team H1/H3)

**ALLOW:** unauthenticated GET; authed GET of already-mirrored read pages;
response header + cookie-flag inspection; ONE **verified-non-mutating** export
fetch (Step 5); browser screenshot of read pages (no clicks that submit/mutate).

**DENY** (each → recorded "requires authorized pentest", never executed): any
POST/PUT/DELETE that changes state; any form submission; following any
delete/approve/confirm/xác-nhận link; param fuzzing; brute force; auth-bypass;
capturing another user's session. **Confidence upgrades never justify crossing
the DENY line.**

## Requirements

- Functional: capture HTTP status codes, response headers, stack fingerprint,
  cookie flags, **one verified-non-mutating export's bytes** (formula-injection
  check), and runtime errors (HTTP 500s), authenticated by username `khoa`.
  **Also capture PII-redacted screenshots** of key pages for before/after.
- Non-functional: **read-only recon only per the boundary above**. No exploit
  execution, no mutation, no brute force. Exploit-level → "requires authorized pentest".
- **PII-redaction gate (red-team C1)**: every screenshot + every "raw result" in
  the evidence appendix is stripped of customer PII (names, phones, addresses,
  money/payroll, serials) BEFORE save. Prefer demo/seed records. Keep structural
  evidence (status codes, headers, escaping presence/absence), not record contents.
- Output language: evidence appendix in **English**; raw commands/headers/paths verbatim.
- Deterministic-ish: probes timestamped; site may change, so date every finding.

## Architecture

- Auth: `POST /Admin/Login` with `__RequestVerificationToken` (scraped from the
  login GET) + cookie jar. Confirmed working in brainstorm via plain `curl`
  (no browser-automation skill needed). Reuse the cookie jar for authed GETs.
- Evidence file: `docs/assets/legacy-audit-evidence.md` — a structured log of
  each probe: command intent, endpoint, result, interpretation. This is the
  citation target ("see evidence #N"), keeping the narrative docs clean.
- Security lens: OWASP-style surface check (transport, headers, CSRF exposure,
  injection surfaces, session) — but scoped to what read-only recon can show.

## Related Code Files

- Create: `docs/assets/legacy-audit-evidence.md` (raw probe log + interpretation, EN, PII-stripped)
- Create: `docs/assets/screenshots/*.png` (old-site captures, PII-redacted before save)
- Reference (read-only): `~/.claude/projects/.../memory/reference-app-access.md`
  (login mechanics), the 12 `plans/reports/ref-ui-parity-sections/*.md`
  (endpoint inventory to probe + which pages to screenshot).

## Screenshot capture (PII-redacted, byte-budgeted)

Use a browser-automation skill (`agent-browser` preferred; `chrome-profile` if a
real profile/cookies are needed). Login by username `khoa`. Capture 3-4 pages
(not 6-10 — byte budget) that best show before/after contrast: `/RoleFunction/Index`
(the HTTP 500 error screen — no PII, safest, the broken page IS the evidence);
the permission matrix; one list/console page; one report/export screen.

**Redaction gate (mandatory, red-team C1):** prefer a demo/seed record for every
capture. If real customer data is on screen, **blur/box names, phones, addresses,
serials, and any money/payroll column BEFORE the PNG is saved** — not after. No
screenshot enters `docs/assets/screenshots/` until a redaction pass is logged in
the evidence appendix. Downscale + compress (JPEG/WebP ok) to keep the eventual
HTML ≤ 2 MB.

**Distribution gate (red-team M5/M6):** screenshots reproduce a named third-party
vendor's branded UI ("Phần Mềm Quốc Bảo"). Mark "for internal evaluation"; crop
vendor branding where not needed for the technical point; external circulation
needs owner sign-off.

**Fallback (real, not lip service):** if the browser skill is unavailable OR flaky
(partial/failed captures), ship **text-only before/after** — the contrast is
carried by prose (old behavior described vs rebuild behavior). Phase 4's HTML must
render cleanly with zero screenshots. Log exactly which captures succeeded.

## Implementation Steps

1. **Auth handshake** — GET `/Admin/Login`, scrape `__RequestVerificationToken`,
   POST creds with cookie jar; confirm 302 + authed GET returns 200. Log the flow.
2. **Transport + headers** — record `Server`, `X-AspNet*`, `X-Powered-By`;
   check for `Strict-Transport-Security`, `Content-Security-Policy`,
   `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`; check whether
   the site redirects HTTP→HTTPS (it does NOT — cleartext creds finding).
3. **Session cookie flags** — `HttpOnly` / `Secure` / `SameSite` on
   `ASP.NET_SessionId` + any auth cookie. (Brainstorm: HttpOnly+SameSite=Lax, no Secure.)
4. **Runtime-error sweep** — hit the known-broken `/RoleFunction/Index` (expect
   HTTP 500 yellow-screen); spot-check 3-5 other authed pages for 500s / stack
   traces leaking in responses. Record any ASP.NET error-detail disclosure.
5. **Export/data-integrity light probe (verified-non-mutating first — red-team
   H1/M4).** Before firing: confirm the export is GET (or an idempotent report
   POST whose observed params contain NO mutation verb — no `status`/`update`/
   `mark`/`duyet`/`xacnhan`). If method/params are ambiguous → do NOT fire; mark
   "unconfirmed — export not fired to avoid possible side effect". If safe, fetch
   ONE export, save + inspect bytes. **Two-part confirmation gate:** a finding is
   "confirmed (LOW severity — self-inflicted, needs a malicious internal user)"
   ONLY if (a) a formula-leading cell (`=`,`+`,`-`,`@`) is emitted unescaped AND
   (b) that cell derives from user-controllable free-text (Ghi chú / tên KH), not
   a system `=SUM()` cell. If only (a): "present but not shown exploitable". If no
   formula-leading cell in the sample: "unconfirmed — no triggering value present;
   escaping not observed" (NOT "likely safe"). Scope the claim to the exact
   field/export observed — never generalize to "exports" plural. Inspect then
   discard the file; do not commit the raw export.
6. **CSRF / GET-mutation surface** — observe (do NOT execute) whether any state
   change is reachable via GET (delete/approve links); note anti-forgery token
   usage on mirrored forms. Mark exploitability "requires authorized pentest".
7. **XSS surface note** — from the mirrored jQuery/AdminLTE2 pages, note where
   free-text renders without visible escaping; mark "likely — <named observed
   artifact>, not executed" (every `likely` names the specific artifact it rests on).
8. **Screenshot capture** — per the "Screenshot capture" section: 3-4 pages, PII
   redacted BEFORE save, redaction pass logged, byte-budgeted. Text-only fallback
   if the browser skill is unavailable/flaky. Log which captures succeeded.
9. **Write the evidence appendix (English, PII-stripped)** — structured entries,
   each: `#N | date | endpoint | probe | raw result (structural, no PII) |
   interpretation | confidence (confirmed/likely/unconfirmed)`. Truncate any 500
   stack trace to its fingerprint line, not full internal paths.
10. **Emit the discrepancy list (red-team M3)** — a named section
   `## Static-vs-live discrepancies` listing every place a live observation
   differs from the 260703 corpus (or "none observed"). Phases 2-3 MUST consume
   this — it is not a flag into the void.

## Success Criteria

- [ ] Auth handshake reproduced and logged; authed page returns 200.
- [ ] Transport + header posture recorded (HTTPS absence + missing security headers).
- [ ] Session cookie flags recorded.
- [ ] `/RoleFunction/Index` HTTP 500 re-confirmed with date; other 500s noted.
- [ ] Export probe: non-mutation verified before fetch; two-part gate applied;
      claim scoped to the observed field — never a bare/generalized assertion.
- [ ] 3-4 screenshots captured, **PII redacted before save**, redaction pass logged
      (OR text-only fallback logged if browser skill unavailable/flaky).
- [ ] Every entry tagged confirmed / likely / unconfirmed; every `likely` names its observed artifact.
- [ ] `## Static-vs-live discrepancies` section emitted (or "none observed").
- [ ] `docs/assets/legacy-audit-evidence.md` written (EN, no PII); no mutations on
      the live site; no password/session cookie in any committed file; HTML byte budget honored.

## Risk Assessment

- **Read-only becomes a write** → non-mutation pre-check before the ONLY executed
  request (Step 5); everything else is GET/observe; DENY list is enumerable.
- **PII leak via screenshots/evidence** → redaction gate before save + on the
  appendix's raw-result field; prefer demo records; internal-distribution gate.
- **Over-claiming** → two-part formula gate + severity qualifier; every `likely`
  names an observed artifact; exploit-level → "requires authorized pentest".
- **Site changed since 260703** → every finding dated; discrepancy list emitted + consumed by P2/P3.
- **Login flaky / token rotation** → re-scrape token; if auth breaks, fall back to
  unauth surface + cite the 260703 mirror, mark authed claims "unconfirmed this pass".
- **Vendor IP / defamation** → screenshots "internal evaluation", branding cropped,
  security claims evidence-bound; external distribution needs owner sign-off.
