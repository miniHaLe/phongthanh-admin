/** Spec: dispatch modal title + empty-tech save guard. */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { DispatchTechnicianModal } from './dispatch-technician-modal'

const notifyError = vi.fn()
vi.mock('@/components/shared', async (orig) => {
  const actual = await orig<typeof import('@/components/shared')>()
  return { ...actual, notify: { ...actual.notify, error: (m?: string) => notifyError(m) } }
})

beforeEach(() => notifyError.mockClear())

describe('DispatchTechnicianModal', () => {
  it('shows the "Đổi kỹ thuật" title', () => {
    renderWithProviders(
      <DispatchTechnicianModal open onOpenChange={() => {}} ids={['x']} />,
    )
    expect(screen.getByText('Đổi kỹ thuật')).toBeInTheDocument()
  })

  it('shows the "Điều phối in" title in the print variant', () => {
    renderWithProviders(
      <DispatchTechnicianModal open onOpenChange={() => {}} ids={['x']} printAfter />,
    )
    expect(screen.getByText('Điều phối in')).toBeInTheDocument()
  })

  it('guards with "Vui lòng chọn kỹ thuật!" when saving without a technician', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DispatchTechnicianModal open onOpenChange={() => {}} ids={['x']} />,
    )
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(notifyError).toHaveBeenCalledWith('Vui lòng chọn kỹ thuật!')
  })
})
