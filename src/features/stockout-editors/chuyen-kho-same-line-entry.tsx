/**
 * Line-entry panel for the same-branch Chuyển Kho editor — Hàng hóa
 * autocomplete + Ngăn chứa select (per-line, distinguishing this editor from
 * the cross-branch one), Số lượng, "Thêm hàng" appends a row to the grid.
 */
import { useState } from 'react'
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
import { ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { HANG_HOA_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import type { ChuyenKhoSameLine } from './stockout-editor-types'

async function searchHangHoa(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q
    ? HANG_HOA_ROWS.filter(
        (h) => h.tenHH.toLowerCase().includes(q) || h.maHH.toLowerCase().includes(q),
      )
    : HANG_HOA_ROWS
  return list.slice(0, 20).map((h) => ({ id: h.id, label: `${h.maHH} — ${h.tenHH}` }))
}

interface ChuyenKhoSameLineEntryProps {
  nganChuaOptions: typeof NGAN_CHUA_ROWS
  onAdd: (line: ChuyenKhoSameLine) => void
}

export function ChuyenKhoSameLineEntry({
  nganChuaOptions,
  onAdd,
}: ChuyenKhoSameLineEntryProps) {
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [nganChuaId, setNganChuaId] = useState('')
  const [soLuong, setSoLuong] = useState('1')

  function reset() {
    setHangHoa(null)
    setSoLuong('1')
  }

  function handleAdd() {
    const selected = HANG_HOA_ROWS.find((h) => h.id === hangHoa?.id)
    if (!selected) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    const ngan = nganChuaOptions.find((n) => n.id === nganChuaId)
    const qty = Number(soLuong) || 0
    const gia = selected.giaBan ?? 0
    onAdd({
      serial: '',
      ma: selected.maHH,
      ten: selected.tenHH,
      nganChua: ngan?.tenNgan ?? '',
      soLuong: qty,
      gia,
      thanhTien: qty * gia,
    })
    reset()
  }

  return (
    <section aria-labelledby="section-ckc-chitiet" className="mt-6">
      <h2 id="section-ckc-chitiet" className="mb-4 text-base font-semibold">
        Chi tiết
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-sm">Hàng hóa</Label>
          <ServerAutocomplete
            value={hangHoa}
            onChange={setHangHoa}
            fetchOptions={searchHangHoa}
            placeholder="Nhập vào mã hàng"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Ngăn chứa</Label>
          <Select value={nganChuaId} onValueChange={setNganChuaId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngăn chứa" />
            </SelectTrigger>
            <SelectContent>
              {nganChuaOptions.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.tenNgan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ckc-line-sl" className="text-sm">
            Số lượng
          </Label>
          <Input
            id="ckc-line-sl"
            type="number"
            min={1}
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
          />
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
