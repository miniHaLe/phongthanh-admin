import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { chiNhanh } from './chi-nhanh'

export const nhaKho = pgTable('nha_kho', {
  id: text('id').primaryKey(),
  maNhaKho: text('ma_nha_kho').notNull(),
  tenNhaKho: text('ten_nha_kho').notNull(),
  chiNhanhId: text('chi_nhanh_id')
    .notNull()
    .references(() => chiNhanh.id),
  diaChi: text('dia_chi'),
  khoXac: boolean('kho_xac').notNull().default(false),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
