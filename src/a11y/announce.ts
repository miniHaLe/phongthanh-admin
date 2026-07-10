/**
 * Aria-live announcer singleton.
 * Mounts two hidden live regions (polite + assertive) once on first call,
 * then exports `announce(msg, urgency?)` for any module to call.
 * Also exports <A11yAnnouncer/> — mount once at app root (e.g. in App.tsx).
 *
 * Note: shadcn Dialog/Sheet trap focus via Radix — this module is for
 * custom overlays and table/filter state change announcements.
 */

/** Urgency matches aria-live values. */
export type AnnounceUrgency = 'polite' | 'assertive'

let politeEl: HTMLElement | null = null
let assertiveEl: HTMLElement | null = null
let mounted = false

function ensureMounted(): void {
  if (mounted) return
  mounted = true

  const style: Partial<CSSStyleDeclaration> = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: '0',
  }

  function makeRegion(live: AnnounceUrgency): HTMLElement {
    const el = document.createElement('div')
    el.setAttribute('aria-live', live)
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('aria-relevant', 'additions text')
    Object.assign(el.style, style)
    document.body.appendChild(el)
    return el
  }

  politeEl = makeRegion('polite')
  assertiveEl = makeRegion('assertive')
}

let politeTimer: ReturnType<typeof setTimeout> | null = null
let assertiveTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Announce a message to screen readers.
 * Clears the region first (so repeated identical messages still fire).
 */
export function announce(
  msg: string,
  urgency: AnnounceUrgency = 'polite',
): void {
  ensureMounted()

  if (urgency === 'assertive') {
    if (!assertiveEl) return
    if (assertiveTimer) clearTimeout(assertiveTimer)
    assertiveEl.textContent = ''
    assertiveTimer = setTimeout(() => {
      if (assertiveEl) assertiveEl.textContent = msg
    }, 50)
  } else {
    if (!politeEl) return
    if (politeTimer) clearTimeout(politeTimer)
    politeEl.textContent = ''
    politeTimer = setTimeout(() => {
      if (politeEl) politeEl.textContent = msg
    }, 50)
  }
}

// ── React component ──────────────────────────────────────────────────────────
// Lazy import to avoid bundling React in non-React contexts.
// The component simply calls ensureMounted() once on mount.

import { useEffect } from 'react'

/**
 * Mount once at app root (e.g. inside App.tsx alongside <Toaster/>).
 * Idempotent — calling twice is safe.
 */
export function A11yAnnouncer(): null {
  useEffect(() => {
    ensureMounted()
  }, [])
  return null
}
