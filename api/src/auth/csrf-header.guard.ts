import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common'
import type { Request } from 'express'
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from './refresh-cookie.util'

/** CSRF defense-in-depth for the cookie-based refresh/logout routes (security
 * gate 5) — see `refresh-cookie.util.ts` for the documented rationale.
 * Rejects any request missing the custom header a cross-site form/img/script
 * tag cannot attach. */
@Injectable()
export class CsrfHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const header = request.headers[CSRF_HEADER_NAME]
    if (header !== CSRF_HEADER_VALUE) {
      throw new ForbiddenException('Thiếu tiêu đề bảo mật CSRF')
    }
    return true
  }
}
