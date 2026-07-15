import { randomBytes } from 'node:crypto'
import { nganChua } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const nganChuaResourceConfig: CrudResourceConfig = {
  table: nganChua,
  idColumn: nganChua.id,
  createdAtColumn: nganChua.createdAt,
  updatedAtColumn: nganChua.updatedAt,
  activeColumn: nganChua.active,
  sortableColumns: { tenNgan: nganChua.tenNgan },
  filterableColumns: {
    nhaKhoId: { column: nganChua.nhaKhoId },
    tenNgan: { column: nganChua.tenNgan },
  },
  searchColumns: [nganChua.tenNgan],
  notFoundMessage: (id) => `Không tìm thấy ngăn chứa id=${id}`,
  genId: () => `ngc-${randomBytes(6).toString('hex')}`,
}
