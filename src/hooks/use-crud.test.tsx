import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { CrudConfig } from '@/types/crud-types'
import { useCrud } from './use-crud'

interface TestRow {
  id: string
  createdAt: string
  active: boolean
  name: string
}

describe('useCrud invalidation', () => {
  it('invalidates both list and lookup caches after a mutation', async () => {
    const row: TestRow = {
      id: '1',
      createdAt: '2026-07-15T00:00:00.000Z',
      active: true,
      name: 'Mới',
    }
    const config: CrudConfig<TestRow> = {
      resourceKey: 'test-resource',
      title: 'Test',
      columns: [],
      fields: [],
      mockApi: {
        list: vi.fn().mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
        }),
        get: vi.fn(),
        create: vi.fn().mockResolvedValue(row),
        update: vi.fn(),
        remove: vi.fn(),
      },
    }
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCrud(config, false), { wrapper })

    await act(async () => {
      await result.current.createMutation.mutateAsync({
        active: true,
        name: 'Mới',
      })
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['test-resource'] })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['lookup', 'test-resource'],
    })
  })
})
