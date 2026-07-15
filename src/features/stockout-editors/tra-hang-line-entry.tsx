/**
 * Line-entry panel for the Trả Hàng create editor — simplified single-stage
 * pick (per spec: "the two-stage source-pick flow can be simplified to a
 * single line grid + the type select — keep it working, not fully mirrored").
 * Hàng hóa autocomplete + Kho/Ngăn chứa selects + Giá/Số lượng/Số lượng trả,
 * "Thêm" appends a row to the line grid via `onAdd`.
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
import type { TraHangLine } from './stockout-editor-types'

let lineSeq = 0

interface TraHangLineEntryProps {
  onAdd: (line: TraHangLine) => void
}

export function TraHangLineEntry({ onAdd }: TraHangLineEntryProps) {
  const { rows: hangHoaRows, byId: hangHoaById } = useLookup('hang-hoa')
  const { rows: nhaKhoRows, byId: nhaKhoById } = useLookup('nha-kho')
  const { rows: nganChuaRows, byId: nganChuaById } = useLookup('ngan-chua')
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [khoId, setKhoId] = useState('')
  const [nganChuaId, setNganChuaId] = useState('')
  const [gia, setGia] = useState('')
  const [soLuong, setSoLuong] = useState('1')
  const [soLuongTra, setSoLuongTra] = useState('1')
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

  const nganChuaOptions = khoId
    ? nganChuaRows.filter((n) => n.nhaKhoId === khoId)
    : nganChuaRows

  function reset() {
    setHangHoa(null)
    setGia('')
    setSoLuong('1')
    setSoLuongTra('1')
  }

  function handleAdd() {
    const selected = hangHoa?.id ? hangHoaById.get(hangHoa.id) : undefined
    if (!selected) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    lineSeq += 1
    const kho = nhaKhoById.get(khoId)
    const ngan = nganChuaById.get(nganChuaId)
    const giaValue = Number(gia) || selected.giaBan || 0
    const qtyTra = Number(soLuongTra) || 0
    onAdd({
      maPhieu: `MP-${lineSeq}`,
      soPhieuSC: '',
      serial: '',
      tenHang: selected.tenHH,
      kho: kho?.tenNhaKho ?? '',
      nganChua: ngan?.tenNgan ?? '',
      gia: giaValue,
      soLuong: Number(soLuong) || 0,
      soLuongTra: qtyTra,
      thanhTien: qtyTra * giaValue,
    })
    reset()
  }

  return (
    <section aria-labelledby="section-th-chitiet" className="mt-6">
      <h2 id="section-th-chitiet" className="mb-4 text-base font-semibold">
        Chi tiết
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-sm">Sản phẩm</Label>
          <ServerAutocomplete
            value={hangHoa}
            onChange={setHangHoa}
            fetchOptions={searchHangHoa}
            placeholder="Nhập vào mã hàng"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Kho</Label>
          <Select
            value={khoId}
            onValueChange={(v) => {
              setKhoId(v)
              setNganChuaId('')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn kho" />
            </SelectTrigger>
            <SelectContent>
              {nhaKhoRows.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.tenNhaKho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Ngăn chứa</Label>
          <Select
            value={nganChuaId}
            onValueChange={setNganChuaId}
            disabled={!khoId}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={khoId ? 'Chọn ngăn chứa' : 'Chọn kho trước'}
              />
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
          <Label htmlFor="th-line-gia" className="text-sm">
            Giá
          </Label>
          <Input
            id="th-line-gia"
            type="number"
            min={0}
            value={gia}
            onChange={(e) => setGia(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="th-line-sl" className="text-sm">
            Số lượng
          </Label>
          <Input
            id="th-line-sl"
            type="number"
            min={1}
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="th-line-sltra" className="text-sm">
            Số lượng trả
          </Label>
          <Input
            id="th-line-sltra"
            type="number"
            min={1}
            value={soLuongTra}
            onChange={(e) => setSoLuongTra(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button type="button" onClick={handleAdd} className="h-9">
            Thêm
          </Button>
        </div>
      </div>
    </section>
  )
}
