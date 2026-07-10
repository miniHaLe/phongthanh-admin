/**
 * StatusDistributionChart — Recharts PieChart of ticket counts by status.
 * Each slice fill is the status's fixed legacy hex (STATUS_HEX) — the reference
 * has no dark mode, so the color is theme-independent.
 * Skeleton: gray circle placeholder while loading.
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared'
import { BarChart2 } from 'lucide-react'
import { hexOf } from '@/domains/repair/status'
import type { StatusCount } from '@/types/dashboard-types'

interface StatusDistributionChartProps {
  data: StatusCount[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

interface TooltipPayloadEntry {
  name: string
  value: number
  payload: StatusCount
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.payload.label}</p>
      <p className="text-muted-foreground">
        Số phiếu:{' '}
        <span className="font-semibold text-foreground">{item.value}</span>
      </p>
    </div>
  )
}

export function StatusDistributionChart({
  data,
  isLoading,
  isError,
  onRetry,
}: StatusDistributionChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <Skeleton className="h-56 w-56 rounded-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-[280px]">
        <EmptyState
          icon={BarChart2}
          heading="Không thể tải biểu đồ"
          body="Không thể tải dữ liệu. Thử lại."
          action={{ label: 'Thử lại', onClick: onRetry }}
        />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[280px]">
        <EmptyState icon={BarChart2} heading="Chưa có dữ liệu phiếu" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={92}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={hexOf(entry.status)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-foreground">{value}</span>
          )}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
