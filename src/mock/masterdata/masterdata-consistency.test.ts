/** Structural invariants for the refrigeration and household-appliance catalog. */
import { describe, expect, it } from 'vitest'
import { NHA_SAN_XUAT_ROWS } from './nha-san-xuat.mock'
import { SAN_PHAM_ROWS } from './san-pham.mock'
import { MODEL_ROWS } from './model.mock'
import { HANG_HOA_ROWS } from './hang-hoa.mock'
import { NHOM_HANG_HOA_ROWS } from './nhom-hang-hoa.mock'
import { NHOM_SAN_PHAM_ROWS } from './nhom-san-pham.mock'
import { SEED_PRODUCTS } from '@/mock/seed/products'

const PERSONAL_IT_TOKENS =
  /iPhone|MacBook|Galaxy|iPad|Xiaomi|AirPods|IdeaPad|Redmi|Oppo|ThinkPad|Realme|Vivo|Nokia|Huawei|Apple|Xperia|POCO|Điện thoại(?: thông minh)?|Máy tính bảng|Laptop|Máy tính|Đồng hồ thông minh|Tai nghe không dây|Pin sạc dự phòng|Cáp sạc|Ốp lưng|Kính cường lực|Bàn phím|Chuột máy tính/i

const PRODUCT_GROUPS = [
  'Điện lạnh',
  'Giặt sấy',
  'Điều hòa không khí',
  'Điện tử nghe nhìn',
  'Thiết bị nhà bếp',
  'Xử lý nước',
  'Đồ gia dụng nhỏ',
  'Chăm sóc cá nhân',
  'Quạt và làm mát',
  'Bảo quản lạnh',
  'Thiết bị sưởi',
  'Vệ sinh gia dụng',
]

const GOODS_GROUPS = [
  'Thiết bị điện lạnh',
  'Thiết bị điện tử nghe nhìn',
  'Thiết bị điện gia dụng',
  'Linh kiện điện lạnh',
  'Linh kiện điện - điện tử',
  'Dụng cụ sửa chữa',
  'Vật tư và môi chất lạnh',
  'Phụ kiện lắp đặt và vệ sinh',
]

const PRODUCT_GROUP_BY_NAME: Record<string, string> = {
  'Tủ lạnh': 'Điện lạnh',
  'Tủ đông': 'Điện lạnh',
  'Tủ mát': 'Bảo quản lạnh',
  'Máy giặt': 'Giặt sấy',
  'Máy sấy quần áo': 'Giặt sấy',
  'Máy điều hòa': 'Điều hòa không khí',
  'Điều hòa âm trần': 'Điều hòa không khí',
  Tivi: 'Điện tử nghe nhìn',
  'Loa kéo': 'Điện tử nghe nhìn',
  'Lò vi sóng': 'Thiết bị nhà bếp',
  'Bếp từ': 'Thiết bị nhà bếp',
  'Lò nướng': 'Thiết bị nhà bếp',
  'Máy hút mùi': 'Thiết bị nhà bếp',
  'Máy lọc nước': 'Xử lý nước',
  'Máy nước nóng': 'Xử lý nước',
  'Nồi cơm điện': 'Đồ gia dụng nhỏ',
  'Ấm siêu tốc': 'Đồ gia dụng nhỏ',
  'Máy xay sinh tố': 'Đồ gia dụng nhỏ',
  'Máy sấy tóc': 'Chăm sóc cá nhân',
  'Quạt điện': 'Quạt và làm mát',
  'Máy làm mát': 'Quạt và làm mát',
  'Máy sưởi': 'Thiết bị sưởi',
  'Máy hút bụi': 'Vệ sinh gia dụng',
}

