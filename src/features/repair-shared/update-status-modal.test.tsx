import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  fetchRepairById,
  fetchRepairKtList,
  fetchRepairList,
  MOCK_TICKETS,
} from '@/domains/repair/mock-data'
import { OPEN_STATUS_IDS, type RepairStatusId } from '@/domains/repair/status'
import type { RepairListParams } from '@/domains/repair/types'
import {
  fetchDashboardSummary,
  fetchRecentTickets,
  fetchStatusDistribution,
} from '@/mock/dashboard-mock'
import { renderWithProviders } from '@/test/render-with-providers'
import { UpdateStatusModal } from './update-status-modal'

vi.mock('@/lib/mock-delay', () => ({
  mockDelay: vi.fn().mockResolvedValue(undefined),
}))

describe('UpdateStatusModal', () => {
  it('shows the title and Lưu / Lưu & SMS buttons', () => {
    renderWithProviders(
      <UpdateStatusModal open onOpenChange={() => {}} ids={['x']} />,
    )
    expect(screen.getByText('Đổi tình trạng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lưu & SMS' }),
    ).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
  })

  it('refetches every repair and dashboard view from the updated ticket store', async () => {
    const user = userEvent.setup()
    const ticket = [...MOCK_TICKETS].sort(
      (a, b) =>
        new Date(b.ngayNhan).getTime() - new Date(a.ngayNhan).getTime() ||
        a.id.localeCompare(b.id),
    )[0]
    const original = {
      status: ticket.tinhTrang,
      updatedAt: ticket.updatedAt,
      ngaySuaXong: ticket.ngaySuaXong,
      history: [...ticket.statusHistory],
    }
    const nextStatus: RepairStatusId = ticket.tinhTrang === 2 ? 7 : 2
    const listParams: RepairListParams = { page: 1, pageSize: 300 }
    const listKey = ['repair-list', listParams] as const
    const ktKey = ['repair-kt', listParams] as const
    const detailKey = ['repair-detail', ticket.id] as const
    const summaryKey = ['dashboard-summary', 'all'] as const
    const recentKey = ['recent-tickets'] as const
    const distributionKey = ['status-distribution'] as const

    const listQuery = vi.fn(() => fetchRepairList(listParams))
    const ktQuery = vi.fn(() => fetchRepairKtList(listParams))
    const detailQuery = vi.fn(() => fetchRepairById(ticket.id))
    const summaryQuery = vi.fn(() => fetchDashboardSummary('all'))
    const recentQuery = vi.fn(fetchRecentTickets)
    const distributionQuery = vi.fn(fetchStatusDistribution)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)

    try {
      const { queryClient } = renderWithProviders(
        <UpdateStatusModal
          open
          onOpenChange={() => {}}
          ids={[ticket.id]}
          initialStatus={nextStatus}
        />,
      )
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

      const [, , , summaryBefore, recentBefore, distributionBefore] =
        await Promise.all([
          queryClient.fetchQuery({ queryKey: listKey, queryFn: listQuery }),
          queryClient.fetchQuery({ queryKey: ktKey, queryFn: ktQuery }),
          queryClient.fetchQuery({ queryKey: detailKey, queryFn: detailQuery }),
          queryClient.fetchQuery({
            queryKey: summaryKey,
            queryFn: summaryQuery,
          }),
          queryClient.fetchQuery({
            queryKey: recentKey,
            queryFn: recentQuery,
          }),
          queryClient.fetchQuery({
            queryKey: distributionKey,
            queryFn: distributionQuery,
          }),
        ])

      expect(recentBefore.find((row) => row.id === ticket.id)?.status).toBe(
        original.status,
      )

      await user.click(screen.getByRole('button', { name: 'Lưu' }))

      await waitFor(() => {
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ['repair-list'] })
      })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['repair-kt'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['repair-detail'] })
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ['dashboard-summary'],
      })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['recent-tickets'] })
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ['status-distribution'],
      })

      const [
        listAfter,
        ktAfter,
        detailAfter,
        summaryAfter,
        recentAfter,
        distAfter,
      ] = await Promise.all([
        queryClient.fetchQuery({ queryKey: listKey, queryFn: listQuery }),
        queryClient.fetchQuery({ queryKey: ktKey, queryFn: ktQuery }),
        queryClient.fetchQuery({ queryKey: detailKey, queryFn: detailQuery }),
        queryClient.fetchQuery({
          queryKey: summaryKey,
          queryFn: summaryQuery,
        }),
        queryClient.fetchQuery({
          queryKey: recentKey,
          queryFn: recentQuery,
        }),
        queryClient.fetchQuery({
          queryKey: distributionKey,
          queryFn: distributionQuery,
        }),
      ])

      expect(
        listAfter.data.find((row) => row.id === ticket.id)?.tinhTrang,
      ).toBe(nextStatus)
      expect(ktAfter.data.find((row) => row.id === ticket.id)?.tinhTrang).toBe(
        nextStatus,
      )
      expect(detailAfter.tinhTrang).toBe(nextStatus)
      expect(recentAfter.find((row) => row.id === ticket.id)?.status).toBe(
        nextStatus,
      )

      const countStatus = (
        distribution: typeof distributionBefore,
        status: RepairStatusId,
      ) => distribution.find((item) => item.status === status)?.count ?? 0
      expect(countStatus(distAfter, original.status)).toBe(
        countStatus(distributionBefore, original.status) - 1,
      )
      expect(countStatus(distAfter, nextStatus)).toBe(
        countStatus(distributionBefore, nextStatus) + 1,
      )

      const queueCount = (
        summary: typeof summaryBefore,
        status: RepairStatusId,
      ) => summary.queue.find((item) => item.status === status)?.count ?? 0
      expect(queueCount(summaryAfter, nextStatus)).toBe(
        queueCount(summaryBefore, nextStatus) + 1,
      )
      const oldQueue = summaryBefore.queue.find(
        (item) => item.status === original.status,
      )
      if (oldQueue) {
        expect(queueCount(summaryAfter, original.status)).toBe(
          oldQueue.count - 1,
        )
      }

      const branchBefore = summaryBefore.branches.find(
        (branch) => branch.branchId === ticket.branchId,
      )
      const branchAfter = summaryAfter.branches.find(
        (branch) => branch.branchId === ticket.branchId,
      )
      const expectedOpenDelta =
        Number(OPEN_STATUS_IDS.includes(nextStatus)) -
        Number(OPEN_STATUS_IDS.includes(original.status))
      expect(branchAfter?.openCount).toBe(
        (branchBefore?.openCount ?? 0) + expectedOpenDelta,
      )

      for (const query of [
        listQuery,
        ktQuery,
        detailQuery,
        summaryQuery,
        recentQuery,
        distributionQuery,
      ]) {
        expect(query).toHaveBeenCalledTimes(2)
      }
    } finally {
      random.mockRestore()
      ticket.tinhTrang = original.status
      ticket.updatedAt = original.updatedAt
      ticket.ngaySuaXong = original.ngaySuaXong
      ticket.statusHistory = original.history
    }
  })
})
