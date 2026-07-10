/**
 * TanStack Query hook for Inventory KPI strip.
 * staleTime: 0 — always fresh on mount (spec requirement).
 * Default period = startOfMonth(today) → today.
 * Guards persisted period: if older than 90 days, resets to current month.
 */
import { useQuery } from '@tanstack/react-query'
import { startOfMonth, subDays, isAfter, parseISO, formatISO } from 'date-fns'
import { fetchInventoryKpi } from '@/mock/inventory-mock'
import type { InventoryKpi } from '@/types/inventory-types'

export interface DateRange {
  from: string
  to: string
}

function defaultPeriod(): DateRange {
  const today = new Date()
  return {
    from: formatISO(startOfMonth(today), { representation: 'date' }),
    to: formatISO(today, { representation: 'date' }),
  }
}

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

export function useInventoryKpi(
  period: DateRange | null,
  branchId?: string | null,
  khoId?: string | null,
) {
  const safePeriod = guardPeriod(period)

  return useQuery<InventoryKpi, Error>({
    queryKey: [
      'inventory-kpi',
      safePeriod.from,
      safePeriod.to,
      branchId ?? null,
      khoId ?? null,
    ],
    queryFn: () =>
      fetchInventoryKpi({
        from: safePeriod.from,
        to: safePeriod.to,
        branchId,
        khoId,
      }),
    staleTime: 0,
    gcTime: 60_000,
    enabled: true,
  })
}
