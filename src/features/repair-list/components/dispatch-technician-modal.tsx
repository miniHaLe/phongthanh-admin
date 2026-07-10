/**
 * "Đổi kỹ thuật" modal — assign/reassign a technician via ServerAutocomplete.
 * Guard: "Vui lòng chọn kỹ thuật!" when empty. The "Điều phối in" variant also
 * triggers the Lệnh Sửa Tại Nhà print after saving.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  ServerAutocomplete,
  notify,
  type AutocompleteOption,
} from '@/components/shared'
import { TECHNICIANS } from '@/domains/repair/reference-data'
import { dispatchTechnician } from '@/domains/repair/mock-mutations'

interface DispatchTechnicianModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids: string[]
  /** "Điều phối in" variant — print after dispatch. */
  printAfter?: boolean
  onPrint?: (ids: string[]) => void
}

async function searchTechnicians(query: string): Promise<AutocompleteOption[]> {
  const q = query.toLowerCase()
  return TECHNICIANS.filter((t) => t.ten.toLowerCase().includes(q)).map((t) => ({
    id: t.id,
    label: t.ten,
  }))
}

export function DispatchTechnicianModal({
  open,
  onOpenChange,
  ids,
  printAfter,
  onPrint,
}: DispatchTechnicianModalProps) {
  const qc = useQueryClient()
  const [tech, setTech] = useState<AutocompleteOption | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tech) throw new Error('no-tech')
      dispatchTechnician(ids, tech.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair-list'] })
      notify.success('Đã điều phối kỹ thuật')
      if (printAfter) onPrint?.(ids)
      onOpenChange(false)
      setTech(null)
    },
  })

  function save() {
    if (!tech) {
      notify.error('Vui lòng chọn kỹ thuật!')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{printAfter ? 'Điều phối in' : 'Đổi kỹ thuật'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Kỹ thuật</Label>
          <ServerAutocomplete
            value={tech}
            onChange={setTech}
            fetchOptions={searchTechnicians}
            placeholder="Chọn kỹ thuật…"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={mutation.isPending} onClick={save}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
