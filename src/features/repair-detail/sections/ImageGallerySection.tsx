/**
 * "Hình" gallery — thumbnail grid; click opens a "Danh sách hình" dialog with
 * an "In hình" action; hover reveals a delete icon guarded by an
 * AlertDialog confirm ("Bạn có muốn xóa không?").
 */
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState, notify } from '@/components/shared'
import { openPrintWindow } from '@/components/print/print-window'
import { PrintLayout } from '@/components/print/print-layout'
import { deleteTicketMedia } from '@/domains/repair/mock-mutations'
import type { RepairTicket, TicketMedia } from '@/domains/repair/types'

function printImage(media: TicketMedia) {
  return openPrintWindow(
    'In hình',
    <PrintLayout title="HÌNH ẢNH PHIẾU SỬA CHỮA">
      <img src={media.url} alt="" style={{ maxWidth: '100%' }} />
    </PrintLayout>,
  )
}

export function ImageGallerySection({ ticket }: { ticket: RepairTicket }) {
  const queryClient = useQueryClient()
  const images = ticket.images ?? []

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => {
      deleteTicketMedia(ticket.id, mediaId)
      return Promise.resolve()
    },
    onSuccess: () => {
      notify.success('Đã xóa hình')
      queryClient.invalidateQueries({ queryKey: ['repair-detail', ticket.id] })
      setPendingDeleteId(null)
      setActiveIndex(null)
    },
  })

  const activeImage = activeIndex != null ? images[activeIndex] : undefined

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Hình</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <div className="flex flex-wrap gap-3">
            {images.map((media, idx) => (
              <div
                key={media.id}
                className="group relative h-24 w-32 overflow-hidden rounded-md border"
              >
                <button
                  type="button"
                  className="h-full w-full"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Xem hình ${idx + 1}`}
                >
                  <img
                    src={media.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"
                  aria-label="Xóa hình"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPendingDeleteId(media.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Zoom / carousel dialog */}
      <Dialog
        open={activeIndex != null}
        onOpenChange={(open) => !open && setActiveIndex(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Danh sách hình</DialogTitle>
          </DialogHeader>
          {activeImage && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={activeImage.url}
                alt=""
                className="max-h-[60vh] w-auto rounded-md object-contain"
              />
              <Button onClick={() => printImage(activeImage)}>In hình</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có muốn xóa không?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDeleteId && deleteMutation.mutate(pendingDeleteId)
              }
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
