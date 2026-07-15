import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import type { CrudConfig } from '@/types/crud-types'
import { CrudSheet } from './CrudSheet'

interface TestRow {
  id: string
  createdAt: string
  active: boolean
  khoId: string
}

function config(
  loadOptions: () => Promise<Array<{ label: string; value: string }>>,
): CrudConfig<TestRow> {
  return {
    resourceKey: 'test-row',
    title: 'Bản ghi',
    columns: [],
    fields: [
      {
        key: 'khoId',
        label: 'Nhà kho',
        type: 'select',
        loadOptions,
      },
    ],
    mockApi: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  }
}

describe('CrudSheet async options', () => {
  it('loads select options when the sheet opens', async () => {
    const user = userEvent.setup()
    const loadOptions = vi
      .fn()
      .mockResolvedValue([{ label: 'Kho đồng bộ', value: 'nk-sync' }])
    renderWithProviders(
      <CrudSheet
        config={config(loadOptions)}
        mode="create"
        open
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    await waitFor(() => expect(loadOptions).toHaveBeenCalledOnce())
    await user.click(screen.getByRole('combobox'))
    expect(
      await screen.findByRole('option', { name: 'Kho đồng bộ' }),
    ).toBeInTheDocument()
  })
})
