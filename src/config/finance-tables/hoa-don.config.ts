/**
 * CrudConfig for Hóa Đơn (VAT invoices). List uses CrudTablePage with
 * bulk-delete (Xóa); creation is the full-page composer
 * (@/features/invoice-composer), not this config's sheet — `addLabel: false`
 * hides the generic "Thêm" button so HoaDonPage's own "Lập Hóa Đơn" header
 * button (navigating to the composer route) is the only create entry point.
 */
import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { HoaDon } from '@/types/finance-types'
import { hoaDonApi } from '@/mock/finance-mock'
import { HINH_THUC_THU_CHI } from '@/mock/seed/chung-tu'

function hinhThucLabel(id: number): string {
  return HINH_THUC_THU_CHI.find((h) => h.id === id)?.ten ?? String(id)
}

export const hoaDonConfig: CrudConfig<HoaDon> = {
  resourceKey: 'hoa-don',
  title: 'Hóa Đơn',
  pageSize: 20,
  defaultSort: { key: 'ngayXuat', dir: 'desc' },
  mockApi: hoaDonApi,
  bulkDelete: true,
  addLabel: false,
  columns: [
    { key: 'soHoaDon', header: 'Số Hóa Đơn', sortable: true, width: 140 },
    {
      key: 'hinhThucId',
      header: 'Hình Thức Thanh Toán',
      width: 160,
      renderCell: (v) => hinhThucLabel(v as number),
    },
    { key: 'tenKhachHangMua', header: 'Khách Hàng', sortable: true, width: 200 },
    { key: 'maSoThue', header: 'Mã Số Thuế', width: 140 },
    {
      key: 'tienThue',
      header: 'Tiền thuế',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
    },
    {
      key: 'tongThanhToan',
      header: 'Tổng Thanh Toán',
      sortable: true,
      width: 150,
      renderCell: (v) => formatVND(v as number),
    },
    {
      key: 'ngayXuat',
      header: 'Ngày Lập',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'nguoiLap', header: 'Người Lập', width: 160 },
  ],
  // No sheet-based create/edit — full-page composer owns both. Fields kept
  // minimal so CrudSheet type-checks if ever opened via row edit (edit is not
  // wired from HoaDonPage; see page-level row action).
  fields: [
    { key: 'soHoaDon', label: 'Số hóa đơn', type: 'text', required: true },
    { key: 'tenKhachHangMua', label: 'Khách hàng', type: 'text', required: true },
    { key: 'maSoThue', label: 'Mã số thuế', type: 'text', required: true },
    { key: 'ngayXuat', label: 'Ngày xuất', type: 'date', required: true },
  ],
  filters: [
    { key: 'soHoaDon', label: 'Số hóa đơn', type: 'text' },
    { key: 'maSoThue', label: 'Mã số thuế', type: 'text' },
    {
      key: 'hinhThucId',
      label: 'Hình thức thanh toán',
      type: 'select',
      options: [
        { label: 'Tiền mặt', value: '1' },
        { label: 'Chuyển khoản', value: '3' },
      ],
    },
    { key: 'tenDonVi', label: 'Tên đơn vị', type: 'text' },
  ],
}
