/**
 * Mock create/update/find mutations for the Hàng Hóa full-page editor
 * (C5b). Reads/writes the already-exported, mutable `HANG_HOA_ROWS` store
 * (owned by `src/mock/masterdata/hang-hoa.mock.ts`, imported here — not
 * re-created) so the list page reflects changes immediately on refetch.
 * Module-memory only; lost on reload like every other mock mutation.
 */
import { HANG_HOA_ROWS } from '@/mock/masterdata/hang-hoa.mock'
import type { HangHoa } from '@/types/masterdata-types'

let hangHoaSeq = HANG_HOA_ROWS.length

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

export function findHangHoa(id: string): HangHoa | undefined {
  return HANG_HOA_ROWS.find((r) => r.id === id)
}

export function createHangHoa(input: HangHoaInput): HangHoa {
  hangHoaSeq += 1
  const row: HangHoa = {
    id: `hh-new-${hangHoaSeq}`,
    ...input,
    tonKho: 0,
    active: true,
    createdAt: new Date().toISOString(),
  }
  HANG_HOA_ROWS.unshift(row)
  return row
}

export function updateHangHoa(
  id: string,
  input: HangHoaInput,
): HangHoa | undefined {
  const row = HANG_HOA_ROWS.find((r) => r.id === id)
  if (!row) return undefined
  Object.assign(row, input, { updatedAt: new Date().toISOString() })
  return row
}
