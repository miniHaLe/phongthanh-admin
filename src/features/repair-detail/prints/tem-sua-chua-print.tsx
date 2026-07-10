/**
 * "In Tem Sửa Chữa" — compact repair-tag label (legacy `RepairingTemDan`).
 * Distinct from the list page's "Tem Dán Máy" print; reuses the shared P2
 * print-window + print-layout helpers.
 */
import { PrintLayout } from '@/components/print/print-layout'
import { openPrintWindow } from '@/components/print/print-window'
import { formatDate } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'

export function printTemSuaChua(ticket: RepairTicket) {
  return openPrintWindow(
    'Tem Sửa Chữa',
    <PrintLayout title="TEM SỬA CHỮA">
      <div style={{ fontSize: 20, fontWeight: 700 }}>{ticket.soPhieu}</div>
      <table>
        <tbody>
          <tr>
            <td>Model</td>
            <td>{ticket.tenSanPham}</td>
          </tr>
          <tr>
            <td>Số Serial</td>
            <td>{ticket.soSerial ?? '—'}</td>
          </tr>
          <tr>
            <td>Ngày nhận</td>
            <td>{formatDate(ticket.ngayNhan)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}
