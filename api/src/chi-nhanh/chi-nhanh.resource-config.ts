import { randomBytes } from 'node:crypto'
import { chiNhanh } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const chiNhanhResourceConfig: CrudResourceConfig = {
  table: chiNhanh,
  idColumn: chiNhanh.id,
  createdAtColumn: chiNhanh.createdAt,
  updatedAtColumn: chiNhanh.updatedAt,
  activeColumn: chiNhanh.active,
  sortableColumns: { tenChiNhanh: chiNhanh.tenChiNhanh },
  filterableColumns: { tenChiNhanh: { column: chiNhanh.tenChiNhanh } },
  searchColumns: [
    chiNhanh.tenChiNhanh,
    chiNhanh.soDienThoai,
    chiNhanh.hotline,
    chiNhanh.nguoiLienHe,
    chiNhanh.email,
    chiNhanh.diaChi,
    chiNhanh.toaDo,
  ],
  notFoundMessage: (id) => `Không tìm thấy chi nhánh id=${id}`,
  genId: () => `cn-${randomBytes(6).toString('hex')}`,
}
