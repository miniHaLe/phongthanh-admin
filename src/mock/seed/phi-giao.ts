/**
 * Phí giao (delivery fee) lookup — linked to Sản phẩm (product type), 3-value
 * `Loại phí` (section-catalog-b). NOT linked to Khu vực. Deterministic
 * (SeededRandom seed 4009).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { SAN_PHAM } from './reference-data'

export interface LoaiPhi {
  id: number
  ten: string
}

export const LOAI_PHI: LoaiPhi[] = [
  { id: 1, ten: 'Cộng' },
  { id: 2, ten: 'Trừ' },
  { id: 3, ten: 'Công' },
]

export interface PhiGiao {
  id: string
  sanPhamId: string | null // null = "Không chọn"
  tenPhi: string
  soTien: number
  loaiPhi: number
  ghiChu: string
}

const rng = new SeededRandom(4009)

function buildPhiGiao(): PhiGiao[] {
  const out: PhiGiao[] = []
  for (let i = 0; i < 40; i++) {
    // ~15% of rows are unlinked ("Không chọn").
    const sp = rng.bool(0.85) ? rng.pick(SAN_PHAM) : null
    out.push({
      id: `pg-${String(i + 1).padStart(3, '0')}`,
      sanPhamId: sp ? sp.id : null,
      tenPhi: sp ? `Phí giao ${sp.ten}` : 'Phí giao chung',
      soTien: rng.int(1, 10) * 20_000,
      loaiPhi: rng.pick([1, 2, 3]),
      ghiChu: rng.bool(0.3) ? 'Áp dụng trong nội thành' : '',
    })
  }
  return out
}

export const PHI_GIAO: PhiGiao[] = buildPhiGiao()
