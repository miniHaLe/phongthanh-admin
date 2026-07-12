import {
  date,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

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

/** Official two-level province/city snapshot effective 2025-07-01. */
export const tinhThanh = pgTable('tinh_thanh', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  type: text('type').notNull(),
  effectiveFrom: date('effective_from').notNull(),
  snapshotVersion: text('snapshot_version').notNull(),
  sourceDocument: text('source_document').notNull(),
})

/** Official commune/ward/special-zone snapshot with a province-qualified key. */
export const phuongXa = pgTable(
  'phuong_xa',
  {
    code: text('code').primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    type: text('type').notNull(),
    provinceCode: text('province_code')
      .notNull()
      .references(() => tinhThanh.code),
    effectiveFrom: date('effective_from').notNull(),
    snapshotVersion: text('snapshot_version').notNull(),
    sourceDocument: text('source_document').notNull(),
  },
  (table) => [
    index('phuong_xa_province_code_idx').on(table.provinceCode),
    index('phuong_xa_normalized_name_idx').on(table.normalizedName),
    uniqueIndex('phuong_xa_province_code_code_unique').on(
      table.provinceCode,
      table.code,
    ),
  ],
)
