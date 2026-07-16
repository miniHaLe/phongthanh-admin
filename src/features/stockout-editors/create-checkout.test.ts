import { describe, expect, it } from 'vitest'
import { CHECKOUT_ROWS } from '@/domains/warehouse/list-data'
import { createCheckout } from './create-checkout'

const VALID_LINE = {
  serial: 'SN-1',
  soPhieuSC: 'PSC-1',
  maHang: 'HH-1',
  tenHang: 'Bo mạch',
  nhaSanXuat: 'Samsung',
  model: 'A1',
  khoId: 'warehouse-1',
  khoTen: 'Kho 1',
  nganChuaId: 'cabinet-1',
  nganChua: 'Ngăn 1',
  mucDich: 'Bảo hành',
  gia: 100_000,
  soLuong: 1,
  thanhTien: 100_000,
}

describe('createCheckout', () => {
  it('persists line-level warehouse and purpose fields used by list filters', () => {
    const lines = [VALID_LINE]

    const slip = createCheckout({
      kyThuat: 'Kỹ thuật A',
      ghiChu: '',
      nguoiLap: 'Người lập A',
      branchId: 'branch-1',
      lines,
    })

    expect(slip.lines).toEqual(lines)
    CHECKOUT_ROWS.splice(
      CHECKOUT_ROWS.findIndex((row) => row.id === slip.id),
      1,
    )
  })

  it('drops a truly blank editor row but rejects partially populated metadata', () => {
    const blankLine = {
      serial: '',
      soPhieuSC: '',
      maHang: '',
      tenHang: '',
      nhaSanXuat: '',
      model: '',
      khoId: '',
      khoTen: '',
      nganChuaId: '',
      nganChua: '',
      mucDich: '',
      gia: 0,
      soLuong: 1,
      thanhTien: 0,
    }
    const slip = createCheckout({
      kyThuat: 'Kỹ thuật A',
      ghiChu: '',
      nguoiLap: 'Người lập A',
      branchId: 'branch-1',
      lines: [blankLine, VALID_LINE],
    })

    expect(slip.lines).toEqual([VALID_LINE])
    CHECKOUT_ROWS.splice(
      CHECKOUT_ROWS.findIndex((row) => row.id === slip.id),
      1,
    )
    expect(() =>
      createCheckout({
        kyThuat: 'Kỹ thuật A',
        ghiChu: '',
        nguoiLap: 'Người lập A',
        branchId: 'branch-1',
        lines: [{ ...VALID_LINE, nganChuaId: '' }],
      }),
    ).toThrow('Thiếu thông tin dòng cấp linh kiện')
  })
})
