import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Global internal news posts. The author is stamped from the access JWT. */
export const tinTuc = pgTable('tin_tuc', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  author: text('author').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
