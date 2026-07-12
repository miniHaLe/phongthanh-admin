import { ForbiddenException } from '@nestjs/common'
import { khachHang } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { generateKhachHangId } from './khach-hang.id'

/** Customer query allowlists. Branch ownership remains deliberately absent
 * from client filters and is applied by the shared CRUD scope instead. */
export const khachHangResourceConfig: CrudResourceConfig = {
  table: khachHang,
  idColumn: khachHang.id,
  createdAtColumn: khachHang.createdAt,
  updatedAtColumn: khachHang.updatedAt,
  activeColumn: khachHang.active,
  sortableColumns: {
    tenKH: khachHang.tenKH,
    createdAt: khachHang.createdAt,
    dienThoai: khachHang.dienThoai,
  },
  filterableColumns: {
    tenKH: { column: khachHang.tenKH },
    dienThoai: { column: khachHang.dienThoai },
    email: { column: khachHang.email },
    diaChi: { column: khachHang.diaChi },
    maSoThue: { column: khachHang.maSoThue },
    loaiKhachHangId: {
      column: khachHang.loaiKhachHangId,
      parse: (raw) => Number(raw),
    },
    tinhId: { column: khachHang.tinhId },
    quanId: { column: khachHang.quanId },
    phuongXaId: { column: khachHang.phuongXaId },
    tinhThanhCode: { column: khachHang.tinhThanhCode },
    phuongXaCode: { column: khachHang.phuongXaCode },
    nganHangId: { column: khachHang.nganHangId },
    active: {
      column: khachHang.active,
      parse: (raw) => raw === 'true' || raw === true,
    },
  },
  searchColumns: [
    khachHang.tenKH,
    khachHang.dienThoai,
    khachHang.dienThoai2,
    khachHang.email,
    khachHang.diaChi,
    khachHang.tenDuong,
    khachHang.maSoThue,
    khachHang.soTaiKhoan,
  ],
  branchColumn: khachHang.branchId,
  notFoundMessage: (id) => `Không tìm thấy bản ghi id=${id}`,
  genId: generateKhachHangId,
  stampCreate: (dto, ctx) => {
    const branchId = ctx.user.branchIds[0]
    if (!branchId) {
      throw new ForbiddenException(
        'Tài khoản chưa có chi nhánh chính để tạo khách hàng',
      )
    }
    return { ...dto, branchId, nguoiTao: ctx.user.tenDangNhap }
  },
}
