import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ModelPage from './ModelPage'

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  modelConfigForCatalog: vi.fn(() => ({ resourceKey: 'model' })),
}))

vi.mock('@tanstack/react-query', () => ({ useQuery: mocks.useQuery }))
vi.mock('@/components/crud/CrudTablePage', () => ({
  CrudTablePage: () => null,
}))
vi.mock('@/features/model/model-catalog-data', () => ({
  MODEL_CATALOG_QUERY_KEY: ['model', 'catalog'],
  loadModelCatalog: vi.fn(),
  modelConfigForCatalog: mocks.modelConfigForCatalog,
}))

beforeEach(() => {
  mocks.useQuery.mockReset().mockReturnValue({ data: undefined })
  mocks.modelConfigForCatalog.mockClear()
})

describe('ModelPage', () => {
  it('keeps the relational catalog fresh without forcing every mount stale', () => {
    render(<ModelPage />)

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ staleTime: 5 * 60_000 }),
    )
  })
})
