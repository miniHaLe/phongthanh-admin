/**
 * Cấp Linh Kiện create editor — full-page line-item editor per the verified
 * reference spec. Composes the shared LineItemEditor directly (no generic
 * editor-page template layered on top): header fieldset "Thông tin chung" +
 * "Chi tiết" entry panel render in the `header` slot; the grid below is
 * "Danh sách hàng nhập". Route: /xuat-kho/cap-linh-kien/tao-moi (already
 * wired in routes/index.tsx).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LineItemEditor, PageHeader, notify, type LineColumn } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatVND } from '@/lib/format'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { BRANCHES } from '@/mock/seed/branches'
import type { CapLinhKienLine } from './stockout-editor-types'
import { createCheckout } from './create-checkout'
import {
  CapLinhKienHeaderFields,
  type CapLinhKienHeaderValues,
} from './cap-linh-kien-header-fields'
import { CapLinhKienLineEntry } from './cap-linh-kien-line-entry'

const EMPTY_HEADER: CapLinhKienHeaderValues = {
  kyThuat: null,
  ghiChu: '',
}

function makeEmptyLine(): CapLinhKienLine {
  return {
    serial: '',
    soPhieuSC: '',
    maHang: '',
    tenHang: '',
    nhaSanXuat: '',
    model: '',
    khoTen: '',
    nganChua: '',
    gia: 0,
    soLuong: 1,
    thanhTien: 0,
  }
}

export default function CapLinhKienCreatePage() {
  const navigate = useNavigate()
  const [header, setHeader] = useState<CapLinhKienHeaderValues>(EMPTY_HEADER)
  const [lines, setLines] = useState<CapLinhKienLine[]>([])
  const [kyThuatError, setKyThuatError] = useState<string | undefined>()

  function patchHeader(patch: Partial<CapLinhKienHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function resetForm() {
    setHeader(EMPTY_HEADER)
    setLines([])
    setKyThuatError(undefined)
  }

  function validate(): boolean {
    if (!header.kyThuat) {
      setKyThuatError('Vui lòng chọn kỹ thuật!')
      notify.error('Vui lòng chọn kỹ thuật!')
      return false
    }
    setKyThuatError(undefined)
    if (lines.length === 0) {
      notify.error('Vui lòng chọn sản phẩm cấp cho kỹ thuật!')
      return false
    }
    return true
  }

  function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return

    const slip = createCheckout({
      kyThuat: header.kyThuat!.label,
      ghiChu: header.ghiChu,
      nguoiLap: CURRENT_USER.hoVaTen,
      branchId: BRANCHES[0].id,
      lines,
    })

    notify.success(`Đã lưu phiếu cấp linh kiện ${slip.soPhieuCap}`)

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.stockOutPartsDispatch)
    }
  }

  const lineColumns: LineColumn<CapLinhKienLine>[] = [
    { key: 'serial', header: 'Serial', cell: (line) => line.serial || '—' },
    { key: 'soPhieuSC', header: 'Số phiếu', cell: (line) => line.soPhieuSC },
    { key: 'maHang', header: 'Mã hàng', cell: (line) => line.maHang },
    { key: 'tenHang', header: 'Tên hàng', cell: (line) => line.tenHang },
    { key: 'nhaSanXuat', header: 'Nhà sản xuất', cell: (line) => line.nhaSanXuat },
    { key: 'model', header: 'Model', cell: (line) => line.model },
    { key: 'khoTen', header: 'Nhà kho', cell: (line) => line.khoTen },
    { key: 'nganChua', header: 'Ngăn chứa', cell: (line) => line.nganChua },
    { key: 'gia', header: 'Giá', cell: (line) => formatVND(line.gia) },
    { key: 'soLuong', header: 'Số lượng', cell: (line) => line.soLuong },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => <span className="tabular-nums">{formatVND(line.thanhTien)}</span>,
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu cấp linh kiện"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Cấp Linh Kiện', href: ROUTES.stockOutPartsDispatch },
          { label: 'Tạo mới' },
        ]}
      >
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.stockOutPartsDispatch}>Danh sách phiếu</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor<CapLinhKienLine>
          header={
            <>
              <CapLinhKienHeaderFields
                values={header}
                onChange={patchHeader}
                error={kyThuatError}
              />
              <CapLinhKienLineEntry onAdd={(line) => setLines((prev) => [...prev, line])} />
              <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
                Danh sách hàng nhập
              </h3>
            </>
          }
          columns={lineColumns}
          lines={lines}
          onLinesChange={setLines}
          makeEmptyLine={makeEmptyLine}
          totals={[
            {
              key: 'total',
              label: 'Tổng tiền',
              compute: (ls) => (
                <span className="font-semibold tabular-nums">
                  {formatVND(ls.reduce((s, l) => s + l.thanhTien, 0))}
                </span>
              ),
            },
          ]}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
