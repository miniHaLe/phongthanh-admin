/**
 * In-memory access-token holder. The access token lives ONLY in memory (never
 * localStorage) per the plan's auth model; the refresh token is an httpOnly
 * cookie the browser sends automatically to `/auth/refresh`. A single in-flight
 * refresh promise is shared so concurrent 401s trigger exactly one refresh.
 */
let accessToken: string | null = null
let refreshInFlight: Promise<string | null> | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/**
 * Coordinates a single refresh across concurrent callers. `doRefresh` performs
 * the actual `POST /auth/refresh` and returns the new access token (or null on
 * failure). Subsequent callers await the same promise.
 */
export function coalescedRefresh(
  doRefresh: () => Promise<string | null>,
): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}
