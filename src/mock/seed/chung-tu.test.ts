/** Spec: ChungTu 12-type + 5-status taxonomy + generated rows (section-finance.md). */
import { describe, it, expect } from 'vitest'
import {
  LOAI_THU_CHI,
  TINH_TRANG_CHUNG_TU,
  THU_TYPE_IDS,
  CHUNG_TU,
} from './chung-tu'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

describe('ChungTu taxonomies', () => {
  it('LOAI_THU_CHI deep-equals the 12 pairs', () => {
    expect(LOAI_THU_CHI).toEqual([
      { id: 1, ten: 'Phiếu Thu' },
      { id: 2, ten: 'Phiếu Chi' },
      { id: 3, ten: 'Phiếu Thu Sửa Chữa' },
      { id: 5, ten: 'Phiếu Thu Bán Hàng' },
      { id: 9, ten: 'Thu Trả Hàng Lỗi' },
      { id: 10, ten: 'Thu Khác' },
      { id: 11, ten: 'Chi Lương' },
      { id: 12, ten: 'Chi Xăng' },
      { id: 13, ten: 'Chi Trả Hàng' },
      { id: 14, ten: 'Chi Mua Hàng' },
      { id: 15, ten: 'Chi Khác' },
      { id: 16, ten: 'Chi Trả Vận Chuyển' },
    ])
  })

  it('TINH_TRANG_CHUNG_TU deep-equals the 5 pairs', () => {
    expect(TINH_TRANG_CHUNG_TU).toEqual([
      { id: 1, ten: 'Chưa thu' },
      { id: 2, ten: 'Đã thu' },
      { id: 3, ten: 'Chưa chi' },
      { id: 4, ten: 'Đã chi' },
      { id: 5, ten: 'Đã thu ngoài' },
    ])
  })
})

describe('CHUNG_TU rows', () => {
  const thuSet = new Set<number>(THU_TYPE_IDS)
  const ticketNumbers = new Set(MOCK_TICKETS.map((t) => t.soPhieu))

  it('every soChungTu matches /^(PTT|PCC)-\\d{8}-\\d+$/ with PTT↔thu, PCC↔chi', () => {
    for (const c of CHUNG_TU) {
      expect(c.soChungTu).toMatch(/^(PTT|PCC)-\d{8}-\d+$/)
      const isThu = thuSet.has(c.loaiThuChi)
      expect(c.soChungTu.startsWith(isThu ? 'PTT' : 'PCC')).toBe(true)
    }
  })

  it('settled rows carry nguoiThuChi + ngayThuChi; unsettled carry neither', () => {
    for (const c of CHUNG_TU) {
      const settled = c.tinhTrang === 2 || c.tinhTrang === 4 || c.tinhTrang === 5
      if (settled) {
        expect(c.nguoiThuChiId).not.toBeNull()
        expect(c.ngayThuChi).not.toBeNull()
      } else {
        expect(c.nguoiThuChiId).toBeNull()
        expect(c.ngayThuChi).toBeNull()
      }
    }
  })

  it('repair-linked rows resolve to a live ticket', () => {
    for (const c of CHUNG_TU) {
      if (c.soPhieuScNk) expect(ticketNumbers.has(c.soPhieuScNk)).toBe(true)
    }
  })
})
