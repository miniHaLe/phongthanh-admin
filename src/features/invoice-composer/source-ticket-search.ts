/**
 * Source-ticket import lookup for the invoice composer (F3b). Given a
 * "Loại phiếu thu" (Bán hàng / Phiếu sửa chữa / Nội dung khác) and a Số phiếu
 * query, resolves candidate staging lines the user can [+]-add into the
 * invoice's Hàng hóa đã thêm grid.
 */
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { BAN_HANG_ROWS } from '@/mock/inventory-mock'

export const LOAI_PHIEU_THU_OPTIONS = ['Bán hàng', 'Phiếu sửa chữa', 'Nội dung khác'] as const
export type LoaiPhieuThu = (typeof LOAI_PHIEU_THU_OPTIONS)[number]

export interface StagingLine {
  id: string
  loaiPhieu: string
  soPhieu: string
  model: string
  maHang: string
  hangHoa: string
  donViTinh: string
  soLuong: number
  donGia: number
  truVat: number
}

/** Search source documents by Số phiếu for the given Loại phiếu thu. */
export function searchSourceTickets(loaiPhieuThu: LoaiPhieuThu, soPhieu: string): StagingLine[] {
  const q = soPhieu.trim().toLowerCase()
  if (!q) return []

  if (loaiPhieuThu === 'Phiếu sửa chữa') {
    return MOCK_TICKETS.filter((t) => t.soPhieu.toLowerCase().includes(q))
      .slice(0, 10)
      .map((t) => ({
        id: `staging-sc-${t.id}`,
        loaiPhieu: 'Phiếu sửa chữa',
        soPhieu: t.soPhieu,
        model: t.tenSanPham,
        maHang: t.modelId,
        hangHoa: `Sửa chữa ${t.tenSanPham}`,
        donViTinh: 'Cái',
        soLuong: 1,
        donGia: t.chiPhiThucTe || t.chiPhiDuKien,
        truVat: 0,
      }))
  }

  if (loaiPhieuThu === 'Bán hàng') {
    return BAN_HANG_ROWS.filter((b) => b.ma.toLowerCase().includes(q))
      .slice(0, 10)
      .flatMap((b) =>
        b.items.map((it, idx) => ({
          id: `staging-bh-${b.id}-${idx}`,
          loaiPhieu: 'Bán hàng',
          soPhieu: b.ma,
          model: '',
          maHang: it.hang_hoa_id,
          hangHoa: it.ten,
          donViTinh: 'Cái',
          soLuong: it.so_luong,
          donGia: it.don_gia,
          truVat: 0,
        })),
      )
  }

  // "Nội dung khác" has no backing source document — return a single blank
  // editable staging row seeded from the typed Số phiếu so the user can fill
  // in Hàng hóa/Đơn giá manually before [+]-adding.
  return [
    {
      id: `staging-khac-${q}`,
      loaiPhieu: 'Nội dung khác',
      soPhieu: soPhieu.trim(),
      model: '',
      maHang: '',
      hangHoa: '',
      donViTinh: 'Cái',
      soLuong: 1,
      donGia: 0,
      truVat: 0,
    },
  ]
}
