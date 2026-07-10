import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { hasAccessToken, refreshAccessToken } from '@/api/auth-client'
import { ROUTES } from '@/constants/routes'

type AuthState = 'checking' | 'authenticated' | 'anonymous'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasAccessToken() ? 'authenticated' : 'checking',
  )

  useEffect(() => {
    if (authState !== 'checking') return
    let active = true
    refreshAccessToken().then((token) => {
      if (!active) return
      setAuthState(token ? 'authenticated' : 'anonymous')
    })
    return () => {
      active = false
    }
  }, [authState])

  if (authState === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (authState === 'anonymous') {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <>{children}</>
}
