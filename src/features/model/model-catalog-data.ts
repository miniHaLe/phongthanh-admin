import type { AutocompleteOption } from '@/components/shared'
import { modelConfig } from '@/config/crud-configs/model.config'
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import { sanPhamConfig } from '@/config/crud-configs/san-pham.config'
import {
  registerCatalogRows,
  replaceCatalogRows,
} from '@/domains/repair/reference-data'
import type {
  BaseEntity,
  Model,
  NhaSanXuat,
  SanPham,
} from '@/types/masterdata-types'
import type { MockApi } from '@/types/crud-types'
import type { CrudConfig } from '@/types/crud-types'

/** Shares the `model` prefix so generic model CRUD invalidation also refreshes
 * the relational lookup consumed by repair creation. */
export const MODEL_CATALOG_QUERY_KEY = ['model', 'catalog'] as const

export interface ModelCatalog {
  manufacturers: NhaSanXuat[]
  products: SanPham[]
  models: Model[]
}

export interface ModelAutocompleteOption extends AutocompleteOption {
  nhaSanXuatId: string
  sanPhamId: string
}

export interface CreateCatalogModelInput {
  tenModel: string
  nhaSanXuatId: string
  sanPhamId: string
  ghiChu?: string
}

async function listAll<T extends BaseEntity>(api: MockApi<T>): Promise<T[]> {
  const pageSize = 200
  const first = await api.list({ page: 1, pageSize })
  const rows = [...first.data]
  const pageCount = Math.ceil(first.total / pageSize)

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await api.list({ page, pageSize })
    rows.push(...result.data)
  }
  return rows
}

export async function loadModelCatalog(): Promise<ModelCatalog> {
  const [manufacturers, products, models] = await Promise.all([
    listAll(nhaSanXuatConfig.mockApi),
    listAll(sanPhamConfig.mockApi),
    listAll(modelConfig.mockApi),
  ])

  replaceCatalogRows(manufacturers, products, models)
  return { manufacturers, products, models }
}

export function manufacturerOption(row: NhaSanXuat): AutocompleteOption {
  return { id: row.id, label: row.tenNSX }
}

export function productOption(row: SanPham): AutocompleteOption {
  return { id: row.id, label: row.tenSP }
}

export function modelOption(
  row: Model,
  catalog: Pick<ModelCatalog, 'manufacturers' | 'products'>,
): ModelAutocompleteOption {
  const manufacturer = catalog.manufacturers.find(
    (item) => item.id === row.nhaSanXuatId,
  )
  const product = catalog.products.find((item) => item.id === row.sanPhamId)
  const metadata = [product?.tenSP, manufacturer?.tenNSX]
    .filter(Boolean)
    .join(' - ')

  return {
    id: row.id,
    label: metadata ? `${row.tenModel} — ${metadata}` : row.tenModel,
    nhaSanXuatId: row.nhaSanXuatId,
    sanPhamId: row.sanPhamId,
  }
}

/** Enriched option for the table-style Model dropdown row (Sản phẩm | NSX |
 * Tên model | Mã model). Extends the plain option so `renderOption` stays
 * compatible; the input still shows `label` (tên model) for the selected value. */
export function modelRowOption(
  row: Model,
  catalog: Pick<ModelCatalog, 'manufacturers' | 'products'>,
): ModelAutocompleteOption & {
  tenSP: string
  tenNSX: string
  tenModel: string
  maModel?: string
} {
  const manufacturer = catalog.manufacturers.find(
    (item) => item.id === row.nhaSanXuatId,
  )
  const product = catalog.products.find((item) => item.id === row.sanPhamId)
  return {
    id: row.id,
    label: row.tenModel,
    nhaSanXuatId: row.nhaSanXuatId,
    sanPhamId: row.sanPhamId,
    tenSP: product?.tenSP ?? '',
    tenNSX: manufacturer?.tenNSX ?? '',
    tenModel: row.tenModel,
    maModel: row.maModel,
  }
}

