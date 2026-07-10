/**
 * Generic CRUD hook — wraps TanStack Query list + mutations for any CrudConfig<T>.
 * Invalidates the list cache and fires Vietnamese toasts on every mutation.
 */
import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
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

const DEFAULT_PARAMS: CrudParams = {
  page: 1,
  pageSize: 20,
  search: '',
  filters: {},
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
}

export function useCrud<T extends { id: string }>(
  config: CrudConfig<T>,
  enabled = true,
): UseCrudReturn<T> {
  const qc = useQueryClient()
  const key = config.resourceKey

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
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: [key] })

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
  }
}
