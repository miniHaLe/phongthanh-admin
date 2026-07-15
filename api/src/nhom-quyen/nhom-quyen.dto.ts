import { z } from 'zod'

const nhomQuyenFields = {
  maNhom: z.string().trim().min(1, 'Mã nhóm không được để trống'),
  tenNhom: z.string().trim().min(1, 'Tên nhóm không được để trống'),
  moTa: z.string().optional(),
  active: z.boolean().optional(),
}

export const createNhomQuyenSchema = z
  .object(nhomQuyenFields)
  .strict('Trường dữ liệu nhóm quyền không hợp lệ')

export const updateNhomQuyenSchema = z
  .object(nhomQuyenFields)
  .partial()
  .strict('Trường dữ liệu nhóm quyền không hợp lệ')
