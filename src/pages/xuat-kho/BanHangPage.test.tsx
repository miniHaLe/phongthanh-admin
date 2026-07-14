/** Spec: Bán Hàng list — verified 8-column set (+ leading checkbox), no Trạng thái. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import BanHangPage from './BanHangPage'

const HEADERS_IN_ORDER = [
  'Số phiếu',
  'Ngày lập',
  'Khách hàng',
  'Điện thoại',
  'Tổng tiền',
  'Người lập',
  'Ghi chú',
  'Chọn',
]

describe('BanHangPage', () => {
  it('renders the verified column headers in order (plus leading checkbox column)', async () => {
    renderWithProviders(<BanHangPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i + 1]).toHaveTextContent(label)
    })
  })

  it('does not render a Trạng thái column', async () => {
    renderWithProviders(<BanHangPage />)
    await screen.findAllByRole('columnheader')
    expect(
      screen.queryByRole('columnheader', { name: 'Trạng thái' }),
    ).not.toBeInTheDocument()
  })

  it('renders Tìm kiếm/Tìm chi tiết/Xuất Excel/Báo cáo lợi nhuận', () => {
    renderWithProviders(<BanHangPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tìm chi tiết' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Báo cáo lợi nhuận' }),
    ).toBeInTheDocument()
  })

  it('renders per-row Thêm hình/Chỉnh sửa/Xuất kho/Chi tiết actions', async () => {
    renderWithProviders(<BanHangPage />)
    expect(
      (await screen.findAllByLabelText('Thêm hình'))[0],
    ).toBeInTheDocument()
    expect(screen.getAllByLabelText('Chỉnh sửa')[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText('Xuất kho')[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText('Chi tiết')[0]).toBeInTheDocument()
  })
})
