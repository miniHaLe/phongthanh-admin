import { formatVND } from '@/lib/format'
import type { CrudConfig } from '@/types/crud-types'
import type { KhuVuc } from '@/types/masterdata-types'
import { KHU_VUC_ROWS } from '@/mock/masterdata/khu-vuc.mock'
import { apiFor } from '@/api/api-for'
import {
  KhuVucProvinceField,
  KhuVucCommuneField,
} from '@/features/khu-vuc/khu-vuc-geography-fields'
import {
  provinceNameForCode,
  communeNameForCode,
} from '@/features/khu-vuc/khu-vuc-geography-names'

export const khuVucConfig: CrudConfig<KhuVuc> = {
  resourceKey: 'khu-vuc',
  title: 'Khu Vực',
  pageSize: 20,
  defaultSort: { key: 'tenKhuVuc', dir: 'asc' },
  mockApi: apiFor('khu-vuc', KHU_VUC_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    {
      key: 'tinhCode',
      header: 'Tên Tỉnh',
      width: 160,
      renderCell: (v) => provinceNameForCode(v as string),
    },
    {
      key: 'phuongXaCode',
      header: 'Tên Phường/Xã',
      width: 180,
      renderCell: (v) => communeNameForCode(v as string),
    },
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
      key: 'tinhCode',
      label: 'Tỉnh',
      type: 'text',
      required: true,
      renderField: KhuVucProvinceField,
    },
    {
      key: 'phuongXaCode',
      label: 'Phường/Xã',
      type: 'text',
      required: true,
      renderField: KhuVucCommuneField,
    },
    { key: 'tenKhuVuc', label: 'Tên khu vực', type: 'text', required: true },
    { key: 'caySo', label: 'Cây số', type: 'money' },
    { key: 'tienCong', label: 'Tiền công 1', type: 'money' },
    { key: 'tienCong2', label: 'Tiền công 2', type: 'money' },
  ],
  filters: [{ key: 'tenKhuVuc', label: 'Tên khu vực', type: 'text' }],
}
