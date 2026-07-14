import { z } from 'zod'

const optionalTrimmedText = z.string().trim().nullable().optional()
const phone = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0')
const optionalPhone = phone.or(z.literal('')).nullable().optional()
const optionalEmptyText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => (typeof value === 'string' ? value.trim() : value))
const officialCode = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => value || null)
const taxCode = z
  .string()
  .trim()
  .regex(/^(?:|\d{10}(?:-\d{3})?)$/, 'Mã số thuế phải có 10 số hoặc 10 số-3 số')
  .nullable()
  .optional()

/** Client-writable customer fields. Identity, audit fields, creator, and branch
 * ownership are stamped by the server. Modern province/commune codes are
 * optional as a pair so legacy customers remain editable without guessed data. */
const khachHangFields = {
  tenKH: z.string().trim().min(1, 'Tên khách hàng không được để trống'),
  dienThoai: phone,
  dienThoai2: optionalPhone,
  diaChi: optionalTrimmedText,
  tenDuong: optionalTrimmedText,
  tinhThanhCode: officialCode,
  phuongXaCode: officialCode,
  maSoThue: taxCode,
  nganHangId: officialCode,
  /** Text on purpose: trimming surrounding whitespace preserves leading zeroes. */
  soTaiKhoan: optionalEmptyText,
  phuongXaId: officialCode,
  quanId: officialCode,
  tinhId: officialCode,
  email: z
    .string()
    .email('Email không hợp lệ')
    .or(z.literal(''))
    .nullable()
    .optional(),
  loaiKhachHangId: z.number().int(),
  daiLyId: officialCode,
  ghiChu: optionalTrimmedText,
  active: z.boolean().optional(),
}

export const createKhachHangSchema = z
  .object(khachHangFields)
  .superRefine((value, ctx) => {
    if (Boolean(value.tinhThanhCode) !== Boolean(value.phuongXaCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phuongXaCode'],
        message: 'Tỉnh/Thành phố và Phường/Xã phải được chọn cùng nhau',
      })
    }
  })

export const updateKhachHangSchema = z
  .object({
    ...khachHangFields,
    /** Command field only; KhachHangService removes it before the DB write. */
    clearDiaChi: z.literal(true).optional(),
  })
  .partial()

export type CreateKhachHangDto = z.infer<typeof createKhachHangSchema>
export type UpdateKhachHangDto = z.infer<typeof updateKhachHangSchema>
