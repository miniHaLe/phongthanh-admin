import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { donViTinh } from './don-vi-tinh'
import { model } from './model'
import { nhaSanXuat } from './nha-san-xuat'
import { nhomHangHoa } from './nhom-hang-hoa'

export const hangHoa = pgTable('hang_hoa', {
  id: text('id').primaryKey(),
  maHH: text('ma_hh').notNull(),
  maHHPhu: text('ma_hh_phu'),
  tenHH: text('ten_hh').notNull(),
  tenTiengAnh: text('ten_tieng_anh'),
  nhomHangHoaId: text('nhom_hang_hoa_id')
    .notNull()
    .references(() => nhomHangHoa.id),
  nhaSanXuatId: text('nha_san_xuat_id').references(() => nhaSanXuat.id),
  modelId: text('model_id').references(() => model.id),
  modelDungChung: boolean('model_dung_chung').notNull().default(false),
  modelDungChungText: text('model_dung_chung_text'),
  donViTinhId: text('don_vi_tinh_id')
    .notNull()
    .references(() => donViTinh.id),
  coSerial: boolean('co_serial').notNull().default(false),
  phatSinhTuDong: boolean('phat_sinh_tu_dong').notNull().default(false),
  viTriLinhKien: text('vi_tri_linh_kien'),
  hinh: text('hinh'),
  giaMua: bigint('gia_mua', { mode: 'number' }),
  giaBanSi: bigint('gia_ban_si', { mode: 'number' }),
  giaBanLe: bigint('gia_ban_le', { mode: 'number' }),
  nguoiTao: text('nguoi_tao').notNull(),
  giaNhap: bigint('gia_nhap', { mode: 'number' }),
  giaBan: bigint('gia_ban', { mode: 'number' }),
  // Seeded mock stock remains a compatibility field until the real ledger lands.
  tonKho: integer('ton_kho').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
