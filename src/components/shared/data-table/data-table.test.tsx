/** Characterization: DataTable core behavior survives the row-selection add. */
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
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

  it('keeps rows visible and announces a background refresh', () => {
    render(
      <DataTable
        tableId="background-refresh"
        columns={columns}
        data={data}
        isFetching
        scrollLabel="Bảng đang cập nhật"
      />,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đang cập nhật…')
    expect(screen.getByLabelText('Bảng đang cập nhật')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.getByRole('table')).toHaveClass('opacity-60')
  })

  it('keeps initial loading on skeleton rows instead of stale data', () => {
    render(
      <DataTable
        tableId="initial-loading"
        columns={columns}
        data={data}
        isLoading
        isFetching
      />,
    )

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.queryByText('Đang cập nhật…')).not.toBeInTheDocument()
    expect(screen.getAllByRole('cell')).toHaveLength(8)
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

  it('preserves server-provided order when sorting is manual', () => {
    const serverOrderedData: Row[] = [
      { id: '1', name: 'Bùi' },
      { id: '2', name: 'Đặng' },
      { id: '3', name: 'Vũ' },
    ]
    render(
      <DataTable
        tableId="manual-sort"
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            header: 'Tên',
            enableSorting: true,
          },
        ]}
        data={serverOrderedData}
        sorting={[{ id: 'name', desc: false }]}
        manualSorting
      />,
    )

    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['Bùi', 'Đặng', 'Vũ'],
    )
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

  it('starts configured hidden columns hidden while allowing persisted overrides', () => {
    const hiddenColumns: ColumnDef<Row, unknown>[] = [
      { id: 'name', accessorKey: 'name', header: 'Tên' },
      {
        id: 'id',
        accessorKey: 'id',
        header: 'Mã',
        meta: { initiallyHidden: true },
      },
    ]
    const { rerender } = render(
      <DataTable
        tableId="initial-hidden"
        columns={hiddenColumns}
        data={data}
      />,
    )

    expect(screen.queryByText('Mã')).not.toBeInTheDocument()
    useTableState.getState().setColumnVisibility('initial-hidden', { id: true })
    rerender(
      <DataTable
        tableId="initial-hidden"
        columns={hiddenColumns}
        data={data}
      />,
    )
    expect(screen.getByText('Mã')).toBeInTheDocument()
  })

  describe('width-aware default visibility', () => {
    const hiddenColumns: ColumnDef<Row, unknown>[] = [
      { id: 'name', accessorKey: 'name', header: 'Tên' },
      {
        id: 'id',
        accessorKey: 'id',
        header: 'Mã',
        meta: { initiallyHidden: true },
      },
    ]

    function stubWideViewport(matches: boolean) {
      const listeners = new Set<(event: { matches: boolean }) => void>()
      const mql = {
        matches,
        media: '(min-width: 1920px)',
        addEventListener: (
          _type: string,
          listener: (event: { matches: boolean }) => void,
        ) => listeners.add(listener),
        removeEventListener: (
          _type: string,
          listener: (event: { matches: boolean }) => void,
        ) => listeners.delete(listener),
      }
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => mql),
      )
      return {
        setMatches(next: boolean) {
          mql.matches = next
          listeners.forEach((listener) => listener({ matches: next }))
        },
      }
    }

    afterEach(() => vi.unstubAllGlobals())

    it('shows initiallyHidden columns by default at wide viewports', () => {
      stubWideViewport(true)
      render(
        <DataTable tableId="wide-default" columns={hiddenColumns} data={data} />,
      )
      expect(screen.getByText('Mã')).toBeInTheDocument()
    })

    it('keeps a persisted false hidden even at wide viewports', () => {
      stubWideViewport(true)
      useTableState
        .getState()
        .setColumnVisibility('wide-persisted', { id: false })
      render(
        <DataTable
          tableId="wide-persisted"
          columns={hiddenColumns}
          data={data}
        />,
      )
      expect(screen.queryByText('Mã')).not.toBeInTheDocument()
    })

    it('flips only non-persisted columns when crossing the breakpoint', () => {
      const media = stubWideViewport(false)
      useTableState
        .getState()
        .setColumnVisibility('resize-flip', { name: true })
      render(
        <DataTable tableId="resize-flip" columns={hiddenColumns} data={data} />,
      )
      expect(screen.queryByText('Mã')).not.toBeInTheDocument()

      act(() => media.setMatches(true))
      expect(screen.getByText('Mã')).toBeInTheDocument()

      act(() => media.setMatches(false))
      expect(screen.queryByText('Mã')).not.toBeInTheDocument()
    })

    it('config popover fallback matches the table at wide viewports', () => {
      stubWideViewport(true)
      render(
        <DataTableColumnConfig
          tableId="wide-config"
          columns={[
            { id: 'name', label: 'Tên' },
            { id: 'id', label: 'Mã', initiallyHidden: true },
          ]}
        />,
      )
      // Wide default = visible, so no hidden-count badge.
      expect(screen.queryByText(/ẩn/)).not.toBeInTheDocument()
    })
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

    await user.click(
      screen.getByRole('button', { name: 'Cấu hình cột (1 cột đang ẩn)' }),
    )
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

  it('shows configured hidden columns unchecked until the user enables them', async () => {
    const user = userEvent.setup()
    render(
      <DataTableColumnConfig
        tableId="hidden-config"
        columns={[{ id: 'notes', label: 'Ghi chú', initiallyHidden: true }]}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Cấu hình cột (1 cột đang ẩn)' }),
    )
    expect(screen.getByLabelText('Ghi chú')).not.toBeChecked()
    await user.click(screen.getByLabelText('Ghi chú'))
    expect(
      useTableState.getState().getTable('hidden-config').columnVisibility,
    ).toEqual({ notes: true })
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
