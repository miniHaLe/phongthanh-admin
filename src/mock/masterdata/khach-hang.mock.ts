/**
 * KhachHang mock data — 50 seeded rows, deterministic via SeededRandom.
 * Re-modeled (CU1) onto the 9-value Nhóm khách hàng taxonomy + Tỉnh→Quận→Xã
 * location fields + Điện thoại 2 / Đại lý-Trạm / Người tạo. This is the LIVE
 * customer store the KhachHangPage list reads (not a parallel store) —
 * repair-create customers derive separately from MOCK_TICKETS.
 */
import { SeededRandom } from '@/lib/seeded-random'
import type { KhachHang } from '@/types/masterdata-types'
import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { XA } from '@/mock/seed/tinh-quan-xa'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1001)
const MOCK_REFERENCE_NOW = Date.parse('2026-07-01T00:00:00.000Z')

const HO = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Đặng',
  'Bùi',
]
const TEN = [
  'Văn An',
  'Thị Bình',
  'Hữu Cường',
  'Thị Dung',
  'Văn Em',
  'Thị Phương',
  'Văn Hùng',
  'Thị Lan',
  'Văn Minh',
  'Thị Ngọc',
  'Văn Phúc',
  'Thị Quỳnh',
  'Văn Sơn',
  'Thị Thảo',
  'Văn Tuấn',
]
const DUONG = [
  'Nguyễn Tất Thành',
  'Lê Duẩn',
  'Trần Phú',
  'Hùng Vương',
  'Đinh Tiên Hoàng',
  'Lý Thường Kiệt',
  'Phan Bội Châu',
  'Quang Trung',
  'Ngô Quyền',
  'Bà Triệu',
]
const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hữu Cường']

// "Khách lẻ" (id 1) dominates; dealer/station types are rarer.
const LOAI_WEIGHTS: Record<number, number> = {
  1: 40,
  2: 4,
  3: 4,
  4: 6,
  5: 6,
  6: 6,
  7: 6,
  8: 4,
  9: 4,
}
const LOAI_IDS = LOAI_KHACH_HANG.map((l) => l.id)
const LOAI_WEIGHT_LIST = LOAI_IDS.map((id) => LOAI_WEIGHTS[id] ?? 5)

function makePhone(): string {
  return `0${rng.int(7, 9)}${rng.int(10000000, 99999999)}`
}

/** Newest-first (default sort per reference): higher index → earlier date. */
function createdAtDescByIndex(i: number): string {
  const daysAgo = i * 3 + rng.int(0, 2)
  return rng.isoDateWithin(1, MOCK_REFERENCE_NOW - daysAgo * 86_400_000)
}

/** Built oldest-first (stable ids), then reversed to newest-first storage order. */
const rowsOldestFirst: KhachHang[] = Array.from({ length: 50 }, (_, i) => {
  const ho = rng.pick(HO)
  const ten = rng.pick(TEN)
  const soNha = rng.int(1, 250)
  const duong = rng.pick(DUONG)
  const xa = rng.pick(XA)
  const loaiKhachHangId = rng.weighted(LOAI_IDS, LOAI_WEIGHT_LIST)
  const isDaiLy = loaiKhachHangId === 2 || loaiKhachHangId === 4

  return {
    id: `kh-${i + 1}`,
    tenKH: `${ho} ${ten}`,
    dienThoai: makePhone(),
    dienThoai2: rng.bool(0.25) ? makePhone() : undefined,
    email: rng.bool(0.6) ? `kh${i + 1}@gmail.com` : undefined,
    diaChi: `${soNha} ${duong}`,
    phuongXaId: xa.id,
    quanId: xa.quanId,
    tinhId: xa.tinhId,
    loaiKhachHangId,
    // Đại lý/Trạm — only meaningful for non-dealer types linking to an
    // earlier-seeded parent dealer row; dealers themselves have no parent.
    daiLyId:
      !isDaiLy && i > 0 && rng.bool(0.15) ? `kh-${rng.int(1, i)}` : undefined,
    nguoiTao: rng.pick(NGUOI_TAO),
    ghiChu: rng.bool(0.15) ? 'Khách VIP' : undefined,
    active: true,
    createdAt: createdAtDescByIndex(i),
    updatedAt: rng.bool(0.4)
      ? rng.isoDateWithin(30, MOCK_REFERENCE_NOW)
      : undefined,
  }
})

// Newest-first storage order (reference default sort).
export const KHACH_HANG_ROWS: KhachHang[] = [...rowsOldestFirst].reverse()

export const khachHangApi = makeMockApi<KhachHang>(KHACH_HANG_ROWS)
