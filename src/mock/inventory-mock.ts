/**
 * Inventory mock data — NhapKho, TonKho, CapLinhKien, BanHang, TraHang,
 * ChuyenKho, ThuHoiLK, DsTraLK.
 * ≥50 records each, deterministic via SeededRandom.
 * TonKho: ton_cuoi_ky = ton_dau_ky + nhap - xuat (computed, stable).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import { makeMockApi } from '@/mock/masterdata'
import {
  HANG_HOA_ROWS,
  NHA_KHO_ROWS,
  NHAN_VIEN_ROWS,
  KHACH_HANG_ROWS,
} from '@/mock/masterdata'
import { BRANCHES } from '@/mock/seed/branches'
import type {
  TonKho,
  NhapKho,
  CapLinhKien,
  BanHang,
  TraHang,
  ChuyenKho,
  ThuHoiLK,
  DsTraLK,
} from '@/types/inventory-types'
import type { InventoryKpi } from '@/types/inventory-types'

// ─── Shared item catalogue ────────────────────────────────────────────────────

const HANG_HOA_SAMPLE = HANG_HOA_ROWS.slice(0, 30)
const NHA_HANG_HOA_NHOM: Record<string, string> = {
  'hh-1': 'Pin',
  'hh-2': 'Pin',
  'hh-3': 'Pin',
  'hh-4': 'Pin',
  'hh-5': 'Màn hình',
  'hh-6': 'Màn hình',
  'hh-7': 'Màn hình',
  'hh-8': 'Camera',
  'hh-9': 'Camera',
  'hh-10': 'Bo mạch',
}
function nhomOf(id: string): string {
  return NHA_HANG_HOA_NHOM[id] ?? 'Linh kiện khác'
}
const DVT_MAP: Record<string, string> = {}
HANG_HOA_ROWS.forEach((h) => {
  DVT_MAP[h.id] = 'Cái'
})

// ─── Ton Kho ─────────────────────────────────────────────────────────────────

const rngTK = new SeededRandom(3001)

export const TON_KHO_ROWS: TonKho[] = HANG_HOA_SAMPLE.map((hh, i) => {
  const kho = rngTK.pick(NHA_KHO_ROWS)
  const dauKy = rngTK.int(10, 200)
  const nhap = rngTK.int(0, 100)
  const xuat = rngTK.int(0, Math.min(nhap + dauKy, 80))
  const cuoiKy = dauKy + nhap - xuat
  return {
    id: `tk-${i + 1}`,
    hang_hoa_id: hh.id,
    ma_hang: hh.maHH,
    ten_hang: hh.tenHH,
    nhom: nhomOf(hh.id),
    dvt: DVT_MAP[hh.id] ?? 'Cái',
    kho_id: kho.id,
    ton_dau_ky: dauKy,
    nhap_trong_ky: nhap,
    xuat_trong_ky: xuat,
    ton_cuoi_ky: cuoiKy,
    gia_tri: cuoiKy * (hh.giaNhap ?? 0),
    createdAt: rngTK.isoDateWithin(365),
    active: true,
  }
})

export const tonKhoApi = makeMockApi<TonKho>(TON_KHO_ROWS)

// ─── Nhap Kho ────────────────────────────────────────────────────────────────

const rngNK = new SeededRandom(3002)

const NHA_CUNG_CAP = [
  'Công ty TNHH Điện Tử Sài Gòn',
  'Nhà cung cấp Minh Phát',
  'Công ty CP Linh Kiện Việt',
  'Đại lý Apple chính hãng',
  'Nhà nhập khẩu Samsung VN',
  'Cty TNHH Phụ Kiện Điện Thoại',
]
const TRANG_THAI_NK: Array<'Cho duyet' | 'Da duyet'> = [
  'Da duyet',
  'Da duyet',
  'Da duyet',
  'Cho duyet',
]

export const NHAP_KHO_ROWS: NhapKho[] = Array.from({ length: 55 }, (_, i) => {
  const kho = rngNK.pick(NHA_KHO_ROWS)
  const nv = rngNK.pick(NHAN_VIEN_ROWS)
  const branch = rngNK.pick(BRANCHES)
  const ngay = rngNK.isoDateWithin(180)
  const itemCount = rngNK.int(1, 5)
  const items = Array.from({ length: itemCount }, () => {
    const hh = rngNK.pick(HANG_HOA_SAMPLE)
    return {
      hang_hoa_id: hh.id,
      ten: hh.tenHH,
      so_luong: rngNK.int(1, 50),
      don_gia: hh.giaNhap ?? 0,
    }
  })
  const tongTien = items.reduce((s, it) => s + it.so_luong * it.don_gia, 0)
  const seq = String(i + 1).padStart(5, '0')

  return {
    id: `nk-phieu-${i + 1}`,
    ma: `NK-${seq}`,
    kho_id: kho.id,
    kho_ten: kho.tenNhaKho,
    nha_cung_cap: rngNK.pick(NHA_CUNG_CAP),
    ngay_nhap: ngay,
    items,
    tong_tien: tongTien,
    nguoi_tao: nv.hoTen,
    trang_thai: rngNK.pick(TRANG_THAI_NK),
    branchId: branch.id,
    createdAt: ngay,
    updatedAt: rngNK.bool(0.2) ? rngNK.isoDateWithin(30) : undefined,
    active: true,
  }
})

export const nhapKhoApi = makeMockApi<NhapKho>(NHAP_KHO_ROWS)

// ─── Cap Linh Kien ───────────────────────────────────────────────────────────

const rngCLK = new SeededRandom(3003)

export const CAP_LINH_KIEN_ROWS: CapLinhKien[] = Array.from(
  { length: 55 },
  (_, i) => {
    const nv = rngCLK.pick(NHAN_VIEN_ROWS)
    const branch = rngCLK.pick(BRANCHES)
    const ngay = rngCLK.isoDateWithin(180)
    const itemCount = rngCLK.int(1, 4)
    const items = Array.from({ length: itemCount }, () => {
      const hh = rngCLK.pick(HANG_HOA_SAMPLE)
      return {
        hang_hoa_id: hh.id,
        ten: hh.tenHH,
        so_luong: rngCLK.int(1, 5),
        don_gia: hh.giaNhap ?? 0,
      }
    })
    const tongTien = items.reduce((s, it) => s + it.so_luong * it.don_gia, 0)
    const seq = String(i + 1).padStart(5, '0')
    const scSeq = String(rngCLK.int(1, 200)).padStart(5, '0')

    return {
      id: `clk-${i + 1}`,
      ma: `CLK-${seq}`,
      phieu_sc_id: `psc-${rngCLK.int(1, 100)}`,
      phieu_sc_ma: `PSC-${scSeq}`,
      ky_thuat_vien: nv.hoTen,
      ngay_cap: ngay,
      items,
      tong_tien: tongTien,
      branchId: branch.id,
      createdAt: ngay,
      updatedAt: rngCLK.bool(0.15) ? rngCLK.isoDateWithin(30) : undefined,
      active: true,
    }
  },
)

export const capLinhKienApi = makeMockApi<CapLinhKien>(CAP_LINH_KIEN_ROWS)

// ─── Ban Hang ────────────────────────────────────────────────────────────────

const rngBH = new SeededRandom(3004)

const TRANG_THAI_BH: Array<'Cho xac nhan' | 'Da xuat' | 'Huy'> = [
  'Da xuat',
  'Da xuat',
  'Da xuat',
  'Cho xac nhan',
  'Huy',
]

export const BAN_HANG_ROWS: BanHang[] = Array.from({ length: 55 }, (_, i) => {
  const kh = rngBH.pick(KHACH_HANG_ROWS)
  const branch = rngBH.pick(BRANCHES)
  const ngay = rngBH.isoDateWithin(180)
  const itemCount = rngBH.int(1, 4)
  const items = Array.from({ length: itemCount }, () => {
    const hh = rngBH.pick(HANG_HOA_SAMPLE)
    return {
      hang_hoa_id: hh.id,
      ten: hh.tenHH,
      so_luong: rngBH.int(1, 3),
      don_gia: hh.giaBan ?? 0,
    }
  })
  const tongTien = items.reduce((s, it) => s + it.so_luong * it.don_gia, 0)
  const seq = String(i + 1).padStart(5, '0')

  return {
    id: `bh-${i + 1}`,
    ma: `BH-${seq}`,
    khach_hang_id: kh.id,
    khach_hang_ten: kh.tenKH,
    ngay_ban: ngay,
    items,
    tong_tien: tongTien,
    trang_thai: rngBH.pick(TRANG_THAI_BH),
    branchId: branch.id,
    createdAt: ngay,
    updatedAt: rngBH.bool(0.2) ? rngBH.isoDateWithin(30) : undefined,
    active: true,
  }
})

export const banHangApi = makeMockApi<BanHang>(BAN_HANG_ROWS)

// ─── Tra Hang ────────────────────────────────────────────────────────────────

const rngTH = new SeededRandom(3005)

const LY_DO_TRA = [
  'Hàng lỗi kỹ thuật',
  'Không đúng sản phẩm yêu cầu',
  'Khách hàng đổi ý',
  'Sản phẩm không tương thích',
  'Chất lượng không đảm bảo',
]

export const TRA_HANG_ROWS: TraHang[] = Array.from({ length: 52 }, (_, i) => {
  const bhSrc = rngTH.pick(BAN_HANG_ROWS)
  const branch = rngTH.pick(BRANCHES)
  const ngay = rngTH.isoDateWithin(90)
  const itemCount = rngTH.int(1, 3)
  const items = Array.from({ length: itemCount }, () => {
    const hh = rngTH.pick(HANG_HOA_SAMPLE)
    return {
      hang_hoa_id: hh.id,
      ten: hh.tenHH,
      so_luong: rngTH.int(1, 2),
      don_gia: hh.giaBan ?? 0,
    }
  })
  const tongHoan = items.reduce((s, it) => s + it.so_luong * it.don_gia, 0)
  const seq = String(i + 1).padStart(5, '0')

  return {
    id: `th-${i + 1}`,
    ma: `TH-${seq}`,
    ban_hang_id: bhSrc.id,
    khach_hang_ten: bhSrc.khach_hang_ten,
    ngay_tra: ngay,
    ly_do: rngTH.pick(LY_DO_TRA),
    items,
    tong_tien_hoan: tongHoan,
    branchId: branch.id,
    createdAt: ngay,
    updatedAt: rngTH.bool(0.1) ? rngTH.isoDateWithin(15) : undefined,
    active: true,
  }
})

export const traHangApi = makeMockApi<TraHang>(TRA_HANG_ROWS)

// ─── Chuyen Kho ──────────────────────────────────────────────────────────────

const rngCK = new SeededRandom(3006)

const TRANG_THAI_CK: Array<'Cho xac nhan' | 'Hoan thanh' | 'Huy'> = [
  'Hoan thanh',
  'Hoan thanh',
  'Cho xac nhan',
  'Huy',
]

export const CHUYEN_KHO_ROWS: ChuyenKho[] = Array.from(
  { length: 52 },
  (_, i) => {
    const nv = rngCK.pick(NHAN_VIEN_ROWS)
    const branch = rngCK.pick(BRANCHES)
    const ngay = rngCK.isoDateWithin(120)

    // Pick two distinct warehouses
    const khoArr = [...NHA_KHO_ROWS]
    const nguonIdx = rngCK.int(0, khoArr.length - 1)
    let dichIdx = rngCK.int(0, khoArr.length - 2)
    if (dichIdx >= nguonIdx) dichIdx++
    const khoNguon = khoArr[nguonIdx]
    const khoDich = khoArr[dichIdx]

    const itemCount = rngCK.int(1, 4)
    const items = Array.from({ length: itemCount }, () => {
      const hh = rngCK.pick(HANG_HOA_SAMPLE)
      return {
        hang_hoa_id: hh.id,
        ten: hh.tenHH,
        so_luong: rngCK.int(1, 20),
      }
    })
    const seq = String(i + 1).padStart(5, '0')

    return {
      id: `ck-${i + 1}`,
      ma: `CK-${seq}`,
      kho_nguon_id: khoNguon.id,
      kho_nguon_ten: khoNguon.tenNhaKho,
      kho_dich_id: khoDich.id,
      kho_dich_ten: khoDich.tenNhaKho,
      nhan_vien: nv.hoTen,
      ngay_chuyen: ngay,
      items,
      trang_thai: rngCK.pick(TRANG_THAI_CK),
      branchId: branch.id,
      createdAt: ngay,
      updatedAt: rngCK.bool(0.15) ? rngCK.isoDateWithin(20) : undefined,
      active: true,
    }
  },
)

export const chuyenKhoApi = makeMockApi<ChuyenKho>(CHUYEN_KHO_ROWS)

// ─── Thu Hoi Linh Kien ───────────────────────────────────────────────────────

const rngTHL = new SeededRandom(3007)

export const THU_HOI_LK_ROWS: ThuHoiLK[] = Array.from(
  { length: 52 },
  (_, i) => {
    const nv = rngTHL.pick(NHAN_VIEN_ROWS)
    const branch = rngTHL.pick(BRANCHES)
    const ngay = rngTHL.isoDateWithin(120)
    const itemCount = rngTHL.int(1, 3)
    const items = Array.from({ length: itemCount }, () => {
      const hh = rngTHL.pick(HANG_HOA_SAMPLE)
      return {
        hang_hoa_id: hh.id,
        ten: hh.tenHH,
        so_luong: rngTHL.int(1, 3),
      }
    })
    const scSeq = String(rngTHL.int(1, 200)).padStart(5, '0')
    const seq = String(i + 1).padStart(5, '0')

    return {
      id: `thlk-${i + 1}`,
      ma: `THLK-${seq}`,
      phieu_sc_id: `psc-${rngTHL.int(1, 100)}`,
      phieu_sc_ma: `PSC-${scSeq}`,
      ky_thuat_vien: nv.hoTen,
      ngay_thu_hoi: ngay,
      items,
      ghi_chu: rngTHL.bool(0.4) ? 'Linh kiện còn tốt, nhập lại kho' : '',
      branchId: branch.id,
      createdAt: ngay,
      updatedAt: rngTHL.bool(0.1) ? rngTHL.isoDateWithin(15) : undefined,
      active: true,
    }
  },
)

export const thuHoiLKApi = makeMockApi<ThuHoiLK>(THU_HOI_LK_ROWS)

// ─── Danh Sach Tra Linh Kien ─────────────────────────────────────────────────

const rngDSTL = new SeededRandom(3008)

const TRANG_THAI_DSTL: Array<'Cho xac nhan' | 'Da tra' | 'Huy'> = [
  'Da tra',
  'Da tra',
  'Cho xac nhan',
  'Huy',
]
const LY_DO_TRA_LK = [
  'Lắp nhầm linh kiện',
  'Khách không đồng ý thay',
  'Linh kiện không tương thích',
  'Dư thừa sau sửa chữa',
]

export const DS_TRA_LK_ROWS: DsTraLK[] = Array.from({ length: 52 }, (_, i) => {
  const nv = rngDSTL.pick(NHAN_VIEN_ROWS)
  const branch = rngDSTL.pick(BRANCHES)
  const ngay = rngDSTL.isoDateWithin(120)
  const clkSrc = rngDSTL.pick(CAP_LINH_KIEN_ROWS)
  const itemCount = rngDSTL.int(1, 3)
  const items = Array.from({ length: itemCount }, () => {
    const hh = rngDSTL.pick(HANG_HOA_SAMPLE)
    return {
      hang_hoa_id: hh.id,
      ten: hh.tenHH,
      so_luong: rngDSTL.int(1, 2),
    }
  })
  const seq = String(i + 1).padStart(5, '0')

  return {
    id: `dstlk-${i + 1}`,
    ma: `DSTLK-${seq}`,
    cap_lk_id: clkSrc.id,
    cap_lk_ma: clkSrc.ma,
    ky_thuat_vien: nv.hoTen,
    ngay_tra: ngay,
    items,
    ly_do: rngDSTL.pick(LY_DO_TRA_LK),
    trang_thai: rngDSTL.pick(TRANG_THAI_DSTL),
    branchId: branch.id,
    createdAt: ngay,
    updatedAt: rngDSTL.bool(0.1) ? rngDSTL.isoDateWithin(15) : undefined,
    active: true,
  }
})

export const dsTraLKApi = makeMockApi<DsTraLK>(DS_TRA_LK_ROWS)

// ─── Inventory KPI mock query ─────────────────────────────────────────────────

export interface InventoryKpiParams {
  from: string
  to: string
  branchId?: string | null
  khoId?: string | null
}

export async function fetchInventoryKpi(
  params: InventoryKpiParams,
): Promise<InventoryKpi> {
  await mockDelay(400, 200)
  maybeThrow(0.03)

  const { branchId, khoId } = params

  const rows = TON_KHO_ROWS.filter((r) => {
    const inKho = !khoId || r.kho_id === khoId
    return inKho
  })

  // NhapKho in period
  const fromMs = new Date(params.from).getTime()
  const toMs = new Date(params.to).getTime() + 86_400_000

  const nhapFiltered = NHAP_KHO_ROWS.filter((r) => {
    const d = new Date(r.ngay_nhap).getTime()
    const inPeriod = d >= fromMs && d <= toMs
    const inBranch = !branchId || r.branchId === branchId
    const inKho = !khoId || r.kho_id === khoId
    return inPeriod && inBranch && inKho && r.trang_thai === 'Da duyet'
  })

  const ton_dau_ky = rows.reduce((s, r) => s + r.ton_dau_ky, 0)
  const tong_tien_ton = rows.reduce((s, r) => s + r.gia_tri, 0)
  const tong_ton = rows.reduce((s, r) => s + r.ton_cuoi_ky, 0)

  // Suppress unused warning — nhapFiltered available for future use
  void nhapFiltered

  return {
    period: { from: params.from, to: params.to },
    kho_id: khoId ?? null,
    ton_dau_ky,
    tong_tien_ton,
    tong_ton,
  }
}
