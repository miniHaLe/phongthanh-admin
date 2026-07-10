/**
 * Jest globalSetup: provision a throwaway `phongthanh_test` DB on the compose
 * Postgres, run migrations (incl. the vi-VN-x-icu collation + unaccent), and
 * seed the frozen fixtures. Runs ONCE before the suite. Drops + recreates the
 * DB each run so specs start from a known state.
 */
import { Client, Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import * as schema from '../src/db/schema'
import { seedDatabase } from '../src/seed/seed-database'

const ADMIN_URL =
  process.env.TEST_ADMIN_DATABASE_URL ??
  'postgres://phongthanh:phongthanh_dev@localhost:5434/postgres'
const TEST_DB = 'phongthanh_test'
const TEST_URL =
  process.env.TEST_DATABASE_URL ??
  `postgres://phongthanh:phongthanh_dev@localhost:5434/${TEST_DB}`
const INITIAL_ADMIN_PASSWORD = 'Test!Admin2026'

export default async function globalSetup() {
  // Drop + recreate the test DB via the maintenance `postgres` DB.
  const admin = new Client({ connectionString: ADMIN_URL })
  await admin.connect()
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB],
  )
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`)
  await admin.query(`CREATE DATABASE ${TEST_DB}`)
  await admin.end()

  // Migrate + seed the fresh test DB.
  const pool = new Pool({ connectionString: TEST_URL })
  const db = drizzle(pool, { schema })
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  await seedDatabase(db, INITIAL_ADMIN_PASSWORD)
  await pool.end()
}
