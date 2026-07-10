/**
 * Source-ticket import panel for the invoice composer: Loại phiếu thu select
 * + Số phiếu search → staging grid with a [+] "add to invoice" action per row.
 */
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatVND } from '@/lib/format'
import {
  LOAI_PHIEU_THU_OPTIONS,
  searchSourceTickets,
  type LoaiPhieuThu,
  type StagingLine,
} from './source-ticket-search'

interface SourceTicketImportPanelProps {
  onAddLine: (line: StagingLine) => void
}

export function SourceTicketImportPanel({ onAddLine }: SourceTicketImportPanelProps) {
  const [loaiPhieuThu, setLoaiPhieuThu] = useState<LoaiPhieuThu>('Bán hàng')
  const [soPhieu, setSoPhieu] = useState('')
  const [results, setResults] = useState<StagingLine[]>([])

  function handleSearch() {
    setResults(searchSourceTickets(loaiPhieuThu, soPhieu))
  }

  return (
    <section aria-labelledby="section-invoice-source-import" className="mt-6">
      <h2 id="section-invoice-source-import" className="mb-3 text-base font-semibold">
        Nhập từ phiếu nguồn
      </h2>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ts-loai" className="text-sm">
            Loại phiếu thu
          </Label>
          <Select value={loaiPhieuThu} onValueChange={(v) => setLoaiPhieuThu(v as LoaiPhieuThu)}>
            <SelectTrigger id="ts-loai" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOAI_PHIEU_THU_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ts-sophieu" className="text-sm">
            Số phiếu
          </Label>
          <Input
            id="ts-sophieu"
            className="w-56"
            value={soPhieu}
            onChange={(e) => setSoPhieu(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button type="button" variant="outline" onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại phiếu</TableHead>
                <TableHead>Số phiếu</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Mã hàng</TableHead>
                <TableHead>Hàng hóa</TableHead>
                <TableHead>DVT</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Trừ VAT</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.loaiPhieu}</TableCell>
                  <TableCell>{r.soPhieu}</TableCell>
                  <TableCell>{r.model}</TableCell>
                  <TableCell>{r.maHang}</TableCell>
                  <TableCell>{r.hangHoa}</TableCell>
                  <TableCell>{r.donViTinh}</TableCell>
                  <TableCell>{r.soLuong}</TableCell>
                  <TableCell>{formatVND(r.donGia)}</TableCell>
                  <TableCell>{r.truVat}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ms-add-detail text-emerald-600"
                      aria-label="Thêm vào hóa đơn"
                      onClick={() => onAddLine(r)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
