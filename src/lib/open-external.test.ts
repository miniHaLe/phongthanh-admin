/** Spec (F9): external-link helper allows only http/https, encodes builders. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  openExternal,
  isSafeExternalUrl,
  buildMapUrl,
  buildGeoUrl,
} from './open-external'

describe('buildMapUrl / buildGeoUrl', () => {
  it('percent-encodes the address into the query', () => {
    const url = buildMapUrl('12 Lê Lợi, Q1 & <b>')
    expect(url).toContain(encodeURIComponent('12 Lê Lợi, Q1 & <b>'))
    expect(url.startsWith('https://')).toBe(true)
  })

  it('buildGeoUrl yields an https URL with the coordinates', () => {
    const url = buildGeoUrl(10.77, 106.7)
    expect(url.startsWith('https://')).toBe(true)
    expect(url).toContain(encodeURIComponent('10.77,106.7'))
  })
})

describe('isSafeExternalUrl', () => {
  it('allows http/https, case-insensitive', () => {
    expect(isSafeExternalUrl('https://ok.com')).toBe(true)
    expect(isSafeExternalUrl('http://ok.com')).toBe(true)
    expect(isSafeExternalUrl('HTTPS://ok.com')).toBe(true)
  })

  it('rejects dangerous / obfuscated schemes', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('data:text/html,x')).toBe(false)
    expect(isSafeExternalUrl('//evil.com')).toBe(false)
    expect(isSafeExternalUrl('  javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('java\nscript:alert(1)')).toBe(false)
  })
})

describe('openExternal', () => {
  afterEach(() => vi.restoreAllMocks())

  it('opens http/https with noopener,noreferrer', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    openExternal('https://maps.example.com/?q=1')
    expect(open).toHaveBeenCalledWith(
      'https://maps.example.com/?q=1',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('no-ops (does not open) on a dangerous scheme', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    openExternal('javascript:alert(1)')
    openExternal('//evil.com')
    expect(open).not.toHaveBeenCalled()
  })
})
