import { describe, expect, it } from 'vitest'
import {
  API_PAGE_SIZE_OPTIONS,
  COMPACT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE_OPTIONS,
  STANDARD_PAGE_SIZE_OPTIONS,
} from './page-size-options'

describe('page-size presets', () => {
  it('preserves compact, API-safe, standard, and pagination-default variants', () => {
    expect(DEFAULT_PAGE_SIZE_OPTIONS).toEqual([10, 25, 50, 100])
    expect(COMPACT_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100])
    expect(API_PAGE_SIZE_OPTIONS).toEqual([20, 30, 50, 100, 150, 200, 300])
    expect(STANDARD_PAGE_SIZE_OPTIONS).toEqual([20, 30, 50, 100, 150, 200, 300])
  })
})
