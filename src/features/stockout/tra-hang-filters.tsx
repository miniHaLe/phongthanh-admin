/**
 * Filter bar for Trả Hàng (Chi nhánh, Hình thức trả, Số phiếu, date range).
 */
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { filterControlClassName } from '@/components/shared/filter-panel/filter-control-classes'
import {
  FilterField,
  filterFieldsGridClassName,
} from '@/components/shared/filter-panel/filter-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCHES } from '@/mock/seed/branches'

export const HINH_THUC_TRA_OPTIONS = [
  'Trả hàng từ kỹ thuật',
  'Trả hàng từ khách hàng',
  'Trả hàng cho nhà cung cấp',
  'Trả hàng từ kho',
] as const

export interface TraHangFilterValues {
  branchId?: string
  hinhThucTra?: string
  soPhieu?: string
  dateFrom?: string
  dateTo?: string
}

interface TraHangFiltersProps {
  filters: TraHangFilterValues
  onChange: (next: Partial<TraHangFilterValues>) => void
}

const UNSET = '__all__'

export function TraHangFilters({ filters, onChange }: TraHangFiltersProps) {
  const uid = useId()

  return (
    <div className={filterFieldsGridClassName}>
      <FilterField label="Chi nhánh" htmlFor={`${uid}-cn`}>
        <Select
          value={filters.branchId ?? UNSET}
          onValueChange={(v) =>
            onChange({ branchId: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-cn`} className={filterControlClassName}>
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
      </FilterField>

      <FilterField label="Hình thức trả" htmlFor={`${uid}-httr`}>
        <Select
          value={filters.hinhThucTra ?? UNSET}
          onValueChange={(v) =>
            onChange({ hinhThucTra: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger
            id={`${uid}-httr`}
            className={filterControlClassName}
            aria-label="Hình thức trả"
          >
            <SelectValue placeholder="Tất cả hình thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả hình thức</SelectItem>
            {HINH_THUC_TRA_OPTIONS.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Số phiếu" htmlFor={`${uid}-sp`}>
        <Input
          id={`${uid}-sp`}
          className={filterControlClassName}
          value={filters.soPhieu ?? ''}
          onChange={(e) => onChange({ soPhieu: e.target.value || undefined })}
        />
      </FilterField>

      <FilterField label="Từ ngày" htmlFor={`${uid}-df`}>
        <Input
          id={`${uid}-df`}
          type="date"
          className={filterControlClassName}
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        />
      </FilterField>
      <FilterField label="Đến ngày" htmlFor={`${uid}-dt`}>
        <Input
          id={`${uid}-dt`}
          type="date"
          className={filterControlClassName}
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        />
      </FilterField>
    </div>
  )
}
