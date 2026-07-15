import { randomBytes } from 'node:crypto'
import { phiGiao } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const phiGiaoResourceConfig: CrudResourceConfig = {
  table: phiGiao,
  idColumn: phiGiao.id,
  createdAtColumn: phiGiao.createdAt,
  updatedAtColumn: phiGiao.updatedAt,
  activeColumn: phiGiao.active,
  sortableColumns: { tenPhi: phiGiao.tenPhi, soTien: phiGiao.soTien },
  filterableColumns: {
    tenPhi: { column: phiGiao.tenPhi },
    sanPhamId: { column: phiGiao.sanPhamId },
  },
  searchColumns: [phiGiao.tenPhi, phiGiao.ghiChu],
  notFoundMessage: (id) => `Không tìm thấy phí giao id=${id}`,
  genId: () => `pg-${randomBytes(6).toString('hex')}`,
}
