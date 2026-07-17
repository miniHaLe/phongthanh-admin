import { useSyncExternalStore } from 'react'

/**
 * ≥1920px = legacy-parity width: columns demoted for the 1366px fit
 * (`hidden: true` / `initiallyHidden`) become visible by default.
 * Explicit persisted user choices always win regardless of width.
 */
export const WIDE_TABLE_VIEWPORT_QUERY = '(min-width: 1920px)'

function getMediaQueryList(): MediaQueryList | null {
  // jsdom has no matchMedia — default to narrow (today's behavior).
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return window.matchMedia(WIDE_TABLE_VIEWPORT_QUERY)
}

function subscribe(onStoreChange: () => void): () => void {
  const mql = getMediaQueryList()
  if (!mql) return () => {}
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}

function getSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? false
}

/** True when the viewport is wide enough for legacy-parity column defaults. */
export function useWideViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
