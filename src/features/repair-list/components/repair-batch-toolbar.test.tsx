/** Spec: batch toolbar labels + zero-selection guards. */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { RepairBatchToolbar } from './repair-batch-toolbar'

const notifyError = vi.fn()
vi.mock('@/components/shared', async (orig) => {
  const actual = await orig<typeof import('@/components/shared')>()
  return { ...actual, notify: { ...actual.notify, error: (m?: string) => notifyError(m) } }
})

beforeEach(() => notifyError.mockClear())

describe('RepairBatchToolbar', () => {
  const baseProps = {
    selected: [],
    filters: {},
    total: 0,
    onReload: vi.fn(),
  }

  it('renders the labeled action buttons', () => {
    renderWithProviders(<RepairBatchToolbar {...baseProps} />)
    for (const label of [
      'Lập phiếu',
      'Chuyển chi nhánh',
      'In Biên nhận',
      'In Giấy Đi Đường',
      'In Lệnh Sửa Tại Nhà',
      'In Phiếu SC',
      'In tem',
      'Xóa',
      'Xuất Excel File',
      'Xuất Excel In',
      'Tải lại trang',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('alerts "Vui lòng chọn phiếu để …" when nothing is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairBatchToolbar {...baseProps} />)
    await user.click(screen.getByRole('button', { name: 'Chuyển chi nhánh' }))
    expect(notifyError).toHaveBeenCalledWith(
      expect.stringContaining('Vui lòng chọn phiếu để'),
    )
  })
})
