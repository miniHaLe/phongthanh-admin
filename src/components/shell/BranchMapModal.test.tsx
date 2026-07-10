/** Spec: Bản đồ chi nhánh modal — title, Search Box, branch list, store open. */
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { BranchMapModal, useBranchMapStore } from './BranchMapModal'
import { BRANCHES } from '@/mock/seed/branches'

beforeEach(() => useBranchMapStore.setState({ open: false }))

describe('BranchMapModal', () => {
  it('is closed by default and opens via the store', async () => {
    renderWithProviders(<BranchMapModal />)
    expect(screen.queryByText('Bản đồ chi nhánh')).not.toBeInTheDocument()

    useBranchMapStore.getState().openModal()
    expect(await screen.findByText('Bản đồ chi nhánh')).toBeInTheDocument()
  })

  it('shows the "Search Box" input and lists seeded branches', async () => {
    useBranchMapStore.setState({ open: true })
    renderWithProviders(<BranchMapModal />)
    expect(
      await screen.findByPlaceholderText('Search Box'),
    ).toBeInTheDocument()
    for (const b of BRANCHES) {
      expect(screen.getByText(b.name)).toBeInTheDocument()
    }
  })
})
