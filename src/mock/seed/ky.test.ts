/** Spec: Kỳ periods span 1/2018→7/2026 (HR/warehouse/repair-main specs). */
import { describe, it, expect } from 'vitest'
import { KY, KY_DEFAULT } from './ky'

describe('KY (period lookup)', () => {
  it('spans 1/2018 → 7/2026 inclusive (103 periods)', () => {
    expect(KY).toHaveLength(103)
    expect(KY.map((k) => k.ten)).toContain('1/2018')
    expect(KY.map((k) => k.ten)).toContain('7/2026')
  })

  it('labels match /^([1-9]|1[0-2])\\/\\d{4}$/', () => {
    for (const k of KY) expect(k.ten).toMatch(/^([1-9]|1[0-2])\/\d{4}$/)
  })

  it('has unique ids', () => {
    expect(new Set(KY.map((k) => k.id)).size).toBe(KY.length)
  })

  it('default kỳ is the 7/2026 entry', () => {
    expect(KY_DEFAULT.ten).toBe('7/2026')
  })
})
