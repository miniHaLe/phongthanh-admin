/**
 * Công nợ (per-ticket receivables) lookup. Repair rows derive from live
 * MOCK_TICKETS with an actual cost (`chiPhiThucTe > 0`), plus a few synthetic
 * sales rows. Invariant: conLai = soTien - daTra (> 0). Deterministic (seed 4005).
 * P6 decides the final wiring into the finance layer.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'

export type LoaiPhieuCongNo = 'Phiếu sửa chữa' | 'Phiếu bán hàng'

export interface CongNo {
  id: string
  soPhieu: string
  loaiPhieu: LoaiPhieuCongNo
  ngayLap: string // ISO
  kyThuatId: string | null // the ticket's technician (repair rows)
  kyThuat: string | null
  soTien: number
  daTra: number
  conLai: number
  customerId: string
  dienThoai: string
}

const rng = new SeededRandom(4005)

function buildCongNo(): CongNo[] {
  const out: CongNo[] = []

  // Repair receivables from the live layer (real cost > 0).
  const repairTickets = MOCK_TICKETS.filter((t) => t.chiPhiThucTe > 0).slice(
    0,
    60,
  )
  for (const t of repairTickets) {
    const soTien = t.chiPhiThucTe
    const daTra = rng.int(0, Math.max(0, Math.floor(soTien / 100_000) - 1)) * 100_000
    out.push({
      id: `cn-sc-${t.id}`,
      soPhieu: t.soPhieu,
      loaiPhieu: 'Phiếu sửa chữa',
      ngayLap: t.ngayNhan,
      kyThuatId: t.kyThuatId,
      kyThuat: t.kyThuat,
      soTien,
      daTra,
      conLai: soTien - daTra,
      customerId: t.khachHangId,
      dienThoai: t.khachHang.sdt,
    })
  }

  // Synthetic sales receivables (no technician link).
  for (let i = 0; i < 15; i++) {
    const soTien = rng.int(5, 40) * 100_000
    const daTra = rng.int(0, Math.floor(soTien / 100_000) - 1) * 100_000
    out.push({
      id: `cn-bh-${String(i + 1).padStart(3, '0')}`,
      soPhieu: `PBH-${230000 + i}`,
      loaiPhieu: 'Phiếu bán hàng',
      ngayLap: rng.isoDateWithin(180),
      kyThuatId: null,
      kyThuat: null,
      soTien,
      daTra,
      conLai: soTien - daTra,
      customerId: `kh-bh-${String(i + 1).padStart(3, '0')}`,
      dienThoai: `09${rng.int(10000000, 99999999)}`,
    })
  }

  // Keep only rows with an outstanding balance (Công nợ = money still owed).
  return out.filter((r) => r.conLai > 0)
}

export const CONG_NO: CongNo[] = buildCongNo()
