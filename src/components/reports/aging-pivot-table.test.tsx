import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { AgingPivotTable } from './aging-pivot-table'

interface Row {
  id: string
  label: string
  day1: number
  day3: number
  total: number
}

const rows: Row[] = [
  { id: 'status-1', label: 'Mới Nhận', total: 4, day1: 0, day3: 2 },
]

describe('AgingPivotTable', () => {
  it('renders supplied legacy headers in exact order', () => {
    renderWithProviders(
      <AgingPivotTable
        rows={rows}
        rowHeader="Tình trạng"
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.label}
        columns={[
          { key: 'total', label: 'Tổng', getValue: (row) => row.total },
          { key: 'day1', label: '1', getValue: (row) => row.day1 },
          { key: 'day3', label: '3', getValue: (row) => row.day3 },
        ]}
      />,
    )

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(['STT', 'Tình trạng', 'Tổng', '1', '3'])
  })

  it('renders zero as text and exposes row, bucket, and count in count-button names', async () => {
    const user = userEvent.setup()
    const onCellClick = vi.fn()
    renderWithProviders(
      <AgingPivotTable
        rows={rows}
        rowHeader="Tình trạng"
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.label}
        columns={[
          { key: 'total', label: 'Tổng', getValue: (row) => row.total },
          { key: 'day1', label: '1', getValue: (row) => row.day1 },
          { key: 'day3', label: '3', getValue: (row) => row.day3 },
        ]}
        onCellClick={onCellClick}
      />,
    )

    expect(screen.queryByRole('button', { name: /Mới Nhận.*1.*0/ })).toBeNull()
    const button = screen.getByRole('button', {
      name: /Mới Nhận.*3.*2 phiếu/,
    })
    await user.click(button)
    expect(onCellClick).toHaveBeenCalledWith(rows[0], 'day3')
  })
})
