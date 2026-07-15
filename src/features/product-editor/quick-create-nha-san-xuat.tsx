/** "Thêm mới nhà sản xuất" quick-create modal for the product editor. */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { quickCreateNhaSanXuat } from './quick-create-lookups'
import { invalidateCrudQueries } from '@/hooks/use-crud'

interface QuickCreateNhaSanXuatProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateNhaSanXuat({
  close,
  select,
}: QuickCreateNhaSanXuatProps) {
  const queryClient = useQueryClient()
  const [ten, setTen] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên nhà sản xuất!')
      return
    }
    setIsSaving(true)
    try {
      const created = await quickCreateNhaSanXuat(ten.trim())
      await invalidateCrudQueries(queryClient, 'nha-san-xuat')
      select({ id: created.id, label: created.tenNSX })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm nhà sản xuất',
      )
    } finally {
      setIsSaving(false)
    }
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
        <Button
          type="button"
          variant="ghost"
          onClick={close}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          {isSaving ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </DialogFooter>
    </div>
  )
}
