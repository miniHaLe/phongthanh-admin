import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { notify } from '@/components/shared/toast'
import type { CrudConfig } from '@/types/crud-types'
import { exportCrudRows, exportCurrentCrudPage } from './export-crud-rows'

const mocks = vi.hoisted(() => ({
  exportToXlsx: vi.fn(async () => undefined),
}))

vi.mock('@/lib/export-xlsx', () => ({
  exportToXlsx: mocks.exportToXlsx,
}))

interface Row {
  id: string
  name: string
  status: string
  empty: string | null
}

const config: CrudConfig<Row> = {
  resourceKey: 'export-test',
  title: 'Export test',
  mockApi: {} as CrudConfig<Row>['mockApi'],
  fields: [],
  columns: [
    { key: 'name', header: 'Tên' },
    {
      key: 'status',
      header: 'Trạng thái',
      renderCell: (value, _row, lookups) =>
        (lookups?.statusNames as Record<string, string> | undefined)?.[
          String(value)
        ] ?? String(value),
    },
    {
      key: 'id',
      header: 'JSX fallback',
      renderCell: () => createElement('strong', null, 'Không xuất JSX'),
    },
    { key: 'empty', header: 'Rỗng' },
  ],
}

const rows: Row[] = [
  { id: 'row-1', name: 'Tên gốc', status: 'active', empty: null },
]

beforeEach(() => {
  vi.restoreAllMocks()
  mocks.exportToXlsx.mockClear()
})

describe('exportCrudRows', () => {
  it('exports renderer strings, raw fallbacks, and visible empty markers', () => {
    const data = exportCrudRows(config, rows, {
      statusNames: { active: 'Đang dùng' },
    })

    expect(data.rows).toEqual([
      {
        name: 'Tên gốc',
        status: 'Đang dùng',
        id: 'row-1',
        empty: '—',
      },
    ])
    expect(data.columns.map((column) => column.header)).toEqual([
      'Tên',
      'Trạng thái',
      'JSX fallback',
      'Rỗng',
    ])
  })

  it('exports only the supplied page and reports start/completion', async () => {
    const info = vi.spyOn(notify, 'info')
    const success = vi.spyOn(notify, 'success')

    await exportCurrentCrudPage(config, rows, {
      statusNames: { active: 'Đang dùng' },
    })

    expect(info).toHaveBeenCalledWith('Đang xuất 1 dòng trên trang hiện tại…')
    expect(mocks.exportToXlsx).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'export-test',
        rows: expect.any(Array),
      }),
    )
    expect(success).toHaveBeenCalledWith('Đã xuất Excel trang hiện tại')
  })
})
