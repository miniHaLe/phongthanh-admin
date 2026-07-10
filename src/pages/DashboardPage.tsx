/**
 * DashboardPage — top-level work-queue dashboard (Phase 3).
 * Composes: GreetingBanner → KPI tiles → chart+alerts → recent tickets → FAB.
 * Registers Cmd-K entries: "Trang chủ" + "Lập phiếu mới".
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, PlusCircle } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/shared'
import { useRegisterCommands } from '@/components/shell/command-registry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

import {
  useDashboardSummary,
  useLowStock,
  useRecentTickets,
  useStatusDistribution,
} from '@/hooks/useDashboard'

import { GreetingBanner } from '@/components/dashboard/GreetingBanner'
import { WorkQueueTiles } from '@/components/dashboard/WorkQueueTiles'
import { TodayReceiptsTile } from '@/components/dashboard/TodayReceiptsTile'
import { LowStockAlert } from '@/components/dashboard/LowStockAlert'
import { BranchCountsTable } from '@/components/dashboard/BranchCountsTable'
import { RecentTicketsTable } from '@/components/dashboard/RecentTicketsTable'
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart'
import { QuickLapPhieuButton } from '@/components/dashboard/QuickLapPhieuButton'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { PlanCalendar } from '@/components/dashboard/PlanCalendar'

export default function DashboardPage() {
  const navigate = useNavigate()
  const activeBranch = useAppStore((s) => s.activeBranch)

  const summaryQuery = useDashboardSummary(activeBranch)
  const lowStockQuery = useLowStock()
  const recentTicketsQuery = useRecentTickets()
  const statusDistQuery = useStatusDistribution()

  // Register Cmd-K entries — memoized to avoid re-register loops
  const commands = useMemo(
    () => [
      {
        id: 'dashboard-home',
        label: 'Trang chủ',
        group: 'Điều hướng',
        icon: Home,
        run: () => navigate(ROUTES.home),
      },
      {
        id: 'dashboard-lap-phieu',
        label: 'Lập phiếu mới',
        group: 'Hành động nhanh',
        icon: PlusCircle,
        run: () => navigate(ROUTES.repairCreate),
      },
    ],
    [navigate],
  )
  useRegisterCommands('dashboard', commands)

  // Show full-page skeleton while summary (critical) is loading
  const isCriticalLoading = summaryQuery.isLoading

  if (isCriticalLoading) {
    return <DashboardSkeleton />
  }

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <PageHeader title="Trang chủ" breadcrumbs={[{ label: 'Trang chủ' }]}>
        {/* Inline "Lập phiếu" button — hidden on mobile (FAB shows instead) */}
        <div className="hidden md:block">
          <QuickLapPhieuButton variant="inline" />
        </div>
      </PageHeader>

      <Tabs defaultValue="tong-quan" className="p-4 md:p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="ke-hoach">Kế hoạch của bạn</TabsTrigger>
        </TabsList>

        <TabsContent value="tong-quan" className="space-y-5">
        {/* ── Greeting banner ─────────────────────────────────────────── */}
        <GreetingBanner activeBranch={activeBranch} />

        {/* ── Summary error ───────────────────────────────────────────── */}
        {summaryQuery.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>Không thể tải dữ liệu tổng quan. Vui lòng thử lại.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => summaryQuery.refetch()}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* ── KPI tile row: 4 queue tiles + today receipts ────────────── */}
        {summaryQuery.data && (
          <div className="space-y-3">
            <WorkQueueTiles summary={summaryQuery.data} />
            <div className="grid grid-cols-1 xl:grid-cols-4">
              <TodayReceiptsTile
                count={summaryQuery.data.todayReceipts}
                trend={summaryQuery.data.todayReceiptsTrend}
              />
            </div>
          </div>
        )}

        {/* ── Middle row: status chart + low-stock alert ───────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Status distribution chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Phân bổ trạng thái phiếu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart
                data={statusDistQuery.data ?? []}
                isLoading={statusDistQuery.isLoading}
                isError={statusDistQuery.isError}
                onRetry={() => statusDistQuery.refetch()}
              />
            </CardContent>
          </Card>

          {/* Low stock alert */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Linh kiện sắp hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockQuery.isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              ) : lowStockQuery.isError ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Không thể tải dữ liệu. Thử lại.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => lowStockQuery.refetch()}
                  >
                    Thử lại
                  </Button>
                </div>
              ) : (
                <LowStockAlert items={lowStockQuery.data ?? []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom row: branch counts + (spacer on desktop) ─────────── */}
        {summaryQuery.data && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tình hình theo chi nhánh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BranchCountsTable branches={summaryQuery.data.branches} />
              </CardContent>
            </Card>

            {/* Placeholder column for future widgets on lg screens */}
            <div className="hidden lg:col-span-2 lg:block" />
          </div>
        )}

        {/* ── Recent tickets table ─────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Phiếu sửa chữa gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <RecentTicketsTable
              tickets={recentTicketsQuery.data ?? []}
              isLoading={recentTicketsQuery.isLoading}
              isError={recentTicketsQuery.isError}
              onRetry={() => recentTicketsQuery.refetch()}
            />
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="ke-hoach">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kế hoạch của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <PlanCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Mobile FAB ──────────────────────────────────────────────────── */}
      <QuickLapPhieuButton variant="fab" />
    </>
  )
}
