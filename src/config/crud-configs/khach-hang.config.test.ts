import { describe, it, expect } from 'vitest'
import { khachHangConfig } from './khach-hang.config'
import type { CrudLookups } from '@/types/crud-types'
import type { KhachHang } from '@/types/masterdata-types'

function renderColumn(
  key: keyof KhachHang,
  row: Partial<KhachHang>,
  lookups?: CrudLookups,
) {
  const column = khachHangConfig.columns.find((item) => item.key === key)
  return column?.renderCell?.(row[key], row as KhachHang, lookups)
}

describe('khachHangConfig', () => {
  it('renders current two-level address and finance columns without district', () => {
    expect(khachHangConfig.columns.map((c) => c.header)).toEqual([
      'Tên khách hàng',
      'Điện thoại',
      'Điện thoại 2',
      'Địa chỉ',
      'Phường/Xã',
      'Tỉnh/Thành phố',
      'Email',
      'Mã số thuế',
      'Ngân hàng',
      'Số tài khoản',
      'Loại',
      'Đại lý/Trạm',
      'Người tạo',
      'Ngày tạo',
    ])
    expect(khachHangConfig.columns.map((c) => c.header)).not.toContain(
      'Quận/Huyện',
    )
  })

  it('does not retain dead CrudSheet fields behind the bespoke customer form', () => {
    expect(khachHangConfig.fields).toEqual([])
  })

  it('has no invented Mã KH / Tổng phiếu / Trạng thái columns', () => {
    const headers = khachHangConfig.columns.map((c) => c.header)
    expect(headers).not.toContain('Mã KH')
    expect(headers).not.toContain('Tổng phiếu')
    expect(headers).not.toContain('Trạng thái')
  })

  it('Nhóm khách hàng filter has exactly 9 options', () => {
    const filter = khachHangConfig.filters?.find(
      (f) => f.key === 'loaiKhachHangId',
    )
    expect(filter?.options).toHaveLength(9)
  })

  it('opts into bulk-delete + export and hides the generic Thêm button (2 header buttons own create)', () => {
    expect(khachHangConfig.bulkDelete).toBe(true)
    expect(khachHangConfig.export).toBe(true)
    expect(khachHangConfig.addLabel).toBe(false)
  })

  it('defaults to newest-first sort', () => {
    expect(khachHangConfig.defaultSort).toEqual({
      key: 'createdAt',
      dir: 'desc',
    })
  })

  it('demotes low-priority columns below the 1366px fold (restorable via "Cột")', () => {
    const hidden = khachHangConfig.columns
      .filter((c) => c.hidden)
      .map((c) => c.key)
    expect(hidden).toEqual([
      'dienThoai2',
      'maSoThue',
      'nganHangId',
      'soTaiKhoan',
      'nguoiTao',
    ])
  })

  it('keeps the primary working-set columns visible by default', () => {
    const byKey = Object.fromEntries(
      khachHangConfig.columns.map((c) => [c.key, c]),
    )
    for (const key of [
      'tenKH',
      'dienThoai',
      'diaChi',
      'phuongXaCode',
      'tinhThanhCode',
      'email',
      'loaiKhachHangId',
      'daiLyId',
      'createdAt',
    ]) {
      expect(byKey[key]?.hidden).toBeFalsy()
    }
  })

  it('renders modern geography, then legacy names, then an em dash', () => {
    const lookups: CrudLookups = {
      customerProvinceNames: new Map([['66', 'Tên tỉnh từ API']]),
      customerCommuneNames: new Map([['00004', 'Tên phường từ API']]),
    }

    expect(
      renderColumn(
        'tinhThanhCode',
        {
          tinhThanhCode: '66',
          tinhId: 'tinh-dak-nong',
        },
        lookups,
      ),
    ).toBe('Tên tỉnh từ API')
    expect(renderColumn('tinhThanhCode', { tinhId: 'tinh-dak-nong' })).toBe(
      'ĐẮK NÔNG',
    )
    expect(renderColumn('tinhThanhCode', {})).toBe('—')

    expect(
      renderColumn(
        'phuongXaCode',
        {
          phuongXaCode: '00004',
          phuongXaId: 'xa-tan-loi',
        },
        lookups,
      ),
    ).toBe('Tên phường từ API')
    expect(renderColumn('phuongXaCode', { phuongXaId: 'xa-tan-loi' })).toBe(
      'Phường Tân Lợi',
    )
    expect(renderColumn('phuongXaCode', {})).toBe('—')
  })

  it('uses the API-enriched dealer name without a mock lookup', () => {
    expect(
      renderColumn('daiLyId', { daiLyId: 'kh-1', daiLyTen: 'Đại lý A' }),
    ).toBe('Đại lý A')
    expect(renderColumn('daiLyId', { daiLyId: 'kh-1' })).toBe('—')
  })

  it('leaves geography filter options for the page-level query', () => {
    const filter = khachHangConfig.filters?.find(
      (item) => item.key === 'tinhThanhCode',
    )
    expect(filter?.options).toBeUndefined()
  })
})
