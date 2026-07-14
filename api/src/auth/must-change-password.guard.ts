import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common'
import type { Request } from 'express'
import type { AuthenticatedUser } from './jwt-payload'

type AuthenticatedRequest = Request & { user?: AuthenticatedUser }

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.user?.mustChangePassword) return true
    if (request.path === '/auth' || request.path.startsWith('/auth/'))
      return true

    throw new ForbiddenException('Bạn phải đổi mật khẩu trước khi tiếp tục')
  }
}
