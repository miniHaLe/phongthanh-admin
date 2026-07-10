/**
 * Warehouse print documents rendered through the shared print-window helper.
 * Each is a React tree (auto-escaped) composed over PrintLayout.
 */
import { PrintLayout } from '@/components/print/print-layout'
import { openPrintWindow } from '@/components/print/print-window'
import { formatVND, formatDateTime } from '@/lib/format'
import type {
  ReceivingVoucher,
  IssuedPartUsage,
  PartReturn,
  PartReturnXac,
} from '@/domains/warehouse/types'

export function printReceiving(v: ReceivingVoucher) {
  return openPrintWindow(
    'Phiếu Nhập Kho',
    <PrintLayout title="PHIẾU NHẬP KHO" signatures={['Người lập', 'Thủ kho']}>
      <table>
        <tbody>
          <tr>
            <td>Số phiếu</td>
            <td>{v.soPhieu}</td>
          </tr>
          <tr>
            <td>Nhà cung cấp</td>
            <td>{v.nhaCungCap}</td>
          </tr>
          <tr>
            <td>Nhà kho</td>
            <td>{v.khoTen}</td>
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

export function printTemTraXac(row: IssuedPartUsage) {
  return openPrintWindow(
    'Tem Trả Xác',
    <PrintLayout title="TEM TRẢ XÁC LINH KIỆN">
      <p style={{ fontSize: 20, fontWeight: 700 }}>{row.soPhieuCap}</p>
      <p>{row.tenHang}</p>
      <p>Serial: {row.serial}</p>
    </PrintLayout>,
  )
}

export function printPhieuTraKT(rows: PartReturn[]) {
  return openPrintWindow(
    'Phiếu Trả Linh Kiện',
    <PrintLayout title="PHIẾU TRẢ LINH KIỆN KỸ THUẬT" signatures={['Kỹ thuật', 'Thủ kho']}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã hàng</th>
            <th>Tên hàng</th>
            <th>SL</th>
            <th>Kỹ thuật</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.maHang}</td>
              <td>{r.tenHang}</td>
              <td>{r.sl}</td>
              <td>{r.kyThuat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printBienBanKyThuat(rows: PartReturnXac[]) {
  return openPrintWindow(
    'Biên Bản Kỹ Thuật',
    <PrintLayout title="BIÊN BẢN KỸ THUẬT" signatures={['Kỹ thuật', 'Thủ kho']}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã hàng</th>
            <th>Tên hàng</th>
            <th>SL</th>
            <th>Serial</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.maHang}</td>
              <td>{r.tenHang}</td>
              <td>{r.sl}</td>
              <td>{r.serial}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printPhieuTraHang(rows: PartReturnXac[]) {
  return openPrintWindow(
    'Phiếu Trả Hãng',
    <PrintLayout title="PHIẾU TRẢ HÃNG" signatures={['Người lập', 'Hãng nhận']}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã vận đơn</th>
            <th>Mã hàng</th>
            <th>Tên hàng</th>
            <th>SL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.maVanDon}</td>
              <td>{r.maHang}</td>
              <td>{r.tenHang}</td>
              <td>{r.sl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintLayout>,
  )
}
