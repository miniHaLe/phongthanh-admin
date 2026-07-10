import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { KhuVuc } from '@/types/masterdata-types'
import { khuVucApi } from '@/mock/masterdata/khu-vuc.mock'
import { TINH, QUAN, XA } from '@/mock/seed/tinh-quan-xa'

const tinhName = (id: string) => TINH.find((t) => t.id === id)?.ten ?? id
const quanName = (id: string) => QUAN.find((q) => q.id === id)?.ten ?? id
const xaName = (id: string) => XA.find((x) => x.id === id)?.ten ?? id

export const khuVucConfig: CrudConfig<KhuVuc> = {
  resourceKey: 'khu-vuc',
  title: 'Khu Vực',
  pageSize: 20,
  defaultSort: { key: 'tenKhuVuc', dir: 'asc' },
  mockApi: khuVucApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tinhId', header: 'Tên Tỉnh', width: 130, renderCell: (v) => tinhName(v as string) },
    { key: 'quanId', header: 'Tên Quận', width: 150, renderCell: (v) => quanName(v as string) },
    { key: 'xaId', header: 'Tên Xã/Phường', width: 160, renderCell: (v) => xaName(v as string) },
    { key: 'tenKhuVuc', header: 'Tên khu vực', sortable: true, width: 180 },
    {
      key: 'caySo',
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
      key: 'tienCong2',
      header: 'Tiền công 2',
      sortable: true,
      width: 120,
      renderCell: (v) => formatVND(v as number),
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
    {
      key: 'xaId',
      label: 'Phường/Xã',
      type: 'select',
      options: XA.map((x) => ({ label: x.ten, value: x.id })),
    },
    { key: 'tenKhuVuc', label: 'Tên khu vực', type: 'text', required: true },
    { key: 'caySo', label: 'Cây số', type: 'money' },
    { key: 'tienCong', label: 'Tiền công 1', type: 'money' },
    { key: 'tienCong2', label: 'Tiền công 2', type: 'money' },
  ],
  filters: [
    { key: 'tenKhuVuc', label: 'Tên khu vực', type: 'text' },
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
  ],
}
