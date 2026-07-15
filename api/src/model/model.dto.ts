import { z } from 'zod'
import { nullableTextInput } from '../crud/crud-dto-fields'

export const createModelSchema = z.object({
  sanPhamId: z.string().trim().min(1, 'Sản phẩm không được để trống'),
  nhaSanXuatId: z.string().trim().min(1, 'Nhà sản xuất không được để trống'),
  tenModel: z.string().trim().min(1, 'Tên model không được để trống'),
  ghiChu: nullableTextInput,
  active: z.boolean().optional(),
})

export const updateModelSchema = createModelSchema.partial()
