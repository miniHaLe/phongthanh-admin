import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BRANCH_FILTER_OPTIONS,
  HINH_THUC_FILTER_OPTIONS,
} from '@/config/finance-tables/thu-chi.config'
import { ReceiptCustomerPicker } from './receipt-customer-picker'

export interface LapPhieuFormValues {
  loaiThuChi: string
  hinhThucId: string
  tenKhachHang: string
  soTien: string
  noiDung: string
  branchId: string
}

interface Option {
  label: string
  value: string
}

export interface LapPhieuFieldConfig {
  idPrefix: string
  typeLabel: string
  typePlaceholder: string
  typeOptions: readonly Option[]
  customerInputId: string
  customerLabel: string
}

interface LapPhieuModalFieldsProps {
  config: LapPhieuFieldConfig
  form: LapPhieuFormValues
  onChange: (next: Partial<LapPhieuFormValues>) => void
}

export function LapPhieuModalFields({
  config,
  form,
  onChange,
}: LapPhieuModalFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${config.idPrefix}-loai`}>
          {config.typeLabel} <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.loaiThuChi}
          onValueChange={(loaiThuChi) => onChange({ loaiThuChi })}
        >
          <SelectTrigger id={`${config.idPrefix}-loai`}>
            <SelectValue placeholder={config.typePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {config.typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${config.idPrefix}-hinhthuc`}>
          Hình thức <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.hinhThucId}
          onValueChange={(hinhThucId) => onChange({ hinhThucId })}
        >
          <SelectTrigger id={`${config.idPrefix}-hinhthuc`}>
            <SelectValue placeholder="Chọn hình thức" />
          </SelectTrigger>
          <SelectContent>
            {HINH_THUC_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ReceiptCustomerPicker
        inputId={config.customerInputId}
        label={config.customerLabel}
        value={form.tenKhachHang}
        onChange={(tenKhachHang) => onChange({ tenKhachHang })}
        required
      />

      <div className="space-y-1.5">
        <Label htmlFor={`${config.idPrefix}-sotien`}>
          Số tiền (₫) <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${config.idPrefix}-sotien`}
          type="number"
          min={0}
          value={form.soTien}
          onChange={(event) => onChange({ soTien: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${config.idPrefix}-chinhanh`}>Chi nhánh</Label>
        <Select
          value={form.branchId}
          onValueChange={(branchId) => onChange({ branchId })}
        >
          <SelectTrigger id={`${config.idPrefix}-chinhanh`}>
            <SelectValue placeholder="Chọn chi nhánh" />
          </SelectTrigger>
          <SelectContent>
            {BRANCH_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${config.idPrefix}-noidung`}>Nội dung</Label>
        <Textarea
          id={`${config.idPrefix}-noidung`}
          rows={2}
          value={form.noiDung}
          onChange={(event) => onChange({ noiDung: event.target.value })}
        />
      </div>
    </div>
  )
}
