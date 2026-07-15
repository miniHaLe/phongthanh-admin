import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { chiNhanh } from './chi-nhanh'

export const loiSuaChua = pgTable('loi_sua_chua', {
  id: text('id').primaryKey(),
  branchId: text('branch_id')
    .notNull()
    .references(() => chiNhanh.id),
  // Static repair-product-group ids intentionally differ from nhom_san_pham.
  nhomSanPhamId: text('nhom_san_pham_id').notNull(),
  tenLoi: text('ten_loi').notNull(),
  tienCong: integer('tien_cong').notNull(),
  tienCongDV: integer('tien_cong_dv').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
