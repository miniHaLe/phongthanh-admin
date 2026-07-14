/**
 * Filter bar for Chuyển Kho (Từ chi nhánh, Đến chi nhánh, Số phiếu, date
 * range, Trạng thái).
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
import type { ChuyenKhoTrangThai } from '@/domains/warehouse/types'

export const TRANG_THAI_OPTIONS: ChuyenKhoTrangThai[] = [
  'Chưa xác nhận',
  'Đã xác nhận',
  'Không xác nhận',
]

export interface ChuyenKhoFilterValues {
  tuChiNhanh?: string
  denChiNhanh?: string
  soPhieu?: string
  trangThai?: ChuyenKhoTrangThai
  dateFrom?: string
  dateTo?: string
}

interface ChuyenKhoFiltersProps {
  filters: ChuyenKhoFilterValues
  onChange: (next: Partial<ChuyenKhoFilterValues>) => void
}

const UNSET = '__all__'

export function ChuyenKhoFilters({ filters, onChange }: ChuyenKhoFiltersProps) {
  const uid = useId()

  return (
    <div className={filterFieldsGridClassName}>
      <FilterField label="Từ chi nhánh" htmlFor={`${uid}-tucn`}>
        <Select
          value={filters.tuChiNhanh ?? UNSET}
          onValueChange={(v) =>
            onChange({ tuChiNhanh: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-tucn`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả</SelectItem>
            {BRANCHES.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Đến chi nhánh" htmlFor={`${uid}-dencn`}>
        <Select
          value={filters.denChiNhanh ?? UNSET}
          onValueChange={(v) =>
            onChange({ denChiNhanh: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-dencn`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả</SelectItem>
            {BRANCHES.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
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

      <FilterField label="Trạng thái" htmlFor={`${uid}-tt`}>
        <Select
          value={filters.trangThai ?? UNSET}
          onValueChange={(v) =>
            onChange({
              trangThai: v === UNSET ? undefined : (v as ChuyenKhoTrangThai),
            })
          }
        >
          <SelectTrigger
            id={`${uid}-tt`}
            className={filterControlClassName}
            aria-label="Trạng thái"
          >
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả trạng thái</SelectItem>
            {TRANG_THAI_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
