import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServerAutocomplete } from './server-autocomplete'

describe('ServerAutocomplete', () => {
  it('supports keyboard selection and contextual quick-create labels', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ServerAutocomplete
        value={null}
        onChange={onChange}
        debounceMs={0}
        fetchOptions={async () => [
          { id: 'one', label: 'Một' },
          { id: 'two', label: 'Hai' },
        ]}
        placeholder="Chọn giá trị"
        quickCreate={{
          title: 'Thêm model',
          renderForm: () => null,
        }}
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Chọn giá trị' })
    await user.click(input)
    expect(
      await screen.findByRole('option', { name: 'Một' }),
    ).toBeInTheDocument()

    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenLastCalledWith({ id: 'two', label: 'Hai' })
    expect(
      screen.getByRole('button', { name: 'Thêm model' }),
    ).toBeInTheDocument()
  })

  it('shows a recoverable error instead of rejecting when option loading fails', async () => {
    const user = userEvent.setup()
    render(
      <ServerAutocomplete
        value={null}
        onChange={vi.fn()}
        debounceMs={0}
        fetchOptions={async () => {
          throw new Error('offline')
        }}
        placeholder="Tìm lỗi"
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Tìm lỗi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không thể tải dữ liệu. Vui lòng thử lại.',
    )
  })
})
