/** Spec (F7): print window renders element markup + escapes an untrusted title. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { openPrintWindow } from './print-window'

function makeFakeWindow() {
  let html = ''
  const doc = {
    _title: '',
    open: vi.fn(),
    close: vi.fn(),
    write: vi.fn((s: string) => {
      html += s
    }),
    get title() {
      return this._title
    },
    set title(v: string) {
      this._title = v
    },
  }
  const win = {
    document: doc,
    focus: vi.fn(),
    print: vi.fn(),
    setTimeout: vi.fn(),
    getHtml: () => html,
  }
  return win
}

describe('openPrintWindow', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the element markup and sets the document title via the DOM property', async () => {
    const fake = makeFakeWindow()
    vi.spyOn(window, 'open').mockReturnValue(fake as unknown as Window)

    await openPrintWindow('Phiếu test', <div>NỘI DUNG</div>)

    expect(fake.getHtml()).toContain('NỘI DUNG')
    expect(fake.getHtml()).toContain('@media print')
    expect(fake.document.title).toBe('Phiếu test')
  })

  it('does not inject an untrusted title as a live node (title set via textContent)', async () => {
    const fake = makeFakeWindow()
    vi.spyOn(window, 'open').mockReturnValue(fake as unknown as Window)

    const evil = '<img src=x onerror=alert(1)>'
    await openPrintWindow(evil, <div>ok</div>)

    // The raw markup must NOT appear in the written HTML — it goes through
    // doc.title (a DOM string property), never the document.write string.
    expect(fake.getHtml()).not.toContain('<img src=x onerror=alert(1)>')
    expect(fake.document.title).toBe(evil)
  })

  it('returns null when the browser blocks the popup', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    const result = await openPrintWindow('x', <div />)
    expect(result).toBeNull()
  })
})
