import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nhaSanXuat } from './nha-san-xuat'
import { sanPham } from './san-pham'

export const model = pgTable('model', {
  id: text('id').primaryKey(),
  tenModel: text('ten_model').notNull(),
  maModel: text('ma_model'),
  nhaSanXuatId: text('nha_san_xuat_id')
    .notNull()
    .references(() => nhaSanXuat.id),
  sanPhamId: text('san_pham_id')
    .notNull()
    .references(() => sanPham.id),
  nguoiTao: text('nguoi_tao').notNull(),
  ghiChu: text('ghi_chu'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
