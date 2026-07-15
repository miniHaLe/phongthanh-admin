import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'
import {
  fetchVietnamAdministrativeSnapshot,
  resetVietnamAdministrativeSnapshotCache,
  setMockVietnamAdministrativeSnapshot,
} from './vietnam-geography'

const mocks = vi.hoisted(() => ({
  isReal: vi.fn(),
  getApiJson: vi.fn(),
}))

vi.mock('./api-for', () => ({ isReal: mocks.isReal }))
vi.mock('./http-client', () => ({ getApiJson: mocks.getApiJson }))

const snapshot: VietnamAdministrativeSnapshot = {
  version: 'official-test',
  effectiveFrom: '2025-07-01',
  sourceDocument: 'Decision 19',
  provinces: [],
  communes: [],
}

beforeEach(() => {
  resetVietnamAdministrativeSnapshotCache()
  mocks.isReal.mockReset().mockReturnValue(true)
  mocks.getApiJson.mockReset()
})

describe('fetchVietnamAdministrativeSnapshot', () => {
  it('coalesces concurrent requests onto one in-flight fetch', async () => {
    let resolve!: (value: VietnamAdministrativeSnapshot) => void
    mocks.getApiJson.mockReturnValue(
      new Promise((promiseResolve) => {
        resolve = promiseResolve
      }),
    )

    const first = fetchVietnamAdministrativeSnapshot()
    const second = fetchVietnamAdministrativeSnapshot()
    resolve(snapshot)

    await expect(first).resolves.toBe(snapshot)
    await expect(second).resolves.toBe(snapshot)
    expect(mocks.getApiJson).toHaveBeenCalledTimes(1)
  })

  it('clears a failed in-flight request so a later call can retry', async () => {
    mocks.getApiJson
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(snapshot)

    await expect(fetchVietnamAdministrativeSnapshot()).rejects.toThrow(
      'network',
    )
    await expect(fetchVietnamAdministrativeSnapshot()).resolves.toBe(snapshot)
    expect(mocks.getApiJson).toHaveBeenCalledTimes(2)
  })

  it('uses an explicitly injected mock snapshot without an HTTP request', async () => {
    setMockVietnamAdministrativeSnapshot(snapshot)

    await expect(fetchVietnamAdministrativeSnapshot()).resolves.toBe(snapshot)
    expect(mocks.getApiJson).not.toHaveBeenCalled()
  })
})
