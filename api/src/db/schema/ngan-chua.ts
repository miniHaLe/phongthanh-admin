import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nhaKho } from './nha-kho'

export const nganChua = pgTable('ngan_chua', {
  id: text('id').primaryKey(),
  tenNgan: text('ten_ngan').notNull(),
  nhaKhoId: text('nha_kho_id')
    .notNull()
    .references(() => nhaKho.id),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
