/**
 * Invoice composer — full-page per verified reference `page-Invoice-Create`.
 * Toolbar Lưu / Lưu & Thêm mới / In Hóa Đơn / Danh sách hóa đơn. Fieldset
 * "Thông tin khách hàng" + "Chi tiết" (editable VAT rate deriving Tiền
 * thuế/Tổng thanh toán) render in the LineItemEditor `header` slot; line grid
 * below is "Hàng hóa đã thêm". Route: /tai-chinh/hoa-don/tao-moi
 */
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LineItemEditor, PageHeader, notify, type LineColumn } from '@/components/shared'
import { PrintLayout } from '@/components/print/print-layout'
import { openPrintWindow } from '@/components/print/print-window'
import { ROUTES } from '@/constants/routes'
import { formatVND, formatDate } from '@/lib/format'
import { createHoaDon, HOA_DON_ROWS } from '@/mock/finance-mock'
import { BRANCHES } from '@/mock/seed/branches'
import type { HoaDonItem } from '@/types/finance-types'
import {
  InvoiceHeaderFields,
  type InvoiceHeaderValues,
} from './invoice-composer-header-fields'
import { SourceTicketImportPanel } from './source-ticket-import-panel'
import type { StagingLine } from './source-ticket-search'

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

function nextSoHoaDon(): string {
  return `HD-${String(HOA_DON_ROWS.length + 1).padStart(5, '0')}`
}

function emptyHeader(): InvoiceHeaderValues {
  return {
    soHoaDon: nextSoHoaDon(),
    ngayXuat: todayDateInputValue(),
    tenKhachHangMua: '',
    hinhThucId: '',
    maSoThue: '',
    tenDonVi: '',
    diaChi: '',
    customerId: null,
  }
}

function makeEmptyLine(): HoaDonItem {
  return { maHang: '', tenHang: '', donViTinh: 'Cái', soLuong: 1, donGia: 0, thanhTien: 0 }
}

