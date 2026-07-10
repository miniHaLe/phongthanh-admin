/**
 * TanStack Query hooks for dashboard data (Phase 3).
 * Each query has its own key for per-section cache isolation.
 * staleTime 60s + refetchInterval 120s on summary (live-queue simulation).
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchDashboardSummary,
  fetchLowStock,
  fetchRecentTickets,
  fetchStatusDistribution,
} from '@/mock/dashboard-mock'
import type { ActiveBranch } from '@/store/app-store'

/** Summary query — keyed per branch for cache isolation. */
export function useDashboardSummary(branchId: ActiveBranch) {
  return useQuery({
    queryKey: ['dashboard-summary', branchId],
    queryFn: () => fetchDashboardSummary(branchId),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

/** Low-stock alert query — branch-independent inventory view. */
export function useLowStock() {
  return useQuery({
    queryKey: ['low-stock'],
    queryFn: fetchLowStock,
    staleTime: 60_000,
  })
}

/** Recent tickets — last 10 across all branches. */
export function useRecentTickets() {
  return useQuery({
    queryKey: ['recent-tickets'],
    queryFn: fetchRecentTickets,
    staleTime: 60_000,
  })
}

/** Status distribution for Recharts PieChart. Theme-independent — the chart
 * applies each status's fixed legacy hex at render, so no refetch on theme toggle. */
export function useStatusDistribution() {
  return useQuery({
    queryKey: ['status-distribution'],
    queryFn: fetchStatusDistribution,
    staleTime: 60_000,
  })
}
