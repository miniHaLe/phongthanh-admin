import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notify } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import {
  createRepairTicket,
  updateRepairTicket,
} from '@/domains/repair/mock-mutations'
import type { RepairTicket } from '@/domains/repair/types'
import {
  buildCreateRepairInput,
  buildUpdateRepairInput,
  type RepairFormValues,
} from './repair-form-contract'
import type { RepairSubmitMode } from './repair-form-submit-bar'

const REPAIR_INVALIDATION_KEYS = [
  ['repair-list'],
  ['repair-kt'],
  ['repair-detail'],
  ['dashboard-summary'],
  ['recent-tickets'],
  ['status-distribution'],
  ['kpi-report'],
  ['kpi-tiep-nhan-report'],
  ['ky-thuat-status-report'],
  ['tinh-trang-chung-report'],
  ['may-ton-report'],
  ['bao-hanh-report'],
] as const

export function useRepairFormMutation({
  mode,
  ticketId,
  onCreateReset,
}: {
  mode: 'create' | 'edit'
  ticketId?: string
  onCreateReset: () => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      values,
    }: {
      values: RepairFormValues
      submitMode: RepairSubmitMode
    }) => {
      if (mode === 'edit') {
        if (!ticketId) throw new Error('missing-ticket-id')
        return updateRepairTicket(ticketId, buildUpdateRepairInput(values))
      }
      return createRepairTicket(buildCreateRepairInput(values))
    },
    onSuccess: (ticket, variables) => {
      queryClient.setQueryData<RepairTicket>(['repair-detail', ticket.id], {
        ...ticket,
        statusHistory: [...ticket.statusHistory],
        dispatchLog: ticket.dispatchLog ? [...ticket.dispatchLog] : undefined,
      })
      void Promise.all(
        REPAIR_INVALIDATION_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [...queryKey] }),
        ),
      )

      notify.success(
        mode === 'edit'
          ? 'Đã cập nhật phiếu sửa chữa thành công'
          : 'Đã tạo phiếu sửa chữa thành công',
      )
      if (variables.submitMode === 'save') {
        navigate(ROUTES.repairDetail(ticket.id))
      } else if (variables.submitMode === 'saveNew') {
        if (mode === 'edit') navigate(ROUTES.repairCreate)
        else onCreateReset()
      } else {
        navigate(ROUTES.repairList)
      }
    },
    onError: () => {
      notify.error(
        mode === 'edit'
          ? 'Không thể cập nhật phiếu. Vui lòng thử lại.'
          : 'Không thể tạo phiếu. Vui lòng thử lại.',
      )
    },
  })
}
