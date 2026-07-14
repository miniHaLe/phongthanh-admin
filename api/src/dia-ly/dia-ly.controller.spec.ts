import type { Response } from 'express'
import type { DbClient } from '../db/client'
import { tinhThanh } from '../db/schema'
import { DiaLyController } from './dia-ly.controller'

const provinces = [
  {
    code: '66',
    name: 'Đắk Lắk',
    type: 'province',
    normalizedName: 'dak lak',
    effectiveFrom: '2025-07-01',
    snapshotVersion: 'official-2025.07.01',
    sourceDocument: 'Decision 19',
  },
]

const communes = [
  {
    code: '24181',
    name: 'Ea Drăng',
    type: 'commune',
    normalizedName: 'ea drang',
    provinceCode: '66',
    effectiveFrom: '2025-07-01',
    snapshotVersion: 'official-2025.07.01',
    sourceDocument: 'Decision 19',
  },
]

function makeController() {
  const db = {
    select: jest.fn(() => ({
      from: jest.fn((table: unknown) => ({
        orderBy: jest
          .fn()
          .mockResolvedValue(table === tinhThanh ? provinces : communes),
      })),
    })),
  } as unknown as DbClient
  return new DiaLyController(db)
}

function makeResponse() {
  return {
    setHeader: jest.fn(),
  } as unknown as Response
}

describe('DiaLyController cache headers', () => {
  it('gives the unversioned snapshot a short revalidation policy and version key', async () => {
    const response = makeResponse()
    const result = await makeController().getSnapshot(response)

    expect(result.version).toBe('official-2025.07.01')
    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=86400',
    )
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Snapshot-Version',
      'official-2025.07.01',
    )
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Location',
      '/api/v1/dia-ly?v=official-2025.07.01',
    )
  })

  it('marks a matching version-keyed snapshot immutable', async () => {
    const response = makeResponse()
    await makeController().getSnapshot(response, 'official-2025.07.01')

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    )
  })
})
