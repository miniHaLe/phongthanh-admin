/**
 * "Chi tiết" line-entry panel for the Bán Hàng create/edit editor — Hàng hóa
 * autocomplete + Theo Serial checkbox + price radios (Giá Lẻ/Giá Sỉ) +
 * Cập nhật giá checkbox + editable PriceNew + Số lượng, "Thêm hàng" appends a
 * row to the line grid via `onAdd`.
 */
import { useCallback, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ServerAutocomplete,
  notify,
  type AutocompleteOption,
} from '@/components/shared'
import { filterLookupOptions, useLookup } from '@/hooks/use-lookup'
import type { BanHangLine } from './stockout-editor-types'

type PriceKind = 'le' | 'si'

interface BanHangLineEntryProps {
  onAdd: (line: BanHangLine) => void
}

export function BanHangLineEntry({ onAdd }: BanHangLineEntryProps) {
  const { rows: hangHoaRows, byId: hangHoaById } = useLookup('hang-hoa')
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [theoSerial, setTheoSerial] = useState(false)
  const [priceKind, setPriceKind] = useState<PriceKind>('le')
  const [capNhatGia, setCapNhatGia] = useState(false)
  const [priceNew, setPriceNew] = useState('')
  const [soLuong, setSoLuong] = useState('1')
  const [serial, setSerial] = useState('')

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
  const basePrice = selectedHang
    ? priceKind === 'si'
      ? Math.round((selectedHang.giaBan ?? 0) * 0.9)
      : (selectedHang.giaBan ?? 0)
    : 0
  const effectivePrice =
    capNhatGia && priceNew ? Number(priceNew) || 0 : basePrice
  const tonKho = selectedHang?.tonKho ?? 0

  function reset() {
    setHangHoa(null)
    setTheoSerial(false)
    setPriceKind('le')
    setCapNhatGia(false)
    setPriceNew('')
    setSoLuong('1')
    setSerial('')
  }

  function handleAdd() {
    if (!hangHoa || !selectedHang) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    const qty = Number(soLuong) || 0
    onAdd({
      serial: theoSerial ? serial.trim() : '',
      ten: selectedHang.tenHH,
      model: '',
      capNhatGia,
      gia: effectivePrice,
      soLuong: qty,
      thanhTien: qty * effectivePrice,
    })
    reset()
  }

  return (
    <section aria-labelledby="section-bh-chitiet" className="mt-6">
      <h2 id="section-bh-chitiet" className="mb-4 text-base font-semibold">
        Chi tiết
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
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

        <label className="flex items-end gap-1.5 pb-1.5 text-sm">
          <Checkbox
            checked={theoSerial}
            onCheckedChange={(c) => setTheoSerial(!!c)}
          />
          Theo Serial
        </label>

        {theoSerial && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bh-line-serial" className="text-sm">
              Serial
            </Label>
            <Input
              id="bh-line-serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <Label className="text-sm">Giá</Label>
          <RadioGroup
            value={priceKind}
            onValueChange={(v) => setPriceKind(v as PriceKind)}
            className="flex flex-row gap-3"
          >
            <label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="le" /> Giá Lẻ
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="si" /> Giá Sỉ
            </label>
          </RadioGroup>
        </div>

        <label className="flex items-end gap-1.5 pb-1.5 text-sm">
          <Checkbox
            checked={capNhatGia}
            onCheckedChange={(c) => setCapNhatGia(!!c)}
          />
          Cập nhật giá
        </label>

        {capNhatGia && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bh-line-gia-moi" className="text-sm">
              Giá mới
            </Label>
            <Input
              id="bh-line-gia-moi"
              type="number"
              min={0}
              value={priceNew}
              onChange={(e) => setPriceNew(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bh-line-sl" className="text-sm">
            Số lượng
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="bh-line-sl"
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
