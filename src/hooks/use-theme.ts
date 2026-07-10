import { useEffect } from 'react'
import { useAppStore, type Theme } from '@/store/app-store'

/** Resolve `system` to a concrete light/dark using the OS preference. */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

/**
 * Applies the `dark` class to <html> based on the store theme.
 * Also reacts to OS preference changes while in `system` mode.
 * Mount once near the app root (App.tsx).
 */
export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const resolved = resolveTheme(theme)
      root.classList.toggle('dark', resolved === 'dark')
    }
    apply()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  return { theme, setTheme, resolvedTheme: resolveTheme(theme) }
}
