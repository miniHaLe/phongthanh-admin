/** Real-or-mock operations for the Hàng Hóa full-page editor. */
import { hangHoaConfig } from '@/config/crud-configs/hang-hoa.config'
import type { HangHoa } from '@/types/masterdata-types'

export interface HangHoaInput {
  nhomHangHoaId: string
  coSerial: boolean
  nhaSanXuatId?: string
  modelId?: string
  modelDungChung: boolean
  modelDungChungText?: string
  donViTinhId: string
  phatSinhTuDong: boolean
  maHH: string
  maHHPhu?: string
  tenHH: string
  tenTiengAnh?: string
  viTriLinhKien?: string
  giaMua?: number
  giaBanSi?: number
  giaBanLe?: number
  nguoiTao: string
}

export function findHangHoa(id: string): Promise<HangHoa> {
  return hangHoaConfig.mockApi.get(id)
}

export function createHangHoa(input: HangHoaInput): Promise<HangHoa> {
  return hangHoaConfig.mockApi.create({
    ...input,
    tonKho: 0,
    active: true,
  })
}

export function updateHangHoa(
  id: string,
  input: HangHoaInput,
): Promise<HangHoa> {
  return hangHoaConfig.mockApi.update(id, input)
}
