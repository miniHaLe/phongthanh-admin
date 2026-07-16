/**
 * In-memory mutations against the LIVE MOCK_TICKETS layer (D4/D5). Each mutation
 * updates ticket fields in place and appends a status-history entry where
 * applicable. UI wraps these in useMutation + invalidateQueries(['repair-list']).
 *
 * Durability note (Finding 6): these writes live in module memory only — they
 * are lost on any page reload; resetDemo() regenerates the seed identically.
 */
import { MOCK_TICKETS, REPAIR_MOCK_REFERENCE_EPOCH_MS } from './mock-data'
import { TECHNICIANS } from './reference-data'
import { labelOf, type RepairStatusId } from './status'
import type { RepairTicket, StatusHistoryEntry } from './types'

export { createRepairTicket, updateRepairTicket } from './mock-ticket-mutations'

function byId(id: string): RepairTicket | undefined {
  return MOCK_TICKETS.find((t) => t.id === id)
}

function mutationTimestamp(ticket: RepairTicket): string {
  const latest = Date.parse(
    ticket.statusHistory.at(-1)?.changedAt ?? ticket.updatedAt,
  )
  return new Date(
    Math.max(
      REPAIR_MOCK_REFERENCE_EPOCH_MS,
      Number.isFinite(latest) ? latest : REPAIR_MOCK_REFERENCE_EPOCH_MS,
    ),
  ).toISOString()
}

function pushHistory(t: RepairTicket, entry: StatusHistoryEntry) {
  t.statusHistory = [...t.statusHistory, entry]
  t.updatedAt = entry.changedAt
}

export interface StatusUpdateFields {
  gia?: number
  noiDung?: string
  cachGiaiQuyet?: string
  changedBy?: string
}

/** Set a new status on one or more tickets, appending a history entry. */
export function updateTicketStatus(
  ids: string[],
  status: RepairStatusId,
  fields: StatusUpdateFields = {},
): RepairTicket[] {
  const updated: RepairTicket[] = []
  for (const id of ids) {
    const t = byId(id)
    if (!t) continue
    const changedAt = mutationTimestamp(t)
    t.tinhTrang = status
    if (fields.gia != null) t.giaBaoGia = fields.gia
    if (fields.cachGiaiQuyet != null) t.cachGiaiQuyet = fields.cachGiaiQuyet
    if (status === 9) t.ngaySuaXong = t.ngaySuaXong ?? changedAt
    pushHistory(t, {
      status,
      changedAt,
      changedBy: fields.changedBy ?? 'Hệ thống',
      note: fields.noiDung ?? `Đổi tình trạng: ${labelOf(status)}`,
    })
    updated.push(t)
  }
  return updated
}

/** Assign or reassign a technician across the given tickets. */
export function dispatchTechnician(
  ids: string[],
  techId: string,
): RepairTicket[] {
  const tech = TECHNICIANS.find((t) => t.id === techId)
  const updated: RepairTicket[] = []
  for (const id of ids) {
    const t = byId(id)
    if (!t) continue
    t.kyThuatId = techId
    t.kyThuat = tech?.ten ?? techId
    // Điều phối moves a new ticket to "Đã Điều Phối" (2).
    if (t.tinhTrang === 1) {
      const changedAt = mutationTimestamp(t)
      t.tinhTrang = 2
      pushHistory(t, {
        status: 2,
        changedAt,
        changedBy: tech?.ten ?? 'Hệ thống',
        note: 'Điều phối kỹ thuật',
      })
    }
    updated.push(t)
  }
  return updated
}

/** Clear a ticket's technician assignment (Hủy điều phối). */
export function cancelDispatch(id: string): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.kyThuatId = ''
  t.kyThuat = ''
  return t
}

/** Move tickets to a different branch, recording a note in history. */
export function transferBranch(
  ids: string[],
  branchId: string,
  note?: string,
): RepairTicket[] {
  const updated: RepairTicket[] = []
  for (const id of ids) {
    const t = byId(id)
    if (!t) continue
    t.branchId = branchId
    pushHistory(t, {
      status: t.tinhTrang,
      changedAt: mutationTimestamp(t),
      changedBy: 'Hệ thống',
      note: note ? `Chuyển chi nhánh: ${note}` : 'Chuyển chi nhánh',
    })
    updated.push(t)
  }
  return updated
}

/** Remove tickets from the live store. Returns the count removed. */
export function deleteTickets(ids: string[]): number {
  const set = new Set(ids)
  let removed = 0
  for (let i = MOCK_TICKETS.length - 1; i >= 0; i--) {
    if (set.has(MOCK_TICKETS[i].id)) {
      MOCK_TICKETS.splice(i, 1)
      removed++
    }
  }
  return removed
}

/** Attach a schedule reminder note (mock — stored as a history entry). */
export function addScheduleReminder(
  id: string,
  reminder: { date: string; note: string },
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  pushHistory(t, {
    status: t.tinhTrang,
    changedAt: mutationTimestamp(t),
    changedBy: 'Hệ thống',
    note: `Lịch hẹn ${reminder.date}: ${reminder.note}`,
  })
  return t
}

/** Issue parts to the assigned technician (mock — records parts on the ticket). */
export function issuePartsToTech(
  id: string,
  parts: RepairTicket['parts'],
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.parts = [...t.parts, ...parts]
  return t
}

/** Hand a ticket over to the customer (Giao Máy → status 10). */
export function checkoutDelivery(
  id: string,
  info: { ngayGiao: string; ghiChu?: string },
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.tinhTrang = 10
  t.ngayGiao = info.ngayGiao
  pushHistory(t, {
    status: 10,
    changedAt: mutationTimestamp(t),
    changedBy: 'Hệ thống',
    note: info.ghiChu ? `Giao máy: ${info.ghiChu}` : 'Giao máy cho khách',
  })
  return t
}

/** Update a ticket's "Cách giải quyết" solution text. */
export function updateSolution(
  id: string,
  info: { cachGiaiQuyet: string },
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.cachGiaiQuyet = info.cachGiaiQuyet
  return t
}

/** Set a quote (Báo giá → status Báo Giá 4). */
export function setQuote(
  id: string,
  gia: number,
  noiDung?: string,
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.giaBaoGia = gia
  t.tinhTrang = 4
  pushHistory(t, {
    status: 4,
    changedAt: mutationTimestamp(t),
    changedBy: 'Hệ thống',
    note: noiDung ? `Báo giá: ${noiDung}` : 'Báo giá',
  })
  return t
}

/** Clear a ticket's quote (Hủy báo giá). */
export function deleteQuote(id: string): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.giaBaoGia = undefined
  return t
}

/** Toggle the "Sửa gấp" (rush) flag on a ticket. */
export function updateSuaGap(
  id: string,
  value: boolean,
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.isQuick = value
  return t
}

let mediaSeq = 0

/** Attach a media item to a ticket. */
export function addTicketMedia(
  id: string,
  media: { url: string; kind: 'image' | 'video' },
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  mediaSeq += 1
  t.images = [
    ...(t.images ?? []),
    { id: `media-${mediaSeq}`, url: media.url, kind: media.kind },
  ]
  return t
}

/** Remove a media item from a ticket. */
export function deleteTicketMedia(
  id: string,
  mediaId: string,
): RepairTicket | undefined {
  const t = byId(id)
  if (!t) return undefined
  t.images = (t.images ?? []).filter((m) => m.id !== mediaId)
  return t
}
