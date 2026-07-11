/** Characterization: DataTable core behavior survives the row-selection add. */
import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { DataTableColumnConfig } from './data-table-column-config'
import {
  migrateTableState,
  TABLE_STATE_VERSION,
  useTableState,
} from './use-table-state'

interface Row {
  id: string
  name: string
}
const columns: ColumnDef<Row, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Tên' },
]
const sizedColumns: ColumnDef<Row, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Tên', size: 180 },
  { id: 'id', accessorKey: 'id', header: 'Mã' },
]
const data: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
]

beforeEach(() => {
  useTableState.setState({ tables: {} })
  localStorage.clear()
})

describe('DataTable (characterization)', () => {
  it('renders headers and rows from column defs', () => {
    render(<DataTable tableId="t1" columns={columns} data={data} />)
    expect(screen.getByText('Tên')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows the empty state when there is no data', () => {
    render(<DataTable tableId="t2" columns={columns} data={[]} />)
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('fires onRowClick with the row original', async () => {
    const user = userEvent.setup()
    let clicked: Row | null = null
    render(
      <DataTable
        tableId="t3"
        columns={columns}
        data={data}
        onRowClick={(r) => (clicked = r)}
      />,
    )
    await user.click(screen.getByText('Alpha'))
    expect(clicked).toEqual({ id: 'a', name: 'Alpha' })
  })

  it('renders the toolbar slot', () => {
    render(
      <DataTable
        tableId="t4"
        columns={columns}
        data={data}
        toolbar={<div>TOOLBAR</div>}
      />,
    )
    expect(screen.getByText('TOOLBAR')).toBeInTheDocument()
  })

  it('renders a named focusable scroll frame', () => {
    render(
      <DataTable
        tableId="t5"
        columns={columns}
        data={data}
        scrollLabel="Bảng kiểm thử"
      />,
    )

    const frame = screen.getByLabelText('Bảng kiểm thử')
    expect(frame).toHaveAttribute('data-table-scroll-frame', 'true')
    expect(frame).toHaveAttribute('tabindex', '0')
  })

  it('applies tableClassName to the inner table', () => {
    render(
      <DataTable
        tableId="t6"
        columns={columns}
        data={data}
        tableClassName="min-w-[1200px]"
      />,
    )

    expect(screen.getByRole('table')).toHaveClass('min-w-[1200px]')
  })

  it('applies opt-in fit width and only explicit column sizes', () => {
    render(
      <DataTable
        tableId="t7"
        columns={sizedColumns}
        data={data}
        tableMinWidth={1200}
      />,
    )

    const table = screen.getByRole('table')
    const headers = screen.getAllByRole('columnheader')

    expect(table).toHaveClass('table-fixed')
    expect(table).toHaveAttribute('data-table-layout', 'fixed')
    expect(table).toHaveStyle({ minWidth: '1200px' })
    expect(headers[0]).toHaveStyle({ width: '180px' })
    expect(headers[1].style.width).toBe('')
    expect(screen.getByText('Alpha').closest('td')).not.toHaveClass(
      'overflow-hidden',
    )
    expect(screen.getByText('Alpha').closest('td')).not.toHaveAttribute('title')
  })

  it('uses explicit sizes as minimums in content-safe layout', () => {
    render(
      <DataTable
        tableId="content-safe"
        columns={sizedColumns}
        data={data}
        tableMinWidth={1200}
        tableLayout="content-safe"
      />,
    )

    const table = screen.getByRole('table')
    const headers = screen.getAllByRole('columnheader')

    expect(table).toHaveClass('table-auto')
    expect(table).not.toHaveClass('table-fixed')
    expect(table).toHaveAttribute('data-table-layout', 'content-safe')
    expect(headers[0]).toHaveStyle({ minWidth: '180px' })
    expect(headers[0].style.width).toBe('')
    expect(headers[0].style.maxWidth).toBe('')
    expect(headers[1].style.width).toBe('')
    expect(headers[1].style.minWidth).toBe('')
  })

  it('marks sortable headers with the mobile target class contract', () => {
    render(
      <DataTable
        tableId="sortable-target"
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            header: 'Tên',
            enableSorting: true,
          },
        ]}
        data={data}
      />,
    )

    const target = screen.getByRole('button', {
      name: 'Sắp xếp theo cột Tên',
    })
    expect(target).toHaveAttribute('data-table-sort-target', 'true')
    expect(target).toHaveClass('min-h-11', 'min-w-11')
  })

  it('keeps sort-only columns in TanStack sorting without rendering or counting them', () => {
    const compositeColumns: ColumnDef<Row, unknown>[] = [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Tên',
        meta: {
          compositeSortOptions: [{ id: 'legacyId', label: 'Mã cũ' }],
        },
      },
      {
        id: 'legacyId',
        accessorKey: 'id',
        enableSorting: true,
        meta: { presentation: 'sort-only' },
      },
    ]
    const { rerender } = render(
      <DataTable
        tableId="sort-only"
        columns={compositeColumns}
        data={data}
        sorting={[{ id: 'legacyId', desc: true }]}
      />,
    )

    expect(screen.getAllByRole('columnheader')).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Sắp xếp theo cột Tên' }),
    ).toHaveAttribute('data-table-sort-target', 'true')
    expect(screen.getByRole('columnheader')).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    expect(screen.getAllByRole('cell')).toHaveLength(2)
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Beta')

    rerender(
      <DataTable
        tableId="sort-only"
        columns={compositeColumns}
        data={data}
        isLoading
      />,
    )
    expect(screen.getAllByRole('cell')).toHaveLength(8)

    rerender(
      <DataTable tableId="sort-only" columns={compositeColumns} data={[]} />,
    )
    expect(screen.getByText('Không có dữ liệu').closest('td')).toHaveAttribute(
      'colspan',
      '1',
    )

    rerender(
      <DataTable
        tableId="sort-only"
        columns={compositeColumns}
        data={[]}
        isError
      />,
    )
    expect(screen.getByText('Có lỗi xảy ra').closest('td')).toHaveAttribute(
      'colspan',
      '1',
    )
  })

  it('omits sort-only descriptors from config and resets group visibility', async () => {
    const user = userEvent.setup()
    useTableState.getState().setColumnVisibility('config-groups', {
      ticketRefs: false,
    })
    useTableState.getState().setDensity('config-groups', 'compact')

    render(
      <DataTableColumnConfig
        tableId="config-groups"
        columns={[
          { id: 'ticketRefs', label: 'Phiếu sửa chữa' },
          {
            id: 'soPhieu',
            label: 'Legacy sort',
            presentation: 'sort-only',
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cấu hình cột' }))
    expect(screen.getByLabelText('Phiếu sửa chữa')).not.toBeChecked()
    expect(screen.queryByText('Legacy sort')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gọn' })).toHaveClass(
      'bg-primary',
    )

    await user.click(screen.getByLabelText('Phiếu sửa chữa'))
    expect(
      useTableState.getState().getTable('config-groups').columnVisibility,
    ).toEqual({ ticketRefs: true })

    await user.click(screen.getByRole('button', { name: 'Đặt lại mặc định' }))
    expect(useTableState.getState().getTable('config-groups')).toEqual({
      columnVisibility: {},
      columnOrder: [],
      density: 'comfortable',
    })
  })

  it('migrates repair visibility to groups while preserving density', () => {
    const migrated = migrateTableState(
      {
        tables: {
          'repair-list': {
            columnVisibility: {
              tinhTrang: false,
              soPhieu: false,
              kyThuat: false,
              loaiSc: false,
              ngayNhan: false,
              ngayHt: false,
              suaChua: true,
              unrelated: false,
            },
            columnOrder: [
              'select',
              'tinhTrang',
              'soPhieu',
              'ticketRefs',
              'unrelated',
            ],
            density: 'compact',
          },
        },
      },
      0,
    ) as {
      tables: Record<
        string,
        {
          columnVisibility: Record<string, boolean>
          columnOrder: string[]
          density: string
        }
      >
    }
    const repair = migrated.tables['repair-list']

    expect(TABLE_STATE_VERSION).toBe(1)
    expect(useTableState.persist.getOptions().version).toBe(TABLE_STATE_VERSION)
    expect(repair.density).toBe('compact')
    expect(repair.columnVisibility).toMatchObject({
      status: false,
      ticketRefs: false,
      assignment: false,
      timeline: true,
      unrelated: false,
    })
    expect(repair.columnVisibility).not.toHaveProperty('tinhTrang')
    expect(repair.columnVisibility).not.toHaveProperty('ngayNhan')
    expect(repair.columnOrder).toEqual(['select', 'ticketRefs', 'unrelated'])
  })
})
