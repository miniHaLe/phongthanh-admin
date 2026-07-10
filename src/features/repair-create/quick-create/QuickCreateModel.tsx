/**
 * "Thêm model" quick-create modal body — pushes into the live MODELS lookup
 * array via createModel and selects the record. Model is an independent
 * autocomplete (no NSX/Sản phẩm cascade), so no parent id is collected here.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { createModel } from '@/domains/repair/reference-data'

interface QuickCreateModelProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateModel({ close, select }: QuickCreateModelProps) {
  const [ten, setTen] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên model!')
      return
    }
    const created = createModel(ten.trim(), '')
    select({ id: created.id, label: created.ten })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-model-ten">Tên model</Label>
        <Input
          id="qc-model-ten"
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