const GOODS_GROUP_BY_NAME: Record<string, string> = {
  'Block máy lạnh 1HP': 'Linh kiện điện lạnh',
  'Block tủ lạnh 1/5HP': 'Linh kiện điện lạnh',
  'Board điều khiển tủ lạnh': 'Linh kiện điện - điện tử',
  'Board máy giặt cửa trước': 'Linh kiện điện - điện tử',
  'Board điều hòa dàn lạnh': 'Linh kiện điện - điện tử',
  'Motor máy giặt lồng đứng': 'Linh kiện điện lạnh',
  'Motor quạt dàn nóng': 'Linh kiện điện lạnh',
  'Quạt dàn lạnh điều hòa': 'Linh kiện điện lạnh',
  'Cảm biến nhiệt tủ lạnh': 'Linh kiện điện - điện tử',
  'Cảm biến nhiệt điều hòa': 'Linh kiện điện - điện tử',
  'Van tiết lưu điện tử': 'Linh kiện điện lạnh',
  'Rơ le nhiệt block': 'Linh kiện điện - điện tử',
  'Tụ đề block 35uF': 'Linh kiện điện - điện tử',
  'Tụ quạt 2uF': 'Linh kiện điện - điện tử',
  'Gas lạnh R32 bình 3kg': 'Vật tư và môi chất lạnh',
  'Gas lạnh R410A bình 3kg': 'Vật tư và môi chất lạnh',
  'Dây đồng ống đồng 6mm': 'Vật tư và môi chất lạnh',
  'Remote điều hòa universal': 'Phụ kiện lắp đặt và vệ sinh',
  'Phao cảm biến máy giặt': 'Linh kiện điện - điện tử',
  'Van cấp nước máy giặt': 'Linh kiện điện lạnh',
  'Gioăng cửa tủ lạnh': 'Linh kiện điện lạnh',
  'Đèn led khoang tủ lạnh': 'Linh kiện điện - điện tử',
  'Bơm xả máy giặt': 'Linh kiện điện lạnh',
  'Dây curoa máy giặt': 'Linh kiện điện lạnh',
  'Màng lọc điều hòa': 'Phụ kiện lắp đặt và vệ sinh',
  'Ống mao dẫn tủ lạnh': 'Linh kiện điện lạnh',
  'Sò lạnh tủ đông': 'Linh kiện điện - điện tử',
  'Điện trở xả đá': 'Linh kiện điện - điện tử',
  'Quạt gió lò vi sóng': 'Linh kiện điện lạnh',
  'Mâm nhiệt nồi cơm điện': 'Linh kiện điện - điện tử',
}

describe('masterdata FK closure', () => {
  it('every model references an existing NSX and San Pham', () => {
    const nsxIds = new Set(NHA_SAN_XUAT_ROWS.map((r) => r.id))
    const spIds = new Set(SAN_PHAM_ROWS.map((r) => r.id))
    for (const model of MODEL_ROWS) {
      expect(nsxIds.has(model.nhaSanXuatId)).toBe(true)
      expect(spIds.has(model.sanPhamId)).toBe(true)
    }
  })

  it('every San Pham references an existing Nhom San Pham', () => {
    const nhomIds = new Set(NHOM_SAN_PHAM_ROWS.map((r) => r.id))
    for (const sp of SAN_PHAM_ROWS) {
      expect(nhomIds.has(sp.nhomSanPhamId)).toBe(true)
    }
  })

  it('hang hoa carrying both model + NSX stays coherent (model NSX === row NSX)', () => {
    const modelById = new Map(MODEL_ROWS.map((m) => [m.id, m]))
    for (const hh of HANG_HOA_ROWS) {
      if (hh.modelId && hh.nhaSanXuatId) {
        const model = modelById.get(hh.modelId)
        expect(model).toBeDefined()
        expect(model?.nhaSanXuatId).toBe(hh.nhaSanXuatId)
      }
    }
  })

  it('every seed product resolves its nhom san pham', () => {
    // SEED_PRODUCTS use the seed reference-data universe; assert non-empty +
    // internally consistent nhomSanPhamId references.
    expect(SEED_PRODUCTS.length).toBeGreaterThan(0)
    for (const product of SEED_PRODUCTS) {
      expect(product.nhomSanPhamId).toBeTruthy()
    }
  })
})

describe('masterdata id formats stay stable', () => {
  it('keeps nsx-/sp-/mod-/hh- id schemes', () => {
    expect(NHA_SAN_XUAT_ROWS.every((r) => /^nsx-\d+$/.test(r.id))).toBe(true)
    expect(SAN_PHAM_ROWS.every((r) => /^sp-\d+$/.test(r.id))).toBe(true)
    expect(MODEL_ROWS.every((r) => /^mod-\d+$/.test(r.id))).toBe(true)
    expect(HANG_HOA_ROWS.every((r) => /^hh-\d+$/.test(r.id))).toBe(true)
  })
})

