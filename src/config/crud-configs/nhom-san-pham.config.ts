import type { CrudConfig } from '@/types/crud-types'
import type { NhomSanPham } from '@/types/masterdata-types'
import { nhomSanPhamApi } from '@/mock/masterdata/nhom-san-pham.mock'

export const nhomSanPhamConfig: CrudConfig<NhomSanPham> = {
  resourceKey: 'nhom-san-pham',
  title: 'Nhóm Sản Phẩm',
  pageSize: 20,
  mockApi: nhomSanPhamApi,
  bulkDelete: true,
  saveAndNew: true,
  columns: [{ key: 'tenNhomSP', header: 'Tên Nhóm', sortable: true, width: 220 }],
  fields: [{ key: 'tenNhomSP', label: 'Tên Nhóm', type: 'text' }],
  filters: [{ key: 'tenNhomSP', label: 'Tên nhóm sản phẩm', type: 'text' }],
}
