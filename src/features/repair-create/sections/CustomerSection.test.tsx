/** Spec: shared customer section exposes the legacy route/dealer contact block. */
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { RepairCreateForm } from '../RepairCreateForm'
import { searchRepairDealers } from '../repair-dealer-options'

describe('CustomerSection', () => {
  it('renders the exact edit-parity labels', () => {
    renderWithProviders(<RepairCreateForm />)
    for (const label of [
      'Tuyến:',
      'Đại lý',
      'Đại lý chính:',
      'Điện thoại 2:',
      'Email:',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('derives Đại lý chính from the selected dealer without a stored field', async () => {
    const user = userEvent.setup()
    const dealer = (await searchRepairDealers(''))[0]
    renderWithProviders(<RepairCreateForm />)

    const combobox = screen.getByRole('combobox', { name: 'Đại lý' })
    await user.click(combobox)
    await user.type(combobox, dealer.dienThoai!)
    await user.click(await screen.findByRole('option', { name: dealer.label }))

    expect(screen.getByLabelText('Đại lý chính:')).toHaveValue(
      dealer.daiLyChinh,
    )
  })
})
