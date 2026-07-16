import { z } from 'zod'

const optionSchema = z.object({ id: z.string(), label: z.string() })

const modelOptionSchema = optionSchema.extend({
  nhaSanXuatId: z.string().optional(),
  sanPhamId: z.string().optional(),
})

const customerOptionSchema = optionSchema.extend({
  ten: z.string(),
  sdt: z.string(),
  diaChi: z.string(),
  dienThoai2: z.string().optional(),
  email: z.string().optional(),
})

const dealerOptionSchema = optionSchema.extend({
  daiLyChinh: z.string().optional(),
  dienThoai: z.string().optional(),
  diaChi: z.string().optional(),
  email: z.string().optional(),
})

function requiredNullable<T extends z.ZodTypeAny>(schema: T, message: string) {
  return schema
    .nullable()
    .refine((value): boolean => value !== null, { message })
}

export const repairFormSchema = z
  .object({
    sanPham: optionSchema.nullable().default(null),
    nhaSanXuat: optionSchema.nullable().default(null),
    model: requiredNullable(modelOptionSchema, 'Vui lòng chọn Model!'),
    soSerial: z.string().min(1, 'Vui lòng nhập số serial!'),
    moTaHuHong: z.string().min(1, 'Vui lòng nhập mô tả hư hỏng!'),
    phuKienKemTheo: z.string().optional(),
    ngayMua: z.string().optional(),
    noiMua: z.string().optional(),
    ghiChu: z.string().optional(),
    ghiChuNhaSanXuat: z.string().optional(),
    ghiChuModel: z.string().optional(),
    branchId: z.string().optional(),
    soPhieuHang: z.string().optional(),
    soPhieuDaiLy: z.string().optional(),
    hinhThuc: z
      .union([
        z.literal(''),
        z.literal('bao_hanh'),
        z.literal('bh_sua_chua'),
        z.literal('sua_dich_vu'),
      ])
      .refine((value): boolean => value !== '', {
        message: 'Vui lòng chọn hình thức bảo hành!',
      }),
    loaiBaoHanh: z.enum(['tai_ttbh', 'tai_nha']).default('tai_nha'),
    suaGap: z.boolean().default(false),
    khuVuc: requiredNullable(optionSchema, 'Vui lòng chọn khu vực!'),
    khachHang: requiredNullable(
      customerOptionSchema,
      'Vui lòng nhập khách hàng!',
    ),
    tuyen: z.string().optional(),
    daiLy: dealerOptionSchema.nullable().default(null),
    dienThoai2: z.string().optional(),
    email: z
      .union([z.literal(''), z.string().email('Email không hợp lệ')])
      .optional(),
    ngayHenGiao: z.string().optional(),
    ngayNhan: z.string().min(1, 'Vui lòng chọn ngày nhận'),
  })
  .superRefine((data, context) => {
    if (data.ngayNhan && data.ngayHenGiao && data.ngayHenGiao < data.ngayNhan) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ngayHenGiao'],
        message: 'Ngày hẹn giao không được trước ngày nhận',
      })
    }
  })

export type RepairFormValues = z.infer<typeof repairFormSchema>
export type RepairDealerOption = NonNullable<RepairFormValues['daiLy']>

export function createEmptyRepairFormValues(
  branchId: string,
  today: string,
): RepairFormValues {
  return {
    sanPham: null,
    nhaSanXuat: null,
    model: null,
    soSerial: '',
    moTaHuHong: '',
    phuKienKemTheo: '',
    ngayMua: '',
    noiMua: '',
    ghiChu: '',
    ghiChuNhaSanXuat: '',
    ghiChuModel: '',
    branchId,
    soPhieuHang: '',
    soPhieuDaiLy: '',
    hinhThuc: '',
    loaiBaoHanh: 'tai_nha',
    suaGap: false,
    khuVuc: null,
    khachHang: null,
    tuyen: '',
    daiLy: null,
    dienThoai2: '',
    email: '',
    ngayHenGiao: '',
    ngayNhan: today,
  }
}
