/** Spec: grouped print actions and selection-gated repair bulk operations. */
import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { RepairBatchToolbar } from './repair-batch-toolbar'

const printMocks = vi.hoisted(() => ({
  printBienNhan: vi.fn(),
  printPhieuSc: vi.fn(),
  printTemDanMay: vi.fn(),
  printGiayDiDuong: vi.fn(),
  printLenhSuaTaiNha: vi.fn(),
}))

vi.mock('../prints/repair-prints', () => printMocks)

describe('RepairBatchToolbar', () => {
  const baseProps = {
    selected: [],
    filters: {},
    total: 0,
  }

  it('shows exports and a disabled print menu without zero-selection bulk actions', () => {
    renderWithProviders(<RepairBatchToolbar {...baseProps} />)

    expect(screen.getByRole('button', { name: /^In/ })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel In' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Thao tác hàng loạt' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chuyển chi nhánh' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Xóa' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Lập phiếu' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Tải lại trang' }),
    ).not.toBeInTheDocument()
  })

  it('groups five print functions and shows transfer/delete only with selection', async () => {
    const user = userEvent.setup()
    const selected = MOCK_TICKETS[0]
    renderWithProviders(
      <RepairBatchToolbar {...baseProps} selected={[selected]} />,
    )

    const bulkBar = screen.getByRole('region', {
      name: 'Thao tác hàng loạt',
    })
    expect(
      within(bulkBar).getByRole('button', { name: 'Chuyển chi nhánh' }),
    ).toBeInTheDocument()
    expect(
      within(bulkBar).getByRole('button', { name: 'Xóa' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^In/ }))
    const printItems = screen.getAllByRole('menuitem')
    expect(printItems.map((item) => item.textContent)).toEqual([
      'In Biên nhận',
      'In Giấy Đi Đường',
      'In Lệnh Sửa Tại Nhà',
      'In Phiếu SC',
      'In Tem Dán Máy',
    ])

    await user.click(screen.getByRole('menuitem', { name: 'In Phiếu SC' }))
    expect(printMocks.printPhieuSc).toHaveBeenCalledWith(selected)
  })
})
