import { SeededRandom } from '@/lib/seeded-random'
import type { NhanVien } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { CHI_NHANH_ROWS } from './chi-nhanh.mock'
import { PHONG_BAN_ROWS } from './phong-ban.mock'
import { CHUC_VU_ROWS } from './chuc-vu.mock'

const rng = new SeededRandom(1011)

const HO = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Phan',
  'Vũ',
  'Đặng',
  'Bùi',
  'Đỗ',
]
const TEN = [
  'Văn An',
  'Thị Bình',
  'Hữu Cường',
  'Thị Dung',
  'Minh Em',
  'Thị Phương',
  'Văn Hùng',
  'Thị Lan',
  'Văn Minh',
  'Thị Ngọc',
  'Văn Phúc',
  'Thị Quỳnh',
  'Văn Sơn',
  'Thị Thảo',
  'Văn Tuấn',
  'Thị Uyên',
]

// Ngân Hàng / Phụ Cấp ids referenced below mirror the id scheme minted by
// domains/hr/{ngan-hang,phu-cap}.mock.ts (`ngh-N` / `pc-N`). We reference the
// ids directly (not the row arrays) so this module never imports the HR
// domain — that domain's ung-luong mock imports NHAN_VIEN_ROWS from this
// barrel, and importing back would create a circular module cycle.
const NGAN_HANG_ID_COUNT = 8
const PHU_CAP_ID_COUNT = 6

export const NHAN_VIEN_ROWS: NhanVien[] = Array.from(
  { length: 40 },
  (_, i) => {
    const gioiTinh = rng.bool(0.5) // true = Nam, false = Nữ
    const phuCapCount = rng.int(0, 2)
    const phuCapIds = Array.from(
      { length: phuCapCount },
      () => `pc-${rng.int(1, PHU_CAP_ID_COUNT)}`,
    )
    return {
      id: `nv-${i + 1}`,
      maNV: `NV${String(i + 1).padStart(4, '0')}`,
      hoTen: `${rng.pick(HO)} ${rng.pick(TEN)}`,
      gioiTinh,
      photo: rng.bool(0.4) ? `/mock/nv-avatars/nv-${i + 1}.jpg` : undefined,
      ngaySinh: rng.bool(0.8)
        ? rng.isoDateWithin(365 * 35, Date.now() - 365 * 20 * 86400000)
        : undefined,
      soDienThoai: rng.bool(0.9)
        ? `0${rng.int(7, 9)}${rng.int(10000000, 99999999)}`
        : undefined,
      soDienThoai2: rng.bool(0.2)
        ? `0${rng.int(7, 9)}${rng.int(10000000, 99999999)}`
        : undefined,
      email: rng.bool(0.6) ? `nv${i + 1}@phongthanh.vn` : undefined,
      thuongTru: rng.bool(0.5) ? 'Buôn Ma Thuột, Đắk Lắk' : undefined,
      chiNhanhId: rng.pick(CHI_NHANH_ROWS).id,
      phongBanId: rng.pick(PHONG_BAN_ROWS).id,
      chucVuId: rng.pick(CHUC_VU_ROWS).id,
      ngayLamViec: rng.isoDateWithin(1200),
      luongCoBan: rng.bool(0.85) ? rng.int(5, 25) * 500000 : undefined,
      phiNhanCong: rng.bool(0.6) ? rng.int(1, 10) * 50_000 : undefined,
      hinhThucThanhToan: rng.bool(0.7) ? 'Chuyển khoản' : 'Tiền mặt',
      tienBaoHiem: rng.bool(0.7) ? rng.int(1, 5) * 200_000 : undefined,
      phuCapIds: phuCapIds.length ? phuCapIds : undefined,
      cmnd: rng.bool(0.7) ? `${rng.int(100000000, 999999999)}` : undefined,
      ngayCap: rng.bool(0.7) ? rng.isoDateWithin(2000) : undefined,
      diaChi: rng.bool(0.5) ? 'Buôn Ma Thuột, Đắk Lắk' : undefined,
      noiCap: rng.bool(0.7) ? 'CA Đắk Lắk' : undefined,
      soTaiKhoan: rng.bool(0.5)
        ? `${rng.int(1000000000, 9999999999)}`
        : undefined,
      maSoThue: rng.bool(0.2) ? `${rng.int(1000000000, 9999999999)}` : undefined,
      nganHangId: rng.bool(0.5)
        ? `ngh-${rng.int(1, NGAN_HANG_ID_COUNT)}`
        : undefined,
      nguoiLienHe: rng.bool(0.3) ? 'Người thân' : undefined,
      thongTinLienHe: rng.bool(0.3)
        ? `0${rng.int(7, 9)}${rng.int(10000000, 99999999)}`
        : undefined,
      ghiChu: undefined,
      locked: rng.bool(0.12),
      active: rng.bool(0.88),
      createdAt: rng.isoDateWithin(400),
      updatedAt: rng.bool(0.3) ? rng.isoDateWithin(60) : undefined,
    }
  },
)

export const nhanVienApi = makeMockApi<NhanVien>(NHAN_VIEN_ROWS)
