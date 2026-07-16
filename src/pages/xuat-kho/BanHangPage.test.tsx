/** Spec: Bán Hàng list — verified 8-column set (+ leading checkbox), no Trạng thái. */
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { exportListXlsx } from '@/lib/export-list-xlsx'
import BanHangPage from './BanHangPage'

vi.mock('@/lib/export-list-xlsx', () => ({
  exportListXlsx: vi.fn(async () => undefined),
}))

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
  beforeEach(() => vi.mocked(exportListXlsx).mockClear())

  it('uses the exact legacy create action label', () => {
    renderWithProviders(<BanHangPage />)
    expect(
      screen.getByRole('button', { name: 'Thêm đơn hàng' }),
    ).toBeInTheDocument()
  })

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

  it('opens a persisted line-detail result instead of refetching the header list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BanHangPage />)
    await screen.findAllByLabelText('Thêm hình')

    await user.click(screen.getByRole('button', { name: 'Tìm chi tiết' }))

    expect(
      await screen.findByRole('heading', { name: 'Chi tiết bán hàng' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Giá bán' }),
    ).toBeInTheDocument()
  })

  it('shows a snapshot-based profit summary', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BanHangPage />)
    await screen.findAllByLabelText('Thêm hình')

    await user.click(
      screen.getByRole('button', { name: 'Báo cáo lợi nhuận' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Báo cáo lợi nhuận bán hàng',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Doanh thu:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Giá vốn:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Lợi nhuận:/).length).toBeGreaterThan(0)

    const dialog = screen.getByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xuất Excel' }),
    )
    expect(exportListXlsx).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'bao-cao-loi-nhuan-ban-hang',
        rows: expect.arrayContaining([
          expect.objectContaining({
            giaVon: expect.any(Number),
            giaBan: expect.any(Number),
            loiNhuan: expect.any(Number),
          }),
        ]),
      }),
    )
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
