/**
 * Spec: detail toolbar buttons, all 11 legacy section headings, log-table
 * header arrays, and absence of the invented "Chi phí"/"Linh kiện sử dụng"
 * sections.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { ROUTES } from '@/constants/routes'
import RepairDetailPage from './RepairDetailPage'

vi.mock('@/components/print/print-window', () => ({
  openPrintWindow: vi.fn(),
}))

const ticket = MOCK_TICKETS[0]

function renderDetail(id: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/sua-chua-bao-hanh/:id" element={<RepairDetailPage />} />
    </Routes>,
    { route: `/sua-chua-bao-hanh/${id}` },
  )
}

describe('RepairDetailPage', () => {
  it('renders the ticket number once loaded', async () => {
    renderDetail(ticket.id)
    await waitFor(() => {
      expect(screen.getAllByText(ticket.soPhieu).length).toBeGreaterThan(0)
    })
  })

  it('renders all 11 legacy section headings in order', async () => {
    renderDetail(ticket.id)
    await waitFor(() => {
      expect(screen.getByText('Thông tin sản phẩm')).toBeInTheDocument()
    })

    const expectedHeadings = [
      'Thông tin sản phẩm',
      'Thông tin phiếu',
      'Thông tin khách hàng',
      'Thông tin nhận',
      'Hình',
      'Nhật ký tình trạng máy',
      'Nhật ký điều phối kỹ thuật viên',
      'Nhật ký chuyển chi nhánh',
      'Danh sách cấp linh kiện',
      'Danh sách trả linh kiện',
      'Lịch sử máy',
    ]

    const headingEls = expectedHeadings.map((h) => screen.getByText(h))

    // Verify DOM order matches the expected order.
    for (let i = 0; i < headingEls.length - 1; i++) {
      const relation = headingEls[i].compareDocumentPosition(
        headingEls[i + 1],
      )
      // Node.DOCUMENT_POSITION_FOLLOWING === 4
      expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('renders the status-log table with the exact header set', async () => {
    renderDetail(ticket.id)
    const heading = await screen.findByText('Nhật ký tình trạng máy')
    const card = heading.closest('div')?.parentElement
      ?.parentElement as HTMLElement
    const headers = within(card).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'STT',
      'Tình trạng',
      'Ngày tạo',
      'Người tạo',
      'Giá',
      'Nội dung SC',
      'Ghi chú',
    ])
  })

  it('renders the dispatch-log table with the exact header set', async () => {
    renderDetail(ticket.id)
    const heading = await screen.findByText('Nhật ký điều phối kỹ thuật viên')
    const card = heading.closest('div')?.parentElement
      ?.parentElement as HTMLElement
    const headers = within(card).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'STT',
      'Kỹ thuật',
      'Ngày tạo',
      'Người tạo',
      'Tiền công',
      'Tình trạng',
      'Ngày hủy',
      'Người hủy',
    ])
  })

  it('shows the exact toolbar buttons/links', async () => {
    renderDetail(ticket.id)
    await waitFor(() => {
      expect(screen.getByText('Tạo mới')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('link', { name: 'Tạo mới' }),
    ).toHaveAttribute('href', ROUTES.repairCreate)
    expect(
      screen.getByRole('button', { name: 'In Tem Sửa Chữa' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'In Biên Nhận' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Danh sách phiếu' }),
    ).toHaveAttribute('href', ROUTES.repairList)
  })

  it('does not render the invented Chi phí card or Linh kiện sử dụng heading', async () => {
    renderDetail(ticket.id)
    await waitFor(() => {
      expect(screen.getByText('Thông tin sản phẩm')).toBeInTheDocument()
    })
    expect(screen.queryByText('Chi phí')).not.toBeInTheDocument()
    expect(screen.queryByText('Linh kiện sử dụng')).not.toBeInTheDocument()
  })

  it('shows a not-found state for an unknown id', async () => {
    renderDetail('PSC-DOES-NOT-EXIST')
    expect(
      await screen.findByText('Không tìm thấy phiếu sửa chữa'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Quay lại danh sách/ }),
    ).toBeInTheDocument()
  })
})
