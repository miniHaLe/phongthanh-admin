import { SeededRandom } from '@/lib/seeded-random'
import type { SanPham } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHOM_SAN_PHAM_ROWS } from './nhom-san-pham.mock'

const rng = new SeededRandom(1004)

const SP_NAMES: Record<string, string[]> = {
  'Điện thoại thông minh': [
    'iPhone 15',
    'iPhone 14',
    'Galaxy S24',
    'Galaxy A54',
    'Xiaomi 14',
    'Redmi Note 13',
    'Oppo Reno 11',
    'Vivo Y36',
  ],
  'Máy tính bảng': ['iPad Air', 'iPad Pro', 'Galaxy Tab S9', 'Xiaomi Pad 6'],
  Laptop: ['MacBook Air M3', 'MacBook Pro M3', 'Galaxy Book 4', 'IdeaPad 5'],
  'Đồng hồ thông minh': [
    'Apple Watch Series 9',
    'Galaxy Watch 6',
    'Xiaomi Watch S3',
  ],
  'Tai nghe không dây': ['AirPods Pro', 'Galaxy Buds 2', 'Xiaomi Buds 4'],
}

const allNames = Object.entries(SP_NAMES).flatMap(([nhom, names]) =>
  names.map((n) => ({ ten: n, nhom })),
)

export const SAN_PHAM_ROWS: SanPham[] = allNames.map(({ ten, nhom }, i) => {
  const nhomRow = NHOM_SAN_PHAM_ROWS.find((r) => r.tenNhomSP === nhom)
  return {
    id: `sp-${i + 1}`,
    maSP: rng.bool(0.7) ? `SP${String(i + 1).padStart(4, '0')}` : undefined,
    tenSP: ten,
    nhomSanPhamId: nhomRow?.id ?? NHOM_SAN_PHAM_ROWS[0].id,
    tienKhoan: rng.bool(0.6) ? rng.int(1, 20) * 10_000 : undefined,
    active: rng.bool(0.88),
    createdAt: rng.isoDateWithin(400),
    updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
  }
})

export const sanPhamApi = makeMockApi<SanPham>(SAN_PHAM_ROWS)
