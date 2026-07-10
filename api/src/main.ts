import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import type { Env } from './config/env'

function corsOrigin(raw: string): string | string[] {
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  return origins.length <= 1 ? (origins[0] ?? raw) : origins
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService<Env, true>)

  // Express 5 (bundled with Nest 11) defaults to the `simple` query parser,
  // which does NOT expand `filters[key]=value` into a nested object — that
  // silently bypasses the per-resource filter allowlist (security gate 2) and
  // breaks legitimate filtering. `extended` restores qs bracket parsing so the
  // service sees `filters` as the Record it validates against the allowlist.
  app.set('query parser', 'extended')

  app.use(cookieParser())
  app.enableCors({
    origin: corsOrigin(config.get('CORS_ORIGIN')),
    credentials: true,
  })

  const port = config.get('PORT')
  await app.listen(port)
  console.log(`API listening on port ${port}`)
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
