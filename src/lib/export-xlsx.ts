/**
 * Client-side .xlsx exporter (SheetJS). The ONE sanctioned "Xuất Excel" path —
 * every export button across the app builds an array-of-arrays through here so
 * formula-injection neutralization applies uniformly.
 *
 * `xlsx` is dynamically imported inside `exportToXlsx` so it stays out of the
 * initial bundle.
 */

export interface ExportColumn<TRow> {
  header: string
  accessor: (row: TRow) => string | number | null | undefined
}

export interface ExportOptions<TRow> {
  filename: string
  sheetName?: string
  columns: ExportColumn<TRow>[]
  rows: TRow[]
}

const FORMULA_TRIGGERS = new Set(['=', '+', '-', '@'])

/**
 * Neutralize spreadsheet/CSV formula injection. A cell whose first
 * non-whitespace character is a formula trigger (`= + - @`, incl. tab/CR
 * prefixed) is prefixed with `'` — but ONLY when the value is a string that is
 * not a valid number. Numeric cells (a genuine `-1`, `+3.5`, a coordinate/delta
 * passed as `number`) pass through untouched so legit negatives are preserved.
 */
export function neutralizeCell(
  value: string | number | null | undefined,
): string | number {
  if (value == null) return ''
  if (typeof value === 'number') return value

  const str = String(value)
  // A string that parses cleanly as a number is a legitimate numeric value.
  if (str.trim() !== '' && !Number.isNaN(Number(str))) return str

  const firstNonWs = str.replace(/^[\s\t\r\n]+/, '').charAt(0)
  if (FORMULA_TRIGGERS.has(firstNonWs)) return `'${str}`
  return str
}

/** Build the array-of-arrays (header row + neutralized data rows). */
export function buildSheetAoa<TRow>(
  columns: ExportColumn<TRow>[],
  rows: TRow[],
): (string | number)[][] {
  const header = columns.map((c) => neutralizeCell(c.header))
  const body = rows.map((row) =>
    columns.map((c) => neutralizeCell(c.accessor(row))),
  )
  return [header, ...body]
}

/** Build + download a real .xlsx file. */
export async function exportToXlsx<TRow>({
  filename,
  sheetName = 'Sheet1',
  columns,
  rows,
}: ExportOptions<TRow>): Promise<void> {
  const XLSX = await import('xlsx')
  const aoa = buildSheetAoa(columns, rows)
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  XLSX.writeFile(wb, name)
}
