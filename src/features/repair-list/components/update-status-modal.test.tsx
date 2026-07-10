/** Spec: Đổi tình trạng modal — title, options, conditional fields, buttons. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { UpdateStatusModal } from './update-status-modal'

describe('UpdateStatusModal', () => {
  it('shows the title and Lưu / Lưu & SMS buttons', () => {
    renderWithProviders(
      <UpdateStatusModal open onOpenChange={() => {}} ids={['x']} />,
    )
    expect(screen.getByText('Đổi tình trạng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & SMS' })).toBeInTheDocument()
  })

  it('baoGia variant preselects Báo Giá and shows the Giá field', () => {
    renderWithProviders(
      <UpdateStatusModal open onOpenChange={() => {}} ids={['x']} baoGia />,
    )
    expect(screen.getByText('Giá')).toBeInTheDocument()
  })

  it('a Sửa Xong initial status shows Cách giải quyết', () => {
    renderWithProviders(
      <UpdateStatusModal
        open
        onOpenChange={() => {}}
        ids={['x']}
        initialStatus={9}
      />,
    )
    expect(screen.getByText('Cách giải quyết')).toBeInTheDocument()
  })

  it('guards when saving with no status chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <UpdateStatusModal open onOpenChange={() => {}} ids={['x']} />,
    )
    // No initialStatus → save should not throw; button is present.
    expect(
      await screen.findByRole('button', { name: 'Lưu' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
  })
})
