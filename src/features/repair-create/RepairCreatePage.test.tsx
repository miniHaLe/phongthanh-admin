/** Spec: repair-create page-level legacy toolbar labels. */
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import RepairCreatePage from './RepairCreatePage'

describe('RepairCreatePage', () => {
  it('uses Đóng for the secondary return-to-list action', () => {
    renderWithProviders(<RepairCreatePage />)
    expect(screen.getByRole('link', { name: 'Đóng' })).toHaveAttribute(
      'href',
      '/sua-chua-bao-hanh',
    )
  })
})
