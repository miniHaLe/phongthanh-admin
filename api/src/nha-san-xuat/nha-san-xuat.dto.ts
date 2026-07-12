import { z } from 'zod'

export const createNhaSanXuatSchema = z.object({
  maNSX: z.string().trim().optional(),
  tenNSX: z.string().trim().min(1, 'Tên nhà sản xuất không được để trống'),
  ghiChu: z.string().trim().optional(),
  active: z.boolean().optional(),
})

export const updateNhaSanXuatSchema = createNhaSanXuatSchema.partial()
