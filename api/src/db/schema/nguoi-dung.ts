import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { chiNhanh } from './chi-nhanh'
import { nhomQuyen } from './nhom-quyen'

/** Người dùng — login identity. `passwordHash` NEVER serialized (security gate 3). */
export const nguoiDung = pgTable('nguoi_dung', {
  id: text('id').primaryKey(),
  tenDangNhap: text('ten_dang_nhap').notNull().unique(),
  hoTen: text('ho_ten').notNull(),
  dienThoai: text('dien_thoai'),
  email: text('email'),
  chiNhanhId: text('chi_nhanh_id')
    .notNull()
    .references(() => chiNhanh.id),
  /** Secondary branches this user can also access (Postgres text[]). */
  chiNhanhPhuIds: text('chi_nhanh_phu_ids').array().notNull().default([]),
  nhomQuyenId: text('nhom_quyen_id')
    .notNull()
    .references(() => nhomQuyen.id),
  /** Super-scope bypasses branch filtering entirely (sees all branches). */
  superScope: boolean('super_scope').notNull().default(false),
  locked: boolean('locked').notNull().default(false),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  passwordHash: text('password_hash').notNull(),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})
