import { ForbiddenException } from '@nestjs/common'
import { randomBytes } from 'node:crypto'
import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { nhomQuyen } from '../db/schema'

export const nhomQuyenResourceConfig: CrudResourceConfig = {
  table: nhomQuyen,
  idColumn: nhomQuyen.id,
  createdAtColumn: nhomQuyen.createdAt,
  updatedAtColumn: nhomQuyen.updatedAt,
  activeColumn: nhomQuyen.active,
  sortableColumns: {
    maNhom: nhomQuyen.maNhom,
    tenNhom: nhomQuyen.tenNhom,
  },
  filterableColumns: {
    active: {
      column: nhomQuyen.active,
      valueType: 'boolean',
    },
  },
  searchColumns: [nhomQuyen.maNhom, nhomQuyen.tenNhom, nhomQuyen.moTa],
  notFoundMessage: (id) => `Không tìm thấy nhóm quyền id=${id}`,
  genId: () => `nq-${randomBytes(6).toString('hex')}`,
  writeGuard: () => {
    throw new ForbiddenException('Chưa cho phép thay đổi nhóm quyền')
  },
}
