/** Spec: Nhập Kho list — verified reference columns, no Trạng thái, Tổng tiền box. */
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { NHA_KHO_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import * as warehouseFetchers from '@/domains/warehouse/list-fetchers'
import NhapKhoPage from './NhapKhoPage'

const HEADERS_IN_ORDER = [
  'Số phiếu',
  'Số đặt hàng',
  'Số hóa đơn',
  'Nhà cung cấp',
  'Hình thức thanh toán',
  'Nhà kho',
  'Số tiền',
  'Người lập',
  'Ngày lập',
  'Ghi Chú',
  'Chọn',
]

describe('NhapKhoPage', () => {
  it('renders the verified column headers in order (plus leading checkbox column)', async () => {
    renderWithProviders(<NhapKhoPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    // First column is the "Chọn tất cả" checkbox header (no text content).
    expect(headerCells).toHaveLength(HEADERS_IN_ORDER.length + 1)
    HEADERS_IN_ORDER.forEach((label, i) => {
      expect(headerCells[i + 1]).toHaveTextContent(label)
    })
  })

  it('does not render a Trạng thái column', async () => {
    renderWithProviders(<NhapKhoPage />)
    await screen.findAllByRole('columnheader')
    expect(
      screen.queryByRole('columnheader', { name: 'Trạng thái' }),
    ).not.toBeInTheDocument()
  })

  it('renders captured search actions plus the reload capability superset', () => {
    renderWithProviders(<NhapKhoPage />)
    expect(screen.getByRole('button', { name: /Thêm mới/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại trang' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tìm chi tiết' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
  })

  it('renders the Tổng tiền info box', async () => {
    renderWithProviders(<NhapKhoPage />)
    expect(await screen.findByText(/Tổng tiền:/)).toBeInTheDocument()
  })

  it('renders the complete legacy receiving filter contract', () => {
    renderWithProviders(<NhapKhoPage />)

    for (const label of [
      'Chi nhánh',
      'Hình thức thu chi',
      'Nhà kho',
      'Ngăn chứa',
      'Từ ngày',
      'Đến ngày',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }

    for (const placeholder of [
      'Số phiếu nhập kho',
      'Số Đặt hàng/Hóa đơn',
      'Mã sản phẩm',
      'Nhập vào Tên/Số điện thoại',
      'Người tạo',
      'Từ ngày',
      'Đến ngày',
    ]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
    }

  })

  it('opens line-level receiving details distinct from the header table', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoPage />)
    await screen.findAllByRole('columnheader')

    await user.click(screen.getByRole('button', { name: 'Tìm chi tiết' }))

    expect(
      await screen.findByRole('heading', { name: 'Chi tiết nhập kho' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Ngăn chứa' }),
    ).toBeInTheDocument()
  })

  it('passes every public filter key to fetchReceivingList', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi
      .spyOn(warehouseFetchers, 'fetchReceivingList')
      .mockResolvedValue({ data: [], total: 0 })
    const cabinet = NGAN_CHUA_ROWS[0]
    const warehouse = NHA_KHO_ROWS.find((row) => row.id === cabinet.nhaKhoId)!

    renderWithProviders(<NhapKhoPage />)

    await user.click(screen.getByLabelText('Chi nhánh'))
    await user.click(await screen.findByRole('option', { name: 'Đắk Nông' }))
    await user.click(screen.getByLabelText('Hình thức thu chi'))
    await user.click(await screen.findByRole('option', { name: 'Công nợ' }))
    await user.click(screen.getByLabelText('Nhà kho'))
    await user.click(
      await screen.findByRole('option', { name: warehouse.tenNhaKho }),
    )
    await user.click(screen.getByLabelText('Ngăn chứa'))
    await user.click(
      await screen.findByRole('option', { name: cabinet.tenNgan }),
    )

    await user.type(screen.getByPlaceholderText('Số phiếu nhập kho'), 'PNK-9')
    await user.type(screen.getByPlaceholderText('Số Đặt hàng/Hóa đơn'), 'HD-88')
    await user.type(screen.getByPlaceholderText('Mã sản phẩm'), 'HH0008')
    await user.type(
      screen.getByPlaceholderText('Nhập vào Tên/Số điện thoại'),
      'Minh Phát',
    )
    await user.type(screen.getByPlaceholderText('Người tạo'), 'Thủ kho')
    fireEvent.change(screen.getByLabelText('Từ ngày'), {
      target: { value: '2026-01-01' },
    })
    fireEvent.change(screen.getByLabelText('Đến ngày'), {
      target: { value: '2026-06-30' },
    })

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: 'dak-nong',
          hinhThucThanhToan: 'Công nợ',
          khoId: warehouse.id,
          nganChuaId: cabinet.id,
          soPhieu: 'PNK-9',
          soDatHangHoaDon: 'HD-88',
          maSanPham: 'HH0008',
          nhaCungCap: 'Minh Phát',
          nguoiLap: 'Thủ kho',
          dateFrom: '2026-01-01',
          dateTo: '2026-06-30',
          page: 1,
          pageSize: 20,
        }),
      )
    })

    fetchSpy.mockRestore()
  })
})
