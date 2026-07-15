import { randomBytes } from 'node:crypto'
import { donViTinh } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const donViTinhResourceConfig: CrudResourceConfig = {
  table: donViTinh,
  idColumn: donViTinh.id,
  createdAtColumn: donViTinh.createdAt,
  updatedAtColumn: donViTinh.updatedAt,
  activeColumn: donViTinh.active,
  sortableColumns: { tenDVT: donViTinh.tenDVT },
  filterableColumns: { tenDVT: { column: donViTinh.tenDVT } },
  searchColumns: [donViTinh.tenDVT],
  notFoundMessage: (id) => `Không tìm thấy đơn vị tính id=${id}`,
  genId: () => `dvt-${randomBytes(6).toString('hex')}`,
}
