/**
 * "Thêm khách hàng" quick-create modal body. There is no khách-hàng mutator
 * on the repair reference-data layer, so this fabricates a selectable option
 * via a module-level counter (never Date.now()/Math.random()). The `select`
 * callback carries the full contact detail (not just {id,label}) so the
 * caller can render the post-pick info panel without a second lookup.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'

export interface CreatedKhachHang extends AutocompleteOption {
  ten: string
  sdt: string
  diaChi: string
}

interface QuickCreateKhachHangProps {
  close: () => void
  select: (opt: CreatedKhachHang) => void
}

let khachHangSeq = 0

export function QuickCreateKhachHang({
  close,
  select,
}: QuickCreateKhachHangProps) {
  const [ten, setTen] = useState('')
  const [sdt, setSdt] = useState('')
  const [diaChi, setDiaChi] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên khách hàng!')
      return
    }
    if (!sdt.trim()) {
      notify.error('Vui lòng nhập số điện thoại!')
      return
    }
    khachHangSeq += 1
    select({
      id: `kh-new-${khachHangSeq}`,
      label: ten.trim(),
      ten: ten.trim(),
      sdt: sdt.trim(),
      diaChi: diaChi.trim(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-kh-ten">Họ tên</Label>
        <Input
          id="qc-kh-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Họ tên khách hàng"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-kh-sdt">Điện thoại</Label>
        <Input
          id="qc-kh-sdt"
          value={sdt}
          onChange={(e) => setSdt(e.target.value)}
          placeholder="Số điện thoại"
          inputMode="tel"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-kh-diachi">Địa chỉ</Label>
        <Input
          id="qc-kh-diachi"
          value={diaChi}
          onChange={(e) => setDiaChi(e.target.value)}
          placeholder="Địa chỉ"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close}>
          Hủy
        </Button>
        <Button type="button" onClick={handleSave}>
          Lưu
        </Button>
      </DialogFooter>
    </div>
  )
}
