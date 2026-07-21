import { useCallback, useState } from 'react'
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldErrors,
} from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ServerAutocomplete } from '@/components/shared'
import type { RepairFormValues } from '../repair-form-contract'
import { QuickCreateNhaSanXuat } from '../quick-create/QuickCreateNhaSanXuat'
import { QuickCreateModel } from '@/features/model/quick-create-model-dialog'
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

export function DeviceCatalogFields({
  errors,
}: {
  errors: FieldErrors<RepairFormValues>
}) {
  const { control, register, setValue } = useFormContext<RepairFormValues>()
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
      const normalized = query.trim().toLocaleLowerCase('vi')
      return (catalogQuery.data?.products ?? [])
        .filter(
          (row) =>
            !normalized ||
            row.tenSP.toLocaleLowerCase('vi').includes(normalized),
        )
        .slice(0, 50)
        .map(productOption)
    },
    [catalogQuery.data?.products],
  )

  const searchNhaSanXuat = useCallback(
    async (query: string) => {
      const normalized = query.trim().toLocaleLowerCase('vi')
      return (catalogQuery.data?.manufacturers ?? [])
        .filter(
          (row) =>
            !normalized ||
            row.tenNSX.toLocaleLowerCase('vi').includes(normalized),
        )
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
        .map((row) => modelOption(row, catalogQuery.data!))
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <Label htmlFor="repair-product" className="mb-1.5 block text-sm">
          Sản phẩm
        </Label>
        <Controller
          name="sanPham"
          control={control}
          render={({ field }) => (
            <ServerAutocomplete
              inputId="repair-product"
              ariaLabel="Tên sản phẩm"
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

      <div>
        <Label htmlFor="repair-manufacturer" className="mb-1.5 block text-sm">
          Nhà sản xuất
        </Label>
        <Controller
          name="nhaSanXuat"
          control={control}
          render={({ field }) => (
            <ServerAutocomplete
              inputId="repair-manufacturer"
              ariaLabel="Tên nhà sản xuất"
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

      <div>
        <Label htmlFor="repair-manufacturer-note">Ghi chú NSX</Label>
        <Textarea
          id="repair-manufacturer-note"
          rows={2}
          {...register('ghiChuNhaSanXuat')}
        />
      </div>

      <div>
        <Label htmlFor="repair-model" className="mb-1.5 block text-sm">
          Model <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <ServerAutocomplete
              inputId="repair-model"
              ariaLabel="Tên model"
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

      <div>
        <Label htmlFor="repair-model-note">Ghi chú model</Label>
        <Textarea
          id="repair-model-note"
          rows={2}
          {...register('ghiChuModel')}
        />
      </div>
    </div>
  )
}
