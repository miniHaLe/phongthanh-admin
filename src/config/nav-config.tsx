import {
  LayoutDashboard,
  Wrench,
  Users,
  Warehouse,
  PackageCheck,
  Banknote,
  BarChart3,
  BookOpen,
  UserCog,
  ShieldCheck,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export interface NavChild {
  label: string
  path: string
}

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  group: 'primary' | 'admin'
  keywords?: string[]
  children?: NavChild[]
}

/**
 * Frequency-ranked flat nav (C6/C8). Paths come from ROUTES — never hardcode.
 * `children` power sub-nav tab strips; the sidebar itself stays flat (top-level
 * links only), matching the "frequency-ranked flat" IA decision.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    path: ROUTES.home,
    icon: LayoutDashboard,
    group: 'primary',
    keywords: ['dashboard', 'tong quan', 'trang chu'],
  },
  {
    id: 'repair',
    label: 'Sửa Chữa-Bảo Hành',
    path: ROUTES.repairList,
    icon: Wrench,
    group: 'primary',
    keywords: ['phieu', 'sua chua', 'bao hanh', 'repair'],
  },
  {
    id: 'repair-kt',
    label: 'Sửa Chữa-Bảo Hành KT',
    path: ROUTES.repairKt,
    icon: Wrench,
    group: 'primary',
    keywords: ['phieu kt', 'sua chua ky thuat', 'repair kt'],
  },
  {
    id: 'customers',
    label: 'Khách Hàng',
    path: ROUTES.customers,
    icon: Users,
    group: 'primary',
    keywords: ['khach hang', 'customer'],
  },
  {
    id: 'inventory',
    label: 'Quản Lý Kho',
    path: ROUTES.inventory,
    icon: Warehouse,
    group: 'primary',
    keywords: ['kho', 'ton kho', 'nhap kho'],
    children: [
      { label: 'Nhập kho', path: ROUTES.inventoryStockEntry },
      { label: 'Tồn kho', path: ROUTES.inventoryStockView },
      { label: 'Tồn kho LK xác', path: ROUTES.inventoryConfirmedStock },
      { label: 'Tồn kho kỹ thuật', path: ROUTES.inventoryTechStock },
      { label: 'Danh sách sử dụng linh kiện', path: ROUTES.inventoryPartsRecovery },
      { label: 'DS trả LK', path: ROUTES.inventoryPartsReturn },
      { label: 'DS trả LK xác', path: ROUTES.inventoryPartsReturnXac },
    ],
  },
  {
    id: 'stock-out',
    label: 'Xuất Kho',
    path: ROUTES.stockOut,
    icon: PackageCheck,
    group: 'primary',
    keywords: ['xuat kho', 'ban hang', 'chuyen kho'],
    children: [
      { label: 'Cấp linh kiện', path: ROUTES.stockOutPartsDispatch },
      { label: 'Bán hàng', path: ROUTES.stockOutSales },
      { label: 'Trả hàng', path: ROUTES.stockOutReturns },
      { label: 'Chuyển kho', path: ROUTES.stockOutTransfer },
    ],
  },
  {
    id: 'finance',
    label: 'Tài Chính',
    path: ROUTES.finance,
    icon: Banknote,
    group: 'primary',
    keywords: ['tai chinh', 'thu chi', 'cong no', 'hoa don'],
    children: [
      { label: 'Thu chi', path: ROUTES.financeTransactions },
      { label: 'Công nợ', path: ROUTES.financeReceivables },
      { label: 'Hóa đơn', path: ROUTES.financeInvoices },
    ],
  },
  {
    id: 'reports',
    label: 'Báo Cáo',
    path: ROUTES.reports,
    icon: BarChart3,
    group: 'primary',
    keywords: ['bao cao', 'report', 'kpi'],
    children: [
      { label: 'KPI Kỹ thuật', path: ROUTES.reportKpi },
      { label: 'KPI Tiếp nhận', path: ROUTES.reportKpiReceiving },
      { label: 'Tình trạng kỹ thuật', path: ROUTES.reportTechnician },
      { label: 'Tình trạng chung', path: ROUTES.reportStatusGeneral },
      { label: 'Máy tồn', path: ROUTES.reportStagnant },
      { label: 'SCBH Kỹ thuật', path: ROUTES.reportWarranty },
      { label: 'Doanh thu', path: ROUTES.reportRevenue },
      { label: 'Xuất kho', path: ROUTES.reportStockOut },
    ],
  },
  {
    id: 'catalog',
    label: 'Danh Mục',
    path: ROUTES.catalog,
    icon: BookOpen,
    group: 'admin',
    keywords: ['danh muc', 'catalog', 'model', 'hang hoa'],
    children: [
      { label: 'Model', path: ROUTES.catalogModel },
      { label: 'Nhà kho', path: ROUTES.catalogWarehouse },
      { label: 'Ngăn chứa', path: ROUTES.catalogSlot },
      { label: 'Nhóm hàng hóa', path: ROUTES.catalogProductGroup },
      { label: 'Hàng hóa', path: ROUTES.catalogGoods },
      { label: 'Nhà sản xuất', path: ROUTES.catalogManufacturer },
      { label: 'Sản phẩm', path: ROUTES.catalogProduct },
      { label: 'Khu vực', path: ROUTES.catalogRegion },
      { label: 'Phường/Xã', path: ROUTES.catalogWard },
      { label: 'Thời hạn', path: ROUTES.catalogWarrantyPeriod },
      { label: 'Phí giao', path: ROUTES.catalogDeliveryFee },
      { label: 'Đơn vị tính', path: ROUTES.catalogUnit },
      { label: 'Nhóm sản phẩm', path: ROUTES.catalogProductCategory },
      { label: 'Lỗi sửa chữa', path: ROUTES.catalogFaultType },
    ],
  },
  {
    id: 'hr',
    label: 'Nhân Sự',
    path: ROUTES.hr,
    icon: UserCog,
    group: 'admin',
    keywords: ['nhan su', 'nhan vien', 'luong', 'cham cong'],
    children: [
      { label: 'Ngân hàng', path: ROUTES.hrBanks },
      { label: 'Phòng ban', path: ROUTES.hrDepartments },
      { label: 'Chức vụ', path: ROUTES.hrPositions },
      { label: 'Phụ cấp', path: ROUTES.hrAllowances },
      { label: 'Loại phạt/thưởng', path: ROUTES.hrBonusTypes },
      { label: 'Ứng lương', path: ROUTES.hrAdvances },
      { label: 'Nhân viên', path: ROUTES.hrEmployees },
      { label: 'Bảng lương', path: ROUTES.hrPayroll },
      { label: 'Chấm công', path: ROUTES.hrAttendance },
      { label: 'Chấm công tổng hợp', path: ROUTES.hrAttendanceSummary },
    ],
  },
  {
    id: 'manage',
    label: 'Quản Lý',
    path: ROUTES.manage,
    icon: ShieldCheck,
    group: 'admin',
    keywords: ['quan ly', 'chi nhanh', 'nguoi dung'],
    children: [
      { label: 'Chi nhánh', path: ROUTES.manageBranches },
      { label: 'Người dùng', path: ROUTES.manageUsers },
      { label: 'Hóa đơn', path: ROUTES.manageInvoices },
    ],
  },
  {
    id: 'permissions',
    label: 'Phân Quyền',
    path: ROUTES.permissions,
    icon: Lock,
    group: 'admin',
    keywords: ['phan quyen', 'quyen', 'menu', 'chuc nang'],
    children: [
      { label: 'Nhóm quyền', path: ROUTES.permGroups },
      { label: 'Menu', path: ROUTES.permMenus },
      { label: 'Chức năng', path: ROUTES.permFeatures },
    ],
  },
]

export const PRIMARY_NAV = NAV_ITEMS.filter((n) => n.group === 'primary')
export const ADMIN_NAV = NAV_ITEMS.filter((n) => n.group === 'admin')
