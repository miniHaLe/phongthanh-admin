/**
 * Spec: Nhân Viên — 8 CrudTablePage-managed data columns (STT/checkbox/Chọn
 * are host-rendered by NhanVienPage, not this config) + Hình/Giới tính +
 * active-first sort (section-hr.md H7).
 */
import { describe, it, expect } from 'vitest'
import { nhanVienConfig } from './nhan-vien.config'

describe('nhanVienConfig', () => {
  it('exposes the exact verified column headers (Hình…Khóa)', () => {
    expect(nhanVienConfig.columns.map((c) => c.header)).toEqual([
      'Hình',
      'Mã NV',
      'Tên NV',
      'Phòng',
      'Giới tính',
      'Ngày sinh',
      'Điện thoại',
      'Khóa',
    ])
  })

  it('sorts active (unlocked) rows first by default', () => {
    expect(nhanVienConfig.defaultSort).toEqual({ key: 'locked', dir: 'asc' })
  })

  it('renders Giới tính as Nam/Nữ', () => {
    const col = nhanVienConfig.columns.find((c) => c.key === 'gioiTinh')!
    expect(col.renderCell?.(true as never, {} as never)).toBe('Nam')
    expect(col.renderCell?.(false as never, {} as never)).toBe('Nữ')
  })

  it('filters by mã/tên nhân viên + phòng ban', () => {
    expect(nhanVienConfig.filters?.map((f) => String(f.key))).toEqual([
      'hoTen',
      'phongBanId',
    ])
  })
})
