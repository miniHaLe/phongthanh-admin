import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { tinTuc } from '../db/schema'
import { generateCatalogId } from '../shared/catalog-id'

export const tinTucResourceConfig: CrudResourceConfig = {
  table: tinTuc,
  idColumn: tinTuc.id,
  createdAtColumn: tinTuc.createdAt,
  updatedAtColumn: tinTuc.updatedAt,
  activeColumn: tinTuc.active,
  sortableColumns: {
    title: tinTuc.title,
    author: tinTuc.author,
    createdAt: tinTuc.createdAt,
    active: tinTuc.active,
  },
  filterableColumns: {
    title: { column: tinTuc.title },
    author: { column: tinTuc.author },
    active: { column: tinTuc.active, valueType: 'boolean' },
  },
  searchColumns: [tinTuc.title, tinTuc.body, tinTuc.author],
  notFoundMessage: (id) => `Không tìm thấy tin tức id=${id}`,
  genId: () => generateCatalogId('tin'),
  stampCreate: (dto, ctx) => ({
    ...dto,
    author: ctx.user.tenDangNhap,
  }),
}
