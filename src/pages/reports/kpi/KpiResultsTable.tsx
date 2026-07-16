import {
  AgingPivotTable,
  type AgingPivotColumn,
} from '@/components/reports/aging-pivot-table'
import type { KpiAgingRow } from '@/domains/reports/aging-buckets'

interface KpiResultsTableProps {
  data: readonly KpiAgingRow[]
  personLabel: 'Kỹ thuật' | 'Tiếp tân'
}

const KPI_COLUMNS: readonly AgingPivotColumn<KpiAgingRow>[] = [
  { key: 'day1', label: '1 ngày', getValue: (row) => row.day1 },
  { key: 'day2', label: '2 ngày', getValue: (row) => row.day2 },
  { key: 'day3', label: '3 ngày', getValue: (row) => row.day3 },
  { key: 'day4', label: '4 ngày', getValue: (row) => row.day4 },
  { key: 'day5', label: '5 ngày', getValue: (row) => row.day5 },
  { key: 'day6', label: '6 ngày', getValue: (row) => row.day6 },
  { key: 'day7', label: '7 ngày', getValue: (row) => row.day7 },
  { key: 'over7', label: '>7 ngày', getValue: (row) => row.over7 },
  { key: 'total', label: 'Tổng', getValue: (row) => row.total },
]

export function KpiResultsTable({ data, personLabel }: KpiResultsTableProps) {
  return (
    <AgingPivotTable
      rows={data}
      rowHeader={personLabel}
      getRowId={(row) => row.personId}
      getRowLabel={(row) => row.personName}
      columns={KPI_COLUMNS}
    />
  )
}
