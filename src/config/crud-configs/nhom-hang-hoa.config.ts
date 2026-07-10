import type { CrudConfig } from '@/types/crud-types'
import type { NhomHangHoa } from '@/types/masterdata-types'
import { nhomHangHoaApi } from '@/mock/masterdata/nhom-hang-hoa.mock'

export const nhomHangHoaConfig: CrudConfig<NhomHangHoa> = {
  resourceKey: 'nhom-hang-hoa',
  title: 'Nhóm Hàng Hóa',
  pageSize: 20,
  mockApi: nhomHangHoaApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [
    { key: 'maNhom', header: 'Mã nhóm hàng hóa', sortable: true, width: 140 },
    { key: 'tenNhom', header: 'Tên nhóm hàng hóa', sortable: true, width: 240 },
  ],
  fields: [
    { key: 'maNhom', label: 'Mã nhóm hàng hóa', type: 'text' },
    { key: 'tenNhom', label: 'Tên nhóm hàng hóa', type: 'text', required: true },
  ],
  filters: [{ key: 'tenNhom', label: 'Tên nhóm hàng hóa', type: 'text' }],
}
