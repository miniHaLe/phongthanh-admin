import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BaseEntity } from '@/mock/seed'
import { makeMockApi, resolveMockListErrorRate } from './make-mock-api'

const mocks = vi.hoisted(() => ({
  maybeThrow: vi.fn(),
}))

vi.mock('@/lib/mock-delay', () => ({
  mockDelay: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/mock-error', () => ({ maybeThrow: mocks.maybeThrow }))

interface TestRow extends BaseEntity {
  name: string
}

beforeEach(() => {
  mocks.maybeThrow.mockReset()
})

describe('makeMockApi error injection', () => {
  it('disables random failures in production and keeps the development rate', () => {
    expect(resolveMockListErrorRate(undefined, false)).toBe(0)
    expect(resolveMockListErrorRate(undefined, true)).toBe(0.05)
  })

  it('accepts an explicit test injection rate', async () => {
    const rows: TestRow[] = [
      {
        id: 'row-1',
        name: 'Ổn định',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    const api = makeMockApi(rows, { listErrorRate: 1 })

    await expect(api.list({ page: 1, pageSize: 20 })).resolves.toMatchObject({
      data: rows,
      total: 1,
    })
    expect(mocks.maybeThrow).toHaveBeenCalledWith(1)
  })
})
