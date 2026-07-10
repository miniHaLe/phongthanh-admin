/**
 * Kỳ (accounting period) lookup — monthly periods labeled `M/YYYY`.
 * Spans 1/2018 → 7/2026 inclusive (103 periods). Consumed by inventory (P5)
 * and HR/finance (P6) filters and the repair "Kỳ hoàn tất" filter (P3).
 * Static generation — no PRNG needed.
 */

export interface Ky {
  id: string // `ky-YYYY-MM`
  ten: string // `M/YYYY`
  thang: number // 1-12
  nam: number
}

function buildKy(): Ky[] {
  const out: Ky[] = []
  const startYear = 2018
  const startMonth = 1
  const endYear = 2026
  const endMonth = 7
  for (let y = startYear; y <= endYear; y++) {
    const mFrom = y === startYear ? startMonth : 1
    const mTo = y === endYear ? endMonth : 12
    for (let m = mFrom; m <= mTo; m++) {
      out.push({
        id: `ky-${y}-${String(m).padStart(2, '0')}`,
        ten: `${m}/${y}`,
        thang: m,
        nam: y,
      })
    }
  }
  return out
}

export const KY: Ky[] = buildKy()

/** Default period — the latest (7/2026). */
export const KY_DEFAULT: Ky = KY[KY.length - 1]
