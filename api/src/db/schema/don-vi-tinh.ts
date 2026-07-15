import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const donViTinh = pgTable('don_vi_tinh', {
  id: text('id').primaryKey(),
  tenDVT: text('ten_dvt').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
