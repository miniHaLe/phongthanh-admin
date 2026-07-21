import { SeededRandom } from '@/lib/seeded-random'
import type { Model } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { SAN_PHAM_ROWS } from './san-pham.mock'

const rng = new SeededRandom(1005)

const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hữu Cường']

/** Each entry names its appliance type (`sanPham`) explicitly so `sanPhamId`
 * resolves by name against SAN_PHAM_ROWS — deterministic, no rng.pick. Brand ↔
 * appliance pairings are realistic (Daikin only makes máy điều hòa; Toshiba has
 * tủ lạnh; only làm-lạnh brands ship điều hòa …). */
type ModelDef = { ten: string; sanPham: string }

const MODEL_NAMES: Record<string, ModelDef[]> = {
  Samsung: [
    { ten: 'Inverter RT38 380L', sanPham: 'Tủ lạnh' },
    { ten: 'Family Hub RF65 650L', sanPham: 'Tủ lạnh' },
    { ten: 'WindFree 12000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'AddWash 9kg WW90', sanPham: 'Máy giặt' },
    { ten: 'Crystal UHD 55"', sanPham: 'Tivi' },
  ],
  LG: [
    { ten: 'InstaView 494L', sanPham: 'Tủ lạnh' },
    { ten: 'Dual Inverter 12000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'AI DD 10kg FV1', sanPham: 'Máy giặt' },
    { ten: 'OLED evo C3 55"', sanPham: 'Tivi' },
  ],
  Panasonic: [
    { ten: 'Inverter NR-BL340 322L', sanPham: 'Tủ lạnh' },
    { ten: 'Inverter CU/CS 9000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'Lò vi sóng NN-ST34', sanPham: 'Lò vi sóng' },
  ],
  Daikin: [
    { ten: 'Inverter FTKB 9000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'Inverter FTKZ 12000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'Âm trần FCF 18000BTU', sanPham: 'Điều hòa âm trần' },
  ],
  'Mitsubishi Electric': [
    { ten: 'MSY-JP35VF 12000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'Inverter MR-CX41 344L', sanPham: 'Tủ lạnh' },
  ],
  Sharp: [
    { ten: 'Inverter SJ-X316 287L', sanPham: 'Tủ lạnh' },
    { ten: 'Lò vi sóng R-G226', sanPham: 'Lò vi sóng' },
  ],
  Toshiba: [
    { ten: 'Inverter GR-RT435 337L', sanPham: 'Tủ lạnh' },
    { ten: 'Inverter RAS-H13 12000BTU', sanPham: 'Máy điều hòa' },
    { ten: 'Nồi cơm RC-10VRP 1.8L', sanPham: 'Nồi cơm điện' },
  ],
  Electrolux: [
    { ten: 'UltimateCare 8kg EWF', sanPham: 'Máy giặt' },
    { ten: 'Máy sấy 8kg EDV', sanPham: 'Máy sấy quần áo' },
  ],
  Aqua: [
    { ten: 'AQR-T239 235L', sanPham: 'Tủ lạnh' },
    { ten: 'Tủ đông AQF-C310 310L', sanPham: 'Tủ đông' },
  ],
  Hisense: [{ ten: '4K ULED 50"', sanPham: 'Tivi' }],
}

const rows: Model[] = []
let idx = 0
for (const [brand, models] of Object.entries(MODEL_NAMES)) {
  const nsx = NHA_SAN_XUAT_ROWS.find((r) => r.tenNSX === brand)
  if (!nsx) {
    throw new Error(`model.mock: khong tim thay nha san xuat "${brand}"`)
  }
  for (const { ten: tenModel, sanPham } of models) {
    const sp = SAN_PHAM_ROWS.find((r) => r.tenSP === sanPham)
    if (!sp) {
      throw new Error(
        `model.mock: khong tim thay san pham "${sanPham}" cho model "${tenModel}"`,
      )
    }
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
