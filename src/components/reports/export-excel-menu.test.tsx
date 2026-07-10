/** Spec (C3): the live CSV export path neutralizes formula-injection. */
import { describe, it, expect } from 'vitest'
import { buildReportCsv } from './export-excel-menu'

describe('report CSV export (C3 hardening)', () => {
  it("prefixes a formula-leading title with ' so it can't inject", () => {
    const csv = buildReportCsv('=HYPERLINK("http://x")')
    expect(csv).toContain(`"'=HYPERLINK`)
    expect(csv).not.toContain('"=HYPERLINK')
  })

  it('leaves a normal title untouched (aside from CSV quoting)', () => {
    const csv = buildReportCsv('Báo cáo doanh thu')
    expect(csv).toContain('"Báo cáo doanh thu"')
  })
})
