import { SeededRandom } from '@/lib/seeded-random'
import type { HangHoa } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHOM_HANG_HOA_ROWS } from './nhom-hang-hoa.mock'
import { DON_VI_TINH_ROWS } from './don-vi-tinh.mock'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { MODEL_ROWS } from './model.mock'

const rng = new SeededRandom(1018)

const NGUOI_TAO = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hữu Cường']

// Linh kiện điện lạnh (Vietnamese, English). Generic consumables (gas, tụ,
// dây đồng…) carry no model — they fit many appliances; model-specific parts
// (block, board, motor…) derive their NSX from the picked model for coherence.
const HH_NAMES: Array<[string, string]> = [
  ['Block máy lạnh 1HP', '1HP AC Compressor'],
  ['Block tủ lạnh 1/5HP', '1/5HP Fridge Compressor'],
  ['Board điều khiển tủ lạnh', 'Fridge Control Board'],
  ['Board máy giặt cửa trước', 'Front-load Washer PCB'],
  ['Board điều hòa dàn lạnh', 'Indoor AC Control Board'],
  ['Motor máy giặt lồng đứng', 'Top-load Washer Motor'],
  ['Motor quạt dàn nóng', 'Outdoor Fan Motor'],
  ['Quạt dàn lạnh điều hòa', 'Indoor AC Blower'],
  ['Cảm biến nhiệt tủ lạnh', 'Fridge Thermistor'],
  ['Cảm biến nhiệt điều hòa', 'AC Temperature Sensor'],
  ['Van tiết lưu điện tử', 'Electronic Expansion Valve'],
  ['Rơ le nhiệt block', 'Compressor Thermal Relay'],
  ['Tụ đề block 35uF', '35uF Start Capacitor'],
  ['Tụ quạt 2uF', '2uF Fan Capacitor'],
  ['Gas lạnh R32 bình 3kg', 'R32 Refrigerant 3kg'],
  ['Gas lạnh R410A bình 3kg', 'R410A Refrigerant 3kg'],
  ['Dây đồng ống đồng 6mm', '6mm Copper Pipe'],
  ['Remote điều hòa universal', 'Universal AC Remote'],
  ['Phao cảm biến máy giặt', 'Washer Water-level Sensor'],
  ['Van cấp nước máy giặt', 'Washer Inlet Valve'],
  ['Gioăng cửa tủ lạnh', 'Fridge Door Gasket'],
  ['Đèn led khoang tủ lạnh', 'Fridge LED Lamp'],
  ['Bơm xả máy giặt', 'Washer Drain Pump'],
  ['Dây curoa máy giặt', 'Washer Drive Belt'],
  ['Màng lọc điều hòa', 'AC Filter Mesh'],
  ['Ống mao dẫn tủ lạnh', 'Fridge Capillary Tube'],
  ['Sò lạnh tủ đông', 'Freezer Thermostat'],
  ['Điện trở xả đá', 'Defrost Heater'],
  ['Quạt gió lò vi sóng', 'Microwave Fan'],
  ['Mâm nhiệt nồi cơm điện', 'Rice Cooker Heating Plate'],
]

export const HANG_HOA_ROWS: HangHoa[] = HH_NAMES.map(([ten, tenEn], i) => {
  // Pick the model first, then derive NSX from it so a row that names both
  // stays coherent (model.nhaSanXuatId === row.nhaSanXuatId). Generic parts
  // (30% of rows) get an NSX-only or NSX-less assignment.
  const model = rng.bool(0.7) ? rng.pick(MODEL_ROWS) : undefined
  const nhaSanXuat = model
    ? NHA_SAN_XUAT_ROWS.find((r) => r.id === model.nhaSanXuatId)
    : rng.bool(0.7)
      ? rng.pick(NHA_SAN_XUAT_ROWS)
      : undefined
  const modelDungChung = rng.bool(0.15)
  return {
    id: `hh-${i + 1}`,
    maHH: `HH${String(i + 1).padStart(5, '0')}`,
    maHHPhu: rng.bool(0.3) ? `HHP${String(i + 1).padStart(5, '0')}` : undefined,
    tenHH: ten,
    tenTiengAnh: tenEn,
    nhomHangHoaId: rng.pick(NHOM_HANG_HOA_ROWS).id,
    nhaSanXuatId: nhaSanXuat?.id,
    modelId: model?.id,
    // Single gate: the "dùng chung" text only exists when the flag is set.
    modelDungChung,
    modelDungChungText: modelDungChung
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
