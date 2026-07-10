import type { CrudConfig } from '@/types/crud-types'
import type { NhaSanXuat } from '@/types/masterdata-types'
import { nhaSanXuatApi } from '@/mock/masterdata/nha-san-xuat.mock'

export const nhaSanXuatConfig: CrudConfig<NhaSanXuat> = {
  resourceKey: 'nha-san-xuat',
  title: 'Nhà Sản Xuất',
  pageSize: 20,
  defaultSort: { key: 'tenNSX', dir: 'asc' },
  mockApi: nhaSanXuatApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maNSX', header: 'Mã nhà sản xuất', sortable: true, width: 130 },
    { key: 'tenNSX', header: 'Tên nhà sản xuất', sortable: true, width: 200 },
    { key: 'ghiChu', header: 'Ghi chú', width: 220 },
  ],
  fields: [
    { key: 'maNSX', label: 'Mã nhà sản xuất', type: 'text' },
    { key: 'tenNSX', label: 'Tên nhà sản xuất', type: 'text', required: true },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', span: 2 },
  ],
  filters: [{ key: 'tenNSX', label: 'Tên nhà sản xuất', type: 'text' }],
}
