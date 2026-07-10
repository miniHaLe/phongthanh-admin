import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

/**
 * One pool per process. Tests construct their own via `createDbClient` with a
 * distinct `DATABASE_URL` (test DB) so this module-level singleton is safe for
 * app runtime.
 */
export function createDbClient(connectionString: string) {
  const pool = new Pool({ connectionString })
  const db = drizzle(pool, { schema })
  return { db, pool }
}

export type DbClient = ReturnType<typeof createDbClient>['db']
