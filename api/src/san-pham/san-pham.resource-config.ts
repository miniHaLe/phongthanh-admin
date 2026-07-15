import { randomBytes } from 'node:crypto'
import { sanPham } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const sanPhamResourceConfig: CrudResourceConfig = {
  table: sanPham,
  idColumn: sanPham.id,
  createdAtColumn: sanPham.createdAt,
  updatedAtColumn: sanPham.updatedAt,
  activeColumn: sanPham.active,
  sortableColumns: {
    tenSP: sanPham.tenSP,
    maSP: sanPham.maSP,
    tienKhoan: sanPham.tienKhoan,
  },
  filterableColumns: {
    tenSP: { column: sanPham.tenSP },
    nhomSanPhamId: { column: sanPham.nhomSanPhamId },
  },
  searchColumns: [sanPham.maSP, sanPham.tenSP],
  notFoundMessage: (id) => `Không tìm thấy sản phẩm id=${id}`,
  genId: () => `sp-${randomBytes(6).toString('hex')}`,
}
