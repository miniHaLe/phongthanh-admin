/** Spec: Công Nợ list — 10 verified columns, NO checkbox, no create button, no KPI strip. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { CONG_NO_COLUMN_LABELS } from '@/config/finance-tables/cong-no.config'
import CongNoPage from './CongNoPage'

describe('CongNoPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders exactly the 10 verified column headers, no leading checkbox', async () => {
    renderWithProviders(<CongNoPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    expect(headerCells).toHaveLength(CONG_NO_COLUMN_LABELS.length)
    CONG_NO_COLUMN_LABELS.forEach((label, i) => {
      expect(headerCells[i]).toHaveTextContent(label)
    })
  })

  it('has no create button and no KPI strip', () => {
    renderWithProviders(<CongNoPage />)
    expect(screen.queryByRole('button', { name: /^Thêm/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Phải thu')).not.toBeInTheDocument()
  })

  it('renders a Thanh toán action per settleable row', async () => {
    renderWithProviders(<CongNoPage />)
    const buttons = await screen.findAllByRole('button', { name: 'Thanh toán' })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
