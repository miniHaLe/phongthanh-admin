import { randomBytes } from 'node:crypto'
import { model } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const modelResourceConfig: CrudResourceConfig = {
  table: model,
  idColumn: model.id,
  createdAtColumn: model.createdAt,
  updatedAtColumn: model.updatedAt,
  activeColumn: model.active,
  sortableColumns: { tenModel: model.tenModel, createdAt: model.createdAt },
  filterableColumns: {
    sanPhamId: { column: model.sanPhamId },
    nhaSanXuatId: { column: model.nhaSanXuatId },
    tenModel: { column: model.tenModel },
  },
  searchColumns: [
    model.tenModel,
    model.maModel,
    model.nguoiTao,
    model.ghiChu,
  ],
  notFoundMessage: (id) => `Không tìm thấy model id=${id}`,
  genId: () => `mod-${randomBytes(6).toString('hex')}`,
  stampCreate: (dto, ctx) => ({
    ...dto,
    nguoiTao: ctx.user.tenDangNhap,
  }),
}
