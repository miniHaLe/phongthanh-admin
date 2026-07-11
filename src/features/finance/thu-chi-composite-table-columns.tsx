import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from '@/components/shared/data-table/table-cell-content'
import { ROUTES } from '@/constants/routes'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import { formatDateTime, formatVND } from '@/lib/format'
import {
  hinhThucLabel,
  loaiThuChiLabel,
  tinhTrangLabel,
} from '@/config/finance-tables/thu-chi.config'
import type { ThuChi } from '@/types/finance-types'

const TICKET_BY_SO_PHIEU = new Map(
  MOCK_TICKETS.map((ticket) => [ticket.soPhieu, ticket]),
)
const metaLabelClass = 'text-xs font-medium text-muted-foreground'

function sortOnlyColumn(
  id: keyof ThuChi,
  label: string,
): ColumnDef<ThuChi, unknown> {
  return {
    id,
    accessorFn: (row) => row[id],
    header: label,
    meta: { presentation: 'sort-only' },
  }
}

function protectedValue(
  value: string | number | null | undefined,
  tabular = false,
) {
  return (
    <TableProtectedValue tabular={tabular}>
      {String(value ?? '—')}
    </TableProtectedValue>
  )
}

export function useThuChiCompositeColumns(
  onPrint: (row: ThuChi) => unknown,
): ColumnDef<ThuChi, unknown>[] {
  return useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <span className="inline-flex min-h-11 min-w-11 items-center justify-center lg:min-h-4 lg:min-w-4">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(checked) =>
                table.toggleAllPageRowsSelected(checked === true)
              }
              aria-label="Chọn tất cả"
            />
          </span>
        ),
        enableSorting: false,
        size: 56,
        cell: ({ row }) => (
          <span className="inline-flex min-h-11 min-w-11 items-center justify-center lg:min-h-4 lg:min-w-4">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) =>
                row.toggleSelected(checked === true)
              }
              aria-label={`Chọn chứng từ ${row.original.soChungTu}`}
            />
          </span>
        ),
      },
      {
        id: 'statusType',
        header: 'Trạng thái / Loại',
        size: 170,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'tinhTrang', label: 'Tình trạng' },
            { id: 'loaiThuChi', label: 'Loại phiếu' },
            { id: 'hinhThucId', label: 'Hình thức' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Trạng thái</span>
            <TableDescription value={tinhTrangLabel(row.original.tinhTrang)} />
            <span className={metaLabelClass}>Loại phiếu</span>
            <TableDescription
              value={loaiThuChiLabel(row.original.loaiThuChi)}
            />
            <span className={metaLabelClass}>Hình thức</span>
            <TableDescription value={hinhThucLabel(row.original.hinhThucId)} />
          </TableMetaStack>
        ),
      },
      {
        id: 'documentRefs',
        header: 'Tham chiếu chứng từ',
        size: 220,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'soChungTu', label: 'Số chứng từ' },
            { id: 'soPhieuScNk', label: 'Số phiếu sửa chữa / nhập kho' },
          ],
        },
        cell: ({ row }) => {
          const sourceNumber = row.original.soPhieuScNk
          const ticket = sourceNumber
            ? TICKET_BY_SO_PHIEU.get(sourceNumber)
            : undefined

          return (
            <TableMetaStack>
              <span className={metaLabelClass}>Chứng từ</span>
              {protectedValue(row.original.soChungTu)}
              <span className={metaLabelClass}>Phiếu SC/NK</span>
              {ticket && sourceNumber ? (
                <Link
                  to={ROUTES.repairDetail(ticket.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  <TableProtectedValue>{sourceNumber}</TableProtectedValue>
                </Link>
              ) : (
                protectedValue(sourceNumber)
              )}
            </TableMetaStack>
          )
        },
      },
      {
        id: 'party',
        header: 'Đối tượng',
        size: 220,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'tenKhachHang', label: 'Tên khách hàng' },
            { id: 'daiLy', label: 'Đại lý / Trạm' },
            { id: 'kyThuat', label: 'Kỹ thuật' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Khách hàng</span>
            <TableDescription value={row.original.tenKhachHang} />
            <span className={metaLabelClass}>Đại lý/Trạm</span>
            <TableDescription value={row.original.daiLy ?? '—'} />
            <span className={metaLabelClass}>Kỹ thuật</span>
            <TableDescription value={row.original.kyThuat ?? '—'} />
          </TableMetaStack>
        ),
      },
      {
        id: 'amount',
        header: 'Số tiền',
        size: 130,
        enableSorting: false,
        meta: { compositeSortOptions: [{ id: 'soTien', label: 'Số tiền' }] },
        cell: ({ row }) => protectedValue(formatVND(row.original.soTien), true),
      },
      {
        id: 'content',
        header: 'Nội dung',
        size: 200,
        enableSorting: false,
        meta: { compositeSortOptions: [{ id: 'noiDung', label: 'Nội dung' }] },
        cell: ({ row }) => <TableDescription value={row.original.noiDung} />,
      },
      {
        id: 'created',
        header: 'Tạo chứng từ',
        size: 190,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayLap', label: 'Ngày lập' },
            { id: 'nguoiTao', label: 'Người tạo' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày lập</span>
            {protectedValue(formatDateTime(row.original.ngayLap), true)}
            <span className={metaLabelClass}>Người tạo</span>
            <TableDescription value={row.original.nguoiTao} />
          </TableMetaStack>
        ),
      },
      {
        id: 'collected',
        header: 'Thu / Chi',
        size: 190,
        enableSorting: false,
        meta: {
          compositeSortOptions: [
            { id: 'ngayThuChi', label: 'Ngày thu / chi' },
            { id: 'nguoiThuChi', label: 'Người thu / chi' },
          ],
        },
        cell: ({ row }) => (
          <TableMetaStack>
            <span className={metaLabelClass}>Ngày</span>
            {protectedValue(
              row.original.ngayThuChi
                ? formatDateTime(row.original.ngayThuChi)
                : '—',
              true,
            )}
            <span className={metaLabelClass}>Người</span>
            <TableDescription value={row.original.nguoiThuChi ?? '—'} />
          </TableMetaStack>
        ),
      },
      {
        id: 'print',
        header: 'In',
        size: 64,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="ms-btn-receipt-print h-11 w-11 lg:h-7 lg:w-7"
            title="in phiếu"
            aria-label={`In phiếu ${row.original.soChungTu}`}
            onClick={() => void onPrint(row.original)}
          >
            <Printer className="size-4" />
          </Button>
        ),
      },
      sortOnlyColumn('tinhTrang', 'Tình trạng'),
      sortOnlyColumn('loaiThuChi', 'Loại phiếu'),
      sortOnlyColumn('hinhThucId', 'Hình thức'),
      sortOnlyColumn('soChungTu', 'Số chứng từ'),
      sortOnlyColumn('soPhieuScNk', 'Số phiếu sửa chữa / nhập kho'),
      sortOnlyColumn('tenKhachHang', 'Tên khách hàng'),
      sortOnlyColumn('daiLy', 'Đại lý / Trạm'),
      sortOnlyColumn('kyThuat', 'Kỹ thuật'),
      sortOnlyColumn('soTien', 'Số tiền'),
      sortOnlyColumn('noiDung', 'Nội dung'),
      sortOnlyColumn('ngayLap', 'Ngày lập'),
      sortOnlyColumn('nguoiTao', 'Người tạo'),
      sortOnlyColumn('ngayThuChi', 'Ngày thu / chi'),
      sortOnlyColumn('nguoiThuChi', 'Người thu / chi'),
    ],
    [onPrint],
  )
}
