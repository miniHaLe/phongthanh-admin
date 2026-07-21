import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify, type AutocompleteOption } from '@/components/shared'
import {
  MODEL_CATALOG_QUERY_KEY,
  createCatalogModel,
  loadModelCatalog,
  modelOption,
} from '@/features/model/model-catalog-data'

interface QuickCreateModelProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
  initialNhaSanXuatId?: string
  initialSanPhamId?: string
}

interface FieldErrors {
  sanPhamId?: string
  nhaSanXuatId?: string
  tenModel?: string
  submit?: string
}

export function QuickCreateModel({
  close,
  select,
  initialNhaSanXuatId = '',
  initialSanPhamId = '',
}: QuickCreateModelProps) {
  const queryClient = useQueryClient()
  const catalogQuery = useQuery({
    queryKey: MODEL_CATALOG_QUERY_KEY,
    queryFn: loadModelCatalog,
    staleTime: 0,
  })
  const [sanPhamId, setSanPhamId] = useState(initialSanPhamId)
  const [nhaSanXuatId, setNhaSanXuatId] = useState(initialNhaSanXuatId)
  const [tenModel, setTenModel] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => setSanPhamId(initialSanPhamId), [initialSanPhamId])
  useEffect(() => setNhaSanXuatId(initialNhaSanXuatId), [initialNhaSanXuatId])

  async function handleSave() {
    const nextErrors: FieldErrors = {}
    if (!sanPhamId) nextErrors.sanPhamId = 'Vui lòng chọn Tên Sản Phẩm.'
    if (!nhaSanXuatId) {
      nextErrors.nhaSanXuatId = 'Vui lòng chọn Nhà sản xuất.'
    }
    if (!tenModel.trim()) nextErrors.tenModel = 'Vui lòng nhập Tên model.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const created = await createCatalogModel({
        sanPhamId,
        nhaSanXuatId,
        tenModel,
        ghiChu,
      })
      const catalog = catalogQuery.data ?? (await loadModelCatalog())
      const nextCatalog = {
        ...catalog,
        models: [
          created,
          ...catalog.models.filter((row) => row.id !== created.id),
        ],
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['model'] }),
        queryClient.invalidateQueries({ queryKey: MODEL_CATALOG_QUERY_KEY }),
      ])
      notify.success('Đã thêm model thành công')
      select(modelOption(created, nextCatalog))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể thêm model. Vui lòng thử lại.'
      setErrors({ submit: message })
      notify.error(message)
    } finally {
      setSaving(false)
    }
  }

  const catalog = catalogQuery.data

  return (
    <div className="max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="qc-model-san-pham">
            Tên Sản Phẩm <span className="text-destructive">*</span>
          </Label>
          <Select
            value={sanPhamId}
            onValueChange={(value) => {
              setSanPhamId(value)
              setErrors((current) => ({ ...current, sanPhamId: undefined }))
            }}
          >
            <SelectTrigger
              id="qc-model-san-pham"
              aria-required="true"
              aria-invalid={Boolean(errors.sanPhamId)}
              aria-describedby={
                errors.sanPhamId ? 'qc-model-san-pham-error' : undefined
              }
            >
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {catalog?.products.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.tenSP}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sanPhamId && (
            <p
              id="qc-model-san-pham-error"
              className="text-xs text-destructive"
            >
              {errors.sanPhamId}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qc-model-nha-san-xuat">
            Nhà sản xuất <span className="text-destructive">*</span>
          </Label>
          <Select
            value={nhaSanXuatId}
            onValueChange={(value) => {
              setNhaSanXuatId(value)
              setErrors((current) => ({
                ...current,
                nhaSanXuatId: undefined,
              }))
            }}
          >
            <SelectTrigger
              id="qc-model-nha-san-xuat"
              aria-required="true"
              aria-invalid={Boolean(errors.nhaSanXuatId)}
              aria-describedby={
                errors.nhaSanXuatId ? 'qc-model-nha-san-xuat-error' : undefined
              }
            >
              <SelectValue placeholder="Chọn nhà sản xuất" />
            </SelectTrigger>
            <SelectContent>
              {catalog?.manufacturers.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.tenNSX}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nhaSanXuatId && (
            <p
              id="qc-model-nha-san-xuat-error"
              className="text-xs text-destructive"
            >
              {errors.nhaSanXuatId}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="qc-model-ten">
            Tên model <span className="text-destructive">*</span>
          </Label>
          <Input
            id="qc-model-ten"
            value={tenModel}
            onChange={(event) => {
              setTenModel(event.target.value)
              setErrors((current) => ({ ...current, tenModel: undefined }))
            }}
            placeholder="Tên model"
            autoFocus
            aria-required="true"
            aria-invalid={Boolean(errors.tenModel)}
            aria-describedby={
              errors.tenModel ? 'qc-model-ten-error' : undefined
            }
          />
          {errors.tenModel && (
            <p id="qc-model-ten-error" className="text-xs text-destructive">
              {errors.tenModel}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="qc-model-ghi-chu">Ghi chú</Label>
          <Textarea
            id="qc-model-ghi-chu"
            value={ghiChu}
            onChange={(event) => setGhiChu(event.target.value)}
            placeholder="Ghi chú"
            rows={3}
          />
        </div>
      </div>

      {catalogQuery.isLoading && (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" /> Đang tải danh mục…
        </p>
      )}
      {errors.submit && (
        <p className="text-sm text-destructive" role="alert">
          {errors.submit}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close} disabled={saving}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || catalogQuery.isLoading}
        >
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}
