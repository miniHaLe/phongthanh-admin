/**
 * Filter bar for Danh sách sử dụng linh kiện (11 reference filters). The
 * underlying fetcher only accepts branchId/tinhTrang/mucDich server-side; the
 * remaining filters are applied client-side by the page over the fetched set
 * (see ThuHoiLKPage.tsx) — the fetcher contract is owned elsewhere and is not
 * modified here.
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
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import { MANUFACTURERS, TECHNICIANS } from '@/domains/repair/reference-data'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  type RepairStatusId,
} from '@/domains/repair/status'
import type { IssuedPartTinhTrang } from '@/domains/warehouse/types'

export const MUC_DICH_OPTIONS = ['Sữa chữa dịch vụ', 'Bảo hành', 'Kỹ thuật mượn'] as const
export const TINH_TRANG_OPTIONS: IssuedPartTinhTrang[] = [
  'Đã trả xác LK',
  'Chưa trả xác LK',
  'Có trả LK',
  'Chưa trả LK',
]
const DATE_TYPE_OPTIONS = [
  { value: 'cap', label: 'Ngày Cấp' },
  { value: 'giao', label: 'Ngày Giao Phiếu' },
] as const

export interface IssuedUsageFilterValues {
  branchId?: string
  khoId?: string
  kyThuat?: string
  soPhieuCap?: string
  tinhTrangPhieu?: RepairStatusId
  soPhieuSC?: string
  soPhieuHang?: string
  maSanPham?: string
  mucDich?: string
  tinhTrang?: IssuedPartTinhTrang
  nsx?: string
  dateType?: 'cap' | 'giao'
  dateFrom?: string
  dateTo?: string
}

interface IssuedUsageFiltersProps {
  filters: IssuedUsageFilterValues
  onChange: (next: Partial<IssuedUsageFilterValues>) => void
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

export function IssuedUsageFilters({ filters, onChange }: IssuedUsageFiltersProps) {
  const uid = useId()
  const khoOptions = filters.branchId
    ? NHA_KHO_ROWS.filter((k) => k.chiNhanhId === filters.branchId)
    : NHA_KHO_ROWS

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Chi nhánh" htmlFor={`${uid}-cn`}>
        <Select
          value={filters.branchId ?? UNSET}
          onValueChange={(v) =>
            onChange({ branchId: v === UNSET ? undefined : v, khoId: undefined })
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
          onValueChange={(v) => onChange({ khoId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-kho`} className={filterControlClassName}>
            <SelectValue placeholder="Tất cả nhà kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả nhà kho</SelectItem>
            {khoOptions.map((k) => (
              <SelectItem key={k.id} value={k.tenNhaKho}>
                {k.tenNhaKho}
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
          <SelectTrigger id={`${uid}-kt`} className={filterControlClassName}>
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
          className={filterControlClassName}
          value={filters.soPhieuCap ?? ''}
          onChange={(e) => onChange({ soPhieuCap: e.target.value || undefined })}
        />
      </Field>

      <Field label="Tình trạng phiếu" htmlFor={`${uid}-ttp`}>
        <Select
          value={filters.tinhTrangPhieu != null ? String(filters.tinhTrangPhieu) : UNSET}
          onValueChange={(v) =>
            onChange({
              tinhTrangPhieu: v === UNSET ? undefined : (Number(v) as RepairStatusId),
            })
          }
        >
          <SelectTrigger id={`${uid}-ttp`} className={filterControlClassName} aria-label="Tình trạng phiếu">
            <SelectValue placeholder="Tất cả tình trạng phiếu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả tình trạng phiếu</SelectItem>
            {REPAIR_STATUS_DISPLAY_ORDER.map((id) => (
              <SelectItem key={id} value={String(id)}>
                {STATUS_LABEL[id]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Số phiếu SC" htmlFor={`${uid}-spsc`}>
        <Input
          id={`${uid}-spsc`}
          className={filterControlClassName}
          value={filters.soPhieuSC ?? ''}
          onChange={(e) => onChange({ soPhieuSC: e.target.value || undefined })}
        />
      </Field>

      <Field label="Số phiếu hãng" htmlFor={`${uid}-sph`}>
        <Input
          id={`${uid}-sph`}
          className={filterControlClassName}
          value={filters.soPhieuHang ?? ''}
          onChange={(e) => onChange({ soPhieuHang: e.target.value || undefined })}
        />
      </Field>

      <Field label="Mã sản phẩm" htmlFor={`${uid}-msp`}>
        <Input
          id={`${uid}-msp`}
          className={filterControlClassName}
          placeholder="Mã/tên hàng…"
          value={filters.maSanPham ?? ''}
          onChange={(e) => onChange({ maSanPham: e.target.value || undefined })}
        />
      </Field>

      <Field label="Mục Đích" htmlFor={`${uid}-md`}>
        <Select
          value={filters.mucDich ?? UNSET}
          onValueChange={(v) => onChange({ mucDich: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-md`} className={filterControlClassName} aria-label="Mục Đích">
            <SelectValue placeholder="Tất cả mục đích" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả mục đích</SelectItem>
            {MUC_DICH_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tình trạng" htmlFor={`${uid}-tt`}>
        <Select
          value={filters.tinhTrang ?? UNSET}
          onValueChange={(v) =>
            onChange({
              tinhTrang: v === UNSET ? undefined : (v as IssuedPartTinhTrang),
            })
          }
        >
          <SelectTrigger id={`${uid}-tt`} className={filterControlClassName} aria-label="Tình trạng">
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

      <Field label="Tên nhà sản xuất" htmlFor={`${uid}-nsx`}>
        <Select
          value={filters.nsx ?? UNSET}
          onValueChange={(v) => onChange({ nsx: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-nsx`} className={filterControlClassName}>
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

      <Field label="Loại ngày" htmlFor={`${uid}-dt`}>
        <Select
          value={filters.dateType ?? 'cap'}
          onValueChange={(v) => onChange({ dateType: v as 'cap' | 'giao' })}
        >
          <SelectTrigger id={`${uid}-dt`} className={filterControlClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_TYPE_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <Field label="Đến ngày" htmlFor={`${uid}-dtt`}>
        <Input
          id={`${uid}-dtt`}
          type="date"
          className={filterControlClassName}
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        />
      </Field>
    </div>
  )
}
