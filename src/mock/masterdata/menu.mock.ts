import { SeededRandom } from '@/lib/seeded-random'
import type { Menu } from '@/types/masterdata-types'
import { makeMockApi } from './make-mock-api'

const rng = new SeededRandom(1022)

// Top-level menus first, then children referencing parent ids. `icon` holds
// a FontAwesome class string, shown verbatim in the Icon list column
// (reference example: 'fa fa-close').
const MENU_ITEMS: Array<Omit<Menu, 'createdAt' | 'updatedAt'>> = [
  {
    id: 'menu-1',
    tenMenu: 'Trang chủ',
    duongDan: '/trang-chu',
    thuTu: 1,
    icon: 'fa fa-home',
    active: true,
  },
  {
    id: 'menu-2',
    tenMenu: 'Sửa chữa - Bảo hành',
    duongDan: '/sua-chua-bao-hanh',
    thuTu: 2,
    icon: 'fa fa-wrench',
    active: true,
  },
  {
    id: 'menu-3',
    tenMenu: 'Khách hàng',
    duongDan: '/khach-hang',
    thuTu: 3,
    icon: 'fa fa-users',
    active: true,
  },
  {
    id: 'menu-4',
    tenMenu: 'Quản lý kho',
    duongDan: '/quan-ly-kho',
    thuTu: 4,
    icon: 'fa fa-archive',
    active: true,
  },
  {
    id: 'menu-5',
    tenMenu: 'Xuất kho',
    duongDan: '/xuat-kho',
    thuTu: 5,
    icon: 'fa fa-sign-out',
    active: true,
  },
  {
    id: 'menu-6',
    tenMenu: 'Tài chính',
    duongDan: '/tai-chinh',
    thuTu: 6,
    icon: 'fa fa-money',
    active: true,
  },
  {
    id: 'menu-7',
    tenMenu: 'Báo cáo',
    duongDan: '/bao-cao',
    thuTu: 7,
    icon: 'fa fa-bar-chart',
    active: true,
  },
  {
    id: 'menu-8',
    tenMenu: 'Danh mục',
    duongDan: '/danh-muc',
    thuTu: 8,
    icon: 'fa fa-book',
    active: true,
  },
  {
    id: 'menu-9',
    tenMenu: 'Nhân sự',
    duongDan: '/nhan-su',
    thuTu: 9,
    icon: 'fa fa-id-card',
    active: true,
  },
  {
    id: 'menu-10',
    tenMenu: 'Quản lý',
    duongDan: '/quan-ly',
    thuTu: 10,
    icon: 'fa fa-cogs',
    active: true,
  },
  {
    id: 'menu-11',
    tenMenu: 'Phân quyền',
    duongDan: '/phan-quyen',
    thuTu: 11,
    icon: 'fa fa-lock',
    active: true,
  },
  // Children
  {
    id: 'menu-12',
    tenMenu: 'Nhập kho',
    duongDan: '/quan-ly-kho/nhap-kho',
    thuTu: 1,
    parentId: 'menu-4',
    icon: 'fa fa-download',
    active: true,
  },
  {
    id: 'menu-13',
    tenMenu: 'Tồn kho',
    duongDan: '/quan-ly-kho/ton-kho',
    thuTu: 2,
    parentId: 'menu-4',
    icon: 'fa fa-cubes',
    active: true,
  },
  {
    id: 'menu-14',
    tenMenu: 'Thu chi',
    duongDan: '/tai-chinh/thu-chi',
    thuTu: 1,
    parentId: 'menu-6',
    icon: 'fa fa-exchange',
    active: true,
  },
  {
    id: 'menu-15',
    tenMenu: 'Hóa đơn',
    duongDan: '/tai-chinh/hoa-don',
    thuTu: 2,
    parentId: 'menu-6',
    icon: 'fa fa-file-text',
    active: true,
  },
]

export const MENU_ROWS: Menu[] = MENU_ITEMS.map((m) => ({
  ...m,
  createdAt: rng.isoDateWithin(400),
  updatedAt: rng.bool(0.2) ? rng.isoDateWithin(60) : undefined,
}))

export const menuApi = makeMockApi<Menu>(MENU_ROWS)
