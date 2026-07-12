import type {
  KhachHangFixture,
  ModelFixture,
  NguoiDungFixture,
  PhuongXaFixture,
  QuanFixture,
  TinhThanhFixture,
  XaFixture,
} from './load-fixtures'

/** Fails loud when a fixture references a missing parent. Seed data must never
 * silently insert orphaned business or administrative records. */
export function validateFkClosure(fixtures: {
  tinhIds: Set<string>
  quan: QuanFixture[]
  xa: XaFixture[]
  chiNhanhIds: Set<string>
  nhomQuyenIds: Set<string>
  loaiKhachHangIds: Set<number>
  nguoiDung: NguoiDungFixture[]
  khachHang: KhachHangFixture[]
  nhaSanXuatIds: Set<string>
  sanPhamIds: Set<string>
  nganHangIds: Set<string>
  model: ModelFixture[]
  tinhThanh: TinhThanhFixture[]
  phuongXa: PhuongXaFixture[]
  expectedProvinceCount: number
  expectedCommuneCount: number
}): void {
  const errors: string[] = []
  const quanIds = new Set(fixtures.quan.map((q) => q.id))
  const xaIds = new Set(fixtures.xa.map((x) => x.id))
  const khachHangIds = new Set(fixtures.khachHang.map((k) => k.id))
  const provinceCodes = new Set(fixtures.tinhThanh.map((p) => p.code))
  const communeCodes = new Set(fixtures.phuongXa.map((p) => p.code))

  if (fixtures.tinhThanh.length !== fixtures.expectedProvinceCount) {
    errors.push(
      `official province count ${fixtures.tinhThanh.length}, expected ${fixtures.expectedProvinceCount}`,
    )
  }
  if (fixtures.phuongXa.length !== fixtures.expectedCommuneCount) {
    errors.push(
      `official commune count ${fixtures.phuongXa.length}, expected ${fixtures.expectedCommuneCount}`,
    )
  }
  if (provinceCodes.size !== fixtures.tinhThanh.length) {
    errors.push('official province codes are not unique')
  }
  if (communeCodes.size !== fixtures.phuongXa.length) {
    errors.push('official commune codes are not unique')
  }
  for (const province of fixtures.tinhThanh) {
    if (!/^\d{2}$/.test(province.code)) {
      errors.push(`invalid province code "${province.code}"`)
    }
    if (!['city', 'province'].includes(province.type)) {
      errors.push(`invalid province type "${province.type}"`)
    }
  }
  for (const commune of fixtures.phuongXa) {
    if (!/^\d{5}$/.test(commune.code)) {
      errors.push(`invalid commune code "${commune.code}"`)
    }
    if (!provinceCodes.has(commune.provinceCode)) {
      errors.push(
        `phuong_xa "${commune.code}" references missing province "${commune.provinceCode}"`,
      )
    }
    if (!['ward', 'commune', 'special_zone'].includes(commune.type)) {
      errors.push(`invalid commune type "${commune.type}"`)
    }
  }
  for (const model of fixtures.model) {
    if (!fixtures.nhaSanXuatIds.has(model.nhaSanXuatId)) {
      errors.push(
        `model "${model.id}" references missing nha_san_xuat "${model.nhaSanXuatId}"`,
      )
    }
    if (!fixtures.sanPhamIds.has(model.sanPhamId)) {
      errors.push(
        `model "${model.id}" references missing san_pham "${model.sanPhamId}"`,
      )
    }
  }

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
