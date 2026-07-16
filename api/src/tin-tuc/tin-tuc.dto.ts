import { z } from 'zod'

export const createTinTucSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống'),
  body: z.string().trim().min(1, 'Nội dung không được để trống'),
  active: z.boolean().optional(),
})

export const updateTinTucSchema = createTinTucSchema.partial()
