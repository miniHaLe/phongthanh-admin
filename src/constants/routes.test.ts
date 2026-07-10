/** Spec: Phase 2 shell routes. */
import { describe, it, expect } from 'vitest'
import { ROUTES } from './routes'

describe('Phase 2 routes', () => {
  it('exposes the new shell-accessed paths', () => {
    expect(ROUTES.notifications).toBe('/thong-bao')
    expect(ROUTES.news).toBe('/tin-tuc')
    expect(ROUTES.account).toBe('/tai-khoan')
    expect(ROUTES.newsDetail('abc')).toBe('/tin-tuc/abc')
  })
})
