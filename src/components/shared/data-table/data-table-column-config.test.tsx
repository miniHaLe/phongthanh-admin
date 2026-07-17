import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  DataTableColumnConfig,
  type ColumnDescriptor,
} from './data-table-column-config'
import { useTableState } from './use-table-state'

const COLUMNS: ColumnDescriptor[] = [
  { id: 'name', label: 'Tên' },
  { id: 'phone', label: 'Điện thoại', initiallyHidden: true },
  { id: 'tax', label: 'Mã số thuế', initiallyHidden: true },
  { id: 'legacySort', label: 'Sắp xếp cũ', presentation: 'sort-only' },
]

beforeEach(() => {
  useTableState.setState({ tables: {} })
  localStorage.clear()
})

describe('DataTableColumnConfig hidden-count badge', () => {
  it('shows the hidden count from initiallyHidden defaults', () => {
    render(<DataTableColumnConfig tableId="badge" columns={COLUMNS} />)
    expect(screen.getByText('2 ẩn')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cấu hình cột (2 cột đang ẩn)' }),
    ).toBeInTheDocument()
  })

  it('merges persisted overrides into the count', () => {
    useTableState.getState().setColumnVisibility('badge', {
      phone: true, // re-enabled by the user
      name: false, // manually hidden
    })
    render(<DataTableColumnConfig tableId="badge" columns={COLUMNS} />)
    // hidden = tax (default) + name (persisted) = 2
    expect(screen.getByText('2 ẩn')).toBeInTheDocument()
  })

  it('renders no badge when nothing is hidden', () => {
    render(
      <DataTableColumnConfig
        tableId="badge"
        columns={[{ id: 'name', label: 'Tên' }]}
      />,
    )
    expect(screen.queryByText(/ẩn/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cấu hình cột' }),
    ).toBeInTheDocument()
  })

  it('never counts sort-only columns', () => {
    render(
      <DataTableColumnConfig
        tableId="badge"
        columns={[
          { id: 'name', label: 'Tên' },
          {
            id: 'legacySort',
            label: 'Sắp xếp cũ',
            presentation: 'sort-only',
            initiallyHidden: true,
          },
        ]}
      />,
    )
    expect(screen.queryByText(/ẩn/)).not.toBeInTheDocument()
  })
})

describe('DataTableColumnConfig "Hiện tất cả"', () => {
  it('writes explicit true for every hidden id and clears the badge', async () => {
    const user = userEvent.setup()
    render(<DataTableColumnConfig tableId="show-all" columns={COLUMNS} />)

    await user.click(
      screen.getByRole('button', { name: 'Cấu hình cột (2 cột đang ẩn)' }),
    )
    await user.click(screen.getByRole('button', { name: 'Hiện tất cả' }))

    expect(
      useTableState.getState().getTable('show-all').columnVisibility,
    ).toEqual({ phone: true, tax: true })
    expect(screen.queryByText(/ẩn/)).not.toBeInTheDocument()
  })

  it('preserves existing persisted entries when showing all', async () => {
    const user = userEvent.setup()
    useTableState.getState().setColumnVisibility('show-all', { name: false })
    render(<DataTableColumnConfig tableId="show-all" columns={COLUMNS} />)

    await user.click(screen.getByRole('button', { name: /Cấu hình cột/ }))
    await user.click(screen.getByRole('button', { name: 'Hiện tất cả' }))

    expect(
      useTableState.getState().getTable('show-all').columnVisibility,
    ).toEqual({ name: true, phone: true, tax: true })
  })

  it('is disabled when nothing is hidden', async () => {
    const user = userEvent.setup()
    render(
      <DataTableColumnConfig
        tableId="show-all"
        columns={[{ id: 'name', label: 'Tên' }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cấu hình cột' }))
    expect(screen.getByRole('button', { name: 'Hiện tất cả' })).toBeDisabled()
  })

  it('reappears after "Đặt lại mặc định" restores config defaults', async () => {
    const user = userEvent.setup()
    render(<DataTableColumnConfig tableId="reset" columns={COLUMNS} />)

    await user.click(screen.getByRole('button', { name: /Cấu hình cột/ }))
    await user.click(screen.getByRole('button', { name: 'Hiện tất cả' }))
    expect(screen.queryByText(/ẩn/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Đặt lại mặc định' }))
    expect(screen.getByText('2 ẩn')).toBeInTheDocument()
  })
})
