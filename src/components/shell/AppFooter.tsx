/**
 * App footer — version (right) + copyright with external developer link (left).
 * External link routed through the F9 openExternal helper.
 */
import { openExternal } from '@/lib/open-external'

export function AppFooter() {
  return (
    <footer className="flex flex-col gap-1 border-t bg-card px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span className="leading-5">
        Copyright © 2026 Phát triển bởi{' '}
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-primary hover:underline md:min-h-0"
          onClick={() => openExternal('https://phanmemquocbao.com')}
        >
          Phần Mềm Quốc Bảo
        </button>
      </span>
      <span className="leading-5">Version 1.0.0</span>
    </footer>
  )
}
