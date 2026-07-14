import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'
import type { AuthenticatedUser } from '../auth/jwt-payload'
import { CrudService } from '../crud/crud.service'
import type { ListParamsQuery } from '../crud/list-params.dto'
import type { DbClient } from '../db/client'
import {
  chiNhanh,
  khachHang,
  nganHang,
  phuongXa,
  tinh,
  tinhThanh,
} from '../db/schema'
import { khachHangResourceConfig } from './khach-hang.resource-config'

function provinceDisplayName(type: string, name: string): string {
  return `${type === 'city' ? 'Thành phố' : 'Tỉnh'} ${name}`
}

function communeDisplayName(type: string, name: string): string {
  const prefix =
    type === 'ward' ? 'Phường' : type === 'special_zone' ? 'Đặc khu' : 'Xã'
  return `${prefix} ${name}`
}

function hasOwn(row: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(row, key)
}

function uniqueStringValues(
  rows: Record<string, unknown>[],
  key: string,
): string[] {
  return [
    ...new Set(
      rows
        .map((row) => row[key])
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 0,
        ),
    ),
  ]
}

export class KhachHangService {
  private readonly crud: CrudService

  constructor(private readonly db: DbClient) {
    this.crud = new CrudService(db, khachHangResourceConfig)
  }

  private async enrichReferences(rows: Record<string, unknown>[]) {
    const bankIds = uniqueStringValues(rows, 'nganHangId')
    const dealerIds = uniqueStringValues(rows, 'daiLyId')
    const [banks, dealers] = await Promise.all([
      bankIds.length > 0
        ? this.db
            .select({ id: nganHang.id, name: nganHang.tenNganHang })
            .from(nganHang)
            .where(inArray(nganHang.id, bankIds))
        : [],
      dealerIds.length > 0
        ? this.db
            .select({ id: khachHang.id, name: khachHang.tenKH })
            .from(khachHang)
            .where(inArray(khachHang.id, dealerIds))
        : [],
    ])
    const bankNames = new Map(banks.map((bank) => [bank.id, bank.name]))
    const dealerNames = new Map(
      dealers.map((dealer) => [dealer.id, dealer.name]),
    )
    return rows.map((row) => ({
      ...row,
      nganHangTen:
        typeof row.nganHangId === 'string'
          ? (bankNames.get(row.nganHangId) ?? null)
          : null,
      daiLyTen:
        typeof row.daiLyId === 'string'
          ? (dealerNames.get(row.daiLyId) ?? null)
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
      if (!hasOwn(dto, 'tenDuong')) return dto
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

  private async validateRequestedBranch(
    branchId: string | undefined,
    user: AuthenticatedUser,
  ): Promise<void> {
    if (!branchId || branchId === 'all') return
    if (!user.superScope && !user.branchIds.includes(branchId)) {
      throw new ForbiddenException(
        'Bạn không có quyền xem dữ liệu ở chi nhánh này',
      )
    }

    const [branch] = await this.db
      .select({ id: chiNhanh.id })
      .from(chiNhanh)
      .where(eq(chiNhanh.id, branchId))
      .limit(1)
    if (!branch) {
      throw new BadRequestException(
        `Chi nhánh yêu cầu không hợp lệ: "${branchId}"`,
      )
    }
  }

  async list(params: ListParamsQuery, user: AuthenticatedUser) {
    await this.validateRequestedBranch(params.branchId, user)
    const result = await this.crud.list(params, user)
    return { ...result, data: await this.enrichReferences(result.data) }
  }

  async get(id: string, user: AuthenticatedUser) {
    const [row] = await this.enrichReferences([await this.crud.get(id, user)])
    return row
  }

  async create(dto: Record<string, unknown>, user: AuthenticatedUser) {
    await this.validateReferences(dto)
    const [row] = await this.enrichReferences([
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
    const { clearDiaChi: clearDiaChiCommand, ...writeDto } = dto
    const clearDiaChi = clearDiaChiCommand === true

    if (
      hasOwn(writeDto, 'diaChi') &&
      writeDto.diaChi === null &&
      typeof existing.diaChi === 'string' &&
      existing.diaChi.trim() &&
      !clearDiaChi
    ) {
      throw new BadRequestException(
        'Dùng thao tác "Xóa địa chỉ" để xóa địa chỉ đang lưu',
      )
    }

    const merged = { ...existing, ...writeDto }
    await this.validateReferences(merged)

    const touchesModernAddress = [
      'tenDuong',
      'tinhThanhCode',
      'phuongXaCode',
    ].some((key) => hasOwn(writeDto, key))
    const patch: Record<string, unknown> = { ...writeDto }

    if (touchesModernAddress) {
      const prepared = await this.prepareAddress(merged)
      patch.tenDuong = prepared.tenDuong
      patch.tinhThanhCode = prepared.tinhThanhCode
      patch.phuongXaCode = prepared.phuongXaCode

      const preparedAddress = prepared.diaChi
      if (
        !clearDiaChi &&
        typeof preparedAddress === 'string' &&
        preparedAddress.trim().length > 0
      ) {
        patch.diaChi = preparedAddress
      }
    }

    if (clearDiaChi) patch.diaChi = null

    const [row] = await this.enrichReferences([
      await this.crud.update(id, patch, user),
    ])
    return row
  }

  remove(id: string, user: AuthenticatedUser) {
    return this.crud.remove(id, user)
  }
}
