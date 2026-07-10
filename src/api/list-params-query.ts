/**
 * Serializes `ListParams` into the query string the backend CRUD controller
 * parses. Filters are sent as `filters[key]=value` (bracket notation) so the
 * server can rebuild the `Record<string, unknown>` the mock consumed. Empty /
 * undefined values are omitted so the wire shape stays minimal and stable.
 */
import type { ListParams } from '@/mock/seed'

export function toQuery(params: ListParams): string {
  const q = new URLSearchParams()
  q.set('page', String(params.page))
  q.set('pageSize', String(params.pageSize))
  if (params.sort) q.set('sort', params.sort)
  if (params.dir) q.set('dir', params.dir)
  if (params.search) q.set('search', params.search)

  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== null && v !== '') {
        q.set(`filters[${k}]`, String(v))
      }
    }
  }
  return q.toString()
}
