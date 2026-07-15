import { z } from 'zod'

export const createNganChuaSchema = z.object({
  tenNgan: z.string().min(1, 'Tên ngăn chứa không được để trống'),
  nhaKhoId: z.string().min(1, 'Nhà kho không được để trống'),
  active: z.boolean().optional(),
})

export const updateNganChuaSchema = createNganChuaSchema.partial()
