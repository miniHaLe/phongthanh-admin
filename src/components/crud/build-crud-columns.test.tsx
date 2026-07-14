import { describe, expect, it, vi } from 'vitest'
import type { CellContext } from '@tanstack/react-table'
import type { CrudConfig } from '@/types/crud-types'
import { buildCrudColumns } from './build-crud-columns'

interface Row {
  id: string
  name: string
  status: string
}

const row: Row = { id: 'row-1', name: 'Tên gốc', status: 'active' }
const config: CrudConfig<Row> = {
  resourceKey: 'builder-test',
  title: 'Builder test',
  mockApi: {} as CrudConfig<Row>['mockApi'],
  fields: [],
  bulkDelete: true,
  columns: [
    { key: 'name', header: 'Tên' },
    {
      key: 'status',
      header: 'Trạng thái',
      hidden: true,
      renderCell: (value, _row, lookups) =>
        (lookups?.statusNames as Record<string, string> | undefined)?.[
          String(value)
        ] ?? String(value),
    },
  ],
}

function renderCell(column: ReturnType<typeof buildCrudColumns<Row>>[number]) {
  const cell = column.cell
  if (typeof cell !== 'function') return cell
  const tableRow = { id: row.id, original: row, index: 0 }
  return cell({
    row: tableRow,
    table: { getRowModel: () => ({ rows: [tableRow] }) },
  } as CellContext<Row, unknown>)
}

describe('buildCrudColumns', () => {
  it('uses the generic anatomy and preserves TanStack default accessor cells', () => {
    const columns = buildCrudColumns(
      config,
      { page: 2, pageSize: 20 },
      { onEdit: vi.fn() },
      { statusNames: { active: 'Đang dùng' } },
    )

    expect(columns.map((column) => column.id)).toEqual([
      'select',
      'stt',
      'name',
      'status',
      '_actions',
    ])
    expect(columns[1].meta?.sticky).toBe(true)
    expect(renderCell(columns[1])).toBe(21)
    expect(columns[2].cell).toBeUndefined()
    expect(columns[3].meta?.initiallyHidden).toBe(true)
    expect(renderCell(columns[3])).toBe('Đang dùng')
  })

  it('supports the customer edit-only action set', () => {
    const columns = buildCrudColumns(
      config,
      { page: 1, pageSize: 20 },
      {
        onEdit: vi.fn(),
      },
    )
    const actions = columns.at(-1)

    expect(actions?.id).toBe('_actions')
    expect(actions?.size).toBe(60)
  })
})
