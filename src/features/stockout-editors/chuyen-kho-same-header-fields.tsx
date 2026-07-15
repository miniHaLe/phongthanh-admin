/**
 * Header fieldset for the same-branch Chuyển Kho editor — both branches
 * locked to the current branch (no selection); required Từ nhà kho, Đến nhà
 * kho, and Đến ngăn chứa (cabinet cascade) which distinguishes this editor
 * from the cross-branch one.
 */
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCH_NAME, type BranchId } from '@/mock/seed/branches'
import { useLookup } from '@/hooks/use-lookup'

export interface ChuyenKhoSameHeaderValues {
  tuKhoId: string
  denKhoId: string
  denNganChuaId: string
}

interface ChuyenKhoSameHeaderFieldsProps {
  branchId: BranchId
  values: ChuyenKhoSameHeaderValues
  onChange: (patch: Partial<ChuyenKhoSameHeaderValues>) => void
  errors: Partial<Record<keyof ChuyenKhoSameHeaderValues, string>>
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

export function ChuyenKhoSameHeaderFields({
  branchId,
  values,
  onChange,
  errors,
}: ChuyenKhoSameHeaderFieldsProps) {
  const { rows: nhaKhoRows } = useLookup('nha-kho')
  const { rows: nganChuaRows } = useLookup('ngan-chua')
  const denNganChuaOptions = values.denKhoId
    ? nganChuaRows.filter((n) => n.nhaKhoId === values.denKhoId)
    : nganChuaRows

  return (
    <section aria-labelledby="section-ckc-info">
      <h2 id="section-ckc-info" className="mb-4 text-base font-semibold">
        Thông tin chuyển kho
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Từ chi nhánh">
          <Input value={BRANCH_NAME[branchId]} readOnly disabled />
        </Field>
        <Field label="Đến chi nhánh">
          <Input value={BRANCH_NAME[branchId]} readOnly disabled />
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
              {nhaKhoRows.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Đến nhà kho" required error={errors.denKhoId}>
          <Select
            value={values.denKhoId}
            onValueChange={(v) => onChange({ denKhoId: v, denNganChuaId: '' })}
          >
            <SelectTrigger aria-label="Đến nhà kho">
              <SelectValue placeholder="Chọn nhà kho" />
            </SelectTrigger>
            <SelectContent>
              {nhaKhoRows.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Đến ngăn chứa" required error={errors.denNganChuaId}>
          <Select
            value={values.denNganChuaId}
            onValueChange={(v) => onChange({ denNganChuaId: v })}
            disabled={!values.denKhoId}
          >
            <SelectTrigger aria-label="Đến ngăn chứa">
              <SelectValue
                placeholder={
                  values.denKhoId ? 'Chọn ngăn chứa' : 'Chọn nhà kho trước'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {denNganChuaOptions.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.tenNgan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </section>
  )
}
