/**
 * Spec: xlsx exporter builds header-first AoA, neutralizes formula-injection in
 * string cells, and preserves legitimate numeric negatives.
 */
import { describe, it, expect, vi } from 'vitest'
import { buildSheetAoa, neutralizeCell, exportToXlsx } from './export-xlsx'

interface Row {
  ten: string
  sdt: string
  soTien: number
}

describe('buildSheetAoa', () => {
  it('emits the header row first, in column order', () => {
    const cols = [
      { header: 'Chi nhánh', accessor: (r: Row) => r.ten },
      { header: 'Điện thoại', accessor: (r: Row) => r.sdt },
    ]
    const aoa = buildSheetAoa(cols, [{ ten: 'Đắk Lắk', sdt: '0900000000', soTien: 0 }])
    expect(aoa[0]).toEqual(['Chi nhánh', 'Điện thoại'])
    expect(aoa[1]).toEqual(['Đắk Lắk', '0900000000'])
  })
})

describe('neutralizeCell (F8 formula injection)', () => {
  it('prefixes string cells starting with a formula trigger', () => {
    expect(neutralizeCell('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(neutralizeCell('@cmd')).toBe("'@cmd")
    expect(neutralizeCell('\t=x')).toBe("'\t=x")
    expect(neutralizeCell('  =x')).toBe("'  =x")
  })

  it('leaves normal strings untouched', () => {
    expect(neutralizeCell('Nguyễn')).toBe('Nguyễn')
  })

  it('preserves legitimate numeric negatives and deltas (M3)', () => {
    expect(neutralizeCell(-1)).toBe(-1)
    expect(neutralizeCell(3.5)).toBe(3.5)
    // a numeric-looking string is a valid number, not a formula
    expect(neutralizeCell('-1')).toBe('-1')
  })

  it('maps null/undefined to an empty string', () => {
    expect(neutralizeCell(null)).toBe('')
    expect(neutralizeCell(undefined)).toBe('')
  })
})

describe('exportToXlsx', () => {
  it('appends .xlsx and writes the file via SheetJS', async () => {
    const writeFile = vi.fn()
    vi.doMock('xlsx', () => ({
      utils: {
        aoa_to_sheet: vi.fn(() => ({})),
        book_new: vi.fn(() => ({})),
        book_append_sheet: vi.fn(),
      },
      writeFile,
    }))
    const { exportToXlsx: freshExport } = await import('./export-xlsx')
    await freshExport({
      filename: 'bao-cao',
      columns: [{ header: 'A', accessor: (r: { a: string }) => r.a }],
      rows: [{ a: 'x' }],
    })
    expect(writeFile).toHaveBeenCalledOnce()
    expect(writeFile.mock.calls[0][1]).toBe('bao-cao.xlsx')
    vi.doUnmock('xlsx')
  })

  it('is a callable export', () => {
    expect(typeof exportToXlsx).toBe('function')
  })
})
