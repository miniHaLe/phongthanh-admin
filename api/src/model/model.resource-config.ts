import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { model } from '../db/schema'
import { generateCatalogId } from '../shared/catalog-id'

export const modelResourceConfig: CrudResourceConfig = {
  table: model,
  idColumn: model.id,
  createdAtColumn: model.createdAt,
  updatedAtColumn: model.updatedAt,
  activeColumn: model.active,
  sortableColumns: {
    tenModel: model.tenModel,
    createdAt: model.createdAt,
  },
  filterableColumns: {
    tenModel: { column: model.tenModel },
    nhaSanXuatId: { column: model.nhaSanXuatId },
    sanPhamId: { column: model.sanPhamId },
    active: {
      column: model.active,
      parse: (raw) => raw === 'true' || raw === true,
    },
  },
  searchColumns: [model.tenModel, model.ghiChu],
  notFoundMessage: (id) => `Không tìm thấy model id=${id}`,
  genId: () => generateCatalogId('mod'),
}
