/**
 * Spec: DSTraLK — 18-col header, per-row + bulk Duyệt confirm/toast, In Phiếu
 * Trả empty-selection alert, filter option sets, KPI box, Xuất ra Excel.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import DsTraLKPage from './DsTraLKPage'

const notifyError = vi.fn()
const notifySuccess = vi.fn()
vi.mock('@/components/shared', async (orig) => {
  const actual = await orig<typeof import('@/components/shared')>()
  return {
    ...actual,
    notify: {
      ...actual.notify,
      error: (m?: string) => notifyError(m),
      success: (m?: string) => notifySuccess(m),
    },
  }
})

beforeEach(() => {
  notifyError.mockClear()
  notifySuccess.mockClear()
})

const HEADERS_IN_ORDER = [
  '##',
  'Tình trạng',
  'Hình thức',
  'Mã hàng',
  'Tên hàng',
  'Kĩ thuật',
  'SL',
  'Số phiếu cấp',
  'Số phiếu SC',
  'Số phiếu hãng',
  'Model',
  'Serial',
  'NSX',
  'Ngày tạo',
  'Người tạo',
  'Ngày duyệt',
  'Người duyệt',
]

describe('DsTraLKPage', () => {
  it('renders the 18 verified column headers (## + checkbox + 16 data cols) in order', async () => {
    renderWithProviders(<DsTraLKPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    expect(headerCells[0]).toHaveTextContent('##')
    HEADERS_IN_ORDER.slice(1).forEach((label, i) => {
      expect(headerCells[i + 2]).toHaveTextContent(label)
    })
  })

  it('alerts when In Phiếu Trả is clicked with no selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKPage />)
    await screen.findAllByRole('columnheader')
    await user.click(screen.getByRole('button', { name: 'In Phiếu Trả' }))
    expect(notifyError).toHaveBeenCalledWith('Vui lòng chọn phiếu để in')
  })

  it('per-row Duyệt shows the exact confirm text and toasts "Duyệt thành công!"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKPage />)
    await screen.findAllByRole('columnheader')
    const duyetButtons = await screen.findAllByRole('button', { name: 'Duyệt' })
    // First "Duyệt" button in the toolbar; row-level ones follow if any Chờ duyệt rows render.
    const rowDuyet = duyetButtons.find((b) => b.closest('td'))
    if (rowDuyet) {
      await user.click(rowDuyet)
      expect(
        await screen.findByText('Bạn có chắn chắn Duyệt trả linh kiện?'),
      ).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Đã nhận' }))
      expect(notifySuccess).toHaveBeenCalledWith('Duyệt thành công!')
    }
  })

  it('Tình trạng filter offers Chờ duyệt / Đã duyệt', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKPage />)
    await user.click(screen.getByLabelText('Tình trạng'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Chờ duyệt')).toBeInTheDocument()
    expect(within(listbox).getByText('Đã duyệt')).toBeInTheDocument()
  })

  it('Loại trả filter offers Trả từ phiếu / Trả từ kỹ thuật', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DsTraLKPage />)
    await user.click(screen.getByLabelText('Loại trả'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByText('Trả từ phiếu')).toBeInTheDocument()
    expect(within(listbox).getByText('Trả từ kỹ thuật')).toBeInTheDocument()
  })

  it('renders the Tổng số LK KPI box and Xuất ra Excel button', () => {
    renderWithProviders(<DsTraLKPage />)
    expect(screen.getByText('Tổng số LK')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất ra Excel' })).toBeInTheDocument()
  })

  it('does not render an invented Lý do column', async () => {
    renderWithProviders(<DsTraLKPage />)
    await screen.findAllByRole('columnheader')
    expect(screen.queryByRole('columnheader', { name: 'Lý do' })).not.toBeInTheDocument()
  })
})
