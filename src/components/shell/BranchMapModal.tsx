/**
 * Global "Bản đồ chi nhánh" modal. Open-state lives in a zustand store exported
 * from this file so any toolbar / command-palette action can trigger it. Left:
 * a "Search Box" filter over the branch list; right: an OpenStreetMap embed
 * centered on the selected branch (static embed, D4 — no Google API).
 */
import { useState } from 'react'
import { create } from 'zustand'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BRANCHES, type BranchId } from '@/mock/seed/branches'
import { cn } from '@/lib/utils'

interface BranchMapStore {
  open: boolean
  openModal: () => void
  close: () => void
}

export const useBranchMapStore = create<BranchMapStore>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  close: () => set({ open: false }),
}))

/** Mock coordinates per branch (reference tooltip format: lat, lng). */
const BRANCH_COORDS: Record<BranchId, { lat: number; lng: number }> = {
  'dak-lak': { lat: 12.6797, lng: 108.0378 }, // Buôn Ma Thuột
  'dak-nong': { lat: 12.0045, lng: 107.6877 }, // Gia Nghĩa
  'ctv-tuyen-huyen': { lat: 12.3, lng: 107.9 }, // tuyến huyện (approx)
}

function osmEmbedUrl(lat: number, lng: number): string {
  const d = 0.05
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&marker=${encodeURIComponent(`${lat},${lng}`)}`
}

export function BranchMapModal() {
  const open = useBranchMapStore((s) => s.open)
  const close = useBranchMapStore((s) => s.close)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<BranchId>('dak-lak')

  const filtered = BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase()),
  )
  const coords = BRANCH_COORDS[selected]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bản đồ chi nhánh</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <Input
              placeholder="Search Box"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm chi nhánh"
            />
            <ul className="space-y-1">
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent',
                      selected === b.id && 'bg-accent font-medium',
                    )}
                    onClick={() => setSelected(b.id)}
                  >
                    <div>{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {BRANCH_COORDS[b.id].lat}, {BRANCH_COORDS[b.id].lng}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <iframe
            title="Bản đồ chi nhánh"
            className="h-[360px] w-full rounded-md border"
            src={osmEmbedUrl(coords.lat, coords.lng)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
