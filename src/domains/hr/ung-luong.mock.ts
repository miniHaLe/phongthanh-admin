import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi, NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { KY } from '@/mock/seed/ky'
import type { UngLuong } from './types'

const rng = new SeededRandom(9004)

/** Recent kỳ periods only, so advance rows stay in a plausible window. */
const RECENT_KY = KY.slice(-12)

export const UNG_LUONG_ROWS: UngLuong[] = NHAN_VIEN_ROWS.slice(0, 18).map(
  (nv, i) => {
    const ky = rng.pick(RECENT_KY)
    const day = rng.int(1, 28)
    const ngayUng = new Date(
      Date.UTC(ky.nam, ky.thang - 1, day, 3, 0, 0),
    ).toISOString()
    return {
      id: `ul-${i + 1}`,
      nhanVienId: nv.id,
      kyId: ky.id,
      ngayUng,
      soTien: rng.int(1, 10) * 500_000,
      ghiChu: rng.bool(0.3) ? 'Ứng lương đột xuất' : undefined,
      active: true,
      createdAt: ngayUng,
      updatedAt: undefined,
    }
  },
)

export const ungLuongApi = makeMockApi<UngLuong>(UNG_LUONG_ROWS)
