/**
 * Hàng Hóa full-page editor (C5b) — /danh-muc/hang-hoa/tao-moi,
 * /danh-muc/hang-hoa/:id/sua. Fieldset "Thông tin hàng hóa - linh kiện" with
 * the 3 verified price tiers (Giá mua / Giá bán sỉ / Giá bán lẻ), the
 * Nhà sản xuất + Model autocompletes with [+] quick-create, "Dùng chung nhiều
 * model" toggle, and a photo-upload preview panel. Toolbar: Lưu / Lưu & Thêm
 * mới / Tạo mới / Danh sách hàng hóa.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PageHeader,
  ServerAutocomplete,
  notify,
  type AutocompleteOption,
} from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { filterLookupOptions, useLookup } from '@/hooks/use-lookup'
import { invalidateCrudQueries } from '@/hooks/use-crud'
import {
  MODEL_CATALOG_QUERY_KEY,
  filterModels,
  loadModelCatalog,
  modelRowOption,
  resolveModelParents,
  type ModelAutocompleteOption,
} from '@/features/model/model-catalog-data'
import { ModelOptionRow, type ModelRowOption } from '@/features/model/model-option-row'
import { QuickCreateModel } from '@/features/model/quick-create-model-dialog'
import {
  createHangHoa,
  findHangHoa,
  updateHangHoa,
  type HangHoaInput,
} from './create-product'
import { QuickCreateNhaSanXuat } from './quick-create-nha-san-xuat'

interface FormState {
  nhomHangHoaId: string
  coSerial: boolean
  nhaSanXuat: AutocompleteOption | null
  model: ModelAutocompleteOption | null
  modelDungChung: boolean
  modelDungChungText: string
  donViTinhId: string
  phatSinhTuDong: boolean
  maHH: string
  maHHPhu: string
  tenHH: string
  tenTiengAnh: string
  viTriLinhKien: string
  giaMua: string
  giaBanSi: string
  giaBanLe: string
}

const EMPTY: FormState = {
  nhomHangHoaId: '',
  coSerial: false,
  nhaSanXuat: null,
  model: null,
  modelDungChung: false,
  modelDungChungText: '',
  donViTinhId: '',
  phatSinhTuDong: false,
  maHH: '',
  maHHPhu: '',
  tenHH: '',
  tenTiengAnh: '',
  viTriLinhKien: '',
  giaMua: '',
  giaBanSi: '',
  giaBanLe: '',
}

export default function ProductEditorPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { rows: nhomHangHoaRows } = useLookup('nhom-hang-hoa')
  const { rows: donViTinhRows } = useLookup('don-vi-tinh')
  const {
    rows: nhaSanXuatRows,
    byId: nhaSanXuatById,
    isLoading: isNhaSanXuatLoading,
  } = useLookup('nha-san-xuat')
  const {
    byId: modelById,
    isLoading: isModelLoading,
  } = useLookup('model')

  const catalogQuery = useQuery({
    queryKey: MODEL_CATALOG_QUERY_KEY,
    queryFn: loadModelCatalog,
    staleTime: 0,
  })

  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const loadedExistingId = useRef<string | null>(null)

  const existingQuery = useQuery({
    queryKey: ['hang-hoa', id],
    queryFn: () => findHangHoa(id!),
    enabled: Boolean(id),
  })

  const searchNhaSanXuat = useCallback(
    (query: string) =>
      filterLookupOptions(nhaSanXuatRows, query, (row) => row.tenNSX),
    [nhaSanXuatRows],
  )
  const searchModel = useCallback(
    async (query: string): Promise<ModelRowOption[]> => {
      const catalog = catalogQuery.data
      if (!catalog) return []
      return filterModels(catalog, query, form.nhaSanXuat?.id)
        .slice(0, 50)
        .map((row) => modelRowOption(row, catalog))
    },
    [catalogQuery.data, form.nhaSanXuat?.id],
  )

  useEffect(() => {
    if (id || !donViTinhRows.length) return
    const defaultId =
      donViTinhRows.find((row) => row.tenDVT === 'Cái')?.id ??
      donViTinhRows[0]?.id ??
      ''
    setForm((current) =>
      current.donViTinhId ? current : { ...current, donViTinhId: defaultId },
    )
  }, [donViTinhRows, id])

  useEffect(() => {
    const existing = existingQuery.data
    if (
      !existing ||
      isNhaSanXuatLoading ||
      isModelLoading ||
      loadedExistingId.current === existing.id
    ) {
      return
    }
    const nsx = existing.nhaSanXuatId
      ? nhaSanXuatById.get(existing.nhaSanXuatId)
      : undefined
    const model = existing.modelId ? modelById.get(existing.modelId) : undefined
    setForm({
      nhomHangHoaId: existing.nhomHangHoaId,
      coSerial: existing.coSerial,
      nhaSanXuat: nsx ? { id: nsx.id, label: nsx.tenNSX } : null,
      model: model
        ? {
            id: model.id,
            label: model.tenModel,
            nhaSanXuatId: model.nhaSanXuatId,
            sanPhamId: model.sanPhamId,
          }
        : null,
      modelDungChung: existing.modelDungChung,
      modelDungChungText: existing.modelDungChungText ?? '',
      donViTinhId: existing.donViTinhId,
      phatSinhTuDong: existing.phatSinhTuDong,
      maHH: existing.maHH,
      maHHPhu: existing.maHHPhu ?? '',
      tenHH: existing.tenHH,
      tenTiengAnh: existing.tenTiengAnh ?? '',
      viTriLinhKien: existing.viTriLinhKien ?? '',
      giaMua: existing.giaMua ? String(existing.giaMua) : '',
      giaBanSi: existing.giaBanSi ? String(existing.giaBanSi) : '',
      giaBanLe: existing.giaBanLe ? String(existing.giaBanLe) : '',
    })
    loadedExistingId.current = existing.id
  }, [
    existingQuery.data,
    isModelLoading,
    isNhaSanXuatLoading,
    modelById,
    nhaSanXuatById,
  ])

  useEffect(() => {
    if (!existingQuery.isError) return
    notify.error('Không tìm thấy hàng hóa!')
    navigate(ROUTES.catalogGoods)
  }, [existingQuery.isError, navigate])

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function resetForm() {
    const donViTinhId =
      donViTinhRows.find((row) => row.tenDVT === 'Cái')?.id ??
      donViTinhRows[0]?.id ??
      ''
    setForm({ ...EMPTY, donViTinhId })
    setError('')
  }

  function validate(): boolean {
    if (!form.nhomHangHoaId) {
      setError('Vui lòng chọn nhóm hàng hóa!')
      return false
    }
    if (!form.model) {
      setError('Vui lòng chọn model!')
      return false
    }
    if (!form.donViTinhId) {
      setError('Vui lòng chọn đơn vị tính!')
      return false
    }
    if (!form.maHH.trim()) {
      setError('Vui lòng nhập mã hàng hóa!')
      return false
    }
    if (!form.tenHH.trim()) {
      setError('Vui lòng nhập tên hàng hóa!')
      return false
    }
    setError('')
    return true
  }

  function buildInput(): HangHoaInput {
    return {
      nhomHangHoaId: form.nhomHangHoaId,
      coSerial: form.coSerial,
      nhaSanXuatId: form.nhaSanXuat?.id,
      modelId: form.model?.id,
      modelDungChung: form.modelDungChung,
      modelDungChungText: form.modelDungChung
        ? form.modelDungChungText
        : undefined,
      donViTinhId: form.donViTinhId,
      phatSinhTuDong: form.phatSinhTuDong,
      maHH: form.maHH.trim(),
      maHHPhu: form.maHHPhu.trim() || undefined,
      tenHH: form.tenHH.trim(),
      tenTiengAnh: form.tenTiengAnh.trim() || undefined,
      viTriLinhKien: form.viTriLinhKien.trim() || undefined,
      giaMua: form.giaMua ? Number(form.giaMua) : undefined,
      giaBanSi: form.giaBanSi ? Number(form.giaBanSi) : undefined,
      giaBanLe: form.giaBanLe ? Number(form.giaBanLe) : undefined,
      nguoiTao: CURRENT_USER.hoVaTen,
    }
  }

  async function handleSave(saveAndNew: boolean) {
    if (!validate()) return
    const input = buildInput()
    setIsSaving(true)
    try {
      const row =
        isEdit && id
          ? await updateHangHoa(id, input)
          : await createHangHoa(input)
      await invalidateCrudQueries(queryClient, 'hang-hoa')
      notify.success(`Đã lưu hàng hóa ${row.maHH}`)
      if (saveAndNew) {
        resetForm()
      } else {
        navigate(ROUTES.catalogGoods)
      }
    } catch (reason) {
      notify.error(
        reason instanceof Error ? reason.message : 'Không thể lưu hàng hóa',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa hàng hóa' : 'Thêm hàng hóa'}
        breadcrumbs={[
          { label: 'Danh Mục', href: ROUTES.catalog },
          { label: 'Hàng Hóa', href: ROUTES.catalogGoods },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      >
        <Button
          size="sm"
          onClick={() => void handleSave(false)}
          disabled={isSaving}
        >
          {isSaving ? 'Đang lưu…' : 'Lưu'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleSave(true)}
          disabled={isSaving}
        >
          Lưu & Thêm mới
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.catalogGoodsCreate}>Tạo mới</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.catalogGoods}>Danh sách hàng hóa</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-base font-semibold">
            Thông tin hàng hóa - linh kiện
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Nhóm hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.nhomHangHoaId}
                onValueChange={(v) => patch({ nhomHangHoaId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm hàng hóa" />
                </SelectTrigger>
                <SelectContent>
                  {nhomHangHoaRows.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenNhom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm">
              <Checkbox
                checked={form.coSerial}
                onCheckedChange={(c) => patch({ coSerial: !!c })}
              />
              Có Serial
            </label>

            <div className="space-y-1.5">
              <Label>Nhà sản xuất</Label>
              <ServerAutocomplete
                value={form.nhaSanXuat}
                onChange={(next) => {
                  // Clear the model if it no longer belongs to the chosen NSX.
                  const model = form.model as ModelAutocompleteOption | null
                  const incompatible =
                    model?.nhaSanXuatId != null &&
                    (!next || model.nhaSanXuatId !== next.id)
                  patch({
                    nhaSanXuat: next,
                    ...(incompatible ? { model: null } : {}),
                  })
                }}
                fetchOptions={searchNhaSanXuat}
                placeholder="Tên nhà sản xuất"
                quickCreate={{
                  title: 'Thêm mới nhà sản xuất',
                  renderForm: (close, select) => (
                    <QuickCreateNhaSanXuat close={close} select={select} />
                  ),
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Model <span className="text-destructive">*</span>
              </Label>
              <ServerAutocomplete
                value={form.model}
                onChange={(next) => {
                  if (!next) {
                    patch({ model: null })
                    return
                  }
                  // fetchOptions only ever yields ModelRowOption, so the
                  // returned option carries the FK metadata.
                  const meta = next as ModelAutocompleteOption
                  // Back-fill NSX from the model when NSX is empty (legacy parity).
                  const catalog = catalogQuery.data
                  if (!form.nhaSanXuat && catalog && meta.nhaSanXuatId) {
                    const parents = resolveModelParents(catalog, meta)
                    patch({
                      model: meta,
                      ...(parents ? { nhaSanXuat: parents.manufacturer } : {}),
                    })
                    return
                  }
                  patch({ model: meta })
                }}
                fetchOptions={searchModel}
                renderOption={(opt) => (
                  <ModelOptionRow option={opt as ModelRowOption} />
                )}
                placeholder="Tên model"
                quickCreate={{
                  title: 'Thêm mới model',
                  renderForm: (close, select) => (
                    <QuickCreateModel
                      close={close}
                      select={(opt) => {
                        // opt is a ModelAutocompleteOption; back-fill NSX too.
                        const meta = opt as ModelAutocompleteOption
                        const catalog = catalogQuery.data
                        const parents =
                          !form.nhaSanXuat && catalog && meta.nhaSanXuatId
                            ? resolveModelParents(catalog, meta)
                            : undefined
                        patch({
                          model: meta,
                          ...(parents
                            ? { nhaSanXuat: parents.manufacturer }
                            : {}),
                        })
                      }}
                      initialNhaSanXuatId={form.nhaSanXuat?.id}
                    />
                  ),
                }}
              />
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm sm:col-span-2">
              <Checkbox
                checked={form.modelDungChung}
                onCheckedChange={(c) => patch({ modelDungChung: !!c })}
              />
              Dùng chung nhiều model
            </label>

            {form.modelDungChung && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Model dùng chung</Label>
                <Input
                  value={form.modelDungChungText}
                  onChange={(e) =>
                    patch({ modelDungChungText: e.target.value })
                  }
                  placeholder="Ví dụ: RAS-F10CJV, RAS-F13CJV, RAS-F18CJV"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>
                Đơn vị tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.donViTinhId}
                onValueChange={(v) => patch({ donViTinhId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị tính" />
                </SelectTrigger>
                <SelectContent>
                  {donViTinhRows.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenDVT}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm">
              <Checkbox
                checked={form.phatSinhTuDong}
                onCheckedChange={(c) => patch({ phatSinhTuDong: !!c })}
              />
              Phát sinh tự động
            </label>

            <div className="space-y-1.5">
              <Label>
                Mã hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.maHH}
                onChange={(e) => patch({ maHH: e.target.value })}
                disabled={form.phatSinhTuDong}
                placeholder="Mã hàng hóa"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mã hàng hóa phụ</Label>
              <Input
                value={form.maHHPhu}
                onChange={(e) => patch({ maHHPhu: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Tên hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.tenHH}
                onChange={(e) => patch({ tenHH: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tên Tiếng Anh</Label>
              <Input
                value={form.tenTiengAnh}
                onChange={(e) => patch({ tenTiengAnh: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vị trí linh kiện</Label>
              <Textarea
                value={form.viTriLinhKien}
                onChange={(e) => patch({ viTriLinhKien: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá mua</Label>
              <Input
                type="number"
                min={0}
                value={form.giaMua}
                onChange={(e) => patch({ giaMua: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá bán sỉ</Label>
              <Input
                type="number"
                min={0}
                value={form.giaBanSi}
                onChange={(e) => patch({ giaBanSi: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá bán lẻ</Label>
              <Input
                type="number"
                min={0}
                value={form.giaBanLe}
                onChange={(e) => patch({ giaBanLe: e.target.value })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
