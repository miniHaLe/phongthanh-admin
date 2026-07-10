/**
 * The 5 repair print documents rendered through the P2 print-window helper.
 * Each is a React tree (auto-escaped) composed over PrintLayout. Giấy Đi Đường
 * and Lệnh Sửa Tại Nhà accept multiple tickets.
 */
import { PrintLayout } from '@/components/print/print-layout'
import { openPrintWindow } from '@/components/print/print-window'
import { formatDate, formatVND } from '@/lib/format'
import type { RepairTicket } from '@/domains/repair/types'

function TicketMeta({ t }: { t: RepairTicket }) {
  return (
    <table>
      <tbody>
        <tr>
          <td>Số phiếu</td>
          <td>{t.soPhieu}</td>
        </tr>
        <tr>
          <td>Khách hàng</td>
          <td>{t.khachHang.ten}</td>
        </tr>
        <tr>
          <td>Điện thoại</td>
          <td>{t.khachHang.sdt}</td>
        </tr>
        <tr>
          <td>Sản phẩm</td>
          <td>{t.tenSanPham}</td>
        </tr>
        <tr>
          <td>Mô tả lỗi</td>
          <td>{t.moTaLoi}</td>
        </tr>
        <tr>
          <td>Chi phí dự kiến</td>
          <td>{formatVND(t.chiPhiDuKien)}</td>
        </tr>
      </tbody>
    </table>
  )
}

export function printBienNhan(t: RepairTicket) {
  return openPrintWindow(
    'Biên nhận',
    <PrintLayout title="BIÊN NHẬN SỬA CHỮA" signatures={['Khách hàng', 'Người nhận']}>
      <TicketMeta t={t} />
      <p style={{ marginTop: 12 }}>Ngày nhận: {formatDate(t.ngayNhan)}</p>
    </PrintLayout>,
  )
}

export function printPhieuSc(t: RepairTicket) {
  return openPrintWindow(
    'Phiếu Sửa Chữa',
    <PrintLayout title="PHIẾU SỬA CHỮA" signatures={['Kỹ thuật', 'Trưởng chi nhánh']}>
      <TicketMeta t={t} />
      <p style={{ marginTop: 12 }}>Kỹ thuật: {t.kyThuat}</p>
    </PrintLayout>,
  )
}

export function printTemDanMay(t: RepairTicket) {
  return openPrintWindow(
    'Tem Dán Máy',
    <PrintLayout title="TEM DÁN MÁY">
      <p style={{ fontSize: 20, fontWeight: 700 }}>{t.soPhieu}</p>
      <p>{t.khachHang.ten}</p>
      <p>{t.tenSanPham}</p>
    </PrintLayout>,
  )
}

export function printGiayDiDuong(tickets: RepairTicket[]) {
  return openPrintWindow(
    'Giấy Đi Đường',
    <PrintLayout title="GIẤY ĐI ĐƯỜNG" signatures={['Người đi', 'Phụ trách']}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Số phiếu</th>
            <th>Khách hàng</th>
            <th>Địa chỉ</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.soPhieu}</td>
              <td>{t.khachHang.ten}</td>
              <td>{t.khachHang.diaChi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintLayout>,
  )
}

export function printLenhSuaTaiNha(tickets: RepairTicket[]) {
  return openPrintWindow(
    'Lệnh Sửa Tại Nhà',
    <PrintLayout title="LỆNH SỬA TẠI NHÀ" signatures={['Kỹ thuật', 'Khách hàng']}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Số phiếu</th>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Kỹ thuật</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.soPhieu}</td>
              <td>{t.khachHang.ten}</td>
              <td>{t.tenSanPham}</td>
              <td>{t.kyThuat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintLayout>,
  )
}
