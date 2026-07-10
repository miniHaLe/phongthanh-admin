/**
 * "Chi tiết" line-entry panel for the Nhập Kho create editor — NSX / Model /
 * Hàng hóa autocompletes (Model + Hàng hóa carry a quick-create), Số lượng,
 * Giá mua mới + Cập nhật giá checkbox, and "Thêm hàng" which appends a row to
 * the line grid via `onAdd`.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { HANG_HOA_ROWS, NGAN_CHUA_ROWS } from '@/mock/masterdata'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import type { ReceivingLine } from '@/domains/warehouse/types'

let modelSeq = 0
let hangHoaSeq = 0

async function searchNsx(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q ? MANUFACTURERS.filter((m) => m.ten.toLowerCase().includes(q)) : MANUFACTURERS
  return list.map((m) => ({ id: m.id, label: m.ten }))
}

async function searchModel(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q ? MODELS.filter((m) => m.ten.toLowerCase().includes(q)) : MODELS
  return list.map((m) => ({ id: m.id, label: m.ten }))
}

async function searchHangHoa(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q
    ? HANG_HOA_ROWS.filter(
        (h) => h.tenHH.toLowerCase().includes(q) || h.maHH.toLowerCase().includes(q),
      )
    : HANG_HOA_ROWS
  return list.slice(0, 20).map((h) => ({ id: h.id, label: `${h.maHH} — ${h.tenHH}` }))
}

function QuickCreateModelForm({
  close,
  select,
}: {
  close: () => void
  select: (opt: AutocompleteOption) => void
}) {
  const [ten, setTen] = useState('')
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-model-ten">Tên model</Label>
        <Input id="qc-model-ten" value={ten} onChange={(e) => setTen(e.target.value)} autoFocus />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!ten.trim()) {
              notify.error('Vui lòng nhập tên model!')
              return
            }
            modelSeq += 1
            select({ id: `model-new-${modelSeq}`, label: ten.trim() })
          }}
        >
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}

function QuickCreateHangHoaForm({
  close,
  select,
}: {
  close: () => void
  select: (opt: AutocompleteOption) => void
}) {
  const [ma, setMa] = useState('')
  const [ten, setTen] = useState('')
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-hh-ma">Mã hàng</Label>
        <Input id="qc-hh-ma" value={ma} onChange={(e) => setMa(e.target.value)} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-hh-ten">Tên hàng</Label>
        <Input id="qc-hh-ten" value={ten} onChange={(e) => setTen(e.target.value)} />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!ma.trim() || !ten.trim()) {
              notify.error('Vui lòng nhập mã và tên hàng hóa!')
              return
            }
            hangHoaSeq += 1
            select({ id: `hh-new-${hangHoaSeq}`, label: `${ma.trim()} — ${ten.trim()}` })
          }}
        >
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}

interface NhapKhoLineEntryProps {
  onAdd: (line: ReceivingLine) => void
}

export function NhapKhoLineEntry({ onAdd }: NhapKhoLineEntryProps) {
  const [nsx, setNsx] = useState<AutocompleteOption | null>(null)
  const [model, setModel] = useState<AutocompleteOption | null>(null)
  const [hangHoa, setHangHoa] = useState<AutocompleteOption | null>(null)
  const [soLuong, setSoLuong] = useState('1')
  const [giaMua, setGiaMua] = useState('')
  const [capNhatGia, setCapNhatGia] = useState(false)
  const [serial, setSerial] = useState('')

  function reset() {
    setHangHoa(null)
    setSoLuong('1')
    setGiaMua('')
    setCapNhatGia(false)
    setSerial('')
  }

  function handleAdd() {
    if (!hangHoa) {
      notify.error('Vui lòng chọn hàng hóa!')
      return
    }
    const qty = Number(soLuong) || 0
    const donGia = Number(giaMua) || 0
    const [maPart, tenPart] = hangHoa.label.split(' — ')
    onAdd({
      ma: maPart ?? hangHoa.label,
      ten: tenPart ?? hangHoa.label,
      nganChua: NGAN_CHUA_ROWS[0]?.tenNgan ?? '',
      soLuong: qty,
      donGia,
      thanhTien: qty * donGia,
      capNhatGia,
      serial: serial.trim(),
    })
    reset()
  }

  return (
    <section aria-labelledby="section-nhap-kho-chitiet" className="mt-6">
      <h2 id="section-nhap-kho-chitiet" className="mb-4 text-base font-semibold">
        Chi tiết
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Nhà sản xuất</Label>
          <ServerAutocomplete
            value={nsx}
            onChange={setNsx}
            fetchOptions={searchNsx}
            placeholder="Tìm nhà sản xuất…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Model</Label>
          <ServerAutocomplete
            value={model}
            onChange={setModel}
            fetchOptions={searchModel}
            placeholder="Tìm model…"
            quickCreate={{
              title: 'Thêm mới model',
              renderForm: (close, select) => (
                <QuickCreateModelForm close={close} select={select} />
              ),
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">
            Hàng hóa <span className="text-destructive">*</span>
          </Label>
          <ServerAutocomplete
            value={hangHoa}
            onChange={setHangHoa}
            fetchOptions={searchHangHoa}
            placeholder="Nhập vào mã hàng"
            quickCreate={{
              title: 'Thêm mới hàng hóa',
              renderForm: (close, select) => (
                <QuickCreateHangHoaForm close={close} select={select} />
              ),
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nk-line-sl" className="text-sm">
            Số lượng
          </Label>
          <Input
            id="nk-line-sl"
            type="number"
            min={1}
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nk-line-gia" className="text-sm">
            Giá mua mới
          </Label>
          <Input
            id="nk-line-gia"
            type="number"
            min={0}
            value={giaMua}
            onChange={(e) => setGiaMua(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2 pb-1.5">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm">
            <Checkbox checked={capNhatGia} onCheckedChange={(c) => setCapNhatGia(!!c)} />
            Cập nhật giá
          </label>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
          <Label htmlFor="nk-line-serial" className="text-sm">
            Serial (mỗi dòng một số, nếu có)
          </Label>
          <Input
            id="nk-line-serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
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
