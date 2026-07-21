/**
 * Đường dẫn hãng validator: empty is ok, bare hosts get https://, and dangerous
 * schemes (javascript:/data:/vbscript:/file:, protocol-relative, obfuscated) are
 * rejected — the danh mục config and the dialogs share this one validator.
 */
import { describe, expect, it } from 'vitest'
import { normalizeBrandUrl } from './brand-url'

describe('normalizeBrandUrl', () => {
  it('treats blank input as valid + empty', () => {
    expect(normalizeBrandUrl('')).toEqual({ ok: true, value: '' })
    expect(normalizeBrandUrl('   ')).toEqual({ ok: true, value: '' })
  })

  it('prefixes a bare host with https:// and canonicalizes', () => {
    expect(normalizeBrandUrl('daikin.com.vn')).toEqual({
      ok: true,
      value: 'https://daikin.com.vn/',
    })
  })

  it('accepts explicit http/https URLs', () => {
    expect(normalizeBrandUrl('https://www.lg.com/vn').ok).toBe(true)
    expect(normalizeBrandUrl('http://example.com').ok).toBe(true)
  })

  it('rejects a host without a dot', () => {
    expect(normalizeBrandUrl('localhost').ok).toBe(false)
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ])('rejects the dangerous scheme %s', (input) => {
    expect(normalizeBrandUrl(input).ok).toBe(false)
  })

  it('coerces a schemeless protocol-relative host to safe https', () => {
    // "//evil.com" has no scheme, so it gets the https:// default — harmless.
    expect(normalizeBrandUrl('//evil.com')).toEqual({
      ok: true,
      value: 'https://evil.com/',
    })
  })
})
