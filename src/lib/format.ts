import { format, parseISO } from 'date-fns'

/**
 * Vietnamese formatting helpers (shared). VND has no sub-unit — never show
 * decimals. Phase 6 requires `formatVND`; defined here so it has one owner.
 */

export function formatVND(n: number | null | undefined): string {
  const value = n ?? 0
  return `${value.toLocaleString('vi-VN')} ₫`
}

/** Plain grouped number (no currency symbol). */
export function formatNumber(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('vi-VN')
}

/** ISO string → dd/MM/yyyy. Empty string for null. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'dd/MM/yyyy')
  } catch {
    return ''
  }
}

/** ISO string → dd/MM/yyyy hh:mm AM/PM (reference datetime format). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'dd/MM/yyyy hh:mm a')
  } catch {
    return ''
  }
}

/**
 * Dwell time from `fromIso` to `now` (default a fixed reference "now" — no wall
 * clock leaks into rendered data). Formatted `X ngày H:M'` per the reference
 * "Tồn:" counter. Returns '' for a missing/invalid start.
 */
export function formatDwell(
  fromIso: string | null | undefined,
  now: number,
): string {
  if (!fromIso) return ''
  const start = parseISO(fromIso).getTime()
  if (Number.isNaN(start)) return ''
  let ms = Math.max(0, now - start)
  const dayMs = 86_400_000
  const days = Math.floor(ms / dayMs)
  ms -= days * dayMs
  const hours = Math.floor(ms / 3_600_000)
  ms -= hours * 3_600_000
  const minutes = Math.floor(ms / 60_000)
  return `${days} ngày ${hours}:${minutes}'`
}
