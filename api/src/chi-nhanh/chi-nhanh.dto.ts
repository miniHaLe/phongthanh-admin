import { z } from 'zod'
import {
  nullableEmailInput,
  nullableTextInput,
} from '../crud/crud-dto-fields'

export const createChiNhanhSchema = z.object({
  tenChiNhanh: z.string().min(1, 'Tên chi nhánh không được để trống'),
  soDienThoai: nullableTextInput,
  hotline: nullableTextInput,
  nguoiLienHe: nullableTextInput,
  email: nullableEmailInput('Email không hợp lệ'),
  diaChi: nullableTextInput,
  toaDo: nullableTextInput,
  chinh: z.boolean().optional(),
  chuyenCn: z.boolean().optional(),
  active: z.boolean().optional(),
})

export const updateChiNhanhSchema = createChiNhanhSchema.partial()
