import { notify } from '@/components/shared/toast'
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import type { CrudConfig, CrudLookups } from '@/types/crud-types'

export type CrudExportRow = Record<string, string | number>

function normalizeDisplayValue(value: unknown): string | number {
  if (value === '' || value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return String(value)
}

export function exportCrudRows<T extends { id: string }>(
  config: CrudConfig<T>,
  rows: T[],
  lookups?: CrudLookups,
): {
  columns: ExportColumn<CrudExportRow>[]
  rows: CrudExportRow[]
} {
  const columns = config.columns.map((column) => {
    const key = String(column.key)
    return {
      header: column.header,
      accessor: (row: CrudExportRow) => row[key],
    }
  })
  const exportRows = rows.map((row) =>
    Object.fromEntries(
      config.columns.map((column) => {
        const key = String(column.key)
        const rawValue = (row as Record<string, unknown>)[key]
        const rendered = column.renderCell?.(
          rawValue as T[keyof T],
          row,
          lookups,
        )
        const displayValue =
          typeof rendered === 'string' || typeof rendered === 'number'
            ? rendered
            : rawValue
        return [key, normalizeDisplayValue(displayValue)]
      }),
    ),
  )

  return { columns, rows: exportRows }
}

export async function exportCurrentCrudPage<T extends { id: string }>(
  config: CrudConfig<T>,
  rows: T[],
  lookups?: CrudLookups,
): Promise<void> {
  notify.info(`Đang xuất ${rows.length} dòng trên trang hiện tại…`)
  try {
    const exportData = exportCrudRows(config, rows, lookups)
    await exportToXlsx({
      filename: config.resourceKey,
      sheetName: config.title,
      ...exportData,
    })
    notify.success('Đã xuất Excel trang hiện tại')
  } catch {
    notify.error('Không thể xuất Excel. Vui lòng thử lại.')
  }
}
