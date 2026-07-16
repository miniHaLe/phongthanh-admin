/** Spec: legacy RepairingStatusHistory search, export, unseen filter, columns. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import * as exportXlsx from '@/lib/export-xlsx'
import { useNotificationStore } from '@/store/notification-store'
import ThongBaoPage from './ThongBaoPage'

const HEADERS_IN_ORDER = [
  'Nhà sản xuất',
  'Số tiếp nhận',
  'NDSC',
  'Người tạo',
  'Ngày tạo',
  'Xem',
]

describe('ThongBaoPage', () => {
  beforeEach(() => {
    useNotificationStore.setState(useNotificationStore.getInitialState(), true)
  })

  it('renders the exact legacy columns in order', async () => {
    renderWithProviders(<ThongBaoPage />)
    const headers = await screen.findAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual(
      HEADERS_IN_ORDER,
    )
  })

  it('searches status-history rows by receipt number', async () => {
    const user = userEvent.setup()
    const [first, second] = useNotificationStore.getState().notifications
    renderWithProviders(<ThongBaoPage />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Tìm kiếm' }),
      first.phieuCode,
    )

    expect(screen.getByText(first.phieuCode)).toBeInTheDocument()
    expect(screen.queryByText(second.phieuCode)).not.toBeInTheDocument()
  })

  it('exports the exact legacy column order', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(exportXlsx, 'exportToXlsx').mockResolvedValue()
    renderWithProviders(<ThongBaoPage />)

    await user.click(screen.getByRole('button', { name: 'Xuất ra Excel' }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.calls[0][0].columns.map((column) => column.header)).toEqual(
      HEADERS_IN_ORDER,
    )
  })

  it('filters out seen rows when Chưa xem is active', async () => {
    const user = userEvent.setup()
    const first = useNotificationStore.getState().notifications[0]
    useNotificationStore.getState().markSeen(first.id)
    renderWithProviders(<ThongBaoPage />)

    await user.click(screen.getByRole('button', { name: 'Chưa xem' }))

    expect(screen.queryByText(first.phieuCode)).not.toBeInTheDocument()
  })

  it('marks an item seen through its Xem action', async () => {
    const user = userEvent.setup()
    const first = useNotificationStore.getState().notifications[0]
    renderWithProviders(<ThongBaoPage />)

    await user.click(
      screen.getByRole('button', { name: `Xem ${first.phieuCode}` }),
    )

    expect(useNotificationStore.getState().isSeen(first.id)).toBe(true)
  })
})
