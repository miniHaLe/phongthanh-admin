/**
 * The ONE switch every CRUD resource flows through. `isReal(resource)` reads the
 * dev/CI-only `VITE_REAL_RESOURCES` allowlist (comma-separated resourceKeys); a
 * listed resource hits the real API via `makeHttpApi`, everything else stays on
 * the in-memory mock. This flag is dev/CI-only — the prod build guard
 * (`scripts/assert-real-resources.mjs`) fails a production build whose allowlist
 * does not cover every release resource, so no partially-enforced bundle ships.
 */
import type { BaseEntity } from '@/mock/seed'
import type { MockApi } from '@/types/crud-types'
import { makeMockApi } from '@/mock/masterdata'
import { makeHttpApi } from './http-client'

function realResourceSet(): Set<string> {
  const raw = import.meta.env.VITE_REAL_RESOURCES ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

export function isReal(resource: string): boolean {
  return realResourceSet().has(resource)
}

/**
 * Returns the real HTTP API when `resource` is flagged real, otherwise a mock
 * backed by `seed`. Drop-in replacement for a bare `makeMockApi(seed)` call in a
 * resource's config.
 */
export function apiFor<T extends BaseEntity>(
  resource: string,
  seed: T[],
): MockApi<T> {
  return isReal(resource) ? makeHttpApi<T>(resource) : makeMockApi<T>(seed)
}
