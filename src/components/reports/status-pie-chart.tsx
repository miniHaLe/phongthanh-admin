/**
 * Recharts pie chart for the 15-status distribution (Phase 7 — owned
 * exclusively). Used by R2 (Báo cáo tình trạng chung) alongside the column
 * chart. Empty state renders "Không có dữ liệu".
 */
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { EmptyState } from '@/components/shared'
import { BarChart2 } from 'lucide-react'
import type { StatusColumnDatum } from './status-column-chart'

interface StatusPieChartProps {
  title: string
  data: StatusColumnDatum[]
  onSliceClick?: (datum: StatusColumnDatum) => void
  height?: number
  /** Container width — numeric override lets tests force a rendered size
   * (ResponsiveContainer measures 0×0 in happy-dom without a real layout). */
  width?: number | string
}

interface TooltipPayloadEntry {
  payload: StatusColumnDatum
  value: number
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">
        Số lượng:{' '}
        <span className="font-semibold text-foreground">{item.count}</span>
      </p>
    </div>
  )
}

export function StatusPieChart({
  title,
  data,
  onSliceClick,
  height = 360,
  width = '100%',
}: StatusPieChartProps) {
  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {title}
      </p>
      {data.length === 0 ? (
        <EmptyState icon={BarChart2} heading="Không có dữ liệu" />
      ) : (
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={110}
              isAnimationActive={false}
              label={(entry: StatusColumnDatum) => `${entry.count}`}
              onClick={
                onSliceClick
                  ? (d) => onSliceClick(d as unknown as StatusColumnDatum)
                  : undefined
              }
              cursor={onSliceClick ? 'pointer' : undefined}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
