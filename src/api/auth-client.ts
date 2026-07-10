import { getAccessToken, setAccessToken } from './auth-token'
import { apiUrl } from './api-url'
import {
  NETWORK_ERROR,
  TIMEOUT_ERROR,
  viErrorMessage,
} from './vi-error-map'

const REQUEST_TIMEOUT_MS = 15_000

interface LoginResponse {
  accessToken: string
  mustChangePassword: boolean
}

interface RequestOptions {
  method: string
  body?: unknown
  csrf?: boolean
  auth?: boolean
}

async function parseServerMessage(res: Response): Promise<string | undefined> {
  try {
    const data = (await res.json()) as { message?: string | string[] }
    return Array.isArray(data.message) ? data.message[0] : data.message
  } catch {
    return undefined
  }
}

async function authRequest<T>(
  path: string,
  { method, body, csrf, auth }: RequestOptions,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const headers: Record<string, string> = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (csrf) headers['X-Requested-With'] = 'XMLHttpRequest'
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${apiUrl()}${path}`, {
      method,
      headers,
      credentials: 'include',
      signal: controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    clearTimeout(timer)
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    throw new Error(viErrorMessage(aborted ? TIMEOUT_ERROR : NETWORK_ERROR))
  }
  clearTimeout(timer)

  if (!res.ok) {
    throw new Error(viErrorMessage(res.status, await parseServerMessage(res)))
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null
}

export async function login(
  tenDangNhap: string,
  password: string,
): Promise<LoginResponse> {
  const result = await authRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { tenDangNhap, password },
  })
  setAccessToken(result.accessToken)
  return result
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const result = await authRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      csrf: true,
    })
    setAccessToken(result.accessToken)
    return result.accessToken
  } catch {
    setAccessToken(null)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await authRequest<void>('/auth/logout', { method: 'POST', csrf: true })
  } finally {
    setAccessToken(null)
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await authRequest<void>('/auth/change-password', {
    method: 'POST',
    auth: true,
    body: { oldPassword, newPassword },
  })
}
