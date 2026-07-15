import { randomBytes } from 'node:crypto'
import { loiSuaChua } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const loiSuaChuaResourceConfig: CrudResourceConfig = {
  table: loiSuaChua,
  idColumn: loiSuaChua.id,
  createdAtColumn: loiSuaChua.createdAt,
  updatedAtColumn: loiSuaChua.updatedAt,
  activeColumn: loiSuaChua.active,
  sortableColumns: {
    tenLoi: loiSuaChua.tenLoi,
    tienCong: loiSuaChua.tienCong,
    tienCongDV: loiSuaChua.tienCongDV,
  },
  filterableColumns: {
    branchId: { column: loiSuaChua.branchId },
    tenLoi: { column: loiSuaChua.tenLoi },
    nhomSanPhamId: { column: loiSuaChua.nhomSanPhamId },
  },
  searchColumns: [loiSuaChua.tenLoi],
  notFoundMessage: (id) => `Không tìm thấy lỗi sửa chữa id=${id}`,
  genId: () => `lsc-${randomBytes(6).toString('hex')}`,
}
