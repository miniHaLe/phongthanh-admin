import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const nhomSanPham = pgTable('nhom_san_pham', {
  id: text('id').primaryKey(),
  tenNhomSP: text('ten_nhom_sp').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
