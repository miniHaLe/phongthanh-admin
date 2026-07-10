/** Spec: Công nợ receivables derive from live tickets, conLai invariant holds. */
import { describe, it, expect } from 'vitest'
import { CONG_NO } from './cong-no'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

describe('CONG_NO receivables', () => {
  const ticketNumbers = new Set(MOCK_TICKETS.map((t) => t.soPhieu))
  const techByTicket = new Map(MOCK_TICKETS.map((t) => [t.soPhieu, t.kyThuatId]))

  it('has rows and every row keeps conLai = soTien - daTra > 0', () => {
    expect(CONG_NO.length).toBeGreaterThan(0)
    for (const r of CONG_NO) {
      expect(r.conLai).toBe(r.soTien - r.daTra)
      expect(r.conLai).toBeGreaterThan(0)
    }
  })

  it('loaiPhieu is one of the two valid kinds', () => {
    for (const r of CONG_NO) {
      expect(['Phiếu sửa chữa', 'Phiếu bán hàng']).toContain(r.loaiPhieu)
    }
  })

  it('repair rows link a live ticket and carry its technician (kyThuatId)', () => {
    const repairRows = CONG_NO.filter((r) => r.loaiPhieu === 'Phiếu sửa chữa')
    expect(repairRows.length).toBeGreaterThan(0)
    for (const r of repairRows) {
      expect(ticketNumbers.has(r.soPhieu)).toBe(true)
      expect(r.kyThuatId).toBe(techByTicket.get(r.soPhieu))
    }
  })
})
