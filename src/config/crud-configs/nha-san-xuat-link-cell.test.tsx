/**
 * The Đường dẫn hãng cell renders a clickable link only for safe http(s) URLs;
 * a dangerous scheme (e.g. a persisted javascript: value) renders as inert text
 * with no href, and blanks render an em dash.
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderBrandLinkCell } from './nha-san-xuat-link-cell'

describe('renderBrandLinkCell', () => {
  it('renders an em dash for blank values', () => {
    const { container } = render(<>{renderBrandLinkCell(undefined)}</>)
    expect(container).toHaveTextContent('—')
    expect(container.querySelector('a')).toBeNull()
  })

  it('renders a clickable link for a safe https URL', () => {
    render(<>{renderBrandLinkCell('https://www.daikin.com.vn/')}</>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.daikin.com.vn/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('renders inert text (no anchor) for a javascript: scheme', () => {
    const { container } = render(
      <>{renderBrandLinkCell('javascript:alert(document.cookie)')}</>,
    )
    expect(container.querySelector('a')).toBeNull()
    expect(container).toHaveTextContent('javascript:alert(document.cookie)')
  })
})
