/** Boundary mapping for repair create/edit forms. */
import {
  MANUFACTURERS,
  MODELS,
  PRODUCTS,
} from '@/domains/repair/reference-data'
import type {
  CreateRepairInput,
  HinhThuc,
  LoaiBaoHanh,
  RepairTicket,
  UpdateRepairInput,
} from '@/domains/repair/types'
import type { RepairFormValues } from './repair-form-schema'

export {
  createEmptyRepairFormValues,
  repairFormSchema,
} from './repair-form-schema'
export type { RepairDealerOption, RepairFormValues } from './repair-form-schema'

function toDateInput(value?: string): string {
  return value?.slice(0, 10) ?? ''
}

function warrantyAlias(ticket: RepairTicket): RepairFormValues['loaiBaoHanh'] {
  if (ticket.warrantyAt === 0 || ticket.loaiBaoHanh === 'tai_tram') {
    return 'tai_ttbh'
  }
  return 'tai_nha'
}

export function repairTicketToFormValues(
  ticket: RepairTicket,
): RepairFormValues {
  const manufacturer = MANUFACTURERS.find(
    (item) => item.id === ticket.nhaSanXuatId,
  )
  const product = PRODUCTS.find((item) => item.id === ticket.sanPhamId)
  const model = MODELS.find((item) => item.id === ticket.modelId)
  const dealerLabel = ticket.daiLy ?? ticket.daiLyId

  return {
    sanPham: {
      id: ticket.sanPhamId,
      label: product?.ten ?? ticket.tenSanPham,
    },
    nhaSanXuat: {
      id: ticket.nhaSanXuatId,
      label: manufacturer?.ten ?? ticket.tenSanPham,
    },
    model: {
      id: ticket.modelId,
      label: model?.ten ?? ticket.tenSanPham,
      nhaSanXuatId: ticket.nhaSanXuatId,
      sanPhamId: ticket.sanPhamId,
    },
    soSerial: ticket.soSerial ?? '',
    moTaHuHong: ticket.moTaLoi,
    phuKienKemTheo: ticket.phuKienKemTheo ?? '',
    ngayMua: toDateInput(ticket.ngayMua),
    noiMua: ticket.noiMua ?? '',
    ghiChu: ticket.ghiChu ?? '',
    ghiChuNhaSanXuat: ticket.ghiChuNhaSanXuat ?? '',
    ghiChuModel: ticket.ghiChuModel ?? '',
    branchId: ticket.branchId,
    soPhieuHang: ticket.soPhieuHang ?? '',
    soPhieuDaiLy: ticket.soPhieuDaiLy ?? '',
    hinhThuc: ticket.hinhThuc,
    loaiBaoHanh: warrantyAlias(ticket),
    suaGap: ticket.isQuick ?? false,
    khuVuc: ticket.khuVuc ? { id: ticket.khuVuc, label: ticket.khuVuc } : null,
    khachHang: {
      id: ticket.khachHangId,
      label: `${ticket.khachHang.ten} — ${ticket.khachHang.sdt}`,
      ten: ticket.khachHang.ten,
      sdt: ticket.khachHang.sdt,
      diaChi: ticket.khachHang.diaChi,
      dienThoai2: ticket.dienThoai2 ?? ticket.khachHang.dienThoai2,
      email: ticket.email ?? ticket.khachHang.email,
    },
    tuyen: ticket.tuyen ?? ticket.khachHang.tuyen ?? '',
    daiLy: dealerLabel
      ? {
          id: ticket.daiLyId ?? '',
          label: dealerLabel,
          daiLyChinh: dealerLabel,
        }
      : null,
    dienThoai2: ticket.dienThoai2 ?? ticket.khachHang.dienThoai2 ?? '',
    email: ticket.email ?? ticket.khachHang.email ?? '',
    ngayHenGiao: toDateInput(ticket.ngayHenTra),
    ngayNhan: toDateInput(ticket.ngayNhan),
  }
}

function optional(value?: string): string | undefined {
  return value?.trim() || undefined
}

function nullable(value?: string): string | null {
  return value?.trim() || null
}

function canonicalWarranty(value: RepairFormValues['loaiBaoHanh']): {
  loaiBaoHanh: LoaiBaoHanh
  warrantyAt: 0 | 1
} {
  return value === 'tai_ttbh'
    ? { loaiBaoHanh: 'tai_tram', warrantyAt: 0 }
    : { loaiBaoHanh: 'nha_khach', warrantyAt: 1 }
}

function buildRequiredEditableInput(data: RepairFormValues) {
  return {
    khachHangId: data.khachHang?.id,
    tenKhach: data.khachHang?.ten ?? '',
    sdt: data.khachHang?.sdt ?? '',
    branchId: data.branchId ?? '',
    nhaSanXuatId: data.nhaSanXuat?.id ?? '',
    sanPhamId: data.sanPham?.id ?? '',
    modelId: data.model?.id ?? '',
    hinhThuc: data.hinhThuc as HinhThuc,
    ...canonicalWarranty(data.loaiBaoHanh),
    isQuick: data.suaGap,
    ngayNhan: data.ngayNhan,
    moTaLoi: data.moTaHuHong,
  }
}

export function buildCreateRepairInput(
  data: RepairFormValues,
): CreateRepairInput {
  return {
    ...buildRequiredEditableInput(data),
    diaChi: optional(data.khachHang?.diaChi),
    soPhieuHang: optional(data.soPhieuHang),
    soPhieuDaiLy: optional(data.soPhieuDaiLy),
    soSerial: optional(data.soSerial),
    khuVuc: optional(data.khuVuc?.label),
    ngayHenTra: optional(data.ngayHenGiao),
    phuKienKemTheo: optional(data.phuKienKemTheo),
    ngayMua: optional(data.ngayMua),
    noiMua: optional(data.noiMua),
    ghiChu: optional(data.ghiChu),
    ghiChuNhaSanXuat: optional(data.ghiChuNhaSanXuat),
    ghiChuModel: optional(data.ghiChuModel),
    tuyen: optional(data.tuyen),
    daiLyId: optional(data.daiLy?.id),
    daiLy: optional(data.daiLy?.label),
    dienThoai2: optional(data.dienThoai2),
    email: optional(data.email),
    kyThuatId: '',
    loiSuaChua: [],
    chiPhiDuKien: 0,
  }
}

export function buildUpdateRepairInput(
  data: RepairFormValues,
): UpdateRepairInput {
  return {
    ...buildRequiredEditableInput(data),
    diaChi: nullable(data.khachHang?.diaChi),
    soPhieuHang: nullable(data.soPhieuHang),
    soPhieuDaiLy: nullable(data.soPhieuDaiLy),
    soSerial: nullable(data.soSerial),
    khuVuc: nullable(data.khuVuc?.label),
    ngayHenTra: nullable(data.ngayHenGiao),
    phuKienKemTheo: nullable(data.phuKienKemTheo),
    ngayMua: nullable(data.ngayMua),
    noiMua: nullable(data.noiMua),
    ghiChu: nullable(data.ghiChu),
    ghiChuNhaSanXuat: nullable(data.ghiChuNhaSanXuat),
    ghiChuModel: nullable(data.ghiChuModel),
    tuyen: nullable(data.tuyen),
    daiLyId: nullable(data.daiLy?.id),
    daiLy: nullable(data.daiLy?.label),
    dienThoai2: nullable(data.dienThoai2),
    email: nullable(data.email),
  }
}
