/**
 * Wire-contract types re-exported byte-identical to the frontend mock's
 * `src/mock/seed/index.ts` + `src/types/crud-types.ts`. Kept in sync manually
 * (no build-time shared package — D1 sibling-`api/` decision); the MSW
 * contract test on the frontend is the runtime guarantee against drift.
 */

/** Shared base for all persisted entities. Mirrors `src/mock/seed/index.ts`. */
export interface BaseEntity {
  id: string
  createdAt: string // ISO
  updatedAt?: string
  active: boolean
}

/** Generic paged result shape used by all list endpoints. */
export interface PagedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/** Generic list params accepted by all list endpoints. */
export interface ListParams {
  page: number
  pageSize: number
  sort?: string
  dir?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

/** Mirrors `src/types/crud-types.ts` MockApi<T> — the client-side contract
 * a real HTTP resource must satisfy. Not implemented server-side directly,
 * but the endpoint set below is engineered to satisfy it. */
export interface MockApi<T> {
  list: (params: ListParams) => Promise<PagedResult<T>>
  get: (id: string) => Promise<T>
  create: (data: Omit<T, 'id' | 'createdAt'>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
}
