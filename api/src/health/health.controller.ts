import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common'
import type { Pool, QueryConfig } from 'pg'
import { Public } from '../auth/public.decorator'
import { DB_POOL } from '../db/db.module'

export const HEALTH_READY_QUERY_TIMEOUT_MS = 3_000

@Controller('health')
export class HealthController {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  @Public()
  @Get()
  check() {
    return { status: 'ok' }
  }

  @Public()
  @Get('ready')
  async ready() {
    try {
      // node-postgres supports per-query timeouts although its public type lags.
      await this.pool.query({
        text: 'SELECT 1',
        query_timeout: HEALTH_READY_QUERY_TIMEOUT_MS,
      } as QueryConfig)
      return { status: 'ready' }
    } catch {
      throw new ServiceUnavailableException({ status: 'not-ready' })
    }
  }
}
