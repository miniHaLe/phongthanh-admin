/**
 * Spec: Nhập Kho create editor — Lưu/Lưu & Thêm mới present, Nhóm khách hàng
 * 9 options, line grid headers, validation messages fire in order (nhà cung
 * cấp first, then hàng hóa).
 */
import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { RECEIVING_ROWS } from '@/domains/warehouse/list-data'
import { NHA_KHO_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import {
  clearIncompatibleReceivingLineCabinets,
  createReceiving,
} from './create-receiving'
import { NhapKhoLineEntry } from './nhap-kho-line-entry'
import NhapKhoCreatePage from './NhapKhoCreatePage'

describe('NhapKhoCreatePage', () => {
  it('renders Lưu / Lưu & Thêm mới / In / Danh sách nhập kho', () => {
    renderWithProviders(<NhapKhoCreatePage />)
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & Thêm mới' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Danh sách nhập kho' }),
    ).toBeInTheDocument()
  })

  it('Nhóm khách hàng offers the 9 verified options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByLabelText(/Nhóm khách hàng/))
    const listbox = await screen.findByRole('listbox')
    for (const label of [
      'Khách lẻ',
      'Đối tác MB/Nhà CC',
      'Đại lý chính',
      'Trung tâm bảo hành',
      'Đại lý/Cửa hàng',
      'Nhân viên công ty',
      'Thợ sửa chữa',
      'Cộng tác viên',
      'Nhà xe - Chuyển phát',
    ]) {
      expect(within(listbox).getByText(label)).toBeInTheDocument()
    }
  })

  it('loads real-capable nhà kho options through the lookup seam', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByLabelText(/Nhà kho/))
    expect(
      await screen.findByRole('option', { name: 'Kho Chính BMT' }),
    ).toBeInTheDocument()
  })

  it('renders the verified line-grid column headers', () => {
    renderWithProviders(<NhapKhoCreatePage />)
    for (const label of [
      'Mã',
      'Tên',
      'Ngăn chứa',
      'Số lượng',
      'Đơn giá',
      'Thành tiền',
      'Cập nhật giá',
      'Serial',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: label }),
      ).toBeInTheDocument()
    }
  })

  it('validates: no nhà cung cấp → "Vui lòng chọn nhà cung cấp!"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NhapKhoCreatePage />)
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(
      await screen.findByText('Vui lòng chọn nhà cung cấp!'),
    ).toBeInTheDocument()
  })

  it('persists the selected warehouse and cabinet ids on a new voucher', () => {
    const cabinet = NGAN_CHUA_ROWS[0]
    const warehouse = NHA_KHO_ROWS.find((row) => row.id === cabinet.nhaKhoId)!

    const voucher = createReceiving({
      soDatHang: 'DH-01',
      soHoaDon: 'HD-01',
      nhaCungCap: 'Nhà cung cấp thử',
      nhaCungCapSdt: '0901000099',
      hinhThucThanhToan: 'Công nợ',
      khoId: warehouse.id,
      khoTen: warehouse.tenNhaKho,
      nguoiLap: 'NV Kho',
      ghiChu: '',
      branchId: 'dak-lak',
      cabinets: NGAN_CHUA_ROWS,
      lines: [
        {
          ma: 'HH0001',
          ten: 'Linh kiện thử',
          nganChuaId: cabinet.id,
          nganChua: cabinet.tenNgan,
          soLuong: 2,
          donGia: 50_000,
          thanhTien: 100_000,
          capNhatGia: false,
          serial: '',
        },
      ],
    })

    expect(voucher).toMatchObject({
      khoId: warehouse.id,
      nhaCungCapSdt: '0901000099',
      lines: [
        expect.objectContaining({
          nganChuaId: cabinet.id,
          nganChua: cabinet.tenNgan,
        }),
      ],
    })

    RECEIVING_ROWS.splice(
      RECEIVING_ROWS.findIndex((row) => row.id === voucher.id),
      1,
    )
  })

  it('adds line detail with the selected cabinet id and label', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const cabinet = NGAN_CHUA_ROWS[0]

    renderWithProviders(
      <NhapKhoLineEntry
        khoId={cabinet.nhaKhoId}
        nganChuaId={cabinet.id}
        onAdd={onAdd}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Nhập vào mã hàng' }))
    await user.click((await screen.findAllByRole('option'))[0])
    await user.click(screen.getByRole('button', { name: 'Thêm hàng' }))

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        nganChuaId: cabinet.id,
        nganChua: cabinet.tenNgan,
      }),
    )
  })

  it('clears persisted line cabinets when the header warehouse changes', () => {
    const cabinet = NGAN_CHUA_ROWS[0]
    const nextWarehouse = NHA_KHO_ROWS.find(
      (row) => row.id !== cabinet.nhaKhoId,
    )!
    const [line] = clearIncompatibleReceivingLineCabinets(
      [
        {
          ma: 'HH0001',
          ten: 'Linh kiện thử',
          nganChuaId: cabinet.id,
          nganChua: cabinet.tenNgan,
          soLuong: 1,
          donGia: 50_000,
          thanhTien: 50_000,
          capNhatGia: false,
          serial: '',
        },
      ],
      nextWarehouse.id,
      NGAN_CHUA_ROWS,
    )

    expect(line).toMatchObject({ nganChuaId: '', nganChua: '' })
  })
})
