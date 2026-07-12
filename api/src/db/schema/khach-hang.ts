import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { chiNhanh } from './chi-nhanh'
import { nganHang } from './danh-muc-thiet-bi'
import { loaiKhachHang } from './loai-khach-hang'
import { phuongXa, quan, tinh, tinhThanh, xa } from './dia-ly'

/** Customer records keep legacy address references while new writes use the
 * official two-level province/commune codes. Branch ownership is server-owned
 * and never client-filterable. */
export const khachHang = pgTable(
  'khach_hang',
  {
    id: text('id').primaryKey(),
    tenKH: text('ten_kh').notNull(),
    dienThoai: text('dien_thoai').notNull(),
    dienThoai2: text('dien_thoai_2'),
    diaChi: text('dia_chi'),
    tenDuong: text('ten_duong'),
    tinhThanhCode: text('tinh_thanh_code').references(() => tinhThanh.code),
    phuongXaCode: text('phuong_xa_code').references(() => phuongXa.code),
    maSoThue: text('ma_so_thue'),
    nganHangId: text('ngan_hang_id').references(() => nganHang.id),
    soTaiKhoan: text('so_tai_khoan'),
    /** Legacy address columns retained for compatibility and rollback safety. */
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
    /** Branch scope is server-owned and comes from the JWT primary branch. */
    branchId: text('branch_id')
      .notNull()
      .references(() => chiNhanh.id),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => [
    index('khach_hang_tinh_thanh_code_idx').on(table.tinhThanhCode),
    index('khach_hang_phuong_xa_code_idx').on(table.phuongXaCode),
    index('khach_hang_ngan_hang_id_idx').on(table.nganHangId),
    foreignKey({
      name: 'khach_hang_tinh_thanh_phuong_xa_fk',
      columns: [table.tinhThanhCode, table.phuongXaCode],
      foreignColumns: [phuongXa.provinceCode, phuongXa.code],
    }),
    check(
      'khach_hang_location_pair_check',
      sql`(${table.tinhThanhCode} IS NULL AND ${table.phuongXaCode} IS NULL) OR (${table.tinhThanhCode} IS NOT NULL AND ${table.phuongXaCode} IS NOT NULL)`,
    ),
    check(
      'khach_hang_ma_so_thue_check',
      sql`${table.maSoThue} IS NULL OR ${table.maSoThue} = '' OR ${table.maSoThue} ~ '^[0-9]{10}(-[0-9]{3})?$'`,
    ),
  ],
)
