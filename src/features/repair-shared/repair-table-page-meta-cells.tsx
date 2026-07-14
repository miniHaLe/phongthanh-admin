import { Fragment } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import type { RepairTicket } from '@/domains/repair/types'
import { formatDate, formatDateTime, formatDwell } from '@/lib/format'
import { buildMapUrl, openExternal } from '@/lib/open-external'
import { RepairCustomerMetaStack } from './repair-table-common-meta-cells'
import { META_LABEL_CLASS } from './repair-table-constants'

export function RepairListCustomerCell({ ticket }: { ticket: RepairTicket }) {
  const customer = ticket.khachHang

  return (
    <div className="min-w-0 space-y-1">
      <RepairCustomerMetaStack ticket={ticket} />
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-0.5 whitespace-nowrap text-xs text-primary hover:underline xl:min-h-0"
          onClick={() => openExternal(buildMapUrl(customer.diaChi))}
        >
          <MapPin className="size-3" /> Bản đồ
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-0.5 whitespace-nowrap text-xs text-primary hover:underline xl:min-h-0"
          onClick={() =>
            openExternal(buildMapUrl(`${customer.tinh} ${customer.huyen}`))
          }
        >
          <Navigation className="size-3" /> Định vị
        </button>
      </div>
    </div>
  )
}

export function RepairListTimelineCell({
  ticket,
  referenceNow,
}: {
  ticket: RepairTicket
  referenceNow: number
}) {
  const tatDays = ticket.ngaySuaXong
    ? Math.max(
        0,
        Math.round(
          (new Date(ticket.ngaySuaXong).getTime() -
            new Date(ticket.ngayNhan).getTime()) /
            86_400_000,
        ),
      )
    : null

  return (
    <TableMetaStack className="text-xs">
      <span className={META_LABEL_CLASS}>Nhận</span>
      <TableProtectedValue tabular>
        {formatDateTime(ticket.ngayNhan)}
      </TableProtectedValue>
      <span className={META_LABEL_CLASS}>Hoàn thành</span>
      <TableProtectedValue tabular className="text-muted-foreground">
        {ticket.ngayHoanThanh ? formatDate(ticket.ngayHoanThanh) : '—'}
      </TableProtectedValue>
      {ticket.ngaySuaXong && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Sửa xong</span>
          <TableProtectedValue tabular className="text-emerald-600">
            {formatDateTime(ticket.ngaySuaXong)}
          </TableProtectedValue>
          <span className={META_LABEL_CLASS}>TAT</span>
          <TableProtectedValue tabular>{tatDays} ngày</TableProtectedValue>
        </Fragment>
      )}
      {ticket.ngayGiao && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Giao máy</span>
          <TableProtectedValue tabular>
            {formatDateTime(ticket.ngayGiao)}
          </TableProtectedValue>
        </Fragment>
      )}
      {!ticket.ngaySuaXong && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Tồn</span>
          <TableProtectedValue tabular className="text-orange-600">
            {formatDwell(ticket.ngayNhan, referenceNow)}
          </TableProtectedValue>
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function RepairKtTimelineCell({ ticket }: { ticket: RepairTicket }) {
  return (
    <TableMetaStack className="text-xs">
      <span className={META_LABEL_CLASS}>Nhận</span>
      <TableProtectedValue tabular>
        {formatDateTime(ticket.ngayNhan)}
      </TableProtectedValue>
      <span className={META_LABEL_CLASS}>Giao</span>
      <TableProtectedValue tabular className="text-muted-foreground">
        {ticket.ngayGiao ? formatDate(ticket.ngayGiao) : '—'}
      </TableProtectedValue>
    </TableMetaStack>
  )
}

export function RepairListNotesCell({ ticket }: { ticket: RepairTicket }) {
  return (
    <TableMetaStack className="text-xs">
      <span className="font-semibold text-destructive">HH</span>
      <TableDescription value={ticket.moTaLoi} />
      {ticket.cachGiaiQuyet && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Xử lý</span>
          <TableDescription
            value={ticket.cachGiaiQuyet}
            className="text-muted-foreground"
          />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function RepairKtNotesCell({ ticket }: { ticket: RepairTicket }) {
  return (
    <TableMetaStack className="text-xs">
      <span className={META_LABEL_CLASS}>Chi tiết SC</span>
      <TableDescription value={ticket.noiDungSuaChua ?? '—'} />
      <span className={META_LABEL_CLASS}>Ghi chú</span>
      <TableDescription
        value={ticket.ghiChu ?? '—'}
        className="text-muted-foreground"
      />
    </TableMetaStack>
  )
}
