import { randomBytes } from 'node:crypto'
import { nhaSanXuat } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const nhaSanXuatResourceConfig: CrudResourceConfig = {
  table: nhaSanXuat,
  idColumn: nhaSanXuat.id,
  createdAtColumn: nhaSanXuat.createdAt,
  updatedAtColumn: nhaSanXuat.updatedAt,
  activeColumn: nhaSanXuat.active,
  sortableColumns: { maNSX: nhaSanXuat.maNSX, tenNSX: nhaSanXuat.tenNSX },
  filterableColumns: { tenNSX: { column: nhaSanXuat.tenNSX } },
  searchColumns: [nhaSanXuat.maNSX, nhaSanXuat.tenNSX, nhaSanXuat.ghiChu],
  notFoundMessage: (id) => `Không tìm thấy nhà sản xuất id=${id}`,
  genId: () => `nsx-${randomBytes(6).toString('hex')}`,
}
