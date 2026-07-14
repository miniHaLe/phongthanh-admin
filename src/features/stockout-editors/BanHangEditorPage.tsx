/**
 * Bán Hàng create/edit editor — full-page line-item editor per the verified
 * reference spec. Handles both create (ROUTES.stockOutSalesCreate) and edit
 * (`/ban-hang/:id/sua`) via useParams. Composes the shared LineItemEditor
 * directly rather than through a generic editor-page template — the 5
 * stock-out editors differ enough (header fieldsets, line columns, dual save)
 * that a shared host would leak config for one-offs.
 */
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
import { BRANCHES, type BranchId } from '@/mock/seed/branches'
import { useAppStore, type ActiveBranch } from '@/store/app-store'
import type { BanHangLine } from './stockout-editor-types'
import {
  createSelling,
  updateSelling,
  findSellingOrder,
} from './create-selling'
import {
  BanHangHeaderFields,
  type BanHangHeaderValues,
  type CustomerOption,
} from './ban-hang-header-fields'
import { BanHangLineEntry } from './ban-hang-line-entry'
import {
  printPhieuBanHang,
  printPhieuThu,
} from '@/features/stockout/prints/stockout-prints'

const EMPTY_HEADER: BanHangHeaderValues = {
  hinhThucThanhToan: '',
  khachHang: null,
  ghiChu: '',
}

function makeEmptyLine(): BanHangLine {
  return {
    serial: '',
    ten: '',
    model: '',
    capNhatGia: false,
    gia: 0,
    soLuong: 1,
    thanhTien: 0,
  }
}

function resolveSellingBranchId(activeBranch: ActiveBranch): BranchId | null {
  if (activeBranch !== 'all') return activeBranch
  return (
    BRANCHES.find((branch) => branch.name === CURRENT_USER.chiNhanh)?.id ?? null
  )
}

export default function BanHangEditorPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const activeBranch = useAppStore((state) => state.activeBranch)

  const [header, setHeader] = useState<BanHangHeaderValues>(EMPTY_HEADER)
  const [lines, setLines] = useState<BanHangLine[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<'hinhThucThanhToan' | 'khachHang', string>>
  >({})

  useEffect(() => {
    if (!id) return
    const existing = findSellingOrder(id)
    if (!existing) {
      notify.error('Không tìm thấy phiếu bán hàng!')
      navigate(ROUTES.stockOutSales)
      return
    }
    setHeader({
      hinhThucThanhToan: 'Tiền mặt',
      khachHang: {
        id: existing.id,
        label: existing.khachHang,
        sdt: existing.dienThoai,
      },
      ghiChu: existing.ghiChu,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function patchHeader(patch: Partial<BanHangHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function resetForm() {
    setHeader(EMPTY_HEADER)
    setLines([])
    setErrors({})
  }

  function validate(): boolean {
    const nextErrors: Partial<
      Record<'hinhThucThanhToan' | 'khachHang', string>
    > = {}
    if (!header.hinhThucThanhToan)
      nextErrors.hinhThucThanhToan = 'Vui lòng chọn hình thức thanh toán!'
    if (!header.khachHang) nextErrors.khachHang = 'Vui lòng chọn khách hàng!'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      notify.error(nextErrors.khachHang ?? nextErrors.hinhThucThanhToan!)
      return false
    }
    if (lines.length === 0) {
      notify.error('Vui lòng thêm hàng hóa!')
      return false
    }
    return true
  }

  function buildInput(branchId: BranchId) {
    const tongTien = lines.reduce((s, l) => s + l.thanhTien, 0)
    return {
      khachHang: header.khachHang!.label,
      dienThoai: (header.khachHang as CustomerOption).sdt ?? '',
      ghiChu: header.ghiChu,
      nguoiLap: CURRENT_USER.hoVaTen,
      branchId,
      tongTien,
    }
  }

  function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return

    const branchId = resolveSellingBranchId(activeBranch)
    if (!branchId) {
      notify.error('Không xác định được chi nhánh lập phiếu bán hàng!')
      return
    }

    const input = buildInput(branchId)
    const order = isEdit && id ? updateSelling(id, input) : createSelling(input)
    if (!order) {
      notify.error('Không tìm thấy phiếu bán hàng!')
      return
    }

    notify.success(`Đã lưu phiếu bán hàng ${order.soPhieu}`)
    void queryClient.invalidateQueries({ queryKey: ['ban-hang-list'] })

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.stockOutSales)
    }
  }

  function currentOrderSnapshot() {
    const tongTien = lines.reduce((s, l) => s + l.thanhTien, 0)
    return {
      id: id ?? 'preview',
      soPhieu: 'Phát sinh tự động',
      ngayLap: new Date().toISOString(),
      khachHang: header.khachHang?.label ?? '',
      dienThoai: (header.khachHang as CustomerOption)?.sdt ?? '',
      tongTien,
      nguoiLap: CURRENT_USER.hoVaTen,
      ghiChu: header.ghiChu,
      branchId: resolveSellingBranchId(activeBranch) ?? '',
    }
  }

  const lineColumns: LineColumn<BanHangLine>[] = [
    { key: 'serial', header: 'Serial', cell: (line) => line.serial || '—' },
    { key: 'ten', header: 'Tên', cell: (line) => line.ten },
    { key: 'model', header: 'Model', cell: (line) => line.model || '—' },
    {
      key: 'capNhatGia',
      header: 'Cập nhật giá',
      cell: (line) => (line.capNhatGia ? 'Có' : 'Không'),
    },
    { key: 'gia', header: 'Giá', cell: (line) => formatVND(line.gia) },
    { key: 'soLuong', header: 'Số lượng', cell: (line) => line.soLuong },
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
        title={isEdit ? 'Chỉnh sửa phiếu bán hàng' : 'Lập phiếu bán hàng'}
        breadcrumbs={[
          { label: 'Xuất Kho', href: ROUTES.stockOut },
          { label: 'Bán Hàng', href: ROUTES.stockOutSales },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      >
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => void printPhieuBanHang(currentOrderSnapshot())}
        >
          In Phiếu BH
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => void printPhieuThu(currentOrderSnapshot())}
        >
          In Phiếu Thu
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={ROUTES.stockOutSales}>Danh sách đơn hàng</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor<BanHangLine>
          header={
            <>
              <BanHangHeaderFields
                values={header}
                onChange={patchHeader}
                errors={errors}
              />
              <BanHangLineEntry
                onAdd={(line) => setLines((prev) => [...prev, line])}
              />
              <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
                Danh sách hàng
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
              label: 'Tổng tiền:',
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
