import { z } from 'zod'
import {
  nullableNonnegativeIntegerInput,
  nullableTextInput,
} from '../crud/crud-dto-fields'

export const createSanPhamSchema = z.object({
  maSP: nullableTextInput,
  tenSP: z.string().min(1, 'Tên sản phẩm không được để trống'),
  nhomSanPhamId: z.string().min(1, 'Nhóm sản phẩm không được để trống'),
  tienKhoan: nullableNonnegativeIntegerInput(
    'Tiền khoán phải là số nguyên',
  ),
  active: z.boolean().optional(),
})

export const updateSanPhamSchema = createSanPhamSchema.partial()
