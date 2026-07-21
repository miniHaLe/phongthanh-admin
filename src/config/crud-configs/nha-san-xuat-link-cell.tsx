/** Clickable "Đường dẫn hãng" cell — opens the brand site in a new tab.
 * Guards the href with the sanctioned safe-URL check so a persisted
 * javascript:/data: value (e.g. from a real backend or legacy import) renders
 * as inert text, never an executable link. */
import type { ReactNode } from 'react'
import { isSafeExternalUrl } from '@/lib/open-external'

export function renderBrandLinkCell(value: string | undefined): ReactNode {
  const url = value?.trim()
  if (!url) return '—'
  if (!isSafeExternalUrl(url)) return <span title={url}>{url}</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      onClick={(event) => event.stopPropagation()}
      title={url}
    >
      {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
    </a>
  )
}
