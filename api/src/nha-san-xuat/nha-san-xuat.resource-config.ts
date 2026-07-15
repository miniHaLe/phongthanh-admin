import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { nhaSanXuat } from '../db/schema'
import { generateCatalogId } from '../shared/catalog-id'

export const nhaSanXuatResourceConfig: CrudResourceConfig = {
  table: nhaSanXuat,
  idColumn: nhaSanXuat.id,
  createdAtColumn: nhaSanXuat.createdAt,
  updatedAtColumn: nhaSanXuat.updatedAt,
  activeColumn: nhaSanXuat.active,
  sortableColumns: {
    tenNSX: nhaSanXuat.tenNSX,
    maNSX: nhaSanXuat.maNSX,
    createdAt: nhaSanXuat.createdAt,
  },
  filterableColumns: {
    tenNSX: { column: nhaSanXuat.tenNSX, valueType: 'string' },
    active: {
      column: nhaSanXuat.active,
      valueType: 'boolean',
    },
  },
  searchColumns: [nhaSanXuat.tenNSX, nhaSanXuat.maNSX, nhaSanXuat.ghiChu],
  notFoundMessage: (id) => `Không tìm thấy nhà sản xuất id=${id}`,
  genId: () => generateCatalogId('nsx'),
}
