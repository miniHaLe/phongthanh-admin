import { bigint, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nhomSanPham } from './nhom-san-pham'

export const sanPham = pgTable('san_pham', {
  id: text('id').primaryKey(),
  maSP: text('ma_sp'),
  tenSP: text('ten_sp').notNull(),
  nhomSanPhamId: text('nhom_san_pham_id')
    .notNull()
    .references(() => nhomSanPham.id),
  // Values remain JSON numbers during this migration window (all are < 2^53).
  tienKhoan: bigint('tien_khoan', { mode: 'number' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
