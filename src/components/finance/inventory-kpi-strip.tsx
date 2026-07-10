/**
 * InventoryKpiStrip — row of 3 KPI cards for Quản Lý Kho pages.
 * Auto-fires on mount with default period (current month → today).
 * Blank/zero → "0" / "0 ₫" never empty.
 *
 * Also exports the generic `KpiBox` + `KpiTrio` used by the Xem Tồn Kho family
 * (W2/W3/W4): those pages already have their KPI values from `fetchInventory`
 * (the same Kỳ carry-forward feeding the grid rows), so they render the trio
 * directly instead of firing the separate date-range `useInventoryKpi` query.
 * Negative values are never clamped — a stock-out-heavy period can render a
 * negative `Tổng tồn`, and the minus sign must stay visible.
 */
import {
  Package,
  DollarSign,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/shared'
import { useInventoryKpi } from '@/hooks/use-inventory-kpi'
import { formatVND, formatNumber } from '@/lib/format'
import type { DateRange } from '@/hooks/use-inventory-kpi'

export type KpiTone = 'green' | 'blue' | 'yellow'

const TONE_BORDER: Record<KpiTone, string> = {
  green: 'border-l-emerald-500',
  blue: 'border-l-blue-500',
  yellow: 'border-l-amber-500',
}

export interface KpiBoxProps {
  label: string
  /** Pre-formatted display value (caller decides formatNumber vs formatVND). */
  value: string
  tone: KpiTone
  isLoading?: boolean
}

/** Single KPI card — generic building block, no clamp/abs on the caller's value. */
export function KpiBox({ label, value, tone, isLoading }: KpiBoxProps) {
  return (
    <StatCard
      label={label}
      value={isLoading ? '' : value}
      isLoading={isLoading}
      className={`border-l-4 ${TONE_BORDER[tone]}`}
    />
  )
}

export interface KpiTrioProps {
  tonDauKy: number
  tongTien: number
  tongTon: number
  /** Hide "Tổng tiền" (W3 — Xem Tồn Kho Linh Kiện Xác has no Tổng tiền column). */
  showTongTien?: boolean
  isLoading?: boolean
}

/** The Tồn đầu kỳ (green) / Tổng tiền (blue) / Tổng tồn (yellow) trio. */
export function KpiTrio({
  tonDauKy,
  tongTien,
  tongTon,
  showTongTien = true,
  isLoading,
}: KpiTrioProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      <KpiBox
        label="Tồn đầu kỳ"
        value={formatNumber(tonDauKy)}
        tone="green"
        isLoading={isLoading}
      />
      {showTongTien && (
        <KpiBox
          label="Tổng tiền"
          value={formatVND(tongTien)}
          tone="blue"
          isLoading={isLoading}
        />
      )}
      <KpiBox
        label="Tổng tồn"
        value={formatNumber(tongTon)}
        tone="yellow"
        isLoading={isLoading}
      />
    </div>
  )
}

interface InventoryKpiStripProps {
  period: DateRange | null
  branchId?: string | null
  khoId?: string | null
}

export function InventoryKpiStrip({
  period,
  branchId,
  khoId,
}: InventoryKpiStripProps) {
  const { data, isLoading, isError, refetch, isFetching } = useInventoryKpi(
    period,
    branchId,
    khoId,
  )

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Không tải được dữ liệu KPI tồn kho. Vui lòng thử lại.</span>
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

  const tonDauKy = data?.ton_dau_ky ?? 0
  const tongTienTon = data?.tong_tien_ton ?? 0
  const tongTon = data?.tong_ton ?? 0

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard
        label="Tồn Đầu Kỳ"
        value={isLoading ? '' : formatNumber(tonDauKy)}
        icon={BarChart3}
        isLoading={isLoading}
        className="border-l-4 border-l-blue-500"
      />
      <StatCard
        label="Tổng Tiền Tồn"
        value={isLoading ? '' : formatVND(tongTienTon)}
        icon={DollarSign}
        isLoading={isLoading}
        className="border-l-4 border-l-emerald-500"
      />
      <StatCard
        label="Tổng Tồn Hiện Tại"
        value={isLoading ? '' : formatNumber(tongTon)}
        icon={Package}
        isLoading={isLoading}
        className="border-l-4 border-l-amber-500"
      />
    </div>
  )
}

export function InventoryKpiStripSkeleton() {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}
