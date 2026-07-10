import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Nhóm quyền — permission-group lookup. Phase 2 adds real RBAC matrix; this
 * slice only needs the row to exist as a `nguoi_dung.nhom_quyen_id` FK target. */
export const nhomQuyen = pgTable('nhom_quyen', {
  id: text('id').primaryKey(),
  maNhom: text('ma_nhom').notNull(),
  tenNhom: text('ten_nhom').notNull(),
  moTa: text('mo_ta'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
