/**
 * Filter bar for Cấp Linh Kiện. `CheckOutSlip` carries branchId/kyThuat/
 * ngayLap — those filter server/client-side for real; the fetcher additionally
 * accepts soPhieu. Reference filters that reference line-level fields the
 * slip-level type doesn't carry (Số phiếu SC, Mã sản phẩm, Mục đích, NSX) are
 * out of scope for this list.
 */
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCHES } from '@/mock/seed/branches'
import { TECHNICIANS } from '@/domains/repair/reference-data'

export interface CapLinhKienFilterValues {
  branchId?: string
  kyThuat?: string
  soPhieuCap?: string
  dateFrom?: string
  dateTo?: string
}

interface CapLinhKienFiltersProps {
  filters: CapLinhKienFilterValues
  onChange: (next: Partial<CapLinhKienFilterValues>) => void
}

const UNSET = '__all__'

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function CapLinhKienFilters({ filters, onChange }: CapLinhKienFiltersProps) {
  const uid = useId()

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Chi nhánh" htmlFor={`${uid}-cn`}>
        <Select
          value={filters.branchId ?? UNSET}
          onValueChange={(v) => onChange({ branchId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-cn`} className="h-8 text-sm">
            <SelectValue placeholder="Tất cả chi nhánh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả chi nhánh</SelectItem>
            {BRANCHES.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Kỹ thuật" htmlFor={`${uid}-kt`}>
        <Select
          value={filters.kyThuat ?? UNSET}
          onValueChange={(v) => onChange({ kyThuat: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-kt`} className="h-8 text-sm">
            <SelectValue placeholder="Tất cả kỹ thuật" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả kỹ thuật</SelectItem>
            {TECHNICIANS.map((t) => (
              <SelectItem key={t.id} value={t.ten}>
                {t.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Số phiếu cấp" htmlFor={`${uid}-spc`}>
        <Input
          id={`${uid}-spc`}
          className="h-8 text-sm"
          value={filters.soPhieuCap ?? ''}
          onChange={(e) => onChange({ soPhieuCap: e.target.value || undefined })}
        />
      </Field>

      <Field label="Từ ngày" htmlFor={`${uid}-df`}>
        <Input
          id={`${uid}-df`}
          type="date"
          className="h-8 text-sm"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        />
      </Field>
      <Field label="Đến ngày" htmlFor={`${uid}-dt`}>
        <Input
          id={`${uid}-dt`}
          type="date"
          className="h-8 text-sm"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}
