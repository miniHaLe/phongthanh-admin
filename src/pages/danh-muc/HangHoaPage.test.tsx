import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import HangHoaPage from './HangHoaPage'

describe('HangHoaPage export label', () => {
  it('uses the standardized plain list export label', () => {
    renderWithProviders(<HangHoaPage />)
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
  })
})
