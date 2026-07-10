/**
 * Single source of truth for all route paths (Cross-Cutting Convention C6).
 * nav-config, breadcrumbs, command palette, and dashboard tile hrefs all
 * import from here — no hardcoded path strings anywhere else.
 *
 * Home = /trang-chu; `/` redirects to it. Repair list = /sua-chua-bao-hanh.
 */
export const ROUTES = {
  home: '/trang-chu',

  // Repair
  repairList: '/sua-chua-bao-hanh',
  repairKt: '/sua-chua-bao-hanh-kt',
  repairDetail: (id: string) => `/sua-chua-bao-hanh/${id}`,
  repairCreate: '/sua-chua-bao-hanh/tao-moi',

  // Customers
  customers: '/khach-hang',

  // Warehouse (Quản Lý Kho)
  inventory: '/quan-ly-kho',
  inventoryStockEntry: '/quan-ly-kho/nhap-kho',
  inventoryStockView: '/quan-ly-kho/ton-kho',
  inventoryConfirmedStock: '/quan-ly-kho/ton-kho-lk-xac',
  inventoryTechStock: '/quan-ly-kho/ton-kho-ky-thuat',
  inventoryPartsRecovery: '/quan-ly-kho/thu-hoi-lk',
  inventoryPartsReturn: '/quan-ly-kho/ds-tra-lk',
  inventoryPartsReturnXac: '/quan-ly-kho/ds-tra-lk-xac',
  inventoryStockEntryCreate: '/quan-ly-kho/nhap-kho/tao-moi',

  // Stock-out (Xuất Kho)
  stockOut: '/xuat-kho',
  stockOutPartsDispatch: '/xuat-kho/cap-linh-kien',
  stockOutPartsDispatchCreate: '/xuat-kho/cap-linh-kien/tao-moi',
  stockOutSales: '/xuat-kho/ban-hang',
  stockOutSalesCreate: '/xuat-kho/ban-hang/tao-moi',
  stockOutSalesEdit: (id: string) => `/xuat-kho/ban-hang/${id}/sua`,
  stockOutReturns: '/xuat-kho/tra-hang',
  stockOutReturnsCreate: '/xuat-kho/tra-hang/tao-moi',
  stockOutTransfer: '/xuat-kho/chuyen-kho',
  stockOutTransferSameBranch: '/xuat-kho/chuyen-kho/cung-chi-nhanh',
  stockOutTransferCrossBranch: '/xuat-kho/chuyen-kho/khac-chi-nhanh',

  // Finance (Tài Chính)
  finance: '/tai-chinh',
  financeTransactions: '/tai-chinh/thu-chi',
  financeReceivables: '/tai-chinh/cong-no',
  financeInvoices: '/tai-chinh/hoa-don',
  financeInvoicesCreate: '/tai-chinh/hoa-don/tao-moi',

  // Reports (Báo Cáo)
  reports: '/bao-cao',
  reportKpi: '/bao-cao/kpi',
  reportKpiReceiving: '/bao-cao/kpi-tiep-nhan',
  reportTechnician: '/bao-cao/tinh-trang-ky-thuat',
  reportStatusGeneral: '/bao-cao/tinh-trang-chung',
  reportStagnant: '/bao-cao/may-ton',
  reportWarranty: '/bao-cao/scbh-ky-thuat',
  // Local extras kept per validation V5 (not reference-canonical)
  reportStockOut: '/bao-cao/xuat-kho',
  reportRevenue: '/bao-cao/doanh-thu',

  // Catalog (Danh Mục)
  catalog: '/danh-muc',
  catalogModel: '/danh-muc/model',
  catalogWarehouse: '/danh-muc/nha-kho',
  catalogSlot: '/danh-muc/ngan-chua',
  catalogProductGroup: '/danh-muc/nhom-hang-hoa',
  catalogGoods: '/danh-muc/hang-hoa',
  catalogGoodsCreate: '/danh-muc/hang-hoa/tao-moi',
  catalogGoodsEdit: (id: string) => `/danh-muc/hang-hoa/${id}/sua`,
  catalogManufacturer: '/danh-muc/nha-san-xuat',
  catalogProduct: '/danh-muc/san-pham',
  catalogRegion: '/danh-muc/khu-vuc',
  catalogWard: '/danh-muc/phuong-xa',
  catalogWarrantyPeriod: '/danh-muc/thoi-han',
  catalogDeliveryFee: '/danh-muc/phi-giao',
  catalogUnit: '/danh-muc/don-vi-tinh',
  catalogProductCategory: '/danh-muc/nhom-san-pham',
  catalogFaultType: '/danh-muc/loi-sua-chua',

  // HR (Nhân Sự)
  hr: '/nhan-su',
  hrBanks: '/nhan-su/ngan-hang',
  hrDepartments: '/nhan-su/phong-ban',
  hrPositions: '/nhan-su/chuc-vu',
  hrAllowances: '/nhan-su/phu-cap',
  hrBonusTypes: '/nhan-su/loai-phat-thuong',
  hrAdvances: '/nhan-su/ung-luong',
  hrEmployees: '/nhan-su/nhan-vien',
  hrEmployeeCreate: '/nhan-su/nhan-vien/tao-moi',
  hrEmployeeEdit: (id: string) => `/nhan-su/nhan-vien/${id}/sua`,
  hrPayroll: '/nhan-su/bang-luong',
  hrAttendance: '/nhan-su/cham-cong',
  hrAttendanceSummary: '/nhan-su/cham-cong-tong-hop',

  // Management (Quản Lý)
  manage: '/quan-ly',
  manageBranches: '/quan-ly/chi-nhanh',
  manageUsers: '/quan-ly/nguoi-dung',
  manageInvoices: '/quan-ly/hoa-don', // redirects → financeInvoices

  // Permissions (Phân Quyền)
  permissions: '/phan-quyen',
  permGroups: '/phan-quyen/nhom-quyen',
  permMenus: '/phan-quyen/menu',
  permFeatures: '/phan-quyen/chuc-nang',

  // Shell-accessed pages (header widgets / user menu — flat IA, no sidebar entry)
  notifications: '/thong-bao',
  news: '/tin-tuc',
  newsDetail: (id: string) => `/tin-tuc/${id}`,
  account: '/tai-khoan',

  // Auth (minimal mock — Phase 8)
  login: '/dang-nhap',
  changePassword: '/doi-mat-khau',

  // Dev
  gallery: '/gallery',
} as const

export type RouteKey = keyof typeof ROUTES
