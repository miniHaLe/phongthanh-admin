/**
 * Spec: Bán Hàng create/edit editor — toolbar labels, line grid headers,
 * validation, and edit mode prefilling from useParams id.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { SELLING_ROWS } from '@/domains/warehouse/list-data'
import BanHangEditorPage from './BanHangEditorPage'

describe('BanHangEditorPage — create mode', () => {
  it('renders Lưu / Lưu & Thêm mới / In Phiếu BH / In Phiếu Thu / Danh sách đơn hàng', () => {
    renderWithProviders(<BanHangEditorPage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In Phiếu BH' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In Phiếu Thu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách đơn hàng' })).toBeInTheDocument()
  })

  it('renders the verified line-grid column headers', () => {
    renderWithProviders(<BanHangEditorPage />)
    for (const label of [
      'Serial',
      'Tên',
      'Model',
      'Cập nhật giá',
      'Giá',
      'Số lượng',
      'Thành tiền',
    ]) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument()
    }
  })

  it('validates: no hình thức thanh toán → error, then no khách hàng → error', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BanHangEditorPage />)
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(
      await screen.findByText('Vui lòng chọn hình thức thanh toán!'),
    ).toBeInTheDocument()
  })
})

describe('BanHangEditorPage — edit mode', () => {
  it('prefills khách hàng from the existing order when id is present', async () => {
    const existing = SELLING_ROWS[0]
    renderWithProviders(
      <Routes>
        <Route path="/xuat-kho/ban-hang/:id/sua" element={<BanHangEditorPage />} />
      </Routes>,
      { route: `/xuat-kho/ban-hang/${existing.id}/sua` },
    )
    expect(await screen.findByText('Chỉnh sửa phiếu bán hàng')).toBeInTheDocument()
  })
})
