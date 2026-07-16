/**
 * Advanced (collapsible) filter section — the reference Index_8 "Thông tin tìm
 * kiếm" field set. Số phiếu hãng writes its own key (bug fix); Số phiếu / Số
 * phiếu hãng / Số Serial / Tên KH are independent, combinable fields.
 */
import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServerAutocomplete, KyPicker } from '@/components/shared'
import type { RepairListFilters, HinhThuc } from '@/domains/repair/types'
import {
  MANUFACTURERS,
  PRODUCTS,
  MODELS,
  TECHNICIANS,
  TINH_OPTIONS,
  HUYEN_BY_TINH,
} from '@/domains/repair/reference-data'
import { searchCustomers } from '@/domains/repair/mock-data'
import { BRANCHES } from '@/mock/seed/branches'

const HINH_THUC_OPTIONS: Array<{ value: HinhThuc; label: string }> = [
  { value: 'bao_hanh', label: 'Bảo hành' },
  { value: 'sua_dich_vu', label: 'Sửa dịch vụ' },
  { value: 'bh_sua_chua', label: 'BH sửa chữa' },
]

const LOAI_BAO_HANH_OPTIONS = [
  { value: 'tai_tram', label: 'Tại Trạm' },
  { value: 'nha_khach', label: 'Nhà Khách' },
] as const

const DATE_TYPE_OPTIONS = [
  { value: 'nhan', label: 'Ngày Nhận' },
  { value: 'giao', label: 'Ngày Giao' },
  { value: 'sua_xong', label: 'Ngày Sửa Xong' },
  { value: 'hoan_thanh', label: 'Ngày Hoàn Thành' },
] as const

interface RepairFiltersAdvancedProps {
  filters: RepairListFilters
  onChange: (next: Partial<RepairListFilters>) => void
}

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

const UNSET = '__none__'

