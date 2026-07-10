import { Injectable, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from './public.decorator'

/** Applied globally in `main.ts`/`app.module.ts`. Routes marked `@Public()`
 * (login, refresh, logout, health) bypass JWT verification. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    )
    if (isPublic) return true
    return super.canActivate(context)
  }
}
