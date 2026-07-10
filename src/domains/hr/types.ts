/**
 * HR entity types for the 4 previously-missing CRUD pages (Ngân Hàng, Phụ
 * Cấp, Loại Phạt Thưởng, Ứng Lương). Kept out of masterdata-types.ts to avoid
 * touching the file another workstream re-models concurrently.
 */
import type { BaseEntity } from '@/mock/seed'

export type { BaseEntity }

export interface NganHang extends BaseEntity {
  maNganHang: string
  tenNganHang: string
  diaChi?: string
}

export type LoaiPhuCap = 'Ăn Chia' | 'Tiền mặt'

export interface PhuCap extends BaseEntity {
  tenPhuCap: string
  loaiPhuCap: LoaiPhuCap
  giaTri: number
}

export type LoaiThuongPhat = 'Thưởng' | 'Phạt'

export interface LoaiPhatThuong extends BaseEntity {
  loai: LoaiThuongPhat
  tenLoai: string
}

export interface UngLuong extends BaseEntity {
  nhanVienId: string
  kyId: string
  ngayUng: string // ISO
  soTien: number
  ghiChu?: string
}

/**
 * Bảng lương (payroll) record for one employee in one Kỳ. Component columns
 * are set directly by the seed; `Tổng lương`/`Thực lãnh` are derived by
 * simple addition (see `bang-luong.mock.ts` `tongLuong`/`thucLanh`) — no
 * derivation engine, since the real payroll formula is unspecified.
 */
export interface BangLuong extends BaseEntity {
  nhanVienId: string
  kyId: string
  luongCung: number
  baoHiem: number
  phuCap: number
  tangCa: number
  nghi: number
  ungLuong: number
  thuong: number
  phat: number
  congBH: number
  congSC: number
}

/**
 * Chấm công exception record — a live, mutable CRUD entity backed by (but
 * distinct from) the read-only `CHAM_CONG` fixture in `@/mock/seed/cham-cong`
 * (P1). This adds `active` so it satisfies `BaseEntity` for `makeMockApi`.
 */
export interface ChamCongRecord extends BaseEntity {
  nhanVienId: string
  ngayCham: string // ISO
  kyId: string
  /** 1=Nghỉ, 2=Nghỉ nữa ngày, 3=Đi trễ, 4=Tăng ca, 5=Về sớm (LOAI_CHAM). */
  loaiCham: number
  soLuong: number
  donVi: 'ngày' | 'giờ'
  /** 1=Trừ tiền, 2=Trừ ngày công (LOAI_TRU). */
  loaiTru: number
}
