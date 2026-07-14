import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { ROUTES } from '@/constants/routes'
import {
  HINH_THUC_LABEL,
  LOAI_BAO_HANH_LABEL,
  type RepairTicket,
} from '@/domains/repair/types'
import { formatVND } from '@/lib/format'
import { META_LABEL_CLASS } from './repair-table-constants'

export function RepairTicketRefsCell({
  ticket,
  linkTitle,
}: {
  ticket: RepairTicket
  linkTitle?: string
}) {
  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Phiếu</span>
      <TableProtectedValue>
        <Link
          to={ROUTES.repairDetail(ticket.id)}
          className="font-mono text-sm font-semibold text-primary hover:underline"
          title={linkTitle}
        >
          {ticket.soPhieu}
        </Link>
      </TableProtectedValue>
      {ticket.soPhieuHang && (
        <Fragment>
          <span className={META_LABEL_CLASS}>PSC hãng</span>
          <TableProtectedValue className="text-xs text-muted-foreground">
            {ticket.soPhieuHang}
          </TableProtectedValue>
        </Fragment>
      )}
      {ticket.soPhieuDaiLy && (
        <Fragment>
          <span className={META_LABEL_CLASS}>PSC ĐL</span>
          <TableProtectedValue className="text-xs text-muted-foreground">
            {ticket.soPhieuDaiLy}
          </TableProtectedValue>
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function RepairCustomerMetaStack({ ticket }: { ticket: RepairTicket }) {
  const customer = ticket.khachHang

  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Tên</span>
      <TableDescription value={customer.ten} className="text-sm font-bold" />
      <span className={META_LABEL_CLASS}>SĐT</span>
      <TableProtectedValue className="text-xs text-muted-foreground">
        {customer.sdt}
      </TableProtectedValue>
      <span className={META_LABEL_CLASS}>Địa chỉ</span>
      <TableDescription
        value={customer.diaChi}
        className="text-xs text-muted-foreground"
      />
    </TableMetaStack>
  )
}

export function RepairProductMetaStack({
  ticket,
  variant,
}: {
  ticket: RepairTicket
  variant: 'list' | 'kt'
}) {
  const isList = variant === 'list'

  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Sản phẩm</span>
      <TableDescription value={ticket.tenSanPham} className="text-sm" />
      {ticket.soSerial && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Serial</span>
          <TableProtectedValue
            className={
              isList && ticket.laMayDaSua
                ? 'text-xs font-semibold text-destructive'
                : 'text-xs text-muted-foreground'
            }
            title={
              isList
                ? `${ticket.soSerial}${ticket.laMayDaSua ? ' — Máy đã từng sửa chữa' : ''}`
                : undefined
            }
          >
            {ticket.soSerial}
          </TableProtectedValue>
        </Fragment>
      )}
      {isList && ticket.daiLy && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Đại lý</span>
          <TableDescription
            value={ticket.daiLy}
            className="text-xs text-orange-600"
          />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function RepairAssignmentMetaStack({
  ticket,
  variant,
  technician,
}: {
  ticket: RepairTicket
  variant: 'list' | 'kt'
  technician?: ReactNode
}) {
  const isList = variant === 'list'

  return (
    <TableMetaStack>
      <span className={META_LABEL_CLASS}>Kỹ thuật</span>
      {isList ? (
        technician
      ) : (
        <TableDescription
          value={ticket.kyThuat || '—'}
          className="text-sm font-medium"
        />
      )}
      <span className={META_LABEL_CLASS}>Loại SC</span>
      <span className="text-xs">{HINH_THUC_LABEL[ticket.hinhThuc]}</span>
      {isList && ticket.loaiBaoHanh && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Bảo hành</span>
          <span className="text-xs">
            {LOAI_BAO_HANH_LABEL[ticket.loaiBaoHanh]}
          </span>
        </Fragment>
      )}
      {(isList ? ticket.khuVuc : true) && (
        <Fragment>
          <span className={META_LABEL_CLASS}>Khu vực</span>
          <TableDescription
            value={isList ? ticket.khuVuc! : (ticket.khuVuc ?? '—')}
            className="text-xs"
          />
        </Fragment>
      )}
    </TableMetaStack>
  )
}

export function RepairCostCell({
  ticket,
  muteEstimated = false,
}: {
  ticket: RepairTicket
  muteEstimated?: boolean
}) {
  const quoted = ticket.giaBaoGia != null

  return (
    <TableProtectedValue
      tabular
      className={
        muteEstimated && !quoted ? 'text-sm text-muted-foreground' : 'text-sm'
      }
    >
      {formatVND(quoted ? ticket.giaBaoGia! : ticket.chiPhiDuKien)}
    </TableProtectedValue>
  )
}
