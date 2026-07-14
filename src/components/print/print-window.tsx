/**
 * Print-window helper (F7). Opens a printable window from a React element.
 * The element is rendered via `renderToStaticMarkup` (React escapes all
 * interpolated values), and the document title is set via `doc.title` /
 * `textContent` — NEVER by concatenating an untrusted string into the
 * document.write HTML. So a hostile mock free-text `title` cannot inject a
 * live node into the doc chrome.
 *
 * `react-dom/server` is dynamically imported so it stays out of the initial bundle.
 */
import type { ReactElement } from 'react'
import { notify } from '@/components/shared/toast'

const PRINT_CSS = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #000; background: #fff; margin: 0; padding: 16px;
    font-size: 13px; line-height: 1.4;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
  thead th { background: #f0f0f0; }
  h1, h2, h3 { margin: 0 0 8px; }
  .print-signatures { display: flex; justify-content: space-around; margin-top: 40px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
`

/**
 * Open a new window containing the rendered `element` and trigger print.
 * Returns the opened window (or null if the browser blocked it).
 */
export async function openPrintWindow(
  title: string,
  element: ReactElement,
): Promise<Window | null> {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const bodyHtml = renderToStaticMarkup(element)

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    notify.error(
      'Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép cửa sổ bật lên và thử lại.',
    )
    return null
  }

  // Keep a usable document handle in Chromium while isolating the new window.
  win.opener = null

  const doc = win.document
  // Base skeleton WITHOUT the untrusted title — write only trusted markup +
  // the React-escaped body.
  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head><body>${bodyHtml}</body></html>`,
  )
  doc.close()

  // Title is set through the DOM property, never concatenated into HTML.
  doc.title = title

  // Give the new document a tick to lay out before printing.
  win.setTimeout(() => {
    win.focus()
    win.print()
  }, 200)

  return win
}
