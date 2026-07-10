/**
 * Spec: Danh sách sử dụng linh kiện — 21-col header verbatim, Tình trạng
 * action-button state machine, Số phiếu hãng ticket-status badge, filter
 * option sets, KPI boxes.
 */
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import ThuHoiLKPage from './ThuHoiLKPage'

const HEADERS_IN_ORDER = [
  '##',
  'Tình trạng',
  'Số phiếu cấp',
  'Số phiếu SC',
  'Số phiếu hãng',
  'Model',
  'Serial',
  'NSX',
  'Nhà kho',
  'Mã hàng',
  'Tên hàng',
  'Kĩ thuật',
  'Mục đích',
  'Ngày cấp',
  'Người cấp',
  'Ngày giao',
  'Ngày TX',
  'Người TX',
  'Số lượng cấp',
  'SL Trả',
  'Chọn',
]

describe('ThuHoiLKPage (Danh sách sử dụng linh kiện)', () => {
  it('renders the page title + breadcrumb', () => {
    renderWithProviders(<ThuHoiLKPage />)
    expect(
      screen.getByRole('heading', { name: 'Danh sách sử dụng linh kiện' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Danh sách sử dụng linh kiện').length).toBeGreaterThan(0)
  })

  it('renders the 21 verified column headers in order', async () => {
    renderWithProviders(<ThuHoiLKPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length)
    headerCells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(HEADERS_IN_ORDER[i])
    })
  })

  it('renders Thu xác LK + Trả Linh kiện for an issued (unreturned) row, or In Tem Trả Xác + Đã trả xác for a returned row', async () => {
    renderWithProviders(<ThuHoiLKPage />)
    await screen.findAllByRole('columnheader')
    await screen.findAllByRole('button', { name: /Thu xác LK|In Tem Trả Xác/ })
    const hasIssuedButtons = screen.queryAllByRole('button', { name: 'Thu xác LK' })
    const hasReturnedLabel = screen.queryAllByText('Đã trả xác')
    expect(hasIssuedButtons.length + hasReturnedLabel.length).toBeGreaterThan(0)
    if (hasIssuedButtons.length > 0) {
      expect(screen.queryAllByRole('button', { name: 'Trả Linh kiện' }).length).toBeGreaterThan(0)
    }
    if (hasReturnedLabel.length > 0) {
      expect(
        screen.queryAllByRole('button', { name: 'In Tem Trả Xác' }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('Mục Đích filter offers the 3 verified options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ThuHoiLKPage />)
    await user.click(screen.getByLabelText('Mục Đích'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Sữa chữa dịch vụ')).toBeInTheDocument()
    expect(within(listbox).getByText('Bảo hành')).toBeInTheDocument()
    expect(within(listbox).getByText('Kỹ thuật mượn')).toBeInTheDocument()
  })

  it('Tình trạng filter offers the 4 verified options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ThuHoiLKPage />)
    await user.click(screen.getByLabelText('Tình trạng'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Đã trả xác LK')).toBeInTheDocument()
    expect(within(listbox).getByText('Chưa trả xác LK')).toBeInTheDocument()
    expect(within(listbox).getByText('Có trả LK')).toBeInTheDocument()
    expect(within(listbox).getByText('Chưa trả LK')).toBeInTheDocument()
  })

  it('Tình trạng phiếu filter offers 15 legacy statuses', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ThuHoiLKPage />)
    await user.click(screen.getByLabelText('Tình trạng phiếu'))
    const listbox = await screen.findByRole('listbox')
    // 15 statuses + the "Tất cả" option.
    expect(within(listbox).getAllByRole('option')).toHaveLength(16)
  })

  it('renders the 3 KPI boxes', () => {
    renderWithProviders(<ThuHoiLKPage />)
    expect(screen.getByText('Tổng cấp')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền LK chưa giao')).toBeInTheDocument()
    expect(screen.getByText('Tổng tiền LK đã giao')).toBeInTheDocument()
  })
})
