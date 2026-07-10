import { randomBytes, createHash } from 'node:crypto'

/** Raw refresh token = opaque random string sent to the client in the
 * httpOnly cookie. Only its SHA-256 hash is ever persisted (never store the
 * raw token server-side). */
export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function generateFamilyId(): string {
  return randomBytes(16).toString('hex')
}

export function generateTokenId(): string {
  return randomBytes(16).toString('hex')
}
