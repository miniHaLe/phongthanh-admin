import type { KpiRow, PeriodMode } from '@/mock/reports/report-types'

export interface KpiBarDatum {
  kyThuat: string
  hoanThanh: number
  dangSua: number
  quaHan: number
  khac: number
}

export const KPI_BAR_SERIES_LABELS = {
  hoanThanh: 'Hoàn thành',
  dangSua: 'Đang sửa',
  quaHan: 'Quá hạn',
  khac: 'Khác',
} satisfies Record<Exclude<keyof KpiBarDatum, 'kyThuat'>, string>

export interface KpiLineDatum {
  period: string
  tongPhieu: number
}

export function aggregateKpiRowsByTech(data: KpiRow[]): KpiBarDatum[] {
  const map = new Map<string, KpiBarDatum>()
  for (const row of data) {
    const existing = map.get(row.kyThuat) ?? {
      kyThuat: row.kyThuat,
      hoanThanh: 0,
      dangSua: 0,
      quaHan: 0,
      khac: 0,
    }
    const knownStatuses = row.hoanThanh + row.dangSua + row.quaHan
    existing.hoanThanh += row.hoanThanh
    existing.dangSua += row.dangSua
    existing.quaHan += row.quaHan
    existing.khac += Math.max(0, row.tongPhieu - knownStatuses)
    map.set(row.kyThuat, existing)
  }
  return Array.from(map.values()).sort((a, b) => b.hoanThanh - a.hoanThanh)
}

function periodSortValue(period: string, mode: PeriodMode): number {
  if (mode === 'ngay') {
    const [day, month, year] = period.split('/').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  if (mode === 'thang') {
    const match = period.match(/^Tháng\s+(\d{1,2})\/(\d{4})$/)
    return match ? Number(match[2]) * 12 + Number(match[1]) : 0
  }
  const year = Number(period.replace(/^Năm\s+/, ''))
  return Number.isFinite(year) ? year : 0
}

export function aggregateKpiRowsByPeriod(
  data: KpiRow[],
  mode: PeriodMode,
): KpiLineDatum[] {
  const map = new Map<string, KpiLineDatum>()
  for (const row of data) {
    const existing = map.get(row.period) ?? { period: row.period, tongPhieu: 0 }
    existing.tongPhieu += row.tongPhieu
    map.set(row.period, existing)
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      periodSortValue(a.period, mode) - periodSortValue(b.period, mode) ||
      a.period.localeCompare(b.period, 'vi'),
  )
}
