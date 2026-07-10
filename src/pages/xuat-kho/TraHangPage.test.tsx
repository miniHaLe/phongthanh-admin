/** Spec: Trả Hàng list — verified 5-column set (+ leading checkbox). */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import TraHangPage from './TraHangPage'

const HEADERS_IN_ORDER = ['Số phiếu', 'Ngày trả', 'Hình thức trả', 'Người lập', 'Chọn']

describe('TraHangPage', () => {
  it('renders the verified column headers in order (plus leading checkbox column)', async () => {
    renderWithProviders(<TraHangPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i + 1]).toHaveTextContent(label)
    })
  })

  it('renders Tìm kiếm/Xuất ra Excel/Xuất Excel Chi Tiết', () => {
    renderWithProviders(<TraHangPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất ra Excel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất Excel Chi Tiết' })).toBeInTheDocument()
  })

  it('offers the 4 verified Hình thức trả filter options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TraHangPage />)
    await user.click(screen.getByLabelText('Hình thức trả'))
    await screen.findByRole('listbox')
    for (const label of [
      'Trả hàng từ kỹ thuật',
      'Trả hàng từ khách hàng',
      'Trả hàng cho nhà cung cấp',
      'Trả hàng từ kho',
    ]) {
      expect(screen.getAllByText(label)[0]).toBeInTheDocument()
    }
  })

  it('renders per-row Chỉnh sửa/In/Chi tiết actions', async () => {
    renderWithProviders(<TraHangPage />)
    expect((await screen.findAllByLabelText('Chỉnh sửa'))[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText('In')[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText('Chi tiết')[0]).toBeInTheDocument()
  })
})
