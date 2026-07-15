import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { PagedResult } from '@/mock/seed'
import type { NguoiDung } from '@/types/masterdata-types'
import { setAccessToken } from './auth-token'
import { makeHttpApi } from './http-client'

const API = 'http://localhost:3000'
const BASE = `${API}/api/v1/nguoi-dung`
const server = setupServer()

const responseRow: NguoiDung = {
  id: 'nd-contract',
  tenDangNhap: 'contract-user',
  hoTen: 'Người dùng hợp đồng',
  chiNhanhId: 'cn-1',
  nhomQuyenId: 'nq-5',
  chiNhanhPhuIds: [],
  locked: false,
  active: true,
  createdAt: '2026-07-15T07:00:00.000Z',
}

beforeAll(() => {
  vi.stubEnv('VITE_API_URL', API)
  setAccessToken('identity-contract-token')
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => server.resetHandlers())

afterAll(() => {
  server.close()
  setAccessToken(null)
  vi.unstubAllEnvs()
})

const api = makeHttpApi<NguoiDung>('nguoi-dung')

describe('nguoi-dung HTTP wire contract', () => {
  it('keeps the PagedResult shape and never exposes password fields', async () => {
    const payload: PagedResult<NguoiDung> = {
      data: [responseRow],
      total: 1,
      page: 1,
      pageSize: 20,
    }
    server.use(http.get(BASE, () => HttpResponse.json(payload)))

    const response = await api.list({ page: 1, pageSize: 20 })

    expect(response).toEqual(payload)
    expect('password' in response.data[0]).toBe(false)
    expect('passwordHash' in response.data[0]).toBe(false)
  })

  it('sends password on create but accepts only the sanitized response row', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.post(BASE, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(responseRow, { status: 201 })
      }),
    )

    const response = await api.create({
      tenDangNhap: 'contract-user',
      hoTen: 'Người dùng hợp đồng',
      password: 'Secret2026',
      chiNhanhId: 'cn-1',
      nhomQuyenId: 'nq-5',
      active: true,
    })

    expect(requestBody?.password).toBe('Secret2026')
    expect(response).toEqual(responseRow)
    expect('password' in response).toBe(false)
    expect('passwordHash' in response).toBe(false)
  })
})
