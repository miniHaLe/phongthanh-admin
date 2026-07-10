/**
 * Filter bar for DSTraLK (9 reference filters). The fetcher supports
 * branchId/tinhTrang/hinhThuc server-side; remaining filters are applied
 * client-side by the page over the fetched set.
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
import { MANUFACTURERS, TECHNICIANS } from '@/domains/repair/reference-data'
import type { PartReturnTinhTrang } from '@/domains/warehouse/types'

export const TINH_TRANG_OPTIONS: PartReturnTinhTrang[] = ['Chờ duyệt', 'Đã duyệt']
export const LOAI_TRA_OPTIONS = ['Trả từ phiếu', 'Trả từ kỹ thuật'] as const

export interface PartReturnFilterValues {
  branchId?: string
  kyThuat?: string
  soPhieuCap?: string
  nsx?: string
  soPhieuSC?: string
  soPhieuHang?: string
  maSanPham?: string
  tinhTrang?: PartReturnTinhTrang
  hinhThuc?: string
  dateFrom?: string
  dateTo?: string
}

interface PartReturnFiltersProps {
  filters: PartReturnFilterValues
  onChange: (next: Partial<PartReturnFilterValues>) => void
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

export function PartReturnFilters({ filters, onChange }: PartReturnFiltersProps) {
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
            <SelectValue placeholder="Tất cả KTV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả KTV</SelectItem>
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

      <Field label="Tên nhà sản xuất" htmlFor={`${uid}-nsx`}>
        <Select
          value={filters.nsx ?? UNSET}
          onValueChange={(v) => onChange({ nsx: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-nsx`} className="h-8 text-sm">
            <SelectValue placeholder="Tất cả NSX" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả NSX</SelectItem>
            {MANUFACTURERS.map((m) => (
              <SelectItem key={m.id} value={m.ten}>
                {m.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Số phiếu SC" htmlFor={`${uid}-spsc`}>
        <Input
          id={`${uid}-spsc`}
          className="h-8 text-sm"
          value={filters.soPhieuSC ?? ''}
          onChange={(e) => onChange({ soPhieuSC: e.target.value || undefined })}
        />
      </Field>

      <Field label="Số phiếu hãng" htmlFor={`${uid}-sph`}>
        <Input
          id={`${uid}-sph`}
          className="h-8 text-sm"
          value={filters.soPhieuHang ?? ''}
          onChange={(e) => onChange({ soPhieuHang: e.target.value || undefined })}
        />
      </Field>

      <Field label="Mã sản phẩm" htmlFor={`${uid}-msp`}>
        <Input
          id={`${uid}-msp`}
          className="h-8 text-sm"
          placeholder="Mã/tên hàng…"
          value={filters.maSanPham ?? ''}
          onChange={(e) => onChange({ maSanPham: e.target.value || undefined })}
        />
      </Field>

      <Field label="Tình trạng" htmlFor={`${uid}-tt`}>
        <Select
          value={filters.tinhTrang ?? UNSET}
          onValueChange={(v) =>
            onChange({ tinhTrang: v === UNSET ? undefined : (v as PartReturnTinhTrang) })
          }
        >
          <SelectTrigger id={`${uid}-tt`} className="h-8 text-sm" aria-label="Tình trạng">
            <SelectValue placeholder="Tất cả tình trạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả tình trạng</SelectItem>
            {TINH_TRANG_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Loại trả" htmlFor={`${uid}-lt`}>
        <Select
          value={filters.hinhThuc ?? UNSET}
          onValueChange={(v) => onChange({ hinhThuc: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-lt`} className="h-8 text-sm" aria-label="Loại trả">
            <SelectValue placeholder="Tất cả loại trả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả loại trả</SelectItem>
            {LOAI_TRA_OPTIONS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
