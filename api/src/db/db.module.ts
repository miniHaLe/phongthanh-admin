import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { Env } from '../config/env'
import * as schema from './schema'
import type { DbClient } from './client'

export const DB_CLIENT = Symbol('DB_CLIENT')
export const DB_POOL = Symbol('DB_POOL')

/** Global module exposing the Drizzle client + underlying pg Pool as Nest
 * providers (one pool per process), so tests can override `DATABASE_URL`
 * per-suite (test DB) without touching app code. */
@Global()
@Module({
  providers: [
    {
      provide: DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool({ connectionString: config.get('DATABASE_URL') }),
    },
    {
      provide: DB_CLIENT,
      inject: [DB_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
  ],
  exports: [DB_CLIENT, DB_POOL],
})
export class DbModule implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    await this.pool.end()
  }
}

export type { DbClient }