export function RepairFiltersAdvanced({
  filters,
  onChange,
}: RepairFiltersAdvancedProps) {
  const uid = useId()

  const filteredProducts = filters.nhaSanXuatId
    ? PRODUCTS.filter((p) => p.nhaSanXuatId === filters.nhaSanXuatId)
    : PRODUCTS
  const filteredModels = filters.sanPhamId
    ? MODELS.filter((m) => m.productId === filters.sanPhamId)
    : MODELS
  const filteredHuyen = filters.tinh ? (HUYEN_BY_TINH[filters.tinh] ?? []) : []

  function handleHinhThuc(value: HinhThuc, checked: boolean) {
    const current = filters.hinhThuc ?? []
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value)
    onChange({ hinhThuc: next.length ? next : undefined })
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Chi nhánh (options from BRANCHES — 3rd branch added in P6, V1) */}
      <Field label="Chi nhánh" htmlFor={`${uid}-cn`}>
        <Select
          value={filters.branchId ?? UNSET}
          onValueChange={(v) => onChange({ branchId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-cn`} className="h-11 text-base md:h-8 md:text-sm">
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

      {/* Tên nhà sản xuất */}
      <Field label="Tên nhà sản xuất" htmlFor={`${uid}-nsx`}>
        <Select
          value={filters.nhaSanXuatId ?? UNSET}
          onValueChange={(v) =>
            onChange({
              nhaSanXuatId: v === UNSET ? undefined : v,
              sanPhamId: undefined,
              modelId: undefined,
            })
          }
        >
          <SelectTrigger id={`${uid}-nsx`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả NSX" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả NSX</SelectItem>
            {MANUFACTURERS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Sản phẩm */}
      <Field label="Sản phẩm" htmlFor={`${uid}-sp`}>
        <Select
          value={filters.sanPhamId ?? UNSET}
          onValueChange={(v) =>
            onChange({ sanPhamId: v === UNSET ? undefined : v, modelId: undefined })
          }
        >
          <SelectTrigger id={`${uid}-sp`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả sản phẩm</SelectItem>
            {filteredProducts.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Model (searchable without parent) */}
      <Field label="Model" htmlFor={`${uid}-model`}>
        <Select
          value={filters.modelId ?? UNSET}
          onValueChange={(v) => onChange({ modelId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-model`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả model</SelectItem>
            {filteredModels.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Hình thức chung (3-value checkbox group) */}
      <Field label="Hình thức chung">
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {HINH_THUC_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 text-base md:min-h-0 md:text-sm"
            >
              <Checkbox
                checked={(filters.hinhThuc ?? []).includes(opt.value)}
                onCheckedChange={(c) => handleHinhThuc(opt.value, !!c)}
                aria-label={opt.label}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Field>

      {/* Số phiếu hãng (bug fix — own key) */}
      <Field label="Số phiếu hãng" htmlFor={`${uid}-sph`}>
        <Input
          id={`${uid}-sph`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Nhập số phiếu hãng…"
          value={filters.soPhieuHang ?? ''}
          onChange={(e) => onChange({ soPhieuHang: e.target.value || undefined })}
        />
      </Field>

      {/* Số Serial */}
      <Field label="Số Serial" htmlFor={`${uid}-serial`}>
        <Input
          id={`${uid}-serial`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Nhập số serial…"
          value={filters.soSerial ?? ''}
          onChange={(e) => onChange({ soSerial: e.target.value || undefined })}
        />
      </Field>

      {/* Tên/ĐT khách hàng (ServerAutocomplete over searchCustomers) */}
      <Field label="Tên/ĐT khách hàng">
        <ServerAutocomplete
          value={
            filters.khachHangId
              ? { id: filters.khachHangId, label: filters.tenKhachHang ?? '' }
              : null
          }
          onChange={(opt) =>
            onChange({
              khachHangId: opt?.id,
              tenKhachHang: opt?.label,
            })
          }
          placeholder="Tìm khách hàng…"
          fetchOptions={async (q) => {
            const customers = await searchCustomers(q)
            return customers.map((c) => ({ id: c.id, label: `${c.ten} — ${c.sdt}` }))
          }}
        />
      </Field>

      {/* Kỹ thuật */}
      <Field label="Kỹ thuật" htmlFor={`${uid}-kt`}>
        <Select
          value={filters.kyThuatId ?? UNSET}
          onValueChange={(v) => onChange({ kyThuatId: v === UNSET ? undefined : v })}
        >
          <SelectTrigger id={`${uid}-kt`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả KTV" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả KTV</SelectItem>
            {TECHNICIANS.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.ten}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Tên Tỉnh */}
      <Field label="Tên Tỉnh" htmlFor={`${uid}-tinh`}>
        <Select
          value={filters.tinh ?? UNSET}
          onValueChange={(v) =>
            onChange({ tinh: v === UNSET ? undefined : v, huyen: undefined })
          }
        >
          <SelectTrigger id={`${uid}-tinh`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả tỉnh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả tỉnh</SelectItem>
            {TINH_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* TP/Huyện */}
      <Field label="TP/Huyện" htmlFor={`${uid}-huyen`}>
        <Select
          value={filters.huyen ?? UNSET}
          onValueChange={(v) => onChange({ huyen: v === UNSET ? undefined : v })}
          disabled={!filters.tinh}
        >
          <SelectTrigger id={`${uid}-huyen`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả huyện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả huyện</SelectItem>
            {filteredHuyen.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tên khu vực" htmlFor={`${uid}-khuvuc`}>
        <Input
          id={`${uid}-khuvuc`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Tên khu vực"
          value={filters.khuVuc ?? ''}
          onChange={(e) => onChange({ khuVuc: e.target.value || undefined })}
        />
      </Field>

      {/* Tuyến */}
      <Field label="Tuyến" htmlFor={`${uid}-tuyen`}>
        <Input
          id={`${uid}-tuyen`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Nhập tuyến…"
          value={filters.tuyen ?? ''}
          onChange={(e) => onChange({ tuyen: e.target.value || undefined })}
        />
      </Field>

      {/* Đại lý */}
      <Field label="Đại lý" htmlFor={`${uid}-daily`}>
        <Input
          id={`${uid}-daily`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Nhập đại lý…"
          value={filters.daiLy ?? ''}
          onChange={(e) => onChange({ daiLy: e.target.value || undefined })}
        />
      </Field>

      {/* Loại bảo hành (Tại Trạm / Nhà Khách) */}
      <Field label="Loại bảo hành" htmlFor={`${uid}-lbh`}>
        <Select
          value={filters.loaiBaoHanh ?? UNSET}
          onValueChange={(v) =>
            onChange({
              loaiBaoHanh:
                v === UNSET ? undefined : (v as RepairListFilters['loaiBaoHanh']),
            })
          }
        >
          <SelectTrigger id={`${uid}-lbh`} className="h-11 text-base md:h-8 md:text-sm">
            <SelectValue placeholder="Tất cả loại BH" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả loại BH</SelectItem>
            {LOAI_BAO_HANH_OPTIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Địa chỉ */}
      <Field label="Địa chỉ" htmlFor={`${uid}-diachi`}>
        <Input
          id={`${uid}-diachi`}
          className="h-11 text-base md:h-8 md:text-sm"
          placeholder="Nhập địa chỉ…"
          value={filters.diaChi ?? ''}
          onChange={(e) => onChange({ diaChi: e.target.value || undefined })}
        />
      </Field>

      {/* Kỳ hoàn tất */}
      <Field label="Kỳ hoàn tất">
        <KyPicker
          label=""
          value={filters.kyId}
          onChange={(kyId) => onChange({ kyId })}
        />
      </Field>

      {/* DateType */}
      <Field label="Loại ngày" htmlFor={`${uid}-datetype`}>
        <Select
          value={filters.dateType ?? 'nhan'}
          onValueChange={(v) =>
            onChange({ dateType: v as RepairListFilters['dateType'] })
          }
        >
          <SelectTrigger id={`${uid}-datetype`} className="h-11 text-base md:h-8 md:text-sm">
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

      {/* Từ ngày / Đến ngày */}
      <Field label="Từ ngày" htmlFor={`${uid}-df`}>
        <Input
          id={`${uid}-df`}
          type="date"
          className="h-11 text-base md:h-8 md:text-sm"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        />
      </Field>
      <Field label="Đến ngày" htmlFor={`${uid}-dt`}>
        <Input
          id={`${uid}-dt`}
          type="date"
          className="h-11 text-base md:h-8 md:text-sm"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        />
      </Field>

      {/* Sửa gấp */}
      <Field label="Sửa gấp">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 pt-1 text-base md:min-h-0 md:text-sm">
          <Checkbox
            checked={!!filters.suaGap}
            onCheckedChange={(c) => onChange({ suaGap: c ? true : undefined })}
            aria-label="Sửa gấp"
          />
          Chỉ phiếu sửa gấp
        </label>
      </Field>
    </div>
  )
}
