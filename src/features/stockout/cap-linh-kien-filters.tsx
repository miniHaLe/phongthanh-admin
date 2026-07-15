/**
 * Filter bar for Cấp Linh Kiện. `CheckOutSlip` carries branchId/kyThuat/
 * ngayLap — those filter server/client-side for real; the fetcher additionally
 * accepts soPhieu. Reference filters that reference line-level fields the
 * slip-level type doesn't carry (Số phiếu SC, Mã sản phẩm, Mục đích, NSX) are
 * out of scope for this list.
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

export function CapLinhKienFilters({
  filters,
  onChange,
}: CapLinhKienFiltersProps) {
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

      <FilterField label="Kỹ thuật viên" htmlFor={`${uid}-kt`}>
        <Select
          value={filters.kyThuat ?? UNSET}
          onValueChange={(v) =>
            onChange({ kyThuat: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-kt`} className={filterControlClassName}>
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
      </FilterField>

      <FilterField label="Số phiếu cấp" htmlFor={`${uid}-spc`}>
        <Input
          id={`${uid}-spc`}
          className={filterControlClassName}
          value={filters.soPhieuCap ?? ''}
          onChange={(e) =>
            onChange({ soPhieuCap: e.target.value || undefined })
          }
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
