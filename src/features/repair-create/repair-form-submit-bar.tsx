import { Button } from '@/components/ui/button'

export type RepairSubmitMode = 'save' | 'saveNew' | 'saveClosed'

export function RepairFormSubmitBar({
  isPending,
  onSubmit,
}: {
  isPending: boolean
  onSubmit: (mode: RepairSubmitMode) => void
}) {
  return (
    <div className="sticky bottom-0 z-20 grid grid-cols-1 gap-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:flex sm:items-center sm:justify-end sm:gap-3 sm:px-6">
      <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
        Nhấn{' '}
        <kbd className="rounded border px-1 font-mono text-xs">Ctrl+Enter</kbd>{' '}
        để lưu nhanh
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => onSubmit('save')}
      >
        Lưu
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => onSubmit('saveNew')}
      >
        Lưu &amp; Thêm mới
      </Button>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => onSubmit('saveClosed')}
      >
        Lưu &amp; Đóng
      </Button>
    </div>
  )
}
