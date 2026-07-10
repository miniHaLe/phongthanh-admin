/** "Cấp linh kiện kỹ thuật" modal — issue parts (name + qty rows) to a ticket. */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notify } from '@/components/shared'
import { issuePartsToTech } from '@/domains/repair/mock-mutations'
import type { RepairPart } from '@/domains/repair/types'

interface IssuePartsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

interface DraftLine {
  ten: string
  soLuong: number
}

export function IssuePartsModal({ open, onOpenChange, id }: IssuePartsModalProps) {
  const qc = useQueryClient()
  const [lines, setLines] = useState<DraftLine[]>([{ ten: '', soLuong: 1 }])

  const mutation = useMutation({
    mutationFn: async () => {
      const parts: RepairPart[] = lines
        .filter((l) => l.ten.trim())
        .map((l) => ({
          hangHoaId: `hh-${l.ten}`,
          ten: l.ten,
          soLuong: l.soLuong,
          donGia: 0,
          thanhTien: 0,
        }))
      issuePartsToTech(id, parts)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã cấp linh kiện cho kỹ thuật')
      onOpenChange(false)
      setLines([{ ten: '', soLuong: 1 }])
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấp linh kiện kỹ thuật</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Linh kiện"
                aria-label="Linh kiện"
                value={line.ten}
                onChange={(e) =>
                  setLines((ls) =>
                    ls.map((l, j) => (j === i ? { ...l, ten: e.target.value } : l)),
                  )
                }
              />
              <Input
                type="number"
                className="w-20"
                aria-label="Số lượng"
                value={line.soLuong}
                onChange={(e) =>
                  setLines((ls) =>
                    ls.map((l, j) =>
                      j === i ? { ...l, soLuong: Number(e.target.value) } : l,
                    ),
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa dòng"
                onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLines((ls) => [...ls, { ten: '', soLuong: 1 }])}
          >
            <Plus className="mr-1.5 size-4" />
            Thêm dòng
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
