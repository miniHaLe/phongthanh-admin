/**
 * "Nhật ký tình trạng máy" — tabular status history (replaces the old vertical
 * timeline). Status cell is color-coded with the legacy status hex.
 */
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
import type { StatusHistoryEntry } from '@/domains/repair/types'

export const STATUS_LOG_HEADERS = [
  'STT',
  'Tình trạng',
  'Ngày tạo',
  'Người tạo',
  'Giá',
  'Nội dung SC',
  'Ghi chú',
] as const

export function StatusLogTable({
  entries,
}: {
  entries: StatusHistoryEntry[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nhật ký tình trạng máy</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {STATUS_LOG_HEADERS.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: hexOf(entry.status),
                        backgroundColor: `${hexOf(entry.status)}1a`,
                      }}
                    >
                      {labelOf(entry.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(entry.changedAt)}</TableCell>
                  <TableCell>{entry.changedBy}</TableCell>
                  <TableCell>
                    {entry.gia != null ? formatVND(entry.gia) : '—'}
                  </TableCell>
                  <TableCell>{entry.noiDungSC ?? '—'}</TableCell>
                  <TableCell>{entry.note ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