export function filterModels(
  catalog: ModelCatalog,
  query: string,
  nhaSanXuatId?: string,
  sanPhamId?: string,
): Model[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  return catalog.models.filter((model) => {
    if (nhaSanXuatId && model.nhaSanXuatId !== nhaSanXuatId) return false
    if (sanPhamId && model.sanPhamId !== sanPhamId) return false
    if (!normalizedQuery) return true

    const option = modelOption(model, catalog)
    return option.label.toLocaleLowerCase('vi').includes(normalizedQuery)
  })
}

export function isCompatibleModelTriple(
  catalog: Pick<ModelCatalog, 'models'>,
  nhaSanXuatId: string,
  sanPhamId: string,
  modelId: string,
): boolean {
  const model = catalog.models.find((item) => item.id === modelId)
  return Boolean(
    model &&
    model.nhaSanXuatId === nhaSanXuatId &&
    model.sanPhamId === sanPhamId,
  )
}

export function resolveModelParents(
  catalog: ModelCatalog,
  selection:
    string | Pick<ModelAutocompleteOption, 'nhaSanXuatId' | 'sanPhamId'>,
):
  | { manufacturer: AutocompleteOption; product: AutocompleteOption }
  | undefined {
  const model =
    typeof selection === 'string'
      ? catalog.models.find((item) => item.id === selection)
      : selection
  if (!model) return undefined
  const manufacturer = catalog.manufacturers.find(
    (item) => item.id === model.nhaSanXuatId,
  )
  const product = catalog.products.find((item) => item.id === model.sanPhamId)
  if (!manufacturer || !product) return undefined
  return {
    manufacturer: manufacturerOption(manufacturer),
    product: productOption(product),
  }
}

/** Hydrates the generic catalog editor with the same live parents as repair. */
export function modelConfigForCatalog(
  catalog?: ModelCatalog,
): CrudConfig<Model> {
  if (!catalog) return modelConfig
  const manufacturerOptions = catalog.manufacturers.map((row) => ({
    label: row.tenNSX,
    value: row.id,
  }))
  const productOptions = catalog.products.map((row) => ({
    label: row.tenSP,
    value: row.id,
  }))

  return {
    ...modelConfig,
    columns: modelConfig.columns.map((column) => {
      if (column.key === 'nhaSanXuatId') {
        return {
          ...column,
          renderCell: (value: Model[keyof Model]) =>
            catalog.manufacturers.find((row) => row.id === value)?.tenNSX ??
            String(value ?? ''),
        }
      }
      if (column.key === 'sanPhamId') {
        return {
          ...column,
          renderCell: (value: Model[keyof Model]) =>
            catalog.products.find((row) => row.id === value)?.tenSP ??
            String(value ?? ''),
        }
      }
      return column
    }),
    fields: modelConfig.fields.map((field) => {
      if (field.key === 'nhaSanXuatId') {
        return { ...field, options: manufacturerOptions }
      }
      if (field.key === 'sanPhamId') {
        return { ...field, options: productOptions }
      }
      return field
    }),
    filters: modelConfig.filters?.map((filter) => {
      if (filter.key === 'nhaSanXuatId') {
        return { ...filter, options: manufacturerOptions }
      }
      if (filter.key === 'sanPhamId') {
        return { ...filter, options: productOptions }
      }
      return filter
    }),
  }
}

export async function createCatalogModel(
  input: CreateCatalogModelInput,
): Promise<Model> {
  if (!input.tenModel.trim() || !input.nhaSanXuatId || !input.sanPhamId) {
    throw new Error('Vui lòng nhập đủ Sản phẩm, Nhà sản xuất và Tên model.')
  }

  const created = await modelConfig.mockApi.create({
    tenModel: input.tenModel.trim(),
    nhaSanXuatId: input.nhaSanXuatId,
    sanPhamId: input.sanPhamId,
    ghiChu: input.ghiChu?.trim() || undefined,
    active: true,
  })

  registerCatalogRows([], [], [created])
  return created
}