export default function InvoiceComposerPage() {
  const navigate = useNavigate()
  const [header, setHeader] = useState<InvoiceHeaderValues>(emptyHeader)
  const [vatRate, setVatRate] = useState(10)
  const [lines, setLines] = useState<HoaDonItem[]>([])
  const [ghiChu, setGhiChu] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof InvoiceHeaderValues, string>>>({})

  function patchHeader(patch: Partial<InvoiceHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function updateLine(index: number, patch: Partial<HoaDonItem>) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l
        const next = { ...l, ...patch }
        next.thanhTien = next.soLuong * next.donGia
        return next
      }),
    )
  }

  function resetForm() {
    setHeader(emptyHeader())
    setVatRate(10)
    setLines([])
    setGhiChu('')
    setErrors({})
  }

  const tongThanhTien = useMemo(() => lines.reduce((s, l) => s + l.thanhTien, 0), [lines])
  const tienThue = useMemo(() => Math.round((tongThanhTien * vatRate) / 100), [tongThanhTien, vatRate])
  const tongThanhToan = tongThanhTien + tienThue

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof InvoiceHeaderValues, string>> = {}
    if (!header.soHoaDon.trim()) nextErrors.soHoaDon = 'Vui lòng nhập số hóa đơn!'
    if (!header.ngayXuat) nextErrors.ngayXuat = 'Vui lòng chọn ngày xuất!'
    if (!header.tenKhachHangMua.trim()) nextErrors.tenKhachHangMua = 'Vui lòng nhập tên khách hàng!'
    if (!header.hinhThucId) nextErrors.hinhThucId = 'Vui lòng chọn hình thức thanh toán!'
    if (!header.maSoThue.trim()) nextErrors.maSoThue = 'Vui lòng nhập mã số thuế!'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      notify.error('Vui lòng nhập đầy đủ thông tin khách hàng!')
      return false
    }
    if (lines.length === 0) {
      notify.error('Vui lòng thêm hàng hóa!')
      return false
    }
    return true
  }

  async function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return
    try {
      const invoice = await createHoaDon({
        soHoaDon: header.soHoaDon.trim(),
        ngayXuat: new Date(header.ngayXuat).toISOString(),
        tenKhachHangMua: header.tenKhachHangMua.trim(),
        hinhThucId: Number(header.hinhThucId),
        maSoThue: header.maSoThue.trim(),
        tenDonVi: header.tenDonVi || header.tenKhachHangMua.trim(),
        diaChi: header.diaChi,
        customerId: header.customerId,
        vatRate,
        items: lines,
        ghiChu,
        branchId: BRANCHES[0].id,
      })
      notify.success(`Đã lưu hóa đơn ${invoice.soHoaDon}`)
      if (saveAndNew) {
        resetForm()
      } else {
        navigate(ROUTES.financeInvoices)
      }
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Không thể lưu hóa đơn')
    }
  }

  function handlePrint() {
    void openPrintWindow(
      'Hóa Đơn',
      <PrintLayout title="HÓA ĐƠN" signatures={['Người lập', 'Khách hàng']}>
        <table>
          <tbody>
            <tr>
              <td>Số hóa đơn</td>
              <td>{header.soHoaDon}</td>
            </tr>
            <tr>
              <td>Ngày xuất</td>
              <td>{formatDate(new Date(header.ngayXuat).toISOString())}</td>
            </tr>
            <tr>
              <td>Khách hàng</td>
              <td>{header.tenKhachHangMua}</td>
            </tr>
            <tr>
              <td>Mã số thuế</td>
              <td>{header.maSoThue}</td>
            </tr>
            <tr>
              <td>Tổng thành tiền</td>
              <td>{formatVND(tongThanhTien)}</td>
            </tr>
            <tr>
              <td>Tiền thuế ({vatRate}%)</td>
              <td>{formatVND(tienThue)}</td>
            </tr>
            <tr>
              <td>Tổng thanh toán</td>
              <td>{formatVND(tongThanhToan)}</td>
            </tr>
          </tbody>
        </table>
      </PrintLayout>,
    )
  }

  function addStagingLine(staging: StagingLine) {
    setLines((prev) => [
      ...prev,
      {
        maHang: staging.maHang,
        tenHang: staging.hangHoa,
        donViTinh: staging.donViTinh,
        soLuong: staging.soLuong,
        donGia: staging.donGia,
        thanhTien: staging.soLuong * staging.donGia,
      },
    ])
  }

  const lineColumns: LineColumn<HoaDonItem>[] = [
    {
      key: 'stt',
      header: 'STT',
      cell: (_line, i) => <span>{i + 1}</span>,
    },
    {
      key: 'tenHang',
      header: 'Hàng hóa',
      cell: (line, i) => (
        <Input
          className="h-8 w-48"
          value={line.tenHang}
          onChange={(e) => updateLine(i, { tenHang: e.target.value })}
          aria-label={`Hàng hóa dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'donViTinh',
      header: 'DVT',
      cell: (line, i) => (
        <Input
          className="h-8 w-20"
          value={line.donViTinh}
          onChange={(e) => updateLine(i, { donViTinh: e.target.value })}
          aria-label={`DVT dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'soLuong',
      header: 'Số lượng',
      cell: (line, i) => (
        <Input
          type="number"
          min={1}
          className="h-8 w-20"
          value={line.soLuong}
          onChange={(e) => updateLine(i, { soLuong: Number(e.target.value) || 0 })}
          aria-label={`Số lượng dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'donGia',
      header: 'Đơn giá',
      cell: (line, i) => (
        <Input
          type="number"
          min={0}
          className="h-8 w-28"
          value={line.donGia}
          onChange={(e) => updateLine(i, { donGia: Number(e.target.value) || 0 })}
          aria-label={`Đơn giá dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => <span className="tabular-nums">{formatVND(line.thanhTien)}</span>,
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập Hóa Đơn"
        breadcrumbs={[
          { label: 'Tài Chính', href: ROUTES.finance },
          { label: 'Hóa Đơn', href: ROUTES.financeInvoices },
          { label: 'Tạo mới' },
        ]}
      >
        <Button size="sm" variant="outline" className="ms-print-hoadon h-8" onClick={handlePrint}>
          In Hóa Đơn
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.financeInvoices}>Danh sách hóa đơn</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor
          header={
            <>
              <InvoiceHeaderFields values={header} onChange={patchHeader} errors={errors} />

              <section aria-labelledby="section-invoice-chitiet" className="mt-6">
                <h2 id="section-invoice-chitiet" className="mb-3 text-base font-semibold">
                  Chi tiết
                </h2>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="hd-vat" className="text-sm">
                      VAT (%)
                    </Label>
                    <Input
                      id="hd-vat"
                      type="number"
                      min={0}
                      max={100}
                      className="w-24"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tổng thành tiền: </span>
                    <span className="font-semibold tabular-nums">{formatVND(tongThanhTien)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tiền thuế: </span>
                    <span className="font-semibold tabular-nums">{formatVND(tienThue)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tổng thanh toán: </span>
                    <span className="font-semibold tabular-nums text-emerald-600">
                      {formatVND(tongThanhToan)}
                    </span>
                  </div>
                </div>
              </section>

              <SourceTicketImportPanel onAddLine={addStagingLine} />

              <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
                Hàng hóa đã thêm
              </h3>
            </>
          }
          columns={lineColumns}
          lines={lines}
          onLinesChange={setLines}
          makeEmptyLine={makeEmptyLine}
          onSave={(opts) => void handleSave(opts)}
        />

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="hd-ghichu">Ghi chú</Label>
          <Textarea id="hd-ghichu" rows={2} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