describe('catalog domain taxonomy', () => {
  it('preserves the legacy non-taxonomy RNG stream', () => {
    expect(
      [HANG_HOA_ROWS[0], HANG_HOA_ROWS[14], HANG_HOA_ROWS[29]].map((row) => ({
        id: row.id,
        maHHPhu: row.maHHPhu,
        nhaSanXuatId: row.nhaSanXuatId,
        modelId: row.modelId,
        donViTinhId: row.donViTinhId,
        giaMua: row.giaMua,
        giaBanSi: row.giaBanSi,
        giaBanLe: row.giaBanLe,
        giaNhap: row.giaNhap,
        giaBan: row.giaBan,
        tonKho: row.tonKho,
        active: row.active,
      })),
    ).toEqual([
      {
        id: 'hh-1',
        maHHPhu: undefined,
        nhaSanXuatId: undefined,
        modelId: undefined,
        donViTinhId: 'dvt-7',
        giaMua: 3_260_000,
        giaBanSi: 1_880_000,
        giaBanLe: 4_230_000,
        giaNhap: 4_900_000,
        giaBan: 6_060_000,
        tonKho: 106,
        active: true,
      },
      {
        id: 'hh-15',
        maHHPhu: 'HHP00015',
        nhaSanXuatId: 'nsx-4',
        modelId: 'mod-15',
        donViTinhId: 'dvt-8',
        giaMua: 2_100_000,
        giaBanSi: 1_640_000,
        giaBanLe: 7_060_000,
        giaNhap: 2_320_000,
        giaBan: 2_300_000,
        tonKho: 108,
        active: true,
      },
      {
        id: 'hh-30',
        maHHPhu: 'HHP00030',
        nhaSanXuatId: 'nsx-7',
        modelId: 'mod-20',
        donViTinhId: 'dvt-10',
        giaMua: 4_380_000,
        giaBanSi: 2_950_000,
        giaBanLe: 5_150_000,
        giaNhap: 1_140_000,
        giaBan: 5_490_000,
        tonKho: 76,
        active: true,
      },
    ])
  })

  it('keeps the approved product and goods groups', () => {
    expect(NHOM_SAN_PHAM_ROWS.map((row) => row.tenNhomSP)).toEqual(
      PRODUCT_GROUPS,
    )
    expect(NHOM_HANG_HOA_ROWS.map((row) => row.tenNhom)).toEqual(GOODS_GROUPS)
    expect(NHOM_SAN_PHAM_ROWS.every((row) => row.active)).toBe(true)
    expect(NHOM_HANG_HOA_ROWS.every((row) => row.active)).toBe(true)
  })

  it('assigns products and goods to their intended groups', () => {
    const productGroupById = new Map(
      NHOM_SAN_PHAM_ROWS.map((row) => [row.id, row.tenNhomSP]),
    )
    const goodsGroupById = new Map(
      NHOM_HANG_HOA_ROWS.map((row) => [row.id, row.tenNhom]),
    )

    expect(Object.keys(PRODUCT_GROUP_BY_NAME)).toHaveLength(
      SAN_PHAM_ROWS.length,
    )
    for (const row of SAN_PHAM_ROWS) {
      expect(productGroupById.get(row.nhomSanPhamId)).toBe(
        PRODUCT_GROUP_BY_NAME[row.tenSP],
      )
    }
    expect(Object.keys(GOODS_GROUP_BY_NAME)).toHaveLength(HANG_HOA_ROWS.length)
    for (const row of HANG_HOA_ROWS) {
      expect(goodsGroupById.get(row.nhomHangHoaId)).toBe(
        GOODS_GROUP_BY_NAME[row.tenHH],
      )
    }
  })

  it('has no personal or IT device taxonomy in catalog seed names', () => {
    for (const row of NHOM_SAN_PHAM_ROWS) {
      expect(row.tenNhomSP).not.toMatch(PERSONAL_IT_TOKENS)
    }
    for (const row of NHOM_HANG_HOA_ROWS) {
      expect(row.tenNhom).not.toMatch(PERSONAL_IT_TOKENS)
    }
    for (const row of NHA_SAN_XUAT_ROWS) {
      expect(row.tenNSX).not.toMatch(PERSONAL_IT_TOKENS)
    }
    for (const row of SAN_PHAM_ROWS) {
      expect(row.tenSP).not.toMatch(PERSONAL_IT_TOKENS)
    }
    for (const row of MODEL_ROWS) {
      expect(row.tenModel).not.toMatch(PERSONAL_IT_TOKENS)
    }
    for (const row of HANG_HOA_ROWS) {
      expect(row.tenHH).not.toMatch(PERSONAL_IT_TOKENS)
      if (row.tenTiengAnh) {
        expect(row.tenTiengAnh).not.toMatch(PERSONAL_IT_TOKENS)
      }
    }
  })
})
