import type {
  HangHoaFixture,
  KhachHangFixture,
  KhuVucFixture,
  LegacyPhuongXaFixture,
  LoiSuaChuaFixture,
  ModelFixture,
  NganChuaFixture,
  NhaKhoFixture,
  NguoiDungFixture,
  PhuongXaFixture,
  QuanFixture,
  TinhThanhFixture,
  XaFixture,
  SeedFixtures,
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
  nhomHangHoaIds: Set<string>
  donViTinhIds: Set<string>
  nhaKho: NhaKhoFixture[]
  legacyPhuongXa: LegacyPhuongXaFixture[]
  khuVuc: KhuVucFixture[]
  loiSuaChua: LoiSuaChuaFixture[]
  nganChua: NganChuaFixture[]
  hangHoa: HangHoaFixture[]
}): void {
  const errors: string[] = []
  const quanIds = new Set(fixtures.quan.map((q) => q.id))
  const xaIds = new Set(fixtures.xa.map((x) => x.id))
  const khachHangIds = new Set(fixtures.khachHang.map((k) => k.id))
  const provinceCodes = new Set(fixtures.tinhThanh.map((p) => p.code))
  const communeCodes = new Set(fixtures.phuongXa.map((p) => p.code))
  const nhaKhoIds = new Set(fixtures.nhaKho.map((row) => row.id))
  const modelIds = new Set(fixtures.model.map((row) => row.id))

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
  for (const row of fixtures.nhaKho) {
    if (!fixtures.chiNhanhIds.has(row.chiNhanhId)) {
      errors.push(
        `nha_kho "${row.id}" references missing chi_nhanh "${row.chiNhanhId}"`,
      )
    }
  }
  for (const row of fixtures.legacyPhuongXa) {
    if (!fixtures.tinhIds.has(row.tinhId)) {
      errors.push(
        `phuong_xa_legacy "${row.id}" references missing tinh "${row.tinhId}"`,
      )
    }
    if (!quanIds.has(row.quanId)) {
      errors.push(
        `phuong_xa_legacy "${row.id}" references missing quan "${row.quanId}"`,
      )
    }
  }
  for (const row of fixtures.khuVuc) {
    if (!fixtures.tinhIds.has(row.tinhId)) {
      errors.push(`khu_vuc "${row.id}" references missing tinh "${row.tinhId}"`)
    }
    if (!quanIds.has(row.quanId)) {
      errors.push(`khu_vuc "${row.id}" references missing quan "${row.quanId}"`)
    }
    if (!xaIds.has(row.xaId)) {
      errors.push(`khu_vuc "${row.id}" references missing xa "${row.xaId}"`)
    }
  }
  for (const row of fixtures.loiSuaChua) {
    if (!fixtures.chiNhanhIds.has(row.branchId)) {
      errors.push(
        `loi_sua_chua "${row.id}" references missing chi_nhanh "${row.branchId}"`,
      )
    }
  }
  for (const row of fixtures.nganChua) {
    if (!nhaKhoIds.has(row.nhaKhoId)) {
      errors.push(
        `ngan_chua "${row.id}" references missing nha_kho "${row.nhaKhoId}"`,
      )
    }
  }
  for (const row of fixtures.hangHoa) {
    if (!fixtures.nhomHangHoaIds.has(row.nhomHangHoaId)) {
      errors.push(
        `hang_hoa "${row.id}" references missing nhom_hang_hoa "${row.nhomHangHoaId}"`,
      )
    }
    if (row.nhaSanXuatId && !fixtures.nhaSanXuatIds.has(row.nhaSanXuatId)) {
      errors.push(
        `hang_hoa "${row.id}" references missing nha_san_xuat "${row.nhaSanXuatId}"`,
      )
    }
    if (row.modelId && !modelIds.has(row.modelId)) {
      errors.push(
        `hang_hoa "${row.id}" references missing model "${row.modelId}"`,
      )
    }
    if (!fixtures.donViTinhIds.has(row.donViTinhId)) {
      errors.push(
        `hang_hoa "${row.id}" references missing don_vi_tinh "${row.donViTinhId}"`,
      )
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `FK closure validation failed (${errors.length} issue(s)):\n${errors.join('\n')}`,
    )
  }
}

export function validateSeedFixtureClosure(fixtures: SeedFixtures): void {
  validateFkClosure({
    tinhIds: new Set(fixtures.tinh.map((row) => row.id)),
    quan: fixtures.quan,
    xa: fixtures.xa,
    chiNhanhIds: new Set(fixtures.chiNhanh.map((row) => row.id)),
    nhomQuyenIds: new Set(fixtures.nhomQuyen.map((row) => row.id)),
    loaiKhachHangIds: new Set(fixtures.loaiKhachHang.map((row) => row.id)),
    nguoiDung: fixtures.nguoiDung,
    khachHang: fixtures.khachHang,
    nhaSanXuatIds: new Set(fixtures.nhaSanXuat.map((row) => row.id)),
    sanPhamIds: new Set(fixtures.sanPham.map((row) => row.id)),
    nganHangIds: new Set(fixtures.nganHang.map((row) => row.id)),
    model: fixtures.model,
    tinhThanh: fixtures.tinhThanh,
    phuongXa: fixtures.phuongXa,
    expectedProvinceCount: fixtures.diaLyMetadata.counts.provinces,
    expectedCommuneCount: fixtures.diaLyMetadata.counts.communes,
    nhomHangHoaIds: new Set(fixtures.nhomHangHoa.map((row) => row.id)),
    donViTinhIds: new Set(fixtures.donViTinh.map((row) => row.id)),
    nhaKho: fixtures.nhaKho,
    legacyPhuongXa: fixtures.legacyPhuongXa,
    khuVuc: fixtures.khuVuc,
    loiSuaChua: fixtures.loiSuaChua,
    nganChua: fixtures.nganChua,
    hangHoa: fixtures.hangHoa,
  })
}
