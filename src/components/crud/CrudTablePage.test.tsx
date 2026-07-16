import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { notify } from '@/components/shared'
import { renderWithProviders } from '@/test/render-with-providers'
import type { CrudConfig, MockApi } from '@/types/crud-types'
import { CrudTablePage } from './CrudTablePage'
import { exportCurrentCrudPage } from './export-crud-rows'

vi.mock('./export-crud-rows', () => ({
  exportCurrentCrudPage: vi.fn(async () => undefined),
}))

interface TestRow {
  id: string
  name: string
  nullable: string | null
  customEmpty: string
}

const row: TestRow = {
  id: 'row-1',
  name: 'Khách hàng hiển thị',
  nullable: null,
  customEmpty: 'ignored',
}

const mockApi: MockApi<TestRow> = {
  list: async () => ({ data: [row], total: 1, page: 1, pageSize: 20 }),
  get: async () => row,
  create: async (data) => ({ ...row, ...data }),
  update: async (_id, data) => ({ ...row, ...data }),
  remove: async () => undefined,
}

const config: CrudConfig<TestRow> = {
  resourceKey: 'crud-cell-regression',
  title: 'Kiểm thử ô dữ liệu',
  mockApi,
  columns: [
    { key: 'name', header: 'Tên khách hàng' },
    { key: 'nullable', header: 'Giá trị rỗng' },
    {
      key: 'customEmpty',
      header: 'Renderer rỗng',
      renderCell: () => '',
    },
  ],
  fields: [],
}

describe('CrudTablePage cell rendering', () => {
  it('renders plain accessor values and normalizes empty outputs', async () => {
    renderWithProviders(
      <CrudTablePage config={config} routePattern="/crud-cell-regression" />,
      { route: '/crud-cell-regression' },
    )

    expect(await screen.findByText('Khách hàng hiển thị')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('uses the legacy default add label', async () => {
    renderWithProviders(
      <CrudTablePage config={config} routePattern="/crud-cell-regression" />,
      { route: '/crud-cell-regression' },
    )

    expect(
      await screen.findByRole('button', { name: 'Thêm Mới' }),
    ).toBeInTheDocument()
  })

  it('uses the shared current-page export path and standardized label', async () => {
    const user = userEvent.setup()
    const exportConfig = { ...config, export: true }
    renderWithProviders(
      <CrudTablePage
        config={exportConfig}
        routePattern="/crud-cell-regression"
      />,
      { route: '/crud-cell-regression' },
    )

    await screen.findByText('Khách hàng hiển thị')
    await user.click(screen.getByRole('button', { name: 'Xuất Excel' }))
    expect(exportCurrentCrudPage).toHaveBeenCalledWith(exportConfig, [row])
  })

  it('renders configured filters through FilterPanel and clears active values', async () => {
    const user = userEvent.setup()
    const filterConfig: CrudConfig<TestRow> = {
      ...config,
      filters: [{ key: 'name', label: 'Tên khách hàng', type: 'text' }],
    }
    renderWithProviders(
      <CrudTablePage
        config={filterConfig}
        routePattern="/crud-cell-regression"
      />,
      { route: '/crud-cell-regression' },
    )

    const toggle = screen.getByRole('button', { name: 'Bộ lọc' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)

    const input = screen.getByLabelText('Tên khách hàng')
    await user.type(input, 'Minh')
    expect(input).toHaveValue('Minh')

    const clearButton = screen.getByRole('button', { name: 'Xóa bộ lọc' })
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
    await waitFor(() => expect(clearButton).toBeEnabled())
    await user.click(clearButton)
    expect(input).toHaveValue('')
    expect(clearButton).toBeDisabled()
  })

  it('shows a filtered-empty state with one-click query reset', async () => {
    const user = userEvent.setup()
    const filterConfig: CrudConfig<TestRow> = {
      ...config,
      filters: [{ key: 'name', label: 'Tên khách hàng', type: 'text' }],
      mockApi: {
        ...mockApi,
        list: async (params) => {
          const hasFilter = Boolean(params.filters?.name)
          return {
            data: hasFilter ? [] : [row],
            total: hasFilter ? 0 : 1,
            page: 1,
            pageSize: 20,
          }
        },
      },
    }
    renderWithProviders(
      <CrudTablePage
        config={filterConfig}
        routePattern="/crud-cell-regression"
      />,
      { route: '/crud-cell-regression' },
    )

    await screen.findByText('Khách hàng hiển thị')
    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    await user.type(screen.getByLabelText('Tên khách hàng'), 'Không khớp')

    expect(
      await screen.findByText('Không tìm thấy kết quả'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc' }),
    )
    expect(await screen.findByText('Khách hàng hiển thị')).toBeInTheDocument()
    expect(screen.getByLabelText('Tên khách hàng')).toHaveValue('')
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CrudTablePage bulk delete', () => {
  it('reports exact counts and preserves failed row selections', async () => {
    const user = userEvent.setup()
    const rows = [
      { id: 'ok-1', name: 'Xóa được 1' },
      { id: 'failed', name: 'Không xóa được' },
      { id: 'ok-2', name: 'Xóa được 2' },
    ]
    const remove = vi.fn(async (id: string) => {
      if (id === 'failed') throw new Error('delete failed')
      const index = rows.findIndex((item) => item.id === id)
      rows.splice(index, 1)
    })
    const bulkConfig: CrudConfig<(typeof rows)[number]> = {
      resourceKey: 'crud-bulk-regression',
      title: 'Kiểm thử xóa hàng loạt',
      bulkDelete: true,
      columns: [{ key: 'name', header: 'Tên' }],
      fields: [],
      mockApi: {
        list: async () => ({
          data: [...rows],
          total: rows.length,
          page: 1,
          pageSize: 20,
        }),
        get: async (id) => rows.find((item) => item.id === id)!,
        create: async (data) => ({ id: 'created', ...data }),
        update: async (id, data) => ({ id, name: '', ...data }),
        remove,
      },
    }
    const errorToast = vi.spyOn(notify, 'error')

    renderWithProviders(
      <CrudTablePage
        config={bulkConfig}
        routePattern="/crud-bulk-regression"
      />,
      { route: '/crud-bulk-regression' },
    )

    const checkboxes = await screen.findAllByLabelText('Chọn dòng')
    for (const checkbox of checkboxes) await user.click(checkbox)
    await user.click(
      within(
        screen.getByRole('region', { name: 'Thao tác hàng loạt' }),
      ).getByRole('button', { name: 'Xóa' }),
    )
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Xóa',
      }),
    )

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith('Đã xóa: 2 thành công / 1 lỗi'),
    )
    expect(await screen.findByText('Không xóa được')).toBeInTheDocument()
    expect(screen.queryByText('Xóa được 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Xóa được 2')).not.toBeInTheDocument()
    expect(screen.getByText('Đã chọn 1 dòng')).toBeInTheDocument()
    expect(screen.getByLabelText('Chọn dòng')).toBeChecked()
  })
})
