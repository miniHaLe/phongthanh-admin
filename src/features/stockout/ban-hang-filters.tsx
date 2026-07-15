/**
 * Filter bar for Bán Hàng (7 reference filters: Chi nhánh, Nhà kho, Hình thức
 * thu chi, Số phiếu/Ghi chú, Tên khách hàng, Mã hàng/Tên hàng, date range).
 * `SellingOrder` only carries branchId/khachHang/soPhieu/ghiChu server-side —
 * Nhà kho/Hình thức thu chi/Mã hàng render as UI-only selectors that don't
 * currently narrow the fetched rows, since the slip-level type has no such
 * fields.
 */
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { filterControlClassName } from '@/components/shared/filter-panel/filter-control-classes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRANCHES } from '@/mock/seed/branches'
import { useLookup } from '@/hooks/use-lookup'

const HINH_THUC_THU_CHI_OPTIONS = ['Tiền mặt', 'Công nợ', 'Chuyển khoản']

export interface BanHangFilterValues {
  branchId?: string
  khoId?: string
  hinhThucThuChi?: string
  soPhieu?: string
  tenKhachHang?: string
  maHang?: string
  dateFrom?: string
  dateTo?: string
}

interface BanHangFiltersProps {
  filters: BanHangFilterValues
  onChange: (next: Partial<BanHangFilterValues>) => void
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
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

export function BanHangFilters({ filters, onChange }: BanHangFiltersProps) {
  const uid = useId()
  const { rows: nhaKhoRows } = useLookup('nha-kho')

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Chi nhánh" htmlFor={`${uid}-cn`}>
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
      </Field>

      <Field label="Nhà kho" htmlFor={`${uid}-kho`}>
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
            {nhaKhoRows.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.tenNhaKho}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Hình thức thu chi" htmlFor={`${uid}-httc`}>
        <Select
          value={filters.hinhThucThuChi ?? UNSET}
          onValueChange={(v) =>
            onChange({ hinhThucThuChi: v === UNSET ? undefined : v })
          }
        >
          <SelectTrigger id={`${uid}-httc`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả</SelectItem>
            {HINH_THUC_THU_CHI_OPTIONS.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Số phiếu/Ghi chú" htmlFor={`${uid}-sp`}>
        <Input
          id={`${uid}-sp`}
          className={filterControlClassName}
          value={filters.soPhieu ?? ''}
          onChange={(e) => onChange({ soPhieu: e.target.value || undefined })}
        />
      </Field>

      <Field label="Tên khách hàng" htmlFor={`${uid}-kh`}>
        <Input
          id={`${uid}-kh`}
          className={filterControlClassName}
          value={filters.tenKhachHang ?? ''}
          onChange={(e) =>
            onChange({ tenKhachHang: e.target.value || undefined })
          }
        />
      </Field>

      <Field label="Mã hàng/Tên hàng" htmlFor={`${uid}-mh`}>
        <Input
          id={`${uid}-mh`}
          className={filterControlClassName}
          value={filters.maHang ?? ''}
          onChange={(e) => onChange({ maHang: e.target.value || undefined })}
        />
      </Field>

      <Field label="Từ ngày" htmlFor={`${uid}-df`}>
        <Input
          id={`${uid}-df`}
          type="date"
          className={filterControlClassName}
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        />
      </Field>
      <Field label="Đến ngày" htmlFor={`${uid}-dt`}>
        <Input
          id={`${uid}-dt`}
          type="date"
          className={filterControlClassName}
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}
