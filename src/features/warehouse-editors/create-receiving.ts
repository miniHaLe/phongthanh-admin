/**
 * Mock create-mutation for the Nhập Kho editor. Appends a new voucher to the
 * already-exported, mutable `RECEIVING_ROWS` store (owned by
 * `src/domains/warehouse/list-data.ts`, imported here — not modified) so the
 * list page's fetcher immediately reflects it on invalidate. Module-memory
 * only; lost on reload like every other mock mutation in this app.
 */
import { RECEIVING_ROWS } from '@/domains/warehouse/list-data'
import type { ReceivingVoucher, ReceivingLine } from '@/domains/warehouse/types'
import type { NganChua } from '@/types/masterdata-types'
import { nextVoucherCode } from '@/lib/voucher-code'

let receivingIdSeq = RECEIVING_ROWS.length

export type ReceivingEditorLine = ReceivingLine

type ReceivingCabinet = Pick<NganChua, 'id' | 'nhaKhoId' | 'tenNgan'>

export function clearIncompatibleReceivingLineCabinets(
  lines: ReceivingEditorLine[],
  khoId: string,
  cabinets: readonly Pick<NganChua, 'id' | 'nhaKhoId'>[],
): ReceivingEditorLine[] {
  return lines.map((line) => {
    const isCompatible = cabinets.some(
      (cabinet) => cabinet.id === line.nganChuaId && cabinet.nhaKhoId === khoId,
    )
    return isCompatible ? line : { ...line, nganChuaId: '', nganChua: '' }
  })
}

export interface CreateReceivingInput {
  soDatHang: string
  soHoaDon: string
  nhaCungCap: string
  nhaCungCapSdt: string
  hinhThucThanhToan: string
  khoId: string
  khoTen: string
  nguoiLap: string
  ghiChu: string
  branchId: string
  lines: ReceivingEditorLine[]
  cabinets: readonly ReceivingCabinet[]
}

function isTrulyBlankReceivingLine(line: ReceivingEditorLine): boolean {
  return (
    [line.ma, line.ten, line.serial].every((value) => value.trim() === '') &&
    line.soLuong === 1 &&
    line.donGia === 0 &&
    line.thanhTien === 0 &&
    !line.capNhatGia
  )
}

function normalizeReceivingLines(
  input: CreateReceivingInput,
): ReceivingEditorLine[] {
  const lines = input.lines.filter((line) => !isTrulyBlankReceivingLine(line))
  if (lines.length === 0) throw new Error('Vui lòng thêm hàng hóa!')

  return lines.map((line) => {
    const cabinet = input.cabinets.find(
      (candidate) =>
        candidate.id === line.nganChuaId &&
        candidate.nhaKhoId === input.khoId,
    )
    if (
      !line.ma.trim() ||
      !line.ten.trim() ||
      !cabinet ||
      !Number.isFinite(line.soLuong) ||
      line.soLuong <= 0 ||
      !Number.isFinite(line.donGia) ||
      line.donGia < 0
    ) {
      throw new Error('Thiếu thông tin dòng nhập kho')
    }

    return {
      ...line,
      ma: line.ma.trim(),
      ten: line.ten.trim(),
      nganChuaId: cabinet.id,
      nganChua: cabinet.tenNgan,
      serial: line.serial.trim(),
      thanhTien: line.soLuong * line.donGia,
    }
  })
}

export function createReceiving(input: CreateReceivingInput): ReceivingVoucher {
  const lines = normalizeReceivingLines(input)
  receivingIdSeq += 1
  const now = new Date()
  const soTien = lines.reduce((s, l) => s + l.thanhTien, 0)
  const voucher: ReceivingVoucher = {
    id: `nk-new-${receivingIdSeq}`,
    soPhieu: nextVoucherCode(
      'PNK',
      RECEIVING_ROWS.map((row) => row.soPhieu),
      now,
    ),
    soDatHang: input.soDatHang,
    soHoaDon: input.soHoaDon,
    nhaCungCap: input.nhaCungCap,
    nhaCungCapSdt: input.nhaCungCapSdt,
    hinhThucThanhToan: input.hinhThucThanhToan,
    khoId: input.khoId,
    khoTen: input.khoTen,
    soTien,
    nguoiLap: input.nguoiLap,
    ngayLap: now.toISOString(),
    ghiChu: input.ghiChu,
    branchId: input.branchId,
    lines,
  }
  RECEIVING_ROWS.unshift(voucher)
  return voucher
}
