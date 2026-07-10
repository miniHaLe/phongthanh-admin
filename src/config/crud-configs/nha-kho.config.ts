import type { CrudConfig } from '@/types/crud-types'
import type { NhaKho } from '@/types/masterdata-types'
import { nhaKhoApi } from '@/mock/masterdata/nha-kho.mock'
import { CHI_NHANH_ROWS } from '@/mock/masterdata/chi-nhanh.mock'

export const nhaKhoConfig: CrudConfig<NhaKho> = {
  resourceKey: 'nha-kho',
  title: 'Nhà Kho',
  pageSize: 20,
  mockApi: nhaKhoApi,
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
        CHI_NHANH_ROWS.find((r) => r.id === v)?.tenChiNhanh ?? (v as string),
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
      options: CHI_NHANH_ROWS.map((r) => ({
        label: r.tenChiNhanh,
        value: r.id,
      })),
    },
    { key: 'khoXac', label: 'Kho xác', type: 'switch' },
  ],
}
