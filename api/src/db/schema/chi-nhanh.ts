import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Chi nhánh — the canonical branch-id namespace (D4 reconciliation: `cn-1|cn-2|cn-3`). */
export const chiNhanh = pgTable('chi_nhanh', {
  id: text('id').primaryKey(),
  tenChiNhanh: text('ten_chi_nhanh').notNull(),
  soDienThoai: text('so_dien_thoai'),
  hotline: text('hotline'),
  nguoiLienHe: text('nguoi_lien_he'),
  email: text('email'),
  diaChi: text('dia_chi'),
  toaDo: text('toa_do'),
  chinh: boolean('chinh'),
  chuyenCn: boolean('chuyen_cn'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
