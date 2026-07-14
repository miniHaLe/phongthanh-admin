import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import type { KpiRow } from '@/mock/reports/report-types'
import { KpiCharts } from './KpiCharts'

describe('KpiCharts', () => {
  it('shows standard in-chart empty states instead of bare zero-series axes', () => {
    const zeroRow: KpiRow = {
      id: 'zero',
      period: '14/07/2026',
      kyThuat: 'KTV A',
      chiNhanh: 'Đắk Lắk',
      tongPhieu: 0,
      hoanThanh: 0,
      dangSua: 0,
      quaHan: 0,
      chiPhi: 0,
    }

    renderWithProviders(<KpiCharts data={[zeroRow]} mode="ngay" />)
    expect(screen.getAllByText('Không có dữ liệu')).toHaveLength(2)
    expect(document.querySelectorAll('[data-empty-state]')).toHaveLength(2)
  })
})
