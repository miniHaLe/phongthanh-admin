import type { CrudConfig } from '@/types/crud-types'
import type { NhaKho } from '@/types/masterdata-types'
import { NHA_KHO_ROWS } from '@/mock/masterdata/nha-kho.mock'
import { apiFor } from '@/api/api-for'
import { lookupLabel } from '@/components/crud/lookup-label'
import { loadLookupOptions } from '@/hooks/use-lookup'

const loadChiNhanhOptions = () =>
  loadLookupOptions('chi-nhanh', (row) => row.tenChiNhanh)

export const nhaKhoConfig: CrudConfig<NhaKho> = {
  resourceKey: 'nha-kho',
  title: 'Nhà Kho',
  pageSize: 20,
  mockApi: apiFor('nha-kho', NHA_KHO_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'tenNhaKho', header: 'Tên nhà kho', sortable: true, width: 220 },
    { key: 'diaChi', header: 'Địa chỉ', width: 220 },
    {
      key: 'chiNhanhId',
      header: 'Chi nhánh',
      width: 160,
      renderCell: (v) =>
        lookupLabel('chi-nhanh', v as string, (row) => row.tenChiNhanh),
    },
    {
      key: 'khoXac',
      header: 'Kho xác',
      width: 90,
      renderCell: (v) => (v ? 'Có' : 'Không'),
    },
  ],
  fields: [
    { key: 'tenNhaKho', label: 'Tên nhà kho', type: 'text', required: true },
    { key: 'diaChi', label: 'Địa chỉ', type: 'textarea', span: 2 },
    {
      key: 'chiNhanhId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      loadOptions: loadChiNhanhOptions,
    },
    { key: 'khoXac', label: 'Kho xác', type: 'switch' },
  ],
}
