import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { sanPham } from '../db/schema'
import { generateCatalogId } from '../shared/catalog-id'

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
    createdAt: sanPham.createdAt,
  },
  filterableColumns: {
    tenSP: { column: sanPham.tenSP },
    nhomSanPhamId: { column: sanPham.nhomSanPhamId },
    active: {
      column: sanPham.active,
      parse: (raw) => raw === 'true' || raw === true,
    },
  },
  searchColumns: [sanPham.tenSP, sanPham.maSP],
  notFoundMessage: (id) => `Không tìm thấy sản phẩm id=${id}`,
  genId: () => generateCatalogId('sp'),
}
