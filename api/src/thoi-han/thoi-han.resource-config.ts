import { randomBytes } from 'node:crypto'
import { thoiHan } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const thoiHanResourceConfig: CrudResourceConfig = {
  table: thoiHan,
  idColumn: thoiHan.id,
  createdAtColumn: thoiHan.createdAt,
  updatedAtColumn: thoiHan.updatedAt,
  activeColumn: thoiHan.active,
  sortableColumns: { ten: thoiHan.ten, thoiGian: thoiHan.thoiGian },
  filterableColumns: { ten: { column: thoiHan.ten } },
  searchColumns: [thoiHan.ten],
  notFoundMessage: (id) => `Không tìm thấy thời hạn id=${id}`,
  genId: () => `th-${randomBytes(6).toString('hex')}`,
}
