/**
 * Chấm công (attendance exception) lookup — 5 `Loại chấm công` + 2 `Loại trừ
 * lương` from section-hr.md, plus ~120 exception records keyed to Kỳ. Unit is
 * `ngày` for leave types (1-2), `giờ` for time types (3-5). Deterministic
 * (SeededRandom seed 4007).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { KY } from './ky'

export interface LoaiCham {
  id: number
  ten: string
}

export const LOAI_CHAM: LoaiCham[] = [
  { id: 1, ten: 'Nghỉ' },
  { id: 2, ten: 'Nghỉ nữa ngày' },
  { id: 3, ten: 'Đi trễ' },
  { id: 4, ten: 'Tăng ca' },
  { id: 5, ten: 'Về sớm' },
]

export interface LoaiTru {
  id: number
  ten: string
}

export const LOAI_TRU: LoaiTru[] = [
  { id: 1, ten: 'Trừ tiền' },
  { id: 2, ten: 'Trừ ngày công' },
]

export interface ChamCong {
  id: string
  nhanVienId: string
  ngayCham: string // ISO
  kyId: string
  loaiCham: number
  soLuong: number
  donVi: 'ngày' | 'giờ'
  loaiTru: number
  createdAt: string
}

const rng = new SeededRandom(4007)
const NHAN_VIEN = Array.from(
  { length: 12 },
  (_, i) => `nv-${String(i + 1).padStart(3, '0')}`,
)

/** Recent kỳ periods only, so attendance rows stay in a plausible window. */
const RECENT_KY = KY.slice(-24)

function buildChamCong(): ChamCong[] {
  const out: ChamCong[] = []
  for (let i = 0; i < 120; i++) {
    const loaiCham = rng.pick([1, 2, 3, 4, 5])
    const ky = rng.pick(RECENT_KY)
    const day = rng.int(1, 28)
    const ngayCham = new Date(
      Date.UTC(ky.nam, ky.thang - 1, day, 2, 0, 0),
    ).toISOString()
    out.push({
      id: `cc-${String(i + 1).padStart(4, '0')}`,
      nhanVienId: rng.pick(NHAN_VIEN),
      ngayCham,
      kyId: ky.id,
      loaiCham,
      soLuong: loaiCham <= 2 ? 1 : rng.int(1, 4),
      donVi: loaiCham <= 2 ? 'ngày' : 'giờ',
      loaiTru: rng.pick([1, 2]),
      createdAt: ngayCham,
    })
  }
  return out
}

export const CHAM_CONG: ChamCong[] = buildChamCong()
