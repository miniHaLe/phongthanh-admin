import type { CrudConfig } from '@/types/crud-types'
import type { NhomSanPham } from '@/types/masterdata-types'
import { NHOM_SAN_PHAM_ROWS } from '@/mock/masterdata/nhom-san-pham.mock'
import { apiFor } from '@/api/api-for'

export const nhomSanPhamConfig: CrudConfig<NhomSanPham> = {
  resourceKey: 'nhom-san-pham',
  title: 'Nhóm Sản Phẩm',
  pageSize: 20,
  mockApi: apiFor('nhom-san-pham', NHOM_SAN_PHAM_ROWS),
  bulkDelete: true,
  saveAndNew: true,
  columns: [{ key: 'tenNhomSP', header: 'Tên Nhóm', sortable: true, width: 220 }],
  fields: [{ key: 'tenNhomSP', label: 'Tên Nhóm', type: 'text' }],
  filters: [{ key: 'tenNhomSP', label: 'Tên nhóm sản phẩm', type: 'text' }],
}
