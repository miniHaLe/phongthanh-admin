/** Spec: legacy repair update page prefill, actions, histories, and save modes. */
import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import RepairEditPage from './RepairEditPage'

const ticket = MOCK_TICKETS.slice(0, 6).find((item) => item.soSerial)!

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>
}

function renderEdit(id = ticket.id) {
  return renderWithProviders(
    <Routes>
      <Route path="/sua-chua-bao-hanh/:id/sua" element={<RepairEditPage />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>,
    { route: `/sua-chua-bao-hanh/${id}/sua` },
  )
}

describe('RepairEditPage', () => {
  it('prefills the ticket and renders the exact legacy actions and history columns', async () => {
    renderEdit()

    expect(await screen.findByDisplayValue(ticket.soPhieu)).toBeInTheDocument()
    expect(screen.getByDisplayValue(ticket.soSerial!)).toBeInTheDocument()
    expect(screen.getByText(ticket.khachHang.ten)).toBeInTheDocument()
    for (const name of [
      'Lưu',
      'Lưu & Thêm mới',
      'Lưu & Đóng',
      'Tải tất cả hình',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Thêm phiếu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đóng' })).toBeInTheDocument()

    const dispatchRegion = screen.getByRole('region', {
      name: 'Nhật ký điều phối kỹ thuật viên',
    })
    expect(
      within(dispatchRegion)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual([
      'STT',
      'Kỹ thuật',
      'Ngày tạo',
      'Người tạo',
      'Tình trạng',
      'Ngày hủy',
      'Người hủy',
    ])
  })

  it.each([
    ['Lưu', `/sua-chua-bao-hanh/${ticket.id}`],
    ['Lưu & Thêm mới', '/sua-chua-bao-hanh/tao-moi'],
    ['Lưu & Đóng', '/sua-chua-bao-hanh'],
  ])('supports %s navigation after updating', async (buttonName, path) => {
    const original = structuredClone(ticket)
    const user = userEvent.setup()
    try {
      renderEdit()
      await screen.findByDisplayValue(ticket.soPhieu)
      await user.click(screen.getByRole('button', { name: buttonName }))
      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent(path)
      })
    } finally {
      Object.assign(ticket, original)
    }
  })

  it('shows the shared not-found state', async () => {
    renderEdit('missing-ticket')
    expect(
      await screen.findByText('Không tìm thấy phiếu sửa chữa'),
    ).toBeInTheDocument()
  })
})
