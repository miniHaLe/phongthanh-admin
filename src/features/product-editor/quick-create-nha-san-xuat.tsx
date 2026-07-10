/**
 * "Thêm mới nhà sản xuất" quick-create modal body for the product editor —
 * pushes into the live NHA_SAN_XUAT_ROWS catalog masterdata array.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { quickCreateNhaSanXuat } from './quick-create-lookups'

interface QuickCreateNhaSanXuatProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateNhaSanXuat({
  close,
  select,
}: QuickCreateNhaSanXuatProps) {
  const [ten, setTen] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên nhà sản xuất!')
      return
    }
    const created = quickCreateNhaSanXuat(ten.trim())
    select({ id: created.id, label: created.tenNSX })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-nsx-ten">Tên nhà sản xuất</Label>
        <Input
          id="qc-product-nsx-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên nhà sản xuất"
          autoFocus
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
