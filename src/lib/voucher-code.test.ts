import { describe, expect, it } from 'vitest'
import { nextVoucherCode } from './voucher-code'

const JULY_2026 = new Date(2026, 6, 15, 12)

describe('nextVoucherCode', () => {
  it('starts at 1 when no codes exist', () => {
    expect(nextVoucherCode('PBH', [], JULY_2026)).toBe('PBH-202607-1')
  })

  it('uses one more than the maximum ordinal for the same prefix and month', () => {
    expect(
      nextVoucherCode(
        'PBH',
        ['PBH-202607-2', 'PBH-202607-7', 'PBH-202607-4'],
        JULY_2026,
      ),
    ).toBe('PBH-202607-8')
  })

  it('resets the ordinal for a new month', () => {
    expect(nextVoucherCode('PBH', ['PBH-202606-9'], JULY_2026)).toBe(
      'PBH-202607-1',
    )
  })

  it('ignores legacy codes that do not match the new format', () => {
    expect(
      nextVoucherCode('PBH', ['PSC-300123', 'PBH-20260701-5'], JULY_2026),
    ).toBe('PBH-202607-1')
  })

  it('ignores codes belonging to other prefixes', () => {
    expect(nextVoucherCode('PBH', ['PTH-202607-12'], JULY_2026)).toBe(
      'PBH-202607-1',
    )
  })

  it('ignores undefined entries', () => {
    expect(nextVoucherCode('PCH', [undefined, 'PCH-202607-3'], JULY_2026)).toBe(
      'PCH-202607-4',
    )
  })
})
