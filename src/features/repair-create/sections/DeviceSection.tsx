import { useCallback, useState } from 'react'
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldErrors,
} from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ServerAutocomplete } from '@/components/shared'
import type { CreateRepairFormValues } from '../RepairCreateForm'
import { QuickCreateNhaSanXuat } from '../quick-create/QuickCreateNhaSanXuat'
import { QuickCreateModel } from '../quick-create/QuickCreateModel'
import {
  MODEL_CATALOG_QUERY_KEY,
  filterModels,
  loadModelCatalog,
  manufacturerOption,
  modelOption,
  productOption,
  resolveModelParents,
  type ModelAutocompleteOption,
} from '@/features/model/model-catalog-data'

interface DeviceSectionProps {
  errors: FieldErrors<CreateRepairFormValues>
  onSerialBlur: (serial: string) => void
}

export function DeviceSection({ errors, onSerialBlur }: DeviceSectionProps) {
  const { control, register, setValue } =
    useFormContext<CreateRepairFormValues>()
  const [sanPham, nhaSanXuat, selectedModel] = useWatch({
    control,
    name: ['sanPham', 'nhaSanXuat', 'model'],
  })
  const [relationshipMessage, setRelationshipMessage] = useState('')
  const catalogQuery = useQuery({
    queryKey: MODEL_CATALOG_QUERY_KEY,
    queryFn: loadModelCatalog,
    staleTime: 0,
  })

  const searchSanPham = useCallback(
    async (query: string) => {
      const q = query.trim().toLocaleLowerCase('vi')
      return (catalogQuery.data?.products ?? [])
        .filter((row) => !q || row.tenSP.toLocaleLowerCase('vi').includes(q))
        .slice(0, 50)
        .map(productOption)
    },
    [catalogQuery.data?.products],
  )

  const searchNhaSanXuat = useCallback(
    async (query: string) => {
      const q = query.trim().toLocaleLowerCase('vi')
      return (catalogQuery.data?.manufacturers ?? [])
        .filter((row) => !q || row.tenNSX.toLocaleLowerCase('vi').includes(q))
        .slice(0, 50)
        .map(manufacturerOption)
    },
    [catalogQuery.data?.manufacturers],
  )

  const searchModel = useCallback(
    async (query: string) => {
      if (!catalogQuery.data) return []
      return filterModels(catalogQuery.data, query, nhaSanXuat?.id, sanPham?.id)
        .slice(0, 50)
        .map((row) => modelOption(row, catalogQuery.data))
    },
    [catalogQuery.data, nhaSanXuat?.id, sanPham?.id],
  )

  function selectedModelMetadata(option: {
    id: string
    label: string
  }): ModelAutocompleteOption | undefined {
    if ('nhaSanXuatId' in option && 'sanPhamId' in option) {
      return option as ModelAutocompleteOption
    }
    const row = catalogQuery.data?.models.find((item) => item.id === option.id)
    return row && catalogQuery.data
      ? modelOption(row, catalogQuery.data)
      : undefined
  }

  function clearIncompatibleModel(reason: string) {
    if (!selectedModel) return
    setValue('model', null, { shouldDirty: true, shouldValidate: true })
    setRelationshipMessage(reason)
  }

  return (
    <section aria-labelledby="section-device">
      <h2
        id="section-device"
        className="sticky top-16 z-10 -mx-6 mb-4 bg-background/95 px-6 py-2 text-base font-semibold backdrop-blur"
      >
        Thông tin sản phẩm
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sản phẩm */}
        <div>
          <Label className="mb-1.5 block text-sm">Sản phẩm</Label>
          <Controller
            name="sanPham"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={(next) => {
                  const currentModel = selectedModel
                    ? selectedModelMetadata(selectedModel)
                    : undefined
                  field.onChange(next)
                  if (
                    currentModel &&
                    (!next || currentModel.sanPhamId !== next.id)
                  ) {
                    clearIncompatibleModel(
                      'Model đã được xóa vì không thuộc Sản phẩm vừa chọn.',
                    )
                  }
                }}
                fetchOptions={searchSanPham}
                placeholder="Tên sản phẩm"
              />
            )}
          />
        </div>

        {/* Nhà sản xuất */}
        <div>
          <Label className="mb-1.5 block text-sm">Nhà sản xuất</Label>
          <Controller
            name="nhaSanXuat"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={(next) => {
                  const currentModel = selectedModel
                    ? selectedModelMetadata(selectedModel)
                    : undefined
                  field.onChange(next)
                  if (
                    currentModel &&
                    (!next || currentModel.nhaSanXuatId !== next.id)
                  ) {
                    clearIncompatibleModel(
                      'Model đã được xóa vì không thuộc Nhà sản xuất vừa chọn.',
                    )
                  }
                }}
                fetchOptions={searchNhaSanXuat}
                placeholder="Tên nhà sản xuất"
                quickCreate={{
                  title: 'Thêm nhà sản xuất',
                  renderForm: (close, select) => (
                    <QuickCreateNhaSanXuat close={close} select={select} />
                  ),
                }}
              />
            )}
          />
        </div>

        {/* Model is authoritative: selecting it synchronizes both parents. */}
        <div>
          <Label className="mb-1.5 block text-sm">
            Model <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={(next) => {
                  field.onChange(next)
                  if (!next) return
                  const metadata = selectedModelMetadata(next)
                  const catalog = catalogQuery.data
                  if (!metadata || !catalog) return
                  const parents = resolveModelParents(catalog, metadata)
                  if (parents) {
                    setValue('nhaSanXuat', parents.manufacturer, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    setValue('sanPham', parents.product, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  setRelationshipMessage(
                    'Đã đồng bộ Sản phẩm và Nhà sản xuất theo Model.',
                  )
                }}
                fetchOptions={searchModel}
                placeholder="Tên model"
                quickCreate={{
                  title: 'Thêm model',
                  renderForm: (close, select) => (
                    <QuickCreateModel
                      close={close}
                      select={select}
                      initialNhaSanXuatId={nhaSanXuat?.id}
                      initialSanPhamId={sanPham?.id}
                    />
                  ),
                }}
              />
            )}
          />
          {errors.model && (
            <p className="mt-1 text-xs text-destructive">
              {errors.model.message}
            </p>
          )}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {relationshipMessage}
          </p>
        </div>

        {/* Số Serial */}
        <div>
          <Label htmlFor="soSerial" className="mb-1.5 block text-sm">
            Số Serial <span className="text-destructive">*</span>
          </Label>
          <Input
            id="soSerial"
            {...register('soSerial', {
              onBlur: (e) => onSerialBlur(e.target.value),
            })}
            placeholder="SN…"
            autoComplete="off"
            aria-invalid={!!errors.soSerial}
            aria-describedby={errors.soSerial ? 'serial-err' : undefined}
          />
          {errors.soSerial && (
            <p id="serial-err" className="mt-1 text-xs text-destructive">
              {errors.soSerial.message}
            </p>
          )}
        </div>

        {/* Ngày mua */}
        <div>
          <Label htmlFor="ngayMua" className="mb-1.5 block text-sm">
            Ngày mua
          </Label>
          <Input id="ngayMua" type="date" {...register('ngayMua')} />
        </div>

        {/* Nơi mua */}
        <div>
          <Label htmlFor="noiMua" className="mb-1.5 block text-sm">
            Nơi mua
          </Label>
          <Input id="noiMua" {...register('noiMua')} placeholder="Nơi mua" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Mô tả hư hỏng */}
        <div>
          <Label htmlFor="moTaHuHong" className="mb-1.5 block text-sm">
            Mô tả hư hỏng <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="moTaHuHong"
            {...register('moTaHuHong')}
            placeholder="Mô tả chi tiết tình trạng hư hỏng của thiết bị…"
            rows={3}
            aria-invalid={!!errors.moTaHuHong}
            aria-describedby={errors.moTaHuHong ? 'mota-err' : undefined}
          />
          {errors.moTaHuHong && (
            <p id="mota-err" className="mt-1 text-xs text-destructive">
              {errors.moTaHuHong.message}
            </p>
          )}
        </div>

        {/* Phụ kiện kèm theo */}
        <div>
          <Label htmlFor="phuKienKemTheo" className="mb-1.5 block text-sm">
            Phụ kiện kèm theo
          </Label>
          <Textarea
            id="phuKienKemTheo"
            {...register('phuKienKemTheo')}
            placeholder="Phụ kiện đi kèm…"
            rows={2}
          />
        </div>

        {/* Ghi chú */}
        <div>
          <Label htmlFor="ghiChu" className="mb-1.5 block text-sm">
            Ghi chú
          </Label>
          <Textarea
            id="ghiChu"
            {...register('ghiChu')}
            placeholder="Ghi chú…"
            rows={2}
          />
        </div>
      </div>

      <Separator className="mt-6" />
    </section>
  )
}
