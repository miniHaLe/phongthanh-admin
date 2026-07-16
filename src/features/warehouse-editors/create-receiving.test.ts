import { describe, expect, it } from 'vitest'
import { RECEIVING_ROWS } from '@/domains/warehouse/list-data'
import { NHA_KHO_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import {
  createReceiving,
  type CreateReceivingInput,
  type ReceivingEditorLine,
} from './create-receiving'

const cabinet = NGAN_CHUA_ROWS[0]
const warehouse = NHA_KHO_ROWS.find((row) => row.id === cabinet.nhaKhoId)!

function line(
  patch: Partial<ReceivingEditorLine> = {},
): ReceivingEditorLine {
  return {
    ma: 'HH0001',
    ten: 'Linh kiện thử',
    nganChuaId: cabinet.id,
    nganChua: cabinet.tenNgan,
    soLuong: 2,
    donGia: 50_000,
    thanhTien: 1,
    capNhatGia: false,
    serial: ' SERIAL-1 ',
    ...patch,
  }
}

function input(lines: ReceivingEditorLine[]): CreateReceivingInput {
  return {
    soDatHang: 'DH-01',
    soHoaDon: 'HD-01',
    nhaCungCap: 'Nhà cung cấp thử',
    nhaCungCapSdt: '0901000099',
    hinhThucThanhToan: 'Công nợ',
    khoId: warehouse.id,
    khoTen: warehouse.tenNhaKho,
    nguoiLap: 'NV Kho',
    ghiChu: '',
    branchId: 'dak-lak',
    lines,
    cabinets: NGAN_CHUA_ROWS,
  }
}

describe('createReceiving line integrity', () => {
  it('drops an untouched editor row and normalizes persisted totals', () => {
    const blank = line({
      ma: '',
      ten: '',
      soLuong: 1,
      donGia: 0,
      thanhTien: 0,
      serial: '',
    })
    const voucher = createReceiving(input([blank, line()]))

    expect(voucher.lines).toEqual([
      expect.objectContaining({
        ma: 'HH0001',
        serial: 'SERIAL-1',
        thanhTien: 100_000,
      }),
    ])
    expect(voucher.soTien).toBe(100_000)

    RECEIVING_ROWS.splice(
      RECEIVING_ROWS.findIndex((row) => row.id === voucher.id),
      1,
    )
  })

  it('rejects a single empty editor row even when it inherits a cabinet', () => {
    expect(() =>
      createReceiving(
        input([
          line({
            ma: '',
            ten: '',
            soLuong: 1,
            donGia: 0,
            thanhTien: 0,
            serial: '',
          }),
        ]),
      ),
    ).toThrow('Vui lòng thêm hàng hóa!')
  })

  it('rejects a cabinet that does not belong to the selected warehouse', () => {
    const otherWarehouse = NHA_KHO_ROWS.find((row) => row.id !== warehouse.id)!

    expect(() =>
      createReceiving({
        ...input([line()]),
        khoId: otherWarehouse.id,
        khoTen: otherWarehouse.tenNhaKho,
      }),
    ).toThrow('Thiếu thông tin dòng nhập kho')
  })
})
