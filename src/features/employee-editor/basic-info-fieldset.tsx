/** "Thông tin cơ bản" fieldset — Mã NV / Giới tính / Họ tên / Ngày sinh / Phone x2 / Email / Thường trú. */
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmployeeField } from './employee-field'
import type {
  EmployeeFormValues,
  EmployeeFormErrors,
} from './employee-editor-form-state'

interface BasicInfoFieldsetProps {
  values: EmployeeFormValues
  onChange: (patch: Partial<EmployeeFormValues>) => void
  errors: EmployeeFormErrors
}

export function BasicInfoFieldset({
  values,
  onChange,
  errors,
}: BasicInfoFieldsetProps) {
  return (
    <section aria-labelledby="section-co-ban">
      <h2 id="section-co-ban" className="mb-4 text-base font-semibold">
        Thông tin cơ bản
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmployeeField label="Mã Nhân Viên" required error={errors.maNV}>
          <Input
            value={values.maNV}
            onChange={(e) => onChange({ maNV: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Giới Tính" required error={errors.gioiTinh}>
          <Select
            value={values.gioiTinh}
            onValueChange={(v) =>
              onChange({ gioiTinh: v as EmployeeFormValues['gioiTinh'] })
            }
          >
            <SelectTrigger aria-label="Giới Tính">
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Nữ</SelectItem>
              <SelectItem value="true">Nam</SelectItem>
            </SelectContent>
          </Select>
        </EmployeeField>

        <EmployeeField label="Họ Tên" required error={errors.hoTen}>
          <Input
            value={values.hoTen}
            onChange={(e) => onChange({ hoTen: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Ngày sinh" required error={errors.ngaySinh}>
          <Input
            type="date"
            value={values.ngaySinh}
            onChange={(e) => onChange({ ngaySinh: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Phone 1">
          <Input
            value={values.soDienThoai}
            onChange={(e) => onChange({ soDienThoai: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Phone 2">
          <Input
            value={values.soDienThoai2}
            onChange={(e) => onChange({ soDienThoai2: e.target.value })}
          />
        </EmployeeField>

        <EmployeeField label="Email">
          <Input
            type="email"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </EmployeeField>

        <div className="sm:col-span-2 lg:col-span-3">
          <EmployeeField label="Thường trú">
            <Input
              value={values.thuongTru}
              onChange={(e) => onChange({ thuongTru: e.target.value })}
            />
          </EmployeeField>
        </div>
      </div>
    </section>
  )
}
