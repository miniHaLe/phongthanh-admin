/**
 * Chứng từ (thu/chi voucher) lookup — 12 `Loại thu chi` + 5 `Tình trạng` from
 * section-finance.md, plus ~250 generated voucher rows. Repair-thu rows link a
 * live MOCK_TICKETS ticket. Deterministic (SeededRandom seed 4004). P6 wires
 * this into the live finance layer.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

export interface LoaiThuChi {
  id: number
  ten: string
}

export const LOAI_THU_CHI: LoaiThuChi[] = [
  { id: 1, ten: 'Phiếu Thu' },
  { id: 2, ten: 'Phiếu Chi' },
  { id: 3, ten: 'Phiếu Thu Sửa Chữa' },
  { id: 5, ten: 'Phiếu Thu Bán Hàng' },
  { id: 9, ten: 'Thu Trả Hàng Lỗi' },
  { id: 10, ten: 'Thu Khác' },
  { id: 11, ten: 'Chi Lương' },
  { id: 12, ten: 'Chi Xăng' },
  { id: 13, ten: 'Chi Trả Hàng' },
  { id: 14, ten: 'Chi Mua Hàng' },
  { id: 15, ten: 'Chi Khác' },
  { id: 16, ten: 'Chi Trả Vận Chuyển' },
]

/** Voucher-type ids that are receipts (thu) vs payments (chi). */
export const THU_TYPE_IDS = [1, 3, 5, 9, 10] as const
export const CHI_TYPE_IDS = [2, 11, 12, 13, 14, 15, 16] as const

export interface TinhTrangChungTu {
  id: number
  ten: string
}

export const TINH_TRANG_CHUNG_TU: TinhTrangChungTu[] = [
  { id: 1, ten: 'Chưa thu' },
  { id: 2, ten: 'Đã thu' },
  { id: 3, ten: 'Chưa chi' },
  { id: 4, ten: 'Đã chi' },
  { id: 5, ten: 'Đã thu ngoài' },
]

export const HINH_THUC_THU_CHI = [
  { id: 1, ten: 'Tiền mặt' },
  { id: 2, ten: 'Công nợ' },
  { id: 3, ten: 'Chuyển khoản' },
]

export interface ChungTu {
  id: string
  soChungTu: string // PTT-yyyymmdd-N (thu) | PCC-yyyymmdd-N (chi)
  loaiThuChi: number
  tinhTrang: number
  hinhThucId: number
  soPhieuScNk: string | null // links a ticket for repair-thu rows
  kyThuatId: string | null
  tenKhachHang: string
  ngayLap: string // ISO
  soTien: number
  noiDung: string
  nguoiTaoId: string
  nguoiThuChiId: string | null // settled only
  ngayThuChi: string | null // settled only
}

const rng = new SeededRandom(4004)

const NGUOI_TAO = ['nv-thu-ngan-1', 'nv-thu-ngan-2', 'nv-ke-toan-1']
const NGUOI_THU_CHI = ['nv-thu-quy-1', 'nv-thu-quy-2']
const NOI_DUNG_THU = [
  'Thu tiền sửa chữa',
  'Thu tiền bán hàng',
  'Thu khác',
  'Thu trả hàng lỗi',
]
const NOI_DUNG_CHI = [
  'Chi lương nhân viên',
  'Chi tiền xăng xe',
  'Chi mua linh kiện',
  'Chi vận chuyển',
  'Chi khác',
]

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function buildChungTu(): ChungTu[] {
  const out: ChungTu[] = []
  const thuTickets = MOCK_TICKETS.filter((t) => t.chiPhiThucTe > 0)

  for (let i = 0; i < 250; i++) {
    const isThu = rng.bool(0.55)
    const loai = isThu
      ? rng.pick(THU_TYPE_IDS as readonly number[])
      : rng.pick(CHI_TYPE_IDS as readonly number[])

    // Repair-thu (Phiếu Thu Sửa Chữa, id 3) links a real ticket.
    const linkTicket = loai === 3 && thuTickets.length > 0
    const ticket = linkTicket ? rng.pick(thuTickets) : null

    const ngayLap = ticket ? ticket.ngayNhan : rng.isoDateWithin(365)

    // Thu → {Chưa thu, Đã thu, Đã thu ngoài}; Chi → {Chưa chi, Đã chi}.
    const tinhTrang = isThu
      ? rng.pick([1, 2, 5])
      : rng.pick([3, 4])
    const settled = tinhTrang === 2 || tinhTrang === 4 || tinhTrang === 5

    const seq = i + 1
    const prefix = isThu ? 'PTT' : 'PCC'
    const soChungTu = `${prefix}-${ymd(ngayLap)}-${seq}`

    out.push({
      id: `ct-${String(seq).padStart(4, '0')}`,
      soChungTu,
      loaiThuChi: loai,
      tinhTrang,
      hinhThucId: rng.pick([1, 2, 3]),
      soPhieuScNk: ticket ? ticket.soPhieu : null,
      kyThuatId: ticket ? ticket.kyThuatId : null,
      tenKhachHang: ticket ? ticket.khachHang.ten : rng.pick(NOI_DUNG_THU),
      ngayLap,
      soTien: ticket ? ticket.chiPhiThucTe : rng.int(1, 50) * 100_000,
      noiDung: isThu ? rng.pick(NOI_DUNG_THU) : rng.pick(NOI_DUNG_CHI),
      nguoiTaoId: rng.pick(NGUOI_TAO),
      nguoiThuChiId: settled ? rng.pick(NGUOI_THU_CHI) : null,
      ngayThuChi: settled
        ? new Date(
            new Date(ngayLap).getTime() + rng.int(0, 5) * 86_400_000,
          ).toISOString()
        : null,
    })
  }
  return out
}

export const CHUNG_TU: ChungTu[] = buildChungTu()
