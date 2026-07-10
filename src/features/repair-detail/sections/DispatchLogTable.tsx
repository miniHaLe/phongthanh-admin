/** "Nhật ký điều phối kỹ thuật viên" — technician dispatch history table. */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared'
import { formatDateTime, formatVND } from '@/lib/format'
import { hexOf, labelOf } from '@/domains/repair/status'
import type { DispatchLogEntry } from '@/domains/repair/types'

export const DISPATCH_LOG_HEADERS = [
  'STT',
  'Kỹ thuật',
  'Ngày tạo',
  'Người tạo',
  'Tiền công',
  'Tình trạng',
  'Ngày hủy',
  'Người hủy',
] as const

export function DispatchLogTable({
  entries,
}: {
  entries: DispatchLogEntry[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Nhật ký điều phối kỹ thuật viên
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {DISPATCH_LOG_HEADERS.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{entry.kyThuat}</TableCell>
                  <TableCell>{formatDateTime(entry.ngayTao)}</TableCell>
                  <TableCell>{entry.nguoiTao}</TableCell>
                  <TableCell>{formatVND(entry.tienCong)}</TableCell>
                  <TableCell>
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: hexOf(entry.tinhTrang),
                        backgroundColor: `${hexOf(entry.tinhTrang)}1a`,
                      }}
                    >
                      {labelOf(entry.tinhTrang)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {entry.ngayHuy ? formatDateTime(entry.ngayHuy) : '—'}
                  </TableCell>
                  <TableCell>{entry.nguoiHuy ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
