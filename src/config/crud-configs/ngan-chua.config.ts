import type { CrudConfig } from '@/types/crud-types'
import type { NganChua } from '@/types/masterdata-types'
import { NGAN_CHUA_ROWS } from '@/mock/masterdata/ngan-chua.mock'
import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const loadNhaKhoOptions = () =>
  loadLookupOptions('nha-kho', (row) => row.tenNhaKho)

export const nganChuaConfig: CrudConfig<NganChua> = {
  resourceKey: 'ngan-chua',
  title: 'Ngăn Chứa',
  pageSize: 20,
  mockApi: apiFor('ngan-chua', NGAN_CHUA_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    {
      key: 'nhaKhoId',
      header: 'Nhà kho',
      width: 180,
      renderCell: (v) =>
        lookupLabel('nha-kho', v as string, (row) => row.tenNhaKho),
    },
    { key: 'tenNgan', header: 'Tên ngăn chứa', sortable: true, width: 180 },
  ],
  fields: [
    {
      key: 'nhaKhoId',
      label: 'Nhà kho',
      type: 'select',
      required: true,
      loadOptions: loadNhaKhoOptions,
    },
    { key: 'tenNgan', label: 'Tên ngăn chứa', type: 'text', required: true },
  ],
  filters: [
    {
      key: 'nhaKhoId',
      label: 'Nhà kho',
      type: 'select',
      loadOptions: loadNhaKhoOptions,
    },
    { key: 'tenNgan', label: 'Tên ngăn chứa', type: 'text' },
  ],
}
