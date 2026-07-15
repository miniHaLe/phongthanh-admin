import { randomBytes } from 'node:crypto'
import { phuongXaLegacy } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const phuongXaResourceConfig: CrudResourceConfig = {
  table: phuongXaLegacy,
  idColumn: phuongXaLegacy.id,
  createdAtColumn: phuongXaLegacy.createdAt,
  updatedAtColumn: phuongXaLegacy.updatedAt,
  activeColumn: phuongXaLegacy.active,
  sortableColumns: {
    tenPhuongXa: phuongXaLegacy.tenPhuongXa,
    khoangCach: phuongXaLegacy.khoangCach,
    tienCong: phuongXaLegacy.tienCong,
  },
  filterableColumns: {
    tinhId: { column: phuongXaLegacy.tinhId },
    quanId: { column: phuongXaLegacy.quanId },
    tenPhuongXa: { column: phuongXaLegacy.tenPhuongXa },
    tuyenId: { column: phuongXaLegacy.tuyenId },
  },
  searchColumns: [phuongXaLegacy.tenPhuongXa],
  notFoundMessage: (id) => `Không tìm thấy phường/xã id=${id}`,
  genId: () => `px-${randomBytes(6).toString('hex')}`,
}
