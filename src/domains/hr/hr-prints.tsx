/**
 * Print helpers for the HR pages that have a per-row/bulk "In" action
 * (Bảng lương). Reuses the shared PrintLayout + openPrintWindow so every
 * interpolated field is React-escaped (no raw HTML string concatenation).
 */
import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { formatVND } from '@/lib/format'
import type { BangLuong } from './types'

export interface BangLuongPrintRow extends BangLuong {
  hoTenNV: string
  tenKy: string
  tongLuong: number
  thucLanh: number
}

export function printBangLuong(row: BangLuongPrintRow) {
  return openPrintWindow(
    'Bảng Lương',
    <PrintLayout title="BẢNG LƯƠNG" signatures={['Người lập', 'Nhân viên']}>
      <table>
        <tbody>
          <tr>
            <td>Nhân viên</td>
            <td>{row.hoTenNV}</td>
          </tr>
          <tr>
            <td>Kỳ</td>
            <td>{row.tenKy}</td>
          </tr>
          <tr>
            <td>Lương cứng</td>
            <td>{formatVND(row.luongCung)}</td>
          </tr>
          <tr>
            <td>Bảo hiểm</td>
            <td>{formatVND(row.baoHiem)}</td>
          </tr>
          <tr>
            <td>Phụ cấp</td>
            <td>{formatVND(row.phuCap)}</td>
          </tr>
          <tr>
            <td>Tổng lương</td>
            <td>{formatVND(row.tongLuong)}</td>
          </tr>
          <tr>
            <td>Thực lãnh</td>
            <td>{formatVND(row.thucLanh)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}
