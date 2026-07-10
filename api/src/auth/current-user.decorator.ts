import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthenticatedUser } from './jwt-payload'

/** Extracts the validated JWT payload Passport attached to `req.user`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return request.user as AuthenticatedUser
  },
)
