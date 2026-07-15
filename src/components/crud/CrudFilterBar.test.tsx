import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CrudFilterBar } from './CrudFilterBar'

interface TestRow {
  khoId: string
}

describe('CrudFilterBar async options', () => {
  it('keeps static fallback options and reports a loader error', async () => {
    const user = userEvent.setup()
    const loadOptions = vi.fn().mockRejectedValue(new Error('offline'))
    render(
      <CrudFilterBar<TestRow>
        filters={[
          {
            key: 'khoId',
            label: 'Nhà kho',
            type: 'select',
            options: [{ label: 'Kho dự phòng', value: 'nk-fallback' }],
            loadOptions,
          },
        ]}
        value={{}}
        onChange={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Bộ lọc/ }))
    await waitFor(() => expect(loadOptions).toHaveBeenCalledOnce())
    expect(
      await screen.findByText(/đang dùng dữ liệu có sẵn/i),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('Kho dự phòng')).toBeInTheDocument()
  })
})
