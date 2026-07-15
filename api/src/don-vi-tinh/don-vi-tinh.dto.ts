import { z } from 'zod'

export const createDonViTinhSchema = z.object({
  tenDVT: z.string().min(1, 'Tên đơn vị tính không được để trống'),
  active: z.boolean().optional(),
})

export const updateDonViTinhSchema = createDonViTinhSchema.partial()
