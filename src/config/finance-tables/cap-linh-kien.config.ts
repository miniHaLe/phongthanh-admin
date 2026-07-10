/**
 * CrudConfig for Cap Linh Kien (parts allocation / dispatch).
 */
import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { CapLinhKien } from '@/types/inventory-types'
import { capLinhKienApi } from '@/mock/inventory-mock'
import { BRANCHES } from '@/mock/seed/branches'

export const capLinhKienConfig: CrudConfig<CapLinhKien> = {
  resourceKey: 'cap-linh-kien',
  title: 'Cấp Linh Kiện',
  pageSize: 20,
  defaultSort: { key: 'ngay_cap', dir: 'desc' },
  mockApi: capLinhKienApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 130 },
    { key: 'phieu_sc_ma', header: 'Phiếu SC', width: 120 },
    { key: 'ky_thuat_vien', header: 'Kỹ thuật viên', width: 160 },
    {
      key: 'ngay_cap',
      header: 'Ngày cấp',
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
      key: 'branchId',
      header: 'Chi nhánh',
      width: 110,
      renderCell: (v) =>
        BRANCHES.find((b) => b.id === v)?.name ?? (v as string),
    },
  ],
  fields: [
    { key: 'ma', label: 'Mã phiếu', type: 'text', required: true },
    { key: 'phieu_sc_ma', label: 'Mã phiếu SC', type: 'text', required: true },
    {
      key: 'ky_thuat_vien',
      label: 'Kỹ thuật viên',
      type: 'text',
      required: true,
    },
    { key: 'ngay_cap', label: 'Ngày cấp', type: 'date', required: true },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
  filters: [
    { key: 'ky_thuat_vien', label: 'Kỹ thuật viên', type: 'text' },
    { key: 'phieu_sc_ma', label: 'Phiếu SC', type: 'text' },
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: BRANCHES.map((b) => ({ label: b.name, value: b.id })),
    },
  ],
}
