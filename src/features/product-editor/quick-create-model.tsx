/**
 * "Thêm mới model" quick-create modal body for the product editor — pushes
 * into the live MODEL_ROWS catalog masterdata array (linked to the currently
 * selected Nhà sản xuất, if any).
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { quickCreateModel } from './quick-create-lookups'

interface QuickCreateModelProps {
  nhaSanXuatId: string
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateModel({
  nhaSanXuatId,
  close,
  select,
}: QuickCreateModelProps) {
  const [ten, setTen] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên model!')
      return
    }
    const created = quickCreateModel(ten.trim(), nhaSanXuatId)
    select({ id: created.id, label: created.tenModel })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-model-ten">Tên model</Label>
        <Input
          id="qc-product-model-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên model"
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
