import { BadRequestException } from '@nestjs/common'
import { eq, inArray } from 'drizzle-orm'
import type { AuthenticatedUser } from '../auth/jwt-payload'
import { CrudService, type PagedResult } from '../crud/crud.service'
import type { ListParamsQuery } from '../crud/list-params.dto'
import type { DbClient } from '../db/client'
import { nhaSanXuat, sanPham } from '../db/schema'
import { modelResourceConfig } from './model.resource-config'

function normalizeModelName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export class ModelService {
  private readonly crud: CrudService

  constructor(private readonly db: DbClient) {
    this.crud = new CrudService(db, modelResourceConfig)
  }

  private async assertParents(dto: Record<string, unknown>) {
    const manufacturerId = dto.nhaSanXuatId
    const productId = dto.sanPhamId
    if (typeof manufacturerId === 'string') {
      const [row] = await this.db
        .select({ id: nhaSanXuat.id })
        .from(nhaSanXuat)
        .where(eq(nhaSanXuat.id, manufacturerId))
        .limit(1)
      if (!row) throw new BadRequestException('Nhà sản xuất không hợp lệ')
    }
    if (typeof productId === 'string') {
      const [row] = await this.db
        .select({ id: sanPham.id })
        .from(sanPham)
        .where(eq(sanPham.id, productId))
        .limit(1)
      if (!row) throw new BadRequestException('Sản phẩm không hợp lệ')
    }
  }

  private async enrichMany(rows: Record<string, unknown>[]) {
    const manufacturerIds = [
      ...new Set(rows.map((row) => row.nhaSanXuatId as string)),
    ]
    const productIds = [...new Set(rows.map((row) => row.sanPhamId as string))]
    const [manufacturers, products] = await Promise.all([
      manufacturerIds.length > 0
        ? this.db
            .select({ id: nhaSanXuat.id, name: nhaSanXuat.tenNSX })
            .from(nhaSanXuat)
            .where(inArray(nhaSanXuat.id, manufacturerIds))
        : [],
      productIds.length > 0
        ? this.db
            .select({ id: sanPham.id, name: sanPham.tenSP })
            .from(sanPham)
            .where(inArray(sanPham.id, productIds))
        : [],
    ])
    const manufacturerNames = new Map(
      manufacturers.map((item) => [item.id, item.name]),
    )
    const productNames = new Map(products.map((item) => [item.id, item.name]))
    return rows.map((row) => ({
      ...row,
      nhaSanXuatTen: manufacturerNames.get(row.nhaSanXuatId as string),
      sanPhamTen: productNames.get(row.sanPhamId as string),
    }))
  }

  async list(
    params: ListParamsQuery,
    user: AuthenticatedUser,
  ): Promise<PagedResult<Record<string, unknown>>> {
    const result = await this.crud.list(params, user)
    return { ...result, data: await this.enrichMany(result.data) }
  }

  async get(id: string, user: AuthenticatedUser) {
    const [row] = await this.enrichMany([await this.crud.get(id, user)])
    return row
  }

  async create(dto: Record<string, unknown>, user: AuthenticatedUser) {
    await this.assertParents(dto)
    const prepared = {
      ...dto,
      tenModelNormalized: normalizeModelName(dto.tenModel as string),
    }
    const [row] = await this.enrichMany([
      await this.crud.create(prepared, user),
    ])
    return row
  }

  async update(
    id: string,
    dto: Record<string, unknown>,
    user: AuthenticatedUser,
  ) {
    const existing = await this.crud.get(id, user)
    const merged = { ...existing, ...dto }
    await this.assertParents(merged)
    const prepared = {
      ...dto,
      ...(typeof dto.tenModel === 'string'
        ? { tenModelNormalized: normalizeModelName(dto.tenModel) }
        : {}),
    }
    const [row] = await this.enrichMany([
      await this.crud.update(id, prepared, user),
    ])
    return row
  }

  remove(id: string, user: AuthenticatedUser) {
    return this.crud.remove(id, user)
  }
}
