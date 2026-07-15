import { z } from 'zod'
import { nullableTextInput } from '../crud/crud-dto-fields'

export const createNhomHangHoaSchema = z.object({
  maNhom: nullableTextInput,
  tenNhom: z.string().min(1, 'Tên nhóm hàng hóa không được để trống'),
  active: z.boolean().optional(),
})

export const updateNhomHangHoaSchema = createNhomHangHoaSchema.partial()
