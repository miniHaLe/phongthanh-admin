import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { Env } from '../config/env'
import type { AccessTokenPayload } from './jwt-payload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  /** Passport calls this after signature+expiry verification; the return
   * value becomes `req.user`. No DB round-trip — the token IS the source of
   * truth for branch scope (matches the plan's BranchScopeInterceptor design). */
  validate(payload: AccessTokenPayload): AccessTokenPayload {
    return payload
  }
}
