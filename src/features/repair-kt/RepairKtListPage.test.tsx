/**
 * Spec: KT board page renders title, 14 headers in order, KT-scoped status
 * filter (membership set + presentation sequence — checked separately, never
 * deep-equal one against the other), buttons, and dual pagination label.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { KT_BOARD_STATUS_IDS } from '@/domains/repair/status'
import RepairKtListPage from './RepairKtListPage'
import { KT_DISPLAY_ORDER } from './RepairKtFilters'

const HEADERS_IN_ORDER = [
  '#',
  '#',
  'Phiếu sửa chữa',
  'Khách hàng',
  'Thông tin sản phẩm',
  'Kỹ thuật',
  'Loại SC',
  'Chi phí',
  'Ngày nhận',
  'Ngày giao',
  'Chi tiết SC',
  'Ghi chú',
  'Người nhận',
  'Khu vực',
]

describe('RepairKtListPage', () => {
  it('renders the box title', () => {
    renderWithProviders(<RepairKtListPage />)
    expect(
      screen.getByRole('heading', { name: 'Danh sách Phiếu sửa chữa' }),
    ).toBeInTheDocument()
  })

  it('renders the breadcrumb', () => {
    renderWithProviders(<RepairKtListPage />)
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
    expect(screen.getByText('Danh sách phiếu sửa chữa')).toBeInTheDocument()
  })

  it('renders the 14 reference column headers in order', () => {
    renderWithProviders(<RepairKtListPage />)
    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length)
    headerCells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(HEADERS_IN_ORDER[i])
    })
  })

  it('renders "Tìm kiếm" and "Tải lại trang" buttons', () => {
    renderWithProviders(<RepairKtListPage />)
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại trang' }),
    ).toBeInTheDocument()
  })

  it('renders the dual "Tổng: N dòng, Trang x / y" pagination label above and below the table', async () => {
    renderWithProviders(<RepairKtListPage />)
    const labels = await screen.findAllByText(/Tổng:.*dòng, Trang \d+ \/ \d+/)
    expect(labels.length).toBeGreaterThanOrEqual(2)
  })

  it('status filter presents exactly the 10 KT-scoped options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairKtListPage />)

    await user.click(screen.getByLabelText('Tình trạng'))
    const optionEls = (await screen.findAllByRole('option')).filter((el) =>
      el.hasAttribute('data-status-id'),
    )
    expect(optionEls).toHaveLength(10)

    const renderedIds = optionEls.map((el) =>
      Number(el.getAttribute('data-status-id')),
    )

    // (a) Membership — sorted option ids equal the canonical ascending set.
    expect([...renderedIds].sort((a, b) => a - b)).toEqual([
      ...KT_BOARD_STATUS_IDS,
    ])

    // (b) Presentation sequence — rendered order equals this module's own
    // display-order constant. Distinct assertion from (a) above.
    expect(renderedIds).toEqual([...KT_DISPLAY_ORDER])
  })

  it('excludes non-KT statuses ("Mới Nhận" id 1, "Đã Giao Cho Khách" id 10) from the filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairKtListPage />)

    await user.click(screen.getByLabelText('Tình trạng'))
    await screen.findAllByRole('option')

    expect(screen.queryByRole('option', { name: /Mới Nhận/ })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Đã Giao Cho Khách/ }),
    ).not.toBeInTheDocument()
  })
})
