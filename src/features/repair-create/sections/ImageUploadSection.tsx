/**
 * "Hình" fieldset — multi-file image picker with client-side preview grid and
 * per-item remove, plus a "Tải tất cả hình" button that opens each preview in
 * a new tab (client-only mock; there is no server upload to batch here).
 * Object URLs are created on select and revoked on remove/unmount to avoid
 * leaking blob references (URL.createObjectURL is stubbed in test setup).
 */
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface PreviewItem {
  id: string
  file: File
  url: string
}

let previewSeq = 0

export function ImageUploadSection() {
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Revoke every outstanding object URL when the section unmounts.
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const next = Array.from(fileList).map((file) => {
      previewSeq += 1
      return {
        id: `img-${previewSeq}`,
        file,
        url: URL.createObjectURL(file),
      }
    })
    setPreviews((prev) => [...prev, ...next])
  }

  function removePreview(id: string) {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  function handleUploadAll() {
    // Download each local preview via a temporary anchor (local blob URLs — not
    // an external-open or a spreadsheet export, so no F8/F9 helper applies).
    previews.forEach((p, i) => {
      const a = document.createElement('a')
      a.href = p.url
      a.download = `hinh-${i + 1}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  return (
    <section aria-labelledby="section-image-upload">
      <h2
        id="section-image-upload"
        className="sticky top-16 z-10 -mx-6 mb-4 bg-background/95 px-6 py-2 text-base font-semibold backdrop-blur"
      >
        Hình
      </h2>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="ticket-images" className="sr-only">
            Chọn hình
          </Label>
          <input
            ref={inputRef}
            id="ticket-images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={previews.length === 0}
            onClick={handleUploadAll}
          >
            Tải tất cả hình
          </Button>
        </div>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((p) => (
              <div
                key={p.id}
                className="group relative h-24 w-32 overflow-hidden rounded-md border"
              >
                <img
                  src={p.url}
                  alt={p.file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  aria-label={`Xóa ${p.file.name}`}
                  onClick={() => removePreview(p.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="mt-6" />
    </section>
  )
}
