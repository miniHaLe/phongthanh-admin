import type {
  KhachHangFixture,
  NguoiDungFixture,
  QuanFixture,
  XaFixture,
} from './load-fixtures'

/** Fails loud if any khach_hang row references a missing xa/quan/tinh, or any
 * nguoi_dung row references a missing chi_nhanh/nhom_quyen. The mock's
 * fixtures are frozen and pre-validated, but a seed script must never
 * silently insert an orphan (plan requirement: "fail loud"). */
export function validateFkClosure(fixtures: {
  tinhIds: Set<string>
  quan: QuanFixture[]
  xa: XaFixture[]
  chiNhanhIds: Set<string>
  nhomQuyenIds: Set<string>
  loaiKhachHangIds: Set<number>
  nguoiDung: NguoiDungFixture[]
  khachHang: KhachHangFixture[]
}): void {
  const errors: string[] = []
  const quanIds = new Set(fixtures.quan.map((q) => q.id))
  const xaIds = new Set(fixtures.xa.map((x) => x.id))
  const khachHangIds = new Set(fixtures.khachHang.map((k) => k.id))

  for (const q of fixtures.quan) {
    if (!fixtures.tinhIds.has(q.tinhId)) {
      errors.push(`quan "${q.id}" references missing tinh "${q.tinhId}"`)
    }
  }
  for (const x of fixtures.xa) {
    if (!quanIds.has(x.quanId)) {
      errors.push(`xa "${x.id}" references missing quan "${x.quanId}"`)
    }
    if (!fixtures.tinhIds.has(x.tinhId)) {
      errors.push(`xa "${x.id}" references missing tinh "${x.tinhId}"`)
    }
  }
  for (const nd of fixtures.nguoiDung) {
    if (!fixtures.chiNhanhIds.has(nd.chiNhanhId)) {
      errors.push(
        `nguoi_dung "${nd.id}" references missing chi_nhanh "${nd.chiNhanhId}"`,
      )
    }
    if (!fixtures.nhomQuyenIds.has(nd.nhomQuyenId)) {
      errors.push(
        `nguoi_dung "${nd.id}" references missing nhom_quyen "${nd.nhomQuyenId}"`,
      )
    }
    for (const phuId of nd.chiNhanhPhuIds ?? []) {
      if (!fixtures.chiNhanhIds.has(phuId)) {
        errors.push(
          `nguoi_dung "${nd.id}" references missing chi_nhanh_phu "${phuId}"`,
        )
      }
    }
  }
  for (const kh of fixtures.khachHang) {
    if (kh.phuongXaId && !xaIds.has(kh.phuongXaId)) {
      errors.push(
        `khach_hang "${kh.id}" references missing xa "${kh.phuongXaId}"`,
      )
    }
    if (kh.quanId && !quanIds.has(kh.quanId)) {
      errors.push(
        `khach_hang "${kh.id}" references missing quan "${kh.quanId}"`,
      )
    }
    if (kh.tinhId && !fixtures.tinhIds.has(kh.tinhId)) {
      errors.push(
        `khach_hang "${kh.id}" references missing tinh "${kh.tinhId}"`,
      )
    }
    if (!fixtures.loaiKhachHangIds.has(kh.loaiKhachHangId)) {
      errors.push(
        `khach_hang "${kh.id}" references missing loai_khach_hang "${kh.loaiKhachHangId}"`,
      )
    }
    if (kh.daiLyId && !khachHangIds.has(kh.daiLyId)) {
      errors.push(
        `khach_hang "${kh.id}" references missing dai_ly (self-FK) "${kh.daiLyId}"`,
      )
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `FK closure validation failed (${errors.length} issue(s)):\n${errors.join('\n')}`,
    )
  }
}
