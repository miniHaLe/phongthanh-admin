import { z } from 'zod'
import { nullableTextInput } from '../crud/crud-dto-fields'

export const createPhiGiaoSchema = z.object({
  sanPhamId: nullableTextInput,
  tenPhi: z.string().min(1, 'Tên phí giao không được để trống'),
  soTien: z.coerce.number().int('Số tiền phải là số nguyên').nonnegative(),
  loaiPhi: z.coerce.number().int().min(1).max(3),
  ghiChu: nullableTextInput,
  active: z.boolean().optional(),
})

export const updatePhiGiaoSchema = createPhiGiaoSchema.partial()
