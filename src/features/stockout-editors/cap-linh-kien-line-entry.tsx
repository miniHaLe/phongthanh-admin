/**
 * "Chi tiết" line-entry panel for the Cấp Linh Kiện create editor — Phiếu sửa
 * chữa* autocomplete (reveals a Khách hàng/Phone/Ngày nhận/NSX/Model/Serial
 * info panel), Mục đích* select, Hàng hóa* autocomplete with Giá bán/Giá Sỉ/
 * Giá Mua price radios + Số lượng, and "Thêm hàng" which appends a row to the
 * line grid via `onAdd`.
 */
import { useCallback, useState } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ServerAutocomplete,
  notify,
  type AutocompleteOption,
} from '@/components/shared'
import { filterLookupOptions, useLookup } from '@/hooks/use-lookup'
import { formatVND } from '@/lib/format'
import {
  searchRepairTickets,
  type RepairTicketOption,
} from './cap-linh-kien-repair-lookup'
import type { CapLinhKienLine } from './stockout-editor-types'
import { CAP_LINH_KIEN_MUC_DICH_OPTIONS } from '@/domains/warehouse/types'

type PriceKind = 'ban' | 'si' | 'mua'

interface CapLinhKienLineEntryProps {
  onAdd: (line: CapLinhKienLine) => void
}

export function CapLinhKienLineEntry({ onAdd }: CapLinhKienLineEntryProps) {
  const { rows: hangHoaRows, byId: hangHoaById } = useLookup('hang-hoa')
  const { rows: nhaKhoRows } = useLookup('nha-kho')
  const { rows: nganChuaRows } = useLookup('ngan-chua')
  const [ticket, setTicket] = useState<RepairTicketOption | null>(null)
  const [mucDich, setMucDich] = useState('')
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [priceKind, setPriceKind] = useState<PriceKind>('ban')
  const [theoSerial, setTheoSerial] = useState(false)
  const [soLuong, setSoLuong] = useState('1')

  const searchHangHoa = useCallback(
    (query: string) =>
      filterLookupOptions(
        hangHoaRows,
        query,
        (row) => `${row.maHH} — ${row.tenHH}`,
        (row) => `${row.maHH} ${row.tenHH}`,
      ),
    [hangHoaRows],
  )
  const selectedHang = hangHoa?.id ? hangHoaById.get(hangHoa.id) : undefined
  const priceValue = selectedHang
    ? priceKind === 'mua'
      ? (selectedHang.giaNhap ?? 0)
      : priceKind === 'si'
        ? Math.round((selectedHang.giaBan ?? 0) * 0.9)
        : (selectedHang.giaBan ?? 0)
    : 0
  const tonKho = selectedHang?.tonKho ?? 0

  function reset() {
    setHangHoa(null)
    setPriceKind('ban')
    setTheoSerial(false)
    setSoLuong('1')
  }

  function handleAdd() {
    if (!ticket) {
      notify.error('Vui lòng chọn phiếu sửa chữa!')
      return
    }
    if (!hangHoa || !selectedHang) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    if (!mucDich) {
      notify.error('Vui lòng chọn mục đích!')
      return
    }
    const qty = Number(soLuong) || 0
    const kho = nhaKhoRows[0]
    const nganChua = nganChuaRows.find((row) => row.nhaKhoId === kho?.id)
    onAdd({
      serial: theoSerial ? ticket.serial : '',
      soPhieuSC: ticket.soPhieu,
      maHang: selectedHang.maHH,
      tenHang: selectedHang.tenHH,
      nhaSanXuat: ticket.nhaSanXuat,
      model: ticket.model,
      khoId: kho?.id ?? '',
      khoTen: kho?.tenNhaKho ?? '',
      nganChuaId: nganChua?.id ?? '',
      nganChua: nganChua?.tenNgan ?? '',
      mucDich,
      gia: priceValue,
      soLuong: qty,
      thanhTien: qty * priceValue,
    })
    reset()
    setMucDich('')
  }

  return (
    <section aria-labelledby="section-clk-chitiet" className="mt-6">
      <h2 id="section-clk-chitiet" className="mb-4 text-base font-semibold">
        Chi tiết
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
          <Label className="text-sm">
            Phiếu sửa chữa <span className="text-destructive">*</span>
          </Label>
          <ServerAutocomplete
            value={ticket}
            onChange={(opt) => setTicket(opt as RepairTicketOption | null)}
            fetchOptions={searchRepairTickets}
            placeholder="Nhập vào Số Phiếu SC/ Số Phiếu Hãng/ Tên Khách Hàng/ Số Serial"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">
            Mục đích <span className="text-destructive">*</span>
          </Label>
          <Select value={mucDich} onValueChange={setMucDich}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn mục đích" />
            </SelectTrigger>
            <SelectContent>
              {CAP_LINH_KIEN_MUC_DICH_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {ticket && (
          <div className="rounded-md border bg-muted/40 p-3 text-xs sm:col-span-2 lg:col-span-4">
            <p>
              <span className="font-medium">Khách hàng:</span>{' '}
              {ticket.khachHang} <span className="font-medium">— Phone:</span>{' '}
              {ticket.dienThoai}
            </p>
            <p>
              <span className="font-medium">Ngày nhận:</span> {ticket.ngayNhan}{' '}
              <span className="font-medium">— NSX:</span> {ticket.nhaSanXuat}{' '}
              <span className="font-medium">— Model:</span> {ticket.model}{' '}
              <span className="font-medium">— Serial:</span>{' '}
              {ticket.serial || '—'}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
          <Label className="text-sm">
            Hàng hóa <span className="text-destructive">*</span>
          </Label>
          <ServerAutocomplete
            value={hangHoa}
            onChange={setHangHoa}
            fetchOptions={searchHangHoa}
            placeholder="Nhập vào mã hàng"
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <Label className="text-sm">Giá</Label>
          <div className="flex items-center gap-4">
            <RadioGroup
              value={priceKind}
              onValueChange={(v) => setPriceKind(v as PriceKind)}
              className="flex flex-row gap-3"
            >
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="ban" /> Giá bán
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="si" /> Giá Sỉ
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="mua" /> Giá Mua
              </label>
            </RadioGroup>
            <span className="whitespace-nowrap text-sm tabular-nums">
              Giá: {formatVND(priceValue)}
            </span>
          </div>
        </div>

        <label className="flex items-center gap-1.5 pb-1.5 text-sm">
          <input
            type="checkbox"
            checked={theoSerial}
            onChange={(e) => setTheoSerial(e.target.checked)}
            className="size-4"
          />
          Theo Serial
        </label>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clk-line-sl" className="text-sm">
            Số lượng <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="clk-line-sl"
              type="number"
              min={1}
              className="h-9"
              value={soLuong}
              onChange={(e) => setSoLuong(e.target.value)}
            />
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              &lt;= {tonKho}
            </span>
          </div>
        </div>

        <div className="flex items-end">
          <Button type="button" onClick={handleAdd} className="h-9">
            Thêm hàng
          </Button>
        </div>
      </div>
    </section>
  )
}
