import { randomBytes } from 'node:crypto'
import { phuongXa } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const phuongXaResourceConfig: CrudResourceConfig = {
  table: phuongXa,
  idColumn: phuongXa.id,
  createdAtColumn: phuongXa.createdAt,
  updatedAtColumn: phuongXa.updatedAt,
  activeColumn: phuongXa.active,
  sortableColumns: {
    tenPhuongXa: phuongXa.tenPhuongXa,
    khoangCach: phuongXa.khoangCach,
    tienCong: phuongXa.tienCong,
  },
  filterableColumns: {
    tinhId: { column: phuongXa.tinhId },
    quanId: { column: phuongXa.quanId },
    tenPhuongXa: { column: phuongXa.tenPhuongXa },
    tuyenId: { column: phuongXa.tuyenId },
  },
  searchColumns: [phuongXa.tenPhuongXa],
  notFoundMessage: (id) => `Không tìm thấy phường/xã id=${id}`,
  genId: () => `px-${randomBytes(6).toString('hex')}`,
}
