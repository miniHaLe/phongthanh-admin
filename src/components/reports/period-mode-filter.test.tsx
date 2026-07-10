/**
 * Spec: PeriodModeFilter renders all three period fieldsets simultaneously
 * with the reference radio labels, and switching mode calls onModeChange.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { renderWithProviders } from '@/test/render-with-providers'
import { PeriodModeFilter } from './period-mode-filter'

function Harness({ onModeChange }: { onModeChange: (m: 'ngay' | 'thang' | 'nam') => void }) {
  const form = useForm({
    defaultValues: {
      tuNgay: '2026-01-01',
      denNgay: '2026-01-31',
      nam: 2026,
      tuThang: 1,
      denThang: 12,
      tuNam: 2025,
      denNam: 2026,
    },
  })
  return (
    <FormProvider {...form}>
      <PeriodModeFilter mode="ngay" onModeChange={onModeChange} />
    </FormProvider>
  )
}

describe('PeriodModeFilter', () => {
  it('renders the three Day/Month/Year radio labels simultaneously', () => {
    renderWithProviders(<Harness onModeChange={() => {}} />)
    expect(screen.getByText('Xem theo ngày')).toBeInTheDocument()
    expect(screen.getByText('Xem theo tháng')).toBeInTheDocument()
    expect(screen.getByText('Xem theo năm')).toBeInTheDocument()
  })

  it('renders all three fieldsets fields at once (Từ ngày, Năm, Từ năm all present)', () => {
    renderWithProviders(<Harness onModeChange={() => {}} />)
    expect(screen.getByLabelText('Từ ngày')).toBeInTheDocument()
    expect(screen.getByLabelText('Năm')).toBeInTheDocument()
    expect(screen.getByLabelText('Từ năm')).toBeInTheDocument()
  })

  it('calls onModeChange when a different radio is selected', async () => {
    const user = userEvent.setup()
    const onModeChange = vi.fn()
    renderWithProviders(<Harness onModeChange={onModeChange} />)
    await user.click(screen.getByRole('radio', { name: 'Xem theo năm' }))
    expect(onModeChange).toHaveBeenCalledWith('nam')
  })
})
