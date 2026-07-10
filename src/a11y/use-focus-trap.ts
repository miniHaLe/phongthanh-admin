/**
 * useFocusTrap — traps Tab/Shift+Tab within `ref` when `active=true`.
 * On deactivate: returns focus to the element that triggered the trap.
 * Note: shadcn Dialog/Sheet already trap focus via Radix — use this only
 * for custom overlays (command palette, custom drawers, etc.).
 */
import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  ).filter(
    (el) => !el.closest('[inert]') && getComputedStyle(el).display !== 'none',
  )
}

/**
 * @param ref — ref to the container element to trap focus within
 * @param active — enable/disable the trap; toggling from true→false returns
 *   focus to the element that was focused when `active` first became true.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
): void {
  // Store the element that had focus before the trap activated
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) {
      // Return focus to trigger when deactivating
      triggerRef.current?.focus()
      triggerRef.current = null
      return
    }

    // Save currently focused element as trigger
    triggerRef.current = document.activeElement as HTMLElement | null

    // Move focus into the container (first focusable child)
    const container = ref.current
    if (!container) return
    const focusables = getFocusableElements(container)
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      // Make container itself focusable as fallback
      container.setAttribute('tabindex', '-1')
      container.focus()
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return
      const el = ref.current
      if (!el) return
      const focusables = getFocusableElements(el)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, ref])
}
