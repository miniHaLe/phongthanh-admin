/**
 * TanStack Query hook for Finance KPI strip.
 * staleTime: 0 — always fresh on mount (spec requirement).
 * Default period = startOfMonth(today) → today.
 * Guards persisted period: if older than 90 days, resets to current month.
 */
import { useQuery } from '@tanstack/react-query'
import { startOfMonth, subDays, isAfter, parseISO, formatISO } from 'date-fns'
import { fetchFinanceKpi } from '@/mock/finance-kpi-mock'
import type { FinanceKpi } from '@/types/finance-types'

export interface DateRange {
  from: string // ISO date string
  to: string // ISO date string
}

function defaultPeriod(): DateRange {
  const today = new Date()
  return {
    from: formatISO(startOfMonth(today), { representation: 'date' }),
    to: formatISO(today, { representation: 'date' }),
  }
}

/** Guard: if persisted period.to is older than 90 days, reset to current month. */
export function guardPeriod(period: DateRange | null | undefined): DateRange {
  if (!period) return defaultPeriod()
  try {
    const to = parseISO(period.to)
    const threshold = subDays(new Date(), 90)
    if (!isAfter(to, threshold)) return defaultPeriod()
    return period
  } catch {
    return defaultPeriod()
  }
}

export function useFinanceKpi(
  period: DateRange | null,
  branchId?: string | null,
) {
  const safePeriod = guardPeriod(period)

  return useQuery<FinanceKpi, Error>({
    queryKey: ['finance-kpi', safePeriod.from, safePeriod.to, branchId ?? null],
    queryFn: () =>
      fetchFinanceKpi({
        from: safePeriod.from,
        to: safePeriod.to,
        branchId,
      }),
    staleTime: 0,
    gcTime: 60_000,
    enabled: true,
  })
}
