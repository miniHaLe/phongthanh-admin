/**
 * Spec: Bán Hàng create/edit editor — toolbar labels, line grid headers,
 * validation, and edit mode prefilling from useParams id.
 */
import { afterEach, describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/render-with-providers'
import { SELLING_ROWS } from '@/domains/warehouse/list-data'
import { useAppStore } from '@/store/app-store'
import BanHangEditorPage from './BanHangEditorPage'

const originalSellingRows = [...SELLING_ROWS]

afterEach(() => {
  SELLING_ROWS.splice(0, SELLING_ROWS.length, ...originalSellingRows)
  useAppStore.setState({ activeBranch: 'all' })
})

describe('BanHangEditorPage — create mode', () => {
  it('renders Lưu / Lưu & Thêm mới / In Phiếu BH / In Phiếu Thu / Danh sách đơn hàng', () => {
    renderWithProviders(<BanHangEditorPage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'In Phiếu BH' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'In Phiếu Thu' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Danh sách đơn hàng' }),
    ).toBeInTheDocument()
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
      expect(
        screen.getByRole('columnheader', { name: label }),
      ).toBeInTheDocument()
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

  it('saves under the active branch and invalidates the sales list', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ activeBranch: 'dak-nong' })
    const { queryClient } = renderWithProviders(<BanHangEditorPage />)
    const invalidate = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined)

    await user.click(
      screen.getByRole('combobox', { name: 'Hình thức thanh toán' }),
    )
    await user.click(screen.getByRole('option', { name: 'Tiền mặt' }))

    await user.click(screen.getByRole('button', { name: 'Thêm khách hàng' }))
    const customerDialog = screen.getByRole('dialog')
    await user.type(
      within(customerDialog).getByLabelText('Tên khách hàng'),
      'Khách Đắk Nông',
    )
    await user.type(
      within(customerDialog).getByLabelText('Điện thoại'),
      '0905000000',
    )
    await user.click(
      within(customerDialog).getByRole('button', { name: 'Lưu' }),
    )

    await user.click(screen.getByRole('combobox', { name: 'Nhập vào mã hàng' }))
    const stockOptions = await screen.findAllByRole('option')
    await user.click(stockOptions[0])
    await user.click(screen.getByRole('button', { name: 'Thêm hàng' }))
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(SELLING_ROWS[0].branchId).toBe('dak-nong')
      expect(SELLING_ROWS[0].hinhThucThanhToan).toBe('Tiền mặt')
      expect(SELLING_ROWS[0].lines).toHaveLength(1)
      expect(SELLING_ROWS[0].lines[0]).toMatchObject({
        hangHoaId: expect.any(String),
        maHang: expect.any(String),
        khoId: expect.any(String),
        giaVon: expect.any(Number),
        giaBan: expect.any(Number),
      })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ban-hang-list'] })
    })
  })
})

describe('BanHangEditorPage — edit mode', () => {
  it('prefills khách hàng from the existing order when id is present', async () => {
    const existing = SELLING_ROWS[0]
    renderWithProviders(
      <Routes>
        <Route
          path="/xuat-kho/ban-hang/:id/sua"
          element={<BanHangEditorPage />}
        />
      </Routes>,
      { route: `/xuat-kho/ban-hang/${existing.id}/sua` },
    )
    expect(
      await screen.findByText('Chỉnh sửa phiếu bán hàng'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Hình thức thanh toán' }),
    ).toHaveTextContent(existing.hinhThucThanhToan)
    expect(await screen.findByText(existing.lines[0].tenHang)).toBeInTheDocument()
  })
})
