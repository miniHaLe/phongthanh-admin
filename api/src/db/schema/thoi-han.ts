import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const thoiHanLoai = pgEnum('thoi_han_loai', ['Tháng', 'Năm'])

export const thoiHan = pgTable('thoi_han', {
  id: text('id').primaryKey(),
  ten: text('ten').notNull(),
  loai: thoiHanLoai('loai').notNull(),
  thoiGian: integer('thoi_gian').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
