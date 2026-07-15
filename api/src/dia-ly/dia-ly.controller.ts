import { Controller, Get, Inject, Query, Res } from '@nestjs/common'
import { asc } from 'drizzle-orm'
import type { Response } from 'express'
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

const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const REVALIDATED_CACHE_CONTROL =
  'public, max-age=300, stale-while-revalidate=86400'

@Controller('api/v1/dia-ly')
export class DiaLyController {
  constructor(@Inject(DB_CLIENT) private readonly db: DbClient) {}

  @Get()
  async getSnapshot(
    @Res({ passthrough: true }) response: Response,
    @Query('v') requestedVersion?: string,
  ) {
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
    const snapshotVersion = metadata?.snapshotVersion ?? null
    const isPinnedVersion = Boolean(
      snapshotVersion && requestedVersion === snapshotVersion,
    )
    response.setHeader(
      'Cache-Control',
      isPinnedVersion ? IMMUTABLE_CACHE_CONTROL : REVALIDATED_CACHE_CONTROL,
    )
    if (snapshotVersion) {
      response.setHeader('X-Snapshot-Version', snapshotVersion)
      response.setHeader(
        'Content-Location',
        `/api/v1/dia-ly?v=${encodeURIComponent(snapshotVersion)}`,
      )
    }

    return {
      version: snapshotVersion,
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
