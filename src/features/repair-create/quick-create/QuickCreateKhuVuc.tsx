/**
 * "Thêm khu vực" quick-create modal body. There is no khu-vực mutator on the
 * repair reference-data layer, so this fabricates a selectable option via a
 * module-level counter (never Date.now()/Math.random() — determinism rule).
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'

interface QuickCreateKhuVucProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

let khuVucSeq = 0

export function QuickCreateKhuVuc({ close, select }: QuickCreateKhuVucProps) {
  const [ten, setTen] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên khu vực!')
      return
    }
    khuVucSeq += 1
    select({ id: `kv-new-${khuVucSeq}`, label: ten.trim() })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-khu-vuc-ten">Tên khu vực</Label>
        <Input
          id="qc-khu-vuc-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên khu vực"
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
