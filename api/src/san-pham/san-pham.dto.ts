import { z } from 'zod'
import {
  nullableNonnegativeIntegerInput,
  nullableTextInput,
} from '../crud/crud-dto-fields'

export const createSanPhamSchema = z.object({
  maSP: nullableTextInput,
  tenSP: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
  nhomSanPhamId: nullableTextInput,
  tienKhoan: nullableNonnegativeIntegerInput(
    'Tiền khoán phải là số nguyên không âm',
  ),
  active: z.boolean().optional(),
})

export const updateSanPhamSchema = createSanPhamSchema.partial()
