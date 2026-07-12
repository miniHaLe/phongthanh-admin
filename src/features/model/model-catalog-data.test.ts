import { describe, expect, it } from 'vitest'
import type { Model, NhaSanXuat, SanPham } from '@/types/masterdata-types'
import {
  filterModels,
  isCompatibleModelTriple,
  modelConfigForCatalog,
  modelOption,
  resolveModelParents,
  type ModelCatalog,
} from './model-catalog-data'

const manufacturers: NhaSanXuat[] = [
  {
    id: 'brand-a',
    tenNSX: 'Hãng A',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'brand-b',
    tenNSX: 'Hãng B',
    active: true,
    createdAt: '2026-01-01',
  },
]

const products: SanPham[] = [
  {
    id: 'product-tv',
    tenSP: 'Tivi',
    nhomSanPhamId: 'group-1',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'product-ac',
    tenSP: 'Máy lạnh',
    nhomSanPhamId: 'group-1',
    active: true,
    createdAt: '2026-01-01',
  },
]

const models: Model[] = [
  {
    id: 'model-a-tv',
    tenModel: 'Series 10',
    nhaSanXuatId: 'brand-a',
    sanPhamId: 'product-tv',
    nguoiTao: 'Tester',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'model-a-ac',
    tenModel: 'Series 10',
    nhaSanXuatId: 'brand-a',
    sanPhamId: 'product-ac',
    nguoiTao: 'Tester',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'model-b-tv',
    tenModel: 'Series 20',
    nhaSanXuatId: 'brand-b',
    sanPhamId: 'product-tv',
    nguoiTao: 'Tester',
    active: true,
    createdAt: '2026-01-01',
  },
]

const catalog: ModelCatalog = { manufacturers, products, models }

describe('model catalog relationship helpers', () => {
  it('shows all models without parents, filters by manufacturer, then product', () => {
    expect(filterModels(catalog, '')).toHaveLength(3)
    expect(filterModels(catalog, '', 'brand-a').map((row) => row.id)).toEqual([
      'model-a-tv',
      'model-a-ac',
    ])
    expect(
      filterModels(catalog, '', 'brand-a', 'product-ac').map((row) => row.id),
    ).toEqual(['model-a-ac'])
  })

  it('keeps duplicate model names distinguishable with product and manufacturer', () => {
    expect(modelOption(models[0], catalog).label).toBe(
      'Series 10 — Tivi - Hãng A',
    )
    expect(modelOption(models[1], catalog).label).toBe(
      'Series 10 — Máy lạnh - Hãng A',
    )
  })

  it('resolves both parents from a model-first selection', () => {
    expect(resolveModelParents(catalog, 'model-b-tv')).toEqual({
      manufacturer: { id: 'brand-b', label: 'Hãng B' },
      product: { id: 'product-tv', label: 'Tivi' },
    })
  })

  it('rejects an incompatible manufacturer/product/model triple', () => {
    expect(
      isCompatibleModelTriple(catalog, 'brand-a', 'product-tv', 'model-a-tv'),
    ).toBe(true)
    expect(
      isCompatibleModelTriple(catalog, 'brand-b', 'product-tv', 'model-a-tv'),
    ).toBe(false)
  })

  it('hydrates the catalog editor with live manufacturer and product options', () => {
    const config = modelConfigForCatalog(catalog)
    const manufacturerField = config.fields.find(
      (field) => field.key === 'nhaSanXuatId',
    )
    const productField = config.fields.find(
      (field) => field.key === 'sanPhamId',
    )

    expect(manufacturerField?.options).toEqual([
      { label: 'Hãng A', value: 'brand-a' },
      { label: 'Hãng B', value: 'brand-b' },
    ])
    expect(productField?.options).toEqual([
      { label: 'Tivi', value: 'product-tv' },
      { label: 'Máy lạnh', value: 'product-ac' },
    ])
  })
})
