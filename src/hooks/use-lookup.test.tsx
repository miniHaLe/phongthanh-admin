import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFor } from '@/api/api-for'
import type { NhaKho } from '@/types/masterdata-types'
import { fetchLookupRows, toResourceBranchId, useLookup } from './use-lookup'

vi.mock('@/api/api-for', () => ({ apiFor: vi.fn() }))

function warehouse(index: number): NhaKho {
  return {
    id: `nk-${index}`,
    maNhaKho: `NK${index}`,
    tenNhaKho: `Kho ${index}`,
    chiNhanhId: 'cn-1',
    khoXac: false,
    active: true,
    createdAt: '2026-07-15T00:00:00.000Z',
  }
}

describe('lookup seam', () => {
  beforeEach(() => {
    vi.mocked(apiFor).mockReset()
  })

  it('paginates with pageSize 200 until the full lookup set is loaded', async () => {
    const allRows = Array.from({ length: 205 }, (_, index) =>
      warehouse(index + 1),
    )
    const list = vi.fn(
      async ({ page, pageSize }: { page: number; pageSize: number }) => ({
        data: allRows.slice((page - 1) * pageSize, page * pageSize),
        total: allRows.length,
        page,
        pageSize,
      }),
    )
    vi.mocked(apiFor).mockReturnValue({ list } as never)

    const rows = await fetchLookupRows('nha-kho')

    expect(rows).toHaveLength(205)
    expect(list).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 200 })
    expect(list).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 200 })
  })

  it('maps immutable branch selectors to real masterdata foreign keys', () => {
    expect(toResourceBranchId('dak-lak')).toBe('cn-1')
    expect(toResourceBranchId('cn-custom')).toBe('cn-custom')
  })

  it('delegates the resource seed to apiFor and exposes rows plus byId', async () => {
    vi.mocked(apiFor).mockImplementation(
      (_resource, seed) =>
        ({
          list: async ({
            page,
            pageSize,
          }: {
            page: number
            pageSize: number
          }) => ({
            data: seed.slice((page - 1) * pageSize, page * pageSize),
            total: seed.length,
            page,
            pageSize,
          }),
        }) as never,
    )
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useLookup('nha-kho'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiFor).toHaveBeenCalledWith(
      'nha-kho',
      expect.arrayContaining([expect.objectContaining({ id: 'nk-1' })]),
    )
    expect(result.current.rows.length).toBeGreaterThan(0)
    expect(result.current.byId.get('nk-1')?.tenNhaKho).toBe('Kho Chính BMT')
  })
})
