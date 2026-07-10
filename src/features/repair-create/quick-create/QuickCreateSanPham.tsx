/**
 * "Thêm sản phẩm" quick-create modal body — pushes into the live PRODUCTS
 * lookup array via createSanPham and selects the created record.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { createSanPham } from '@/domains/repair/reference-data'

interface QuickCreateSanPhamProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateSanPham({ close, select }: QuickCreateSanPhamProps) {
  const [ten, setTen] = useState('')

  function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên sản phẩm!')
      return
    }
    const created = createSanPham(ten.trim(), '')
    select({ id: created.id, label: created.ten })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-san-pham-ten">Tên sản phẩm</Label>
        <Input
          id="qc-san-pham-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên sản phẩm"
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
