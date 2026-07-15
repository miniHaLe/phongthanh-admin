import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

const auditColumns = {
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
}

/** Global manufacturer catalog. These rows are intentionally not branch scoped. */
export const nhaSanXuat = pgTable(
  'nha_san_xuat',
  {
    id: text('id').primaryKey(),
    maNSX: text('ma_nsx'),
    tenNSX: text('ten_nsx').notNull(),
    ghiChu: text('ghi_chu'),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('nha_san_xuat_ten_normalized_unique').on(
      sql`lower(trim(${table.tenNSX}))`,
    ),
  ],
)

/** Global product catalog used as the product parent of a model. */
export const sanPham = pgTable(
  'san_pham',
  {
    id: text('id').primaryKey(),
    maSP: text('ma_sp'),
    tenSP: text('ten_sp').notNull(),
    nhomSanPhamId: text('nhom_san_pham_id'),
    tienKhoan: integer('tien_khoan'),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('san_pham_ten_normalized_unique').on(
      sql`lower(trim(${table.tenSP}))`,
    ),
  ],
)

/** A model always names both its manufacturer and product explicitly. */
export const model = pgTable(
  'model',
  {
    id: text('id').primaryKey(),
    tenModel: text('ten_model').notNull(),
    tenModelNormalized: text('ten_model_normalized').notNull(),
    nhaSanXuatId: text('nha_san_xuat_id')
      .notNull()
      .references(() => nhaSanXuat.id),
    sanPhamId: text('san_pham_id')
      .notNull()
      .references(() => sanPham.id),
    ghiChu: text('ghi_chu'),
    ...auditColumns,
  },
  (table) => [
    index('model_nha_san_xuat_id_idx').on(table.nhaSanXuatId),
    index('model_san_pham_id_idx').on(table.sanPhamId),
    uniqueIndex('model_parent_name_unique').on(
      table.nhaSanXuatId,
      table.sanPhamId,
      table.tenModelNormalized,
    ),
  ],
)

/** Global bank lookup; account numbers live on customers as text. */
export const nganHang = pgTable(
  'ngan_hang',
  {
    id: text('id').primaryKey(),
    maNganHang: text('ma_ngan_hang').notNull(),
    tenNganHang: text('ten_ngan_hang').notNull(),
    diaChi: text('dia_chi'),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex('ngan_hang_ma_unique').on(table.maNganHang),
    uniqueIndex('ngan_hang_ten_normalized_unique').on(
      sql`lower(trim(${table.tenNganHang}))`,
    ),
  ],
)
