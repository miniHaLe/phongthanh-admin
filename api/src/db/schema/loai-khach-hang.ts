import { integer, pgTable, text } from 'drizzle-orm/pg-core'

/** Nhóm khách hàng (1-9) — reference lookup, frozen fixture. */
export const loaiKhachHang = pgTable('loai_khach_hang', {
  id: integer('id').primaryKey(),
  ten: text('ten').notNull(),
})
