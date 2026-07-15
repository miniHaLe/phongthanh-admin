import { randomBytes } from 'node:crypto'
import { nhaKho } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const nhaKhoResourceConfig: CrudResourceConfig = {
  table: nhaKho,
  idColumn: nhaKho.id,
  createdAtColumn: nhaKho.createdAt,
  updatedAtColumn: nhaKho.updatedAt,
  activeColumn: nhaKho.active,
  sortableColumns: { tenNhaKho: nhaKho.tenNhaKho },
  filterableColumns: {},
  searchColumns: [nhaKho.maNhaKho, nhaKho.tenNhaKho, nhaKho.diaChi],
  notFoundMessage: (id) => `Không tìm thấy nhà kho id=${id}`,
  genId: () => `nk-${randomBytes(6).toString('hex')}`,
  stampCreate: (dto) => ({
    ...dto,
    maNhaKho:
      (dto.maNhaKho as string | undefined) ??
      `NK${randomBytes(4).toString('hex').toUpperCase()}`,
  }),
}
