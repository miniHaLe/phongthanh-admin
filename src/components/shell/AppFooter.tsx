/**
 * App footer — version (right) + copyright with external developer link (left).
 * External link routed through the F9 openExternal helper.
 */
import { openExternal } from '@/lib/open-external'

export function AppFooter() {
  return (
    <footer className="flex items-center justify-between border-t bg-card px-4 py-2 text-xs text-muted-foreground">
      <span>
        Copyright © 2026 Phát triển bởi{' '}
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => openExternal('https://phanmemquocbao.com')}
        >
          Phần Mềm Quốc Bảo
        </button>
      </span>
      <span>Version 1.0.0</span>
    </footer>
  )
}
