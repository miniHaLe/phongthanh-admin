import { useId } from 'react'
import { FilterField } from '@/components/shared/filter-panel/filter-field'
import { filterControlClassName } from '@/components/shared/filter-panel/filter-control-classes'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLookup } from '@/hooks/use-lookup'
import { BRANCHES } from '@/mock/seed/branches'

export interface ReceivingFilters {
  branchId?: string
  hinhThucThanhToan?: string
  khoId?: string
  nganChuaId?: string
  soPhieu?: string
  soDatHangHoaDon?: string
  maSanPham?: string
  nhaCungCap?: string
  nguoiLap?: string
  dateFrom?: string
  dateTo?: string
}

interface ReceivingFilterFieldsProps {
  filters: ReceivingFilters
  onChange: (patch: Partial<ReceivingFilters>) => void
}

const UNSET = '__all__'
const PAYMENT_METHODS = ['Tiền mặt', 'Công nợ', 'Chuyển khoản'] as const
const INPUT_FIELDS = [
  ['soPhieu', 'Số phiếu nhập kho', 'Số phiếu nhập kho', 'text'],
  ['soDatHangHoaDon', 'Số Đặt hàng/Hóa đơn', 'Số Đặt hàng/Hóa đơn', 'text'],
  ['maSanPham', 'Mã sản phẩm', 'Mã sản phẩm', 'text'],
  ['nhaCungCap', 'Nhà cung cấp', 'Nhập vào Tên/Số điện thoại', 'text'],
  ['nguoiLap', 'Người tạo', 'Người tạo', 'text'],
  ['dateFrom', 'Từ ngày', 'Từ ngày', 'date'],
  ['dateTo', 'Đến ngày', 'Đến ngày', 'date'],
] as const satisfies ReadonlyArray<
  readonly [keyof ReceivingFilters, string, string, 'text' | 'date']
>

export function ReceivingFilterFields({
  filters,
  onChange,
}: ReceivingFilterFieldsProps) {
  const uid = useId()
  const { rows: warehouses } = useLookup('nha-kho')
  const { rows: cabinets } = useLookup('ngan-chua')
  const cabinetOptions = filters.khoId
    ? cabinets.filter((row) => row.nhaKhoId === filters.khoId)
    : cabinets

  return (
    <>
      <FilterField label="Chi nhánh" htmlFor={`${uid}-branch`}>
        <Select
          value={filters.branchId ?? UNSET}
          onValueChange={(value) =>
            onChange({ branchId: value === UNSET ? undefined : value })
          }
        >
          <SelectTrigger id={`${uid}-branch`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả chi nhánh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả chi nhánh</SelectItem>
            {BRANCHES.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Hình thức thu chi" htmlFor={`${uid}-payment`}>
        <Select
          value={filters.hinhThucThanhToan ?? UNSET}
          onValueChange={(value) =>
            onChange({
              hinhThucThanhToan: value === UNSET ? undefined : value,
            })
          }
        >
          <SelectTrigger id={`${uid}-payment`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả</SelectItem>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Nhà kho" htmlFor={`${uid}-warehouse`}>
        <Select
          value={filters.khoId ?? UNSET}
          onValueChange={(value) =>
            onChange({
              khoId: value === UNSET ? undefined : value,
              nganChuaId: undefined,
            })
          }
        >
          <SelectTrigger id={`${uid}-warehouse`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả nhà kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả nhà kho</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.tenNhaKho}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Ngăn chứa" htmlFor={`${uid}-cabinet`}>
        <Select
          value={filters.nganChuaId ?? UNSET}
          onValueChange={(value) =>
            onChange({ nganChuaId: value === UNSET ? undefined : value })
          }
        >
          <SelectTrigger id={`${uid}-cabinet`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả ngăn chứa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả ngăn chứa</SelectItem>
            {cabinetOptions.map((cabinet) => (
              <SelectItem key={cabinet.id} value={cabinet.id}>
                {cabinet.tenNgan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {INPUT_FIELDS.map(([key, label, placeholder, type]) => {
        const id = `${uid}-${key}`
        return (
          <FilterField key={key} label={label} htmlFor={id}>
            <Input
              id={id}
              type={type}
              className={filterControlClassName}
              placeholder={placeholder}
              value={filters[key] ?? ''}
              onChange={(event) =>
                onChange({
                  [key]: event.target.value || undefined,
                } as Partial<ReceivingFilters>)
              }
            />
          </FilterField>
        )
      })}
    </>
  )
}
