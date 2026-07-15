import type {
  HangHoaFixture,
  KhachHangFixture,
  KhuVucFixture,
  LoiSuaChuaFixture,
  ModelFixture,
  NganChuaFixture,
  NhaKhoFixture,
  NguoiDungFixture,
  PhuongXaFixture,
  QuanFixture,
  SanPhamFixture,
  SeedFixtures,
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
  nhomSanPhamIds: Set<string>
  nhomHangHoaIds: Set<string>
  nhaSanXuatIds: Set<string>
  donViTinhIds: Set<string>
  nhaKho: NhaKhoFixture[]
  phuongXa: PhuongXaFixture[]
  khuVuc: KhuVucFixture[]
  loiSuaChua: LoiSuaChuaFixture[]
  nganChua: NganChuaFixture[]
  sanPham: SanPhamFixture[]
  model: ModelFixture[]
  hangHoa: HangHoaFixture[]
}): void {
  const errors: string[] = []
  const quanIds = new Set(fixtures.quan.map((q) => q.id))
  const xaIds = new Set(fixtures.xa.map((x) => x.id))
  const khachHangIds = new Set(fixtures.khachHang.map((k) => k.id))
  const nhaKhoIds = new Set(fixtures.nhaKho.map((row) => row.id))
  const sanPhamIds = new Set(fixtures.sanPham.map((row) => row.id))
  const modelIds = new Set(fixtures.model.map((row) => row.id))

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
  for (const row of fixtures.phuongXa) {
    if (!fixtures.tinhIds.has(row.tinhId)) {
      errors.push(
        `phuong_xa "${row.id}" references missing tinh "${row.tinhId}"`,
      )
    }
    if (!quanIds.has(row.quanId)) {
      errors.push(
        `phuong_xa "${row.id}" references missing quan "${row.quanId}"`,
      )
    }
  }
  for (const row of fixtures.khuVuc) {
    if (!fixtures.tinhIds.has(row.tinhId)) {
      errors.push(
        `khu_vuc "${row.id}" references missing tinh "${row.tinhId}"`,
      )
    }
    if (!quanIds.has(row.quanId)) {
      errors.push(
        `khu_vuc "${row.id}" references missing quan "${row.quanId}"`,
      )
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
  for (const row of fixtures.sanPham) {
    if (!fixtures.nhomSanPhamIds.has(row.nhomSanPhamId)) {
      errors.push(
        `san_pham "${row.id}" references missing nhom_san_pham "${row.nhomSanPhamId}"`,
      )
    }
  }
  for (const row of fixtures.model) {
    if (!fixtures.nhaSanXuatIds.has(row.nhaSanXuatId)) {
      errors.push(
        `model "${row.id}" references missing nha_san_xuat "${row.nhaSanXuatId}"`,
      )
    }
    if (!sanPhamIds.has(row.sanPhamId)) {
      errors.push(
        `model "${row.id}" references missing san_pham "${row.sanPhamId}"`,
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
    nhomSanPhamIds: new Set(fixtures.nhomSanPham.map((row) => row.id)),
    nhomHangHoaIds: new Set(fixtures.nhomHangHoa.map((row) => row.id)),
    nhaSanXuatIds: new Set(fixtures.nhaSanXuat.map((row) => row.id)),
    donViTinhIds: new Set(fixtures.donViTinh.map((row) => row.id)),
    nhaKho: fixtures.nhaKho,
    phuongXa: fixtures.phuongXa,
    khuVuc: fixtures.khuVuc,
    loiSuaChua: fixtures.loiSuaChua,
    nganChua: fixtures.nganChua,
    sanPham: fixtures.sanPham,
    model: fixtures.model,
    hangHoa: fixtures.hangHoa,
  })
}
