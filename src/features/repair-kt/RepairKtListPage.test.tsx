/**
 * Spec: KT board page renders title, grouped headers, KT-scoped status
 * filter (membership set + presentation sequence — checked separately, never
 * deep-equal one against the other), buttons, and dual pagination label.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { KT_BOARD_STATUS_IDS } from '@/domains/repair/status'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { TECHNICIANS } from '@/domains/repair/reference-data'
import RepairKtListPage from './RepairKtListPage'
import { KT_DISPLAY_ORDER } from './repair-kt-constants'

const HEADERS_IN_ORDER = [
  'Trạng thái',
  'Hành động',
  'Mã phiếu',
  'Khách hàng',
  'Sản phẩm',
  'Phân công',
  'Chi phí',
  'Thời gian',
  'Ghi chú',
  'Người nhận',
]

const KT_STATUS_SET = new Set<number>(KT_BOARD_STATUS_IDS)
const KT_TICKETS = MOCK_TICKETS.filter((ticket) =>
  KT_STATUS_SET.has(ticket.tinhTrang),
)
const ROSTER_TECHNICIAN = TECHNICIANS.find((technician) => {
  const count = KT_TICKETS.filter(
    (ticket) => ticket.kyThuatId === technician.id,
  ).length
  return count > 0 && count < KT_TICKETS.length
})!

function getTotalLabel() {
  return document.querySelector<HTMLElement>('span[aria-live="polite"]')
}

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
    expect(screen.getByText('Sửa Chữa-Bảo Hành KT')).toBeInTheDocument()
  })

  it('renders the 10 composite column headers in order', () => {
    renderWithProviders(<RepairKtListPage />)
    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length)
    headerCells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(HEADERS_IN_ORDER[i])
    })
  })

  it('renders the search, reset, and My Tickets controls', () => {
    renderWithProviders(<RepairKtListPage />)
    expect(
      screen.getByRole('button', { name: 'Phiếu của tôi' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại trang' }),
    ).toBeInTheDocument()
  })

  it('uses an accessible chevron disclosure and keeps Tìm kiếm as the single apply trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairKtListPage />)

    const disclosure = screen.getByRole('button', {
      name: 'Thông tin tìm kiếm',
    })
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByText('Nhấn để search')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Tìm kiếm' })).toHaveLength(1)

    const ticketInput = screen.getByLabelText('Số phiếu SC')
    await user.type(ticketInput, 'PSC-KT-001')
    await user.click(disclosure)
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Số phiếu SC')).not.toBeInTheDocument()
    await user.click(disclosure)
    expect(screen.getByLabelText('Số phiếu SC')).toHaveValue('PSC-KT-001')
  })

  it('renders the total label once', async () => {
    renderWithProviders(<RepairKtListPage />)
    const labels = await screen.findAllByText(/Tổng:.*dòng, Trang \d+ \/ \d+/)
    expect(labels).toHaveLength(1)
  })

  it('keeps the default view unfiltered and explains the disabled chip for a non-roster user', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairKtListPage />)

    const chip = screen.getByRole('button', { name: 'Phiếu của tôi' })
    expect(chip).toBeDisabled()
    expect(screen.getByLabelText('Kỹ thuật')).toHaveTextContent(
      'Tất cả kỹ thuật viên',
    )

    await user.hover(chip.parentElement!)
    expect(
      (await screen.findAllByText('Tài khoản chưa gắn kỹ thuật viên')).length,
    ).toBeGreaterThan(0)
    await waitFor(() =>
      expect(getTotalLabel()).toHaveTextContent(
        `Tổng: ${KT_TICKETS.length} dòng, Trang 1 / ${Math.ceil(KT_TICKETS.length / 20)}`,
      ),
    )
  })

  it('applies the roster technician filter immediately from Phiếu của tôi', async () => {
    const user = userEvent.setup()
    const expectedTotal = KT_TICKETS.filter(
      (ticket) => ticket.kyThuatId === ROSTER_TECHNICIAN.id,
    ).length
    renderWithProviders(
      <RepairKtListPage currentUserName={ROSTER_TECHNICIAN.ten} />,
    )

    const chip = screen.getByRole('button', { name: 'Phiếu của tôi' })
    expect(chip).toBeEnabled()
    await user.click(chip)

    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Kỹ thuật')).toHaveTextContent(
      ROSTER_TECHNICIAN.ten,
    )
    await waitFor(() =>
      expect(getTotalLabel()).toHaveTextContent(
        `Tổng: ${expectedTotal} dòng, Trang 1 / ${Math.max(1, Math.ceil(expectedTotal / 20))}`,
      ),
    )
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

    expect(
      screen.queryByRole('option', { name: /Mới Nhận/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Đã Giao Cho Khách/ }),
    ).not.toBeInTheDocument()
  })
})
