import { randomBytes } from 'node:crypto'
import { hangHoa } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'

export const hangHoaResourceConfig: CrudResourceConfig = {
  table: hangHoa,
  idColumn: hangHoa.id,
  createdAtColumn: hangHoa.createdAt,
  updatedAtColumn: hangHoa.updatedAt,
  activeColumn: hangHoa.active,
  sortableColumns: {
    maHH: hangHoa.maHH,
    tenHH: hangHoa.tenHH,
    createdAt: hangHoa.createdAt,
  },
  filterableColumns: {
    nhomHangHoaId: { column: hangHoa.nhomHangHoaId },
    nhaSanXuatId: { column: hangHoa.nhaSanXuatId },
    maHH: { column: hangHoa.maHH },
    tenHH: { column: hangHoa.tenHH },
    modelId: { column: hangHoa.modelId },
  },
  searchColumns: [
    hangHoa.maHH,
    hangHoa.maHHPhu,
    hangHoa.tenHH,
    hangHoa.tenTiengAnh,
    hangHoa.modelDungChungText,
    hangHoa.viTriLinhKien,
    hangHoa.nguoiTao,
  ],
  notFoundMessage: (id) => `Không tìm thấy hàng hóa id=${id}`,
  genId: () => `hh-${randomBytes(6).toString('hex')}`,
  stampCreate: (dto, ctx) => ({
    ...dto,
    nguoiTao: ctx.user.tenDangNhap,
  }),
}
