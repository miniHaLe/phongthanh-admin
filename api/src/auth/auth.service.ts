import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcryptjs'
import { and, eq, isNull } from 'drizzle-orm'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { nguoiDung, refreshToken } from '../db/schema'
import type { Env } from '../config/env'
import type { AccessTokenPayload } from './jwt-payload'
import {
  generateFamilyId,
  generateRefreshToken,
  generateTokenId,
  hashRefreshToken,
} from './refresh-token.util'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const BCRYPT_ROUNDS = 12
// A rotated token replayed within this window is treated as a benign
// concurrent-refresh race (reject softly); beyond it, as token theft (revoke
// the family). Short enough to bound a stolen-token replay to seconds.
// Overridable via env so tests can set 0 for deterministic theft-detection.
const REFRESH_REUSE_GRACE_MS = Number(
  process.env.REFRESH_REUSE_GRACE_MS ?? 10_000,
)

export interface LoginResult {
  accessToken: string
  mustChangePassword: boolean
  refreshToken: string
}

export interface RefreshResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_CLIENT) private readonly db: DbClient,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private buildPayload(user: {
    id: string
    tenDangNhap: string
    nhomQuyenId: string
    chiNhanhId: string
    chiNhanhPhuIds: string[]
    superScope: boolean
    mustChangePassword: boolean
  }): AccessTokenPayload {
    return {
      sub: user.id,
      tenDangNhap: user.tenDangNhap,
      roleIds: [user.nhomQuyenId],
      branchIds: [user.chiNhanhId, ...user.chiNhanhPhuIds],
      superScope: user.superScope,
      mustChangePassword: user.mustChangePassword,
    }
  }

  private signAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_TTL,
    })
  }

  /** Issues a brand-new refresh-token family (login). */
  private async issueRefreshFamily(userId: string): Promise<string> {
    const familyId = generateFamilyId()
    const raw = generateRefreshToken()
    await this.db.insert(refreshToken).values({
      id: generateTokenId(),
      familyId,
      userId,
      tokenHash: hashRefreshToken(raw),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      createdAt: new Date(),
    })
    return raw
  }

  async login(tenDangNhap: string, password: string): Promise<LoginResult> {
    const [user] = await this.db
      .select()
      .from(nguoiDung)
      .where(eq(nguoiDung.tenDangNhap, tenDangNhap))
      .limit(1)

    // Same error for "no such user" and "wrong password" — don't leak which.
    const invalidCredentials = () =>
      new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu')

    if (!user || !user.active) throw invalidCredentials()
    if (user.locked) {
      throw new UnauthorizedException('Tài khoản đã bị khóa')
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) throw invalidCredentials()

    const payload = this.buildPayload(user)
    const accessToken = this.signAccessToken(payload)
    const raw = await this.issueRefreshFamily(user.id)

    await this.db
      .update(nguoiDung)
      .set({ lastLogin: new Date() })
      .where(eq(nguoiDung.id, user.id))

    return {
      accessToken,
      mustChangePassword: user.mustChangePassword,
      refreshToken: raw,
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const [user] = await this.db
      .select()
      .from(nguoiDung)
      .where(eq(nguoiDung.id, userId))
      .limit(1)

    if (!user || !user.active || user.locked) {
      throw new UnauthorizedException('Tài khoản không khả dụng')
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!passwordMatches) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng')
    }

    await this.db
      .update(nguoiDung)
      .set({
        passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(nguoiDung.id, user.id))
  }

  /** Rotation with reuse-detection: presenting an already-used (or revoked)
   * token revokes the entire family (security gate 5). */
  async refresh(rawToken: string): Promise<RefreshResult> {
    const tokenHash = hashRefreshToken(rawToken)
    const [row] = await this.db
      .select()
      .from(refreshToken)
      .where(eq(refreshToken.tokenHash, tokenHash))
      .limit(1)

    if (!row) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ')
    }

    if (row.revokedAt || row.expiresAt < new Date()) {
      // A revoked or expired token — reject. If it was revoked as part of a
      // family takedown this is just a stale client; nothing new to revoke.
      throw new UnauthorizedException(
        'Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại',
      )
    }

    if (row.usedAt) {
      // The token was already rotated. Distinguish two cases:
      //  - BENIGN concurrency: a burst of near-simultaneous refreshes (two tabs,
      //    a retry, a reload) where losers read the row just after the winner
      //    committed `usedAt`. These land within a short grace window — reject
      //    softly, do NOT revoke (revoking would kill the legit winner too).
      //  - TRUE reuse: a token replayed long after its rotation — the hallmark
      //    of a stolen token. Revoke the whole family.
      const usedAgoMs = Date.now() - row.usedAt.getTime()
      if (usedAgoMs > REFRESH_REUSE_GRACE_MS) {
        await this.db
          .update(refreshToken)
          .set({ revokedAt: new Date() })
          .where(eq(refreshToken.familyId, row.familyId))
        throw new UnauthorizedException(
          'Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại',
        )
      }
      // In-grace: nothing was revoked — the winner's chain is still live. Don't
      // claim "revoked"; this is a benign concurrent-refresh loser.
      throw new UnauthorizedException(
        'Yêu cầu làm mới phiên đồng thời, vui lòng thử lại',
      )
    }

    const [user] = await this.db
      .select()
      .from(nguoiDung)
      .where(eq(nguoiDung.id, row.userId))
      .limit(1)
    if (!user || !user.active || user.locked) {
      throw new UnauthorizedException('Tài khoản không khả dụng')
    }

    // Atomic compare-and-swap: claim this token by flipping usedAt only if it's
    // still NULL. Concurrent refreshes of the SAME valid token race here; the
    // loser gets 0 rows — a BENIGN race (e.g. two tabs, a reload mid-refresh),
    // NOT token theft, so it must NOT revoke the family. Reject just this call.
    const claimed = await this.db
      .update(refreshToken)
      .set({ usedAt: new Date() })
      .where(and(eq(refreshToken.id, row.id), isNull(refreshToken.usedAt)))
      .returning({ id: refreshToken.id })
    if (claimed.length === 0) {
      throw new UnauthorizedException(
        'Yêu cầu làm mới phiên đồng thời, vui lòng thử lại',
      )
    }

    const newRaw = generateRefreshToken()
    await this.db.insert(refreshToken).values({
      id: generateTokenId(),
      familyId: row.familyId,
      userId: user.id,
      tokenHash: hashRefreshToken(newRaw),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      createdAt: new Date(),
    })

    const payload = this.buildPayload(user)
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: newRaw,
    }
  }

  /** Revokes the family a raw refresh token belongs to (logout). Silently
   * no-ops on an unknown token — logout must always succeed client-side. */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return
    const tokenHash = hashRefreshToken(rawToken)
    const [row] = await this.db
      .select()
      .from(refreshToken)
      .where(
        and(eq(refreshToken.tokenHash, tokenHash), isNull(refreshToken.revokedAt)),
      )
      .limit(1)
    if (!row) return
    await this.db
      .update(refreshToken)
      .set({ revokedAt: new Date() })
      .where(eq(refreshToken.familyId, row.familyId))
  }
}
