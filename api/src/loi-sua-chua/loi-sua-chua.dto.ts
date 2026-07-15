import { z } from 'zod'

const nonnegativeInteger = z.coerce.number().int('Số tiền phải là số nguyên').nonnegative()

export const createLoiSuaChuaSchema = z.object({
  branchId: z.string().min(1, 'Chi nhánh không được để trống'),
  nhomSanPhamId: z.string().min(1, 'Nhóm sản phẩm không được để trống'),
  tenLoi: z.string().min(1, 'Tên lỗi sửa chữa không được để trống'),
  tienCong: nonnegativeInteger,
  tienCongDV: nonnegativeInteger,
  active: z.boolean().optional(),
})

export const updateLoiSuaChuaSchema = createLoiSuaChuaSchema.partial()
