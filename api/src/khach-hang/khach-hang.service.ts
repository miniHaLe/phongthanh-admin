import { BadRequestException } from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'
import type { AuthenticatedUser } from '../auth/jwt-payload'
import { CrudService } from '../crud/crud.service'
import type { ListParamsQuery } from '../crud/list-params.dto'
import type { DbClient } from '../db/client'
import { nganHang, phuongXa, tinh, tinhThanh } from '../db/schema'
import { khachHangResourceConfig } from './khach-hang.resource-config'

function provinceDisplayName(type: string, name: string): string {
  return `${type === 'city' ? 'Thành phố' : 'Tỉnh'} ${name}`
}

function communeDisplayName(type: string, name: string): string {
  const prefix =
    type === 'ward' ? 'Phường' : type === 'special_zone' ? 'Đặc khu' : 'Xã'
  return `${prefix} ${name}`
}

export class KhachHangService {
  private readonly crud: CrudService

  constructor(private readonly db: DbClient) {
    this.crud = new CrudService(db, khachHangResourceConfig)
  }

  private async enrichBanks(rows: Record<string, unknown>[]) {
    const bankIds = [
      ...new Set(
        rows
          .map((row) => row.nganHangId)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          ),
      ),
    ]
    if (bankIds.length === 0) return rows
    const banks = await this.db
      .select({ id: nganHang.id, name: nganHang.tenNganHang })
      .from(nganHang)
      .where(inArray(nganHang.id, bankIds))
    const names = new Map(banks.map((bank) => [bank.id, bank.name]))
    return rows.map((row) => ({
      ...row,
      nganHangTen:
        typeof row.nganHangId === 'string'
          ? (names.get(row.nganHangId) ?? null)
          : null,
    }))
  }

  private async prepareAddress(dto: Record<string, unknown>) {
    const provinceCode = dto.tinhThanhCode as string | undefined
    const communeCode = dto.phuongXaCode as string | undefined
    if (Boolean(provinceCode) !== Boolean(communeCode)) {
      throw new BadRequestException(
        'Tỉnh/Thành phố và Phường/Xã phải được chọn cùng nhau',
      )
    }
    if (!provinceCode || !communeCode) {
      if (!Object.prototype.hasOwnProperty.call(dto, 'tenDuong')) return dto
      const street = typeof dto.tenDuong === 'string' ? dto.tenDuong.trim() : ''
      return { ...dto, tenDuong: street || null, diaChi: street || null }
    }

    const [province] = await this.db
      .select()
      .from(tinhThanh)
      .where(eq(tinhThanh.code, provinceCode))
      .limit(1)
    const [commune] = await this.db
      .select()
      .from(phuongXa)
      .where(
        and(
          eq(phuongXa.code, communeCode),
          eq(phuongXa.provinceCode, provinceCode),
        ),
      )
      .limit(1)
    if (!province || !commune) {
      throw new BadRequestException(
        'Phường/Xã không thuộc Tỉnh/Thành phố đã chọn',
      )
    }

    const street = typeof dto.tenDuong === 'string' ? dto.tenDuong.trim() : ''
    return {
      ...dto,
      tenDuong: street || null,
      diaChi: [
        street,
        communeDisplayName(commune.type, commune.name),
        provinceDisplayName(province.type, province.name),
      ]
        .filter(Boolean)
        .join(', '),
    }
  }

  private async validateReferences(dto: Record<string, unknown>) {
    if (typeof dto.nganHangId === 'string' && dto.nganHangId) {
      const [bank] = await this.db
        .select({ id: nganHang.id })
        .from(nganHang)
        .where(eq(nganHang.id, dto.nganHangId))
        .limit(1)
      if (!bank) throw new BadRequestException('Ngân hàng không hợp lệ')
    }
    if (typeof dto.tinhId === 'string' && dto.tinhId) {
      const [legacyProvince] = await this.db
        .select({ id: tinh.id })
        .from(tinh)
        .where(eq(tinh.id, dto.tinhId))
        .limit(1)
      if (!legacyProvince) throw new BadRequestException('Tỉnh không hợp lệ')
    }
  }

  async list(params: ListParamsQuery, user: AuthenticatedUser) {
    const result = await this.crud.list(params, user)
    return { ...result, data: await this.enrichBanks(result.data) }
  }

  async get(id: string, user: AuthenticatedUser) {
    const [row] = await this.enrichBanks([await this.crud.get(id, user)])
    return row
  }

  async create(dto: Record<string, unknown>, user: AuthenticatedUser) {
    await this.validateReferences(dto)
    const [row] = await this.enrichBanks([
      await this.crud.create(await this.prepareAddress(dto), user),
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
    await this.validateReferences(merged)

    const touchesModernAddress = [
      'tenDuong',
      'tinhThanhCode',
      'phuongXaCode',
    ].some((key) => Object.prototype.hasOwnProperty.call(dto, key))
    const prepared = touchesModernAddress
      ? await this.prepareAddress(merged)
      : dto

    const patch = touchesModernAddress
      ? {
          ...dto,
          tenDuong: prepared.tenDuong,
          tinhThanhCode: prepared.tinhThanhCode,
          phuongXaCode: prepared.phuongXaCode,
          diaChi: prepared.diaChi,
        }
      : dto
    const [row] = await this.enrichBanks([
      await this.crud.update(id, patch, user),
    ])
    return row
  }

  remove(id: string, user: AuthenticatedUser) {
    return this.crud.remove(id, user)
  }
}
