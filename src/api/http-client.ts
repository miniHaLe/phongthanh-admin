/**
 * Real HTTP data source implementing `MockApi<T>` — a drop-in for `makeMockApi`.
 * `req()` attaches the Bearer access token, transparently refreshes once on a
 * 401 and retries, enforces a request timeout, and maps any non-2xx / network /
 * timeout failure to `throw new Error(vietnameseMessage)` so `useCrud.onError`
 * renders the toast unchanged.
 */
import type { BaseEntity, ListParams, PagedResult } from '@/mock/seed'
import type { MockApi } from '@/types/crud-types'
import {
  getAccessToken,
  setAccessToken,
  coalescedRefresh,
} from './auth-token'
import { toQuery } from './list-params-query'
import {
  viErrorMessage,
  NETWORK_ERROR,
  TIMEOUT_ERROR,
} from './vi-error-map'

const REQUEST_TIMEOUT_MS = 15_000

/** Read lazily (not captured at module load) so tests can stub VITE_API_URL and
 * so an env injected after bundle init is still honored. */
function apiUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3210'
}

interface ReqOptions {
  method?: string
  body?: unknown
  /** Internal: set once we've already retried after a refresh, to avoid loops. */
  _retried?: boolean
}

/** Performs `POST /auth/refresh` (cookie-based) and stores the new access token.
 * The `X-Requested-With` header is REQUIRED — the server's CSRF guard rejects
 * the cookie route without it (a cross-site tag can't set a custom header). */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${apiUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { accessToken?: string }
    const token = data.accessToken ?? null
    setAccessToken(token)
    return token
  } catch {
    return null
  }
}

async function req<T>(url: string, options: ReqOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      signal: controller.signal,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (err) {
    clearTimeout(timer)
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    throw new Error(viErrorMessage(aborted ? TIMEOUT_ERROR : NETWORK_ERROR))
  }
  clearTimeout(timer)

  // Transparent single refresh-and-retry on an expired access token.
  if (res.status === 401 && !options._retried) {
    const newToken = await coalescedRefresh(refreshAccessToken)
    if (newToken) return req<T>(url, { ...options, _retried: true })
  }

  if (!res.ok) {
    let serverMessage: string | undefined
    try {
      const data = (await res.json()) as { message?: string | string[] }
      serverMessage = Array.isArray(data.message)
        ? data.message[0]
        : data.message
    } catch {
      // non-JSON error body — fall back to the status map
    }
    throw new Error(viErrorMessage(res.status, serverMessage))
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/**
 * Factory: a real HTTP `MockApi<T>` for a REST resource under `/api/v1/<resource>`.
 * Satisfies the exact interface the CRUD pages consume — no page change beyond
 * the `apiFor()` config line.
 */
export function makeHttpApi<T extends BaseEntity>(resource: string): MockApi<T> {
  // Built per-call (not captured once) so `apiUrl()` reflects the env at request
  // time — matters for tests that stub VITE_API_URL after the factory runs.
  const base = () => `${apiUrl()}/api/v1/${resource}`
  return {
    list: (params: ListParams) =>
      req<PagedResult<T>>(`${base()}?${toQuery(params)}`),
    get: (id: string) => req<T>(`${base()}/${id}`),
    create: (data) => req<T>(base(), { method: 'POST', body: data }),
    update: (id: string, data) =>
      req<T>(`${base()}/${id}`, { method: 'PATCH', body: data }),
    remove: (id: string) =>
      req<void>(`${base()}/${id}`, { method: 'DELETE' }),
  }
}
