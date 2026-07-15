import { randomBytes } from 'node:crypto'
import { nhomHangHoa } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const nhomHangHoaResourceConfig: CrudResourceConfig = {
  table: nhomHangHoa,
  idColumn: nhomHangHoa.id,
  createdAtColumn: nhomHangHoa.createdAt,
  updatedAtColumn: nhomHangHoa.updatedAt,
  activeColumn: nhomHangHoa.active,
  sortableColumns: {
    maNhom: nhomHangHoa.maNhom,
    tenNhom: nhomHangHoa.tenNhom,
  },
  filterableColumns: { tenNhom: { column: nhomHangHoa.tenNhom } },
  searchColumns: [nhomHangHoa.maNhom, nhomHangHoa.tenNhom],
  notFoundMessage: (id) => `Không tìm thấy nhóm hàng hóa id=${id}`,
  genId: () => `nhh-${randomBytes(6).toString('hex')}`,
}
