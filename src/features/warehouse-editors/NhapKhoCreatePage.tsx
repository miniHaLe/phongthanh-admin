/**
 * Nhập Kho create editor — full-page line-item editor per the verified
 * reference spec. Composes the P2 LineItemEditor directly (Finding 11 — no
 * shared super-template): header fieldset "Thông tin khách hàng" + "Chi tiết"
 * entry panel render in the `header` slot; the grid below is the line-item
 * table "Danh sách hàng nhập" with the verified column set. Route:
 * /quan-ly-kho/nhap-kho/tao-moi (already wired in routes/index.tsx).
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineItemEditor,
  PageHeader,
  notify,
  type LineColumn,
} from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { formatVND } from '@/lib/format'
import { useLookup } from '@/hooks/use-lookup'
import { CURRENT_USER } from '@/mock/current-user-mock'
import { BRANCHES } from '@/mock/seed/branches'
import type { ReceivingLine } from '@/domains/warehouse/types'
import { createReceiving } from './create-receiving'
import {
  NhapKhoHeaderFields,
  type NhapKhoHeaderValues,
} from './nhap-kho-header-fields'
import { NhapKhoLineEntry } from './nhap-kho-line-entry'
import { printReceiving } from '@/features/warehouse/prints/warehouse-prints'

const EMPTY_HEADER: NhapKhoHeaderValues = {
  khoId: '',
  nganChuaId: '',
  hinhThucThanhToan: '',
  nhomKhachHang: '',
  nhaCungCap: null,
  soHoaDon: '',
  nguoiGiao: '',
  ngayNhapHoaDon: '',
  ngayGiao: '',
  soDatHang: '',
  ghiChu: '',
}

function makeEmptyLine(defaultNganChua: string): ReceivingLine {
  return {
    ma: '',
    ten: '',
    nganChua: defaultNganChua,
    soLuong: 1,
    donGia: 0,
    thanhTien: 0,
    capNhatGia: false,
    serial: '',
  }
}

export default function NhapKhoCreatePage() {
  const navigate = useNavigate()
  const { byId: nhaKhoById } = useLookup('nha-kho')
  const { rows: nganChuaRows } = useLookup('ngan-chua')
  const [header, setHeader] = useState<NhapKhoHeaderValues>(EMPTY_HEADER)
  const [lines, setLines] = useState<ReceivingLine[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<keyof NhapKhoHeaderValues, string>>
  >({})

  function patchHeader(patch: Partial<NhapKhoHeaderValues>) {
    setHeader((prev) => ({ ...prev, ...patch }))
  }

  function updateLine(index: number, patch: Partial<ReceivingLine>) {
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
    setHeader(EMPTY_HEADER)
    setLines([])
    setErrors({})
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof NhapKhoHeaderValues, string>> = {}
    if (!header.khoId) nextErrors.khoId = 'Vui lòng chọn nhà kho!'
    if (!header.nganChuaId) nextErrors.nganChuaId = 'Vui lòng chọn ngăn chứa!'
    if (!header.hinhThucThanhToan)
      nextErrors.hinhThucThanhToan = 'Vui lòng chọn hình thức thanh toán!'
    if (!header.nhaCungCap)
      nextErrors.nhaCungCap = 'Vui lòng chọn nhà cung cấp!'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      notify.error('Vui lòng chọn nhà cung cấp!')
      return false
    }
    if (lines.length === 0) {
      notify.error('Vui lòng thêm hàng hóa!')
      return false
    }
    return true
  }

  function handleSave({ saveAndNew }: { saveAndNew: boolean }) {
    if (!validate()) return

    const khoTen = nhaKhoById.get(header.khoId)?.tenNhaKho ?? ''
    const voucher = createReceiving({
      soDatHang: header.soDatHang,
      soHoaDon: header.soHoaDon,
      nhaCungCap: header.nhaCungCap!.label,
      hinhThucThanhToan: header.hinhThucThanhToan,
      khoTen,
      nguoiLap: CURRENT_USER.hoVaTen,
      ghiChu: header.ghiChu,
      branchId: BRANCHES[0].id,
      lines,
    })

    notify.success(`Đã lưu phiếu nhập kho ${voucher.soPhieu}`)

    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.inventoryStockEntry)
    }
  }

  function handlePrint() {
    const khoTen = nhaKhoById.get(header.khoId)?.tenNhaKho ?? ''
    void printReceiving({
      id: 'preview',
      soPhieu: 'Phát sinh tự động',
      soDatHang: header.soDatHang,
      soHoaDon: header.soHoaDon,
      nhaCungCap: header.nhaCungCap?.label ?? '',
      hinhThucThanhToan: header.hinhThucThanhToan,
      khoTen,
      soTien: lines.reduce((s, l) => s + l.thanhTien, 0),
      nguoiLap: CURRENT_USER.hoVaTen,
      ngayLap: new Date().toISOString(),
      ghiChu: header.ghiChu,
      branchId: BRANCHES[0].id,
      lines,
    })
  }

  // Cell handlers route through `updateLine` (index-based) rather than the
  // `update` callback LineItemEditor passes to each cell, because Thành tiền
  // must recompute from soLuong × donGia on every edit to either field —
  // logic kept in one place instead of duplicated per cell.
  const lineColumns: LineColumn<ReceivingLine>[] = [
    {
      key: 'ma',
      header: 'Mã',
      cell: (line, i) => (
        <Input
          className="h-8 w-28"
          value={line.ma}
          onChange={(e) => updateLine(i, { ma: e.target.value })}
          aria-label={`Mã dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'ten',
      header: 'Tên',
      cell: (line, i) => (
        <Input
          className="h-8 w-40"
          value={line.ten}
          onChange={(e) => updateLine(i, { ten: e.target.value })}
          aria-label={`Tên dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'nganChua',
      header: 'Ngăn chứa',
      cell: (line, i) => (
        <Select
          value={line.nganChua}
          onValueChange={(v) => updateLine(i, { nganChua: v })}
        >
          <SelectTrigger
            className="h-8 w-28"
            aria-label={`Ngăn chứa dòng ${i + 1}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {nganChuaRows.map((n) => (
              <SelectItem key={n.id} value={n.tenNgan}>
                {n.tenNgan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          onChange={(e) =>
            updateLine(i, { soLuong: Number(e.target.value) || 0 })
          }
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
          onChange={(e) =>
            updateLine(i, { donGia: Number(e.target.value) || 0 })
          }
          aria-label={`Đơn giá dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'thanhTien',
      header: 'Thành tiền',
      cell: (line) => (
        <span className="tabular-nums">{formatVND(line.thanhTien)}</span>
      ),
    },
    {
      key: 'capNhatGia',
      header: 'Cập nhật giá',
      cell: (line, i) => (
        <Checkbox
          checked={line.capNhatGia}
          onCheckedChange={(c) => updateLine(i, { capNhatGia: !!c })}
          aria-label={`Cập nhật giá dòng ${i + 1}`}
        />
      ),
    },
    {
      key: 'serial',
      header: 'Serial',
      cell: (line, i) => (
        <Input
          className="h-8 w-32"
          value={line.serial}
          onChange={(e) => updateLine(i, { serial: e.target.value })}
          aria-label={`Serial dòng ${i + 1}`}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Lập phiếu nhập kho"
        breadcrumbs={[
          { label: 'Quản Lý Kho', href: ROUTES.inventory },
          { label: 'Nhập Kho', href: ROUTES.inventoryStockEntry },
          { label: 'Tạo mới' },
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
          <Link to={ROUTES.inventoryStockEntry}>Danh sách nhập kho</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <LineItemEditor
          header={
            <>
              <NhapKhoHeaderFields
                values={header}
                onChange={patchHeader}
                errors={errors}
              />
              <NhapKhoLineEntry
                onAdd={(line) => setLines((prev) => [...prev, line])}
              />
              <h3 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
                Danh sách hàng nhập
              </h3>
            </>
          }
          columns={lineColumns}
          lines={lines}
          onLinesChange={setLines}
          makeEmptyLine={() => makeEmptyLine(nganChuaRows[0]?.tenNgan ?? '')}
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
