/**
 * "Thông tin chung" fieldset for the Cấp Linh Kiện create editor. Số phiếu is
 * always auto-generated; Kỹ thuật is a required autocomplete over the shared
 * TECHNICIANS reference list; Ghi chú is free text.
 */
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ServerAutocomplete, type AutocompleteOption } from '@/components/shared'
import { TECHNICIANS } from '@/domains/repair/reference-data'

export interface CapLinhKienHeaderValues {
  kyThuat: AutocompleteOption | null
  ghiChu: string
}

interface CapLinhKienHeaderFieldsProps {
  values: CapLinhKienHeaderValues
  onChange: (patch: Partial<CapLinhKienHeaderValues>) => void
  error?: string
}

export async function searchTechnicians(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q ? TECHNICIANS.filter((t) => t.ten.toLowerCase().includes(q)) : TECHNICIANS
  return list.map((t) => ({ id: t.id, label: t.ten }))
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

export function CapLinhKienHeaderFields({
  values,
  onChange,
  error,
}: CapLinhKienHeaderFieldsProps) {
  return (
    <section aria-labelledby="section-clk-info">
      <h2 id="section-clk-info" className="mb-4 text-base font-semibold">
        Thông tin chung
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Số phiếu">
          <Input value="Phát sinh tự động" readOnly disabled />
        </Field>

        <Field label="Ngày cấp">
          <Input type="date" value={new Date().toISOString().slice(0, 10)} readOnly disabled />
        </Field>

        <Field label="Kỹ thuật" required error={error}>
          <ServerAutocomplete
            value={values.kyThuat}
            onChange={(opt) => onChange({ kyThuat: opt })}
            fetchOptions={searchTechnicians}
            placeholder="Tìm kỹ thuật…"
          />
        </Field>

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Ghi chú">
            <Textarea
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
