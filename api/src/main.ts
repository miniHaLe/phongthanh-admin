import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { corsOrigins } from './config/cors-origins'
import type { Env } from './config/env'

function rateLimitBody(message: string) {
  return { message, statusCode: 429 }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService<Env, true>)
  app.set('trust proxy', config.get('TRUST_PROXY_HOPS'))

  // Express 5 (bundled with Nest 11) defaults to the `simple` query parser,
  // which does NOT expand `filters[key]=value` into a nested object — that
  // silently bypasses the per-resource filter allowlist (security gate 2) and
  // breaks legitimate filtering. `extended` restores qs bracket parsing so the
  // service sees `filters` as the Record it validates against the allowlist.
  app.set('query parser', 'extended')

  app.use(cookieParser())
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.enableCors({
    origin: corsOrigins(
      config.get('CORS_ORIGIN'),
      config.get('CORS_ADDITIONAL_ORIGINS'),
    ),
    credentials: true,
  })
  app.use(
    '/auth/login',
    rateLimit({
      windowMs: config.get('AUTH_LOGIN_RATE_LIMIT_WINDOW_MS'),
      limit: config.get('AUTH_LOGIN_RATE_LIMIT_MAX'),
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: rateLimitBody('Quá nhiều lần đăng nhập, vui lòng thử lại sau'),
    }),
  )
  app.use(
    ['/auth/refresh', '/auth/logout'],
    rateLimit({
      windowMs: config.get('AUTH_REFRESH_RATE_LIMIT_WINDOW_MS'),
      limit: config.get('AUTH_REFRESH_RATE_LIMIT_MAX'),
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: rateLimitBody('Quá nhiều yêu cầu phiên, vui lòng thử lại sau'),
    }),
  )
  app.use(
    '/api',
    rateLimit({
      windowMs: config.get('API_RATE_LIMIT_WINDOW_MS'),
      limit: config.get('API_RATE_LIMIT_MAX'),
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: rateLimitBody('Quá nhiều yêu cầu, vui lòng thử lại sau'),
    }),
  )

  const port = config.get('PORT')
  await app.listen(port)
  console.log(`API listening on port ${port}`)
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
