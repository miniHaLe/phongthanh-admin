/**
 * KT board search panel — the reference "Thông tin tìm kiếm" fieldset (12
 * fields, in order). Distinct field set from the admin repair-list advanced
 * filters (own Sản phẩm/Model autocompletes, KT-scoped Tình trạng select).
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
import { ServerAutocomplete, type AutocompleteOption } from '@/components/shared'
import { STATUS_HEX, STATUS_LABEL, type RepairStatusId } from '@/domains/repair/status'
import {
  HINH_THUC_LABEL,
  type HinhThuc,
  type RepairListFilters,
} from '@/domains/repair/types'
import {
  MANUFACTURERS,
  PRODUCTS,
  MODELS,
  TINH_OPTIONS,
  HUYEN_BY_TINH,
} from '@/domains/repair/reference-data'

/**
 * KT status filter presentation sequence — distinct from the ascending
 * membership set the canonical status module exports. Defined here (in the KT
 * board module) rather than in the status module; never deep-equal the two.
 */
export const KT_DISPLAY_ORDER: readonly RepairStatusId[] = [
  2, 4, 15, 6, 7, 13, 17, 16, 8, 9,
]

/** "Hình thức chung" options in the reference order. */
const HINH_THUC_ORDER: HinhThuc[] = ['bao_hanh', 'sua_dich_vu', 'bh_sua_chua']

const UNSET = '__none__'

