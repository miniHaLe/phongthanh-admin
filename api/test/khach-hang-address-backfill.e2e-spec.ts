import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'

const MIGRATION_SQL = readFileSync(
  join(
    process.cwd(),
    'src/db/migrations/0002_backfill-khach-hang-address-codes.sql',
  ),
  'utf8',
)

interface AddressCodesRow {
  id: string
  tinh_thanh_code: string | null
  phuong_xa_code: string | null
}

describe('guarded seeded-customer address backfill', () => {
  it('updates only untouched authoritative rows and remains safe on rerun', async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    await client.query('BEGIN')

    try {
      const freshSeed = await client.query<AddressCodesRow>(
        `SELECT id, tinh_thanh_code, phuong_xa_code
         FROM khach_hang
         WHERE id IN ('kh-48', 'kh-43')
         ORDER BY id`,
      )
      expect(freshSeed.rows).toEqual([
        {
          id: 'kh-43',
          tinh_thanh_code: null,
          phuong_xa_code: null,
        },
        {
          id: 'kh-48',
          tinh_thanh_code: '66',
          phuong_xa_code: '24259',
        },
      ])

      // Simulate the live database immediately after migration 0001: legacy
      // seed rows exist, but official address codes have not been populated.
      await client.query(
        `UPDATE khach_hang
         SET tinh_thanh_code = NULL, phuong_xa_code = NULL
         WHERE id IN ('kh-48', 'kh-47')`,
      )
      await client.query(
        `UPDATE khach_hang
         SET updated_at = '2099-01-01T00:00:00.000Z'
         WHERE id = 'kh-47'`,
      )

      await client.query(MIGRATION_SQL)

      const firstRun = await client.query<AddressCodesRow>(
        `SELECT id, tinh_thanh_code, phuong_xa_code
         FROM khach_hang
         WHERE id IN ('kh-48', 'kh-47', 'kh-43')
         ORDER BY id`,
      )
      const rows = new Map(firstRun.rows.map((row) => [row.id, row]))

      expect(rows.get('kh-48')).toEqual({
        id: 'kh-48',
        tinh_thanh_code: '66',
        phuong_xa_code: '24259',
      })
      expect(rows.get('kh-47')).toEqual({
        id: 'kh-47',
        tinh_thanh_code: null,
        phuong_xa_code: null,
      })
      expect(rows.get('kh-43')).toEqual({
        id: 'kh-43',
        tinh_thanh_code: null,
        phuong_xa_code: null,
      })

      await client.query(MIGRATION_SQL)
      const rerun = await client.query<AddressCodesRow>(
        `SELECT id, tinh_thanh_code, phuong_xa_code
         FROM khach_hang
         WHERE id = 'kh-48'`,
      )
      expect(rerun.rows[0]).toEqual(rows.get('kh-48'))
    } finally {
      await client.query('ROLLBACK')
      await client.end()
    }
  })
})
