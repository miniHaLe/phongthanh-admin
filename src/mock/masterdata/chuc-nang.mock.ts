import { SeededRandom } from '@/lib/seeded-random'
import type { ChucNang } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'
import { MENU_ROWS } from './menu.mock'

const rng = new SeededRandom(1023)

const STANDARD_ACTIONS: Array<[string, string]> = [
  ['Xem', 'Xem'],
  ['Thêm', 'Thêm'],
  ['Sửa', 'Sửa'],
  ['Xóa', 'Xóa'],
]

interface GroupSeed {
  ma: string
  ten: string
  moTa: string
  /** Extra action leaves beyond the standard Xem/Thêm/Sửa/Xóa set. */
  specials?: Array<[string, string]>
}

/**
 * Entity-group → action-leaf taxonomy backing the Menu function-permission
 * matrix. Each group becomes one parent ChucNang record; its actions become
 * child leaf records (parentId = group id) — mirrors the reference
 * RoleMenu tree's group/leaf structure (rebuilt since /RoleFunction/Index
 * is broken on the live server; see the "Unresolved" note in the phase spec).
 */
const GROUP_SEEDS: GroupSeed[] = [
  { ma: 'CN-G01', ten: 'Chi nhánh', moTa: 'Quản lý chi nhánh' },
  { ma: 'CN-G02', ten: 'Khách hàng', moTa: 'Quản lý khách hàng' },
  { ma: 'CN-G03', ten: 'Nhà sản xuất', moTa: 'Quản lý nhà sản xuất' },
  { ma: 'CN-G04', ten: 'Model', moTa: 'Quản lý model thiết bị' },
  { ma: 'CN-G05', ten: 'Hàng hóa', moTa: 'Quản lý hàng hóa' },
  { ma: 'CN-G06', ten: 'Sản phẩm', moTa: 'Quản lý sản phẩm' },
  {
    ma: 'CN-G07',
    ten: 'Nhập kho',
    moTa: 'Quản lý nhập kho',
    specials: [
      ['Xem tồn', 'Xem tồn'],
      ['Xem phiếu nhập hàng', 'Xem phiếu nhập hàng'],
      ['Xuât tồn excel', 'Xuât tồn excel'],
    ],
  },
  {
    ma: 'CN-G08',
    ten: 'Phiếu sửa chửa',
    moTa: 'Quản lý phiếu sửa chữa',
    specials: [
      ['Điều phối kỹ thuật', 'Điều phối kỹ thuật'],
      ['Đổi tình trạng', 'Đổi tình trạng'],
      ['Chuyển chi nhánh', 'Chuyển chi nhánh'],
      ['Xuất excel', 'Xuất excel'],
    ],
  },
  { ma: 'CN-G09', ten: 'Nhân viên', moTa: 'Quản lý nhân viên' },
  { ma: 'CN-G10', ten: 'Người dùng', moTa: 'Quản lý người dùng' },
  { ma: 'CN-G11', ten: 'Hóa đơn', moTa: 'Quản lý hóa đơn' },
  { ma: 'CN-G12', ten: 'Công nợ', moTa: 'Quản lý công nợ' },
]

const rows: ChucNang[] = []
let seq = 0

for (const group of GROUP_SEEDS) {
  seq += 1
  const groupId = `cn-${seq}`
  rows.push({
    id: groupId,
    maChucNang: group.ma,
    tenChucNang: group.ten,
    menuId: rng.pick(MENU_ROWS).id,
    moTa: group.moTa,
    active: rng.bool(0.95),
    createdAt: rng.isoDateWithin(400),
    updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
  })

  const actions = [...STANDARD_ACTIONS, ...(group.specials ?? [])]
  for (const [actionCode, actionLabel] of actions) {
    seq += 1
    rows.push({
      id: `cn-${seq}`,
      maChucNang: `${group.ma}-${actionCode.slice(0, 3).toUpperCase()}`,
      tenChucNang: `${actionLabel} ${group.ten}`,
      menuId: rng.pick(MENU_ROWS).id,
      parentId: groupId,
      moTa: `${actionLabel} chức năng ${group.ten}`,
      active: rng.bool(0.95),
      createdAt: rng.isoDateWithin(400),
      updatedAt: rng.bool(0.15) ? rng.isoDateWithin(90) : undefined,
    })
  }
}

export const CHUC_NANG_ROWS: ChucNang[] = rows

export const chucNangApi = makeMockApi<ChucNang>(CHUC_NANG_ROWS)
