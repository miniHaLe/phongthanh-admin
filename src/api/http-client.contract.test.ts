/**
 * MSW-backed CONTRACT test for `makeHttpApi` (plan Phase 1, Step 1 — the
 * regression gate that replaces the retired white-box mock tests). Asserts the
 * EXACT wire contract the real backend must satisfy: `ListParams` query
 * serialization, `PagedResult` shape, and that real 401/403/409/timeout paths
 * (which the mock never exercised) surface a Vietnamese `Error.message`.
 *
 * Server lifecycle is scoped to this file so global fetch interception does not
 * leak into the other mock-based suites.
 */
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest'
import type { BaseEntity, PagedResult } from '@/mock/seed'
import { makeHttpApi } from './http-client'
import { setAccessToken } from './auth-token'

interface Row extends BaseEntity {
  tenKH: string
}

// Pin the client's base URL to the MSW mock host regardless of the machine's
// VITE_API_URL default — the contract is about wire shape, not the real port.
const API = 'http://localhost:3000'
const BASE = `${API}/api/v1/khach-hang`

const server = setupServer()

beforeAll(() => {
  vi.stubEnv('VITE_API_URL', API)
  setAccessToken('test-access-token')
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
  vi.unstubAllEnvs()
})
afterEach(() => server.resetHandlers())
afterAll(() => {
  server.close()
  setAccessToken(null)
})

const api = makeHttpApi<Row>('khach-hang')

describe('makeHttpApi — request contract', () => {
  it('serializes ListParams into the query string and attaches the Bearer token', async () => {
    let seenUrl: URL | undefined
    let seenAuth: string | null = null
    server.use(
      http.get(BASE, ({ request }) => {
        seenUrl = new URL(request.url)
        seenAuth = request.headers.get('Authorization')
        return HttpResponse.json({ data: [], total: 0, page: 2, pageSize: 20 })
      }),
    )

    await api.list({
      page: 2,
      pageSize: 20,
      sort: 'tenKH',
      dir: 'asc',
      search: 'Nguyễn',
      filters: { loaiKhachHangId: 1, active: '' },
    })

    const q = seenUrl!.searchParams
    expect(q.get('page')).toBe('2')
    expect(q.get('pageSize')).toBe('20')
    expect(q.get('sort')).toBe('tenKH')
    expect(q.get('dir')).toBe('asc')
    expect(q.get('search')).toBe('Nguyễn')
    expect(q.get('filters[loaiKhachHangId]')).toBe('1')
    // Empty filter values are omitted, not sent as blank.
    expect(q.has('filters[active]')).toBe(false)
    expect(seenAuth).toBe('Bearer test-access-token')
  })

  it('returns the exact PagedResult shape unchanged', async () => {
    const payload: PagedResult<Row> = {
      data: [
        { id: 'kh-1', tenKH: 'An', active: true, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    }
    server.use(http.get(BASE, () => HttpResponse.json(payload)))
    const res = await api.list({ page: 1, pageSize: 20 })
    expect(res).toEqual(payload)
  })

  it('POST/PATCH/DELETE hit the right method + URL', async () => {
    const seen: string[] = []
    server.use(
      http.post(BASE, async () => {
        seen.push('POST')
        return HttpResponse.json({ id: 'kh-new', tenKH: 'X', active: true, createdAt: 'now' })
      }),
      http.patch(`${BASE}/kh-1`, () => {
        seen.push('PATCH')
        return HttpResponse.json({ id: 'kh-1', tenKH: 'Y', active: true, createdAt: 'now' })
      }),
      http.delete(`${BASE}/kh-1`, () => {
        seen.push('DELETE')
        return new HttpResponse(null, { status: 204 })
      }),
    )
    await api.create({ tenKH: 'X' } as Omit<Row, 'id' | 'createdAt'>)
    await api.update('kh-1', { tenKH: 'Y' })
    await api.remove('kh-1')
    expect(seen).toEqual(['POST', 'PATCH', 'DELETE'])
  })
})

describe('makeHttpApi — error contract (paths the mock never exercised)', () => {
  it('surfaces the server Vietnamese message on 400 (sort/filter allowlist)', async () => {
    server.use(
      http.get(BASE, () =>
        HttpResponse.json({ message: 'Cột sắp xếp không hợp lệ' }, { status: 400 }),
      ),
    )
    await expect(api.list({ page: 1, pageSize: 20, sort: 'password' })).rejects.toThrow(
      'Cột sắp xếp không hợp lệ',
    )
  })

  it('maps 403 to a Vietnamese permission message', async () => {
    server.use(http.get(BASE, () => new HttpResponse(null, { status: 403 })))
    await expect(api.list({ page: 1, pageSize: 20 })).rejects.toThrow(/không có quyền/i)
  })

  it('maps 409 to a Vietnamese conflict message', async () => {
    server.use(http.patch(`${BASE}/kh-1`, () => new HttpResponse(null, { status: 409 })))
    await expect(api.update('kh-1', { tenKH: 'Z' })).rejects.toThrow(/tải lại/i)
  })

  it('maps a network failure to a Vietnamese connection message', async () => {
    server.use(http.get(BASE, () => HttpResponse.error()))
    await expect(api.list({ page: 1, pageSize: 20 })).rejects.toThrow(/không thể kết nối/i)
  })
})

describe('makeHttpApi — 401 refresh-and-retry', () => {
  it('refreshes once on 401 then retries with the new token', async () => {
    setAccessToken('stale-token')
    let listCalls = 0
    let refreshCalls = 0
    let refreshCsrfHeader: string | null = null
    server.use(
      http.post(`${API}/auth/refresh`, ({ request }) => {
        refreshCalls += 1
        refreshCsrfHeader = request.headers.get('X-Requested-With')
        return HttpResponse.json({ accessToken: 'fresh-token' })
      }),
      http.get(BASE, ({ request }) => {
        listCalls += 1
        const auth = request.headers.get('Authorization')
        if (auth === 'Bearer fresh-token') {
          return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 })
        }
        return new HttpResponse(null, { status: 401 })
      }),
    )

    const res = await api.list({ page: 1, pageSize: 20 })
    expect(res.total).toBe(0)
    expect(refreshCalls).toBe(1)
    expect(listCalls).toBe(2) // original 401 + retry with fresh token
    // The refresh MUST carry the CSRF header or the server's guard 403s it.
    expect(refreshCsrfHeader).toBe('XMLHttpRequest')
  })
})
