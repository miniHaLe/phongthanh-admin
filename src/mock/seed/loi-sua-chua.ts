/**
 * Lỗi sửa chữa (labor-price catalog) lookup — one entry per Chi nhánh × Nhóm
 * sản phẩm × common fault, each with `Tiền Công` / `Tiền Công DV`
 * (section-catalog-b). Deterministic (SeededRandom seed 4008).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { BRANCHES, type BranchId } from './branches'
import { NHOM_SAN_PHAM } from './reference-data'

export interface LoiSuaChuaGia {
  id: string
  branchId: BranchId
  nhomSanPhamId: string
  tenLoi: string
  tienCong: number
  tienCongDV: number
}

const rng = new SeededRandom(4008)

const TEN_LOI = [
  'Thay màn hình',
  'Thay pin',
  'Sửa main',
  'Vệ sinh máy',
  'Thay cảm biến',
  'Thay loa',
  'Thay camera',
  'Sửa nguồn',
]

function buildLoiSuaChua(): LoiSuaChuaGia[] {
  const out: LoiSuaChuaGia[] = []
  let seq = 0
  for (const branch of BRANCHES) {
    for (const nhom of NHOM_SAN_PHAM) {
      // 2-3 fault rows per branch × nhóm sản phẩm combination.
      const count = rng.int(2, 3)
      const faults = rng.shuffle(TEN_LOI).slice(0, count)
      for (const tenLoi of faults) {
        seq++
        out.push({
          id: `lsc-${String(seq).padStart(4, '0')}`,
          branchId: branch.id,
          nhomSanPhamId: nhom.id,
          tenLoi,
          tienCong: rng.int(1, 10) * 50_000,
          tienCongDV: rng.int(0, 6) * 50_000,
        })
      }
    }
  }
  return out
}

export const LOI_SUA_CHUA_GIA: LoiSuaChuaGia[] = buildLoiSuaChua()
