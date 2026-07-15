/**
 * "Thông tin làm việc" fieldset — Phòng Ban / Chức vụ / Ngày Làm Việc / Chi
 * nhánh / Lương cứng / Phí nhân công / Hình Thức Thanh Toán / Tiền bảo hiểm /
 * Phụ cấp multi-select.
 */
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmployeeField } from './employee-field'
import { PhuCapMultiSelect } from './phu-cap-multi-select'
import type {
  EmployeeFormValues,
  EmployeeFormErrors,
} from './employee-editor-form-state'
import { PHONG_BAN_ROWS } from '@/mock/masterdata/phong-ban.mock'
import { CHUC_VU_ROWS } from '@/mock/masterdata/chuc-vu.mock'
import { useLookup } from '@/hooks/use-lookup'

const HINH_THUC_THANH_TOAN_OPTIONS = ['Tiền mặt', 'Chuyển khoản'] as const

interface WorkInfoFieldsetProps {
  values: EmployeeFormValues
  onChange: (patch: Partial<EmployeeFormValues>) => void
  errors: EmployeeFormErrors
}

export function WorkInfoFieldset({
  values,
  onChange,
  errors,
}: WorkInfoFieldsetProps) {
  const { rows: chiNhanhRows } = useLookup('chi-nhanh')
  return (
    <section aria-labelledby="section-lam-viec">
      <h2 id="section-lam-viec" className="mb-4 text-base font-semibold">
        Thông tin làm việc
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmployeeField label="Phòng Ban" required error={errors.phongBanId}>
          <Select
            value={values.phongBanId}
            onValueChange={(v) => onChange({ phongBanId: v })}
          >
            <SelectTrigger aria-label="Phòng Ban">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {PHONG_BAN_ROWS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.tenPhongBan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EmployeeField>

        <EmployeeField label="Chức vụ" required error={errors.chucVuId}>
          <Select
            value={values.chucVuId}
            onValueChange={(v) => onChange({ chucVuId: v })}
          >
            <SelectTrigger aria-label="Chức vụ">
              <SelectValue placeholder="Chọn chức vụ" />
            </SelectTrigger>
            <SelectContent>
              {CHUC_VU_ROWS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.tenChucVu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EmployeeField>

        <EmployeeField
          label="Ngày Làm Việc"
          required
          error={errors.ngayLamViec}
        >
          <Input
            type="date"
            value={values.ngayLamViec}
            onChange={(e) => onChange({ ngayLamViec: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Chi nhánh" required error={errors.chiNhanhId}>
          <Select
            value={values.chiNhanhId}
            onValueChange={(v) => onChange({ chiNhanhId: v })}
          >
            <SelectTrigger aria-label="Chi nhánh">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {chiNhanhRows.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.tenChiNhanh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EmployeeField>

        <EmployeeField label="Lương cứng" required error={errors.luongCoBan}>
          <Input
            type="number"
            value={values.luongCoBan}
            onChange={(e) => onChange({ luongCoBan: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Phí nhân công">
          <Input
            type="number"
            value={values.phiNhanCong}
            onChange={(e) => onChange({ phiNhanCong: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField
          label="Hình Thức Thanh Toán"
          required
          error={errors.hinhThucThanhToan}
        >
          <Select
            value={values.hinhThucThanhToan}
            onValueChange={(v) =>
              onChange({
                hinhThucThanhToan: v as EmployeeFormValues['hinhThucThanhToan'],
              })
            }
          >
            <SelectTrigger aria-label="Hình Thức Thanh Toán">
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
        </EmployeeField>

        <EmployeeField label="Tiền đóng bảo hiểm">
          <Input
            type="number"
            value={values.tienBaoHiem}
            onChange={(e) => onChange({ tienBaoHiem: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Phụ cấp">
          <PhuCapMultiSelect
            value={values.phuCapIds}
            onChange={(ids) => onChange({ phuCapIds: ids })}
          />
        </EmployeeField>
      </div>
    </section>
  )
}
