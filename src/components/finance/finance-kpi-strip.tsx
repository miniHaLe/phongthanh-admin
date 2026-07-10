/**
 * FinanceKpiStrip — row of 4 KPI cards for Tài Chính pages.
 * Auto-fires on mount with default period (current month).
 * Loading → skeletons. Error → inline amber alert with retry.
 * Blank/zero → renders "0" / "0 ₫" never undefined.
 */
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/shared'
import { useFinanceKpi } from '@/hooks/use-finance-kpi'
import { formatVND } from '@/lib/format'
import type { DateRange } from '@/hooks/use-finance-kpi'

interface FinanceKpiStripProps {
  period: DateRange | null
  branchId?: string | null
}

export function FinanceKpiStrip({ period, branchId }: FinanceKpiStripProps) {
  const { data, isLoading, isError, refetch, isFetching } = useFinanceKpi(
    period,
    branchId,
  )

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Không tải được dữ liệu KPI. Vui lòng thử lại.</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 h-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-1 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const tongThu = data?.tong_thu ?? 0
  const tongChi = data?.tong_chi ?? 0
  const congNoPhuThu = data?.cong_no_phai_thu ?? 0
  const congNoPhuTra = data?.cong_no_phai_tra ?? 0

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Tổng Thu"
        value={isLoading ? '' : formatVND(tongThu)}
        icon={TrendingUp}
        isLoading={isLoading}
        className="border-l-4 border-l-emerald-500"
      />
      <StatCard
        label="Tổng Chi"
        value={isLoading ? '' : formatVND(tongChi)}
        icon={TrendingDown}
        isLoading={isLoading}
        className="border-l-4 border-l-rose-500"
      />
      <StatCard
        label="Công Nợ Phải Thu"
        value={isLoading ? '' : formatVND(congNoPhuThu)}
        isLoading={isLoading}
        className="border-l-4 border-l-amber-500"
      />
      <StatCard
        label="Công Nợ Phải Trả"
        value={isLoading ? '' : formatVND(congNoPhuTra)}
        isLoading={isLoading}
        className="border-l-4 border-l-blue-500"
      />
    </div>
  )
}

/** Skeleton fallback (4 cards) — used when isLoading before data lands. */
export function FinanceKpiStripSkeleton() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}
