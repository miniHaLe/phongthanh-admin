/**
 * Bảng lương — static seeded payroll rows per employee × Kỳ. The exact
 * payroll formula (technician piece pay, deductions) is unspecified, so
 * `tongLuong`/`thucLanh` are a documented simple sum of the component
 * columns rather than a derivation engine (see `computeTongLuong` /
 * `computeThucLanh` below). Only a subset of employee×kỳ pairs get a seeded
 * record — the rest render the "Tạo bảng lương" empty state, matching the
 * verified reference behavior (every employee×kỳ gets a row; only some have
 * a created payroll record).
 */
import { SeededRandom } from '@/lib/seeded-random'
import { makeMockApi, NHAN_VIEN_ROWS } from '@/mock/masterdata'
import { KY } from '@/mock/seed/ky'
import type { BangLuong } from './types'

const rng = new SeededRandom(9005)

/** Recent kỳ periods shown by default on the Bảng lương list. */
export const BANG_LUONG_RECENT_KY = KY.slice(-6)

/** Tổng lương = sum of every earning-side component column. */
export function computeTongLuong(
  r: Pick<
    BangLuong,
    | 'luongCung'
    | 'baoHiem'
    | 'phuCap'
    | 'tangCa'
    | 'ungLuong'
    | 'thuong'
    | 'congBH'
    | 'congSC'
  >,
): number {
  return (
    r.luongCung +
    r.baoHiem +
    r.phuCap +
    r.tangCa +
    r.thuong +
    r.congBH +
    r.congSC
  )
}

/** Thực lãnh = Tổng lương minus deduction-side columns (nghỉ, ứng lương, phạt). */
export function computeThucLanh(
  r: BangLuong & { tongLuong: number },
): number {
  return r.tongLuong - r.nghi - r.ungLuong - r.phat
}

function buildBangLuongRows(): BangLuong[] {
  const out: BangLuong[] = []
  let seq = 0
  // Seed a payroll record for ~70% of employee × recent-kỳ combinations —
  // the remainder stay un-created (empty money + "Tạo bảng lương" CTA).
  for (const nv of NHAN_VIEN_ROWS.slice(0, 20)) {
    for (const ky of BANG_LUONG_RECENT_KY) {
      if (!rng.bool(0.7)) continue
      seq += 1
      out.push({
        id: `bl-${seq}`,
        nhanVienId: nv.id,
        kyId: ky.id,
        luongCung: nv.luongCoBan ?? 8_000_000,
        baoHiem: rng.int(1, 5) * 200_000,
        phuCap: rng.int(1, 10) * 100_000,
        tangCa: rng.int(0, 8) * 100_000,
        nghi: rng.int(0, 3) * 100_000,
        ungLuong: rng.bool(0.4) ? rng.int(1, 10) * 500_000 : 0,
        thuong: rng.bool(0.3) ? rng.int(1, 20) * 100_000 : 0,
        phat: rng.bool(0.15) ? rng.int(1, 5) * 100_000 : 0,
        congBH: rng.int(0, 6) * 150_000,
        congSC: rng.int(0, 10) * 150_000,
        active: true,
        createdAt: rng.isoDateWithin(200),
        updatedAt: undefined,
      })
    }
  }
  return out
}

export const BANG_LUONG_ROWS: BangLuong[] = buildBangLuongRows()

export const bangLuongApi = makeMockApi<BangLuong>(BANG_LUONG_ROWS)

/** Find the seeded payroll record for one employee in one kỳ, if created. */
export function findBangLuong(
  nhanVienId: string,
  kyId: string,
): BangLuong | undefined {
  return BANG_LUONG_ROWS.find(
    (r) => r.nhanVienId === nhanVienId && r.kyId === kyId,
  )
}

/**
 * Create a payroll record for an employee × kỳ with zeroed component
 * columns (the "Tạo bảng lương" action). Returns the existing record
 * unchanged if one is already present.
 */
export function createBangLuong(nhanVienId: string, kyId: string): BangLuong {
  const existing = findBangLuong(nhanVienId, kyId)
  if (existing) return existing
  const nv = NHAN_VIEN_ROWS.find((r) => r.id === nhanVienId)
  const row: BangLuong = {
    id: `bl-${BANG_LUONG_ROWS.length + 1}`,
    nhanVienId,
    kyId,
    luongCung: nv?.luongCoBan ?? 0,
    baoHiem: 0,
    phuCap: 0,
    tangCa: 0,
    nghi: 0,
    ungLuong: 0,
    thuong: 0,
    phat: 0,
    congBH: 0,
    congSC: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
  }
  BANG_LUONG_ROWS.push(row)
  return row
}
