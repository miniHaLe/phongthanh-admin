import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

/** Marks a route exempt from the global `JwtAuthGuard` (login, health). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
