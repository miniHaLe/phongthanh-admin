---
title: "Legacy vs Rebuild Comparison Doc-Set — Brainstorm"
date: 2026-07-07
type: brainstorm
status: approved
modes: [--html]
handoff: /ck:plan (default mode)
audience: [engineering-qa-record, stakeholder-exec-summary]
source_evidence: [static-corpus, live-audit]
---

# Legacy vs Rebuild Comparison — Brainstorm Report

## 1. Problem statement

Produce authoritative documentation comparing the legacy ASP.NET site
(`http://phongthanh.phanmemsuachuabaohanh.com`, login `khoa`/`123456`) with the
from-scratch React rebuild (`/home/hale/code/phongthanh-admin`). Cover: (a) the
gaps between old and new, (b) the old site's bugs/issues, (c) an honest account
of the rebuild's own deviations + known limitations. Serve BOTH an
engineering/QA record and a stakeholder exec summary.

**Not** a marketing "old bad / new good" doc — credibility requires a 3-column
frame: old gap/bug → rebuild fix → honesty flag (deliberate deviation OR known
limitation). Skipping the honesty column makes the doc dishonest and brittle
under review.

## 2. Scout findings (existing evidence base)

This session's `/ck:cook` run already produced a large comparison corpus — the
docs are a SYNTHESIS task, not fresh analysis (DRY: cite, don't re-derive):

- `plans/reports/brainstorm-260703-reference-ui-parity-gap-matrix.md` (33 KB) —
  master gap matrix: nav/IA diff, 12 missing pages, per-section high/med/low
  counts (warehouse 14h/20m, HR 11h/13m, finance 9h/9m, catalog-a 5h/14m, …),
  15-status palette, 6 locked decisions.
- `plans/reports/ref-ui-parity-sections/*.md` (12 files, ~250 KB) — per-section
  verified specs of the OLD site (exact columns/labels/endpoints/editor fields),
  each with a "verified from mirrored partials 260703" addendum.
- 7 completed phase files (`plans/260703-1908-reference-ui-parity-tdd/`) — each
  with a completion note + code-review findings (what the rebuild actually did).
- 4 red-team review reports — about OUR plan's risks, not old-site defects.
- No `docs/` dir yet (must create). `ARCHITECTURE.md` (11 KB) + `README.md`
  already updated with the parity work.

**Old-site defects already documented (scattered, not yet consolidated):**
- `/RoleFunction/Index` → **HTTP 500** ("partial view Create was not found").
- Copy-paste bug: branch-list box titled *"Danh sách nhà sản xuất"* (manufacturer).
- Typos: *"Mỡ"*→Mở, *"Sản phầm"*→Sản phẩm (corrected in rebuild per decision V4).
- Filter bug: *Số phiếu hãng* writes `filters.soPhieu`; quick-search blocks combining fields.
- Naming/model inconsistencies: *Xác*≠*xác nhận*; warranty labels drift across screens
  (Tại Trạm/Nhà Khách vs Tại TTBH/Tại Nhà); Chuyển Kho invented status values.

**Live-audit feasibility — CONFIRMED (probed during brainstorm):**
- Site reachable; `POST /Admin/Login` with `__RequestVerificationToken` + cookie
  jar works via plain `curl` (no browser-automation skill needed — matches memory).
- Post-login `GET /Repairing/Index_8` → HTTP 200 (authed area reachable).
- Stack: **IIS 8.5 / ASP.NET MVC 5.2 / .NET 4.0.30319** (EOL, jQuery/AdminLTE2).
- **Plain HTTP, no HTTPS** → creds + session in cleartext.
- Missing `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`,
  `X-Content-Type-Options`. Session cookie `HttpOnly; SameSite=Lax` but no `Secure`.

## 3. Requirements (locked)

- **Expected output**: doc-set in `docs/` — comparison record + defect catalog +
  editorial HTML magazine; plus an exec-summary front page.
- **Acceptance**: every gap/bug carries evidence (URL / section-file ref / probe
  output) + rebuild handling; every rebuild limitation stated honestly;
  unverifiable security claims tagged "likely/unconfirmed"; markdown files ≤800 lines.
- **Scope OUT**: no code changes; no re-derivation of already-verified specs; no
  exploit-level pentest (recon + light probing only).
- **Constraints**: docs live in `docs/`; concision over grammar; honest 3-column frame.
- **Touchpoints**: reads `plans/reports/*` corpus + live old site; writes `docs/*`.

## 4. Approaches evaluated

| # | Approach | Pros | Cons | Verdict |
|---|---|---|---|---|
| A | Synthesis-only doc-set | Fast, grounded, honest | Static (260703), no new runtime/security findings | Baseline |
| B | Synthesis + fresh live audit | Catches runtime/security/a11y the mirror missed; strongest evidence | Slower; needs live access (CONFIRMED works) | **Chosen** |
| C | Single stakeholder report | Presentation-ready | Fluff-trap risk; weak as eng/QA record | Folded into B as HTML view |

## 5. Final recommended solution

**B (synthesize + live audit) → engineering record + exec summary, as markdown
doc-set + HTML magazine, broadest bug coverage (functional + security +
a11y + UX), live audit = recon + light probing.**

### Deliverables
1. `docs/legacy-vs-rebuild-comparison.md` — exec summary front page; methodology
   + dual evidence sources (static 260703 + live today, each caveated);
   per-section gap-closure matrix (Closed / Deliberate deviation / Deferred);
   deliberate-deviations list; **known-limitations list** (mock data no backend,
   permission matrix UI-only no enforcement, payroll static-sum, some report
   columns unverified-mock).
2. `docs/legacy-defects-catalog.md` — functional defects (HTTP 500, copy-paste
   title, filter bug, typos, naming/model) with evidence + rebuild handling;
   security & data-integrity (live-confirmed headers/HTTP + reasoned
   formula-injection/XSS/CSRF, tagged confirmed vs likely) vs our F7/F8/F9
   hardening; accessibility (AdminLTE2 heuristics); UX friction (popups, no bulk,
   reloads) vs SPA + bulk-select + query-invalidation.
3. `docs/legacy-vs-rebuild-comparison.html` — editorial magazine (exec view) of
   the same decisions + strongest before/after contrasts.

## 6. Honesty flags (non-negotiable in every deliverable)

- Rebuild is **100% mock/in-memory** — writes lost on any reload, no real backend.
- Permission matrix (202-checkbox) is **UI mock, no enforcement**.
- Payroll Tổng/Thực lãnh = **documented static sum**, real formula deferred.
- Some report result-columns are **plausible-mock, unverified** vs live AJAX partials.
- Security claims not provable by read-only recon → **"likely / unconfirmed;
  requires authorized pentest"**.

## 7. Risks & mitigations

- **Live-audit over-reach** → keep to read-only recon + light probing (fetch an
  export to inspect, observe endpoints); exploit-level claims marked "requires
  authorized pentest". System is user's own but treat conservatively.
- **Static corpus staleness (260703 vs now)** → flagged in methodology; live pass reconciles.
- **800-line docs cap** → split per-section detail into an appendix file if needed.

## 8. Success metrics

- Every documented gap/bug traceable to evidence (ref or probe output).
- Zero unqualified security claims (all confirmed-or-tagged).
- Both audiences served (eng record readable + exec summary standalone).
- Doc-set builds/renders; markdown files within cap.

## 9. Next steps

Handoff to `/ck:plan` (default mode) with this report path. Proposed phases:
(1) live-audit evidence pass (recon + light probing, capture probe outputs);
(2) gap-closure comparison matrix (synthesize corpus + phase notes);
(3) defect catalog (functional + security + a11y + UX);
(4) HTML editorial magazine + exec-summary reconciliation.

## Unresolved questions

None blocking. Report result-column verification (mock vs live AJAX) can be
spot-checked during the live-audit phase if time allows; otherwise stays tagged
"unverified-mock".
