/**
 * Spec test for the canonical legacy status module.
 * Source of truth: gap matrix §5b (fixed numeric ids + Vietnamese labels + hex).
 */
import { describe, it, expect } from 'vitest'
import {
  REPAIR_STATUSES,
  KT_BOARD_STATUS_IDS,
  STATUS_LABEL,
  STATUS_HEX,
  OPEN_STATUS_IDS,
  labelOf,
  hexOf,
  type RepairStatusId,
} from './status'

const EXPECTED: Array<[RepairStatusId, string, string]> = [
  [1, 'Mới Nhận', '#FFCC00'],
  [2, 'Đã Điều Phối', '#00CCFF'],
  [4, 'Báo Giá', '#9966CC'],
  [6, 'Chờ Xác Nhận', '#996600'],
  [7, 'Chờ Linh Kiện', '#4B0082'],
  [8, 'Trả Lại', '#CC3300'],
  [9, 'Sửa Xong', '#3300FF'],
  [10, 'Đã Giao Cho Khách', '#00FF00'],
  [11, 'Hỏng Khách Trả Lại', '#CC9911'],
  [12, 'Đã Giao Phiếu Hủy', '#342c38'],
  [13, 'Đã Có Linh Kiện', '#6D5582'],
  [14, 'Đã Giao Ngoài', '#009988'],
  [15, 'Chờ Báo Giá', '#31065c'],
  [16, 'Chờ Phiếu Hãng', '#06385c'],
  [17, 'Đã Đặt Linh Kiện', '#112233'],
]

describe('REPAIR_STATUSES — legacy 15 (§5b)', () => {
  it('deep-equals the 15 [id,label,hex] triples in id order', () => {
    expect(REPAIR_STATUSES.map((s) => [s.id, s.label, s.hex])).toEqual(EXPECTED)
  })

  it('omits the retired ids 3 and 5', () => {
    const ids = REPAIR_STATUSES.map((s) => s.id)
    expect(ids).not.toContain(3)
    expect(ids).not.toContain(5)
  })

  it('has unique ids, labels, and hex values', () => {
    expect(new Set(REPAIR_STATUSES.map((s) => s.id)).size).toBe(15)
    expect(new Set(REPAIR_STATUSES.map((s) => s.label)).size).toBe(15)
    expect(new Set(REPAIR_STATUSES.map((s) => s.hex)).size).toBe(15)
  })

  it('KT_BOARD_STATUS_IDS deep-equals [2,4,6,7,8,9,13,15,16,17]', () => {
    expect(KT_BOARD_STATUS_IDS).toEqual([2, 4, 6, 7, 8, 9, 13, 15, 16, 17])
  })

  it('derived maps + helpers agree with the source', () => {
    for (const [id, label, hex] of EXPECTED) {
      expect(STATUS_LABEL[id]).toBe(label)
      expect(STATUS_HEX[id]).toBe(hex)
      expect(labelOf(id)).toBe(label)
      expect(hexOf(id)).toBe(hex)
    }
  })

  it('OPEN_STATUS_IDS excludes 10 (Đã Giao Cho Khách) and 12 (Đã Giao Phiếu Hủy)', () => {
    expect(OPEN_STATUS_IDS).not.toContain(10)
    expect(OPEN_STATUS_IDS).not.toContain(12)
    expect(OPEN_STATUS_IDS).toContain(1)
  })
})
