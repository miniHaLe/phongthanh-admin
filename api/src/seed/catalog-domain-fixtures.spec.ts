import { loadFixtures } from './load-fixtures'

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

const PERSONAL_IT_TOKENS =
  /iPhone|MacBook|Galaxy|iPad|Xiaomi|AirPods|IdeaPad|Redmi|Oppo|ThinkPad|Realme|Vivo|Nokia|Huawei|Apple|Xperia|POCO|Điện thoại(?: thông minh)?|Máy tính bảng|Laptop|Máy tính|Đồng hồ thông minh|Tai nghe không dây|Pin sạc dự phòng|Cáp sạc|Ốp lưng|Kính cường lực|Bàn phím|Chuột máy tính/i

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

describe('catalog seed fixture domain', () => {
  it('uses the approved product and goods groups', () => {
    const fixtures = loadFixtures()

    expect(fixtures.nhomSanPham.map((row) => row.tenNhomSP)).toEqual(
      PRODUCT_GROUPS,
    )
    expect(fixtures.nhomHangHoa.map((row) => row.tenNhom)).toEqual(GOODS_GROUPS)
    expect(fixtures.nhomSanPham.every((row) => row.active)).toBe(true)
    expect(fixtures.nhomHangHoa.every((row) => row.active)).toBe(true)
  })

  it('assigns products and goods to their intended groups', () => {
    const fixtures = loadFixtures()
    const productGroupById = new Map(
      fixtures.nhomSanPham.map((row) => [row.id, row.tenNhomSP]),
    )
    const goodsGroupById = new Map(
      fixtures.nhomHangHoa.map((row) => [row.id, row.tenNhom]),
    )

    expect(Object.keys(PRODUCT_GROUP_BY_NAME)).toHaveLength(
      fixtures.sanPham.length,
    )
    for (const row of fixtures.sanPham) {
      expect(row.nhomSanPhamId).toBeDefined()
      expect(productGroupById.get(row.nhomSanPhamId ?? '')).toBe(
        PRODUCT_GROUP_BY_NAME[row.tenSP],
      )
    }
    expect(Object.keys(GOODS_GROUP_BY_NAME)).toHaveLength(
      fixtures.hangHoa.length,
    )
    for (const row of fixtures.hangHoa) {
      expect(goodsGroupById.get(row.nhomHangHoaId)).toBe(
        GOODS_GROUP_BY_NAME[row.tenHH],
      )
    }
  })

  it('contains no personal or IT device taxonomy', () => {
    const fixtures = loadFixtures()
    const catalogNames = [
      ...fixtures.nhomSanPham.map((row) => row.tenNhomSP),
      ...fixtures.nhomHangHoa.map((row) => row.tenNhom),
      ...fixtures.nhaSanXuat.map((row) => row.tenNSX),
      ...fixtures.sanPham.map((row) => row.tenSP),
      ...fixtures.model.map((row) => row.tenModel),
      ...fixtures.hangHoa.flatMap((row) =>
        row.tenTiengAnh ? [row.tenHH, row.tenTiengAnh] : [row.tenHH],
      ),
    ]

    for (const name of catalogNames) {
      expect(name).not.toMatch(PERSONAL_IT_TOKENS)
    }
  })
})
