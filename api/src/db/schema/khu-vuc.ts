import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { quan, tinh, xa } from './dia-ly'

export const khuVuc = pgTable('khu_vuc', {
  id: text('id').primaryKey(),
  tenKhuVuc: text('ten_khu_vuc').notNull(),
  tinhId: text('tinh_id')
    .notNull()
    .references(() => tinh.id),
  quanId: text('quan_id')
    .notNull()
    .references(() => quan.id),
  xaId: text('xa_id')
    .notNull()
    .references(() => xa.id),
  caySo: integer('cay_so').notNull(),
  tienCong: integer('tien_cong').notNull(),
  tienCong2: integer('tien_cong_2').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
