/**
 * "Thêm khu vực" quick-create modal — legacy-parity fields on the post-2025
 * two-level hierarchy: Tỉnh (34) → Phường/Xã (required, scoped, searchable) +
 * Tên khu vực + Cây số + Tiền công 1/2. Persists a real row via
 * `khuVucConfig.mockApi.create` (the same array `searchKhuVuc` reads), so the
 * created khu vực is immediately selectable and searchable.
 */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CommuneCombobox } from '@/components/shared/commune-combobox'
import { notify, type AutocompleteOption } from '@/components/shared'
import { khuVucConfig } from '@/config/crud-configs/khu-vuc.config'
import { invalidateCrudQueries } from '@/hooks/use-crud'
import { fetchVietnamAdministrativeSnapshot } from '@/api/vietnam-geography'
import {
  KHU_VUC_GEOGRAPHY_QUERY_KEY,
  primeKhuVucGeographyNames,
} from '@/features/khu-vuc/khu-vuc-geography-fields'

interface QuickCreateKhuVucProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

interface FieldErrors {
  tinhCode?: string
  phuongXaCode?: string
  tenKhuVuc?: string
}

const UNSET = '__none__'

export function QuickCreateKhuVuc({ close, select }: QuickCreateKhuVucProps) {
  const queryClient = useQueryClient()
  const snapshotQuery = useQuery({
    queryKey: KHU_VUC_GEOGRAPHY_QUERY_KEY,
    queryFn: async () => {
      const snapshot = await fetchVietnamAdministrativeSnapshot()
      primeKhuVucGeographyNames(snapshot)
      return snapshot
    },
    staleTime: Infinity,
  })
  const provinces = snapshotQuery.data?.provinces ?? []
  const communes = snapshotQuery.data?.communes ?? []

  const [tinhCode, setTinhCode] = useState('')
  const [phuongXaCode, setPhuongXaCode] = useState('')
  const [tenKhuVuc, setTenKhuVuc] = useState('')
  const [caySo, setCaySo] = useState('')
  const [tienCong, setTienCong] = useState('')
  const [tienCong2, setTienCong2] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const nextErrors: FieldErrors = {}
    if (!tinhCode) nextErrors.tinhCode = 'Vui lòng chọn Tỉnh.'
    if (!phuongXaCode) nextErrors.phuongXaCode = 'Vui lòng chọn Phường/Xã.'
    if (!tenKhuVuc.trim()) nextErrors.tenKhuVuc = 'Vui lòng nhập Tên khu vực.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const created = await khuVucConfig.mockApi.create({
        tenKhuVuc: tenKhuVuc.trim(),
        tinhCode,
        phuongXaCode,
        caySo: caySo ? Number(caySo) : 0,
        tienCong: tienCong ? Number(tienCong) : 0,
        tienCong2: tienCong2 ? Number(tienCong2) : 0,
        active: true,
      })
      await invalidateCrudQueries(queryClient, 'khu-vuc')
      notify.success('Đã thêm khu vực thành công')
      select({ id: created.id, label: created.tenKhuVuc })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm khu vực.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="qc-kv-tinh">
            Tỉnh <span className="text-destructive">*</span>
          </Label>
          <Select
            value={tinhCode || UNSET}
            onValueChange={(value) => {
              const code = value === UNSET ? '' : value
              setTinhCode(code)
              // Clear a commune that no longer belongs to the chosen province.
              setPhuongXaCode('')
              setErrors((e) => ({ ...e, tinhCode: undefined }))
            }}
          >
            <SelectTrigger
              id="qc-kv-tinh"
              aria-required="true"
              aria-invalid={Boolean(errors.tinhCode)}
            >
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tinhCode && (
            <p className="text-xs text-destructive">{errors.tinhCode}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qc-kv-phuong-xa">
            Phường/Xã <span className="text-destructive">*</span>
          </Label>
          <CommuneCombobox
            id="qc-kv-phuong-xa"
            communes={communes}
            provinceCode={tinhCode}
            value={phuongXaCode}
            disabled={!tinhCode}
            invalid={Boolean(errors.phuongXaCode)}
            onClear={() => setPhuongXaCode('')}
            onSelect={(commune) => {
              setPhuongXaCode(commune.code)
              setTinhCode(commune.provinceCode)
              setErrors((e) => ({ ...e, phuongXaCode: undefined }))
            }}
          />
          {errors.phuongXaCode && (
            <p className="text-xs text-destructive">{errors.phuongXaCode}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="qc-kv-ten">
            Tên khu vực <span className="text-destructive">*</span>
          </Label>
          <Input
            id="qc-kv-ten"
            value={tenKhuVuc}
            onChange={(e) => {
              setTenKhuVuc(e.target.value)
              setErrors((prev) => ({ ...prev, tenKhuVuc: undefined }))
            }}
            placeholder="Tên khu vực"
            aria-required="true"
            aria-invalid={Boolean(errors.tenKhuVuc)}
          />
          {errors.tenKhuVuc && (
            <p className="text-xs text-destructive">{errors.tenKhuVuc}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qc-kv-cay-so">Cây số</Label>
          <Input
            id="qc-kv-cay-so"
            type="number"
            min={0}
            value={caySo}
            onChange={(e) => setCaySo(e.target.value)}
            placeholder="Cây số"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qc-kv-tien-cong">Tiền công 1</Label>
          <Input
            id="qc-kv-tien-cong"
            type="number"
            min={0}
            value={tienCong}
            onChange={(e) => setTienCong(e.target.value)}
            placeholder="Tiền công 1"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qc-kv-tien-cong-2">Tiền công 2</Label>
          <Input
            id="qc-kv-tien-cong-2"
            type="number"
            min={0}
            value={tienCong2}
            onChange={(e) => setTienCong2(e.target.value)}
            placeholder="Tiền công 2"
          />
        </div>
      </div>

      {snapshotQuery.isLoading && (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" /> Đang tải địa giới…
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close} disabled={saving}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}
