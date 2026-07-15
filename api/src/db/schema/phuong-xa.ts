import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { quan, tinh } from './dia-ly'

// Legacy repair-routing catalog. Official 2025 geography owns `phuong_xa`.
export const phuongXaLegacy = pgTable('phuong_xa_legacy', {
  id: text('id').primaryKey(),
  tenPhuongXa: text('ten_phuong_xa').notNull(),
  tinhId: text('tinh_id')
    .notNull()
    .references(() => tinh.id),
  quanId: text('quan_id')
    .notNull()
    .references(() => quan.id),
  khoangCach: integer('khoang_cach').notNull(),
  tienCong: integer('tien_cong').notNull(),
  // Route ids use the static TUYEN namespace, not khu_vuc ids.
  tuyenId: text('tuyen_id'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
