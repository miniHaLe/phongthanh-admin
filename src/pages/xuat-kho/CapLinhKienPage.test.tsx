/** Spec: Cấp Linh Kiện list — verified 7-column set, no checkbox, no edit. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders real detail search and omits profit without a revenue contract', () => {
    renderWithProviders(<CapLinhKienPage />)
    expect(
      screen.getByRole('button', { name: 'Thêm phiếu cấp' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tìm chi tiết' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Báo cáo lợi nhuận' }),
    ).not.toBeInTheDocument()
  })

  it('opens line-level detail results', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CapLinhKienPage />)
    await screen.findAllByLabelText('Chi tiết')

    await user.click(screen.getByRole('button', { name: 'Tìm chi tiết' }))

    expect(
      await screen.findByRole('heading', { name: 'Chi tiết cấp linh kiện' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Mục đích' }),
    ).toBeInTheDocument()
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
