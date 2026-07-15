/**
 * Line-entry panel for the same-branch Chuyển Kho editor — Hàng hóa
 * autocomplete + Ngăn chứa select (per-line, distinguishing this editor from
 * the cross-branch one), Số lượng, "Thêm hàng" appends a row to the grid.
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
import {
  ServerAutocomplete,
  notify,
  type AutocompleteOption,
} from '@/components/shared'
import { filterLookupOptions, useLookup } from '@/hooks/use-lookup'
import type { NganChua } from '@/types/masterdata-types'
import type { ChuyenKhoSameLine } from './stockout-editor-types'

interface ChuyenKhoSameLineEntryProps {
  nganChuaOptions: NganChua[]
  onAdd: (line: ChuyenKhoSameLine) => void
}

export function ChuyenKhoSameLineEntry({
  nganChuaOptions,
  onAdd,
}: ChuyenKhoSameLineEntryProps) {
  const { rows: hangHoaRows, byId: hangHoaById } = useLookup('hang-hoa')
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [nganChuaId, setNganChuaId] = useState('')
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

  function reset() {
    setHangHoa(null)
    setSoLuong('1')
  }

  function handleAdd() {
    const selected = hangHoa?.id ? hangHoaById.get(hangHoa.id) : undefined
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
