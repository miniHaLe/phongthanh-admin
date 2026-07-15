import { getAccessToken } from './auth-token'

export interface AccessTokenClaims {
  mustChangePassword?: boolean
  branchIds?: unknown
  superScope?: unknown
  [key: string]: unknown
}

export interface AccessTokenBranchScope {
  branchIds: string[]
  superScope: boolean
}

/** Decodes claims for client-side routing only; the server still verifies JWTs. */
export function decodeJwtClaims(
  token: string | null,
): AccessTokenClaims | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), (character) =>
      character.charCodeAt(0),
    )
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return value !== null && typeof value === 'object'
      ? (value as AccessTokenClaims)
      : null
  } catch {
    return null
  }
}

export function accessTokenRequiresPasswordChange(): boolean {
  return decodeJwtClaims(getAccessToken())?.mustChangePassword === true
}

/** Returns only validated branch claims; malformed tokens get the safest scope. */
export function accessTokenBranchScope(): AccessTokenBranchScope {
  const claims = decodeJwtClaims(getAccessToken())
  const branchIds = Array.isArray(claims?.branchIds)
    ? claims.branchIds.filter(
        (branchId): branchId is string => typeof branchId === 'string',
      )
    : []

  return {
    branchIds: [...new Set(branchIds)],
    superScope: claims?.superScope === true,
  }
}
