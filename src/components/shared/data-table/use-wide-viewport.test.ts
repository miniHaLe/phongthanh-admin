import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useWideViewport,
  WIDE_TABLE_VIEWPORT_QUERY,
} from './use-wide-viewport'

type ChangeListener = (event: { matches: boolean }) => void

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>()
  const mql = {
    matches: initialMatches,
    media: WIDE_TABLE_VIEWPORT_QUERY,
    addEventListener: (_type: string, listener: ChangeListener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: ChangeListener) => {
      listeners.delete(listener)
    },
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  )
  return {
    mql,
    listeners,
    setMatches(matches: boolean) {
      mql.matches = matches
      listeners.forEach((listener) => listener({ matches }))
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useWideViewport', () => {
  it('reflects the media query state', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useWideViewport())
    expect(result.current).toBe(true)
  })

  it('updates when the viewport crosses the breakpoint', () => {
    const media = stubMatchMedia(false)
    const { result } = renderHook(() => useWideViewport())
    expect(result.current).toBe(false)

    act(() => media.setMatches(true))
    expect(result.current).toBe(true)

    act(() => media.setMatches(false))
    expect(result.current).toBe(false)
  })

  it('removes the change listener on unmount', () => {
    const media = stubMatchMedia(false)
    const { unmount } = renderHook(() => useWideViewport())
    expect(media.listeners.size).toBe(1)
    unmount()
    expect(media.listeners.size).toBe(0)
  })

  it('defaults to narrow when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => useWideViewport())
    expect(result.current).toBe(false)
  })
})
