/**
 * Staff seed — 30 staff records distributed across 2 branches.
 * Pages can migrate to this dataset later (additive reference data).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { CHUC_VU, PHONG_BAN } from './reference-data'
import type { BaseEntity } from './index'
import type { BranchId } from './branches'

export interface SeedStaff extends BaseEntity {
  maNV: string
  hoTen: string
  soDienThoai: string
  email: string
  branchId: BranchId
  phongBanId: string
  chucVuId: string
  luongCoBan: number
  ngayVaoLam: string
}

const rng = new SeededRandom(8002)

const HO: readonly string[] = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Bùi',
  'Đỗ',
  'Võ',
]
const TEN_THEM: readonly string[] = [
  'Văn',
  'Thị',
  'Đức',
  'Minh',
  'Thanh',
  'Quốc',
]
const TEN: readonly string[] = [
  'Hùng',
  'Hoa',
  'Dũng',
  'Tuấn',
  'Nam',
  'Anh',
  'Thảo',
  'Trang',
  'Phong',
  'Long',
  'Hiếu',
  'Khoa',
  'Sơn',
  'Bình',
  'Trung',
]

function staffName(r: SeededRandom): string {
  const ho = r.pick(HO)
  const tenThem = r.bool(0.55) ? ` ${r.pick(TEN_THEM)}` : ''
  return `${ho}${tenThem} ${r.pick(TEN)}`
}

// 20 in dak-lak, 10 in dak-nong
const BRANCH_DIST: BranchId[] = [
  ...Array(20).fill('dak-lak' as BranchId),
  ...Array(10).fill('dak-nong' as BranchId),
]

const BASE_TIMESTAMP = 1_719_792_000_000 // 2024-07-01 fixed ref

export const SEED_STAFF: SeedStaff[] = Array.from({ length: 30 }, (_, i) => {
  const branchId = BRANCH_DIST[i]
  const phongBans = PHONG_BAN.filter((p) => p.branchId === branchId)
  const phongBan = phongBans.length > 0 ? rng.pick(phongBans) : PHONG_BAN[0]
  const chucVu = rng.pick(
    CHUC_VU.filter((c) => c.id !== 'cv-gd' && c.id !== 'cv-tgd'),
  )
  const luong = rng.int(6, 20) * 500_000 // 3M – 10M VND
  const ngayVaoMs = BASE_TIMESTAMP - rng.int(30, 1800) * 86_400_000
  const ten = staffName(rng)
  const slug = ten
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '.')
  return {
    id: `nv-seed-${String(i + 1).padStart(3, '0')}`,
    maNV: `NV${String(i + 1).padStart(3, '0')}`,
    hoTen: ten,
    soDienThoai: `09${rng.int(10_000_000, 99_999_999)}`,
    email: `${slug}@phongthanh.vn`,
    branchId,
    phongBanId: phongBan.id,
    chucVuId: chucVu.id,
    luongCoBan: luong,
    ngayVaoLam: new Date(ngayVaoMs).toISOString(),
    createdAt: new Date(ngayVaoMs).toISOString(),
    updatedAt: rng.bool(0.2)
      ? new Date(ngayVaoMs + rng.int(1, 60) * 86_400_000).toISOString()
      : undefined,
    active: rng.bool(0.93),
  }
})
