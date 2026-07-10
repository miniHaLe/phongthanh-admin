import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nguoiDung } from './nguoi-dung'

/** Refresh-token families for rotation + reuse-detection (security gate 5).
 * `familyId` groups all tokens descended from one login; `tokenHash` is the
 * SHA-256 of the raw refresh token (never store the raw token). On rotation
 * the current row is marked `usedAt`; presenting an already-used token
 * revokes the whole family (`revokedAt` set on every row in the family). */
export const refreshToken = pgTable('refresh_token', {
  id: text('id').primaryKey(),
  familyId: text('family_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => nguoiDung.id),
  tokenHash: text('token_hash').notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})
