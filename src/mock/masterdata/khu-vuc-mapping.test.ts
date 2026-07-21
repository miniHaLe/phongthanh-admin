/**
 * Phase 4 sanity: every seeded Khu Vực row carries a 2-digit snapshot province
 * code, no legacy tinhId/quanId/xaId survive, and legacy rows leave phuongXaCode
 * empty (per the documented best-effort merger mapping).
 */
import { describe, expect, it } from 'vitest'
import { KHU_VUC_ROWS } from './khu-vuc.mock'
import { VIETNAM_ADMINISTRATIVE_SNAPSHOT } from '@/data/vietnam-administrative-snapshot'

describe('khu-vuc mock mapping', () => {
  it('has rows and none carry legacy tinhId/quanId/xaId', () => {
    expect(KHU_VUC_ROWS.length).toBeGreaterThan(0)
    for (const row of KHU_VUC_ROWS) {
      expect(row).not.toHaveProperty('quanId')
      expect(row).not.toHaveProperty('xaId')
      expect(row).not.toHaveProperty('tinhId')
    }
  })

  it('maps every row onto an existing snapshot province code', () => {
    const provinceCodes = new Set(
      VIETNAM_ADMINISTRATIVE_SNAPSHOT.provinces.map((p) => p.code),
    )
    for (const row of KHU_VUC_ROWS) {
      expect(row.tinhCode).toMatch(/^\d{2}$/)
      expect(provinceCodes.has(row.tinhCode)).toBe(true)
    }
  })

  it('leaves legacy rows with an empty phuongXaCode (merger-lossy)', () => {
    for (const row of KHU_VUC_ROWS) {
      expect(row.phuongXaCode).toBe('')
    }
  })
})
