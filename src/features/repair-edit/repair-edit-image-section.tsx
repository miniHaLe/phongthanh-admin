/** Existing ticket media on edit; new uploads remain intentionally client-only. */
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared'
import type { TicketMedia } from '@/domains/repair/types'

export function RepairEditImageSection({ images }: { images: TicketMedia[] }) {
  function downloadAll() {
    images.forEach((image, index) => {
      const anchor = document.createElement('a')
      anchor.href = image.url
      anchor.download = `hinh-${index + 1}`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    })
  }

  return (
    <section aria-labelledby="section-edit-images">
      <h2
        id="section-edit-images"
        className="-mx-4 mb-4 bg-background/95 px-4 py-2 text-base font-semibold backdrop-blur sm:sticky sm:top-16 sm:-mx-6 sm:px-6"
      >
        Hình
      </h2>
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={images.length === 0}
          onClick={downloadAll}
        >
          <Download className="mr-2 size-4" />
          Tải tất cả hình
        </Button>
        {images.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <div className="flex flex-wrap gap-3">
            {images.map((media, index) => (
              <a
                key={media.id}
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="block h-24 w-32 overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Mở hình ${index + 1}`}
              >
                {media.kind === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Hình ${index + 1} của phiếu sửa chữa`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-sm">
                    Video {index + 1}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Hình mới chưa được lưu trong luồng mock hiện tại.
        </p>
      </div>
    </section>
  )
}
