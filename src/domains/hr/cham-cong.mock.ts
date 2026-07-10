/**
 * Chấm công — live, mutable exception-record CRUD store. Distinct from the
 * read-only `CHAM_CONG` fixture in `@/mock/seed/cham-cong` (P1): this module
 * seeds its own rows (same shape + LOAI_CHAM/LOAI_TRU taxonomies) so
 * create/update/delete never mutate the shared P1 fixture other phases may
 * still read.
 *
 * `donVi` is derived from `loaiCham` (types 1-2 are day-based, 3-5 are
 * hour-based) rather than being a free-form form field — the create/update
 * wrapper below normalizes it after every write so a caller only ever
 * chooses `loaiCham` + `soLuong`.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi, NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { KY } from '@/mock/seed/ky'
import type { MockApi } from '@/types/crud-types'
import type { ChamCongRecord } from './types'

const rng = new SeededRandom(9006)

const RECENT_KY = KY.slice(-12)

function donViFor(loaiCham: number): ChamCongRecord['donVi'] {
  return loaiCham <= 2 ? 'ngày' : 'giờ'
}

function buildChamCongRows(): ChamCongRecord[] {
  const out: ChamCongRecord[] = []
  for (let i = 0; i < 30; i++) {
    const nv = rng.pick(NHAN_VIEN_ROWS.slice(0, 15))
    const ky = rng.pick(RECENT_KY)
    const day = rng.int(1, 28)
    const loaiCham = rng.pick([1, 2, 3, 4, 5])
    const ngayCham = new Date(
      Date.UTC(ky.nam, ky.thang - 1, day, 2, 0, 0),
    ).toISOString()
    out.push({
      id: `ccx-${i + 1}`,
      nhanVienId: nv.id,
      ngayCham,
      kyId: ky.id,
      loaiCham,
      soLuong: loaiCham <= 2 ? 1 : rng.int(1, 4),
      donVi: donViFor(loaiCham),
      loaiTru: rng.pick([1, 2]),
      active: true,
      createdAt: ngayCham,
      updatedAt: undefined,
    })
  }
  return out
}

export const CHAM_CONG_RECORD_ROWS: ChamCongRecord[] = buildChamCongRows()

const baseApi = makeMockApi<ChamCongRecord>(CHAM_CONG_RECORD_ROWS)

/** Normalize `donVi` from `loaiCham` on every write, in front of the shared factory. */
export const chamCongRecordApi: MockApi<ChamCongRecord> = {
  ...baseApi,
  create: (data) =>
    baseApi.create({
      ...data,
      donVi: donViFor(Number(data.loaiCham)),
    }),
  update: (id, data) =>
    baseApi.update(id, {
      ...data,
      ...(data.loaiCham !== undefined
        ? { donVi: donViFor(Number(data.loaiCham)) }
        : {}),
    }),
}
