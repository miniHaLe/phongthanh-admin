/** Spec: legacy DSTraLKXac toolbar labels. */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { PartReturnXacBatchToolbar } from './part-return-xac-batch-toolbar'

describe('PartReturnXacBatchToolbar', () => {
  it('uses the exact legacy Trả hãng action label', () => {
    renderWithProviders(
      <PartReturnXacBatchToolbar
        selected={[]}
        allRows={[]}
        onReload={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Trả hãng' })).toBeInTheDocument()
  })
})
