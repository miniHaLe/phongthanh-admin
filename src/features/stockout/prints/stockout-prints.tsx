/**
 * Stock-out (xuất kho) print documents rendered through the shared
 * print-window helper. Each is a React tree (auto-escaped) composed over
 * PrintLayout — Cấp Linh Kiện, Bán Hàng (phiếu BH + phiếu thu), Trả Hàng,
 * Chuyển Kho.
 */
import { PrintLayout } from '@/components/print/print-layout'
import { openPrintWindow } from '@/components/print/print-window'
import { formatVND, formatDateTime } from '@/lib/format'
import type {
  CheckOutSlip,
  SellingOrder,
  ReturnSlip,
  MovingSlip,
} from '@/domains/warehouse/types'

export function printCapLKKyThuat(v: CheckOutSlip) {
  return openPrintWindow(
    'Phiếu Cấp Linh Kiện',
    <PrintLayout title="PHIẾU CẤP LINH KIỆN KỸ THUẬT" signatures={['Người lập', 'Kỹ thuật']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu cấp</td>
            <td>{v.soPhieuCap}</td>
          </tr>
          <tr>
            <td>Kỹ thuật</td>
            <td>{v.kyThuat}</td>
          </tr>
          <tr>
            <td>Số tiền</td>
            <td>{formatVND(v.soTien)}</td>
          </tr>
          <tr>
            <td>Ngày lập</td>
            <td>{formatDateTime(v.ngayLap)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printSelling(v: SellingOrder) {
  return openPrintWindow(
    'Phiếu Xuất Kho Bán Hàng',
    <PrintLayout title="PHIẾU XUẤT KHO BÁN HÀNG" signatures={['Người lập', 'Khách hàng']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Khách hàng</td>
            <td>{v.khachHang}</td>
          </tr>
          <tr>
            <td>Điện thoại</td>
            <td>{v.dienThoai}</td>
          </tr>
          <tr>
            <td>Tổng tiền</td>
            <td>{formatVND(v.tongTien)}</td>
          </tr>
          <tr>
            <td>Ngày lập</td>
            <td>{formatDateTime(v.ngayLap)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printPhieuBanHang(v: SellingOrder) {
  return openPrintWindow(
    'Phiếu Bán Hàng',
    <PrintLayout title="PHIẾU BÁN HÀNG" signatures={['Người lập', 'Khách hàng']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Khách hàng</td>
            <td>{v.khachHang}</td>
          </tr>
          <tr>
            <td>Tổng tiền</td>
            <td>{formatVND(v.tongTien)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printPhieuThu(v: SellingOrder) {
  return openPrintWindow(
    'Phiếu Thu',
    <PrintLayout title="PHIẾU THU TIỀN BÁN HÀNG" signatures={['Người lập', 'Người nộp tiền']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Khách hàng nộp</td>
            <td>{v.khachHang}</td>
          </tr>
          <tr>
            <td>Số tiền thu</td>
            <td>{formatVND(v.tongTien)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printReturnProduct(v: ReturnSlip) {
  return openPrintWindow(
    'Phiếu Trả Hàng',
    <PrintLayout title="PHIẾU TRẢ HÀNG NHÀ CUNG CẤP" signatures={['Người lập', 'Nhà cung cấp']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Hình thức trả</td>
            <td>{v.hinhThucTra}</td>
          </tr>
          <tr>
            <td>Ngày trả</td>
            <td>{formatDateTime(v.ngayTra)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printMovingProduct(v: MovingSlip) {
  return openPrintWindow(
    'Phiếu Chuyển Kho',
    <PrintLayout title="PHIẾU CHUYỂN KHO" signatures={['Người chuyển', 'Người nhận']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Từ chi nhánh / kho</td>
            <td>
              {v.tuChiNhanh} / {v.tuKho}
            </td>
          </tr>
          <tr>
            <td>Đến chi nhánh / kho</td>
            <td>
              {v.denChiNhanh} / {v.denKho}
            </td>
          </tr>
          <tr>
            <td>Loại</td>
            <td>{v.loai}</td>
          </tr>
          <tr>
            <td>Ngày lập</td>
            <td>{formatDateTime(v.ngayLap)}</td>
          </tr>
        </tbody>
      </table>
    </PrintLayout>,
  )
}
