import { BadRequestException } from '@nestjs/common'
import { khachHang } from '../db/schema'
import type { CrudResourceConfig } from '../crud/crud-resource-config'
import { branchIdForTinh } from '../seed/branch-map'
import { generateKhachHangId } from './khach-hang.id'

/**
 * khach-hang allowlists (plan-locked, byte-identical to the requirements):
 * sortable = [tenKH, createdAt, dienThoai]; filterable = [loaiKhachHangId,
 * tinhId, quanId, phuongXaId, active] (branch_id intentionally absent —
 * security gate 2); search columns = [tenKH, dienThoai, dienThoai2, email,
 * diaChi] (mirrors the mock's "any string field contains").
 */
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
    loaiKhachHangId: {
      column: khachHang.loaiKhachHangId,
      parse: (raw) => Number(raw),
    },
    tinhId: { column: khachHang.tinhId },
    quanId: { column: khachHang.quanId },
    phuongXaId: { column: khachHang.phuongXaId },
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
  ],
  branchColumn: khachHang.branchId,
  notFoundMessage: (id) => `Không tìm thấy bản ghi id=${id}`,
  genId: generateKhachHangId,
  // Server owns branch_id (derived from tinhId, D4) + nguoiTao (from the
  // JWT's `tenDangNhap` — the token doesn't carry `hoTen`, and adding a DB
  // round-trip here to fetch it would be a second query per create for a
  // display-only audit field; tenDangNhap is stable/unique and sufficient).
  stampCreate: (dto, ctx) => {
    // Client-supplied tinhId → branch. An unmapped/missing tinhId is bad client
    // input (400 VI), not a server fault (500) — branchIdForTinh throws a plain
    // Error for the seeder's fixture-integrity use; translate it at the edge.
    let branchId: string
    try {
      branchId = branchIdForTinh(dto.tinhId as string | undefined)
    } catch {
      throw new BadRequestException(
        `Tỉnh không hợp lệ hoặc chưa gán chi nhánh: "${dto.tinhId ?? ''}"`,
      )
    }
    return { ...dto, branchId, nguoiTao: ctx.user.tenDangNhap }
  },
}
