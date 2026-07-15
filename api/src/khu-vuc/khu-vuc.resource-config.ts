import { randomBytes } from 'node:crypto'
import { khuVuc } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const khuVucResourceConfig: CrudResourceConfig = {
  table: khuVuc,
  idColumn: khuVuc.id,
  createdAtColumn: khuVuc.createdAt,
  updatedAtColumn: khuVuc.updatedAt,
  activeColumn: khuVuc.active,
  sortableColumns: {
    tenKhuVuc: khuVuc.tenKhuVuc,
    caySo: khuVuc.caySo,
    tienCong: khuVuc.tienCong,
    tienCong2: khuVuc.tienCong2,
  },
  filterableColumns: {
    tenKhuVuc: { column: khuVuc.tenKhuVuc },
    tinhId: { column: khuVuc.tinhId },
    quanId: { column: khuVuc.quanId },
  },
  searchColumns: [khuVuc.tenKhuVuc],
  notFoundMessage: (id) => `Không tìm thấy khu vực id=${id}`,
  genId: () => `kv-${randomBytes(6).toString('hex')}`,
}
