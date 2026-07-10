import { SeededRandom } from '@/lib/seeded-random'
import type { HangHoa } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHOM_HANG_HOA_ROWS } from './nhom-hang-hoa.mock'
import { DON_VI_TINH_ROWS } from './don-vi-tinh.mock'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { MODEL_ROWS } from './model.mock'

const rng = new SeededRandom(1018)

const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hữu Cường']

const HH_NAMES: Array<[string, string]> = [
  ['Pin iPhone 15', 'iPhone 15 Battery'],
  ['Pin iPhone 14', 'iPhone 14 Battery'],
  ['Pin Samsung S24', 'Samsung S24 Battery'],
  ['Pin Xiaomi 14', 'Xiaomi 14 Battery'],
  ['Màn hình iPhone 15', 'iPhone 15 Screen'],
  ['Màn hình iPhone 14', 'iPhone 14 Screen'],
  ['Màn hình Samsung S24', 'Samsung S24 Screen'],
  ['Camera sau iPhone 15', 'iPhone 15 Rear Camera'],
  ['Camera trước Samsung A54', 'Samsung A54 Front Camera'],
  ['Bo mạch iPhone 13', 'iPhone 13 Mainboard'],
  ['Vỏ iPhone 14 Pro', 'iPhone 14 Pro Housing'],
  ['Kính lưng Samsung S23', 'Samsung S23 Back Glass'],
  ['Cáp sạc Lightning', 'Lightning Cable'],
  ['Cáp Type-C 60W', 'Type-C 60W Cable'],
  ['Sạc nhanh 65W', '65W Fast Charger'],
  ['Ốp lưng silicon', 'Silicone Case'],
  ['Kính cường lực 9H', '9H Tempered Glass'],
  ['Tai nghe Type-C', 'Type-C Earphones'],
  ['Pin dự phòng 10000mAh', '10000mAh Power Bank'],
  ['Dụng cụ mở máy', 'Opening Tool Kit'],
  ['Keo tản nhiệt', 'Thermal Paste'],
  ['Băng keo dẫn điện', 'Conductive Tape'],
  ['Vít siêu nhỏ bộ 50c', 'Micro Screw Set 50pcs'],
  ['Chổi vệ sinh mạch', 'Circuit Cleaning Brush'],
  ['Màn hình Oppo Reno 11', 'Oppo Reno 11 Screen'],
  ['Pin Vivo Y36', 'Vivo Y36 Battery'],
  ['Camera Huawei Nova 11', 'Huawei Nova 11 Camera'],
  ['Nắp lưng Xiaomi Redmi', 'Xiaomi Redmi Back Cover'],
  ['Loa ngoài iPhone', 'iPhone Loudspeaker'],
  ['Mic iPhone 15', 'iPhone 15 Microphone'],
]

export const HANG_HOA_ROWS: HangHoa[] = HH_NAMES.map(([ten, tenEn], i) => {
  const nhaSanXuat = rng.bool(0.8) ? rng.pick(NHA_SAN_XUAT_ROWS) : undefined
  const model = rng.bool(0.7) ? rng.pick(MODEL_ROWS) : undefined
  return {
    id: `hh-${i + 1}`,
    maHH: `HH${String(i + 1).padStart(5, '0')}`,
    maHHPhu: rng.bool(0.3) ? `HHP${String(i + 1).padStart(5, '0')}` : undefined,
    tenHH: ten,
    tenTiengAnh: tenEn,
    nhomHangHoaId: rng.pick(NHOM_HANG_HOA_ROWS).id,
    nhaSanXuatId: nhaSanXuat?.id,
    modelId: model?.id,
    modelDungChung: rng.bool(0.15),
    modelDungChungText: rng.bool(0.15)
      ? 'RAS-F10CJV, RAS-F13CJV, RAS-F18CJV'
      : undefined,
    donViTinhId: rng.pick(DON_VI_TINH_ROWS).id,
    coSerial: rng.bool(0.35),
    phatSinhTuDong: rng.bool(0.5),
    viTriLinhKien: rng.bool(0.4) ? 'Kệ A - Tầng 2' : undefined,
    giaMua: rng.int(5, 500) * 10000,
    giaBanSi: rng.int(6, 600) * 10000,
    giaBanLe: rng.int(8, 800) * 10000,
    nguoiTao: rng.pick(NGUOI_TAO),
    // Legacy fields kept for the inventory/warehouse/stock-out layers.
    giaNhap: rng.int(5, 500) * 10000,
    giaBan: rng.int(8, 800) * 10000,
    tonKho: rng.int(0, 150),
    active: rng.bool(0.88),
    createdAt: rng.isoDateWithin(365),
    updatedAt: rng.bool(0.4) ? rng.isoDateWithin(30) : undefined,
  }
})

export const hangHoaApi = makeMockApi<HangHoa>(HANG_HOA_ROWS)
