import { afterEach, describe, expect, it } from 'vitest'
import { setAccessToken } from './auth-token'
import {
  accessTokenBranchScope,
  accessTokenRequiresPasswordChange,
  decodeJwtClaims,
} from './jwt-claims'

function tokenFor(payload: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const encoded = btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${encoded}.signature`
}

afterEach(() => {
  setAccessToken(null)
})

describe('JWT claim decoding', () => {
  it('reads mustChangePassword from the in-memory access token', () => {
    setAccessToken(
      tokenFor({ tenDangNhap: 'quản trị', mustChangePassword: true }),
    )

    expect(accessTokenRequiresPasswordChange()).toBe(true)
    expect(decodeJwtClaims(tokenFor({ mustChangePassword: false }))).toEqual({
      mustChangePassword: false,
    })
  })

  it('fails closed for malformed payloads and non-boolean flags', () => {
    for (const token of [null, '', 'one.part', 'a.@@@.c', 'a.bnVsbA.c']) {
      expect(decodeJwtClaims(token)).toBeNull()
    }

    setAccessToken(tokenFor({ mustChangePassword: 'true' }))
    expect(accessTokenRequiresPasswordChange()).toBe(false)
  })

  it('derives a validated branch scope from the current access token', () => {
    setAccessToken(
      tokenFor({
        branchIds: ['cn-1', 'cn-3', 'cn-1', 42],
        superScope: true,
      }),
    )

    expect(accessTokenBranchScope()).toEqual({
      branchIds: ['cn-1', 'cn-3'],
      superScope: true,
    })
  })

  it('uses an empty non-super scope when branch claims are malformed', () => {
    setAccessToken(tokenFor({ branchIds: 'cn-1', superScope: 'true' }))

    expect(accessTokenBranchScope()).toEqual({
      branchIds: [],
      superScope: false,
    })
  })
})
