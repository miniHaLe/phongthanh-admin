import { SeededRandom } from '@/lib/seeded-random'
import type { NguoiDung } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { CHI_NHANH_ROWS } from './chi-nhanh.mock'
import { NHOM_QUYEN_ROWS } from './nhom-quyen.mock'

const rng = new SeededRandom(1013)

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Đặng']
const TEN = [
  'An',
  'Bình',
  'Cường',
  'Dung',
  'Hùng',
  'Lan',
  'Minh',
  'Ngọc',
  'Phúc',
  'Sơn',
  'Thảo',
  'Tuấn',
]
const USERNAMES = [
  'admin',
  'giamdoc',
  'ketoan1',
  'ketoan2',
  'kythuat1',
  'kythuat2',
  'kythuat3',
  'tiepnhan1',
  'tiepnhan2',
  'kho1',
  'kho2',
  'kinhdoanh1',
  'baocao1',
]

export const NGUOI_DUNG_ROWS: NguoiDung[] = USERNAMES.map((uname, i) => {
  const chiNhanh = rng.pick(CHI_NHANH_ROWS)
  return {
    id: `nd-${i + 1}`,
    tenDangNhap: uname,
    hoTen: `${rng.pick(HO)} ${rng.pick(TEN)}`,
    dienThoai: `09${rng.int(10000000, 99999999)}`,
    email: `${uname}@phongthanh.vn`,
    chiNhanhId: chiNhanh.id,
    chiNhanhPhuIds: rng.bool(0.3)
      ? CHI_NHANH_ROWS.filter((c) => c.id !== chiNhanh.id).map((c) => c.id)
      : [],
    nhomQuyenId: rng.pick(NHOM_QUYEN_ROWS).id,
    locked: rng.bool(0.15),
    lastLogin: rng.bool(0.7) ? rng.isoDateWithin(30) : undefined,
    active: rng.bool(0.9),
    createdAt: rng.isoDateWithin(400),
    updatedAt: rng.bool(0.4) ? rng.isoDateWithin(30) : undefined,
  }
})

export const nguoiDungApi = makeMockApi<NguoiDung>(NGUOI_DUNG_ROWS)
