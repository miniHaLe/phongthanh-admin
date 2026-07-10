import { z } from 'zod'

export const loginDtoSchema = z.object({
  tenDangNhap: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
})

export type LoginDto = z.infer<typeof loginDtoSchema>
