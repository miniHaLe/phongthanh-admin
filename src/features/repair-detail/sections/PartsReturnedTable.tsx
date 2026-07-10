/** "Danh sách trả linh kiện" — parts returned by the technician. */
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
import type { PartsReturnEntry } from '@/domains/repair/types'

const HEADERS = [
  'STT',
  'Linh kiện',
  'Số lượng',
  'Ngày trả',
  'Người trả',
] as const

export function PartsReturnedTable({
  entries,
}: {
  entries: PartsReturnEntry[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Danh sách trả linh kiện</CardTitle>
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
                <TableRow key={entry.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{entry.ten}</TableCell>
                  <TableCell>{entry.soLuong}</TableCell>
                  <TableCell>{formatDateTime(entry.ngayTra)}</TableCell>
                  <TableCell>{entry.nguoiTra}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
