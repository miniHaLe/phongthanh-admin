import { z } from 'zod'

export const changePasswordDtoSchema = z.object({
  oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
})

export type ChangePasswordDto = z.infer<typeof changePasswordDtoSchema>
