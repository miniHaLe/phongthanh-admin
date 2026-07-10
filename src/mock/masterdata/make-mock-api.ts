/**
 * Standalone makeMockApi<T> factory (mirrors the one re-exported from
 * `./index`). HR mock files (phong-ban/chuc-vu/nhan-vien) import from here
 * instead of the barrel to avoid a real circular-evaluation bug: `./index`
 * re-exports every masterdata mock module in file order, and nhan-vien.mock.ts
 * reads `PHONG_BAN_ROWS`/`CHUC_VU_ROWS` at module-eval time. If the barrel is
 * entered via phong-ban.mock.ts or chuc-vu.mock.ts (which also import
 * `makeMockApi` from `./index`), that entry module is still mid-evaluation
 * when the cycle loops back through nhan-vien.mock.ts, so the live binding
 * it observes is still `undefined`. Importing this factory directly removes
 * the dependency on `./index` for the 3 files that need it, breaking the
 * cycle without touching the shared barrel or any catalog-owned mock file.
 */
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import type { BaseEntity, ListParams, PagedResult } from '@/mock/seed'
import type { MockApi } from '@/types/crud-types'

let _idCounter = 90000

function genId(): string {
  return String(++_idCounter)
}

function now(): string {
  return new Date().toISOString()
}

function applyParams<T extends BaseEntity>(
  rows: T[],
  params: ListParams,
): PagedResult<T> {
  let result = [...rows]

  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter((r) =>
      Object.values(r as Record<string, unknown>).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      ),
    )
  }

  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== '' && v !== null) {
        result = result.filter(
          (r) => String((r as Record<string, unknown>)[k]) === String(v),
        )
      }
    }
  }

  if (params.sort) {
    const key = params.sort as keyof T
    const dir = params.dir === 'desc' ? -1 : 1
    result = result.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * dir
      return String(av ?? '').localeCompare(String(bv ?? ''), 'vi') * dir
    })
  }

  const total = result.length
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const start = (page - 1) * pageSize
  const data = result.slice(start, start + pageSize)

  return { data, total, page, pageSize }
}

/** Wrap a mutable in-memory rows array with list/get/create/update/remove. */
export function makeMockApi<T extends BaseEntity>(rows: T[]): MockApi<T> {
  return {
    async list(params: ListParams): Promise<PagedResult<T>> {
      await mockDelay(300, 200)
      maybeThrow(0.05)
      return applyParams(rows, params)
    },

    async get(id: string): Promise<T> {
      await mockDelay(200, 100)
      const row = rows.find((r) => r.id === id)
      if (!row) throw new Error(`Không tìm thấy bản ghi id=${id}`)
      return { ...row }
    },

    async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
      await mockDelay(300, 150)
      const row: T = {
        ...(data as T),
        id: genId(),
        createdAt: now(),
        active: (data as Partial<T> & { active?: boolean }).active ?? true,
      }
      rows.unshift(row)
      return { ...row }
    },

    async update(id: string, data: Partial<T>): Promise<T> {
      await mockDelay(300, 150)
      const idx = rows.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error(`Không tìm thấy bản ghi id=${id}`)
      const updated: T = { ...rows[idx], ...data, updatedAt: now() }
      rows[idx] = updated
      return { ...updated }
    },

    async remove(id: string): Promise<void> {
      await mockDelay(200, 100)
      const idx = rows.findIndex((r) => r.id === id)
      if (idx !== -1) rows.splice(idx, 1)
    },
  }
}
