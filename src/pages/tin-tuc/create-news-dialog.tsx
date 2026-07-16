import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateNewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string, content: string) => Promise<void>
  isPending?: boolean
}

export function CreateNewsDialog({
  open,
  onOpenChange,
  onCreate,
  isPending = false,
}: CreateNewsDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedTitle = title.trim()
    const normalizedContent = content.trim()
    if (!normalizedTitle || !normalizedContent) return

    try {
      await onCreate(normalizedTitle, normalizedContent)
      setTitle('')
      setContent('')
      onOpenChange(false)
    } catch {
      // The page mutation owns user-facing error feedback.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Thêm tin nhắn</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="news-title">Tiêu đề</Label>
            <Input
              id="news-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="news-content">Nội dung</Label>
            <Textarea
              id="news-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
