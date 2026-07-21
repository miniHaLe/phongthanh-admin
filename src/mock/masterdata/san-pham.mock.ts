import { SeededRandom } from '@/lib/seeded-random'
import type { SanPham } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { NHOM_SAN_PHAM_ROWS } from './nhom-san-pham.mock'

const rng = new SeededRandom(1004)

// Appliance types (Sản phẩm) grouped by Nhóm sản phẩm. Names double as the
// deterministic lookup key that model.mock resolves sanPhamId against, so each
// entry here must match a `sanPham` value used in MODEL_NAMES.
const SP_NAMES: Record<string, string[]> = {
  'Điện lạnh': ['Tủ lạnh', 'Tủ đông'],
  'Bảo quản lạnh': ['Tủ mát'],
  'Giặt sấy': ['Máy giặt', 'Máy sấy quần áo'],
  'Điều hòa không khí': ['Máy điều hòa', 'Điều hòa âm trần'],
  'Điện tử nghe nhìn': ['Tivi', 'Loa kéo'],
  'Thiết bị nhà bếp': ['Lò vi sóng', 'Bếp từ', 'Lò nướng', 'Máy hút mùi'],
  'Xử lý nước': ['Máy lọc nước', 'Máy nước nóng'],
  'Đồ gia dụng nhỏ': ['Nồi cơm điện', 'Ấm siêu tốc', 'Máy xay sinh tố'],
  'Chăm sóc cá nhân': ['Máy sấy tóc'],
  'Quạt và làm mát': ['Quạt điện', 'Máy làm mát'],
  'Thiết bị sưởi': ['Máy sưởi'],
  'Vệ sinh gia dụng': ['Máy hút bụi'],
}

const allNames = Object.entries(SP_NAMES).flatMap(([nhom, names]) =>
  names.map((n) => ({ ten: n, nhom })),
)

export const SAN_PHAM_ROWS: SanPham[] = allNames.map(({ ten, nhom }, i) => {
  const nhomRow = NHOM_SAN_PHAM_ROWS.find((r) => r.tenNhomSP === nhom)
  return {
    id: `sp-${i + 1}`,
    maSP: rng.bool(0.7) ? `SP${String(i + 1).padStart(4, '0')}` : undefined,
    tenSP: ten,
    nhomSanPhamId: nhomRow?.id ?? NHOM_SAN_PHAM_ROWS[0].id,
    tienKhoan: rng.bool(0.6) ? rng.int(1, 20) * 10_000 : undefined,
    active: rng.bool(0.88),
    createdAt: rng.isoDateWithin(400),
    updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
  }
})

export const sanPhamApi = makeMockApi<SanPham>(SAN_PHAM_ROWS)
