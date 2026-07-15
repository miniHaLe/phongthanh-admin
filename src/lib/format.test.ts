import { describe, expect, it } from 'vitest'
import { formatDateTime } from './format'

describe('formatDateTime', () => {
  it('uses a Vietnamese 24-hour representation', () => {
    expect(formatDateTime('2026-07-14T13:05:00')).toBe('14/07/2026 13:05')
    expect(formatDateTime('2026-07-14T01:05:00')).toBe('14/07/2026 01:05')
  })
})
