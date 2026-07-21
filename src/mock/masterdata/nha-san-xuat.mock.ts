import { SeededRandom } from '@/lib/seeded-random'
import type { NhaSanXuat } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1002)

const BRANDS = [
  'Samsung',
  'LG',
  'Panasonic',
  'Daikin',
  'Mitsubishi Electric',
  'Sharp',
  'Toshiba',
  'Electrolux',
  'Aqua',
  'Hisense',
  'Casper',
  'Funiki',
  'Sunhouse',
  'Kangaroo',
  'Sanyo',
  'Midea',
  'Gree',
  'Beko',
  'Hitachi',
  'Comfee',
]

/** Official brand sites for the well-known hãng (others left blank).
 * Frontend-only: the backend `nha_san_xuat` table has no such column yet, so
 * `api/seed-fixtures/nha-san-xuat.json` deliberately omits this field. */
const BRAND_URLS: Record<string, string> = {
  Samsung: 'https://www.samsung.com/vn/',
  LG: 'https://www.lg.com/vn',
  Panasonic: 'https://www.panasonic.com/vn/',
  Daikin: 'https://www.daikin.com.vn/',
  'Mitsubishi Electric': 'https://www.mitsubishielectric.com/vn/',
  Sharp: 'https://vn.sharp/',
  Toshiba: 'https://www.toshiba-lifestyle.com/vn/',
  Electrolux: 'https://www.electrolux.vn/',
  Aqua: 'https://www.aquavietnam.com.vn/',
  Hisense: 'https://hisense.com.vn/',
}

export const NHA_SAN_XUAT_ROWS: NhaSanXuat[] = BRANDS.map((ten, i) => ({
  id: `nsx-${i + 1}`,
  maNSX: rng.bool(0.7) ? `NSX${String(i + 1).padStart(3, '0')}` : undefined,
  tenNSX: ten,
  ghiChu: rng.bool(0.2) ? 'Đối tác chính hãng' : undefined,
  duongDanHang: BRAND_URLS[ten],
  active: rng.bool(0.9),
  createdAt: rng.isoDateWithin(500),
  updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
}))

export const nhaSanXuatApi = makeMockApi<NhaSanXuat>(NHA_SAN_XUAT_ROWS)
