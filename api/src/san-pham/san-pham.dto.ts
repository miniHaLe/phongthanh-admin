import { z } from 'zod'

export const createSanPhamSchema = z.object({
  maSP: z.string().trim().optional(),
  tenSP: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
  nhomSanPhamId: z.string().trim().optional(),
  tienKhoan: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
})

export const updateSanPhamSchema = createSanPhamSchema.partial()
