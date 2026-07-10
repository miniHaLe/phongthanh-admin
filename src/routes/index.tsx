import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
} from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AppShell from '@/components/shell/AppShell'
import StubPage from '@/pages/StubPage'
import { ROUTES } from '@/constants/routes'

// All page components are code-split via React.lazy so each section loads on
// demand (AppShell provides the Suspense boundary). Keeps the initial bundle
// small — only the shell + the first visited route are fetched up front.
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))
// Phase 8 — Mock auth (rendered outside AppShell)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('@/pages/auth/ChangePasswordPage'))
// Phase 3 — Dashboard
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
// Phase 4 — Repair workflow
const RepairListPage = lazy(
  () => import('@/features/repair-list/RepairListPage'),
)
const RepairCreatePage = lazy(
  () => import('@/features/repair-create/RepairCreatePage'),
)
const RepairDetailPage = lazy(
  () => import('@/features/repair-detail/RepairDetailPage'),
)
const RepairKtListPage = lazy(
  () => import('@/features/repair-kt/RepairKtListPage'),
)
// Phase 5 — Master data (section layouts)
const DanhMucPage = lazy(() => import('@/pages/danh-muc/DanhMucPage'))
const NhanSuPage = lazy(() => import('@/pages/nhan-su/NhanSuPage'))
const PhanQuyenPage = lazy(() => import('@/pages/phan-quyen/PhanQuyenPage'))
const QuanLyPage = lazy(() => import('@/pages/quan-ly/QuanLyPage'))
// Phase 5 — Customers (top-level)
const KhachHangPage = lazy(() => import('@/pages/danh-muc/KhachHangPage'))
// Phase 5 — Danh Mục leaves
const ModelPage = lazy(() => import('@/pages/danh-muc/ModelPage'))
const NhaKhoPage = lazy(() => import('@/pages/danh-muc/NhaKhoPage'))
const NganChuaPage = lazy(() => import('@/pages/danh-muc/NganChuaPage'))
const NhomHangHoaPage = lazy(() => import('@/pages/danh-muc/NhomHangHoaPage'))
const HangHoaPage = lazy(() => import('@/pages/danh-muc/HangHoaPage'))
const ProductEditorPage = lazy(
  () => import('@/features/product-editor/product-editor-page'),
)
const NhaSanXuatPage = lazy(() => import('@/pages/danh-muc/NhaSanXuatPage'))
const SanPhamPage = lazy(() => import('@/pages/danh-muc/SanPhamPage'))
const KhuVucPage = lazy(() => import('@/pages/danh-muc/KhuVucPage'))
const PhuongXaPage = lazy(() => import('@/pages/danh-muc/PhuongXaPage'))
const ThoiHanPage = lazy(() => import('@/pages/danh-muc/ThoiHanPage'))
const PhiGiaoPage = lazy(() => import('@/pages/danh-muc/PhiGiaoPage'))
const DonViTinhPage = lazy(() => import('@/pages/danh-muc/DonViTinhPage'))
const NhomSanPhamPage = lazy(() => import('@/pages/danh-muc/NhomSanPhamPage'))
const LoiSuaChuaPage = lazy(() => import('@/pages/danh-muc/LoiSuaChuaPage'))
// Phase 5 — Nhân Sự leaves
const NhanVienPage = lazy(() => import('@/pages/nhan-su/NhanVienPage'))
const PhongBanPage = lazy(() => import('@/pages/nhan-su/PhongBanPage'))
const ChucVuPage = lazy(() => import('@/pages/nhan-su/ChucVuPage'))
const BangLuongPage = lazy(() => import('@/pages/nhan-su/BangLuongPage'))
const ChamCongPage = lazy(() => import('@/pages/nhan-su/ChamCongPage'))
const ChamCongTongHopPage = lazy(
  () => import('@/pages/nhan-su/ChamCongTongHopPage'),
)
// Phase 6 — Nhân Sự new leaves (H1-H4) + full-page employee editor (H7b)
const NganHangPage = lazy(() => import('@/pages/nhan-su/NganHangPage'))
const PhuCapPage = lazy(() => import('@/pages/nhan-su/PhuCapPage'))
const LoaiPhatThuongPage = lazy(
  () => import('@/pages/nhan-su/LoaiPhatThuongPage'),
)
const UngLuongPage = lazy(() => import('@/pages/nhan-su/UngLuongPage'))
const EmployeeEditorPage = lazy(
  () => import('@/features/employee-editor/employee-editor-page'),
)
// Phase 5 — Phân Quyền leaves
const NhomQuyenPage = lazy(() => import('@/pages/phan-quyen/NhomQuyenPage'))
const MenuPage = lazy(() => import('@/pages/phan-quyen/MenuPage'))
const ChucNangPage = lazy(() => import('@/pages/phan-quyen/ChucNangPage'))
// Phase 5 — Quản Lý leaves
const ChiNhanhPage = lazy(() => import('@/pages/quan-ly/ChiNhanhPage'))
const NguoiDungPage = lazy(() => import('@/pages/quan-ly/NguoiDungPage'))
// Phase 7 — Reports (reference 6 canonical + 2 local extras kept per V5)
const KpiReportPage = lazy(() => import('@/pages/reports/kpi/KpiReportPage'))
const KpiTiepNhanReportPage = lazy(
  () => import('@/pages/reports/kpi/KpiTiepNhanReportPage'),
)
const KyThuatReportPage = lazy(
  () => import('@/pages/reports/KyThuatReportPage'),
)
const TinhTrangChungReportPage = lazy(
  () => import('@/pages/reports/TinhTrangChungReportPage'),
)
const MayTonReportPage = lazy(
  () => import('@/pages/reports/MayTonReportPage'),
)
const BaoHanhReportPage = lazy(
  () => import('@/pages/reports/BaoHanhReportPage'),
)
// Local extras (not reference-canonical, retained per V5)
const XuatKhoReportPage = lazy(
  () => import('@/pages/reports/XuatKhoReportPage'),
)
const DoanhThuReportPage = lazy(
  () => import('@/pages/reports/DoanhThuReportPage'),
)
// Phase 6 — Finance
const ThuChiPage = lazy(() => import('@/pages/tai-chinh/ThuChiPage'))
const CongNoPage = lazy(() => import('@/pages/tai-chinh/CongNoPage'))
const HoaDonPage = lazy(() => import('@/pages/tai-chinh/HoaDonPage'))
const InvoiceComposerPage = lazy(
  () => import('@/features/invoice-composer/invoice-composer-page'),
)
// Phase 6 — Stock-out
const CapLinhKienPage = lazy(() => import('@/pages/xuat-kho/CapLinhKienPage'))
const BanHangPage = lazy(() => import('@/pages/xuat-kho/BanHangPage'))
const TraHangPage = lazy(() => import('@/pages/xuat-kho/TraHangPage'))
const ChuyenKhoPage = lazy(() => import('@/pages/xuat-kho/ChuyenKhoPage'))
// Phase 6 — Warehouse
const NhapKhoPage = lazy(() => import('@/pages/quan-ly-kho/NhapKhoPage'))
const XemTonKhoPage = lazy(() => import('@/pages/quan-ly-kho/XemTonKhoPage'))
const TonKhoLKXacPage = lazy(
  () => import('@/pages/quan-ly-kho/TonKhoLKXacPage'),
)
const TonKhoKyThuatPage = lazy(
  () => import('@/pages/quan-ly-kho/TonKhoKyThuatPage'),
)
const ThuHoiLKPage = lazy(() => import('@/pages/quan-ly-kho/ThuHoiLKPage'))
const DsTraLKPage = lazy(() => import('@/pages/quan-ly-kho/DsTraLKPage'))
const DsTraLKXacPage = lazy(() => import('@/pages/quan-ly-kho/DsTraLKXacPage'))
const NhapKhoCreatePage = lazy(
  () => import('@/features/warehouse-editors/NhapKhoCreatePage'),
)
// Stock-out editors (Phase 5)
const CapLinhKienCreatePage = lazy(
  () => import('@/features/stockout-editors/CapLinhKienCreatePage'),
)
const BanHangEditorPage = lazy(
  () => import('@/features/stockout-editors/BanHangEditorPage'),
)
const TraHangCreatePage = lazy(
  () => import('@/features/stockout-editors/TraHangCreatePage'),
)
const ChuyenKhoSameBranchPage = lazy(
  () => import('@/features/stockout-editors/ChuyenKhoSameBranchPage'),
)
const ChuyenKhoCrossBranchPage = lazy(
  () => import('@/features/stockout-editors/ChuyenKhoCrossBranchPage'),
)
// Phase 2 — Shell-accessed pages (header widgets / user menu)
const ThongBaoPage = lazy(() => import('@/pages/thong-bao/ThongBaoPage'))
const TinTucPage = lazy(() => import('@/pages/tin-tuc/TinTucPage'))
const TinTucDetailPage = lazy(() => import('@/pages/tin-tuc/TinTucDetailPage'))
const TaiKhoanPage = lazy(() => import('@/pages/tai-khoan/TaiKhoanPage'))

