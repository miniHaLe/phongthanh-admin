/**
 * CrudConfig for Tra Hang (stock-out returns).
 */
import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { TraHang } from '@/types/inventory-types'
import { traHangApi } from '@/mock/inventory-mock'
import { BRANCHES } from '@/mock/seed/branches'

export const traHangConfig: CrudConfig<TraHang> = {
  resourceKey: 'tra-hang',
  title: 'Trả Hàng',
  pageSize: 20,
  defaultSort: { key: 'ngay_tra', dir: 'desc' },
  mockApi: traHangApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 120 },
    { key: 'khach_hang_ten', header: 'Khách hàng', width: 180 },
    {
      key: 'ngay_tra',
      header: 'Ngày trả',
      sortable: true,
      width: 110,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'ly_do', header: 'Lý do', width: 200 },
    {
      key: 'tong_tien_hoan',
      header: 'Tiền hoàn',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
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
    { key: 'ngay_tra', label: 'Ngày trả', type: 'date', required: true },
    {
      key: 'ly_do',
      label: 'Lý do trả',
      type: 'textarea',
      required: true,
      span: 2,
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
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
}
