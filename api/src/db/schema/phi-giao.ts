import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const phiGiao = pgTable('phi_giao', {
  id: text('id').primaryKey(),
  // Static appliance ids intentionally differ from CRUD san_pham ids.
  sanPhamId: text('san_pham_id'),
  tenPhi: text('ten_phi').notNull(),
  soTien: integer('so_tien').notNull(),
  loaiPhi: integer('loai_phi').notNull(),
  ghiChu: text('ghi_chu'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
