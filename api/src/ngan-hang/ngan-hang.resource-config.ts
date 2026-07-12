import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { nganHang } from '../db/schema'
import { generateCatalogId } from '../shared/catalog-id'

export const nganHangResourceConfig: CrudResourceConfig = {
  table: nganHang,
  idColumn: nganHang.id,
  createdAtColumn: nganHang.createdAt,
  updatedAtColumn: nganHang.updatedAt,
  activeColumn: nganHang.active,
  sortableColumns: {
    tenNganHang: nganHang.tenNganHang,
    maNganHang: nganHang.maNganHang,
    createdAt: nganHang.createdAt,
  },
  filterableColumns: {
    tenNganHang: { column: nganHang.tenNganHang },
    active: {
      column: nganHang.active,
      parse: (raw) => raw === 'true' || raw === true,
    },
  },
  searchColumns: [nganHang.tenNganHang, nganHang.maNganHang, nganHang.diaChi],
  notFoundMessage: (id) => `Không tìm thấy ngân hàng id=${id}`,
  genId: () => generateCatalogId('ngh'),
}
