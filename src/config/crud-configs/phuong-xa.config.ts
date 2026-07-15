import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { PhuongXa } from '@/types/masterdata-types'
import { PHUONG_XA_ROWS } from '@/mock/masterdata/phuong-xa.mock'
import { TINH, QUAN, TUYEN } from '@/mock/seed/tinh-quan-xa'
import { apiFor } from '@/api/api-for'

const tinhName = (id: string) => TINH.find((t) => t.id === id)?.ten ?? id
const quanName = (id: string) => QUAN.find((q) => q.id === id)?.ten ?? id
const tuyenName = (id?: string) =>
  id ? (TUYEN.find((t) => t.id === id)?.ten ?? id) : '—'

export const phuongXaConfig: CrudConfig<PhuongXa> = {
  resourceKey: 'phuong-xa',
  title: 'Phường/Xã',
  pageSize: 20,
  defaultSort: { key: 'tenPhuongXa', dir: 'asc' },
  mockApi: apiFor('phuong-xa', PHUONG_XA_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tinhId', header: 'Tên Tỉnh', width: 130, renderCell: (v) => tinhName(v as string) },
    { key: 'quanId', header: 'Tên Quận', width: 150, renderCell: (v) => quanName(v as string) },
    { key: 'tenPhuongXa', header: 'Tên Xã/Phường', sortable: true, width: 200 },
    {
      key: 'khoangCach',
      header: 'Cây số',
      sortable: true,
      width: 90,
      renderCell: (v) => String(v as number),
    },
    {
      key: 'tienCong',
      header: 'Tiền công',
      sortable: true,
      width: 120,
      renderCell: (v) => formatVND(v as number),
    },
    {
      key: 'tuyenId',
      header: 'Tuyến',
      width: 160,
      renderCell: (v) => tuyenName(v as string | undefined),
    },
  ],
  fields: [
    {
      key: 'tinhId',
      label: 'Tỉnh',
      type: 'select',
      required: true,
      options: TINH.map((t) => ({ label: t.ten, value: t.id })),
    },
    {
      key: 'quanId',
      label: 'Quận',
      type: 'select',
      required: true,
      options: QUAN.map((q) => ({ label: q.ten, value: q.id })),
    },
    { key: 'tenPhuongXa', label: 'Tên phường xã', type: 'text', required: true },
    { key: 'khoangCach', label: 'Khoảng cách', type: 'money' },
    { key: 'tienCong', label: 'Tiền công', type: 'money' },
    {
      key: 'tuyenId',
      label: 'Tuyến',
      type: 'select',
      options: TUYEN.map((t) => ({ label: t.ten, value: t.id })),
    },
  ],
  filters: [
    {
      key: 'tinhId',
      label: 'Tỉnh',
      type: 'select',
      options: TINH.map((t) => ({ label: t.ten, value: t.id })),
    },
    {
      key: 'quanId',
      label: 'Quận',
      type: 'select',
      options: QUAN.map((q) => ({ label: q.ten, value: q.id })),
    },
    { key: 'tenPhuongXa', label: 'Tên phường/xã', type: 'text' },
    {
      key: 'tuyenId',
      label: 'Tuyến',
      type: 'select',
      options: TUYEN.map((t) => ({ label: t.ten, value: t.id })),
    },
  ],
}
