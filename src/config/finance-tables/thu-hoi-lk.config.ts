/**
 * CrudConfig for Thu Hoi Linh Kien (parts recovery / recall).
 */
import { formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { ThuHoiLK } from '@/types/inventory-types'
import { thuHoiLKApi } from '@/mock/inventory-mock'
import { BRANCHES } from '@/mock/seed/branches'

export const thuHoiLKConfig: CrudConfig<ThuHoiLK> = {
  resourceKey: 'thu-hoi-lk',
  title: 'Thu Hồi Linh Kiện',
  pageSize: 20,
  defaultSort: { key: 'ngay_thu_hoi', dir: 'desc' },
  mockApi: thuHoiLKApi,
  columns: [
    { key: 'ma', header: 'Mã phiếu', sortable: true, width: 130 },
    { key: 'phieu_sc_ma', header: 'Phiếu SC', width: 120 },
    { key: 'ky_thuat_vien', header: 'Kỹ thuật viên', width: 160 },
    {
      key: 'ngay_thu_hoi',
      header: 'Ngày thu hồi',
      sortable: true,
      width: 130,
      renderCell: (v) => formatDate(v as string),
    },
    { key: 'ghi_chu', header: 'Ghi chú', width: 220 },
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
    {
      key: 'ngay_thu_hoi',
      label: 'Ngày thu hồi',
      type: 'date',
      required: true,
    },
    { key: 'ghi_chu', label: 'Ghi chú', type: 'textarea', span: 2 },
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
