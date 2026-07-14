/**
 * Row-actions cell — status-dependent icon buttons opening the co-located
 * modals: Đổi tình trạng (always), Xem chi tiết (always), Cấp linh kiện (when a
 * technician is assigned), Giao Máy (deliverable statuses), Thêm lịch hẹn.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, RefreshCw, PackagePlus, Truck, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ROUTES } from '@/constants/routes'
import type { RepairTicket } from '@/domains/repair/types'
import { UpdateStatusModal } from '@/features/repair-shared/update-status-modal'
import { IssuePartsModal } from './issue-parts-modal'
import { CheckoutDeliveryModal } from './checkout-delivery-modal'
import { InsertScheduleModal } from './insert-schedule-modal'

/** Statuses from which a ticket can be handed over (Giao Máy). */
const DELIVERABLE_STATUS_IDS = new Set([8, 9, 11])

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 xl:h-6 xl:w-6"
            aria-label={label}
            onClick={onClick}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function RowActionsCell({ ticket }: { ticket: RepairTicket }) {
  const navigate = useNavigate()
  const [statusOpen, setStatusOpen] = useState(false)
  const [partsOpen, setPartsOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const hasTech = !!ticket.kyThuatId
  const canDeliver = DELIVERABLE_STATUS_IDS.has(ticket.tinhTrang)

  return (
    <div className="grid auto-cols-max grid-flow-col items-center gap-0.5">
      <IconAction label="Đổi tình trạng" onClick={() => setStatusOpen(true)}>
        <RefreshCw className="size-4" />
      </IconAction>
      <IconAction
        label="Xem chi tiết"
        onClick={() => navigate(ROUTES.repairDetail(ticket.id))}
      >
        <Eye className="size-4" />
      </IconAction>
      {hasTech && (
        <IconAction
          label="Cấp linh kiện cho kỹ thuật"
          onClick={() => setPartsOpen(true)}
        >
          <PackagePlus className="size-4" />
        </IconAction>
      )}
      {canDeliver && (
        <IconAction label="Giao Máy" onClick={() => setDeliveryOpen(true)}>
          <Truck className="size-4" />
        </IconAction>
      )}
      <IconAction label="Thêm lịch hẹn" onClick={() => setScheduleOpen(true)}>
        <CalendarPlus className="size-4" />
      </IconAction>

      {statusOpen && (
        <UpdateStatusModal
          open={statusOpen}
          onOpenChange={setStatusOpen}
          ids={[ticket.id]}
          initialStatus={ticket.tinhTrang}
        />
      )}
      {partsOpen && (
        <IssuePartsModal
          open={partsOpen}
          onOpenChange={setPartsOpen}
          id={ticket.id}
        />
      )}
      {deliveryOpen && (
        <CheckoutDeliveryModal
          open={deliveryOpen}
          onOpenChange={setDeliveryOpen}
          id={ticket.id}
        />
      )}
      {scheduleOpen && (
        <InsertScheduleModal
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          id={ticket.id}
        />
      )}
    </div>
  )
}
