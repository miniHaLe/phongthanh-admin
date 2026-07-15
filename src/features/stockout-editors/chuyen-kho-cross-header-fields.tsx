/**
 * Header fieldset for the cross-branch Chuyển Kho editor — Từ chi nhánh*
 * (own branch) / Từ nhà kho* (cascade) / Đến chi nhánh* (other branches) /
 * Đến nhà kho* (cascade).
 */
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCHES, type BranchId } from '@/mock/seed/branches'
import { useLookup } from '@/hooks/use-lookup'

export interface ChuyenKhoCrossHeaderValues {
  tuChiNhanhId: BranchId
  tuKhoId: string
  denChiNhanhId: string
  denKhoId: string
}

interface ChuyenKhoCrossHeaderFieldsProps {
  values: ChuyenKhoCrossHeaderValues
  onChange: (patch: Partial<ChuyenKhoCrossHeaderValues>) => void
  errors: Partial<Record<keyof ChuyenKhoCrossHeaderValues, string>>
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ChuyenKhoCrossHeaderFields({
  values,
  onChange,
  errors,
}: ChuyenKhoCrossHeaderFieldsProps) {
  const { rows: nhaKhoRows } = useLookup('nha-kho')
  const tuKhoOptions = nhaKhoRows
  const denChiNhanhOptions = BRANCHES.filter(
    (b) => b.id !== values.tuChiNhanhId,
  )
  const denKhoOptions = nhaKhoRows

  return (
    <section aria-labelledby="section-ckk-info">
      <h2 id="section-ckk-info" className="mb-4 text-base font-semibold">
        Thông tin chuyển kho
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Từ chi nhánh" required error={errors.tuChiNhanhId}>
          <Select
            value={values.tuChiNhanhId}
            onValueChange={(v) =>
              onChange({ tuChiNhanhId: v as BranchId, denChiNhanhId: '' })
            }
          >
            <SelectTrigger aria-label="Từ chi nhánh">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRANCHES.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Từ nhà kho" required error={errors.tuKhoId}>
          <Select
            value={values.tuKhoId}
            onValueChange={(v) => onChange({ tuKhoId: v })}
          >
            <SelectTrigger aria-label="Từ nhà kho">
              <SelectValue placeholder="Chọn nhà kho" />
            </SelectTrigger>
            <SelectContent>
              {tuKhoOptions.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Đến chi nhánh" required error={errors.denChiNhanhId}>
          <Select
            value={values.denChiNhanhId}
            onValueChange={(v) => onChange({ denChiNhanhId: v })}
          >
            <SelectTrigger aria-label="Đến chi nhánh">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {denChiNhanhOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Đến nhà kho" required error={errors.denKhoId}>
          <Select
            value={values.denKhoId}
            onValueChange={(v) => onChange({ denKhoId: v })}
          >
            <SelectTrigger aria-label="Đến nhà kho">
              <SelectValue placeholder="Chọn nhà kho" />
            </SelectTrigger>
            <SelectContent>
              {denKhoOptions.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </section>
  )
}
