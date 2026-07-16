import { describe, expect, it } from 'vitest'
import type { SellingOrder } from '@/domains/warehouse/types'
import {
  buildSellingDetailRows,
  summarizeSellingProfit,
} from './selling-detail-report'

const ORDER: SellingOrder = {
  id: 'order-1',
  soPhieu: 'PBH-1',
  ngayLap: '2026-07-16T00:00:00.000Z',
  khachHang: 'Khách A',
  dienThoai: '0901000000',
  hinhThucThanhToan: 'Tiền mặt',
  tongTien: 2_900_000,
  nguoiLap: 'Thu ngân',
  ghiChu: '',
  branchId: 'dak-lak',
  lines: [
    {
      hangHoaId: 'hh-1',
      maHang: 'HH-A',
      tenHang: 'Hàng A',
      model: 'A1',
      serial: '',
      khoId: 'kho-a',
      khoTen: 'Kho A',
      capNhatGia: false,
      giaVon: 600_000,
      giaBan: 1_000_000,
      soLuong: 2,
      thanhTien: 2_000_000,
    },
    {
      hangHoaId: 'hh-2',
      maHang: 'HH-B',
      tenHang: 'Hàng B',
      model: 'B1',
      serial: '',
      khoId: 'kho-b',
      khoTen: 'Kho B',
      capNhatGia: false,
      giaVon: 500_000,
      giaBan: 900_000,
      soLuong: 1,
      thanhTien: 900_000,
    },
  ],
}

describe('selling detail and profit reports', () => {
  it('uses one persisted line for joined filters and snapshot profit math', () => {
    const rows = buildSellingDetailRows([ORDER], {
      khoId: 'kho-a',
      maHang: 'HH-A',
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      doanhThu: 2_000_000,
      tongGiaVon: 1_200_000,
      loiNhuan: 800_000,
    })
    expect(summarizeSellingProfit(rows)).toEqual({
      doanhThu: 2_000_000,
      giaVon: 1_200_000,
      loiNhuan: 800_000,
    })
  })

  it('does not combine line predicates across different products', () => {
    expect(
      buildSellingDetailRows([ORDER], {
        khoId: 'kho-a',
        maHang: 'HH-B',
      }),
    ).toEqual([])
  })
})
