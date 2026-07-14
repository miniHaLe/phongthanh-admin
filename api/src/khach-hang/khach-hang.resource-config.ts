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
    tenKH: { column: khachHang.tenKH, valueType: 'string' },
    dienThoai: { column: khachHang.dienThoai, valueType: 'string' },
    email: { column: khachHang.email, valueType: 'string' },
    diaChi: { column: khachHang.diaChi, valueType: 'string' },
    maSoThue: { column: khachHang.maSoThue, valueType: 'string' },
    loaiKhachHangId: {
      column: khachHang.loaiKhachHangId,
      valueType: 'number',
    },
    tinhId: { column: khachHang.tinhId, valueType: 'string' },
    quanId: { column: khachHang.quanId, valueType: 'string' },
    phuongXaId: { column: khachHang.phuongXaId, valueType: 'string' },
    tinhThanhCode: {
      column: khachHang.tinhThanhCode,
      valueType: 'string',
    },
    phuongXaCode: {
      column: khachHang.phuongXaCode,
      valueType: 'string',
    },
    nganHangId: { column: khachHang.nganHangId, valueType: 'string' },
    active: {
      column: khachHang.active,
      valueType: 'boolean',
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
