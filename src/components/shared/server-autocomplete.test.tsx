/** Spec: ServerAutocomplete debounced fetch, {id,label} binding, [+] quick-create. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ServerAutocomplete,
  type AutocompleteOption,
} from './server-autocomplete'

const OPTIONS: AutocompleteOption[] = [
  { id: '1', label: 'Samsung' },
  { id: '2', label: 'LG' },
]

function Harness({
  fetchOptions,
  withQuickCreate,
}: {
  fetchOptions: (q: string) => Promise<AutocompleteOption[]>
  withQuickCreate?: boolean
}) {
  const [value, setValue] = useState<AutocompleteOption | null>(null)
  return (
    <>
      <div data-testid="value">{value?.label ?? '—'}</div>
      <ServerAutocomplete
        value={value}
        onChange={setValue}
        fetchOptions={fetchOptions}
        placeholder="Chọn NSX"
        debounceMs={10}
        quickCreate={
          withQuickCreate
            ? {
                title: 'Thêm NSX',
                renderForm: (_close, select) => (
                  <button onClick={() => select({ id: '9', label: 'Mới' })}>
                    Tạo
                  </button>
                ),
              }
            : undefined
        }
      />
    </>
  )
}

describe('ServerAutocomplete', () => {
  afterEach(() => vi.restoreAllMocks())

  it('fetches options on typing and binds the selected {id,label}', async () => {
    const user = userEvent.setup()
    const fetchOptions = vi.fn(async () => OPTIONS)
    render(<Harness fetchOptions={fetchOptions} />)

    await user.click(screen.getByLabelText('Chọn NSX'))
    await user.type(screen.getByLabelText('Chọn NSX'), 'sam')
    await waitFor(() => expect(fetchOptions).toHaveBeenCalled())

    await user.click(await screen.findByRole('option', { name: 'Samsung' }))
    expect(screen.getByTestId('value').textContent).toBe('Samsung')
  })

  it('shows the [+] button only with quickCreate and creates+selects', async () => {
    const user = userEvent.setup()
    const fetchOptions = vi.fn(async () => OPTIONS)
    render(<Harness fetchOptions={fetchOptions} withQuickCreate />)

    await user.click(screen.getByLabelText('Thêm mới'))
    await user.click(await screen.findByRole('button', { name: 'Tạo' }))
    expect(screen.getByTestId('value').textContent).toBe('Mới')
  })

  it('hides the [+] button when quickCreate is absent', () => {
    render(<Harness fetchOptions={async () => OPTIONS} />)
    expect(screen.queryByLabelText('Thêm mới')).not.toBeInTheDocument()
  })
})
