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
import { useLookup } from '@/hooks/use-lookup'
import { CAP_LINH_KIEN_MUC_DICH_OPTIONS } from '@/domains/warehouse/types'

export interface CapLinhKienFilterValues {
  branchId?: string
  khoId?: string
  kyThuat?: string
  mucDich?: string
  soPhieuCap?: string
  soPhieuSC?: string
  maSanPham?: string
  nsx?: string
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
  const { rows: nhaKhoRows } = useLookup('nha-kho')

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

      <FilterField label="Nhà kho" htmlFor={`${uid}-kho`}>
        <Select
          value={filters.khoId ?? UNSET}
          onValueChange={(v) =>
            onChange({ khoId: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-kho`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả nhà kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả nhà kho</SelectItem>
            {nhaKhoRows.map((kho) => (
              <SelectItem key={kho.id} value={kho.id}>
                {kho.tenNhaKho}
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

      <FilterField label="Mục đích" htmlFor={`${uid}-muc-dich`}>
        <Select
          value={filters.mucDich ?? UNSET}
          onValueChange={(v) =>
            onChange({ mucDich: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger
            id={`${uid}-muc-dich`}
            className={filterControlClassName}
          >
            <SelectValue placeholder="Tất cả mục đích" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả mục đích</SelectItem>
            {CAP_LINH_KIEN_MUC_DICH_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
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

      <FilterField label="Số phiếu SC" htmlFor={`${uid}-psc`}>
        <Input
          id={`${uid}-psc`}
          className={filterControlClassName}
          value={filters.soPhieuSC ?? ''}
          onChange={(e) =>
            onChange({ soPhieuSC: e.target.value || undefined })
          }
        />
      </FilterField>

      <FilterField label="Mã sản phẩm" htmlFor={`${uid}-product`}>
        <Input
          id={`${uid}-product`}
          className={filterControlClassName}
          value={filters.maSanPham ?? ''}
          onChange={(e) =>
            onChange({ maSanPham: e.target.value || undefined })
          }
        />
      </FilterField>

      <FilterField label="Tên NSX" htmlFor={`${uid}-nsx`}>
        <Input
          id={`${uid}-nsx`}
          className={filterControlClassName}
          value={filters.nsx ?? ''}
          onChange={(e) => onChange({ nsx: e.target.value || undefined })}
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
