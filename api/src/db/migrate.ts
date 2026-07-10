/** Standalone migration runner: `npm run db:migrate`. Not a Nest module —
 * runs before the app boots (CI, deploy, or local dev setup). */
import 'dotenv/config'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { createDbClient } from './client'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required (see .env.example)')
  }
  const { db, pool } = createDbClient(databaseUrl)
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  await pool.end()
  console.log('Migrations applied.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
