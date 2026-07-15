import { z } from 'zod'
import {
  nullableNonnegativeIntegerInput,
  nullableTextInput,
} from '../crud/crud-dto-fields'

const nullableMoney = nullableNonnegativeIntegerInput(
  'Số tiền phải là số nguyên',
)

export const createHangHoaSchema = z.object({
  maHH: z.string().min(1, 'Mã hàng hóa không được để trống'),
  maHHPhu: nullableTextInput,
  tenHH: z.string().min(1, 'Tên hàng hóa không được để trống'),
  tenTiengAnh: nullableTextInput,
  nhomHangHoaId: z.string().min(1, 'Nhóm hàng hóa không được để trống'),
  nhaSanXuatId: nullableTextInput,
  modelId: nullableTextInput,
  modelDungChung: z.boolean().optional(),
  modelDungChungText: nullableTextInput,
  donViTinhId: z.string().min(1, 'Đơn vị tính không được để trống'),
  coSerial: z.boolean().optional(),
  phatSinhTuDong: z.boolean().optional(),
  viTriLinhKien: nullableTextInput,
  hinh: nullableTextInput,
  giaMua: nullableMoney,
  giaBanSi: nullableMoney,
  giaBanLe: nullableMoney,
  giaNhap: nullableMoney,
  giaBan: nullableMoney,
  tonKho: z.coerce.number().int('Tồn kho phải là số nguyên').nonnegative().optional(),
  active: z.boolean().optional(),
})

export const updateHangHoaSchema = createHangHoaSchema.partial()
