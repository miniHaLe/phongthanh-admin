/**
 * Generic CRUD hook — wraps TanStack Query list + mutations for any CrudConfig<T>.
 * Invalidates the list cache and fires Vietnamese toasts on every mutation.
 */
import { useCallback, useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { notify } from '@/components/shared'
import type { CrudConfig } from '@/types/crud-types'
import type { ListParams, PagedResult } from '@/mock/seed'

export interface CrudParams {
  page: number
  pageSize: number
  search: string
  sort?: string
  dir?: 'asc' | 'desc'
  filters: Record<string, unknown>
}

export type CrudListScope = Pick<ListParams, 'branchId'>

export interface CrudQueryBehavior {
  refetchOnMount?: boolean | 'always'
}

const DEFAULT_PARAMS: CrudParams = {
  page: 1,
  pageSize: 20,
  search: '',
  filters: {},
}

const BULK_DELETE_CONCURRENCY = 10

export function invalidateCrudQueries(qc: QueryClient, resource: string) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: [resource] }),
    qc.invalidateQueries({ queryKey: ['lookup', resource] }),
  ])
}

export interface BulkDeleteResult {
  successfulIds: string[]
  failedIds: string[]
  successCount: number
  failureCount: number
}

export function selectedRowIds(
  rowSelection: Record<string, boolean>,
): string[] {
  return Object.keys(rowSelection).filter((id) => rowSelection[id])
}

export function failedBulkDeleteSelection(
  result: BulkDeleteResult,
): Record<string, boolean> {
  return Object.fromEntries(result.failedIds.map((id) => [id, true]))
}

export function notifyBulkDeleteResult(result: BulkDeleteResult): void {
  const message = `Đã xóa: ${result.successCount} thành công / ${result.failureCount} lỗi`
  if (result.failureCount > 0) notify.error(message)
  else notify.success(message)
}

export interface UseCrudReturn<T extends { id: string }> {
  params: CrudParams
  setParams: React.Dispatch<React.SetStateAction<CrudParams>>
  setSearch: (v: string) => void
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  setSort: (key: string, dir: 'asc' | 'desc') => void
  setFilters: (f: Record<string, unknown>) => void
  listQuery: UseQueryResult<PagedResult<T>>
  createMutation: ReturnType<
    typeof useMutation<T, Error, Omit<T, 'id' | 'createdAt'>>
  >
  updateMutation: ReturnType<
    typeof useMutation<T, Error, { id: string; data: Partial<T> }>
  >
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>
  bulkDelete: (ids: string[]) => Promise<BulkDeleteResult>
  isBulkDeleting: boolean
}

export function useCrud<T extends { id: string }>(
  config: CrudConfig<T>,
  enabled = true,
  listScope: CrudListScope = {},
  queryBehavior: CrudQueryBehavior = {},
): UseCrudReturn<T> {
  const qc = useQueryClient()
  const key = config.resourceKey
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const [params, setParams] = useState<CrudParams>(() => ({
    ...DEFAULT_PARAMS,
    pageSize: config.pageSize ?? 20,
    ...(config.defaultSort
      ? { sort: String(config.defaultSort.key), dir: config.defaultSort.dir }
      : {}),
  }))

  const listParams: ListParams = {
    page: params.page,
    pageSize: params.pageSize,
    ...(listScope.branchId ? { branchId: listScope.branchId } : {}),
    search: params.search || undefined,
    sort: params.sort,
    dir: params.dir,
    filters: Object.keys(params.filters).length ? params.filters : undefined,
  }

  const listQuery = useQuery<PagedResult<T>>({
    queryKey: [key, listParams],
    queryFn: () => config.mockApi.list(listParams),
    enabled,
    staleTime: 30_000,
    refetchOnMount: queryBehavior.refetchOnMount,
  })

  const invalidate = () => invalidateCrudQueries(qc, key)

  const createMutation = useMutation<T, Error, Omit<T, 'id' | 'createdAt'>>({
    mutationFn: (data) => config.mockApi.create(data),
    onSuccess: () => {
      invalidate()
      notify.success('Đã thêm thành công')
    },
    onError: (err) => notify.error(err.message),
  })

  const updateMutation = useMutation<
    T,
    Error,
    { id: string; data: Partial<T> }
  >({
    mutationFn: ({ id, data }) => config.mockApi.update(id, data),
    onSuccess: () => {
      invalidate()
      notify.success('Đã cập nhật')
    },
    onError: (err) => notify.error(err.message),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => config.mockApi.remove(id),
    onSuccess: () => {
      invalidate()
      notify.success('Đã xóa')
    },
    onError: (err) => notify.error(err.message),
  })

  const bulkDelete = useCallback(
    async (ids: string[]): Promise<BulkDeleteResult> => {
      setIsBulkDeleting(true)
      const successfulIds: string[] = []
      const failedIds: string[] = []

      try {
        for (
          let start = 0;
          start < ids.length;
          start += BULK_DELETE_CONCURRENCY
        ) {
          const chunk = ids.slice(start, start + BULK_DELETE_CONCURRENCY)
          const results = await Promise.allSettled(
            chunk.map((id) => config.mockApi.remove(id)),
          )

          results.forEach((result, index) => {
            const id = chunk[index]
            if (result.status === 'fulfilled') successfulIds.push(id)
            else failedIds.push(id)
          })
        }

        if (ids.length > 0) {
          await invalidateCrudQueries(qc, key)
        }

        return {
          successfulIds,
          failedIds,
          successCount: successfulIds.length,
          failureCount: failedIds.length,
        }
      } finally {
        setIsBulkDeleting(false)
      }
    },
    [config.mockApi, key, qc],
  )

  const setSearch = (v: string) =>
    setParams((p) => ({ ...p, search: v, page: 1 }))

  const setPage = (page: number) => setParams((p) => ({ ...p, page }))

  const setPageSize = (pageSize: number) =>
    setParams((p) => ({ ...p, pageSize, page: 1 }))

  const setSort = (sortKey: string, dir: 'asc' | 'desc') =>
    setParams((p) => ({ ...p, sort: sortKey, dir, page: 1 }))

  const setFilters = (filters: Record<string, unknown>) =>
    setParams((p) => ({ ...p, filters, page: 1 }))

  return {
    params,
    setParams,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDelete,
    isBulkDeleting,
  }
}
