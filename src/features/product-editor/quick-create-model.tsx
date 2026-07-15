/** "Thêm mới model" quick-create modal linked to the selected manufacturer. */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { quickCreateModel } from './quick-create-lookups'
import { invalidateCrudQueries } from '@/hooks/use-crud'

interface QuickCreateModelProps {
  nhaSanXuatId: string
  sanPhamId: string
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateModel({
  nhaSanXuatId,
  sanPhamId,
  close,
  select,
}: QuickCreateModelProps) {
  const queryClient = useQueryClient()
  const [ten, setTen] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên model!')
      return
    }
    if (!nhaSanXuatId) {
      notify.error('Vui lòng chọn nhà sản xuất trước!')
      return
    }
    if (!sanPhamId) {
      notify.error('Chưa tải được danh sách sản phẩm!')
      return
    }

    setIsSaving(true)
    try {
      const created = await quickCreateModel(
        ten.trim(),
        nhaSanXuatId,
        sanPhamId,
      )
      await invalidateCrudQueries(queryClient, 'model')
      select({ id: created.id, label: created.tenModel })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm model',
      )
    } finally {
      setIsSaving(false)
    }
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
