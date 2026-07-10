/** Spec: Cấp Linh Kiện list — verified 7-column set, no checkbox, no edit. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import CapLinhKienPage from './CapLinhKienPage'

const HEADERS_IN_ORDER = [
  'Số phiếu cấp',
  'Ngày lập',
  'Kỹ thuật',
  'Số tiền',
  'Người lập',
  'Ghi chú',
  'Chọn',
]

describe('CapLinhKienPage', () => {
  it('renders the verified column headers in order, no leading checkbox', async () => {
    renderWithProviders(<CapLinhKienPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i]).toHaveTextContent(label)
    })
  })

  it('does not render a row-selection checkbox column', async () => {
    renderWithProviders(<CapLinhKienPage />)
    await screen.findAllByRole('columnheader')
    expect(screen.queryByLabelText('Chọn tất cả')).not.toBeInTheDocument()
  })

  it('renders Thêm phiếu cấp + Tìm kiếm/Tìm chi tiết/Xuất ra Excel/Báo cáo lợi nhuận', () => {
    renderWithProviders(<CapLinhKienPage />)
    expect(screen.getByRole('button', { name: 'Thêm phiếu cấp' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm chi tiết' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất ra Excel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Báo cáo lợi nhuận' })).toBeInTheDocument()
  })

  it('renders the Tổng tiền info box', async () => {
    renderWithProviders(<CapLinhKienPage />)
    expect(await screen.findByText(/Tổng tiền:/)).toBeInTheDocument()
  })

  it('opens a Chi tiết modal per row', async () => {
    renderWithProviders(<CapLinhKienPage />)
    const detailButtons = await screen.findAllByLabelText('Chi tiết')
    detailButtons[0].click()
    expect(await screen.findByText(/Chi tiết phiếu/)).toBeInTheDocument()
  })
})
