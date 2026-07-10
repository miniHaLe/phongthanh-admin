import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { useTheme } from '@/hooks/use-theme'
import { ToastProvider } from '@/components/shared'
import { A11yAnnouncer } from '@/a11y/announce'
import { resetDemo } from '@/demo/demo-reset'

export default function App() {
  // Applies the `dark` class to <html> and reacts to system-preference changes.
  useTheme()

  // Dev-only demo reset: Ctrl+Shift+R clears persisted state and reloads.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault()
        resetDemo()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
      <A11yAnnouncer />
    </>
  )
}
