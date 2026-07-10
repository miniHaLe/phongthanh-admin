/**
 * Seed contract (C4). Holds the shared base types plus additive reference-data
 * and lookup modules that consuming pages import directly.
 *
 * The live render layers each page reads (repair, dashboard, finance, catalog,
 * inventory) live outside this barrel — see plan §"Data-Layer Reconciliation
 * (D5)". The lookup modules below are additive taxonomy fixtures; P5/P6 wire
 * them into the live layers they edit.
 */
export * from './branches'
export * from './reference-data'
export * from './staff'
export * from './products'

// Shared lookup modules (additive taxonomies + relational fixtures).
export * from './ky'
export * from './tinh-quan-xa'
export * from './nhom-khach-hang'
export * from './chung-tu'
export * from './cong-no'
export * from './tra-hang'
export * from './cham-cong'
export * from './loi-sua-chua'
export * from './phi-giao'

/** Shared base for persisted-looking mock entities. */
export interface BaseEntity {
  id: string
  createdAt: string // ISO
  updatedAt?: string
  active: boolean
}

/** Generic paged result shape used by all mock list APIs. */
export interface PagedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/** Generic list params accepted by all mock list APIs. */
export interface ListParams {
  page: number
  pageSize: number
  sort?: string
  dir?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}
