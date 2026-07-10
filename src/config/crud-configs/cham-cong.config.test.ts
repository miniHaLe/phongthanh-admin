/**
 * Spec: Chấm Công — exact 12-column header order + Loại chấm công (5 values)
 * and Loại trừ (2 values) option lists (section-hr.md H9). This config is
 * rendered by a hand-composed page (ChamCongPage), not CrudTablePage — see
 * that page's header comment — so `columns` here exists purely to pin the
 * header order (duplicate `nhanVienId` keys across derived columns are fine
 * since CrudTablePage never consumes this config's columns array).
 */
import { describe, it, expect } from 'vitest'
import { chamCongConfig } from './cham-cong.config'

describe('chamCongConfig', () => {
  it('exposes the 10 data-column headers in verified order (checkbox + STT + these + Chọn = 12)', () => {
    expect(chamCongConfig.columns.map((c) => c.header)).toEqual([
      'Tên NV',
      'Giới tính',
      'Chức danh',
      'Chi nhánh',
      'Loại chấm',
      'Chấm công',
      'Ngày chấm công',
      'Ngày tạo',
      'Kỳ',
      'Loại trừ',
    ])
  })

  it('Loại chấm công options are the exact 5-value taxonomy', () => {
    const loaiCham = chamCongConfig.fields.find((f) => f.key === 'loaiCham')!
    expect(loaiCham.options?.map((o) => o.label)).toEqual([
      'Nghỉ',
      'Nghỉ nữa ngày',
      'Đi trễ',
      'Tăng ca',
      'Về sớm',
    ])
  })

  it('Loại trừ lương options are the exact 2-value taxonomy', () => {
    const loaiTru = chamCongConfig.fields.find((f) => f.key === 'loaiTru')!
    expect(loaiTru.options?.map((o) => o.label)).toEqual([
      'Trừ tiền',
      'Trừ ngày công',
    ])
  })

  it('has a Kỳ filter + bulk-delete', () => {
    expect(chamCongConfig.filters?.some((f) => f.key === 'kyId')).toBe(true)
    expect(chamCongConfig.bulkDelete).toBe(true)
  })
})
