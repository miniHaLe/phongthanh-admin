/**
 * "Thông tin khách hàng" fieldset for the Nhập Kho create editor. Controlled
 * by NhapKhoCreatePage — pure props in/out, no local persistence.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { NHA_KHO_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import { searchSuppliers, createSupplier } from './nhap-kho-suppliers'

export const HINH_THUC_THANH_TOAN_OPTIONS = ['Tiền mặt', 'Công nợ', 'Chuyển khoản'] as const

export const NHOM_KHACH_HANG_OPTIONS = [
  'Khách lẻ',
  'Đối tác MB/Nhà CC',
  'Đại lý chính',
  'Trung tâm bảo hành',
  'Đại lý/Cửa hàng',
  'Nhân viên công ty',
  'Thợ sửa chữa',
  'Cộng tác viên',
  'Nhà xe - Chuyển phát',
] as const

export interface NhapKhoHeaderValues {
  khoId: string
  nganChuaId: string
  hinhThucThanhToan: string
  nhomKhachHang: string
  nhaCungCap: AutocompleteOption | null
  soHoaDon: string
  nguoiGiao: string
  ngayNhapHoaDon: string
  ngayGiao: string
  soDatHang: string
  ghiChu: string
}

interface NhapKhoHeaderFieldsProps {
  values: NhapKhoHeaderValues
  onChange: (patch: Partial<NhapKhoHeaderValues>) => void
  errors: Partial<Record<keyof NhapKhoHeaderValues, string>>
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function NhapKhoHeaderFields({
  values,
  onChange,
  errors,
}: NhapKhoHeaderFieldsProps) {
  const nganChuaOptions = values.khoId
    ? NGAN_CHUA_ROWS.filter((n) => n.nhaKhoId === values.khoId)
    : NGAN_CHUA_ROWS

  return (
    <section aria-labelledby="section-nhap-kho-info">
      <h2 id="section-nhap-kho-info" className="mb-4 text-base font-semibold">
        Thông tin khách hàng
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Số phiếu">
          <Input value="Phát sinh tự động" readOnly disabled />
        </Field>

        <Field label="Ngày nhập">
          <Input type="date" value={values.ngayGiao} readOnly disabled />
        </Field>

        <Field label="Nhà kho" htmlFor="nk-kho" required error={errors.khoId}>
          <Select
            value={values.khoId}
            onValueChange={(v) => onChange({ khoId: v, nganChuaId: '' })}
          >
            <SelectTrigger id="nk-kho">
              <SelectValue placeholder="Chọn nhà kho" />
            </SelectTrigger>
            <SelectContent>
              {NHA_KHO_ROWS.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Ngăn chứa" htmlFor="nk-ngan" required error={errors.nganChuaId}>
          <Select
            value={values.nganChuaId}
            onValueChange={(v) => onChange({ nganChuaId: v })}
            disabled={!values.khoId}
          >
            <SelectTrigger id="nk-ngan">
              <SelectValue
                placeholder={values.khoId ? 'Chọn ngăn chứa' : 'Chọn nhà kho trước'}
              />
            </SelectTrigger>
            <SelectContent>
              {nganChuaOptions.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.tenNgan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Hình thức thanh toán"
          htmlFor="nk-httt"
          required
          error={errors.hinhThucThanhToan}
        >
          <Select
            value={values.hinhThucThanhToan}
            onValueChange={(v) => onChange({ hinhThucThanhToan: v })}
          >
            <SelectTrigger id="nk-httt">
              <SelectValue placeholder="Chọn hình thức" />
            </SelectTrigger>
            <SelectContent>
              {HINH_THUC_THANH_TOAN_OPTIONS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Khoản chi">
          <Input value="Chi mua hàng" readOnly disabled />
        </Field>

        <Field label="Nhóm khách hàng" htmlFor="nk-nhomkh" required>
          <Select
            value={values.nhomKhachHang}
            onValueChange={(v) => onChange({ nhomKhachHang: v })}
          >
            <SelectTrigger id="nk-nhomkh">
              <SelectValue placeholder="Chọn nhóm khách hàng" />
            </SelectTrigger>
            <SelectContent>
              {NHOM_KHACH_HANG_OPTIONS.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div>
          <Field label="Nhà cung cấp" required error={errors.nhaCungCap}>
            <ServerAutocomplete
              value={values.nhaCungCap}
              onChange={(opt) => onChange({ nhaCungCap: opt })}
              fetchOptions={searchSuppliers}
              placeholder="Nhập vào Tên nhà cung cấp"
              quickCreate={{
                title: 'Thêm mới nhà cung cấp',
                renderForm: (close, select) => (
                  <NewSupplierForm close={close} select={select} />
                ),
              }}
            />
          </Field>
        </div>

        <Field label="Số hóa đơn" htmlFor="nk-sohd">
          <Input
            id="nk-sohd"
            value={values.soHoaDon}
            onChange={(e) => onChange({ soHoaDon: e.target.value })}
          />
        </Field>

        <Field label="Người giao" htmlFor="nk-nguoigiao">
          <Input
            id="nk-nguoigiao"
            value={values.nguoiGiao}
            onChange={(e) => onChange({ nguoiGiao: e.target.value })}
          />
        </Field>

        <Field label="Ngày nhập hóa đơn" htmlFor="nk-ngayhd">
          <Input
            id="nk-ngayhd"
            type="date"
            value={values.ngayNhapHoaDon}
            onChange={(e) => onChange({ ngayNhapHoaDon: e.target.value })}
          />
        </Field>

        <Field label="Ngày giao" htmlFor="nk-ngaygiao">
          <Input
            id="nk-ngaygiao"
            type="date"
            value={values.ngayGiao}
            onChange={(e) => onChange({ ngayGiao: e.target.value })}
          />
        </Field>

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Số đặt hàng" htmlFor="nk-sodh">
            <Textarea
              id="nk-sodh"
              rows={2}
              value={values.soDatHang}
              onChange={(e) => onChange({ soDatHang: e.target.value })}
            />
          </Field>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Ghi chú" htmlFor="nk-ghichu">
            <Textarea
              id="nk-ghichu"
              rows={2}
              value={values.ghiChu}
              onChange={(e) => onChange({ ghiChu: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </section>
  )
}

function NewSupplierForm({
  close,
  select,
}: {
  close: () => void
  select: (opt: AutocompleteOption) => void
}) {
  const [ten, setTen] = useState('')
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-ncc-ten">Tên nhà cung cấp</Label>
        <Input
          id="qc-ncc-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!ten.trim()) {
              notify.error('Vui lòng nhập tên nhà cung cấp!')
              return
            }
            select(createSupplier(ten))
          }}
        >
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}
