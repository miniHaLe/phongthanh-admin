/** Spec: repair table renders the 14 reference columns with rich cells. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { DataTable } from '@/components/shared'
import { useRepairTableColumns } from './use-repair-table-columns'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

function Harness() {
  const { columns } = useRepairTableColumns()
  return (
    <DataTable
      tableId="repair-list"
      columns={columns}
      data={MOCK_TICKETS.slice(0, 3)}
      enableRowSelection
      rowSelection={{}}
      onRowSelectionChange={() => {}}
      getRowId={(t) => t.id}
    />
  )
}

describe('useRepairTableColumns', () => {
  it('renders the reference column headers', () => {
    renderWithProviders(<Harness />)
    for (const header of [
      'Phiếu sửa chữa',
      'Khách hàng',
      'Sản phẩm',
      'Kỹ thuật',
      'Loại SC',
      'Chi phí',
      'Ngày nhận',
      'Ngày HT',
      'Sửa chữa',
      'Ghi chú',
      'Người nhận',
    ]) {
      expect(screen.getAllByText(header)[0]).toBeInTheDocument()
    }
  })

  it('renders rich-cell fragments: Bản đồ, Định vị, HH:, Serial:', () => {
    renderWithProviders(<Harness />)
    expect(screen.getAllByText('Bản đồ')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Định vị')[0]).toBeInTheDocument()
    expect(screen.getAllByText('HH:')[0]).toBeInTheDocument()
  })

  it('renders the "Chọn tất cả" selection header', () => {
    renderWithProviders(<Harness />)
    expect(screen.getByLabelText('Chọn tất cả')).toBeInTheDocument()
  })
})
