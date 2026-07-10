/**
 * Recharts column chart for status/technician distributions (Phase 7 — owned
 * exclusively). Used by R1 (count per technician for one status) and R2
 * (count per status across all 15). Each bar's fill + value annotation follow
 * the caller-supplied color; empty state renders "Không có dữ liệu".
 */
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '@/components/shared'
import { BarChart2 } from 'lucide-react'

export interface StatusColumnDatum {
  /** X-axis category label (technician name or status label). */
  label: string
  /** Bar value (ticket count). */
  count: number
  /** Bar fill color (per-status hex, or a single shared color for R1). */
  color: string
  /** Opaque key used by the click handler to identify which segment was hit. */
  key: string | number
}

interface StatusColumnChartProps {
  title: string
  data: StatusColumnDatum[]
  onBarClick?: (datum: StatusColumnDatum) => void
  height?: number
  /** Container width — numeric override lets tests force a rendered size
   * (ResponsiveContainer measures 0×0 in happy-dom without a real layout). */
  width?: number | string
}

interface TooltipPayloadEntry {
  payload: StatusColumnDatum
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

export function StatusColumnChart({
  title,
  data,
  onBarClick,
  height = 360,
  width = '100%',
}: StatusColumnChartProps) {
  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {title}
      </p>
      {data.length === 0 ? (
        <EmptyState icon={BarChart2} heading="Không có dữ liệu" />
      ) : (
        <ResponsiveContainer width={width} height={height}>
          <BarChart
            data={data}
            margin={{ top: 24, right: 16, left: 0, bottom: 48 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              isAnimationActive={false}
              onClick={onBarClick ? (d) => onBarClick(d as unknown as StatusColumnDatum) : undefined}
              cursor={onBarClick ? 'pointer' : undefined}
            >
              <LabelList dataKey="count" position="top" fontSize={11} />
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
