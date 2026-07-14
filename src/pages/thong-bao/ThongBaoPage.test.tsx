/** Spec: /thong-bao renders the notification feed with status columns. */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import ThongBaoPage from './ThongBaoPage'
import { useNotificationStore } from '@/store/notification-store'
import { STATUS_HEX, STATUS_LABEL } from '@/domains/repair/status'

describe('ThongBaoPage', () => {
  it('renders the page heading and the first feed row', () => {
    renderWithProviders(<ThongBaoPage />)
    const first = useNotificationStore.getState().notifications[0]
    expect(screen.getAllByText('Thông báo')[0]).toBeInTheDocument()
    expect(screen.getByText(first.phieuCode)).toBeInTheDocument()
    expect(
      screen.getAllByText(STATUS_LABEL[first.statusId]).length,
    ).toBeGreaterThan(0)
    expect(
      document.querySelector(
        `[data-status-variant="solid"][data-status-id="${first.statusId}"]`,
      ),
    ).toHaveStyle({ backgroundColor: STATUS_HEX[first.statusId] })
    expect(
      screen.getByRole('button', { name: 'Đánh dấu tất cả là đã đọc' }),
    ).toBeInTheDocument()
  })
})