interface RepairKtFiltersProps {
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

async function searchManufacturers(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return MANUFACTURERS.filter((m) => m.ten.toLowerCase().includes(q)).map((m) => ({
    id: m.id,
    label: m.ten,
  }))
}

async function searchProducts(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return PRODUCTS.filter((p) => p.ten.toLowerCase().includes(q)).map((p) => ({
    id: p.id,
    label: p.ten,
  }))
}

async function searchModels(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return MODELS.filter((m) => m.ten.toLowerCase().includes(q)).map((m) => ({
    id: m.id,
    label: m.ten,
  }))
}

/** Resolve a display label for an already-selected id (independent fields — no cascade). */
function labelOfId(
  id: string | undefined,
  list: ReadonlyArray<{ id: string; ten: string }>,
): string {
  if (!id) return ''
  return list.find((item) => item.id === id)?.ten ?? ''
}

export function RepairKtFilters({ filters, onChange }: RepairKtFiltersProps) {
  const uid = useId()
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
      {/* 1. Số phiếu SC */}
      <Field label="Số phiếu SC" htmlFor={`${uid}-sophieu`}>
        <Input
          id={`${uid}-sophieu`}
          className="h-8 text-sm"
          placeholder="Số phiếu SC"
          value={filters.soPhieu ?? ''}
          onChange={(e) => onChange({ soPhieu: e.target.value || undefined })}
        />
      </Field>

      {/* 2. Số phiếu hãng */}
      <Field label="Số phiếu hãng" htmlFor={`${uid}-sph`}>
        <Input
          id={`${uid}-sph`}
          className="h-8 text-sm"
          placeholder="Số phiếu hãng"
          value={filters.soPhieuHang ?? ''}
          onChange={(e) => onChange({ soPhieuHang: e.target.value || undefined })}
        />
      </Field>

      {/* 3. Số Serial */}
      <Field label="Số Serial" htmlFor={`${uid}-serial`}>
        <Input
          id={`${uid}-serial`}
          className="h-8 text-sm"
          placeholder="Số Serial"
          value={filters.soSerial ?? ''}
          onChange={(e) => onChange({ soSerial: e.target.value || undefined })}
        />
      </Field>

      {/* 4. Tên khách hàng */}
      <Field label="Tên khách hàng" htmlFor={`${uid}-ten`}>
        <Input
          id={`${uid}-ten`}
          className="h-8 text-sm"
          placeholder="Tên khách hàng"
          value={filters.tenKhachHang ?? ''}
          onChange={(e) => onChange({ tenKhachHang: e.target.value || undefined })}
        />
      </Field>

      {/* 5. Điện thoại */}
      <Field label="Điện thoại" htmlFor={`${uid}-dt`}>
        <Input
          id={`${uid}-dt`}
          className="h-8 text-sm"
          placeholder="Điện thoại"
          value={filters.sdt ?? ''}
          onChange={(e) => onChange({ sdt: e.target.value || undefined })}
        />
      </Field>

      {/* 6. Tên nhà sản xuất */}
      <Field label="Tên nhà sản xuất">
        <ServerAutocomplete
          value={
            filters.nhaSanXuatId
              ? {
                  id: filters.nhaSanXuatId,
                  label: labelOfId(filters.nhaSanXuatId, MANUFACTURERS),
                }
              : null
          }
          onChange={(opt) => onChange({ nhaSanXuatId: opt?.id })}
          placeholder="Tên nhà sản xuất"
          fetchOptions={searchManufacturers}
        />
      </Field>

      {/* 7. Sản phẩm (V4: legacy "Sản phầm" typo corrected) */}
      <Field label="Sản phẩm">
        <ServerAutocomplete
          value={
            filters.sanPhamId
              ? { id: filters.sanPhamId, label: labelOfId(filters.sanPhamId, PRODUCTS) }
              : null
          }
          onChange={(opt) => onChange({ sanPhamId: opt?.id })}
          placeholder="Sản phẩm"
          fetchOptions={searchProducts}
        />
      </Field>

      {/* 8. Model */}
      <Field label="Model">
        <ServerAutocomplete
          value={
            filters.modelId
              ? { id: filters.modelId, label: labelOfId(filters.modelId, MODELS) }
              : null
          }
          onChange={(opt) => onChange({ modelId: opt?.id })}
          placeholder="Model"
          fetchOptions={searchModels}
        />
      </Field>

      {/* 9. Tình trạng — KT-scoped 10-option subset, presentation order */}
      <Field label="Tình trạng" htmlFor={`${uid}-tt`}>
        <Select
          value={filters.tinhTrang != null ? String(filters.tinhTrang) : UNSET}
          onValueChange={(v) =>
            onChange({
              tinhTrang: v === UNSET ? undefined : (Number(v) as RepairStatusId),
            })
          }
        >
          <SelectTrigger id={`${uid}-tt`} className="h-8 text-sm">
            <SelectValue placeholder="Tất cả tình trạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNSET}>Tất cả tình trạng</SelectItem>
            {KT_DISPLAY_ORDER.map((id) => (
              <SelectItem key={id} value={String(id)} data-status-id={id}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: STATUS_HEX[id] }}
                  />
                  {STATUS_LABEL[id]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* 10. Hình thức chung */}
      <Field label="Hình thức chung">
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {HINH_THUC_ORDER.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-1.5 text-sm"
            >
              <Checkbox
                checked={(filters.hinhThuc ?? []).includes(value)}
                onCheckedChange={(c) => handleHinhThuc(value, !!c)}
                aria-label={HINH_THUC_LABEL[value]}
              />
              {HINH_THUC_LABEL[value]}
            </label>
          ))}
        </div>
      </Field>

      {/* 11. Tên Tỉnh */}
      <Field label="Tên Tỉnh" htmlFor={`${uid}-tinh`}>
        <Select
          value={filters.tinh ?? UNSET}
          onValueChange={(v) =>
            onChange({ tinh: v === UNSET ? undefined : v, huyen: undefined })
          }
        >
          <SelectTrigger id={`${uid}-tinh`} className="h-8 text-sm">
            <SelectValue placeholder="Tên Tỉnh" />
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

      {/* 12. TP/Huyện */}
      <Field label="TP/Huyện" htmlFor={`${uid}-huyen`}>
        <Select
          value={filters.huyen ?? UNSET}
          onValueChange={(v) => onChange({ huyen: v === UNSET ? undefined : v })}
          disabled={!filters.tinh}
        >
          <SelectTrigger id={`${uid}-huyen`} className="h-8 text-sm">
            <SelectValue placeholder="TP/Huyện" />
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
    </div>
  )
}
