import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { MockApi } from '@/types/crud-types'
import type { TinTuc } from './tin-tuc-api'

const API = 'http://localhost:3000'
const BASE = `${API}/api/v1/tin-tuc`
const server = setupServer()

let api: MockApi<TinTuc>
let listTinTuc: typeof import('./tin-tuc-api')['listTinTuc']
let createTinTuc: typeof import('./tin-tuc-api')['createTinTuc']

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', API)
  vi.stubEnv('VITE_REAL_RESOURCES', 'tin-tuc')
  vi.resetModules()
  const auth = await import('./auth-token')
  auth.setAccessToken('tin-tuc-contract-token')
  const module = await import('./tin-tuc-api')
  api = module.tinTucApi
  listTinTuc = module.listTinTuc
  createTinTuc = module.createTinTuc
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => server.resetHandlers())

afterAll(async () => {
  server.close()
  const auth = await import('./auth-token')
  auth.setAccessToken(null)
  vi.unstubAllEnvs()
})

describe('tin-tuc real HTTP contract', () => {
  it('lists through /api/v1/tin-tuc with the MockApi paged shape', async () => {
    let seenUrl: URL | undefined
    server.use(
      http.get(BASE, ({ request }) => {
        seenUrl = new URL(request.url)
        return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 100 })
      }),
    )

    const response = await api.list({
      page: 1,
      pageSize: 100,
      sort: 'createdAt',
      dir: 'desc',
      search: 'lịch trực',
    })

    expect(response).toEqual({ data: [], total: 0, page: 1, pageSize: 100 })
    expect(seenUrl?.searchParams.get('search')).toBe('lịch trực')
    expect(seenUrl?.searchParams.get('sort')).toBe('createdAt')
    expect(seenUrl?.searchParams.get('dir')).toBe('desc')
  })

  it('creates a news item with the authenticated resource POST', async () => {
    let requestBody: Record<string, unknown> | undefined
    const created: TinTuc = {
      id: 'tin-created',
      title: 'Lịch bảo trì',
      body: 'Kiểm tra thiết bị.',
      author: 'admin',
      active: true,
      createdAt: '2026-07-15T09:00:00.000Z',
    }
    server.use(
      http.post(BASE, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(created, { status: 201 })
      }),
    )

    const response = await api.create({
      title: created.title,
      body: created.body,
      author: 'client-value-is-server-stamped',
      active: true,
    })

    expect(requestBody).toMatchObject({
      title: created.title,
      body: created.body,
      active: true,
    })
    expect(response).toEqual(created)
  })

  it('lists through the page helper with trimmed search and legacy defaults', async () => {
    let seenUrl: URL | undefined
    server.use(
      http.get(BASE, ({ request }) => {
        seenUrl = new URL(request.url)
        return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 100 })
      }),
    )

    await listTinTuc('  lịch trực  ')

    expect(seenUrl?.searchParams.get('search')).toBe('lịch trực')
    expect(seenUrl?.searchParams.get('pageSize')).toBe('100')
    expect(seenUrl?.searchParams.get('sort')).toBe('createdAt')
    expect(seenUrl?.searchParams.get('dir')).toBe('desc')
  })

  it('creates through the page helper with normalized text', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.post(BASE, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            id: 'tin-helper',
            title: 'Tin helper',
            body: 'Nội dung helper',
            author: 'admin',
            active: true,
            createdAt: '2026-07-15T10:00:00.000Z',
          },
          { status: 201 },
        )
      }),
    )

    await createTinTuc({
      title: '  Tin helper  ',
      body: '  Nội dung helper  ',
    })

    expect(requestBody).toMatchObject({
      title: 'Tin helper',
      body: 'Nội dung helper',
      active: true,
    })
  })

  it('loads a detail item by id', async () => {
    const item: TinTuc = {
      id: 'tin-detail',
      title: 'Tin chi tiết',
      body: 'Nội dung chi tiết.',
      author: 'admin',
      active: true,
      createdAt: '2026-07-15T10:00:00.000Z',
    }
    server.use(http.get(`${BASE}/${item.id}`, () => HttpResponse.json(item)))

    await expect(api.get(item.id)).resolves.toEqual(item)
  })
})
