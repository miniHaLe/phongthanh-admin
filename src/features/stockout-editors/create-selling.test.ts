import { afterEach, describe, expect, it } from 'vitest'
import { SELLING_ROWS } from '@/domains/warehouse/list-data'
import type { SellingLine } from '@/domains/warehouse/types'
import { createSelling, updateSelling } from './create-selling'

const originalRows = SELLING_ROWS.map((row) => ({
  ...row,
  lines: row.lines.map((line) => ({ ...line })),
}))

const LINE: SellingLine = {
  hangHoaId: 'hh-1',
  maHang: 'HH00001',
  tenHang: 'Block máy lạnh 1HP',
  model: 'Daikin FTKZ 12000BTU',
  serial: 'SN-1',
  khoId: 'nk-1',
  khoTen: 'Kho Chính',
  capNhatGia: false,
  giaVon: 600_000,
  giaBan: 1_000_000,
  soLuong: 2,
  thanhTien: 2_000_000,
}

afterEach(() => {
  SELLING_ROWS.splice(
    0,
    SELLING_ROWS.length,
    ...originalRows.map((row) => ({
      ...row,
      lines: row.lines.map((line) => ({ ...line })),
    })),
  )
})

describe('createSelling', () => {
  it('persists immutable line-level price snapshots and payment metadata', () => {
    const inputLine = { ...LINE }
    const order = createSelling({
      khachHang: 'Khách A',
      dienThoai: '0901000000',
      ghiChu: '',
      nguoiLap: 'Thu ngân A',
      branchId: 'dak-lak',
      hinhThucThanhToan: 'Tiền mặt',
      lines: [inputLine],
    })

    inputLine.giaVon = 1
    inputLine.giaBan = 2
    expect(order.hinhThucThanhToan).toBe('Tiền mặt')
    expect(order.tongTien).toBe(2_000_000)
    expect(order.lines[0]).toEqual(LINE)
  })

  it('updates persisted lines and rejects blank or invalid detail rows', () => {
    const seed = SELLING_ROWS[0]
    const updated = updateSelling(seed.id, {
      khachHang: seed.khachHang,
      dienThoai: seed.dienThoai,
      ghiChu: 'Đã sửa',
      nguoiLap: seed.nguoiLap,
      branchId: seed.branchId,
      hinhThucThanhToan: 'Chuyển khoản',
      lines: [{ ...LINE, soLuong: 1, thanhTien: LINE.giaBan }],
    })

    expect(updated?.hinhThucThanhToan).toBe('Chuyển khoản')
    expect(updated?.tongTien).toBe(LINE.giaBan)
    expect(updated?.lines).toHaveLength(1)
    expect(() =>
      createSelling({
        khachHang: 'Khách A',
        dienThoai: '',
        ghiChu: '',
        nguoiLap: 'Thu ngân A',
        branchId: 'dak-lak',
        hinhThucThanhToan: 'Tiền mặt',
        lines: [{ ...LINE, hangHoaId: '' }],
      }),
    ).toThrow('Thiếu thông tin dòng bán hàng')
  })
})
