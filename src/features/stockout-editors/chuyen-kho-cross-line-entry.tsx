/**
 * Line-entry panel for the cross-branch Chuyển Kho editor — Hàng hóa
 * autocomplete + Số lượng chuyển, "Thêm hàng" appends a row to the line grid.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { HANG_HOA_ROWS } from '@/mock/masterdata'
import type { ChuyenKhoCrossLine } from './stockout-editor-types'

async function searchHangHoa(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q
    ? HANG_HOA_ROWS.filter(
        (h) => h.tenHH.toLowerCase().includes(q) || h.maHH.toLowerCase().includes(q),
      )
    : HANG_HOA_ROWS
  return list.slice(0, 20).map((h) => ({ id: h.id, label: `${h.maHH} — ${h.tenHH}` }))
}

interface ChuyenKhoCrossLineEntryProps {
  onAdd: (line: ChuyenKhoCrossLine) => void
}

export function ChuyenKhoCrossLineEntry({ onAdd }: ChuyenKhoCrossLineEntryProps) {
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [soLuongChuyen, setSoLuongChuyen] = useState('1')

  function reset() {
    setHangHoa(null)
    setSoLuongChuyen('1')
  }

  function handleAdd() {
    const selected = HANG_HOA_ROWS.find((h) => h.id === hangHoa?.id)
    if (!selected) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    const qty = Number(soLuongChuyen) || 0
    const gia = selected.giaBan ?? 0
    onAdd({
      serial: '',
      ma: selected.maHH,
      ten: selected.tenHH,
      soLuong: selected.tonKho,
      soLuongChuyen: qty,
      gia,
      thanhTien: qty * gia,
    })
    reset()
  }

  return (
    <section aria-labelledby="section-ckk-chitiet" className="mt-6">
      <h2 id="section-ckk-chitiet" className="mb-4 text-base font-semibold">
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
          <Label htmlFor="ckk-line-slc" className="text-sm">
            Số lượng chuyển
          </Label>
          <Input
            id="ckk-line-slc"
            type="number"
            min={1}
            value={soLuongChuyen}
            onChange={(e) => setSoLuongChuyen(e.target.value)}
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
