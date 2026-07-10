import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { chiNhanh } from './chi-nhanh'
import { loaiKhachHang } from './loai-khach-hang'
import { quan, tinh, xa } from './dia-ly'

/** Khách hàng — the Phase 1 vertical-slice entity. `branchId` is derived at
 * seed time from `tinhId` (D4 reconciliation), NOT present in the source
 * fixture; it is never client-filterable (security gate 2). */
export const khachHang = pgTable('khach_hang', {
  id: text('id').primaryKey(),
  tenKH: text('ten_kh').notNull(),
  dienThoai: text('dien_thoai').notNull(),
  dienThoai2: text('dien_thoai_2'),
  diaChi: text('dia_chi'),
  phuongXaId: text('phuong_xa_id').references(() => xa.id),
  quanId: text('quan_id').references(() => quan.id),
  tinhId: text('tinh_id').references(() => tinh.id),
  email: text('email'),
  loaiKhachHangId: integer('loai_khach_hang_id')
    .notNull()
    .references(() => loaiKhachHang.id),
  /** Self-FK: đại lý/trạm cha. */
  daiLyId: text('dai_ly_id').references((): AnyPgColumn => khachHang.id),
  nguoiTao: text('nguoi_tao').notNull(),
  ghiChu: text('ghi_chu'),
  /** Branch scope — derived at seed from tinhId, server-owned, never
   * client-filterable or client-writable. */
  branchId: text('branch_id')
    .notNull()
    .references(() => chiNhanh.id),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
