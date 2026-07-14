---
phase: 6
title: "Navigation & IA Restructure"
status: completed
effort: "M"
priority: P2
dependencies: [5]
---

# Phase 6: Navigation & IA Restructure

## Overview

Make every declared page reachable and collapse duplicated surfaces. 22 sub-pages across Quản Lý Kho (7), Xuất Kho (4), Tài Chính (3), Báo Cáo (8) have NO visible navigation — `nav-config.tsx` declares `children` (counts grep-verified) that only the four admin modules render as tab strips. Four surfaces show one notification stream; dev artifacts ship in prod; sidebar highlights two modules at once.

Scope trim (red-team SC9): sidebar frequency-reorder and admin group-divider are CUT from this phase — they trace to an appendix sketch, not a numbered finding, and the upcoming permission work (260707-1612 phase 2) will churn nav again. Parked in plan.md follow-ups. The dashboard two-tab collapse (F-C8, Medium) stays; the 5th-KPI fold shrinks to a one-line col-span fix (F-A15 is Low).

Findings: F-A7/F-C5, F-C7, F-C8, F-C10, F-C11, F-C16, F-C17, F-C18, F-A15 (minimal).

## Requirements

- Functional: every child in nav-config reachable via visible tab strip + command palette; one notification center; no dev routes in prod; single sidebar active state; invoices have one home; banks live in Danh Mục.
- Non-functional: redirects preserve every old URL (hash aliases); nav data stays single-sourced from `nav-config.tsx`/`ROUTES`.

## Architecture

Minimum-viable IA fix (per journey report): render what config already declares — do NOT merge Kho+Xuất Kho modules (explicitly deferred product decision). Scope:
- Mount Phase 5's `module-tab-strip.tsx` (already extracted and consumed by the 4 admin pages) on quan-ly-kho, xuat-kho, tai-chinh, bao-cao layouts, sourced from nav-config children.
- Command palette registers all children as commands ("Mở Tồn kho", "Mở Bán hàng", "Mở Doanh thu"…); relabel trigger "Đi tới…" (navigation-only today — entity search stays a future item).
- Notifications: bell dropdown (peek) + /thong-bao (full list) remain; DELETE news dropdown + /tin-tuc route (same PSC event stream re-labeled; /tin-tuc also crashes — removal closes that crash). Redirect /tin-tuc → /thong-bao.
- DELETE from prod: /gallery route registration + "Demo: Cuộc gọi đến" palette command behind `import.meta.env.DEV`.
- Quản Lý loses its Hóa đơn tab (redirect stays); Ngân hàng catalog REARRANGE from Nhân Sự first-tab to Danh Mục 15th tab (route redirect stays).
- Sidebar: exact-prefix NavLink matching only (one active item) — no reorder.
- Dashboard: remove the two-tab IA — compact "Kế hoạch nhanh" card links to the full calendar (the "Kế hoạch của bạn" content) as route/modal; orphan 5th KPI card gets a col-span fix.
- 404 page copy fix ("Đang phát triển" contradicts not-found).

## Related Code Files

- Modify: `src/config/nav-config.tsx` (children stay authoritative; palette registration export)
- Modify: `src/routes/index.tsx` (mount tab strip on 4 module layouts; DEV-gate /gallery; /tin-tuc → /thong-bao, /nhan-su/ngan-hang → /danh-muc/ngan-hang redirects; quan-ly hóa-đơn tab removal)
- Modify: `src/components/shell/CommandPalette.tsx` (register children; "Đi tới…" label; DEV-gate demo command)
- Modify: `src/components/shell/Sidebar.tsx` / `NavItem.tsx` (exact-prefix matching only)
- Modify: header news dropdown removal (`NewsBadge`, news dropdown component); notification store news-* members become dead — delete with their tests
- Modify: `src/pages/DashboardPage.tsx` (tab removal, calendar link, KPI col-span)
- Modify: 404 page copy
- Modify: `src/mock/masterdata/menu.mock.ts` (source `duongDan` from ROUTES — low-risk rider)

## Implementation Steps

1. Mount shared tab strip on the 4 module layouts; verify all 22 children clickable.
2. Palette: children registration + label + DEV-gating demo/gallery.
3. Notification consolidation (delete news surfaces + redirect + store cleanup incl. tests).
4. Invoices/banks re-homing with redirects.
5. Sidebar exact-prefix matching.
6. Dashboard single-view rework + KPI col-span.
7. E2E: nav smoke over every child route via clicks (not URLs); redirect tests for all removed/moved routes; exactly-one-active-sidebar-item assertion.

## Success Criteria

- [x] Every nav-config child reachable by clicking from its module page; e2e proves it.
- [x] Palette search "tồn kho" / "bán hàng" / "doanh thu" hits the sub-page commands.
- [x] /tin-tuc, /nhan-su/ngan-hang, /quan-ly/hoa-don redirect correctly; no news dropdown in header.
- [x] /gallery and demo command absent from prod build, present in dev.
- [x] Exactly one sidebar item active on every route (e2e assertion across modules).
- [x] Dashboard shows one view; calendar reachable in ≤1 click.

## Risk Assessment

- Users may have bookmarked removed surfaces → all removals keep redirects; only net-new chrome added.
- Deleting news store members touches notification tests → update tests with the consolidation, don't skip.
- Kho+Xuất Kho module merge explicitly deferred — this phase must not half-do it.
- Tab strip on operational modules depends on Phase 5's extraction landing first (`dependencies: [5]` enforces it).
