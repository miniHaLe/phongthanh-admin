import { z } from 'zod'

export const createThoiHanSchema = z.object({
  ten: z.string().min(1, 'Tên thời hạn không được để trống'),
  loai: z.enum(['Tháng', 'Năm'], {
    errorMap: () => ({ message: 'Loại thời hạn phải là Tháng hoặc Năm' }),
  }),
  thoiGian: z.coerce.number().int('Thời gian phải là số nguyên').nonnegative(),
  active: z.boolean().optional(),
})

export const updateThoiHanSchema = createThoiHanSchema.partial()
