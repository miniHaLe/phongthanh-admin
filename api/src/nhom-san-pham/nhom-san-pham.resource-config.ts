import { randomBytes } from 'node:crypto'
import { nhomSanPham } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const nhomSanPhamResourceConfig: CrudResourceConfig = {
  table: nhomSanPham,
  idColumn: nhomSanPham.id,
  createdAtColumn: nhomSanPham.createdAt,
  updatedAtColumn: nhomSanPham.updatedAt,
  activeColumn: nhomSanPham.active,
  sortableColumns: { tenNhomSP: nhomSanPham.tenNhomSP },
  filterableColumns: { tenNhomSP: { column: nhomSanPham.tenNhomSP } },
  searchColumns: [nhomSanPham.tenNhomSP],
  notFoundMessage: (id) => `Không tìm thấy nhóm sản phẩm id=${id}`,
  genId: () => `nhomsp-${randomBytes(6).toString('hex')}`,
}
