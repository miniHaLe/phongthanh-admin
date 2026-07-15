/**
 * "Thêm nhà sản xuất" quick-create modal body — pushes into the live
 * MANUFACTURERS lookup array via createNhaSanXuat and selects the record.
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import { MODEL_CATALOG_QUERY_KEY } from '@/features/model/model-catalog-data'

interface QuickCreateNhaSanXuatProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateNhaSanXuat({
  close,
  select,
}: QuickCreateNhaSanXuatProps) {
  const [ten, setTen] = useState('')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  async function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên nhà sản xuất!')
      return
    }
    setSaving(true)
    try {
      const created = await nhaSanXuatConfig.mockApi.create({
        tenNSX: ten.trim(),
        active: true,
      })
      await queryClient.invalidateQueries({ queryKey: MODEL_CATALOG_QUERY_KEY })
      select({ id: created.id, label: created.tenNSX })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm nhà sản xuất.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-nsx-ten">Tên nhà sản xuất</Label>
        <Input
          id="qc-nsx-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên nhà sản xuất"
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close} disabled={saving}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </DialogFooter>
    </div>
  )
}
