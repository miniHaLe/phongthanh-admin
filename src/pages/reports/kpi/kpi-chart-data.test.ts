import { describe, expect, it } from 'vitest'
import type { KpiRow, PeriodMode } from '@/mock/reports/report-types'
import {
  KPI_BAR_SERIES_LABELS,
  aggregateKpiRowsByPeriod,
  aggregateKpiRowsByTech,
} from './kpi-chart-data'

function row(
  id: string,
  period: string,
  kyThuat: string,
  tongPhieu: number,
  statuses: Partial<Pick<KpiRow, 'hoanThanh' | 'dangSua' | 'quaHan'>> = {},
): KpiRow {
  return {
    id,
    period,
    kyThuat,
    chiNhanh: 'Đắk Lắk',
    tongPhieu,
    hoanThanh: statuses.hoanThanh ?? tongPhieu,
    dangSua: statuses.dangSua ?? 0,
    quaHan: statuses.quaHan ?? 0,
    chiPhi: 0,
  }
}

describe('KPI chart aggregation', () => {
  it.each<[PeriodMode, string[], string[]]>([
    [
      'ngay',
      ['12/07/2026', '17/06/2026', '02/07/2026'],
      ['17/06/2026', '02/07/2026', '12/07/2026'],
    ],
    [
      'thang',
      ['Tháng 12/2025', 'Tháng 2/2025', 'Tháng 1/2026'],
      ['Tháng 2/2025', 'Tháng 12/2025', 'Tháng 1/2026'],
    ],
    [
      'nam',
      ['Năm 2026', 'Năm 2024', 'Năm 2025'],
      ['Năm 2024', 'Năm 2025', 'Năm 2026'],
    ],
  ])('sorts %s periods chronologically', (mode, periods, expected) => {
    const data = periods.map((period, index) =>
      row(String(index), period, 'KTV A', index + 1),
    )
    expect(
      aggregateKpiRowsByPeriod(data, mode).map((item) => item.period),
    ).toEqual(expected)
  })

  it('reconciles production-shaped technician stacks to the same KPI totals', () => {
    const data = [
      row('1', '01/07/2026', 'KTV A', 5, {
        hoanThanh: 2,
        dangSua: 1,
      }),
      row('2', '01/07/2026', 'KTV B', 4, {
        hoanThanh: 1,
        dangSua: 1,
        quaHan: 1,
      }),
      row('3', '02/07/2026', 'KTV A', 5, {
        hoanThanh: 1,
        quaHan: 1,
      }),
    ]

    const periodTotal = aggregateKpiRowsByPeriod(data, 'ngay').reduce(
      (sum, item) => sum + item.tongPhieu,
      0,
    )
    const techData = aggregateKpiRowsByTech(data)
    const techTotal = techData.reduce(
      (sum, item) =>
        sum + item.hoanThanh + item.dangSua + item.quaHan + item.khac,
      0,
    )
    expect(periodTotal).toBe(14)
    expect(techTotal).toBe(14)
    expect(techData.find((item) => item.kyThuat === 'KTV A')?.khac).toBe(5)
    expect(KPI_BAR_SERIES_LABELS.khac).toBe('Khác')
  })

  it('never creates a negative other-status segment from inconsistent rows', () => {
    const [datum] = aggregateKpiRowsByTech([
      row('1', '01/07/2026', 'KTV A', 2, {
        hoanThanh: 3,
        dangSua: 1,
      }),
    ])

    expect(datum.khac).toBe(0)
  })
})
