import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { formatDate } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'

export function printBienNhan(ticket: RepairTicket) {
  return openPrintWindow(
    'Biên nhận',
    <PrintLayout
      title="BIÊN NHẬN SỬA CHỮA"
      signatures={['Khách hàng', 'Người nhận']}
    >
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{ticket.soPhieu}</td>
          </tr>
          <tr>
            <td>Khách hàng</td>
            <td>{ticket.khachHang.ten}</td>
          </tr>
          <tr>
            <td>Điện thoại</td>
            <td>{ticket.khachHang.sdt}</td>
          </tr>
          <tr>
            <td>Sản phẩm</td>
            <td>{ticket.tenSanPham}</td>
          </tr>
          <tr>
            <td>Mô tả hư hỏng</td>
            <td>{ticket.moTaLoi}</td>
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
