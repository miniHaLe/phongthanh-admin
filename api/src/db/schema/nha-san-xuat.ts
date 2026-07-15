import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const nhaSanXuat = pgTable('nha_san_xuat', {
  id: text('id').primaryKey(),
  maNSX: text('ma_nsx'),
  tenNSX: text('ten_nsx').notNull(),
  ghiChu: text('ghi_chu'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
