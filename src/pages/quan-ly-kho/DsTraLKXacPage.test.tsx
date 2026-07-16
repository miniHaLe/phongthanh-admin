/**
 * Spec: DSTraLKXac (new page) — grouped header incl. Mã vận đơn, bulk Trả hãng
 * empty-selection alert, status labels, In BB Kỹ Thuật + In Phiếu Trả Hãng
 * empty-selection alerts, Xuất ra Excel, Tổng số LK KPI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import DsTraLKXacPage from './DsTraLKXacPage'

const notifyError = vi.fn()
vi.mock('@/components/shared', async (orig) => {
  const actual = await orig<typeof import('@/components/shared')>()
  return {
    ...actual,
    notify: { ...actual.notify, error: (m?: string) => notifyError(m) },
  }
})

beforeEach(() => notifyError.mockClear())

const HEADERS_IN_ORDER = [
  '',
  'Trạng thái / Vận đơn',
  'Tham chiếu phiếu',
  'Linh kiện / Vị trí',
  'Phân công',
  'Thu xác',
  'Số lượng',
  'Tạo phiếu',
]

describe('DsTraLKXacPage', () => {
  it('mounts at the route with title + breadcrumb', () => {
    renderWithProviders(<DsTraLKXacPage />, {
      route: '/quan-ly-kho/ds-tra-lk-xac',
    })
    expect(
      screen.getByRole('heading', { name: 'Danh Sách Trả Linh Kiện Xác' }),
    ).toBeInTheDocument()
  })

  it('renders the grouped column headers in order', async () => {
    renderWithProviders(<DsTraLKXacPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i]).toHaveTextContent(label)
    })
  })

  it('alerts "Vui lòng chọn phiếu để trả" when Trả hãng is clicked with no selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKXacPage />)
    await screen.findAllByRole('columnheader')
    await user.click(screen.getByRole('button', { name: 'Trả hãng' }))
    expect(notifyError).toHaveBeenCalledWith('Vui lòng chọn phiếu để trả')
  })

  it('alerts "Vui lòng chọn phiếu để in" for both print buttons when nothing is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKXacPage />)
    await screen.findAllByRole('columnheader')
    await user.click(screen.getByRole('button', { name: 'In BB Kỹ Thuật' }))
    expect(notifyError).toHaveBeenCalledWith('Vui lòng chọn phiếu để in')
    notifyError.mockClear()
    await user.click(screen.getByRole('button', { name: 'In Phiếu Trả Hãng' }))
    expect(notifyError).toHaveBeenCalledWith('Vui lòng chọn phiếu để in')
  })

  it('renders Chưa trả hãng / Đã trả hãng status labels', async () => {
    renderWithProviders(<DsTraLKXacPage />)
    await screen.findAllByRole('columnheader')
    const anyStatus = await screen.findAllByText(/Chưa trả hãng|Đã trả hãng/)
    expect(anyStatus.length).toBeGreaterThan(0)
  })

  it('Tình trạng filter offers Chưa trả hãng / Đã trả hãng', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKXacPage />)
    await user.click(screen.getByLabelText('Tình trạng'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Chưa trả hãng')).toBeInTheDocument()
    expect(within(listbox).getByText('Đã trả hãng')).toBeInTheDocument()
  })

  it('renders the Tổng số LK KPI box and Xuất Excel button', () => {
    renderWithProviders(<DsTraLKXacPage />)
    expect(screen.getByText('Tổng số LK')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })
})
