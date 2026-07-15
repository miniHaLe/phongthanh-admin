import { z } from 'zod'
import { nullableTextInput } from '../crud/crud-dto-fields'

const nonnegativeInteger = z.coerce.number().int('Giá trị phải là số nguyên').nonnegative()

export const createPhuongXaSchema = z.object({
  tenPhuongXa: z.string().min(1, 'Tên phường/xã không được để trống'),
  tinhId: z.string().min(1, 'Tỉnh không được để trống'),
  quanId: z.string().min(1, 'Quận/huyện không được để trống'),
  khoangCach: nonnegativeInteger,
  tienCong: nonnegativeInteger,
  tuyenId: nullableTextInput,
  active: z.boolean().optional(),
})

export const updatePhuongXaSchema = createPhuongXaSchema.partial()
