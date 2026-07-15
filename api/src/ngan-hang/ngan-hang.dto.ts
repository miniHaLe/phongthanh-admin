import { z } from 'zod'

export const createNganHangSchema = z.object({
  maNganHang: z.string().trim().min(1, 'Mã ngân hàng không được để trống'),
  tenNganHang: z.string().trim().min(1, 'Tên ngân hàng không được để trống'),
  diaChi: z.string().trim().optional(),
  active: z.boolean().optional(),
})

export const updateNganHangSchema = createNganHangSchema.partial()
