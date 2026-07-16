/** Create/edit mutations for the in-memory repair aggregate. */
import { MockApiError } from '@/lib/mock-error'
import { MOCK_TICKETS, createRepairTicket as createTicket } from './mock-data'
import {
  MANUFACTURERS,
  MODELS,
  PRODUCTS,
  isCompatibleModelSelection,
} from './reference-data'
import type {
  CreateRepairInput,
  RepairTicket,
  UpdateRepairInput,
} from './types'

/** Compatibility wrapper keeps all UI writes behind mock-mutations.ts. */
export function createRepairTicket(
  input: CreateRepairInput,
): Promise<RepairTicket> {
  return createTicket(input)
}

/** Update only form-owned fields; status/history/costs stay under dedicated flows. */
export async function updateRepairTicket(
  id: string,
  input: UpdateRepairInput,
): Promise<RepairTicket> {
  const ticket = MOCK_TICKETS.find((item) => item.id === id)
  if (!ticket) {
    throw new MockApiError('Không tìm thấy phiếu sửa chữa.', 'NOT_FOUND')
  }
  if (
    !isCompatibleModelSelection(
      input.nhaSanXuatId,
      input.sanPhamId,
      input.modelId,
    )
  ) {
    throw new MockApiError(
      'Model không thuộc Nhà sản xuất và Sản phẩm đã chọn.',
      'INVALID_MODEL_RELATION',
    )
  }

  const manufacturer = MANUFACTURERS.find(
    (item) => item.id === input.nhaSanXuatId,
  )
  const product = PRODUCTS.find((item) => item.id === input.sanPhamId)
  const model = MODELS.find((item) => item.id === input.modelId)

  ticket.khachHangId = input.khachHangId ?? ticket.khachHangId
  ticket.khachHang = {
    ...ticket.khachHang,
    id: ticket.khachHangId,
    ten: input.tenKhach,
    sdt: input.sdt,
    diaChi: 'diaChi' in input ? (input.diaChi ?? '') : ticket.khachHang.diaChi,
  }
  ticket.branchId = input.branchId
  ticket.nhaSanXuatId = input.nhaSanXuatId
  ticket.sanPhamId = input.sanPhamId
  ticket.modelId = input.modelId
  ticket.tenSanPham = [manufacturer?.ten, product?.ten, model?.ten]
    .filter(Boolean)
    .join(' – ')
  ticket.hinhThuc = input.hinhThuc
  ticket.ngayNhan = input.ngayNhan
  ticket.moTaLoi = input.moTaLoi

  if ('soPhieuHang' in input)
    ticket.soPhieuHang = input.soPhieuHang ?? undefined
  if ('soPhieuDaiLy' in input)
    ticket.soPhieuDaiLy = input.soPhieuDaiLy ?? undefined
  if ('soSerial' in input) ticket.soSerial = input.soSerial ?? undefined
  if ('loaiBaoHanh' in input) ticket.loaiBaoHanh = input.loaiBaoHanh
  if ('warrantyAt' in input) ticket.warrantyAt = input.warrantyAt
  if ('isQuick' in input) ticket.isQuick = input.isQuick
  if ('khuVuc' in input) ticket.khuVuc = input.khuVuc ?? undefined
  if ('ngayHenTra' in input)
    ticket.ngayHenTra = input.ngayHenTra ?? undefined
  if ('phuKienKemTheo' in input)
    ticket.phuKienKemTheo = input.phuKienKemTheo ?? undefined
  if ('ngayMua' in input) ticket.ngayMua = input.ngayMua ?? undefined
  if ('noiMua' in input) ticket.noiMua = input.noiMua ?? undefined
  if ('ghiChu' in input) ticket.ghiChu = input.ghiChu ?? undefined
  if ('ghiChuNhaSanXuat' in input)
    ticket.ghiChuNhaSanXuat = input.ghiChuNhaSanXuat ?? undefined
  if ('ghiChuModel' in input)
    ticket.ghiChuModel = input.ghiChuModel ?? undefined
  if ('tuyen' in input) {
    ticket.tuyen = input.tuyen ?? undefined
    ticket.khachHang.tuyen = input.tuyen ?? undefined
  }
  if ('daiLyId' in input) {
    ticket.daiLyId = input.daiLyId ?? undefined
    ticket.khachHang.daiLyId = input.daiLyId ?? undefined
  }
  if ('daiLy' in input) {
    ticket.daiLy = input.daiLy ?? undefined
    ticket.khachHang.daiLy = input.daiLy ?? undefined
  }
  if ('dienThoai2' in input) {
    ticket.dienThoai2 = input.dienThoai2 ?? undefined
    ticket.khachHang.dienThoai2 = input.dienThoai2 ?? undefined
  }
  if ('email' in input) {
    ticket.email = input.email ?? undefined
    ticket.khachHang.email = input.email ?? undefined
  }

  ticket.updatedAt = new Date().toISOString()
  return ticket
}
