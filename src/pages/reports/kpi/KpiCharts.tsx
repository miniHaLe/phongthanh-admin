/**
 * KPI charts: bar (per technician) + line (by period) via Recharts (Phase 7 — owned exclusively).
 * Dark-mode safe: hex colors from a local KPI-series palette, custom tooltip via shadcn tokens.
 * Shows standard empty states for zero-series data. Stacks vertically on mobile.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useEffect, useState } from 'react'
import type { KpiRow, PeriodMode } from '@/mock/reports/report-types'
import { EmptyState } from '@/components/shared'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  KPI_BAR_SERIES_LABELS,
  aggregateKpiRowsByPeriod,
  aggregateKpiRowsByTech,
} from './kpi-chart-data'

// KPI series colors use a small local chart palette rather than status tokens.
const CHART_HEX = {
  hoanThanh: { light: '#10b981', dark: '#34d399' },
  dangSua: { light: '#8b5cf6', dark: '#a78bfa' },
  quaHan: { light: '#f59e0b', dark: '#fbbf24' },
  khac: { light: '#64748b', dark: '#94a3b8' },
  tongPhieu: { light: '#0ea5e9', dark: '#38bdf8' },
} as const

interface KpiChartsProps {
  data: KpiRow[]
  mode: PeriodMode
}

// ── Dark-mode detection ───────────────────────────────────────────────────────

function useIsDark(): boolean {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])
  return dark
}

// ── Color palette (local KPI-series colors) ──────────────────────────────────

function palette(dark: boolean) {
  return {
    hoanThanh: dark ? CHART_HEX.hoanThanh.dark : CHART_HEX.hoanThanh.light,
    dangSua: dark ? CHART_HEX.dangSua.dark : CHART_HEX.dangSua.light,
    quaHan: dark ? CHART_HEX.quaHan.dark : CHART_HEX.quaHan.light,
    khac: dark ? CHART_HEX.khac.dark : CHART_HEX.khac.light,
    tongPhieu: dark ? CHART_HEX.tongPhieu.dark : CHART_HEX.tongPhieu.light,
    grid: dark ? '#334155' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    tooltipBg: dark ? '#1e293b' : '#ffffff',
    tooltipBorder: dark ? '#334155' : '#e2e8f0',
    tooltipText: dark ? '#f1f5f9' : '#0f172a',
  }
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  dark: boolean
}

function CustomTooltip({ active, payload, label, dark }: CustomTooltipProps) {
  const c = palette(dark)
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-md border p-2 text-xs shadow-md"
      style={{
        background: c.tooltipBg,
        borderColor: c.tooltipBorder,
        color: c.tooltipText,
      }}
    >
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}:{' '}
          <span className="font-semibold">
            {item.value.toLocaleString('vi-VN')}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Period label for line chart ────────────────────────────────────────────────

function periodAxisLabel(mode: PeriodMode): string {
  if (mode === 'ngay') return 'Ngày'
  if (mode === 'thang') return 'Tháng'
  return 'Năm'
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KpiCharts({ data, mode }: KpiChartsProps) {
  const dark = useIsDark()
  const c = palette(dark)

  const barData = aggregateKpiRowsByTech(data)
  const lineData = aggregateKpiRowsByPeriod(data, mode)
  const hasBarData = barData.some(
    (item) => item.hoanThanh + item.dangSua + item.quaHan + item.khac > 0,
  )
  const hasLineData = lineData.some((item) => item.tongPhieu > 0)
  const lineLabel = periodAxisLabel(mode)

  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2')}>
      {/* Bar chart: phiếu theo kỹ thuật viên */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">
          Phiếu theo kỹ thuật viên
        </p>
        {hasBarData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
              <XAxis
                dataKey="kyThuat"
                tick={{ fill: c.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: c.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as TooltipPayloadItem[]}
                    label={props.label as string}
                    dark={dark}
                  />
                )}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) =>
                  KPI_BAR_SERIES_LABELS[
                    value as keyof typeof KPI_BAR_SERIES_LABELS
                  ] ?? value
                }
              />
              <Bar
                dataKey="hoanThanh"
                stackId="a"
                fill={c.hoanThanh}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="dangSua"
                stackId="a"
                fill={c.dangSua}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="quaHan"
                stackId="a"
                fill={c.quaHan}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="khac"
                stackId="a"
                fill={c.khac}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={BarChart2}
            heading="Không có dữ liệu"
            className="min-h-[260px]"
          />
        )}
      </div>

      {/* Line chart: tổng phiếu theo kỳ */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">
          Tổng phiếu theo {lineLabel.toLowerCase()}
        </p>
        {hasLineData ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={lineData}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
              <XAxis
                dataKey="period"
                tick={{ fill: c.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: c.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as TooltipPayloadItem[]}
                    label={props.label as string}
                    dark={dark}
                  />
                )}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={() => 'Tổng phiếu'}
              />
              <Line
                type="monotone"
                dataKey="tongPhieu"
                stroke={c.tongPhieu}
                strokeWidth={2}
                dot={{ r: 3, fill: c.tongPhieu }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={BarChart2}
            heading="Không có dữ liệu"
            className="min-h-[260px]"
          />
        )}
      </div>
    </div>
  )
}
