import { formatVND, formatDate } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { UngLuong } from '@/domains/hr/types'
import { ungLuongApi } from '@/domains/hr/ung-luong.mock'
import { NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { KY } from '@/mock/seed/ky'

const NV_LABEL = (id: string) =>
  NHAN_VIEN_ROWS.find((r) => r.id === id)?.hoTen ?? id
const KY_LABEL = (id: string) => KY.find((k) => k.id === id)?.ten ?? id

export const ungLuongConfig: CrudConfig<UngLuong> = {
  resourceKey: 'ung-luong',
  title: 'Ứng Lương',
  pageSize: 20,
  mockApi: ungLuongApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    {
      key: 'nhanVienId',
      header: 'Tên Nhân Viên',
      sortable: true,
      width: 200,
      renderCell: (v) => NV_LABEL(v as string),
    },
    {
      key: 'kyId',
      header: 'Tên Kỳ',
      width: 100,
      renderCell: (v) => KY_LABEL(v as string),
    },
    {
      key: 'ngayUng',
      header: 'Ngày Ứng',
      sortable: true,
      width: 130,
      renderCell: (v) => formatDate(v as string),
    },
    {
      key: 'soTien',
      header: 'Số Tiền',
      sortable: true,
      width: 130,
      renderCell: (v) => formatVND(v as number),
    },
    { key: 'ghiChu', header: 'Ghi chú', width: 220 },
  ],
  fields: [
    {
      key: 'nhanVienId',
      label: 'Nhân Viên',
      type: 'select',
      required: true,
      options: NHAN_VIEN_ROWS.map((r) => ({ label: r.hoTen, value: r.id })),
    },
    {
      key: 'kyId',
      label: 'Tên Kỳ',
      type: 'select',
      required: true,
      options: KY.map((k) => ({ label: k.ten, value: k.id })),
    },
    { key: 'ngayUng', label: 'Ngày Ứng', type: 'date', required: true },
    { key: 'soTien', label: 'Số Tiền', type: 'money', required: true },
    { key: 'ghiChu', label: 'Ghi Chú', type: 'text' },
  ],
  filters: [
    {
      key: 'nhanVienId',
      label: 'Nhân viên',
      type: 'select',
      options: NHAN_VIEN_ROWS.map((r) => ({ label: r.hoTen, value: r.id })),
    },
    {
      key: 'kyId',
      label: 'Kỳ',
      type: 'select',
      options: KY.map((k) => ({ label: k.ten, value: k.id })),
    },
  ],
}
