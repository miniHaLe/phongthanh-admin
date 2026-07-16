/** Spec: legacy repair update adds manufacturer/model notes to the shared form. */
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { RepairCreateForm } from '../RepairCreateForm'

describe('DeviceSection', () => {
  it('renders the exact edit-parity note labels', () => {
    renderWithProviders(<RepairCreateForm />)
    expect(screen.getByLabelText('Ghi chú NSX')).toBeInTheDocument()
    expect(screen.getByLabelText('Ghi chú model')).toBeInTheDocument()
  })
})
