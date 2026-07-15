import { z } from 'zod'

const nonnegativeInteger = z.coerce.number().int('Giá trị phải là số nguyên').nonnegative()

export const createKhuVucSchema = z.object({
  tenKhuVuc: z.string().min(1, 'Tên khu vực không được để trống'),
  tinhId: z.string().min(1, 'Tỉnh không được để trống'),
  quanId: z.string().min(1, 'Quận/huyện không được để trống'),
  xaId: z.string().min(1, 'Phường/xã không được để trống'),
  caySo: nonnegativeInteger,
  tienCong: nonnegativeInteger,
  tienCong2: nonnegativeInteger,
  active: z.boolean().optional(),
})

export const updateKhuVucSchema = createKhuVucSchema.partial()
