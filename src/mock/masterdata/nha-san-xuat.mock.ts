import { SeededRandom } from '@/lib/seeded-random'
import type { NhaSanXuat } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1002)

const BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Oppo',
  'Vivo',
  'Huawei',
  'Sony',
  'LG',
  'Nokia',
  'Realme',
  'OnePlus',
  'Motorola',
  'Asus',
  'Lenovo',
  'HP',
  'Dell',
  'Acer',
  'Microsoft',
  'Google',
  'TCL',
]

export const NHA_SAN_XUAT_ROWS: NhaSanXuat[] = BRANDS.map((ten, i) => ({
  id: `nsx-${i + 1}`,
  maNSX: rng.bool(0.7) ? `NSX${String(i + 1).padStart(3, '0')}` : undefined,
  tenNSX: ten,
  ghiChu: rng.bool(0.2) ? 'Đối tác chính hãng' : undefined,
  active: rng.bool(0.9),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
}))

export const nhaSanXuatApi = makeMockApi<NhaSanXuat>(NHA_SAN_XUAT_ROWS)
