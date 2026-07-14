import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { hasAccessToken, refreshAccessToken } from '@/api/auth-client'
import { coalescedRefresh } from '@/api/auth-token'
import {
  accessTokenBranchScope,
  accessTokenRequiresPasswordChange,
} from '@/api/jwt-claims'
import { ROUTES } from '@/constants/routes'
import { reconcileActiveBranch, useAppStore } from '@/store/app-store'

type AuthState = 'checking' | 'authenticated' | 'anonymous'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasAccessToken() ? 'authenticated' : 'checking',
  )
  const activeBranch = useAppStore((state) => state.activeBranch)
  const setActiveBranch = useAppStore((state) => state.setActiveBranch)
  const reconciledBranch = reconcileActiveBranch(
    activeBranch,
    accessTokenBranchScope(),
  )

  useEffect(() => {
    if (authState !== 'checking') return
    let active = true
    coalescedRefresh(refreshAccessToken).then((token) => {
      if (!active) return
      setAuthState(token ? 'authenticated' : 'anonymous')
    })
    return () => {
      active = false
    }
  }, [authState])

  useEffect(() => {
    if (authState === 'authenticated' && activeBranch !== reconciledBranch) {
      setActiveBranch(reconciledBranch)
    }
  }, [activeBranch, authState, reconciledBranch, setActiveBranch])

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

  if (
    accessTokenRequiresPasswordChange() &&
    location.pathname !== ROUTES.changePassword
  ) {
    return <Navigate to={ROUTES.changePassword} replace />
  }

  if (activeBranch !== reconciledBranch) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
