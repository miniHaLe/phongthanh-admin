/** Contract tests for create/edit repair form mapping and warranty aliases. */
import { describe, expect, it } from 'vitest'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import {
  buildCreateRepairInput,
  buildUpdateRepairInput,
  createEmptyRepairFormValues,
  repairTicketToFormValues,
} from './repair-form-contract'

describe('repair form contract', () => {
  it('maps every editable ticket field to form defaults without persisting derived dealer data', () => {
    const ticket = {
      ...MOCK_TICKETS[0],
      ghiChuNhaSanXuat: 'Lưu ý hãng',
      ghiChuModel: 'Lưu ý model',
      tuyen: 'Tuyến 8',
      daiLyId: 'kh-2',
      daiLy: 'Đại lý A',
      dienThoai2: '0909000002',
      email: 'khach@example.com',
      warrantyAt: 0 as const,
    }

    const values = repairTicketToFormValues(ticket)

    expect(values).toMatchObject({
      soSerial: ticket.soSerial ?? '',
      moTaHuHong: ticket.moTaLoi,
      branchId: ticket.branchId,
      loaiBaoHanh: 'tai_ttbh',
      suaGap: ticket.isQuick ?? false,
      ghiChuNhaSanXuat: 'Lưu ý hãng',
      ghiChuModel: 'Lưu ý model',
      tuyen: 'Tuyến 8',
      dienThoai2: '0909000002',
      email: 'khach@example.com',
    })
    expect(values.daiLy).toMatchObject({ id: 'kh-2', label: 'Đại lý A' })
    expect(values.khuVuc).toEqual({
      id: ticket.khuVuc,
      label: ticket.khuVuc,
    })
    expect(values.ngayNhan).toBe(ticket.ngayNhan.slice(0, 10))
  })

  it('maps UI warranty aliases back to the canonical ticket contract', () => {
    const values = {
      ...createEmptyRepairFormValues('dak-lak', '2026-07-15'),
      sanPham: { id: 'sp', label: 'Sản phẩm' },
      nhaSanXuat: { id: 'nsx', label: 'Hãng' },
      model: {
        id: 'model',
        label: 'Model',
        nhaSanXuatId: 'nsx',
        sanPhamId: 'sp',
      },
      soSerial: 'SN-1',
      moTaHuHong: 'Hỏng',
      hinhThuc: 'bao_hanh' as const,
      loaiBaoHanh: 'tai_nha' as const,
      khuVuc: { id: 'kv', label: 'Khu vực' },
      khachHang: {
        id: 'kh',
        label: 'Khách — 0901',
        ten: 'Khách',
        sdt: '0901',
        diaChi: 'Địa chỉ',
      },
      ghiChuNhaSanXuat: 'NSX',
      ghiChuModel: 'Model note',
      tuyen: 'Tuyến 1',
      daiLy: {
        id: 'dl',
        label: 'Đại lý',
        daiLyChinh: 'Đại lý chính',
      },
      dienThoai2: '0902',
      email: 'mail@example.com',
    }

    const created = buildCreateRepairInput(values)
    const updated = buildUpdateRepairInput(values)

    for (const input of [created, updated]) {
      expect(input).toMatchObject({
        loaiBaoHanh: 'nha_khach',
        warrantyAt: 1,
        ghiChuNhaSanXuat: 'NSX',
        ghiChuModel: 'Model note',
        tuyen: 'Tuyến 1',
        daiLyId: 'dl',
        daiLy: 'Đại lý',
        dienThoai2: '0902',
        email: 'mail@example.com',
      })
      expect(input).not.toHaveProperty('daiLyChinh')
    }
  })

  it('preserves a seeded dealer label without coercing it into an id', () => {
    const ticket = MOCK_TICKETS.find((item) => item.daiLy && !item.daiLyId)!

    const values = repairTicketToFormValues(ticket)
    const updated = buildUpdateRepairInput(values)

    expect(values.daiLy).toMatchObject({ id: '', label: ticket.daiLy })
    expect(updated).toMatchObject({ daiLyId: null, daiLy: ticket.daiLy })
  })

  it('serializes blank optional edit fields as explicit null clears', () => {
    const values = repairTicketToFormValues({
      ...MOCK_TICKETS[0],
      daiLyId: 'kh-2',
      daiLy: 'Đại lý A',
      ghiChu: 'Ghi chú cũ',
      email: 'old@example.com',
    })
    const updated = buildUpdateRepairInput({
      ...values,
      daiLy: null,
      ghiChu: '',
      email: '',
    })
    const serialized = JSON.parse(JSON.stringify(updated)) as Record<
      string,
      unknown
    >

    expect(serialized).toMatchObject({
      daiLyId: null,
      daiLy: null,
      ghiChu: null,
      email: null,
    })
  })
})
