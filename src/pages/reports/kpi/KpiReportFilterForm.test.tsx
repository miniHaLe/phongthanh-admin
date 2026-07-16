import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import * as exportXlsx from '@/lib/export-xlsx'
import { KpiReportFilterForm } from './KpiReportFilterForm'

const row = {
  personId: 'kt-01',
  personName: 'Nguyễn Văn An',
  day1: 1,
  day2: 0,
  day3: 0,
  day4: 0,
  day5: 0,
  day6: 0,
  day7: 0,
  over7: 0,
  total: 1,
}

describe('KpiReportFilterForm exports', () => {
  it('exports the verified pivot and evidence-gates unknown legacy workbooks', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(
      <KpiReportFilterForm
        onSubmit={vi.fn()}
        isLoading={false}
        exportRows={[row]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    await user.click(
      screen.getByRole('menuitem', { name: 'Xuất Excel File' }),
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls.map(([options]) => options.filename)).toEqual([
      'kpi-bao-cao.xlsx',
    ])

    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel Luong' }),
    ).toHaveAttribute('data-disabled')
    expect(
      screen.getByRole('menuitem', { name: 'Xuất Excel 1 Ngày' }),
    ).toHaveAttribute('data-disabled')
  })
})
