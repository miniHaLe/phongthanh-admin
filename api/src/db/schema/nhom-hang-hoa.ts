import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const nhomHangHoa = pgTable('nhom_hang_hoa', {
  id: text('id').primaryKey(),
  maNhom: text('ma_nhom'),
  tenNhom: text('ten_nhom').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
