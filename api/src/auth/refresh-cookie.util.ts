import type { Response } from 'express'

export const REFRESH_COOKIE_NAME = 'refreshToken'
export const REFRESH_COOKIE_PATH = '/auth/refresh'
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export type RefreshCookieSameSite = 'strict' | 'lax' | 'none'

/** CSRF strategy (security gate 5): refresh/logout require a custom header
 * (`X-Requested-With`). A cross-origin form/img/script tag cannot set that
 * header, and CORS controls which browser origins may send it. Local/dev keeps
 * `SameSite=Strict`; split frontend/backend deployments may set `SameSite=None`
 * so the refresh cookie can cross the site boundary. */
export const CSRF_HEADER_NAME = 'x-requested-with'
export const CSRF_HEADER_VALUE = 'XMLHttpRequest'

export function setRefreshCookie(
  res: Response,
  rawToken: string,
  sameSite: RefreshCookieSameSite = 'strict',
): void {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  })
}

export function clearRefreshCookie(
  res: Response,
  sameSite: RefreshCookieSameSite = 'strict',
): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite,
    path: REFRESH_COOKIE_PATH,
  })
}
