import { z } from 'zod'
import { nullableTextInput } from '../crud/crud-dto-fields'

export const createNhaSanXuatSchema = z.object({
  maNSX: nullableTextInput,
  tenNSX: z.string().trim().min(1, 'Tên nhà sản xuất không được để trống'),
  ghiChu: nullableTextInput,
  active: z.boolean().optional(),
})

export const updateNhaSanXuatSchema = createNhaSanXuatSchema.partial()
