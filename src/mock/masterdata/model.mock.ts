import { SeededRandom } from '@/lib/seeded-random'
import type { Model } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { SAN_PHAM_ROWS } from './san-pham.mock'

const rng = new SeededRandom(1005)

const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hữu Cường']

const MODEL_NAMES: Record<string, string[]> = {
  Apple: [
    'iPhone 15',
    'iPhone 15 Pro',
    'iPhone 14',
    'iPhone 14 Pro',
    'iPhone 13',
    'iPad Air 5',
    'MacBook Air M2',
  ],
  Samsung: [
    'Galaxy S24',
    'Galaxy S24+',
    'Galaxy A54',
    'Galaxy A34',
    'Galaxy Tab S9',
  ],
  Xiaomi: ['Xiaomi 14', 'Redmi Note 13', 'Redmi 13C', 'POCO X6'],
  Oppo: ['Oppo Reno 11', 'Oppo A78', 'Oppo A58'],
  Vivo: ['Vivo Y36', 'Vivo V29', 'Vivo Y16'],
  Huawei: ['Huawei Nova 11', 'Huawei P60'],
  Sony: ['Xperia 1 V', 'Xperia 5 V'],
}

const rows: Model[] = []
let idx = 0
for (const [brand, models] of Object.entries(MODEL_NAMES)) {
  const nsx =
    NHA_SAN_XUAT_ROWS.find((r) => r.tenNSX === brand) ?? NHA_SAN_XUAT_ROWS[0]
  const sp = rng.pick(SAN_PHAM_ROWS)
  for (const tenModel of models) {
    idx += 1
    rows.push({
      id: `mod-${idx}`,
      tenModel,
      maModel: `MOD${String(idx).padStart(4, '0')}`,
      nhaSanXuatId: nsx.id,
      sanPhamId: sp.id,
      nguoiTao: rng.pick(NGUOI_TAO),
      ghiChu: rng.bool(0.15) ? 'Model phổ biến' : undefined,
      active: rng.bool(0.88),
      createdAt: rng.isoDateWithin(400),
      updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
    })
  }
}

export const MODEL_ROWS: Model[] = rows
export const modelApi = makeMockApi<Model>(MODEL_ROWS)
