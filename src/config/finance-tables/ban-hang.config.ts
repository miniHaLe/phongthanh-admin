/**
 * CrudConfig for Ban Hang (sales orders / stock-out sales).
 */
import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { BanHang } from '@/types/inventory-types'
import { banHangApi } from '@/mock/inventory-mock'
import { BRANCHES } from '@/mock/seed/branches'
import { renderFinancePill } from './render-finance-pill'

export const banHangConfig: CrudConfig<BanHang> = {
  resourceKey: 'ban-hang',
  title: 'Bán Hàng',
  pageSize: 20,
  defaultSort: { key: 'ngay_ban', dir: 'desc' },
  mockApi: banHangApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 120 },
    { key: 'khach_hang_ten', header: 'Khách hàng', sortable: true, width: 180 },
    {
      key: 'ngay_ban',
      header: 'Ngày bán',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'tong_tien',
      header: 'Tổng tiền',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
    },
    {
      key: 'trang_thai',
      header: 'Trạng thái',
      width: 140,
      renderCell: (v) => renderFinancePill(v as string),
    },
    {
      key: 'branchId',
      header: 'Chi nhánh',
      width: 110,
      renderCell: (v) =>
        BRANCHES.find((b) => b.id === v)?.name ?? (v as string),
    },
  ],
  fields: [
    { key: 'ma', label: 'Mã phiếu', type: 'text', required: true },
    {
      key: 'khach_hang_ten',
      label: 'Khách hàng',
      type: 'text',
      required: true,
    },
    { key: 'ngay_ban', label: 'Ngày bán', type: 'date', required: true },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Đã xuất', value: 'Da xuat' },
        { label: 'Hủy', value: 'Huy' },
      ],
    },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
  filters: [
    { key: 'khach_hang_ten', label: 'Khách hàng', type: 'text' },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Chờ xác nhận', value: 'Cho xac nhan' },
        { label: 'Đã xuất', value: 'Da xuat' },
        { label: 'Hủy', value: 'Huy' },
      ],
    },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
}