/** Relative path helper — strips the section prefix from an absolute ROUTE. */
const rel = (full: string, base: string) => full.replace(`${base}/`, '')

/** Build a StubPage element with breadcrumb derived from its section. */
function stub(title: string, section?: { label: string; href: string }) {
  const crumbs = section
    ? [
        { label: 'Trang chủ', href: ROUTES.home },
        { label: section.label, href: section.href },
        { label: title },
      ]
    : [{ label: 'Trang chủ', href: ROUTES.home }, { label: title }]
  return <StubPage title={title} breadcrumbs={crumbs} />
}

/**
 * Full application route tree (C6). Real pages from Phases 3/4/5/7 are wired;
 * Phase 6 (finance/inventory) leaves + a few HR lookups remain StubPage until
 * their owning phase lands. Paths sourced from ROUTES.
 */
/** Wrap a lazy element in a Suspense boundary (for routes outside AppShell). */
function suspended(node: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      {node}
    </Suspense>
  )
}

const routes = [
  // Mock auth — standalone, no AppShell chrome.
  { path: rel(ROUTES.login, ''), element: suspended(<LoginPage />) },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to={ROUTES.home} replace /> },

      { path: rel(ROUTES.home, ''), element: <DashboardPage /> },

      // Repair (Phase 4)
      { path: rel(ROUTES.repairList, ''), element: <RepairListPage /> },
      { path: rel(ROUTES.repairKt, ''), element: <RepairKtListPage /> },
      { path: rel(ROUTES.repairCreate, ''), element: <RepairCreatePage /> },
      { path: 'sua-chua-bao-hanh/:id', element: <RepairDetailPage /> },

      // Customers (Phase 5)
      { path: rel(ROUTES.customers, ''), element: <KhachHangPage /> },

      // Nhân viên full-page editor (Phase 6, H7b) — outside the Nhân Sự
      // tab-strip layout, matching the reference's dedicated create/edit pages.
      { path: rel(ROUTES.hrEmployeeCreate, ''), element: <EmployeeEditorPage /> },
      { path: 'nhan-su/nhan-vien/:id/sua', element: <EmployeeEditorPage /> },

      // Hàng hóa full-page editor (Phase 6, C5b) — outside the Danh Mục
      // tab-strip layout, matching the reference's dedicated create/edit pages.
      { path: rel(ROUTES.catalogGoodsCreate, ''), element: <ProductEditorPage /> },
      { path: 'danh-muc/hang-hoa/:id/sua', element: <ProductEditorPage /> },

      // Invoice full-page composer (Phase 6, F3b) — outside the Tài Chính
      // tab-strip layout, matching the reference's dedicated /Invoice/Create page.
      { path: rel(ROUTES.financeInvoicesCreate, ''), element: <InvoiceComposerPage /> },

      // Warehouse (Phase 6)
      {
        path: 'quan-ly-kho',
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.inventoryStockView} replace />,
          },
          {
            path: rel(ROUTES.inventoryStockEntry, ROUTES.inventory),
            element: <NhapKhoPage />,
          },
          {
            path: rel(ROUTES.inventoryStockView, ROUTES.inventory),
            element: <XemTonKhoPage />,
          },
          {
            path: rel(ROUTES.inventoryConfirmedStock, ROUTES.inventory),
            element: <TonKhoLKXacPage />,
          },
          {
            path: rel(ROUTES.inventoryTechStock, ROUTES.inventory),
            element: <TonKhoKyThuatPage />,
          },
          {
            path: rel(ROUTES.inventoryPartsRecovery, ROUTES.inventory),
            element: <ThuHoiLKPage />,
          },
          {
            path: rel(ROUTES.inventoryPartsReturn, ROUTES.inventory),
            element: <DsTraLKPage />,
          },
          {
            path: rel(ROUTES.inventoryPartsReturnXac, ROUTES.inventory),
            element: <DsTraLKXacPage />,
          },
          {
            path: rel(ROUTES.inventoryStockEntryCreate, ROUTES.inventory),
            element: <NhapKhoCreatePage />,
          },
        ],
      },

      // Stock-out (Phase 6)
      {
        path: 'xuat-kho',
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.stockOutPartsDispatch} replace />,
          },
          {
            path: rel(ROUTES.stockOutPartsDispatch, ROUTES.stockOut),
            element: <CapLinhKienPage />,
          },
          {
            path: rel(ROUTES.stockOutPartsDispatchCreate, ROUTES.stockOut),
            element: <CapLinhKienCreatePage />,
          },
          {
            path: rel(ROUTES.stockOutSales, ROUTES.stockOut),
            element: <BanHangPage />,
          },
          {
            path: rel(ROUTES.stockOutSalesCreate, ROUTES.stockOut),
            element: <BanHangEditorPage />,
          },
          {
            path: 'ban-hang/:id/sua',
            element: <BanHangEditorPage />,
          },
          {
            path: rel(ROUTES.stockOutReturns, ROUTES.stockOut),
            element: <TraHangPage />,
          },
          {
            path: rel(ROUTES.stockOutReturnsCreate, ROUTES.stockOut),
            element: <TraHangCreatePage />,
          },
          {
            path: rel(ROUTES.stockOutTransfer, ROUTES.stockOut),
            element: <ChuyenKhoPage />,
          },
          {
            path: rel(ROUTES.stockOutTransferSameBranch, ROUTES.stockOut),
            element: <ChuyenKhoSameBranchPage />,
          },
          {
            path: rel(ROUTES.stockOutTransferCrossBranch, ROUTES.stockOut),
            element: <ChuyenKhoCrossBranchPage />,
          },
        ],
      },

      // Finance (Phase 6 — sole owner of Hóa Đơn)
      {
        path: 'tai-chinh',
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.financeTransactions} replace />,
          },
          {
            path: rel(ROUTES.financeTransactions, ROUTES.finance),
            element: <ThuChiPage />,
          },
          {
            path: rel(ROUTES.financeReceivables, ROUTES.finance),
            element: <CongNoPage />,
          },
          {
            path: rel(ROUTES.financeInvoices, ROUTES.finance),
            element: <HoaDonPage />,
          },
        ],
      },

      // Reports (Phase 7 — reference 6 canonical + 2 local extras)
      {
        path: 'bao-cao',
        children: [
          { index: true, element: <Navigate to={ROUTES.reportKpi} replace /> },
          {
            path: rel(ROUTES.reportKpi, ROUTES.reports),
            element: <KpiReportPage />,
          },
          {
            path: rel(ROUTES.reportKpiReceiving, ROUTES.reports),
            element: <KpiTiepNhanReportPage />,
          },
          {
            path: rel(ROUTES.reportTechnician, ROUTES.reports),
            element: <KyThuatReportPage />,
          },
          {
            path: rel(ROUTES.reportStatusGeneral, ROUTES.reports),
            element: <TinhTrangChungReportPage />,
          },
          {
            path: rel(ROUTES.reportStagnant, ROUTES.reports),
            element: <MayTonReportPage />,
          },
          {
            path: rel(ROUTES.reportWarranty, ROUTES.reports),
            element: <BaoHanhReportPage />,
          },
          // Local extras (V5)
          {
            path: rel(ROUTES.reportStockOut, ROUTES.reports),
            element: <XuatKhoReportPage />,
          },
          {
            path: rel(ROUTES.reportRevenue, ROUTES.reports),
            element: <DoanhThuReportPage />,
          },
        ],
      },

      // Catalog (Phase 5)
      {
        path: 'danh-muc',
        element: <DanhMucPage />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.catalogModel} replace />,
          },
          {
            path: rel(ROUTES.catalogModel, ROUTES.catalog),
            element: <ModelPage />,
          },
          {
            path: rel(ROUTES.catalogWarehouse, ROUTES.catalog),
            element: <NhaKhoPage />,
          },
          {
            path: rel(ROUTES.catalogSlot, ROUTES.catalog),
            element: <NganChuaPage />,
          },
          {
            path: rel(ROUTES.catalogProductGroup, ROUTES.catalog),
            element: <NhomHangHoaPage />,
          },
          {
            path: rel(ROUTES.catalogGoods, ROUTES.catalog),
            element: <HangHoaPage />,
          },
          {
            path: rel(ROUTES.catalogManufacturer, ROUTES.catalog),
            element: <NhaSanXuatPage />,
          },
          {
            path: rel(ROUTES.catalogProduct, ROUTES.catalog),
            element: <SanPhamPage />,
          },
          {
            path: rel(ROUTES.catalogRegion, ROUTES.catalog),
            element: <KhuVucPage />,
          },
          {
            path: rel(ROUTES.catalogWard, ROUTES.catalog),
            element: <PhuongXaPage />,
          },
          {
            path: rel(ROUTES.catalogWarrantyPeriod, ROUTES.catalog),
            element: <ThoiHanPage />,
          },
          {
            path: rel(ROUTES.catalogDeliveryFee, ROUTES.catalog),
            element: <PhiGiaoPage />,
          },
          {
            path: rel(ROUTES.catalogUnit, ROUTES.catalog),
            element: <DonViTinhPage />,
          },
          {
            path: rel(ROUTES.catalogProductCategory, ROUTES.catalog),
            element: <NhomSanPhamPage />,
          },
          {
            path: rel(ROUTES.catalogFaultType, ROUTES.catalog),
            element: <LoiSuaChuaPage />,
          },
        ],
      },

      // HR (Phase 5 + a few stub lookups)
      {
        path: 'nhan-su',
        element: <NhanSuPage />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.hrEmployees} replace />,
          },
          {
            path: rel(ROUTES.hrBanks, ROUTES.hr),
            element: <NganHangPage />,
          },
          {
            path: rel(ROUTES.hrDepartments, ROUTES.hr),
            element: <PhongBanPage />,
          },
          { path: rel(ROUTES.hrPositions, ROUTES.hr), element: <ChucVuPage /> },
          {
            path: rel(ROUTES.hrAllowances, ROUTES.hr),
            element: <PhuCapPage />,
          },
          {
            path: rel(ROUTES.hrBonusTypes, ROUTES.hr),
            element: <LoaiPhatThuongPage />,
          },
          {
            path: rel(ROUTES.hrAdvances, ROUTES.hr),
            element: <UngLuongPage />,
          },
          {
            path: rel(ROUTES.hrEmployees, ROUTES.hr),
            element: <NhanVienPage />,
          },
          {
            path: rel(ROUTES.hrPayroll, ROUTES.hr),
            element: <BangLuongPage />,
          },
          {
            path: rel(ROUTES.hrAttendance, ROUTES.hr),
            element: <ChamCongPage />,
          },
          {
            path: rel(ROUTES.hrAttendanceSummary, ROUTES.hr),
            element: <ChamCongTongHopPage />,
          },
        ],
      },

      // Management (Phase 5 + hoa-don redirect → finance)
      {
        path: 'quan-ly',
        element: <QuanLyPage />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.manageBranches} replace />,
          },
          {
            path: rel(ROUTES.manageBranches, ROUTES.manage),
            element: <ChiNhanhPage />,
          },
          {
            path: rel(ROUTES.manageUsers, ROUTES.manage),
            element: <NguoiDungPage />,
          },
          {
            path: 'hoa-don',
            element: <Navigate to={ROUTES.financeInvoices} replace />,
          },
        ],
      },

      // Permissions (Phase 5)
      {
        path: 'phan-quyen',
        element: <PhanQuyenPage />,
        children: [
          { index: true, element: <Navigate to={ROUTES.permGroups} replace /> },
          {
            path: rel(ROUTES.permGroups, ROUTES.permissions),
            element: <NhomQuyenPage />,
          },
          {
            path: rel(ROUTES.permMenus, ROUTES.permissions),
            element: <MenuPage />,
          },
          {
            path: rel(ROUTES.permFeatures, ROUTES.permissions),
            element: <ChucNangPage />,
          },
        ],
      },

      // Shell-accessed pages (Phase 2 — header widgets / user menu)
      { path: rel(ROUTES.notifications, ''), element: <ThongBaoPage /> },
      { path: rel(ROUTES.news, ''), element: <TinTucPage /> },
      { path: 'tin-tuc/:id', element: <TinTucDetailPage /> },
      { path: rel(ROUTES.account, ''), element: <TaiKhoanPage /> },

      // Mock change-password (inside shell — reached from user menu)
      { path: rel(ROUTES.changePassword, ''), element: <ChangePasswordPage /> },

      // Dev
      { path: 'gallery', element: <GalleryPage /> },

      { path: '*', element: stub('Không tìm thấy trang') },
    ],
  },
]

function isGithubPagesHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.endsWith('github.io')
}

export function shouldUseHashRouter(): boolean {
  return import.meta.env.VITE_ROUTER_MODE === 'hash' || isGithubPagesHost()
}

export const router = shouldUseHashRouter()
  ? createHashRouter(routes)
  : createBrowserRouter(routes)
