import { ForbiddenException } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { nguoiDung } from '../db/schema'
import { generateNguoiDungId } from './nguoi-dung.id'
import { toNguoiDungResponse } from './nguoi-dung.response'

const BCRYPT_ROUNDS = 12

export const nguoiDungResourceConfig: CrudResourceConfig = {
  table: nguoiDung,
  idColumn: nguoiDung.id,
  createdAtColumn: nguoiDung.createdAt,
  updatedAtColumn: nguoiDung.updatedAt,
  activeColumn: nguoiDung.active,
  sortableColumns: {
    tenDangNhap: nguoiDung.tenDangNhap,
    hoTen: nguoiDung.hoTen,
  },
  filterableColumns: {
    tenDangNhap: { column: nguoiDung.tenDangNhap },
    hoTen: { column: nguoiDung.hoTen },
    chiNhanhId: { column: nguoiDung.chiNhanhId },
    nhomQuyenId: { column: nguoiDung.nhomQuyenId },
    locked: {
      column: nguoiDung.locked,
      parse: (raw) => raw === 'true' || raw === true,
    },
    active: {
      column: nguoiDung.active,
      parse: (raw) => raw === 'true' || raw === true,
    },
  },
  searchColumns: [
    nguoiDung.tenDangNhap,
    nguoiDung.hoTen,
    nguoiDung.email,
    nguoiDung.dienThoai,
  ],
  notFoundMessage: (id) => `Không tìm thấy người dùng id=${id}`,
  genId: generateNguoiDungId,
  stampCreate: async (dto) => {
    const { password, ...editable } = dto
    return {
      ...editable,
      chiNhanhPhuIds: [],
      superScope: false,
      mustChangePassword: false,
      passwordHash: await bcrypt.hash(password as string, BCRYPT_ROUNDS),
    }
  },
  toResponse: toNguoiDungResponse,
  writeGuard: ({ operation, user }) => {
    if (user.superScope) return
    const action =
      operation === 'create' ? 'tạo' : operation === 'update' ? 'sửa' : 'xóa'
    throw new ForbiddenException(`Chỉ quản trị viên được ${action} người dùng`)
  },
  uniqueViolationMessage: 'Tên đăng nhập đã tồn tại',
}
