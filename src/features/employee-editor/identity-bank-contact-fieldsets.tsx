/**
 * The 3 smaller fieldsets — "Thông tin xác thực" (CMND/Ngày Cấp/Địa chỉ/Nơi
 * Cấp), "Thông tin ngân hàng" (Số Tài Khoản/Mã Số Thuế/Ngân Hàng), "Thông tin
 * liên hệ" (Người Liên Hệ/Thông Tin Liên Hệ) — grouped in one file since each
 * is a handful of plain text/select fields with no shared state beyond the
 * parent form.
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
import type { EmployeeFormValues } from './employee-editor-form-state'
import { NGAN_HANG_ROWS } from '@/domains/hr/ngan-hang.mock'

interface FieldsetProps {
  values: EmployeeFormValues
  onChange: (patch: Partial<EmployeeFormValues>) => void
}

export function IdentityFieldset({ values, onChange }: FieldsetProps) {
  return (
    <section aria-labelledby="section-xac-thuc">
      <h2 id="section-xac-thuc" className="mb-4 text-base font-semibold">
        Thông tin xác thực
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmployeeField label="Chứng minh thư">
          <Input
            value={values.cmnd}
            onChange={(e) => onChange({ cmnd: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Ngày Cấp">
          <Input
            type="date"
            value={values.ngayCap}
            onChange={(e) => onChange({ ngayCap: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Địa chỉ">
          <Input
            value={values.diaChi}
            onChange={(e) => onChange({ diaChi: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Nơi Cấp">
          <Input
            value={values.noiCap}
            onChange={(e) => onChange({ noiCap: e.target.value })}
          />
        </EmployeeField>
      </div>
    </section>
  )
}

export function BankInfoFieldset({ values, onChange }: FieldsetProps) {
  return (
    <section aria-labelledby="section-ngan-hang">
      <h2 id="section-ngan-hang" className="mb-4 text-base font-semibold">
        Thông tin ngân hàng
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <EmployeeField label="Số Tài Khoản">
          <Input
            value={values.soTaiKhoan}
            onChange={(e) => onChange({ soTaiKhoan: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Mã Số Thuế">
          <Input
            value={values.maSoThue}
            onChange={(e) => onChange({ maSoThue: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Ngân Hàng">
          <Select
            value={values.nganHangId || '__none__'}
            onValueChange={(v) =>
              onChange({ nganHangId: v === '__none__' ? '' : v })
            }
          >
            <SelectTrigger aria-label="Ngân Hàng">
              <SelectValue placeholder="Chọn ngân hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Không chọn</SelectItem>
              {NGAN_HANG_ROWS.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.tenNganHang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EmployeeField>
      </div>
    </section>
  )
}

export function ContactInfoFieldset({ values, onChange }: FieldsetProps) {
  return (
    <section aria-labelledby="section-lien-he">
      <h2 id="section-lien-he" className="mb-4 text-base font-semibold">
        Thông tin liên hệ
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <EmployeeField label="Người Liên Hệ">
          <Input
            value={values.nguoiLienHe}
            onChange={(e) => onChange({ nguoiLienHe: e.target.value })}
          />
        </EmployeeField>
        <EmployeeField label="Thông Tin Liên Hệ">
          <Input
            value={values.thongTinLienHe}
            onChange={(e) => onChange({ thongTinLienHe: e.target.value })}
          />
        </EmployeeField>
      </div>
    </section>
  )
}
