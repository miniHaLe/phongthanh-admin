import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('describes a missing route without calling it under development', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: 'Không tìm thấy trang' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Đang phát triển/)).not.toBeInTheDocument()
  })
})
