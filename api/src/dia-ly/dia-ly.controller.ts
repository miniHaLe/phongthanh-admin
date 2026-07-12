import { Controller, Get, Inject } from '@nestjs/common'
import { asc } from 'drizzle-orm'
import type { DbClient } from '../db/client'
import { DB_CLIENT } from '../db/db.module'
import { phuongXa, tinhThanh } from '../db/schema'

function provinceDisplayName(type: string, name: string): string {
  return `${type === 'city' ? 'Thành phố' : 'Tỉnh'} ${name}`
}

function communeDisplayName(type: string, name: string): string {
  const prefix =
    type === 'ward' ? 'Phường' : type === 'special_zone' ? 'Đặc khu' : 'Xã'
  return `${prefix} ${name}`
}

@Controller('api/v1/dia-ly')
export class DiaLyController {
  constructor(@Inject(DB_CLIENT) private readonly db: DbClient) {}

  @Get()
  async getSnapshot() {
    const [provinceRows, communeRows] = await Promise.all([
      this.db.select().from(tinhThanh).orderBy(asc(tinhThanh.code)),
      this.db.select().from(phuongXa).orderBy(asc(phuongXa.code)),
    ])
    const provinceNames = new Map(
      provinceRows.map((row) => [
        row.code,
        provinceDisplayName(row.type, row.name),
      ]),
    )
    const metadata = provinceRows[0]
    return {
      version: metadata?.snapshotVersion ?? null,
      effectiveFrom: metadata?.effectiveFrom ?? null,
      sourceDocument: metadata?.sourceDocument ?? null,
      provinces: provinceRows.map((row) => ({
        code: row.code,
        name: provinceDisplayName(row.type, row.name),
        type: row.type,
      })),
      communes: communeRows.map((row) => ({
        code: row.code,
        name: communeDisplayName(row.type, row.name),
        type: row.type,
        normalizedName: row.normalizedName,
        provinceCode: row.provinceCode,
        provinceName: provinceNames.get(row.provinceCode),
      })),
    }
  }
}
