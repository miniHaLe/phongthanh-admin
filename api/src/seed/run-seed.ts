/** CLI seeder: `npm run seed`. Thin wrapper over the reusable `seedDatabase`
 * routine (shared with the e2e test global-setup). */
import 'dotenv/config'
import { createDbClient } from '../db/client'
import { seedDatabase } from './seed-database'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required (see .env.example)')
  }
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD
  if (!initialAdminPassword) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD is required to seed the super-admin (see .env.example)',
    )
  }

  const { db, pool } = createDbClient(databaseUrl)
  try {
    const r = await seedDatabase(db, initialAdminPassword)
    console.log(
      `Seed complete: ${r.chiNhanh} chi_nhanh, ${r.tinh} tinh, ${r.quan} quan, ` +
        `${r.xa} xa, ${r.loaiKhachHang} loai_khach_hang, ${r.nhomQuyen} nhom_quyen, ` +
        `${r.nguoiDung} nguoi_dung, ${r.khachHang} khach_hang.`,
    )
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
