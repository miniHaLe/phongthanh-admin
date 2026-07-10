import type { CrudConfig } from '@/types/crud-types'
import type { NganChua } from '@/types/masterdata-types'
import { nganChuaApi } from '@/mock/masterdata/ngan-chua.mock'
import { NHA_KHO_ROWS } from '@/mock/masterdata/nha-kho.mock'

export const nganChuaConfig: CrudConfig<NganChua> = {
  resourceKey: 'ngan-chua',
  title: 'Ngăn Chứa',
  pageSize: 20,
  mockApi: nganChuaApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    {
      key: 'nhaKhoId',
      header: 'Nhà kho',
      width: 180,
      renderCell: (v) =>
        NHA_KHO_ROWS.find((r) => r.id === v)?.tenNhaKho ?? (v as string),
    },
    { key: 'tenNgan', header: 'Tên ngăn chứa', sortable: true, width: 180 },
  ],
  fields: [
    {
      key: 'nhaKhoId',
      label: 'Nhà kho',
      type: 'select',
      required: true,
      options: NHA_KHO_ROWS.map((r) => ({ label: r.tenNhaKho, value: r.id })),
    },
    { key: 'tenNgan', label: 'Tên ngăn chứa', type: 'text', required: true },
  ],
  filters: [
    {
      key: 'nhaKhoId',
      label: 'Nhà kho',
      type: 'select',
      options: NHA_KHO_ROWS.map((r) => ({ label: r.tenNhaKho, value: r.id })),
    },
    { key: 'tenNgan', label: 'Tên ngăn chứa', type: 'text' },
  ],
}
