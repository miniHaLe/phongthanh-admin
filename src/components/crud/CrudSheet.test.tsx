import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CrudConfig, MockApi } from '@/types/crud-types'
import { CrudSheet } from './CrudSheet'

interface TestRow {
  id: string
  name: string
  quantity: number
}

const mockApi: MockApi<TestRow> = {
  list: async () => ({ data: [], total: 0, page: 1, pageSize: 20 }),
  get: async (id) => ({ id, name: '', quantity: 1 }),
  create: async (data) => ({ id: 'created', ...data }),
  update: async (id, data) => ({ id, name: '', quantity: 1, ...data }),
  remove: async () => undefined,
}

function config(fields: CrudConfig<TestRow>['fields']): CrudConfig<TestRow> {
  return {
    resourceKey: 'crud-sheet-test',
    title: 'Bản ghi',
    saveAndNew: true,
    columns: [],
    fields,
    mockApi,
  }
}

function renderSheet(
  sheetConfig: CrudConfig<TestRow>,
  onSubmit: (data: Partial<TestRow>, saveAndNew?: boolean) => Promise<void>,
  onClose = vi.fn(),
) {
  return {
    onClose,
    ...render(
      <CrudSheet
        config={sheetConfig}
        mode="create"
        open
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    ),
  }
}

describe('CrudSheet submission', () => {
  it('loads asynchronous select options when opened', async () => {
    const user = userEvent.setup()
    const loadOptions = vi
      .fn()
      .mockResolvedValue([{ label: 'Kho đồng bộ', value: 'nk-sync' }])
    renderSheet(
      config([
        {
          key: 'name',
          label: 'Nhà kho',
          type: 'select',
          loadOptions,
        },
      ]),
      vi.fn().mockResolvedValue(undefined),
    )

    await waitFor(() => expect(loadOptions).toHaveBeenCalledOnce())
    await user.click(screen.getByRole('combobox'))
    expect(
      await screen.findByRole('option', { name: 'Kho đồng bộ' }),
    ).toBeInTheDocument()
  })

  it('resets Save & New only after the mutation resolves', async () => {
    const user = userEvent.setup()
    let resolveSubmit: (() => void) | undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    renderSheet(
      config([{ key: 'name', label: 'Tên', type: 'text', required: true }]),
      onSubmit,
    )

    const input = screen.getByLabelText('Tên*')
    await user.type(input, 'Giữ đến khi lưu xong')
    await user.click(screen.getByRole('button', { name: 'Lưu & Thêm mới' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(input).toHaveValue('Giữ đến khi lưu xong')

    await act(async () => resolveSubmit?.())
    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('preserves typed input when Save & New fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('save failed'))
    renderSheet(
      config([{ key: 'name', label: 'Tên', type: 'text', required: true }]),
      onSubmit,
    )

    const input = screen.getByLabelText('Tên*')
    await user.type(input, 'Không được mất')
    await user.click(screen.getByRole('button', { name: 'Lưu & Thêm mới' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(input).toHaveValue('Không được mất')
  })

  it('rejects a blank required number instead of coercing it to zero', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderSheet(
      config([
        {
          key: 'quantity',
          label: 'Số lượng',
          type: 'number',
          required: true,
        },
      ]),
      onSubmit,
    )

    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(await screen.findByText('Phải là số')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('closes a clean sheet immediately', async () => {
    const user = userEvent.setup()
    const { onClose } = renderSheet(
      config([{ key: 'name', label: 'Tên', type: 'text' }]),
      vi.fn().mockResolvedValue(undefined),
    )

    await user.click(screen.getByRole('button', { name: 'Đóng' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.queryByText('Bỏ thay đổi chưa lưu?')).not.toBeInTheDocument()
  })

  it('prompts before canceling or escaping a dirty sheet', async () => {
    const user = userEvent.setup()
    const { onClose } = renderSheet(
      config([{ key: 'name', label: 'Tên', type: 'text' }]),
      vi.fn().mockResolvedValue(undefined),
    )

    await user.type(screen.getByLabelText('Tên'), 'Chưa lưu')
    await user.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(screen.getByText('Bỏ thay đổi chưa lưu?')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }))
    expect(screen.getByLabelText('Tên')).toHaveValue('Chưa lưu')

    await user.keyboard('{Escape}')
    expect(screen.getByText('Bỏ thay đổi chưa lưu?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
