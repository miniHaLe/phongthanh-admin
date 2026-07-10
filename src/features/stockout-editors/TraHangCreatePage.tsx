/**
 * Trả Hàng create editor — full-page line-item editor per the verified
 * reference spec. "Hình thức trả" select at top; its 4th option label is
 * "Trả xác linh kiện" on this editor — intentionally distinct from the list
 * filter's "Trả hàng từ kho" label, which the reference app also uses
 * inconsistently between the two screens; this editor is authoritative for
 * the value it writes on create. The reference app's two-stage source-pick
 * flow is simplified here to a single line grid + the type select. Route:
 * /xuat-kho/tra-hang/tao-moi (already wired in routes/index.tsx).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LineItemEditor, PageHeader, notify, type LineColumn } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatVND } from '@/lib/format'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { BRANCHES } from '@/mock/seed/branches'
import {
  HINH_THUC_TRA_EDITOR_OPTIONS,
  type TraHangLine,
} from './stockout-editor-types'
import { createReturn } from './create-return'
import { TraHangLineEntry } from './tra-hang-line-entry'
import { printReturnProduct } from '@/features/stockout/prints/stockout-prints'

function makeEmptyLine(): TraHangLine {
  return {
    maPhieu: '',
    soPhieuSC: '',
    serial: '',
    tenHang: '',
    kho: '',
    nganChua: '',
    gia: 0,
    soLuong: 1,
    soLuongTra: 1,
    thanhTien: 0,
  }
}

export default function TraHangCreatePage() {
  const navigate = useNavigate()
  const [hinhThucTra, setHinhThucTra] = useState<string>(HINH_THUC_TRA_EDITOR_OPTIONS[0])
  const [lines, setLines] = useState<TraHangLine[]>([])

  function resetForm() {
    setHinhThucTra(HINH_THUC_TRA_EDITOR_OPTIONS[0])
    setLines([])
  }

  function validate(): boolean {
    if (lines.length === 0) {
      notify.error('Vui lòng thêm hàng trả!')
      return false
    }
    return true
  }

  function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return

    const slip = createReturn({
      hinhThucTra,
      nguoiLap: CURRENT_USER.hoVaTen,
      branchId: BRANCHES[0].id,
    })

    notify.success(`Đã lưu phiếu trả hàng ${slip.soPhieu}`)

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.stockOutReturns)
    }
  }

  function handlePrint() {
    void printReturnProduct({
      id: 'preview',
      soPhieu: 'Phát sinh tự động',
      ngayTra: new Date().toISOString(),
      hinhThucTra,
      nguoiLap: CURRENT_USER.hoVaTen,
      branchId: BRANCHES[0].id,
    })
  }

  const lineColumns: LineColumn<TraHangLine>[] = [
    { key: 'maPhieu', header: 'Mã phiếu', cell: (line) => line.maPhieu },
    { key: 'soPhieuSC', header: 'Số phiếu SC', cell: (line) => line.soPhieuSC || '—' },
    { key: 'serial', header: 'Serial', cell: (line) => line.serial || '—' },
    { key: 'tenHang', header: 'Tên hàng', cell: (line) => line.tenHang },
    { key: 'kho', header: 'Kho', cell: (line) => line.kho },
    { key: 'nganChua', header: 'Ngăn chứa', cell: (line) => line.nganChua },
    { key: 'gia', header: 'Giá', cell: (line) => formatVND(line.gia) },
    { key: 'soLuong', header: 'Số lượng', cell: (line) => line.soLuong },
    { key: 'soLuongTra', header: 'Số lượng trả', cell: (line) => line.soLuongTra },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => <span className="tabular-nums">{formatVND(line.thanhTien)}</span>,
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu trả hàng"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Trả Hàng', href: ROUTES.stockOutReturns },
          { label: 'Tạo mới' },
        ]}
      >
        <Button size="sm" variant="outline" className="h-8" onClick={handlePrint}>
          In
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.stockOutReturns}>Danh sách đơn hàng</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor<TraHangLine>
          header={
            <>
              <section aria-labelledby="section-th-loai">
                <h2 id="section-th-loai" className="mb-4 text-base font-semibold">
                  Loại trả hàng
                </h2>
                <div className="max-w-xs">
                  <Label htmlFor="th-hinh-thuc" className="text-sm">
                    Hình thức trả
                  </Label>
                  <Select value={hinhThucTra} onValueChange={setHinhThucTra}>
                    <SelectTrigger id="th-hinh-thuc" aria-label="Hình thức trả">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HINH_THUC_TRA_EDITOR_OPTIONS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
              <TraHangLineEntry onAdd={(line) => setLines((prev) => [...prev, line])} />
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
