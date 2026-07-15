/**
 * Spec: thanhToanCongNo reduces Còn lại and appends a matching Phiếu Thu
 * voucher to THU_CHI_ROWS. Also locks the Công nợ per-ticket receivable model
 * (no due-date/overdue field) and the ChungTu determinism (no wall clock).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CONG_NO_ROWS, THU_CHI_ROWS, thanhToanCongNo } from './finance-mock'

function localMonth(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
}

function maxOrdinal(prefix: string, month: string): number {
  const pattern = new RegExp(`^${prefix}-${month}-(\\d+)$`)
  return THU_CHI_ROWS.reduce((max, row) => {
    const match = pattern.exec(row.soChungTu)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
}

describe('thanhToanCongNo', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reduces Còn lại by the paid amount and increases Đã trả', async () => {
    const row = CONG_NO_ROWS[0]
    const before = { daTra: row.daTra, conLai: row.conLai }
    const amount = Math.min(1, row.conLai)

    await thanhToanCongNo({ congNoId: row.id, soTien: amount, hinhThucId: 1 })

    expect(row.daTra).toBe(before.daTra + amount)
    expect(row.conLai).toBe(before.conLai - amount)
  })

  it('appends a matching Phiếu Thu voucher to THU_CHI_ROWS with tinhTrang Đã thu', async () => {
    const row = CONG_NO_ROWS[1]
    const amount = Math.min(1, row.conLai)
    const before = THU_CHI_ROWS.length
    const month = localMonth(new Date())
    const expectedOrdinal = maxOrdinal('PTT', month) + 1

    const voucher = await thanhToanCongNo({
      congNoId: row.id,
      soTien: amount,
      hinhThucId: 3,
    })

    expect(THU_CHI_ROWS.length).toBe(before + 1)
    expect(THU_CHI_ROWS[0].id).toBe(voucher.id)
    expect(voucher.tinhTrang).toBe(2)
    expect(voucher.soPhieuScNk).toBe(row.soPhieu)
    expect(voucher.soChungTu).toMatch(/^PTT-\d{6}-\d+$/)
    expect(voucher.soChungTu).toBe(`PTT-${month}-${expectedOrdinal}`)
  })

  it('rejects a payment amount that is not positive', async () => {
    const row = CONG_NO_ROWS[2]
    await expect(
      thanhToanCongNo({ congNoId: row.id, soTien: 0, hinhThucId: 1 }),
    ).rejects.toThrow()
  })
})

describe('Công nợ per-ticket receivable model', () => {
  it('has no due-date/overdue field on any row', () => {
    for (const r of CONG_NO_ROWS) {
      const untyped = r as unknown as Record<string, unknown>
      expect(untyped).not.toHaveProperty('hanTT')
      expect(untyped).not.toHaveProperty('han_thanh_toan')
      expect(untyped).not.toHaveProperty('trang_thai')
    }
  })

  it('conLai invariant holds for every row (soTien - daTra)', () => {
    for (const r of CONG_NO_ROWS) {
      expect(r.conLai).toBe(r.soTien - r.daTra)
    }
  })
})
