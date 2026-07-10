import { integer, pgTable, text } from 'drizzle-orm/pg-core'

/** Tỉnh — reference lookup, frozen fixture (2 rows: Đắk Lắk, Đắk Nông). */
export const tinh = pgTable('tinh', {
  id: text('id').primaryKey(),
  ten: text('ten').notNull(),
})

/** Quận/Huyện — references tỉnh. */
export const quan = pgTable('quan', {
  id: text('id').primaryKey(),
  ten: text('ten').notNull(),
  tinhId: text('tinh_id')
    .notNull()
    .references(() => tinh.id),
})

/** Xã/Phường — references quận + tỉnh (denormalized tinhId matches the fixture). */
export const xa = pgTable('xa', {
  id: text('id').primaryKey(),
  ten: text('ten').notNull(),
  quanId: text('quan_id')
    .notNull()
    .references(() => quan.id),
  tinhId: text('tinh_id')
    .notNull()
    .references(() => tinh.id),
  khoangCach: integer('khoang_cach'),
  tienCong: integer('tien_cong'),
  tuyenId: text('tuyen_id'),
})
