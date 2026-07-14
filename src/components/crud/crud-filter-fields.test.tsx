import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import type { FilterConfig } from '@/types/crud-types'
import { CrudFilterFields } from './crud-filter-fields'
import { countActiveFilterValues } from './crud-filter-values'

interface TestRow {
  name: string
  category: string
}

const filters: FilterConfig<TestRow>[] = [
  { key: 'name', label: 'Tên', type: 'text' },
  {
    key: 'category',
    label: 'Nhóm',
    type: 'select',
    options: [{ label: 'Nhóm A', value: 'a' }],
  },
]

function FilterFieldsHarness() {
  const [value, setValue] = useState<Record<string, unknown>>({})

  return (
    <>
      <CrudFilterFields filters={filters} value={value} onChange={setValue} />
      <output data-testid="filter-value">{JSON.stringify(value)}</output>
    </>
  )
}

describe('CrudFilterFields', () => {
  it('updates text/select values and keeps the all option as an empty filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FilterFieldsHarness />)

    await user.type(screen.getByLabelText('Tên'), 'Minh')
    await waitFor(() =>
      expect(screen.getByTestId('filter-value')).toHaveTextContent(
        '"name":"Minh"',
      ),
    )

    await user.click(screen.getByLabelText('Nhóm'))
    await user.click(screen.getByRole('option', { name: 'Nhóm A' }))
    expect(screen.getByTestId('filter-value')).toHaveTextContent(
      '"category":"a"',
    )

    await user.click(screen.getByLabelText('Nhóm'))
    await user.click(screen.getByRole('option', { name: 'Tất cả' }))
    expect(screen.getByTestId('filter-value')).toHaveTextContent(
      '"category":""',
    )
  })

  it('counts only non-empty values while retaining boolean and numeric filters', () => {
    expect(
      countActiveFilterValues({
        empty: '',
        missing: undefined,
        nullable: null,
        zero: 0,
        disabled: false,
      }),
    ).toBe(2)
  })
})
