/**
 * Trả hàng (return slip) lookup — 4 `Hình thức trả` from section-stock-out.md
 * plus ~60 generated slips. Deterministic (SeededRandom seed 4006). P5 owns the
 * per-context label decision for hình thức 4.
 */
import { SeededRandom } from '@/lib/seeded-random'

export interface HinhThucTra {
  id: number
  ten: string
}

export const HINH_THUC_TRA: HinhThucTra[] = [
  { id: 1, ten: 'Trả hàng từ kỹ thuật' },
  { id: 2, ten: 'Trả hàng từ khách hàng' },
  { id: 3, ten: 'Trả hàng cho nhà cung cấp' },
  { id: 4, ten: 'Trả hàng từ kho' },
]

export interface TraHang {
  id: string
  soPhieu: string // PTH-yyyymmdd-N
  ngayTra: string // ISO
  hinhThucTra: number
  nguoiLapId: string
}

const rng = new SeededRandom(4006)
const NGUOI_LAP = ['nv-kho-1', 'nv-kho-2', 'nv-ky-thuat-1', 'nv-thu-ngan-1']

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function buildTraHang(): TraHang[] {
  const out: TraHang[] = []
  for (let i = 0; i < 60; i++) {
    const ngayTra = rng.isoDateWithin(300)
    out.push({
      id: `th-${String(i + 1).padStart(3, '0')}`,
      soPhieu: `PTH-${ymd(ngayTra)}-${i + 1}`,
      ngayTra,
      hinhThucTra: rng.pick([1, 2, 3, 4]),
      nguoiLapId: rng.pick(NGUOI_LAP),
    })
  }
  return out
}

export const TRA_HANG: TraHang[] = buildTraHang()
