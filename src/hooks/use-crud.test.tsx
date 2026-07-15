import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { notify } from '@/components/shared'
import type { CrudConfig, MockApi } from '@/types/crud-types'
import { useCrud } from './use-crud'

interface TestRow {
  id: string
  name: string
}

function makeConfig(
  remove: MockApi<TestRow>['remove'],
  list: MockApi<TestRow>['list'] = async () => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  }),
): CrudConfig<TestRow> {
  return {
    resourceKey: 'bulk-hook-test',
    title: 'Bulk hook test',
    columns: [{ key: 'name', header: 'Tên' }],
    fields: [],
    mockApi: {
      list,
      get: async (id) => ({ id, name: id }),
      create: async (data) => ({ id: 'created', ...data }),
      update: async (id, data) => ({ id, name: '', ...data }),
      remove,
    },
  }
}

function setup(remove: MockApi<TestRow>['remove']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const hook = renderHook(() => useCrud(makeConfig(remove), false), { wrapper })
  return { hook, queryClient }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCrud bulk delete', () => {
  it('settles chunks of at most 10 and invalidates the list once', async () => {
    let active = 0
    let maxActive = 0
    const remove = vi.fn(async (id: string) => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 1))
      active -= 1
      if (id === 'row-7' || id === 'row-19') throw new Error('delete failed')
    })
    const { hook, queryClient } = setup(remove)
    const invalidate = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined)
    const successToast = vi.spyOn(notify, 'success')
    const errorToast = vi.spyOn(notify, 'error')
    const ids = Array.from({ length: 23 }, (_, index) => `row-${index}`)

    let outcome: Awaited<ReturnType<typeof hook.result.current.bulkDelete>>
    await act(async () => {
      outcome = await hook.result.current.bulkDelete(ids)
    })

    expect(maxActive).toBe(10)
    expect(outcome!).toEqual({
      successfulIds: ids.filter((id) => id !== 'row-7' && id !== 'row-19'),
      failedIds: ['row-7', 'row-19'],
      successCount: 21,
      failureCount: 2,
    })
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['bulk-hook-test'],
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['lookup', 'bulk-hook-test'],
    })
    expect(successToast).not.toHaveBeenCalled()
    expect(errorToast).not.toHaveBeenCalled()
  })

  it('keeps the single-delete invalidation and toast behavior unchanged', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const { hook, queryClient } = setup(remove)
    const invalidate = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined)
    const successToast = vi.spyOn(notify, 'success')

    await act(async () => {
      await hook.result.current.deleteMutation.mutateAsync('row-1')
    })

    expect(remove).toHaveBeenCalledWith('row-1')
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['lookup', 'bulk-hook-test'],
    })
    expect(successToast).toHaveBeenCalledWith('Đã xóa')
  })
})

describe('useCrud list scope', () => {
  it('includes top-level branch scope in the query and isolates branch caches', async () => {
    const list = vi.fn<MockApi<TestRow>['list']>(async (params) => ({
      data: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
    }))
    const config = makeConfig(vi.fn(), list)
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { rerender } = renderHook(
      ({ branchId }: { branchId?: string }) =>
        useCrud(config, true, { branchId }),
      { wrapper, initialProps: { branchId: 'cn-2' as string | undefined } },
    )

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-2', page: 1 }),
      ),
    )

    rerender({ branchId: 'cn-3' })
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ branchId: 'cn-3', page: 1 }),
      ),
    )

    rerender({ branchId: undefined })
    await waitFor(() => {
      const latestParams = list.mock.calls.at(-1)?.[0]
      expect(latestParams).not.toHaveProperty('branchId')
    })
    expect(
      queryClient.getQueryCache().findAll({ queryKey: [config.resourceKey] }),
    ).toHaveLength(3)
  })
})
