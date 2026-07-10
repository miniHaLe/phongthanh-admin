/**
 * Demo reset — clears all persisted Zustand store keys from localStorage
 * then reloads the page, restoring the app to its initial seeded state.
 *
 * Called by Ctrl+Shift+R (dev-only, registered in App.tsx):
 *   if (import.meta.env.DEV) {
 *     document.addEventListener('keydown', (e) => {
 *       if (e.ctrlKey && e.shiftKey && e.key === 'R') { e.preventDefault(); resetDemo() }
 *     })
 *   }
 */
import { ALL_STORE_KEYS } from '@/lib/store-keys'

/**
 * Wipes every persisted localStorage key registered in STORE_KEYS,
 * then hard-reloads the page. The seed arrays are module-level constants
 * (not stored in localStorage) so they regenerate identically on reload.
 */
export function resetDemo(): void {
  for (const key of ALL_STORE_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      // localStorage may be unavailable in some iframe contexts — ignore
    }
  }
  window.location.reload()
}
