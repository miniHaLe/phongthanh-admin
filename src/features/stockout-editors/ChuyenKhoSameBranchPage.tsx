/**
 * Chuyển Kho same-branch create editor — full-page line-item editor per the
 * verified reference spec. Both branches locked to own; adds "Đến ngăn chứa"*
 * (cabinet cascade) + per-line "Ngăn chứa" column, distinguishing this editor
 * from the cross-branch one (which carries "Số lượng chuyển" instead). Route:
 * /xuat-kho/chuyen-kho/cung-chi-nhanh (already wired in routes/index.tsx).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LineItemEditor, PageHeader, notify, type LineColumn } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatVND } from '@/lib/format'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { BRANCHES, BRANCH_NAME } from '@/mock/seed/branches'
import { NHA_KHO_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import type { ChuyenKhoSameLine } from './stockout-editor-types'
import { createMoving } from './create-moving'
import {
  ChuyenKhoSameHeaderFields,
  type ChuyenKhoSameHeaderValues,
} from './chuyen-kho-same-header-fields'
import { ChuyenKhoSameLineEntry } from './chuyen-kho-same-line-entry'
import { printMovingProduct } from '@/features/stockout/prints/stockout-prints'

const CURRENT_BRANCH_ID = BRANCHES[0].id

const EMPTY_HEADER: ChuyenKhoSameHeaderValues = {
  tuKhoId: '',
  denKhoId: '',
  denNganChuaId: '',
}

function makeEmptyLine(): ChuyenKhoSameLine {
  return { serial: '', ma: '', ten: '', nganChua: '', soLuong: 1, gia: 0, thanhTien: 0 }
}

export default function ChuyenKhoSameBranchPage() {
  const navigate = useNavigate()
  const [header, setHeader] = useState<ChuyenKhoSameHeaderValues>(EMPTY_HEADER)
  const [lines, setLines] = useState<ChuyenKhoSameLine[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChuyenKhoSameHeaderValues, string>>
  >({})

  function patchHeader(patch: Partial<ChuyenKhoSameHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function resetForm() {
    setHeader(EMPTY_HEADER)
    setLines([])
    setErrors({})
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof ChuyenKhoSameHeaderValues, string>> = {}
    if (!header.tuKhoId) nextErrors.tuKhoId = 'Vui lòng chọn từ nhà kho!'
    if (!header.denKhoId) nextErrors.denKhoId = 'Vui lòng chọn đến nhà kho!'
    if (!header.denNganChuaId) nextErrors.denNganChuaId = 'Vui lòng chọn đến ngăn chứa!'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      notify.error(Object.values(nextErrors)[0]!)
      return false
    }
    if (lines.length === 0) {
      notify.error('Vui lòng thêm hàng chuyển!')
      return false
    }
    return true
  }

  function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return

    const tuKho = NHA_KHO_ROWS.find((k) => k.id === header.tuKhoId)
    const denKho = NHA_KHO_ROWS.find((k) => k.id === header.denKhoId)
    const branchName = BRANCH_NAME[CURRENT_BRANCH_ID]
    const slip = createMoving({
      tuChiNhanh: branchName,
      tuKho: tuKho?.tenNhaKho ?? '',
      denChiNhanh: branchName,
      denKho: denKho?.tenNhaKho ?? '',
      loai: 'Cùng chi nhánh',
      nguoiChuyen: CURRENT_USER.hoVaTen,
      branchId: CURRENT_BRANCH_ID,
    })

    notify.success(`Đã lưu phiếu chuyển kho ${slip.soPhieu}`)

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.stockOutTransfer)
    }
  }

  function handlePrint() {
    const tuKho = NHA_KHO_ROWS.find((k) => k.id === header.tuKhoId)
    const denKho = NHA_KHO_ROWS.find((k) => k.id === header.denKhoId)
    const branchName = BRANCH_NAME[CURRENT_BRANCH_ID]
    void printMovingProduct({
      id: 'preview',
      trangThai: 'Chưa xác nhận',
      soPhieu: 'Phát sinh tự động',
      ngayLap: new Date().toISOString(),
      tuChiNhanh: branchName,
      tuKho: tuKho?.tenNhaKho ?? '',
      denChiNhanh: branchName,
      denKho: denKho?.tenNhaKho ?? '',
      loai: 'Cùng chi nhánh',
      nguoiChuyen: CURRENT_USER.hoVaTen,
      branchId: CURRENT_BRANCH_ID,
    })
  }

  const denNganChuaOptions = header.denKhoId
    ? NGAN_CHUA_ROWS.filter((n) => n.nhaKhoId === header.denKhoId)
    : NGAN_CHUA_ROWS

  const lineColumns: LineColumn<ChuyenKhoSameLine>[] = [
    { key: 'serial', header: 'Serial', cell: (line) => line.serial || '—' },
    { key: 'ma', header: 'Mã', cell: (line) => line.ma },
    { key: 'ten', header: 'Tên', cell: (line) => line.ten },
    { key: 'nganChua', header: 'Ngăn chứa', cell: (line) => line.nganChua },
    { key: 'soLuong', header: 'Số lượng', cell: (line) => line.soLuong },
    { key: 'gia', header: 'Giá', cell: (line) => formatVND(line.gia) },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => <span className="tabular-nums">{formatVND(line.thanhTien)}</span>,
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu chuyển kho — cùng chi nhánh"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Chuyển Kho', href: ROUTES.stockOutTransfer },
          { label: 'Cùng chi nhánh' },
        ]}
      >
        <Button size="sm" variant="outline" className="h-8" onClick={handlePrint}>
          In
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.stockOutTransfer}>Danh sách chuyển kho</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor<ChuyenKhoSameLine>
          header={
            <>
              <ChuyenKhoSameHeaderFields
                branchId={CURRENT_BRANCH_ID}
                values={header}
                onChange={patchHeader}
                errors={errors}
              />
              <ChuyenKhoSameLineEntry
                nganChuaOptions={denNganChuaOptions}
                onAdd={(line) => setLines((prev) => [...prev, line])}
              />
              <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
                Danh sách hàng chuyển
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
