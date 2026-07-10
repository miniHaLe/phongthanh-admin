/** Spec: single-status filter + soPhieuHang bug fix (independent from soPhieu). */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useRepairFilters } from './use-repair-filters'

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useRepairFilters', () => {
  it('defaults have no status filter and dateType nhan', () => {
    const { result } = renderHook(() => useRepairFilters(), { wrapper })
    expect(result.current.filters.tinhTrang).toBeUndefined()
    expect(result.current.filters.dateType).toBe('nhan')
  })

  it('sets a single status id (not an array)', () => {
    const { result } = renderHook(() => useRepairFilters(), { wrapper })
    act(() => result.current.setFilters({ tinhTrang: 7 }))
    expect(result.current.filters.tinhTrang).toBe(7)
  })

  it('soPhieuHang and soPhieu are independent, combinable fields (bug fix)', () => {
    const { result } = renderHook(() => useRepairFilters(), { wrapper })
    act(() => result.current.setFilters({ soPhieu: 'PSC-1' }))
    act(() => result.current.setFilters({ soPhieuHang: 'HH-9' }))
    expect(result.current.filters.soPhieu).toBe('PSC-1')
    expect(result.current.filters.soPhieuHang).toBe('HH-9')
  })

  it('clearFilters restores defaults', () => {
    const { result } = renderHook(() => useRepairFilters(), { wrapper })
    act(() => result.current.setFilters({ tinhTrang: 7, soSerial: 'SN1' }))
    act(() => result.current.clearFilters())
    expect(result.current.filters.tinhTrang).toBeUndefined()
    expect(result.current.filters.soSerial).toBeUndefined()
  })
})
