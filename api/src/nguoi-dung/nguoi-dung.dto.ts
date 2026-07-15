import { z } from 'zod'

const editableNguoiDungFields = {
  tenDangNhap: z.string().trim().min(1, 'Tên đăng nhập không được để trống'),
  hoTen: z.string().trim().min(1, 'Họ tên không được để trống'),
  dienThoai: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  chiNhanhId: z.string().min(1, 'Chi nhánh không được để trống'),
  nhomQuyenId: z.string().min(1, 'Nhóm quyền không được để trống'),
  locked: z.boolean().optional(),
  active: z.boolean().optional(),
}

export const createNguoiDungSchema = z
  .object({
    ...editableNguoiDungFields,
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  })
  .strict('Trường dữ liệu người dùng không hợp lệ')

export const updateNguoiDungSchema = z
  .object(editableNguoiDungFields)
  .partial()
  .strict('Trường dữ liệu người dùng không hợp lệ')

export type CreateNguoiDungDto = z.infer<typeof createNguoiDungSchema>
export type UpdateNguoiDungDto = z.infer<typeof updateNguoiDungSchema>
