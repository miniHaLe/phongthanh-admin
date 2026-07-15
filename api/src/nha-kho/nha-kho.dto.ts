import { z } from 'zod'
import {
  nullableTextInput,
  optionalNonBlankTextInput,
} from '../crud/crud-dto-fields'

export const createNhaKhoSchema = z.object({
  maNhaKho: optionalNonBlankTextInput,
  tenNhaKho: z.string().min(1, 'Tên nhà kho không được để trống'),
  chiNhanhId: z.string().min(1, 'Chi nhánh không được để trống'),
  diaChi: nullableTextInput,
  khoXac: z.boolean().optional(),
  active: z.boolean().optional(),
})

export const updateNhaKhoSchema = createNhaKhoSchema.partial()
