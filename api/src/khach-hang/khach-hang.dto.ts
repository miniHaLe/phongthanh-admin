import { z } from 'zod'

/** Server-owned fields (id/createdAt/updatedAt/active/branchId/nguoiTao) are
 * NEVER accepted from the client — mirrors `Omit<T, 'id' | 'createdAt'>` from
 * the wire contract, and additionally excludes branchId/nguoiTao which the
 * mock's `MockApi<T>` type allows through but this server stamps itself.
 *
 * Deviation from the mock's `KhachHang` type (where `tinhId` is optional):
 * `tinhId` is REQUIRED on create here because `branch_id` (D4 branch scoping,
 * NOT NULL) is derived from it — a khach-hang with no tinhId has no
 * determinable branch, which would violate the "empty branch set ⇒ deny"
 * invariant at the row level. Update keeps it optional (branch is fixed
 * after creation; changing tinhId post-create does not re-derive branchId
 * in this slice — out of scope for Phase 1). */
export const createKhachHangSchema = z.object({
  tenKH: z.string().min(1, 'Tên khách hàng không được để trống'),
  dienThoai: z.string().min(1, 'Số điện thoại không được để trống'),
  dienThoai2: z.string().optional(),
  diaChi: z.string().optional(),
  phuongXaId: z.string().optional(),
  quanId: z.string().optional(),
  tinhId: z.string().min(1, 'Tỉnh không được để trống'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  loaiKhachHangId: z.number().int(),
  daiLyId: z.string().optional(),
  ghiChu: z.string().optional(),
  active: z.boolean().optional(),
})

export const updateKhachHangSchema = createKhachHangSchema.partial()

export type CreateKhachHangDto = z.infer<typeof createKhachHangSchema>
export type UpdateKhachHangDto = z.infer<typeof updateKhachHangSchema>
