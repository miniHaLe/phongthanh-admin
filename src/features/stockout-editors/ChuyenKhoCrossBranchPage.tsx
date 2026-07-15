/**
 * Chuyển Kho cross-branch create editor — full-page line-item editor per the
 * verified reference spec. Required header fields: Từ chi nhánh, Từ nhà kho,
 * Đến chi nhánh, Đến nhà kho. Line grid `Số lượng chuyển` distinguishes this
 * from the same-branch editor (which carries `Ngăn chứa` instead). Route:
 * /xuat-kho/chuyen-kho/khac-chi-nhanh (already wired in routes/index.tsx).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  LineItemEditor,
  PageHeader,
  notify,
  type LineColumn,
} from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatVND } from '@/lib/format'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { BRANCHES, BRANCH_NAME, type BranchId } from '@/mock/seed/branches'
import { useLookup } from '@/hooks/use-lookup'
import type { ChuyenKhoCrossLine } from './stockout-editor-types'
import { createMoving } from './create-moving'
import {
  ChuyenKhoCrossHeaderFields,
  type ChuyenKhoCrossHeaderValues,
} from './chuyen-kho-cross-header-fields'
import { ChuyenKhoCrossLineEntry } from './chuyen-kho-cross-line-entry'
import { printMovingProduct } from '@/features/stockout/prints/stockout-prints'

const EMPTY_HEADER: ChuyenKhoCrossHeaderValues = {
  tuChiNhanhId: BRANCHES[0].id,
  tuKhoId: '',
  denChiNhanhId: '',
  denKhoId: '',
}

function makeEmptyLine(): ChuyenKhoCrossLine {
  return {
    serial: '',
    ma: '',
    ten: '',
    soLuong: 0,
    soLuongChuyen: 1,
    gia: 0,
    thanhTien: 0,
  }
}

export default function ChuyenKhoCrossBranchPage() {
  const navigate = useNavigate()
  const { byId: nhaKhoById } = useLookup('nha-kho')
  const [header, setHeader] = useState<ChuyenKhoCrossHeaderValues>(EMPTY_HEADER)
  const [lines, setLines] = useState<ChuyenKhoCrossLine[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChuyenKhoCrossHeaderValues, string>>
  >({})

  function patchHeader(patch: Partial<ChuyenKhoCrossHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function resetForm() {
    setHeader(EMPTY_HEADER)
    setLines([])
    setErrors({})
  }

  function validate(): boolean {
    const nextErrors: Partial<
      Record<keyof ChuyenKhoCrossHeaderValues, string>
    > = {}
    if (!header.tuKhoId) nextErrors.tuKhoId = 'Vui lòng chọn từ nhà kho!'
    if (!header.denChiNhanhId)
      nextErrors.denChiNhanhId = 'Vui lòng chọn đến chi nhánh!'
    if (!header.denKhoId) nextErrors.denKhoId = 'Vui lòng chọn đến nhà kho!'
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

    const tuKho = nhaKhoById.get(header.tuKhoId)
    const denKho = nhaKhoById.get(header.denKhoId)
    const slip = createMoving({
      tuChiNhanh: BRANCH_NAME[header.tuChiNhanhId],
      tuKho: tuKho?.tenNhaKho ?? '',
      denChiNhanh: BRANCH_NAME[header.denChiNhanhId as BranchId],
      denKho: denKho?.tenNhaKho ?? '',
      loai: 'Khác chi nhánh',
      nguoiChuyen: CURRENT_USER.hoVaTen,
      branchId: header.tuChiNhanhId,
    })

    notify.success(`Đã lưu phiếu chuyển kho ${slip.soPhieu}`)

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.stockOutTransfer)
    }
  }

  function handlePrint() {
    const tuKho = nhaKhoById.get(header.tuKhoId)
    const denKho = nhaKhoById.get(header.denKhoId)
    void printMovingProduct({
      id: 'preview',
      trangThai: 'Chưa xác nhận',
      soPhieu: 'Phát sinh tự động',
      ngayLap: new Date().toISOString(),
      tuChiNhanh: BRANCH_NAME[header.tuChiNhanhId],
      tuKho: tuKho?.tenNhaKho ?? '',
      denChiNhanh: header.denChiNhanhId
        ? BRANCH_NAME[header.denChiNhanhId as BranchId]
        : '',
      denKho: denKho?.tenNhaKho ?? '',
      loai: 'Khác chi nhánh',
      nguoiChuyen: CURRENT_USER.hoVaTen,
      branchId: header.tuChiNhanhId,
    })
  }

  const lineColumns: LineColumn<ChuyenKhoCrossLine>[] = [
    { key: 'serial', header: 'Serial', cell: (line) => line.serial || '—' },
    { key: 'ma', header: 'Mã', cell: (line) => line.ma },
    { key: 'ten', header: 'Tên', cell: (line) => line.ten },
    { key: 'soLuong', header: 'Số lượng', cell: (line) => line.soLuong },
    {
      key: 'soLuongChuyen',
      header: 'Số lượng chuyển',
      cell: (line) => line.soLuongChuyen,
    },
    { key: 'gia', header: 'Giá', cell: (line) => formatVND(line.gia) },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => (
        <span className="tabular-nums">{formatVND(line.thanhTien)}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu chuyển kho — khác chi nhánh"
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Chuyển Kho', href: ROUTES.stockOutTransfer },
          { label: 'Khác chi nhánh' },
        ]}
      >
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handlePrint}
        >
          In
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.stockOutTransfer}>Danh sách chuyển kho</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor<ChuyenKhoCrossLine>
          header={
            <>
              <ChuyenKhoCrossHeaderFields
                values={header}
                onChange={patchHeader}
                errors={errors}
              />
              <ChuyenKhoCrossLineEntry
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
