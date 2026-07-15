import { z } from 'zod'

export const createNhomSanPhamSchema = z.object({
  tenNhomSP: z.string().min(1, 'Tên nhóm sản phẩm không được để trống'),
  active: z.boolean().optional(),
})

export const updateNhomSanPhamSchema = createNhomSanPhamSchema.partial()
