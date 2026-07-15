import { describe, expect, it } from 'vitest'
import { VIETNAM_ADMINISTRATIVE_SNAPSHOT as snapshot } from './vietnam-administrative-snapshot'

describe('Vietnam administrative snapshot', () => {
  it('matches Decision 19/2025/QD-TTg totals and code relationships', () => {
    expect(snapshot.version).toBe('official-2025.07.01')
    expect(snapshot.provinces).toHaveLength(34)
    expect(snapshot.communes).toHaveLength(3321)

    const provinceCodes = new Set(snapshot.provinces.map((item) => item.code))
    const communeCodes = new Set(snapshot.communes.map((item) => item.code))
    expect(provinceCodes.size).toBe(34)
    expect(communeCodes.size).toBe(3321)
    expect(
      snapshot.communes.every((item) => provinceCodes.has(item.provinceCode)),
    ).toBe(true)
    expect(snapshot.communes.find((item) => item.code === '24496')).toEqual(
      expect.objectContaining({
        name: 'Xã Ea Kly',
        type: 'commune',
        normalizedName: 'ea kly',
        provinceCode: '66',
      }),
    )
  })
})
