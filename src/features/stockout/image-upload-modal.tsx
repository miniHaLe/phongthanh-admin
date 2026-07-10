/**
 * "Thêm hình" modal — minimal client-side file input + preview (no real
 * upload backend — all data in this app is mock). Confirms with a notify
 * toast; doesn't persist beyond the component's lifetime since SellingOrder
 * carries no images field.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { notify } from '@/components/shared'

interface ImageUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export function ImageUploadModal({
  open,
  onOpenChange,
  title = 'Thêm hình',
}: ImageUploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleSave() {
    notify.success('Đã thêm hình')
    onOpenChange(false)
    setPreviewUrl(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Xem trước"
              className="h-40 w-full rounded-md border object-contain"
            />
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
