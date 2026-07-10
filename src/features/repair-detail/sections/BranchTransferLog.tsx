/** "Nhật ký chuyển chi nhánh" — branch transfer history table. */
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
import { formatDateTime } from '@/lib/format'
import type { BranchTransferEntry } from '@/domains/repair/types'

const HEADERS = [
  'STT',
  'Từ chi nhánh',
  'Đến chi nhánh',
  'Ngày chuyển',
  'Người chuyển',
  'Ghi chú',
] as const

export function BranchTransferLog({
  entries,
}: {
  entries: BranchTransferEntry[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nhật ký chuyển chi nhánh</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {HEADERS.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{entry.tuChiNhanh}</TableCell>
                  <TableCell>{entry.denChiNhanh}</TableCell>
                  <TableCell>{formatDateTime(entry.ngayChuyen)}</TableCell>
                  <TableCell>{entry.nguoiChuyen}</TableCell>
                  <TableCell>{entry.ghiChu ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
